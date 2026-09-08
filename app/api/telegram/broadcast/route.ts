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
