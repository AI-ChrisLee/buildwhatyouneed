import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Try to get user ID from cookie if available
    const cookieStore = cookies()
    let userId = null
    let userEmail = email
    
    // Try to parse auth cookie manually
    try {
      const authCookie = cookieStore.get('sb-phrnsjbbeznsmnlslywo-auth-token')
      if (authCookie?.value) {
        // Try to parse JWT token structure
        const parts = authCookie.value.split('.')
        if (parts.length === 3) {
          // Standard JWT structure
          const decoded = JSON.parse(atob(parts[1]))
          userId = decoded.sub
          userEmail = decoded.email || email
        } else {
          // Might be base64 encoded JSON
          try {
            const cleanValue = authCookie.value.replace('base64-', '')
            const decodedStr = atob(cleanValue)
            const parsed = JSON.parse(decodedStr)
            // Look for user info in the parsed object
            if (parsed.access_token) {
              const tokenParts = parsed.access_token.split('.')
              if (tokenParts.length === 3) {
                const tokenDecoded = JSON.parse(atob(tokenParts[1]))
                userId = tokenDecoded.sub
                userEmail = tokenDecoded.email || email
              }
            }
          } catch (e) {
            console.log('Could not parse base64 encoded cookie')
          }
        }
      }
    } catch (e) {
      console.log('Could not parse auth cookie, proceeding without user ID')
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/about?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment`,
      ...(userId && { client_reference_id: userId }),
      ...(userEmail && { customer_email: userEmail }),
      metadata: {
        ...(userId && { userId }),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}