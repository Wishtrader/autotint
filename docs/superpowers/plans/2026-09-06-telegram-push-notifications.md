# Telegram Push Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Telegram-based push notifications: booking reminders (24h/1h), confirmation/cancellation messages, and admin promo broadcasts.

**Architecture:** 
- `telegram_users` table stores users who `/start`'d the bot
- Vercel Cron Job runs every hour, checks upcoming bookings, sends reminders
- Admin broadcast page for promo messages to all registered users
- Enhanced message templates for all notification types

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL), Vercel Cron, Telegram Bot API

**Spec:** User requested: reminders 24h/1h before appointment, confirmation/cancellation, promo broadcasts

## Global Constraints

- Telegram Bot Token stored in `TELEGRAM_BOT_TOKEN` env var
- Supabase admin client via `lib/supabase/admin.ts` (bypasses RLS)
- All API routes under `app/api/`
- Admin pages under `app/admin/` with auth middleware
- Message format: HTML parse_mode for Telegram

## File Structure

| File | Purpose |
|---|---|
| `app/api/cron/reminders/route.ts` | Cron endpoint — sends 24h/1h reminders |
| `app/api/telegram/broadcast/route.ts` | Admin promo broadcast endpoint |
| `app/api/telegram/webhook/route.ts` | Webhook for /start and button callbacks |
| `app/admin/broadcast/page.tsx` | Admin UI for promo broadcasts |
| `app/admin/layout.tsx` | Add broadcast nav link |
| `lib/telegram/messages.ts` | Message templates (reminders, confirmations, promos) |
| `vercel.json` | Cron schedule config |

---

### Task 1: Create telegram_users table via Supabase SQL

The table stores users who have started the bot, so we can send them notifications.

- [ ] **Step 1: Create SQL migration file**

Create `supabase/migrations/20260906_add_telegram_users.sql`:

```sql
CREATE TABLE IF NOT EXISTS telegram_users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  phone TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON telegram_users(telegram_id);

-- Add telegram_user_id to bookings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'telegram_user_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN telegram_user_id BIGINT;
  END IF;
END $$;
```

- [ ] **Step 2: Run migration in Supabase Dashboard**

Go to Supabase Dashboard → SQL Editor → paste the SQL → Run.

Verify: `SELECT * FROM telegram_users;` should return empty table.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260906_add_telegram_users.sql
git commit -m "feat: add telegram_users table and telegram_user_id to bookings"
```

---

### Task 2: Create Telegram webhook for /start command

When user sends `/start` to the bot, save their info to `telegram_users` table.

- [ ] **Step 1: Create webhook route**

Create `app/api/telegram/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface TelegramMessage {
  message?: {
    from?: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
    }
    text?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramMessage = await request.json()

    if (!update.message?.from || !update.message?.text) {
      return NextResponse.json({ ok: true })
    }

    const { from, text } = update.message

    if (text === '/start') {
      const supabase = createAdminClient()

      const { error } = await supabase
        .from('telegram_users')
        .upsert({
          telegram_id: from.id,
          first_name: from.first_name || null,
          last_name: from.last_name || null,
          username: from.username || null,
          last_active_at: new Date().toISOString(),
        }, { onConflict: 'telegram_id' })

      if (error) {
        console.error('[WEBHOOK] Save user error:', error)
      }

      // Send welcome message
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: from.id,
            text: `Добро пожаловать в AutoTint! 🚗\n\nВы будете получать:\n• Напоминания о записях\n• Подтверждения записи\n• Информацию о акциях\n\nЗаписаться на тонировку: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'}`,
            parse_mode: 'HTML',
          }),
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[WEBHOOK] Error:', e)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
```

- [ ] **Step 2: Register webhook with Telegram**

Run in terminal:

```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://autotint.vercel.app/api/telegram/webhook"}'
```

Verify: `curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"` should show the URL.

- [ ] **Step 3: Commit**

```bash
git add app/api/telegram/webhook/route.ts
git commit -m "feat: Telegram webhook for /start command and user registration"
```

---

### Task 3: Create message templates library

Centralize all message formatting functions.

- [ ] **Step 1: Create message templates**

Create `lib/telegram/messages.ts`:

```typescript
export interface BookingData {
  id: string
  name: string
  phone: string
  car: string
  service: string
  booking_date: string | null
  booking_time: string | null
  comment: string | null
  status: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function reminder24h(booking: BookingData): string {
  const date = booking.booking_date ? formatDate(booking.booking_date) : 'не указана'
  return `
⏰ <b>Напоминание: завтра запись!</b>

📋 <b>Услуга:</b> ${booking.service}
🚗 <b>Авто:</b> ${booking.car}
📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${booking.booking_time || 'не указано'}

📍 <b>Адрес:</b> г. Гомель, ул. Широкая 4Б, блок 7, к.56
📞 <b>Телефон:</b> +375 (25) 653-33-33

Если нужно перенести запись, позвоните нам.
  `.trim()
}

export function reminder1h(booking: BookingData): string {
  const date = booking.booking_date ? formatDate(booking.booking_date) : 'не указана'
  return `
🔔 <b>Час до записи!</b>

📋 <b>Услуга:</b> ${booking.service}
🚗 <b>Авто:</b> ${booking.car}
📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${booking.booking_time || 'не указано'}

📍 <b>Адрес:</b> г. Гомель, ул. Широкая 4Б, блок 7, к.56

Ждём вас!
  `.trim()
}

export function bookingConfirmed(booking: BookingData): string {
  const date = booking.booking_date ? formatDate(booking.booking_date) : 'не указана'
  return `
✅ <b>Вы записаны на тонировку!</b>

📋 <b>Услуга:</b> ${booking.service}
🚗 <b>Авто:</b> ${booking.car}
📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${booking.booking_time || 'не указано'}

📍 <b>Адрес:</b> г. Гомель, ул. Широкая 4Б, блок 7, к.56
📞 <b>Телефон:</b> +375 (25) 653-33-33

Ждём вас!
  `.trim()
}

export function bookingCancelled(booking: BookingData): string {
  return `
❌ <b>Запись отменена</b>

📋 <b>Услуга:</b> ${booking.service}
🚗 <b>Авто:</b> ${booking.car}
📅 <b>Дата:</b> ${booking.booking_date ? formatDate(booking.booking_date) : 'не указана'}
⏰ <b>Время:</b> ${booking.booking_time || 'не указано'}

Если хотите записаться снова, перейдите на наш сайт:
<a href="${SITE_URL}">${SITE_URL}</a>
  `.trim()
}

export function promoMessage(title: string, text: string): string {
  return `
🎁 <b>${title}</b>

${text}

📍 г. Гомель, ул. Широкая 4Б, блок 7, к.56
📞 +375 (25) 653-33-33
<a href="${SITE_URL}">Записаться</a>
  `.trim()
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/telegram/messages.ts
git commit -m "feat: centralized Telegram message templates"
```

---

### Task 4: Update /api/telegram route to use new templates

Refactor existing Telegram route to use the new message library.

- [ ] **Step 1: Update app/api/telegram/route.ts**

Replace the `sendUserConfirmation` function and add import:

```typescript
import { bookingConfirmed, bookingCancelled } from '@/lib/telegram/messages'
```

Replace the `booking_confirmed` case:

```typescript
case 'booking_confirmed':
  if (telegram_user_id) {
    const text = bookingConfirmed(booking)
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegram_user_id,
          text,
          parse_mode: 'HTML',
        }),
      })
    }
  }
  return NextResponse.json({ success: true })
```

Add new case for `booking_cancelled`:

```typescript
case 'booking_cancelled':
  if (telegram_user_id) {
    const text = bookingCancelled(booking)
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegram_user_id,
          text,
          parse_mode: 'HTML',
        }),
      })
    }
  }
  return NextResponse.json({ success: true })
```

- [ ] **Step 2: Update booking detail page to send cancellation notification**

In `app/admin/bookings/[id]/page.tsx`, find the cancel handler and add:

```typescript
// After status change to cancelled
if (newStatus === 'cancelled' && booking.telegram_user_id) {
  await fetch(`${origin}/api/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'booking_cancelled',
      booking: { ...booking, status: 'cancelled' },
      telegram_user_id: booking.telegram_user_id,
    }),
  })
}
```

- [ ] **Step 3: Build and verify**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add app/api/telegram/route.ts app/admin/bookings/\[id\]/page.tsx
git commit -m "refactor: use message templates, add cancellation notification"
```

---

### Task 5: Create cron endpoint for reminders

Check upcoming bookings and send 24h/1h reminders.

- [ ] **Step 1: Create cron route**

Create `app/api/cron/reminders/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { reminder24h, reminder1h, type BookingData } from '@/lib/telegram/messages'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  let sent = 0

  try {
    // 24h reminders: bookings tomorrow with status 'confirmed'
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data: bookings24h } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', tomorrowStr)
      .eq('status', 'confirmed')
      .not('telegram_user_id', 'is', null)

    if (bookings24h) {
      for (const booking of bookings24h) {
        await sendReminder(booking as BookingData & { telegram_user_id: number }, '24h')
        sent++
      }
    }

    // 1h reminders: bookings today at current hour + 1
    const todayStr = now.toISOString().split('T')[0]
    const nextHour = String(now.getHours() + 1).padStart(2, '0') + ':00'

    const { data: bookings1h } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', todayStr)
      .eq('booking_time', nextHour)
      .eq('status', 'confirmed')
      .not('telegram_user_id', 'is', null)

    if (bookings1h) {
      for (const booking of bookings1h) {
        await sendReminder(booking as BookingData & { telegram_user_id: number }, '1h')
        sent++
      }
    }

    console.log(`[CRON] Reminders sent: ${sent}`)
    return NextResponse.json({ success: true, sent })
  } catch (e) {
    console.error('[CRON] Error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function sendReminder(
  booking: BookingData & { telegram_user_id: number },
  type: '24h' | '1h'
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return

  const text = type === '24h' ? reminder24h(booking) : reminder1h(booking)

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: booking.telegram_user_id,
        text,
        parse_mode: 'HTML',
      }),
    })
    const data = await res.json()
    if (!data.ok) {
      console.error(`[CRON] Reminder ${type} failed for user ${booking.telegram_user_id}:`, data.description)
    }
  } catch (e) {
    console.error(`[CRON] Reminder ${type} error:`, e)
  }
}
```

- [ ] **Step 2: Add CRON_SECRET to env**

Add `CRON_SECRET` to `.env.local` and Vercel Environment Variables.

Generate a secret:

```bash
openssl rand -hex 32
```

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/reminders/route.ts
git commit -m "feat: cron endpoint for 24h/1h booking reminders"
```

---

### Task 6: Configure Vercel Cron Schedule

- [ ] **Step 1: Create vercel.json**

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour at minute 0.

- [ ] **Step 2: Enable cron in Vercel Dashboard**

Go to Vercel Dashboard → your project → Settings → Crons → Enable.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: Vercel cron schedule for hourly reminders"
```

---

### Task 7: Create admin broadcast page

Admin UI to send promo messages to all registered Telegram users.

- [ ] **Step 1: Create broadcast API endpoint**

Create `app/api/telegram/broadcast/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { promoMessage } from '@/lib/telegram/messages'

export async function POST(request: NextRequest) {
  try {
    const { title, text } = await request.json()

    if (!title || !text) {
      return NextResponse.json(
        { error: 'Title and text required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      )
    }

    // Get all registered users
    const { data: users, error } = await supabase
      .from('telegram_users')
      .select('telegram_id')

    if (error || !users) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    const message = promoMessage(title, text)
    let sent = 0
    let failed = 0

    for (const user of users) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegram_id,
            text: message,
            parse_mode: 'HTML',
          }),
        })
        const data = await res.json()
        if (data.ok) {
          sent++
        } else {
          failed++
          console.error(`[BROADCAST] Failed for ${user.telegram_id}:`, data.description)
        }
      } catch {
        failed++
      }
    }

    console.log(`[BROADCAST] Sent: ${sent}, Failed: ${failed}`)
    return NextResponse.json({ success: true, sent, failed })
  } catch (e) {
    console.error('[BROADCAST] Error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create broadcast admin page**

Create `app/admin/broadcast/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function BroadcastPage() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent?: number; failed?: number; error?: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSend = async () => {
    if (!title.trim() || !text.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/telegram/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title, text }),
      })
      const data = await res.json()
      setResult(data)
      if (data.sent) {
        setTitle('')
        setText('')
      }
    } catch {
      setResult({ error: 'Ошибка отправки' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Рассылка в Telegram</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Скидка 20% на тонировку"
            className="w-full rounded-lg border border-border bg-background px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Текст сообщения</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Текст промо-сообщения..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2 resize-none"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading || !title.trim() || !text.trim()}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Отправка...' : 'Отправить рассылку'}
        </button>

        {result && (
          <div className={`rounded-lg p-4 ${result.error ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {result.error
              ? result.error
              : `Отправлено: ${result.sent}, Ошибок: ${result.failed}`}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add broadcast link to admin sidebar**

In `app/admin/layout.tsx`, add to the nav items array:

```typescript
{ label: 'Рассылка', href: '/admin/broadcast', icon: '📢' }
```

- [ ] **Step 4: Add noindex meta**

Add to the page:

```tsx
export const metadata = {
  title: 'Рассылка | AutoTint Admin',
  robots: { index: false, follow: false },
}
```

- [ ] **Step 5: Build and verify**

```bash
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add app/api/telegram/broadcast/route.ts app/admin/broadcast/page.tsx app/admin/layout.tsx
git commit -m "feat: admin promo broadcast page for Telegram"
```

---

### Task 8: Wire up telegram_user_id in booking flow

Ensure `telegram_user_id` is passed from booking widget through API to database.

- [ ] **Step 1: Verify booking widget sends telegram_user_id**

Check `components/site/booking-widget.tsx` — it should already pass `telegram_user_id` from TWA context. Verify:

```typescript
const { user } = useTWA()
// In form submission:
telegram_user_id: user?.id,
```

- [ ] **Step 2: Verify bookings API saves telegram_user_id**

Check `app/api/bookings/route.ts` — it should destructure and save `telegram_user_id`.

- [ ] **Step 3: Verify admin detail page shows telegram_user_id**

Check `app/admin/bookings/[id]/page.tsx` — it should display if the user came from Telegram.

- [ ] **Step 4: Commit if any changes needed**

```bash
git add -A
git commit -m "chore: verify telegram_user_id flows through booking pipeline"
```

---

### Task 9: End-to-end testing

- [ ] **Step 1: Test /start webhook**

Send `/start` to @autotint_booking_bot in Telegram. Check `telegram_users` table in Supabase — user should appear.

- [ ] **Step 2: Test booking with TWA**

Open Web App in Telegram → make a booking → verify `telegram_user_id` is saved in booking.

- [ ] **Step 3: Test cron manually**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://autotint.vercel.app/api/cron/reminders
```

Should return `{ "success": true, "sent": 0 }` (no upcoming bookings yet).

- [ ] **Step 4: Test broadcast**

Go to `/admin/broadcast` → send a test message → verify all registered users receive it.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verify push notification system end-to-end"
```
