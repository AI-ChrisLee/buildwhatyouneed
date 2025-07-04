import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { UpgradeConfirmationEmail, UpgradeConfirmationEmailText } from '@/lib/email-templates/upgrade-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('email, name, is_admin')
      .eq('id', user.id)
      .single()
    
    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }
    
    // Get request body
    const body = await request.json()
    const targetEmail = body.email || userData.email
    const targetName = body.name || userData.name
    
    // Send the confirmation email
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: targetEmail,
      subject: 'Welcome to AI Chris Lee Premium!',
      react: UpgradeConfirmationEmail({
        userName: targetName,
        userEmail: targetEmail,
        subscriptionId: `sub_manual_${Date.now()}`,
        amountPaid: 9700, // $97.00
        currency: 'usd',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }),
      text: UpgradeConfirmationEmailText({
        userName: targetName,
        userEmail: targetEmail,
        subscriptionId: `sub_manual_${Date.now()}`,
        amountPaid: 9700,
        currency: 'usd',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }),
      replyTo: process.env.RESEND_REPLY_TO_EMAIL
    })
    
    if (error) {
      console.error('Failed to send confirmation email:', error)
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: error
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      messageId: data?.id,
      sentTo: targetEmail,
      environment: {
        fromEmail: process.env.RESEND_FROM_EMAIL,
        replyToEmail: process.env.RESEND_REPLY_TO_EMAIL
      }
    })
  } catch (error) {
    console.error('Send confirmation error:', error)
    return NextResponse.json({ 
      error: 'Failed to send confirmation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}