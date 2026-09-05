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

function loadTelegramScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Telegram?.WebApp) {
      resolve(true)
      return
    }

    // Check if script tag already exists
    if (document.getElementById('telegram-web-app-script')) {
      // Wait for it to load
      const check = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          clearInterval(check)
          resolve(true)
        }
      }, 100)
      setTimeout(() => { clearInterval(check); resolve(false) }, 5000)
      return
    }

    const script = document.createElement('script')
    script.id = 'telegram-web-app-script'
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    script.onload = () => {
      const check = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          clearInterval(check)
          resolve(true)
        }
      }, 100)
      setTimeout(() => { clearInterval(check); resolve(false) }, 5000)
    }
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

export function TWAProvider({ children }: { children: ReactNode }) {
  const [isTWA, setIsTWA] = useState(false)
  const [user, setUser] = useState<TWAUser | null>(null)
  const [initData, setInitData] = useState<string | null>(null)
  const [themeParams, setThemeParams] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const loaded = await loadTelegramScript()
      if (cancelled || !loaded) return

      const tg = (window as any).Telegram?.WebApp
      if (!tg) return

      setIsTWA(true)

      try {
        tg.ready()
        tg.expand()
      } catch {}

      setInitData(tg.initData || '')

      if (tg.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user
        setUser({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          username: u.username,
          phone_number: u.phone_number || undefined,
        })
      }

      if (tg.themeParams) {
        setThemeParams(tg.themeParams as Record<string, string>)
      }

      tg.onEvent?.('themeChanged', () => {
        if (tg.themeParams) {
          setThemeParams({ ...tg.themeParams } as Record<string, string>)
        }
      })
    }

    init()
    return () => { cancelled = true }
  }, [])

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
    const tg = (window as any).Telegram?.WebApp
    if (!tg) return null
    try {
      const result = await tg.requestContact()
      if (result?.responseUnsafe?.contact?.phone_number) {
        const phone = result.responseUnsafe.contact.phone_number
        setUser((prev) => prev ? { ...prev, phone_number: phone } : prev)
        return phone
      }
      return null
    } catch {
      return null
    }
  }, [])

  const ready = () => { (window as any).Telegram?.WebApp?.ready() }
  const close = () => { (window as any).Telegram?.WebApp?.close() }

  return (
    <TWAContext.Provider value={{ isTWA, user, initData, themeParams, ready, close, requestContact }}>
      {children}
    </TWAContext.Provider>
  )
}

export function useTWA() {
  return useContext(TWAContext)
}
