// Test script to verify Supabase database setup
// Run with: node scripts/test-db-setup.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure you have created .env.local with:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testDatabaseSetup() {
  console.log('🧪 Testing Supabase Database Setup...\n')

  try {
    // Test 1: Check tables exist
    console.log('1️⃣ Checking tables...')
    const tables = ['users', 'threads', 'comments', 'courses', 'lessons', 'stripe_customers', 'stripe_subscriptions']
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.error(`   ❌ Table '${table}' - Error: ${error.message}`)
      } else {
        console.log(`   ✅ Table '${table}' exists`)
      }
    }

    // Test 2: Check data counts
    console.log('\n2️⃣ Checking seeded data...')
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    console.log(`   👤 Users: ${userCount || 0}`)

    const { count: threadCount } = await supabase
      .from('threads')
      .select('*', { count: 'exact', head: true })
    console.log(`   💬 Threads: ${threadCount || 0}`)

    const { count: courseCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
    console.log(`   📚 Courses: ${courseCount || 0}`)

    const { count: subCount } = await supabase
      .from('stripe_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    console.log(`   💳 Active Subscriptions: ${subCount || 0}`)

    // Test 3: Check admin user
    console.log('\n3️⃣ Checking admin user...')
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true)
      .single()
    
    if (adminUser) {
      console.log(`   ✅ Admin user found: ${adminUser.email}`)
    } else {
      console.log(`   ❌ No admin user found`)
    }

    // Test 4: Sample data
    console.log('\n4️⃣ Sample data:')
    
    const { data: sampleThreads } = await supabase
      .from('threads')
      .select('title, category')
      .limit(3)
    
    if (sampleThreads && sampleThreads.length > 0) {
      console.log('   📝 Recent threads:')
      sampleThreads.forEach(thread => {
        console.log(`      - [${thread.category}] ${thread.title}`)
      })
    }

    console.log('\n✅ Database setup test complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Set passwords for test users in Supabase Auth dashboard')
    console.log('2. Test authentication flow in your Next.js app')
    console.log('3. Implement API routes to interact with the database')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testDatabaseSetup()