import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { UpgradeConfirmationEmail, UpgradeConfirmationEmailText } from '@/lib/email-templates/upgrade-confirmation'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  try {
    // Get current user for testing
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', user.id)
      .single()
    
    const testEmail = userData?.email || user.email
    const testName = userData?.name
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: testEmail!,
      subject: '[TEST] Welcome to AI Chris Lee Premium!',
      react: UpgradeConfirmationEmail({
        userName: testName,
        userEmail: testEmail!,
        subscriptionId: 'sub_test_123456',
        amountPaid: 4999, // $49.99
        currency: 'usd',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }),
      text: UpgradeConfirmationEmailText({
        userName: testName,
        userEmail: testEmail!,
        subscriptionId: 'sub_test_123456',
        amountPaid: 4999,
        currency: 'usd',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }),
      replyTo: process.env.RESEND_REPLY_TO_EMAIL
    })
    
    if (error) {
      console.error('Email send error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      sentTo: testEmail 
    })
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}