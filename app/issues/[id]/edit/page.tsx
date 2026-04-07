'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'
import InputField from '@/components/UI/forms/InputField'
import SelectField from '@/components/UI/forms/SelectField'
import { toast } from 'sonner'
import Loading from '@/app/loading'
import { ArrowLeftIcon } from '@/components/UI/icons'

export default function EditIssuePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const userRole = searchParams.get('role') || user?.role || null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: '',
  })

  const categories = [
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'safety', label: 'Safety' },
    { value: 'environment', label: 'Environment' },
    { value: 'public_services', label: 'Public Services' },
    { value: 'other', label: 'Other' },
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ]

  useEffect(() => {
    if (id) fetchIssue()
  }, [id])

  const fetchIssue = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/issues/${id}`)
      const issue = response.data?.data ?? response.data
      
      // Check if current user is the reporter
      if (user?.id !== issue.reporterId) {
        toast.error('You are not authorized to edit this issue')
        router.back()
        return
      }

      setFormData({
        title: issue.title || '',
        description: issue.description || '',
        category: issue.category || '',
        priority: issue.priority || '',
        location: issue.location || '',
      })
    } catch (err: any) {
      toast.error('Failed to load issue')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      await apiClient.put(`/issues/${id}`, formData)
      toast.success('Issue updated successfully!')
      router.push(`/issues/${id}?role=${userRole}`)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update issue')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <MainLayout role={userRole}>
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Edit Issue</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
            
            <InputField
              label="Issue Title"
              value={formData.title}
              onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              placeholder="Briefly describe the issue"
              required
              showPasswordToggle={false}
            />

            <InputField
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Provide detailed information about the issue..."
              required
              showPasswordToggle={false}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SelectField
                label="Category"
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                options={categories}
                placeholder="Select a category"
                required
              />
              <SelectField
                label="Priority"
                value={formData.priority}
                onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                options={priorities}
                placeholder="Select priority"
                required
              />
            </div>

            <InputField
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              placeholder="e.g., Main Street, Central Park, etc."
              required
              showPasswordToggle={false}
            />

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}