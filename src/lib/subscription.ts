import { createClient } from '@/lib/supabase/client'

export async function checkUserSubscription(userId: string) {
  const supabase = createClient()
  
  const { data: subscription, error } = await supabase
    .from('stripe_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error checking subscription:', error)
    return { hasActiveSubscription: false, subscription: null }
  }

  const hasActiveSubscription = !!subscription && subscription.status === 'active'

  return { hasActiveSubscription, subscription }
}

export async function getUserSubscriptionStatus(userId: string) {
  const supabase = createClient()
  
  // Check if user has any subscription
  const { data: subscriptions, error } = await supabase
    .from('stripe_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting subscription status:', error)
    return { status: 'none', subscriptions: [] }
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { status: 'none', subscriptions: [] }
  }

  // Check for active subscription
  const activeSubscription = subscriptions.find(sub => sub.status === 'active')
  if (activeSubscription) {
    return { status: 'active', subscriptions, activeSubscription }
  }

  // Check for past_due subscription
  const pastDueSubscription = subscriptions.find(sub => sub.status === 'past_due')
  if (pastDueSubscription) {
    return { status: 'past_due', subscriptions, pastDueSubscription }
  }

  // All subscriptions are canceled or other status
  return { status: 'canceled', subscriptions }
}