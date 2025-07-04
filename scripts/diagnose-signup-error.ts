#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function diagnoseSignupIssue() {
  console.log('🔍 Diagnosing signup error...\n')

  try {
    // 1. Check if the users table exists
    console.log('1. Checking if public.users table exists...')
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (tablesError && tablesError.code === '42P01') {
      console.error('❌ public.users table does not exist!')
      console.log('   Run the database setup SQL to create it.')
      return
    } else if (tablesError) {
      console.error('❌ Error accessing users table:', tablesError.message)
    } else {
      console.log('✅ public.users table exists')
    }

    // 2. Check if the trigger exists
    console.log('\n2. Checking if handle_new_user trigger exists...')
    const { data: triggers, error: triggersError } = await supabase.rpc('get_triggers', {
      schema_name: 'auth',
      table_name: 'users'
    }).maybeSingle()

    if (triggersError) {
      // Try a different approach
      const { data: checkTrigger, error: checkError } = await supabase.rpc('check_trigger_exists', {
        trigger_name: 'on_auth_user_created'
      }).maybeSingle()

      if (checkError) {
        console.log('⚠️  Could not verify trigger existence (this is normal if the helper function doesn\'t exist)')
      }
    }

    // 3. Check if the function exists
    console.log('\n3. Checking if handle_new_user function exists...')
    const { data: functions, error: functionsError } = await supabase.rpc('check_function_exists', {
      function_name: 'handle_new_user'
    }).maybeSingle()

    if (functionsError) {
      console.log('⚠️  Could not verify function existence (this is normal if the helper function doesn\'t exist)')
    }

    // 4. Try to manually test the user creation flow
    console.log('\n4. Testing manual user creation in public.users...')
    const testUserId = 'test-' + Date.now()
    const { data: testUser, error: testUserError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        full_name: 'Test User'
      })
      .select()
      .single()

    if (testUserError) {
      console.error('❌ Failed to create test user:', testUserError.message)
      console.log('   This suggests a problem with the table structure or constraints.')
    } else {
      console.log('✅ Successfully created test user')
      
      // Clean up test user
      await supabase.from('users').delete().eq('id', testUserId)
    }

    // 5. Check recent auth.users entries
    console.log('\n5. Checking recent auth.users entries...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 5
    })

    if (authError) {
      console.error('❌ Failed to list auth users:', authError.message)
    } else {
      console.log(`✅ Found ${authUsers.users.length} recent auth users`)
      
      // Check if these users have corresponding entries in public.users
      for (const authUser of authUsers.users) {
        const { data: publicUser, error: publicUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (publicUserError) {
          console.log(`   ⚠️  Auth user ${authUser.email} has no public.users entry`)
        } else {
          console.log(`   ✅ Auth user ${authUser.email} has public.users entry`)
        }
      }
    }

    console.log('\n📋 Diagnosis Summary:')
    console.log('The "Database error saving new user" likely means:')
    console.log('1. The trigger on_auth_user_created is not properly set up')
    console.log('2. The handle_new_user() function is missing or failing')
    console.log('3. There\'s a constraint violation when inserting into public.users')
    console.log('\nRecommended fix:')
    console.log('Run the SQL from docs/CONSOLIDATED-DATABASE-SETUP.md section "User Registration Function"')

  } catch (error) {
    console.error('Unexpected error during diagnosis:', error)
  }
}

// Add helper functions that might not exist in Supabase
async function setupHelperFunctions() {
  console.log('Setting up helper functions...\n')
  
  const helperSQL = `
    -- Check if trigger exists
    CREATE OR REPLACE FUNCTION check_trigger_exists(trigger_name text)
    RETURNS boolean AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = trigger_name
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Check if function exists
    CREATE OR REPLACE FUNCTION check_function_exists(function_name text)
    RETURNS boolean AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = function_name
      );
    END;
    $$ LANGUAGE plpgsql;

    -- Get triggers for a table
    CREATE OR REPLACE FUNCTION get_triggers(schema_name text, table_name text)
    RETURNS TABLE(trigger_name text) AS $$
    BEGIN
      RETURN QUERY
      SELECT tgname::text
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = schema_name
      AND c.relname = table_name;
    END;
    $$ LANGUAGE plpgsql;
  `

  try {
    await supabase.rpc('exec_sql', { sql: helperSQL }).maybeSingle()
  } catch (error) {
    // Ignore errors - these functions might already exist
  }
}

// Run diagnosis
diagnoseSignupIssue()