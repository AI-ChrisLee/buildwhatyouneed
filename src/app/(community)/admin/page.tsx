"use client"

import { useEffect } from "react"
import { isCurrentUserAdmin } from "@/lib/supabase/admin-actions"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    checkAdminAndRedirect()
  }, [])

  async function checkAdminAndRedirect() {
    const adminStatus = await isCurrentUserAdmin()
    if (!adminStatus) {
      router.push('/threads')
    } else {
      // Redirect to threads page where admin controls are integrated
      router.push('/threads')
    }
  }

  return (
    <div className="container mx-auto py-8 flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}