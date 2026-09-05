interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      phone_number?: string
    }
  }
  themeParams: Record<string, string>
  ready: () => void
  expand: () => void
  close: () => void
  onEvent: (eventType: string, callback: () => void) => void
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}
