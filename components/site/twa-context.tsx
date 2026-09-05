'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface TWAUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  phone_number?: string
}

interface TWAContextType {
  isTWA: boolean
  user: TWAUser | null
  initData: string | null
  themeParams: Record<string, string> | null
  ready: () => void
  close: () => void
}

const TWAContext = createContext<TWAContextType>({
  isTWA: false,
  user: null,
  initData: null,
  themeParams: null,
  ready: () => {},
  close: () => {},
})

export function TWAProvider({ children }: { children: ReactNode }) {
  const [isTWA, setIsTWA] = useState(false)
  const [user, setUser] = useState<TWAUser | null>(null)
  const [initData, setInitData] = useState<string | null>(null)
  const [themeParams, setThemeParams] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    setIsTWA(true)
    tg.ready()
    tg.expand()

    // Extract initData
    setInitData(tg.initData || null)

    // Extract user from init data
    if (tg.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user
      setUser({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        username: u.username,
      })
    }

    // Extract theme params
    if (tg.themeParams) {
      setThemeParams(tg.themeParams as Record<string, string>)
    }

    // Listen for theme changes
    tg.onEvent('themeChanged', () => {
      if (tg.themeParams) {
        setThemeParams({ ...tg.themeParams } as Record<string, string>)
      }
    })
  }, [])

  // Apply Telegram theme as CSS variables
  useEffect(() => {
    if (!themeParams) return
    const root = document.documentElement
    if (themeParams.bg_color) root.style.setProperty('--twa-bg', themeParams.bg_color)
    if (themeParams.text_color) root.style.setProperty('--twa-text', themeParams.text_color)
    if (themeParams.hint_color) root.style.setProperty('--twa-hint', themeParams.hint_color)
    if (themeParams.button_color) root.style.setProperty('--twa-button', themeParams.button_color)
    if (themeParams.button_text_color) root.style.setProperty('--twa-button-text', themeParams.button_text_color)
    if (themeParams.secondary_bg_color) root.style.setProperty('--twa-secondary-bg', themeParams.secondary_bg_color)
  }, [themeParams])

  const ready = () => {
    window.Telegram?.WebApp?.ready()
  }

  const close = () => {
    window.Telegram?.WebApp?.close()
  }

  return (
    <TWAContext.Provider value={{ isTWA, user, initData, themeParams, ready, close }}>
      {children}
    </TWAContext.Provider>
  )
}

export function useTWA() {
  return useContext(TWAContext)
}
