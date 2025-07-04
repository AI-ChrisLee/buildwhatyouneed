"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'login' | 'signup' | 'payment'
}

export function AuthModal({ open, onOpenChange, mode = 'signup' }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(mode === 'payment' ? 'signup' : mode)
  const [showPayment, setShowPayment] = useState(mode === 'payment')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // Check if user has subscription
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: subscription } = await supabase
            .from('stripe_subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle()
          
          if (subscription) {
            router.push('/threads')
          } else {
            setShowPayment(true)
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `${firstName} ${lastName}`.trim()
            }
          }
        })
        if (error) throw error
        
        // After signup, show payment
        setShowPayment(true)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID 
        }),
      })
      
      const { sessionUrl } = await response.json()
      if (sessionUrl) {
        window.location.href = sessionUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  if (showPayment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">B</span>
            </div>
            
            <DialogTitle className="text-2xl font-bold">
              Build What You Need
            </DialogTitle>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Membership</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value="monthly"
                      defaultChecked
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="text-left">
                      <div className="font-medium">Monthly</div>
                      <div className="text-sm text-gray-500">$119 billed monthly</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">$119/month</div>
                </label>
                
                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 relative">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value="annual"
                      className="w-4 h-4 text-blue-600"
                      disabled
                    />
                    <div className="text-left">
                      <div className="font-medium">Annual</div>
                      <div className="text-sm text-gray-500">$999 billed annually</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">$83/month</div>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Save 30%</span>
                  </div>
                </label>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Payment method</h4>
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'JOIN $119/month'}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                By joining, you accept Build What You Need's terms. You can cancel anytime.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-blue-600">bwyn</div>
            <DialogTitle className="text-xl">
              {authMode === 'login' ? 'Log in to Build What You Need' : 'Create your account'}
            </DialogTitle>
            <p className="text-sm text-gray-600">to join Build What You Need</p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleAuth} className="space-y-4 mt-6">
          {authMode === 'signup' && (
            <>
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {authMode === 'login' && (
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                Forgot password?
              </Link>
            )}
          </div>
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : authMode === 'login' ? 'LOG IN' : 'SIGN UP'}
          </Button>
          
          <div className="text-center text-sm">
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-blue-600 hover:underline"
                >
                  Sign up for free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-blue-600 hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </form>
        
        {authMode === 'signup' && (
          <p className="text-xs text-center text-gray-500 mt-4">
            By signing up, you accept our <Link href="/terms" className="underline">terms</Link> and{' '}
            <Link href="/privacy" className="underline">privacy policy</Link>
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}