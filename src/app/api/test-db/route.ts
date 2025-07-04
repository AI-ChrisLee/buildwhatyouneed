import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()
  
  try {
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test users table with different queries
    const { count: userCount, error: userError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
    
    // Test a simple select to see if RLS is the issue
    const { data: userData, error: userSelectError } = await supabase
      .from("users")
      .select("id")
      .limit(1)
    
    // Test leads table
    const { error: leadsError } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
    
    // Test auth users count
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin?.listUsers()
    
    // Test if tables exist and are accessible
    const tables = {
      users: !userError,
      leads: !leadsError,
      auth: !authError,
    }
    
    // Check specific table errors
    const detailedErrors = {
      auth: authError?.message || null,
      users: userError?.message || null,
      userSelect: userSelectError?.message || null,
      leads: leadsError?.message || null,
      authUsers: authUsersError?.message || "Admin API not available",
    }
    
    return NextResponse.json({
      status: "ok",
      currentUser: user?.email || null,
      userCount: userCount || 0,
      userData: userData || null,
      tables,
      errors: detailedErrors,
      hints: {
        noAuth: !user ? "No authenticated user - RLS policies may block access" : null,
        rlsIssue: userError && !userSelectError ? "RLS might be blocking count queries" : null,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
      hint: "Check if database is running and tables exist"
    }, { status: 500 })
  }
}
