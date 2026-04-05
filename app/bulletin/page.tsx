'use client'

import React, { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'
import {
  MegaphoneIcon,
  PlusIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  MapPinIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { HandThumbUpIcon as ThumbUpSolid } from '@heroicons/react/24/solid'
import { toast } from 'sonner'

interface Post {
  id: string
  title: string
  body: string
  category: string
  isPinned: boolean
  upvotes: number
  hasUpvoted: boolean
  commentCount: number
  author: { id: string; name: string; role: string }
  createdAt: string
}

const CATEGORIES = ['all', 'general', 'announcement', 'help_wanted', 'celebration', 'discussion'] as const
type Category = typeof CATEGORIES[number]

const CAT_STYLE: Record<string, { label: string; color: string; emoji: string }> = {
  general:      { label: 'General',      color: 'bg-gray-100 text-gray-700',    emoji: '💬' },
  announcement: { label: 'Announcement', color: 'bg-blue-100 text-blue-700',    emoji: '📢' },
  help_wanted:  { label: 'Help Wanted',  color: 'bg-orange-100 text-orange-700',emoji: '🙋' },
  celebration:  { label: 'Celebration',  color: 'bg-yellow-100 text-yellow-700',emoji: '🎉' },
  discussion:   { label: 'Discussion',   color: 'bg-purple-100 text-purple-700',emoji: '🗣️' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function PostCard({
  post,
  currentUserId,
  isAdmin,
  onUpvote,
  onDelete,
}: {
  post: Post
  currentUserId: string
  isAdmin: boolean
  onUpvote: (id: string) => void
  onDelete: (id: string) => void
}) {
  const cat = CAT_STYLE[post.category] || CAT_STYLE.general
  const canDelete = post.author.id === currentUserId || isAdmin

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 space-y-3 transition-all hover:shadow-md ${
      post.isPinned ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-100'
    }`}>
      {post.isPinned && (
        <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
          <MapPinIcon className="h-3.5 w-3.5" /> Pinned
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.color}`}>
              {cat.emoji} {cat.label}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{post.title}</h3>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 text-gray-300 cursor-pointer hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{post.body}</p>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {post.author.name[0].toUpperCase()}
          </div>
          <span className="font-medium text-gray-600">{post.author.name}</span>
          <span>·</span>
          <span>{timeAgo(post.createdAt)}</span>
          <span>·</span>
          <span className="capitalize">{post.author.role}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpvote(post.id)}
            className={`flex items-center cursor-pointer gap-1 text-xs font-medium transition-colors ${
              post.hasUpvoted ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
            }`}
          >
            {post.hasUpvoted
              ? <ThumbUpSolid className="h-4 w-4" />
              : <HandThumbUpIcon className="h-4 w-4" />
            }
            {post.upvotes}
          </button>
        </div>
      </div>
    </div>
  )
}

function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return
    try {
      setSubmitting(true)
      await apiClient.post('/bulletin', { title, body, category })
      onCreated()
      toast.success("Post created successfully")
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">New Post</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c !== 'all').map(c => {
                const cat = CAT_STYLE[c]
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 text-xs cursor-pointer font-medium rounded-full border transition-colors ${
                      category === c
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full text-black px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share details with your community…"
              rows={4}
              className="w-full text-black px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || !body.trim()}
            className="flex-1 cursor-pointer py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BulletinPage() {
  const { user } = useAuth()
  const [posts, setPosts]           = useState<Post[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [showCreate, setShowCreate] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const params: any = {}
      if (activeCategory !== 'all') params.category = activeCategory
      const res = await apiClient.get('/bulletin', { params })
      setPosts(res.data.posts || [])
    } catch {
      setError('Failed to load posts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [activeCategory])

  const handleUpvote = async (postId: string) => {
    try {
      const res = await apiClient.post(`/bulletin/${postId}/upvote`)
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, upvotes: res.data.upvotes, hasUpvoted: res.data.hasUpvoted }
          : p
      ))
    } catch {}
  }

  const handleDelete = async (postId: string) => {
    toast.warning('Delete this post?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await apiClient.delete(`/bulletin/${postId}`)
            setPosts(prev => prev.filter(p => p.id !== postId))
            toast.success('Post deleted successfully')
          } catch (error) {
            toast.error('Failed to delete post')
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => toast.info('Delete cancelled'),
      },
    })
  }

  return (
    <MainLayout role={user?.role ?? null}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-xl">
                <MegaphoneIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community Board</h1>
                <p className="text-sm text-gray-500">Announcements, help, and community chat</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={fetchPosts} className="flex cursor-pointer items-center gap-1.5 px-4 py-2 text-green-500 hover:text-green-800 hover:bg-white rounded-lg border border-gray-200 transition-colors">
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex cursor-pointer items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Post
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => {
              const style = CAT_STYLE[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    activeCategory === cat
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat === 'all' ? '🌐 All' : `${style.emoji} ${style.label}`}
                </button>
              )
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <MegaphoneIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700">Nothing posted yet</h3>
              <p className="text-sm text-gray-400 mt-1">Be the first to post something!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id || ''}
                  isAdmin={user?.role === 'admin'}
                  onUpvote={handleUpvote}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchPosts}
        />
      )}
    </MainLayout>
  )
}