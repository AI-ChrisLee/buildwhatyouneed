"use client"

import { cn } from "@/lib/utils"
import { generateAvatarGradient, generateAvatarPattern } from "@/lib/avatar"

interface AvatarGradientProps {
  seed: string // Email or ID to generate consistent avatar
  className?: string
  showPattern?: boolean
}

export function AvatarGradient({ seed, className, showPattern = false }: AvatarGradientProps) {
  const gradient = generateAvatarGradient(seed)
  const pattern = showPattern ? generateAvatarPattern(seed) : null
  
  return (
    <div className={cn(
      "relative overflow-hidden bg-gradient-to-br",
      gradient,
      className
    )}>
      {showPattern && (
        <svg 
          className="absolute inset-0 w-full h-full text-white"
          viewBox="0 0 24 24"
          fill="none"
          dangerouslySetInnerHTML={{ __html: pattern || '' }}
        />
      )}
    </div>
  )
}