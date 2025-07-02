// Script to create test users with passwords using Supabase Admin API
// Run with: node scripts/create-test-users.js

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

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    email: '3taehn@gmail.com',
    password: 'buildwhatyouneed123!',
    full_name: 'Taehyun Admin',
    is_admin: true,
    has_subscription: true
  },
  {
    email: 'me@aichrislee.com',
    password: 'buildwhatyouneed123!',
    full_name: 'Chris Lee',
    is_admin: false,
    has_subscription: true
  },
  {
    email: '2taehn@gmail.com',
    password: 'buildwhatyouneed123!',
    full_name: 'Taehyun Free',
    is_admin: false,
    has_subscription: false
  }
]

async function clearExistingData() {
  console.log('🧹 Clearing existing data...')
  
  // Clear in reverse order of dependencies
  await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('threads').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('stripe_subscriptions').delete().neq('id', '0')
  await supabase.from('stripe_customers').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')
  
  // Get all users and delete them
  const { data: users } = await supabase.auth.admin.listUsers()
  if (users && users.users) {
    for (const user of users.users) {
      await supabase.auth.admin.deleteUser(user.id)
    }
  }
  
  console.log('✅ Existing data cleared')
}

async function createUsers() {
  console.log('\n👤 Creating users with passwords...')
  
  const createdUsers = []
  
  for (const userData of testUsers) {
    try {
      // Create user with password
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      })
      
      if (error) {
        console.error(`❌ Error creating ${userData.email}:`, error.message)
        continue
      }
      
      console.log(`✅ Created user: ${userData.email}`)
      
      // Store user info for later
      createdUsers.push({
        id: data.user.id,
        ...userData
      })
      
      // Update admin flag if needed
      if (userData.is_admin) {
        await supabase
          .from('users')
          .update({ is_admin: true })
          .eq('id', data.user.id)
      }
      
      // Add subscription if needed
      if (userData.has_subscription) {
        // Create stripe customer
        await supabase
          .from('stripe_customers')
          .insert({
            user_id: data.user.id,
            stripe_customer_id: `cus_test_${data.user.id.substring(0, 8)}`
          })
        
        // Create subscription
        await supabase
          .from('stripe_subscriptions')
          .insert({
            id: `sub_test_${data.user.id.substring(0, 8)}`,
            user_id: data.user.id,
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
      }
      
    } catch (err) {
      console.error(`❌ Failed to create ${userData.email}:`, err.message)
    }
  }
  
  return createdUsers
}

async function createSampleContent(users) {
  console.log('\n📝 Creating sample content...')
  
  const adminUser = users.find(u => u.is_admin)
  const paidUser = users.find(u => !u.is_admin && u.has_subscription)
  
  if (!adminUser || !paidUser) {
    console.error('❌ Could not find admin or paid user')
    return
  }
  
  // Create announcement thread
  await supabase.from('threads').insert({
    title: 'Welcome to Build What You Need!',
    content: 'This community exists to help you break free from the $50B SaaS scam. Here, we build what we need. Nothing else.',
    category: 'announcements',
    author_id: adminUser.id
  })
  
  // Create general thread
  await supabase.from('threads').insert({
    title: 'Just canceled $500/month in SaaS subscriptions',
    content: 'I finally did it! Canceled Intercom ($300), Mixpanel ($150), and a bunch of other tools. Building my own simple alternatives.',
    category: 'general',
    author_id: paidUser.id
  })
  
  // Create course
  const { data: course } = await supabase
    .from('courses')
    .insert({
      title: 'SaaS Replacement Fundamentals',
      description: 'Learn the core principles of building what you need',
      order_index: 1
    })
    .select()
    .single()
  
  if (course) {
    // Add lesson
    await supabase.from('lessons').insert({
      course_id: course.id,
      title: 'Introduction: Why Build What You Need',
      wistia_video_id: 'sample_video_1',
      order_index: 1
    })
  }
  
  console.log('✅ Sample content created')
}

async function main() {
  console.log('🚀 Setting up test users for Build What You Need\n')
  
  try {
    // Clear existing data
    await clearExistingData()
    
    // Create users
    const users = await createUsers()
    
    // Create sample content
    await createSampleContent(users)
    
    console.log('\n✅ Setup complete!')
    console.log('\n📋 Test Users Created:')
    console.log('┌─────────────────────────┬────────────────────────┬────────────────┐')
    console.log('│ Email                   │ Password               │ Status         │')
    console.log('├─────────────────────────┼────────────────────────┼────────────────┤')
    testUsers.forEach(user => {
      const status = user.is_admin ? 'Admin' : user.has_subscription ? 'Paid Member' : 'Free Member'
      console.log(`│ ${user.email.padEnd(23)} │ buildwhatyouneed123!   │ ${status.padEnd(14)} │`)
    })
    console.log('└─────────────────────────┴────────────────────────┴────────────────┘')
    
    console.log('\n🎉 You can now log in with these credentials!')
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
  }
}

main()