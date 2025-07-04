"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, User, LogOut, Key } from "lucide-react"
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
import { SignupModal } from "@/components/signup-modal"
import { LoginModal } from "@/components/login-modal"
import { AvatarGradient } from "@/components/ui/avatar-gradient"

export function ProtectedNavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name: string; isAdmin?: boolean; hasSubscription?: boolean } | null>(null)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const supabase = createClient()
  
  const navItems = [
    { label: "Threads", href: "/threads", protected: true },
    { label: "Classroom", href: "/classroom", protected: true },
    { label: "Calendar", href: "/calendar", protected: true },
  ]
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Get user details from the users table
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, is_admin')
          .eq('id', authUser.id)
          .single()
        
        // Check if user has active subscription
        const { data: subscriptions } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('status', 'active')
          .limit(1)
        
        setUser({
          email: authUser.email || '',
          name: userData?.full_name || authUser.email?.split('@')[0] || 'User',
          isAdmin: userData?.is_admin || false,
          hasSubscription: (subscriptions && subscriptions.length > 0) || userData?.is_admin || false
        })
      }
    }
    
    getUser()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        getUser()
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleNavClick = (e: React.MouseEvent, item: { href: string; protected: boolean }) => {
    if (item.protected && (!user || !user.hasSubscription)) {
      e.preventDefault()
      if (!user) {
        setShowSignupModal(true)
      } else {
        // User is logged in but no subscription
        setShowSignupModal(true)
      }
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-[1080px] mx-auto px-4 md:px-6">
          <div className="flex h-14 items-center gap-2 md:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-base md:text-lg hidden sm:inline-block">Build What You Need</span>
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
                    pathname.startsWith(item.href)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Navigation - Mobile */}
            <nav className="flex md:hidden items-center gap-1 ml-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "px-2 py-1.5 text-xs font-medium transition-colors rounded-md",
                    pathname.startsWith(item.href)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Search - Hidden for now, can be enabled later */}
            {/* <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div> */}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Profile */}
            <div className="flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2">
                      <AvatarGradient seed={user.email} className="h-8 w-8" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings/password')}>
                      <Key className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
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
          </div>
        </div>
      </header>

      {/* Signup Modal */}
      <SignupModal 
        open={showSignupModal} 
        onOpenChange={setShowSignupModal}
        communityName="Build What You Need"
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
    </>
  )
}