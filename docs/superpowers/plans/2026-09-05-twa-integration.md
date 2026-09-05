# Telegram Web App Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn AutoTint into a full Telegram Web App — auto-fill user data, validate initData, adapt theme, send bookings with `source: 'twa'`.

**Architecture:** Detect TWA context via `window.Telegram?.WebApp`, validate `initData` on backend, auto-fill form fields from Telegram user profile, adapt CSS theme to match Telegram's colors.

**Tech Stack:** `@telegram-apps/sdk` (React), Next.js App Router, crypto (Node.js built-in for HMAC validation)

**Spec:** N/A (design approved in chat)

## Global Constraints

- Domain: `autotint.vercel.app`
- Bot token already exists: `TELEGRAM_BOT_TOKEN` in `.env.local`
- Existing booking flow must continue working for web users
- TWA detection is non-invasive — site works identically outside Telegram

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add `@telegram-apps/sdk` |
| `components/site/twa-context.tsx` | Create | TWA detection, SDK init, user data |
| `app/api/twa/validate/route.ts` | Create | Validate initData HMAC signature |
| `app/api/bookings/route.ts` | Modify | Accept `source` and `telegram_user_id` fields |
| `components/site/booking-widget.tsx` | Modify | Auto-fill from TWA user, send source |
| `app/layout.tsx` | Modify | Wrap with TWAProvider |

---

### Task 1: Install Telegram SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install package**

Run: `pnpm add @telegram-apps/sdk`

- [ ] **Step 2: Verify install**

Run: `pnpm build`
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install @telegram-apps/sdk"
```

---

### Task 2: TWA Context Provider

**Files:**
- Create: `components/site/twa-context.tsx`

- [ ] **Step 1: Create TWA context**

Create `components/site/twa-context.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add components/site/twa-context.tsx
git commit -m "feat: TWA context — detect Telegram, extract user, theme"
```

---

### Task 3: initData Validation Endpoint

**Files:**
- Create: `app/api/twa/validate/route.ts`

- [ ] **Step 1: Create validation endpoint**

Create `app/api/twa/validate/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

function validateInitData(initData: string, botToken: string): boolean {
  const data = Object.fromEntries(new URLSearchParams(initData))
  const hash = data.hash
  if (!hash) return false

  // Remove hash from data for verification
  const { hash: _, ...rest } = data

  // Sort and build check string
  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('\n')

  // Compute HMAC-SHA256
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hmac = createHmac('sha256', secret).update(checkString).digest('hex')

  return hmac === hash
}

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { initData } = body

    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 })
    }

    const valid = validateInitData(initData, BOT_TOKEN)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid initData' }, { status: 403 })
    }

    // Parse user from initData
    const data = Object.fromEntries(new URLSearchParams(initData))
    const userRaw = data.user
    if (!userRaw) {
      return NextResponse.json({ error: 'No user in initData' }, { status: 400 })
    }

    const user = JSON.parse(userRaw)

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        phone_number: user.phone_number || null,
      },
    })
  } catch (e) {
    console.error('[TWA Validate]', e)
    return NextResponse.json({ error: 'Validation error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add app/api/twa/validate/route.ts
git commit -m "feat: TWA initData validation endpoint (HMAC-SHA256)"
```

---

### Task 4: Modify Booking API for TWA Source

**Files:**
- Modify: `app/api/bookings/route.ts`

- [ ] **Step 1: Add source and telegram_user_id to POST handler**

In `app/api/bookings/route.ts`, line 8, add `source` and `telegram_user_id` to the destructured body:

```ts
const { name, phone, car, service, booking_date, booking_time, comment, type, source, telegram_user_id } = body
```

In the `insert` call (line 44), add the new fields:

```ts
.insert({
  name,
  phone,
  car,
  service,
  booking_date: booking_date || null,
  booking_time: booking_time || null,
  comment: comment || null,
  status: 'pending',
  source: source || 'web',
  telegram_user_id: telegram_user_id || null,
})
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add app/api/bookings/route.ts
git commit -m "feat: bookings API — accept source and telegram_user_id"
```

---

### Task 5: Modify Booking Widget for TWA Auto-fill

**Files:**
- Modify: `components/site/booking-widget.tsx`

- [ ] **Step 1: Import useTWA and auto-fill on mount**

At the top of `booking-widget.tsx`, add import:

```tsx
import { useTWA } from './twa-context'
```

Inside `BookingWidget` component, after the existing state declarations, add:

```tsx
const { isTWA, user, initData, close: closeTWA } = useTWA()
```

After the `const phoneInputRef` line, add auto-fill effect:

```tsx
// Auto-fill from TWA user data
useEffect(() => {
  if (isTWA && user) {
    const name = user.first_name || ''
    setFormData((prev) => ({ ...prev, name }))
  }
}, [isTWA, user])
```

Add `useEffect` to the imports from 'react' (line 1).

- [ ] **Step 2: Modify handleSubmit to send TWA data**

In the `handleSubmit` function, update the `body` of the fetch call:

```tsx
body: JSON.stringify({
  name: formData.name,
  phone: formData.phone,
  car: formData.car,
  service: formData.service,
  booking_date: `${selectedDay.date.getFullYear()}-${String(selectedDay.date.getMonth() + 1).padStart(2, '0')}-${String(selectedDay.date.getDate()).padStart(2, '0')}`,
  booking_time: selectedSlot.time,
  comment: formData.comment || null,
  source: isTWA ? 'twa' : 'web',
  telegram_user_id: user?.id || null,
}),
```

- [ ] **Step 3: Handle TWA close button**

In the close button click handler (line 243), add TWA close:

```tsx
onClick={() => {
  if (isTWA) {
    closeTWA()
  } else {
    closeBooking()
  }
}}
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: Build passes.

- [ ] **Step 5: Commit**

```bash
git add components/site/booking-widget.tsx
git commit -m "feat: booking widget — TWA auto-fill name, send source + telegram_user_id"
```

---

### Task 6: Theme Adaptation

**Files:**
- Modify: `components/site/twa-context.tsx`

- [ ] **Step 1: Add theme CSS variables to TWAProvider**

In `twa-context.tsx`, add a useEffect that applies theme params as CSS variables:

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add components/site/twa-context.tsx
git commit -m "feat: TWA theme adaptation — CSS variables from Telegram themeParams"
```

---

### Task 7: Layout Integration

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add TWAProvider to layout**

In `app/layout.tsx`, import and wrap with TWAProvider:

```tsx
import { TWAProvider } from '@/components/site/twa-context'
```

Wrap children with TWAProvider (inside BookingProvider):

```tsx
<BookingProvider>
  <TWAProvider>{children}</TWAProvider>
</BookingProvider>
```

- [ ] **Step 2: Verify full build**

Run: `pnpm build`
Expected: Build passes. All pages render.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap app with TWAProvider"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Full build test**

Run: `pnpm build`
Expected: Clean build.

- [ ] **Step 2: BotFather configuration (manual)**

After deploy, configure the bot via BotFather:

1. Open @BotFather in Telegram
2. Send `/mybots` → select the AutoTint bot
3. Send `/setmenubutton` → select the bot → set URL: `https://autotint.vercel.app`
4. Or use `/newapp` to create a Web App button with title "Записаться на тонировку"

- [ ] **Step 3: Test in Telegram**

1. Open the bot in Telegram
2. Press the menu button
3. Verify the site opens in WebView
4. Verify name is auto-filled
5. Verify theme matches Telegram
6. Complete a booking
7. Verify booking appears in admin with `source: 'twa'`

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: TWA adjustments from testing"
```
