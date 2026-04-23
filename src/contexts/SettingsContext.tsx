import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface SettingsContextType {
  settings: Record<string, string>
  loading: boolean
  getSetting: (key: string, defaultValue?: string) => string
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*')
    const map: Record<string, string> = {}
    for (const s of data || []) map[s.key] = s.value
    setSettings(map)
    setLoading(false)
  }

  useEffect(() => {
    fetchSettings()
    
    // Subscribe to changes
    const channel = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchSettings()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getSetting = (key: string, defaultValue = '') => {
    return settings[key] || defaultValue
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, getSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
