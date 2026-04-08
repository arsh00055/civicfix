'use client'

import React, { useState, useEffect, useRef } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'

interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

interface Poll {
  id: string
  question: string
  description: string | null
  options: PollOption[]
  totalVotes: number
  createdBy: { name: string; role: string }
  createdAt: string
  expiresAt: string
  isActive: boolean
  hasVoted: boolean
  userVoteId: string | null
  category: string
}

const CATEGORY_COLORS: Record<string, string> = {
  general:        'bg-gray-100 text-gray-700',
  infrastructure: 'bg-blue-100 text-blue-700',
  safety:         'bg-red-100 text-red-700',
  environment:    'bg-green-100 text-green-700',
  community:      'bg-purple-100 text-purple-700',
}

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Closed'
  const days  = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d left`
  return `${hours}h left`
}

function PollCard({ poll, onVote }: { poll: Poll; onVote: (pollId: string, optionId: string) => Promise<void> }) {
  const [voting, setVoting] = useState(false)
  const isClosed = !poll.isActive || new Date(poll.expiresAt) < new Date()

  const handleVote = async (pollId: string, optionId: string) => {
    if (poll.hasVoted || isClosed || voting) return
    try {
      setVoting(true)
      await onVote(poll.id, optionId)
    } finally {
      setVoting(false)
    }
  }

  const showResults = poll.hasVoted || isClosed

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[poll.category] || CATEGORY_COLORS.general}`}>
              {poll.category}
            </span>
            <span className={`flex items-center gap-1 text-xs ${isClosed ? 'text-red-500' : 'text-gray-400'}`}>
              <ClockIcon className="h-3.5 w-3.5" />
              {timeLeft(poll.expiresAt)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{poll.question}</h3>
          {poll.description && (
            <p className="text-xs text-gray-500 mt-1">{poll.description}</p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map(option => {
          const isUserChoice = poll.userVoteId === option.id
          const isWinning = showResults && option.votes === Math.max(...poll.options.map(o => o.votes))

          return (
            <button
              key={option.id}
              onClick={() => handleVote(poll.id, option.id)}
              disabled={showResults || voting}
              className={`w-full text-left relative overflow-hidden rounded-lg border transition-all ${
                showResults
                  ? isUserChoice
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-100 bg-gray-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
              } ${voting ? 'opacity-60' : ''}`}
            >
              {/* Progress bar */}
              {showResults && (
                <div
                  className={`absolute inset-0 ${isUserChoice ? 'bg-blue-100' : 'bg-gray-100'} transition-all duration-700`}
                  style={{ width: `${option.percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {showResults && isUserChoice && (
                    <CheckCircleIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${isUserChoice ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                    {option.text}
                  </span>
                  {showResults && isWinning && option.votes > 0 && (
                    <span className="text-xs text-yellow-600 font-medium">🏆</span>
                  )}
                </div>
                {showResults && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{option.votes} votes</span>
                    <span className="font-semibold text-gray-700">{option.percentage}%</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
        <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''} · by {poll.createdBy.name}</span>
        {poll.hasVoted && !isClosed && (
          <span className="text-blue-600 font-medium">✓ Voted</span>
        )}
        {isClosed && <span className="text-red-500 font-medium">Poll closed</span>}
      </div>
    </div>
  )
}

function CreatePollModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [question, setQuestion]     = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions]       = useState(['', ''])
  const [category, setCategory]     = useState('general')
  const [duration, setDuration]     = useState(7)
  const [submitting, setSubmitting] = useState(false)

  const addOption = () => { if (options.length < 6) setOptions([...options, '']) }
  const removeOption = (i: number) => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)) }
  const updateOption = (i: number, val: string) => {
    const updated = [...options]; updated[i] = val; setOptions(updated)
  }

  const handleSubmit = async () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return
    try {
      setSubmitting(true)
      await apiClient.post('/polls', {
        question, description,
        options: options.filter(o => o.trim()),
        category,
        durationDays: duration,
      })
      onCreated()
      onClose()
      toast.success("Poll created successfully")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create poll')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Create Poll</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Question *</label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What should the community prioritize?"
              className="w-full text-black px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more context…"
              rows={2}
              className="w-full text-black px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Options * (2–6)</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 text-black px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="p-2 text-gray-400 hover:text-red-500">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button
                onClick={addOption}
                className="mt-2 text-xs cursor-pointer text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Add option
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-black px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(CATEGORY_COLORS).map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full text-black  px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
                <option value={30}>1 month</option>
              </select>
            </div>
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
            disabled={submitting || !question.trim() || options.filter(o => o.trim()).length < 2}
            className="flex-1 cursor-pointer py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors"
          >
            {submitting ? 'Creating…' : 'Create Poll'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PollsPage() {
  const { user } = useAuth()
  const [polls, setPolls]           = useState<Poll[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [tab, setTab]               = useState<'active' | 'closed'>('active')
  const [showCreate, setShowCreate] = useState(false)

  const fetchPolls = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get('/polls', { params: { status: tab } })
      setPolls(res.data.polls || [])
    } catch {
      setError('Failed to load polls.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPolls() }, [tab])

  const handleVote = async (pollId: string, optionId: string) => {
    await apiClient.post(`/polls/${pollId}/vote`, { optionId })
    // Optimistically update
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p
      const totalVotes = p.totalVotes + 1
      return {
        ...p,
        hasVoted: true,
        userVoteId: optionId,
        totalVotes,
        options: p.options.map(o => {
          const votes = o.id === optionId ? o.votes + 1 : o.votes
          return { ...o, votes, percentage: Math.round((votes / totalVotes) * 100) }
        }),
      }
    }))
  }

  return (
    <MainLayout role={user?.role ?? null}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-xl">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community Polls</h1>
                <p className="text-sm text-gray-500">Vote on what matters to your community</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={fetchPolls} className="flex items-center gap-1.5 px-4 cursor-pointer py-2 text-green-500 hover:text-green-800 hover:bg-white rounded-lg border border-gray-200 transition-colors">
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 cursor-pointer py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                New Poll
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            {(['active', 'closed'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 cursor-pointer py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === t ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'active' ? '🟢 Active' : '🔴 Closed'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Polls */}
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="space-y-2">
                    {[1,2,3].map(j => <div key={j} className="h-8 bg-gray-100 rounded-lg" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700">No {tab} polls</h3>
              <p className="text-sm text-gray-400 mt-1">
                {tab === 'active' ? 'Create the first poll for your community!' : 'No closed polls yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map(poll => (
                <PollCard key={poll.id} poll={poll} onVote={handleVote} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreatePollModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchPolls}
        />
      )}
    </MainLayout>
  )
}