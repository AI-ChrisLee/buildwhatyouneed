"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, User, LogOut, Key, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/providers/auth-provider"
import { SignupModal } from "@/components/signup-modal"
import { LoginModal } from "@/components/login-modal"
import { AvatarGradient } from "@/components/ui/avatar-gradient"
import { Button } from "@/components/ui/button"
import PaymentModal from "@/components/payment-modal"

export function ProtectedNavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [userDetails, setUserDetails] = useState<{ email: string; name: string; isAdmin?: boolean; hasSubscription?: boolean; membershipTier?: string; profileImageUrl?: string } | null>(null)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const supabase = createClient()
  
  const navItems = [
    { label: "Threads", href: "/threads", protected: true, requiresPaid: true },
    { label: "Classroom", href: "/classroom", protected: true, requiresPaid: false },
    { label: "Calendar", href: "/calendar", protected: true, requiresPaid: true },
    { label: "About", href: "/", protected: false, requiresPaid: false },
  ]
  
  useEffect(() => {
    const getUserDetails = async () => {
      if (authUser) {
        // Get user details from the users table
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, is_admin, membership_tier, profile_image_url')
          .eq('id', authUser.id)
          .single()
        
        // Check if user has active subscription
        const { data: subscriptions } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', authUser.id)
          .in('status', ['active', 'trialing', 'incomplete'])
          .limit(1)
        
        setUserDetails({
          email: authUser.email || '',
          name: userData?.full_name || authUser.email?.split('@')[0] || 'User',
          isAdmin: userData?.is_admin || false,
          hasSubscription: (subscriptions && subscriptions.length > 0) || userData?.is_admin || userData?.membership_tier === 'paid' || false,
          membershipTier: userData?.membership_tier || null,
          profileImageUrl: userData?.profile_image_url || null
        })
      } else {
        setUserDetails(null)
      }
    }
    
    getUserDetails()
  }, [authUser, supabase])
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleNavClick = (e: React.MouseEvent, item: { href: string; protected: boolean; requiresPaid?: boolean }) => {
    if (item.protected && !userDetails) {
      e.preventDefault()
      setShowSignupModal(true)
    } else if (item.requiresPaid && userDetails && !userDetails.hasSubscription) {
      e.preventDefault()
      // User is logged in but no subscription - show payment modal
      setShowPaymentModal(true)
    } else if (!item.requiresPaid && userDetails && userDetails.membershipTier === 'free') {
      // Free users can access classroom - let them through
      return
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-[1080px] mx-auto px-4 md:px-6">
          <div className="flex h-14 items-center gap-2 md:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image 
                src="/logo.png" 
                alt="AI Chris Lee - Control OS Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8"
                priority
              />
              <span className="font-semibold text-base md:text-lg">Control OS</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-4 lg:ml-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Desktop Profile */}
            <div className="hidden md:flex items-center">
              {userDetails ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2">
                      {userDetails.profileImageUrl ? (
                        <img 
                          src={userDetails.profileImageUrl} 
                          alt={userDetails.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarGradient seed={userDetails.email} className="h-8 w-8" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userDetails.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userDetails.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Key className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="rounded-full overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2"
                >
                  <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="flex md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* User Info / Login */}
                  {userDetails ? (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-3">
                          {userDetails.profileImageUrl ? (
                            <img 
                              src={userDetails.profileImageUrl} 
                              alt={userDetails.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <AvatarGradient seed={userDetails.email} className="h-8 w-8" />
                          )}
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userDetails.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {userDetails.email}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setShowLoginModal(true)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Log in</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Navigation Items */}
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item)}
                        className={cn(
                          (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                            ? "bg-muted"
                            : ""
                        )}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  
                  {/* User Actions */}
                  {userDetails && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Key className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Signup Modal */}
      <SignupModal 
        open={showSignupModal} 
        onOpenChange={setShowSignupModal}
        communityName="The SaaS Genocide"
        onLoginClick={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSignupClick={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        user={authUser}
      />
    </>
  )
}