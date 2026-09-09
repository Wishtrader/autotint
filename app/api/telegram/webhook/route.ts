import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface TelegramMessage {
  message?: {
    from: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
    }
    text?: string
  }
}

function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return

  return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: TelegramMessage = await request.json()

    if (!body.message) {
      return NextResponse.json({ ok: true })
    }

    const { from, text } = body.message
    const supabase = createAdminClient()

    if (text === '/start') {
      const { error } = await supabase.from('telegram_users').upsert(
        {
          telegram_id: from.id,
          first_name: from.first_name || null,
          last_name: from.last_name || null,
          username: from.username || null,
        },
        { onConflict: 'telegram_id' }
      )

      if (error) {
        console.error('[TG WEBHOOK] Upsert error:', error)
      }

      const welcome = [
        '<b>Welcome to AutoTint!</b>',
        '',
        'You\'re now subscribed to tinting reminders, exclusive promos, and service updates.',
        '',
        `🔗 <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'}">Visit our website</a>`,
      ].join('\n')

      await sendTelegramMessage(from.id, welcome)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
// trigger deploy
