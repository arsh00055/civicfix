'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Comment } from '@/types/issue.types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { commentsAPI } from '@/lib/services/api/endpoints'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton'
import { formatRelativeTime } from '@/lib/utils/helpers/formatters'
import { toast } from 'sonner'

interface CommentSectionProps {
  issueId: string
  initialComments?: Comment[]
}

export default function CommentSection({ issueId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  // Fetch comments when component mounts if no initial comments provided
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments()
    }
  }, [issueId])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await commentsAPI.getComments(issueId)
      setComments(response.data || [])
    } catch (error: any) {
      console.error('Failed to fetch comments:', error)
      toast.error(error.message || 'Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated) return

    setIsSubmitting(true)
    try {
      const response = await commentsAPI.addComment(issueId, {
        text: newComment.trim()
      })
      
      // Add the new comment to the list
      const newCommentData = response.data
      setComments(prev => [newCommentData, ...prev])
      setNewComment('')
      toast.success('Comment posted successfully')
    } catch (error: any) {
      console.error('Failed to submit comment:', error)
      toast.error(error.message || 'Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
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
            className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            required
            aria-label="Add a comment"
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-3">
            <PrimaryButton
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-6 cursor-pointer"
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
                  src={comment.user?.avatar || '/images/avatar-placeholder.png'}
                  alt={comment.user?.name || 'Anonymous'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    {comment.user?.name || 'Anonymous'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}