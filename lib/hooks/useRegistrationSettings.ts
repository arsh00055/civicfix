'use client'

import { useState, useEffect } from 'react'
import apiClient from '../services/api/client'

interface RegistrationSettings {
  allowCitizenRegistration: boolean
  allowVolunteerRegistration: boolean
  supportEmail: string
}
let cachedSettings: RegistrationSettings | null = null
let fetchPromise: Promise<RegistrationSettings> | null = null

async function loadSettings(): Promise<RegistrationSettings> {
  if (cachedSettings) return cachedSettings

  if (!fetchPromise) {
    fetchPromise = apiClient
      .get('/admin/settings')
      .then(res => {
        const s = res.data?.data
        cachedSettings = {
          allowCitizenRegistration:   s?.allowCitizenRegistration  !== false,
          allowVolunteerRegistration: s?.allowVolunteerRegistration !== false,
          supportEmail:               s?.supportEmail || 'support@civicfix.com',
        }
        return cachedSettings
      })
      .catch(() => {
        fetchPromise = null
        return {
          allowCitizenRegistration:   true,
          allowVolunteerRegistration: true,
          supportEmail:               'support@civicfix.com',
        }
      })
  }

  return fetchPromise
}

export function useRegistrationSettings() {
  const [settings, setSettings] = useState<RegistrationSettings | null>(
    cachedSettings
  )
  const [loading, setLoading] = useState(cachedSettings === null)

  useEffect(() => {
    if (cachedSettings) return
    let cancelled = false
    loadSettings().then(s => {
      if (!cancelled) {
        setSettings(s)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { settings, loading }
}