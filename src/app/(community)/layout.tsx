"use client"

import { ProtectedNavBar } from "@/components/protected-navbar"
import { AuthGuard } from "@/components/auth-guard"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// Lazy load the community badge since it's not critical for initial render
const CommunityBadge = dynamic(() => import("@/components/community-badge").then(mod => ({ default: mod.CommunityBadge })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
  ssr: false
})

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Show community badge only on threads page
  const showCommunityBadge = ['/threads'].includes(pathname)

  const content = (
    <div className="min-h-screen bg-background">
      <ProtectedNavBar />
      <main className="pt-4 md:pt-6">
        <div className="max-w-[1080px] mx-auto">
          {showCommunityBadge ? (
            <div className="flex gap-6 px-4 md:px-6">
              <div className="flex-1 min-w-0">{children}</div>
              <aside className="hidden lg:block w-[280px] shrink-0">
                <div className="sticky top-[90px]">
                  <CommunityBadge />
                </div>
              </aside>
            </div>
          ) : (
            <div className="px-4 md:px-6">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  )

  return content
}