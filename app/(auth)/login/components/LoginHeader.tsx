'use client'

import React from 'react'

interface LoginHeaderProps {
  className?: string
}

export default function LoginHeader({ className = '' }: LoginHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="relative">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/40">
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 rounded-full relative overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-200/40 rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-100/50 rounded-full"></div>
            </div>
            <div className="absolute -inset-2 border border-cyan-400/30 rounded-full animate-spin-very-slow"></div>
          </div>
          <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/40"></div>
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/40"></div>
        </div>

        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
            Civic<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Fix</span>
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5">Connecting communities across the universe</p>
        </div>
      </div>

      <div className="flex justify-center space-x-4 sm:space-x-12 text-xs sm:text-sm text-gray-700 mb-2">
        <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          <span>10K+ Issues Fixed</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
          <span>5K+ Active Heroes</span>
        </div>
      </div>
    </div>
  )
}