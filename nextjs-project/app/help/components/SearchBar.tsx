'use client'

import React, { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
      // Implement search logic - pending
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <form onSubmit={handleSearch} className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search for help articles, guides, and FAQs..."
          className="text-black w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl text-md"
          aria-label="Search help articles"
        />
      </form>
    </div>
  )
}