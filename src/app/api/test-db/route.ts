import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // Test 1: Check if we can query users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    // Test 2: Check if we can query stripe_customers
    const { data: customers, error: customersError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .limit(1)
    
    // Test 3: Check if we can query stripe_subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .limit(1)
    
    // Test 4: Try to insert a test record (we'll delete it immediately)
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const testSubId = 'test_sub_' + Date.now()
    
    const { data: insertData, error: insertError } = await supabase
      .from('stripe_subscriptions')
      .insert({
        id: testSubId,
        user_id: testUserId,
        status: 'test',
        current_period_end: null
      })
      .select()
    
    // Clean up test record if it was created
    if (!insertError) {
      await supabase
        .from('stripe_subscriptions')
        .delete()
        .eq('id', testSubId)
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        users: { success: !usersError, error: usersError?.message },
        stripe_customers: { success: !customersError, error: customersError?.message },
        stripe_subscriptions: { success: !subscriptionsError, error: subscriptionsError?.message },
        insert_test: { success: !insertError, error: insertError?.message, data: insertData }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}