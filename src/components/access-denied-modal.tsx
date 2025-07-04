"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import PaymentModal from "@/components/payment-modal"
import { createClient } from "@/lib/supabase/client"

interface AccessDeniedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string
}

export function AccessDeniedModal({ open, onOpenChange, feature }: AccessDeniedModalProps) {
  const router = useRouter()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleJoinClick = () => {
    onOpenChange(false)
    setShowPaymentModal(true)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold">Members Only</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Upgrade to premium to access exclusive features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-gray-600">
            Access to {feature} is available to members only.
          </p>
          
          <p className="text-sm text-gray-500">
            Join Build What You Need to unlock all features including:
          </p>
          
          <ul className="text-sm text-left space-y-2 max-w-sm mx-auto">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Full access to community threads</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>All courses and tutorials</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Live events and workshops</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Code templates and resources</span>
            </li>
          </ul>

          <Button onClick={handleJoinClick} className="w-full" size="lg">
            Join for $97/month
          </Button>
          
          <p className="text-xs text-gray-500">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>

    <PaymentModal
      open={showPaymentModal}
      onOpenChange={setShowPaymentModal}
      user={user}
    />
    </>
  )
}