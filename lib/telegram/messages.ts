import { company } from '../site-config'

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function bookingLink(id: string): string {
  return `<a href="${siteUrl}/bookings/${id}">Посмотреть запись</a>`
}

export function reminder24h(booking: BookingData): string {
  const date = booking.booking_date ? formatDate(booking.booking_date) : 'не указана'
  const time = booking.booking_time || 'не указано'

  return [
    `⏰ <b>Напоминание: запись завтра</b>`,
    ``,
    `Здравствуйте, <b>${escapeHtml(booking.name)}</b>!`,
    ``,
    `Напоминаем вашу запись на завтра:`,
    `📅 <b>${date}</b> в <b>${escapeHtml(time)}</b>`,
    ``,
    `🚗 Авто: ${escapeHtml(booking.car)}`,
    `🔧 Услуга: ${escapeHtml(booking.service)}`,
    ``,
    `📍 <b>Адрес:</b> ${company.fullAddress}`,
    `📞 <b>Телефон:</b> ${company.phone}`,
    ``,
    `Если нужно перенести запись, свяжитесь с нами как можно раньше.`,
    ``,
    `Ждём вас! 🙌`,
    ``,
    bookingLink(booking.id),
  ].join('\n')
}

export function reminder1h(booking: BookingData): string {
  const time = booking.booking_time || 'не указано'

  return [
    `⏰ <b>Напоминание: через час</b>`,
    ``,
    `Здравствуйте, <b>${escapeHtml(booking.name)}</b>!`,
    ``,
    `Ваша запись уже через час!`,
    `🔧 <b>${escapeHtml(booking.service)}</b>`,
    `🚗 Авто: ${escapeHtml(booking.car)}`,
    `🕐 Время: <b>${escapeHtml(time)}</b>`,
    ``,
    `📍 <b>Адрес:</b> ${company.fullAddress}`,
    `📞 <b>Телефон:</b> ${company.phone}`,
    ``,
    `Будем рады видеть вас!`,
    ``,
    bookingLink(booking.id),
  ].join('\n')
}

export function bookingConfirmed(booking: BookingData): string {
  const date = booking.booking_date ? formatDate(booking.booking_date) : 'не указана'
  const time = booking.booking_time || 'не указано'

  return [
    `✅ <b>Запись подтверждена</b>`,
    ``,
    `Здравствуйте, <b>${escapeHtml(booking.name)}</b>!`,
    ``,
    `Ваша запись успешно подтверждена:`,
    ``,
    `📅 Дата: <b>${date}</b>`,
    `🕐 Время: <b>${escapeHtml(time)}</b>`,
    `🚗 Авто: ${escapeHtml(booking.car)}`,
    `🔧 Услуга: <b>${escapeHtml(booking.service)}</b>`,
    ``,
    `📍 <b>Адрес:</b> ${company.fullAddress}`,
    `📞 <b>Телефон:</b> ${company.phone}`,
    ``,
    `Если нужно перенести или отменить запись, сообщите нам заранее.`,
    ``,
    bookingLink(booking.id),
  ].join('\n')
}

export function bookingCancelled(booking: BookingData): string {
  const date = booking.booking_date ? formatDate(booking.booking_date) : 'не указана'
  const time = booking.booking_time || 'не указано'

  return [
    `❌ <b>Запись отменена</b>`,
    ``,
    `Здравствуйте, <b>${escapeHtml(booking.name)}</b>!`,
    ``,
    `Ваша запись была отменена:`,
    ``,
    `📅 Дата: <b>${date}</b>`,
    `🕐 Время: <b>${escapeHtml(time)}</b>`,
    `🔧 Услуга: ${escapeHtml(booking.service)}`,
    ``,
    `Если захотите записаться снова — мы всегда рады помочь!`,
    ``,
    `📞 <b>Телефон:</b> ${company.phone}`,
    `🌐 <b>Сайт:</b> ${siteUrl}`,
    ``,
    bookingLink(booking.id),
  ].join('\n')
}

export function promoMessage(title: string, text: string): string {
  return [
    `📢 <b>${escapeHtml(title)}</b>`,
    ``,
    escapeHtml(text),
    ``,
    `📍 ${company.fullAddress}`,
    `📞 ${company.phone}`,
    `🌐 <a href="${siteUrl}">Перейти на сайт</a>`,
  ].join('\n')
}
