// Generate random avatar gradients based on a seed (like email or id)
export function generateAvatarGradient(seed: string) {
  // List of professional gradients
  const gradients = [
    'from-slate-500 to-slate-700',
    'from-gray-500 to-gray-700', 
    'from-zinc-500 to-zinc-700',
    'from-neutral-500 to-neutral-700',
    'from-stone-500 to-stone-700',
    'from-red-500 to-red-700',
    'from-orange-500 to-orange-700',
    'from-amber-500 to-amber-700',
    'from-yellow-500 to-yellow-700',
    'from-lime-500 to-lime-700',
    'from-green-500 to-green-700',
    'from-emerald-500 to-emerald-700',
    'from-teal-500 to-teal-700',
    'from-cyan-500 to-cyan-700',
    'from-sky-500 to-sky-700',
    'from-blue-500 to-blue-700',
    'from-indigo-500 to-indigo-700',
    'from-violet-500 to-violet-700',
    'from-purple-500 to-purple-700',
    'from-fuchsia-500 to-fuchsia-700',
    'from-pink-500 to-pink-700',
    'from-rose-500 to-rose-700',
  ]

  // Simple hash function to get consistent gradient from seed
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

// Generate avatar patterns (optional - for more variety)
export function generateAvatarPattern(seed: string): string {
  const patterns = [
    // Dots
    `<circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3"/>
     <circle cx="12" cy="6" r="1" fill="currentColor" opacity="0.3"/>
     <circle cx="12" cy="18" r="1" fill="currentColor" opacity="0.3"/>
     <circle cx="6" cy="12" r="1" fill="currentColor" opacity="0.3"/>
     <circle cx="18" cy="12" r="1" fill="currentColor" opacity="0.3"/>`,
    // Rings
    `<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
     <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2"/>`,
    // Lines
    `<line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
     <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.3"/>`,
    // Grid
    `<line x1="8" y1="0" x2="8" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
     <line x1="16" y1="0" x2="16" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
     <line x1="0" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
     <line x1="0" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.2"/>`,
  ]
  
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 3) - hash) + char
    hash = hash & hash
  }
  
  const index = Math.abs(hash) % patterns.length
  return patterns[index]
}