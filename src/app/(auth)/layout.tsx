import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if they have subscription
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    redirect(subscription ? '/threads' : '/payment')
  }

  return <>{children}</>
}