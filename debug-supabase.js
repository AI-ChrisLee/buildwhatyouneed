// Debug script to check Supabase connection and tables
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
  process.exit(1)
}

console.log('🔍 Debugging Supabase Connection')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
  console.log('\n📊 Checking database tables...')
  
  // Check users table
  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ Users table error:', error.message)
    } else {
      console.log('✅ Users table accessible. Count:', count || 0)
    }
  } catch (err) {
    console.log('❌ Users table exception:', err.message)
  }

  // Check auth
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.log('❌ Auth check error:', error.message)
    } else {
      console.log('✅ Auth system accessible. Current user:', user?.email || 'Not logged in')
    }
  } catch (err) {
    console.log('❌ Auth exception:', err.message)
  }

  // Check if site_content table exists
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ site_content table missing or inaccessible:', error.message)
      console.log('   Run: psql $DATABASE_URL -f supabase/add-site-content-table.sql')
    } else {
      console.log('✅ site_content table exists')
    }
  } catch (err) {
    console.log('❌ site_content exception:', err.message)
  }

  // Check RLS policies
  console.log('\n🔒 Checking RLS policies...')
  try {
    // Try to insert a test lead (should work with public insert policy)
    const testEmail = `test${Date.now()}@example.com`
    const { data, error } = await supabase
      .from('leads')
      .insert({ email: testEmail, name: 'Test User' })
      .select()
    
    if (error) {
      console.log('❌ Leads table insert error:', error.message)
      console.log('   This might indicate RLS policy issues')
    } else {
      console.log('✅ Leads table insert works')
      // Clean up
      await supabase.from('leads').delete().eq('email', testEmail)
    }
  } catch (err) {
    console.log('❌ Leads table exception:', err.message)
  }
}

checkTables().then(() => {
  console.log('\n✨ Debug complete')
}).catch(err => {
  console.error('\n❌ Debug failed:', err)
})