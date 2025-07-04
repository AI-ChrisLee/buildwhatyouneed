import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { UpgradeConfirmationEmail, UpgradeConfirmationEmailText } from '@/lib/email-templates/upgrade-confirmation'

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.error('Missing Stripe environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
const resend = new Resend(process.env.RESEND_API_KEY)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: Request) {
  console.log('=== Stripe Webhook Called ===')
  console.log('Time:', new Date().toISOString())
  
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

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

  // Use service role client for webhook operations
  const supabase = await createClient()

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
          console.log(`Creating stripe_customers record for user ${userId}`)
          const { data: customerData, error: customerError } = await supabase
            .from('stripe_customers')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string
            })
            .select()
          
          if (customerError) {
            console.error('Failed to create stripe customer:', {
              error: customerError,
              details: customerError.details,
              hint: customerError.hint,
              message: customerError.message
            })
          } else {
            console.log('Stripe customer created successfully:', customerData)
          }

          // Get the subscription
          const subscriptionId = session.subscription as string
          
          // Create subscription record with minimal data
          console.log(`Creating stripe_subscriptions record for subscription ${subscriptionId}`)
          const { data: subData, error: subError } = await supabase
            .from('stripe_subscriptions')
            .upsert({
              id: subscriptionId,
              user_id: userId,
              status: 'active', // Checkout completed means active
              current_period_end: null // Will be updated by subscription.updated event
            })
            .select()
          
          if (subError) {
            console.error('Failed to create subscription:', {
              error: subError,
              details: subError.details,
              hint: subError.hint,
              message: subError.message
            })
          } else {
            console.log('Subscription created successfully:', subData)
          }

          // Update user's membership tier to paid
          console.log(`Updating membership tier to paid for user ${userId}`)
          const { error: tierError } = await supabase
            .from('users')
            .update({ 
              membership_tier: 'paid',
              tier_updated_at: new Date().toISOString()
            })
            .eq('id', userId)
          
          if (tierError) {
            console.error('Failed to update membership tier:', tierError)
          } else {
            console.log('Membership tier updated to paid successfully')
          }

          // Send upgrade confirmation email
          try {
            // Get user details
            const { data: userData } = await supabase
              .from('users')
              .select('email, name')
              .eq('id', userId)
              .single()
            
            if (userData?.email) {
              // Get subscription details
              const subscription = await stripe.subscriptions.retrieve(subscriptionId)
              const amount = subscription.items.data[0]?.price.unit_amount || 0
              const currency = subscription.items.data[0]?.price.currency || 'usd'
              const currentPeriodEnd = (subscription as any).current_period_end 
                ? new Date((subscription as any).current_period_end * 1000).toISOString() 
                : undefined
              
              const { error: emailError } = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL!,
                to: userData.email,
                subject: 'Welcome to AI Chris Lee Premium!',
                react: UpgradeConfirmationEmail({
                  userName: userData.name,
                  userEmail: userData.email,
                  subscriptionId: subscriptionId,
                  amountPaid: amount,
                  currency: currency,
                  nextBillingDate: currentPeriodEnd
                }),
                text: UpgradeConfirmationEmailText({
                  userName: userData.name,
                  userEmail: userData.email,
                  subscriptionId: subscriptionId,
                  amountPaid: amount,
                  currency: currency,
                  nextBillingDate: currentPeriodEnd
                }),
                replyTo: process.env.RESEND_REPLY_TO_EMAIL
              })
              
              if (emailError) {
                console.error('Failed to send upgrade confirmation email:', emailError)
              } else {
                console.log('Upgrade confirmation email sent successfully')
              }
            }
          } catch (emailError) {
            console.error('Error sending upgrade email:', emailError)
          }

          console.log(`Subscription created for user ${userId}`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Get user ID from metadata
        const userId = paymentIntent.metadata?.userId
        if (userId) {
          // Update user's membership tier to paid
          console.log(`Payment succeeded, updating membership tier to paid for user ${userId}`)
          const { error: tierError } = await supabase
            .from('users')
            .update({ 
              membership_tier: 'paid',
              tier_updated_at: new Date().toISOString()
            })
            .eq('id', userId)
          
          if (tierError) {
            console.error('Failed to update membership tier on payment success:', tierError)
          } else {
            console.log('Membership tier updated to paid on payment success')
          }
          
          // Send upgrade confirmation email
          try {
            // Get user details
            const { data: userData } = await supabase
              .from('users')
              .select('email, name')
              .eq('id', userId)
              .single()
            
            if (userData?.email) {
              // Get subscription from database since we're using mock subscriptions
              const { data: subscriptionData } = await supabase
                .from('stripe_subscriptions')
                .select('id, current_period_end')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
              
              const amount = paymentIntent.amount || 0
              const currency = paymentIntent.currency || 'usd'
              const subscriptionId = subscriptionData?.id || `sub_${Date.now()}_${userId.substring(0, 8)}`
              const nextBillingDate = subscriptionData?.current_period_end || 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              
              const { error: emailError } = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL!,
                to: userData.email,
                subject: 'Welcome to AI Chris Lee Premium!',
                react: UpgradeConfirmationEmail({
                  userName: userData.name,
                  userEmail: userData.email,
                  subscriptionId: subscriptionId,
                  amountPaid: amount,
                  currency: currency,
                  nextBillingDate: nextBillingDate
                }),
                text: UpgradeConfirmationEmailText({
                  userName: userData.name,
                  userEmail: userData.email,
                  subscriptionId: subscriptionId,
                  amountPaid: amount,
                  currency: currency,
                  nextBillingDate: nextBillingDate
                }),
                replyTo: process.env.RESEND_REPLY_TO_EMAIL
              })
              
              if (emailError) {
                console.error('Failed to send upgrade confirmation email:', emailError)
              } else {
                console.log('Upgrade confirmation email sent successfully')
              }
            }
          } catch (emailError) {
            console.error('Error sending upgrade email:', emailError)
          }
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
              console.error('Failed to create subscription from webhook:', {
                error: createError,
                details: createError.details,
                hint: createError.hint,
                message: createError.message
              })
            } else {
              console.log('Subscription created successfully from customer.subscription.created event')
              
              // Update membership tier if subscription is active
              if (subscription.status === 'active' || subscription.status === 'trialing') {
                const { error: tierError } = await supabase
                  .from('users')
                  .update({ 
                    membership_tier: 'paid',
                    tier_updated_at: new Date().toISOString()
                  })
                  .eq('id', customer.user_id)
                
                if (tierError) {
                  console.error('Failed to update membership tier:', tierError)
                } else {
                  console.log('Membership tier updated to paid')
                }
              }
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
            console.error('Failed to update subscription:', {
              error: updateError,
              details: updateError.details,
              hint: updateError.hint,
              message: updateError.message
            })
          } else {
            console.log(`Subscription ${subscription.id} updated successfully`)
            
            // Update membership tier based on subscription status
            const { data: subData } = await supabase
              .from('stripe_subscriptions')
              .select('user_id')
              .eq('id', subscription.id)
              .single()
            
            if (subData) {
              const newTier = (subscription.status === 'active' || subscription.status === 'trialing') ? 'paid' : 'free'
              
              const { error: tierError } = await supabase
                .from('users')
                .update({ 
                  membership_tier: newTier,
                  tier_updated_at: new Date().toISOString()
                })
                .eq('id', subData.user_id)
              
              if (tierError) {
                console.error('Failed to update membership tier:', tierError)
              } else {
                console.log(`Membership tier updated to ${newTier}`)
              }
            }
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
          console.error('Failed to cancel subscription:', {
            error: cancelError,
            details: cancelError.details,
            hint: cancelError.hint,
            message: cancelError.message
          })
        } else {
          console.log(`Subscription ${subscription.id} cancelled successfully`)
          
          // Update user's membership tier to free
          const { data: subData } = await supabase
            .from('stripe_subscriptions')
            .select('user_id')
            .eq('id', subscription.id)
            .single()
          
          if (subData) {
            const { error: tierError } = await supabase
              .from('users')
              .update({ 
                membership_tier: 'free',
                tier_updated_at: new Date().toISOString()
              })
              .eq('id', subData.user_id)
            
            if (tierError) {
              console.error('Failed to update membership tier:', tierError)
            } else {
              console.log('Membership tier reverted to free')
            }
          }
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