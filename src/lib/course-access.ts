import { createClient } from '@/lib/supabase/server'

export interface CourseAccessResult {
  hasAccess: boolean
  reason?: 'not_authenticated' | 'tier_mismatch' | 'not_found' | 'error'
  requiresUpgrade?: boolean
}

/**
 * Check if a user has access to a specific course
 * Server-side validation function
 */
export async function checkCourseAccess(
  userId: string, 
  courseId: string
): Promise<CourseAccessResult> {
  try {
    const supabase = await createClient()
    
    // 1. Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, is_free')
      .eq('id', courseId)
      .single()
    
    if (courseError || !course) {
      return { hasAccess: false, reason: 'not_found' }
    }
    
    // 2. If course is free, anyone can access
    if (course.is_free) {
      return { hasAccess: true }
    }
    
    // 3. Check user's membership tier
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('membership_tier, is_admin')
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      return { hasAccess: false, reason: 'not_authenticated' }
    }
    
    // 4. Admins have full access
    if (user.is_admin) {
      return { hasAccess: true }
    }
    
    // 5. Check if user has paid membership
    if (user.membership_tier === 'paid') {
      return { hasAccess: true }
    }
    
    // 6. Check for active Stripe subscription
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)
      .single()
    
    if (subscription) {
      return { hasAccess: true }
    }
    
    // 7. Free tier users can't access premium courses
    return { 
      hasAccess: false, 
      reason: 'tier_mismatch',
      requiresUpgrade: true 
    }
    
  } catch (error) {
    console.error('Error checking course access:', error)
    return { hasAccess: false, reason: 'error' }
  }
}

/**
 * Grant free course access to a user (called after signup)
 */
export async function grantFreeCourseAccess(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // Find the first free course
    const { data: freeCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('is_free', true)
      .limit(1)
      .single()
    
    if (!freeCourse) {
      console.log('No free course found to grant access')
      return false
    }
    
    // Insert access record (upsert to avoid duplicates)
    const { error } = await supabase
      .from('user_course_access')
      .upsert({
        user_id: userId,
        course_id: freeCourse.id,
        accessed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,course_id'
      })
    
    if (error) {
      console.error('Error granting free course access:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in grantFreeCourseAccess:', error)
    return false
  }
}

/**
 * Get all courses with access information for a user
 */
export async function getUserCoursesWithAccess(userId: string) {
  try {
    const supabase = await createClient()
    
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('membership_tier, is_admin')
      .eq('id', userId)
      .single()
    
    // Get all courses
    const { data: courses } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (id)
      `)
      .order('created_at', { ascending: false })
    
    if (!courses) return []
    
    // Check for active subscription
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)
      .single()
    
    const hasPaidAccess = user?.is_admin || 
                         user?.membership_tier === 'paid' || 
                         !!subscription
    
    // Map courses with access information
    return courses.map(course => ({
      ...course,
      lesson_count: course.lessons?.length || 0,
      has_access: course.is_free || hasPaidAccess,
      requires_upgrade: !course.is_free && !hasPaidAccess
    }))
    
  } catch (error) {
    console.error('Error getting user courses:', error)
    return []
  }
}

/**
 * Validate course access middleware
 * Use this in API routes to protect course endpoints
 */
export async function validateCourseAccess(
  request: Request,
  courseId: string
): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { authorized: false, error: 'Not authenticated' }
    }
    
    // Check course access
    const access = await checkCourseAccess(user.id, courseId)
    
    if (!access.hasAccess) {
      return { 
        authorized: false, 
        error: access.requiresUpgrade ? 'Upgrade required' : 'Access denied' 
      }
    }
    
    return { authorized: true, userId: user.id }
    
  } catch (error) {
    console.error('Error validating course access:', error)
    return { authorized: false, error: 'Validation error' }
  }
}