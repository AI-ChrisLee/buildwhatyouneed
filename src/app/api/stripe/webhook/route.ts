import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.error('Missing Stripe environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: Request) {
  console.log('=== Stripe Webhook Called ===')
  console.log('Time:', new Date().toISOString())
  
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('No Stripe signature header found')
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createClient()

  console.log(`Received webhook event: ${event.type}`)

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const userId = session.client_reference_id
          if (!userId) {
            console.error('No user ID in session')
            break
          }

          // Create Stripe customer record
          const { error: customerError } = await supabase
            .from('stripe_customers')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string
            })
            .select()
          
          if (customerError) {
            console.error('Failed to create stripe customer:', customerError)
          }

          // Get the subscription
          const subscriptionId = session.subscription as string
          
          // Create subscription record with minimal data
          const { error: subError } = await supabase
            .from('stripe_subscriptions')
            .upsert({
              id: subscriptionId,
              user_id: userId,
              status: 'active', // Checkout completed means active
              current_period_end: null // Will be updated by subscription.updated event
            })
            .select()
          
          if (subError) {
            console.error('Failed to create subscription:', subError)
          }

          console.log(`Subscription created for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // For subscription.created, we need to find the user ID
        if (event.type === 'customer.subscription.created') {
          // Get user ID from customer
          const { data: customer } = await supabase
            .from('stripe_customers')
            .select('user_id')
            .eq('stripe_customer_id', subscription.customer as string)
            .maybeSingle()
          
          if (customer) {
            // Create the subscription record
            const { error: createError } = await supabase
              .from('stripe_subscriptions')
              .upsert({
                id: subscription.id,
                user_id: customer.user_id,
                status: subscription.status,
                current_period_end: 'current_period_end' in subscription && subscription.current_period_end
                  ? new Date((subscription as any).current_period_end * 1000).toISOString()
                  : null
              })
              .select()
            
            if (createError) {
              console.error('Failed to create subscription from webhook:', createError)
            }
            console.log(`Subscription ${subscription.id} created with status ${subscription.status}`)
          }
        } else {
          // Update existing subscription
          const updateData: any = {
            status: subscription.status
          }
          
          // Check if subscription has current_period_end
          if ('current_period_end' in subscription && subscription.current_period_end) {
            updateData.current_period_end = new Date((subscription as any).current_period_end * 1000).toISOString()
          }
          
          const { error: updateError } = await supabase
            .from('stripe_subscriptions')
            .update(updateData)
            .eq('id', subscription.id)
          
          if (updateError) {
            console.error('Failed to update subscription:', updateError)
          }

          console.log(`Subscription ${subscription.id} updated to ${subscription.status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status to canceled
        const { error: cancelError } = await supabase
          .from('stripe_subscriptions')
          .update({
            status: 'canceled'
          })
          .eq('id', subscription.id)
        
        if (cancelError) {
          console.error('Failed to cancel subscription:', cancelError)
        }

        console.log(`Subscription ${subscription.id} canceled`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    console.log('=== Webhook processing complete ===')
  return NextResponse.json({ received: true, event: event.type })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}