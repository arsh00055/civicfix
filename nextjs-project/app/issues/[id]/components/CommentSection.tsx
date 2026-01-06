'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Comment } from '@/types/issue.types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton'
import { formatRelativeTime } from '@/lib/utils/helpers/formatters'

interface CommentSectionProps {
  issueId: string
  comments: Comment[]
}

export default function CommentSection({ issueId, comments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated } = useAuth()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated) return

    setIsSubmitting(true)
    try {
      await apiClient.post(`/issues/${issueId}/comments`, {
        text: newComment
      })
      setNewComment('')
      // You might want to refresh comments here
    } catch (error: any) {
      console.error('Failed to submit comment:', error)
      alert(error.message || 'Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Comments ({comments.length})
      </h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="bg-gray-50 rounded-lg p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            required
            aria-label="Add a comment"
          />
          <div className="flex justify-end mt-3">
            <PrimaryButton
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-6"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </PrimaryButton>
          </div>
        </form>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-700">
            Please <Link href="/login" className="text-blue-600 hover:underline">log in</Link> to add comments.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Image
                  src={comment.user.avatar || '/images/avatar-placeholder.png'}
                  alt={comment.user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">{comment.user.name}</span>
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}