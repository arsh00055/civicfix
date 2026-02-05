'use client'

import React from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Loading from '@/app/loading'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userRole, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!isLoading && userRole !== 'admin') {
      router.push('/')
    }
  }, [userRole, isLoading, router])

  if (isLoading) {
    return <Loading />
  }

  if (userRole !== 'admin') {
    return null
  }

  return (
    <div className="admin-layout">      
      {children}
    </div>
  )
}