import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { reminder24h, reminder1h } from '@/lib/telegram/messages'
import type { BookingData } from '@/lib/telegram/messages'

interface BookingWithTelegram extends BookingData {
  telegram_user_id: number | null
}

function getTomorrowDateStr(): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const y = tomorrow.getFullYear()
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const d = String(tomorrow.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getTodayDateStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getNextHourStr(): string {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(nextHour.getHours() + 1)
  const h = String(nextHour.getHours()).padStart(2, '0')
  return `${h}:00`
}

function formatLocalDateTime(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00`
}

async function sendReminder(
  booking: BookingWithTelegram,
  messageFn: (b: BookingData) => string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken || !booking.telegram_user_id) return false

  const text = messageFn(booking)
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
      console.error(`[CRON] Reminder failed for user ${booking.telegram_user_id}:`, data.description)
      return false
    }
    return true
  } catch (e) {
    console.error(`[CRON] Reminder error for user ${booking.telegram_user_id}:`, e)
    return false
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results: { reminders24h: number; reminders1h: number } = { reminders24h: 0, reminders1h: 0 }

  const tomorrow = getTomorrowDateStr()
  const today = getTodayDateStr()
  const nextHour = getNextHourStr()
  const nextHourTime = formatLocalDateTime(today, nextHour)

  console.log(`[CRON] Checking reminders for tomorrow=${tomorrow}, nextHour=${nextHourTime}`)

  // 24h reminders: bookings tomorrow
  try {
    const { data: bookings24h, error: error24h } = await supabase
      .from('bookings')
      .select('id, name, phone, car, service, booking_date, booking_time, comment, status, telegram_user_id')
      .eq('booking_date', tomorrow)
      .eq('status', 'confirmed')
      .not('telegram_user_id', 'is', null)

    if (error24h) {
      console.error('[CRON] Error fetching 24h bookings:', error24h)
    } else if (bookings24h) {
      console.log(`[CRON] Found ${bookings24h.length} bookings for 24h reminder`)
      for (const booking of bookings24h) {
        const sent = await sendReminder(booking as BookingWithTelegram, reminder24h)
        if (sent) results.reminders24h++
      }
    }
  } catch (e) {
    console.error('[CRON] 24h reminder batch error:', e)
  }

  // 1h reminders: bookings in the next hour today
  try {
    const { data: bookings1h, error: error1h } = await supabase
      .from('bookings')
      .select('id, name, phone, car, service, booking_date, booking_time, comment, status, telegram_user_id')
      .eq('booking_date', today)
      .eq('booking_time', `${nextHour}:00`)
      .eq('status', 'confirmed')
      .not('telegram_user_id', 'is', null)

    if (error1h) {
      console.error('[CRON] Error fetching 1h bookings:', error1h)
    } else if (bookings1h) {
      console.log(`[CRON] Found ${bookings1h.length} bookings for 1h reminder`)
      for (const booking of bookings1h) {
        const sent = await sendReminder(booking as BookingWithTelegram, reminder1h)
        if (sent) results.reminders1h++
      }
    }
  } catch (e) {
    console.error('[CRON] 1h reminder batch error:', e)
  }

  console.log(`[CRON] Sent ${results.reminders24h} 24h reminders, ${results.reminders1h} 1h reminders`)

  return NextResponse.json({
    success: true,
    sent: results,
  })
}
