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

function getTelegramWebApp(): any {
  if (typeof window === 'undefined') return null
  // Try direct access
  if ((window as any).Telegram?.WebApp) return (window as any).Telegram.WebApp
  // Try SDK
  try {
    const sdk = require('@telegram-apps/sdk')
    if (sdk?.init && sdk?.webApp) return sdk.webApp
  } catch {}
  return null
}

export function TWAProvider({ children }: { children: ReactNode }) {
  const [isTWA, setIsTWA] = useState(false)
  const [user, setUser] = useState<TWAUser | null>(null)
  const [initData, setInitData] = useState<string | null>(null)
  const [themeParams, setThemeParams] = useState<Record<string, string> | null>(null)
  const [debug, setDebug] = useState<string>('loading...')

  useEffect(() => {
    const check = () => {
      const tg = getTelegramWebApp()
      if (!tg) {
        setDebug('no Telegram.WebApp')
        return false
      }

      setDebug('WebApp found!')

      try {
        tg.ready()
        tg.expand()
      } catch (e) {
        setDebug('ready/expand failed: ' + String(e))
      }

      setIsTWA(true)
      setInitData(tg.initData || 'empty')

      if (tg.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user
        setDebug('user: ' + u.first_name)
        setUser({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          username: u.username,
          phone_number: u.phone_number || undefined,
        })
      } else {
        setDebug('no user. keys: ' + Object.keys(tg.initDataUnsafe || {}).join(','))
      }

      if (tg.themeParams) {
        setThemeParams(tg.themeParams as Record<string, string>)
      }

      return true
    }

    // Try immediately
    if (check()) return

    // Retry every 500ms for 5 seconds
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (check() || attempts >= 10) {
        clearInterval(interval)
        if (attempts >= 10 && !isTWA) {
          setDebug('timeout — no Telegram after 5s')
        }
      }
    }, 500)

    return () => clearInterval(interval)
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
    const tg = getTelegramWebApp()
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
    getTelegramWebApp()?.ready()
  }

  const close = () => {
    getTelegramWebApp()?.close()
  }

  return (
    <TWAContext.Provider value={{ isTWA, user, initData, themeParams, ready, close, requestContact }}>
      {children}
      {/* Debug overlay — always visible */}
      <div className="fixed bottom-2 right-2 z-[200] rounded-lg bg-black/90 p-3 text-[11px] text-white/80 font-mono max-w-[250px] shadow-lg border border-white/20">
        <div className="font-bold mb-1 text-white">TWA Debug</div>
        <div>State: {debug}</div>
        <div>isTWA: {isTWA ? 'YES' : 'NO'}</div>
        <div>User: {user ? user.first_name : 'none'}</div>
        <div>ID: {user?.id || '—'}</div>
      </div>
    </TWAContext.Provider>
  )
}

export function useTWA() {
  return useContext(TWAContext)
}
