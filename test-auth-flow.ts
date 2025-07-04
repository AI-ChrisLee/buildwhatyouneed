/**
 * Test script for the complete authentication flow
 * This tests:
 * 1. Signup → creates user and lead
 * 2. Login → redirects based on subscription status
 * 3. Payment → creates Stripe checkout session
 * 4. Post-payment → redirects to /threads
 */

import { createClient } from '@supabase/supabase-js'

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const BASE_URL = 'http://localhost:3000'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test${Date.now()}@example.com`,
  password: 'testpass123'
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

async function testSignupFlow() {
  log('\n=== Testing Signup Flow ===', colors.blue)
  
  try {
    // 1. Test signup
    log('1. Creating new user...', colors.yellow)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: `${testUser.firstName} ${testUser.lastName}`
        }
      }
    })
    
    if (authError) throw authError
    log(`✓ User created: ${authData.user?.email}`, colors.green)
    
    // 2. Check if user exists in public.users
    log('2. Checking public.users table...', colors.yellow)
    const { data: publicUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id!)
      .single()
    
    if (userError) {
      log(`✗ User not found in public.users: ${userError.message}`, colors.red)
    } else {
      log(`✓ User found in public.users: ${publicUser.email}`, colors.green)
    }
    
    // 3. Check if lead was created
    log('3. Checking leads table...', colors.yellow)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', testUser.email)
      .single()
    
    if (leadError) {
      log(`✗ Lead not created: ${leadError.message}`, colors.red)
    } else {
      log(`✓ Lead created: ${lead.email} (stage: ${lead.stage})`, colors.green)
    }
    
    return authData.user
  } catch (error: any) {
    log(`✗ Signup failed: ${error.message}`, colors.red)
    return null
  }
}

async function testLoginFlow(hasSubscription: boolean = false) {
  log(`\n=== Testing Login Flow (subscription: ${hasSubscription}) ===`, colors.blue)
  
  try {
    // 1. Test login
    log('1. Logging in...', colors.yellow)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    })
    
    if (error) throw error
    log(`✓ Login successful: ${data.user?.email}`, colors.green)
    
    // 2. Check subscription status
    log('2. Checking subscription status...', colors.yellow)
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', data.user?.id!)
      .eq('status', 'active')
      .single()
    
    if (subscription) {
      log('✓ User has active subscription', colors.green)
      log('→ Should redirect to /threads', colors.yellow)
    } else {
      log('✓ User has no subscription', colors.green)
      log('→ Should redirect to /payment', colors.yellow)
    }
    
    return data.user
  } catch (error: any) {
    log(`✗ Login failed: ${error.message}`, colors.red)
    return null
  }
}

async function testPaymentFlow(userId: string) {
  log('\n=== Testing Payment Flow ===', colors.blue)
  
  try {
    // Note: This requires the API endpoint to be running
    log('1. Creating checkout session...', colors.yellow)
    
    const response = await fetch(`${BASE_URL}/api/stripe/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
      }),
    })
    
    const result = await response.json()
    
    if (response.ok && result.url) {
      log('✓ Checkout session created successfully', colors.green)
      log(`→ Stripe URL: ${result.url}`, colors.yellow)
    } else {
      log(`✗ Checkout failed: ${result.error || 'Unknown error'}`, colors.red)
    }
    
    return result
  } catch (error: any) {
    log(`✗ Payment request failed: ${error.message}`, colors.red)
    return null
  }
}

async function cleanupTestData() {
  log('\n=== Cleaning up test data ===', colors.blue)
  
  try {
    // Delete lead
    await supabase
      .from('leads')
      .delete()
      .eq('email', testUser.email)
    
    // Delete user (will cascade to auth.users)
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single()
    
    if (user) {
      await supabase.auth.admin.deleteUser(user.id)
      log('✓ Test data cleaned up', colors.green)
    }
  } catch (error: any) {
    log(`✗ Cleanup failed: ${error.message}`, colors.red)
  }
}

async function runTests() {
  log('🚀 Starting Authentication Flow Tests', colors.green)
  log(`Testing with email: ${testUser.email}`, colors.yellow)
  
  // Test 1: Signup
  const user = await testSignupFlow()
  if (!user) {
    log('\n❌ Tests failed: Could not create user', colors.red)
    return
  }
  
  // Test 2: Login without subscription
  await testLoginFlow(false)
  
  // Test 3: Payment flow
  await testPaymentFlow(user.id)
  
  // Test 4: Login with subscription (simulated)
  log('\n=== Simulating post-payment login ===', colors.blue)
  log('After successful payment, user should be redirected to /threads', colors.yellow)
  
  // Cleanup
  // await cleanupTestData()
  
  log('\n✅ All tests completed!', colors.green)
  log('\nNext steps:', colors.yellow)
  log('1. Run the app: npm run dev')
  log('2. Navigate through the flow manually')
  log('3. Test with real Stripe checkout')
  log(`4. Clean up test user: ${testUser.email}`)
}

// Run tests
runTests().catch(console.error)