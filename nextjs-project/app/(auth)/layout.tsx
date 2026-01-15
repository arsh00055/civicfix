'use client'

import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="overflow-x-auto lg:min-h-screen bg-white">
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  )
}