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

async function sendTelegramMessage(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID not configured')
    return
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })
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

🔗 <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.by'}/admin/bookings/${booking.id}">Открыть в админке</a>
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

🔗 <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.by'}/admin/bookings/${booking.id}">Открыть в админке</a>
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
    const { type, booking } = body

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
