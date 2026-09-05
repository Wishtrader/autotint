'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

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
  requestContact: () => Promise<string | null>
}

const TWAContext = createContext<TWAContextType>({
  isTWA: false,
  user: null,
  initData: null,
  themeParams: null,
  ready: () => {},
  close: () => {},
  requestContact: async () => null,
})

export function TWAProvider({ children }: { children: ReactNode }) {
  const [isTWA, setIsTWA] = useState(false)
  const [user, setUser] = useState<TWAUser | null>(null)
  const [initData, setInitData] = useState<string | null>(null)
  const [themeParams, setThemeParams] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) {
      console.log('[TWA] No Telegram WebApp found')
      return
    }

    console.log('[TWA] Telegram WebApp detected', {
      initData: !!tg.initData,
      initDataUnsafe: tg.initDataUnsafe,
      user: tg.initDataUnsafe?.user,
      themeParams: tg.themeParams,
    })

    setIsTWA(true)
    tg.ready()
    tg.expand()

    // Extract initData
    setInitData(tg.initData || null)

    // Extract user from init data
    if (tg.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user
      console.log('[TWA] User found:', u)
      setUser({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        username: u.username,
        phone_number: u.phone_number || undefined,
      })
    } else {
      console.log('[TWA] No user in initDataUnsafe')
      // Try to get user from URL params (some TWA versions)
      const params = new URLSearchParams(window.location.search)
      const userParam = params.get('user')
      if (userParam) {
        try {
          const u = JSON.parse(userParam)
          console.log('[TWA] User from URL params:', u)
          setUser({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            username: u.username,
          })
        } catch {}
      }
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

  const requestContact = useCallback(async (): Promise<string | null> => {
    const tg = window.Telegram?.WebApp
    if (!tg) return null

    try {
      const result = await tg.requestContact()
      if (result && typeof result === 'object' && 'responseUnsafe' in result) {
        const response = (result as { responseUnsafe?: { contact?: { phone_number?: string } } }).responseUnsafe
        const phone = response?.contact?.phone_number
        if (phone) {
          setUser((prev) => prev ? { ...prev, phone_number: phone } : prev)
          return phone
        }
      }
      return null
    } catch {
      return null
    }
  }, [])

  const ready = () => {
    window.Telegram?.WebApp?.ready()
  }

  const close = () => {
    window.Telegram?.WebApp?.close()
  }

  return (
    <TWAContext.Provider value={{ isTWA, user, initData, themeParams, ready, close, requestContact }}>
      {children}
      {isTWA && (
        <div className="fixed bottom-2 right-2 z-[200] rounded-lg bg-black/80 p-2 text-[10px] text-white/70 font-mono max-w-[200px]">
          <div>TWA: {isTWA ? 'YES' : 'NO'}</div>
          <div>User: {user ? user.first_name : 'NONE'}</div>
          <div>ID: {user?.id || '—'}</div>
          <div>Phone: {user?.phone_number || '—'}</div>
        </div>
      )}
    </TWAContext.Provider>
  )
}

export function useTWA() {
  return useContext(TWAContext)
}
