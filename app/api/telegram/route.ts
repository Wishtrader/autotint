import { NextRequest, NextResponse } from 'next/server'

interface Booking {
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

async function sendTelegramMessage(text: string, chatId?: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID

  if (!botToken || !targetChatId) {
    console.error('Telegram bot token or chat ID not configured')
    return
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: targetChatId,
      text,
      parse_mode: 'HTML',
    }),
  })
}

async function sendUserConfirmation(telegramUserId: number, booking: Booking) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return

  const date = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Не указана'

  const time = booking.booking_time || 'Не указано'

  const text = `
✅ <b>Вы записаны на тонировку!</b>

📋 <b>Услуга:</b> ${booking.service}
🚗 <b>Авто:</b> ${booking.car}
📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${time}

📍 <b>Адрес:</b> г. Гомель, ул. Широкая 4Б, блок 7, к.56
📞 <b>Телефон:</b> +375 (25) 653-33-33

Ждём вас! Если нужно перенести запись, позвоните нам.
  `.trim()

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramUserId,
        text,
        parse_mode: 'HTML',
      }),
    })
    const data = await res.json()
    if (!data.ok) {
      console.error('[TWA] User confirmation failed:', data.description)
    }
  } catch (e) {
    console.error('[TWA] User confirmation error:', e)
  }
}

function formatBookingMessage(booking: Booking): string {
  const date = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Не указана'

  const time = booking.booking_time || 'Не указано'

  return `
🔔 <b>Новая заявка на тонировку</b>

👤 <b>Имя:</b> ${booking.name}
📞 <b>Телефон:</b> ${booking.phone}
🚗 <b>Авто:</b> ${booking.car}
📋 <b>Услуга:</b> ${booking.service}
📅 <b>Дата:</b> ${date}, ${time}
${booking.comment ? `💬 <b>Комментарий:</b> ${booking.comment}` : ''}

🔗 <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'}/admin/bookings/${booking.id}">Открыть в админке</a>
  `.trim()
}

function formatInquiryMessage(booking: Booking): string {
  return `
📩 <b>Новая заявка (запрос цены)</b>

👤 <b>Имя:</b> ${booking.name}
📞 <b>Телефон:</b> ${booking.phone}
🚗 <b>Авто:</b> ${booking.car}
📋 <b>Услуга:</b> ${booking.service}
${booking.comment ? `💬 <b>Комментарий:</b> ${booking.comment}` : ''}

🔗 <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'}/admin/bookings/${booking.id}">Открыть в админке</a>
  `.trim()
}

function formatStatusMessage(booking: Booking): string {
  const statusLabels: Record<string, string> = {
    confirmed: '✅ Подтверждена',
    completed: '✔️ Выполнена',
    cancelled: '❌ Отменена',
  }

  const date = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      })
    : 'Не указана'

  return `
${statusLabels[booking.status] || booking.status}

👤 ${booking.name}
🚗 ${booking.car}
📅 ${date}, ${booking.booking_time || '—'}
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, booking, telegram_user_id } = body

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking data required' },
        { status: 400 }
      )
    }

    let message: string

    switch (type) {
      case 'new_booking':
        message = formatBookingMessage(booking)
        break
      case 'new_inquiry':
        message = formatInquiryMessage(booking)
        break
      case 'status_changed':
        message = formatStatusMessage(booking)
        break
      case 'booking_confirmed':
        if (telegram_user_id) {
          await sendUserConfirmation(telegram_user_id, booking)
        }
        return NextResponse.json({ success: true })
      default:
        return NextResponse.json(
          { error: 'Unknown notification type' },
          { status: 400 }
        )
    }

    await sendTelegramMessage(message)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
