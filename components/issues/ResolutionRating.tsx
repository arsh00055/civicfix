'use client'

import React, { useState, useEffect } from 'react'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import apiClient from '@/lib/services/api/client'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'

interface ResolutionRatingProps {
  issueId: string
  issueStatus: string
  reporterId: string
}

export default function ResolutionRating({ issueId, issueStatus, reporterId }: ResolutionRatingProps) {
  const { user } = useAuth()
  const [hovered, setHovered]     = useState(0)
  const [selected, setSelected]   = useState(0)
  const [comment, setComment]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingRating, setExistingRating] = useState<{ score: number; comment: string | null } | null>(null)
  const [canRate, setCanRate]     = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await apiClient.get(`/issues/${issueId}/rate`)
        setCanRate(res.data.canRate)
        setExistingRating(res.data.rating)
        if (res.data.hasRated) setSubmitted(true)
      } catch {}
      finally { setLoading(false) }
    }
    if (user && ['resolved', 'closed'].includes(issueStatus)) check()
    else setLoading(false)
  }, [issueId, issueStatus, user])

  const handleSubmit = async () => {
    if (!selected) return
    try {
      setSubmitting(true)
      await apiClient.post(`/issues/${issueId}/rate`, { rating: selected, comment })
      setSubmitted(true)
      toast.success("Rating submitted successfully")
      setExistingRating({ score: selected, comment: comment || null })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  // Only show for resolved issues
  if (!['resolved', 'closed'].includes(issueStatus)) return null
  if (loading) return null
  // Only the reporter sees this
  if (user?.id !== reporterId) return null

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  const display = hovered || selected

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-base">✅</span>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-green-900">This issue has been resolved!</h4>
          <p className="text-xs text-green-700">
            {submitted ? 'Thank you for your feedback.' : 'How well was it handled?'}
          </p>
        </div>
      </div>

      {submitted && existingRating ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <StarSolid
                key={s}
                className={`h-5 w-5 cursor-pointer ${s <= existingRating.score ? 'text-yellow-400' : 'text-gray-200'}`}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {LABELS[existingRating.score]}
            </span>
          </div>
          {existingRating.comment && (
            <p className="text-xs text-gray-600 italic">"{existingRating.comment}"</p>
          )}
        </div>
      ) : canRate ? (
        <div className="space-y-3">
          {/* Stars */}
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setSelected(s)}
                className="transition-transform cursor-pointer hover:scale-110"
              >
                {s <= display ? (
                  <StarSolid className="h-7 w-7 text-yellow-400" />
                ) : (
                  <StarIcon className="h-7 w-7 text-gray-300" />
                )}
              </button>
            ))}
            {display > 0 && (
              <span className="ml-2 text-sm font-medium text-gray-600">{LABELS[display]}</span>
            )}
          </div>

          {/* Comment */}
          {selected > 0 && (
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Any comments? (optional)"
              rows={2}
              className="w-full text-black text-sm px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none bg-white"
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="px-5 py-2 cursor-pointer bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Rating'}
          </button>
        </div>
      ) : null}
    </div>
  )
}