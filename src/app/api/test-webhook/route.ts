import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== Testing Webhook Database Access ===')
  
  try {
    // Test 1: Check if service role key exists
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY not found in environment' 
      }, { status: 500 })
    }
    
    // Test 2: Create service client
    const serviceClient = createServiceClient()
    
    // Test 3: Get current user with regular client
    const regularClient = createClient()
    const { data: { user } } = await regularClient.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No authenticated user. Please login first.' 
      }, { status: 401 })
    }
    
    // Test 4: Try to read from stripe_subscriptions with service client
    console.log('Testing read from stripe_subscriptions...')
    const { data: subscriptions, error: readError } = await serviceClient
      .from('stripe_subscriptions')
      .select('*')
      .eq('user_id', user.id)
    
    if (readError) {
      console.error('Read error:', readError)
      return NextResponse.json({ 
        error: 'Failed to read subscriptions',
        details: readError 
      }, { status: 500 })
    }
    
    // Test 5: Try to insert a test subscription
    const testSubscriptionId = `test_sub_${Date.now()}`
    console.log('Testing insert into stripe_subscriptions...')
    
    const { data: insertData, error: insertError } = await serviceClient
      .from('stripe_subscriptions')
      .insert({
        id: testSubscriptionId,
        user_id: user.id,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ 
        error: 'Failed to insert test subscription',
        details: insertError,
        hint: insertError.hint,
        message: insertError.message
      }, { status: 500 })
    }
    
    // Test 6: Clean up test subscription
    console.log('Cleaning up test subscription...')
    const { error: deleteError } = await serviceClient
      .from('stripe_subscriptions')
      .delete()
      .eq('id', testSubscriptionId)
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      results: {
        serviceRoleKeyExists: true,
        canReadSubscriptions: true,
        existingSubscriptions: subscriptions?.length || 0,
        canInsertSubscription: true,
        insertedData: insertData,
        cleanedUp: !deleteError
      }
    })
    
  } catch (error: any) {
    console.error('Test webhook error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}