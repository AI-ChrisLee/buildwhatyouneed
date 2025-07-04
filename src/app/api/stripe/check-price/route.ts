import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET() {
  try {
    const priceId = process.env.STRIPE_PRICE_ID!
    
    // Try to retrieve the price
    const price = await stripe.prices.retrieve(priceId)
    
    return NextResponse.json({
      success: true,
      priceId: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      recurring: price.recurring,
      productId: price.product,
      active: price.active
    })
  } catch (error: any) {
    console.error("Price check error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        priceId: process.env.STRIPE_PRICE_ID 
      },
      { status: 500 }
    )
  }
}