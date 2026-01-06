'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className={`
      transition-all duration-300 ease-in-out
      ${isAnimating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}
    `}>
      {children}
    </div>
  )
}