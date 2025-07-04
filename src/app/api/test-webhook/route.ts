import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Log all environment variables (redacted)
    console.log('=== Environment Check ===')
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set')
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '✗ Not set')
    console.log('RESEND_REPLY_TO_EMAIL:', process.env.RESEND_REPLY_TO_EMAIL || '✗ Not set')
    console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✓ Set' : '✗ Not set')
    
    // Test webhook by calling it directly
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/stripe/webhook`
    console.log('Webhook URL:', webhookUrl)
    
    // Create a test payment intent succeeded event
    const testEvent = {
      id: 'evt_test_' + Date.now(),
      object: 'event',
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'pi_test_' + Date.now(),
          object: 'payment_intent',
          amount: 9700, // $97.00
          currency: 'usd',
          metadata: {
            userId: request.headers.get('x-user-id') || '8664a41a-ba6c-4cb1-8522-32a7d53dc90e' // Your user ID
          }
        }
      }
    }
    
    // Call the webhook endpoint
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // This will fail signature validation but we can see logs
      },
      body: JSON.stringify(testEvent)
    })
    
    const result = await response.text()
    
    return NextResponse.json({
      message: 'Test webhook triggered',
      webhookResponse: {
        status: response.status,
        statusText: response.statusText,
        body: result
      },
      environment: {
        resendApiKey: process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set',
        resendFromEmail: process.env.RESEND_FROM_EMAIL || '✗ Not set',
        resendReplyToEmail: process.env.RESEND_REPLY_TO_EMAIL || '✗ Not set',
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '✓ Set' : '✗ Not set'
      }
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json({ 
      error: 'Failed to trigger test webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger a test webhook',
    environment: {
      resendApiKey: process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set',
      resendFromEmail: process.env.RESEND_FROM_EMAIL || '✗ Not set',
      resendReplyToEmail: process.env.RESEND_REPLY_TO_EMAIL || '✗ Not set',
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '✓ Set' : '✗ Not set'
    }
  })
}