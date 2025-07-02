"use client"

import { NavBar } from "@/components/navbar"
import { CommunityBadge } from "@/components/community-badge"
import { usePathname } from "next/navigation"

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Show community badge only on these pages (not on about since it has its own)
  const showCommunityBadge = ['/threads', '/classroom', '/calendar'].includes(pathname)

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="container mx-auto py-6">
        <div className="mx-auto max-w-[1050px]">
          {showCommunityBadge ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
              <div>{children}</div>
              <aside className="hidden lg:block">
                <CommunityBadge />
              </aside>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  )
}