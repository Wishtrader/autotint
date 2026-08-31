'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Phone, Car, CalendarDays, Clock, User, MessageSquare, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Booking {
  id: string
  name: string
  phone: string
  car: string
  service: string
  booking_date: string
  booking_time: string
  comment: string | null
  status: string
  admin_note: string | null
  created_at: string
  updated_at: string
}

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждена',
  completed: 'Выполнена',
  cancelled: 'Отменена',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function BookingDetailPage() {
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      const res = await fetch(`/api/bookings?id=${params.id}`)
      if (res.ok) {
        const { booking: data } = await res.json()
        setBooking(data)
        setAdminNote(data.admin_note || '')
      }
      setLoading(false)
    }
    fetchBooking()
  }, [params.id])

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: params.id, status: newStatus }),
    })
    setBooking((prev) => prev ? { ...prev, status: newStatus } : null)
    setUpdating(false)
  }

  const saveNote = async () => {
    setUpdating(true)
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: params.id, admin_note: adminNote }),
    })
    setBooking((prev) => prev ? { ...prev, admin_note: adminNote } : null)
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-sm">Запись не найдена</p>
        <Link href="/admin/bookings" className="text-primary hover:underline mt-2 inline-block text-sm">
          ← Вернуться к списку
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-5 sm:mb-8">
        <Link
          href="/admin/bookings"
          className="rounded-xl border border-border p-2 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-lg sm:text-2xl font-bold">Запись клиента</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {new Date(booking.created_at).toLocaleString('ru-RU')}
          </p>
        </div>
      </div>

      <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-4 sm:mb-6', statusColors[booking.status])}>
        {booking.status === 'confirmed' && <CheckCircle2 className="size-4" />}
        {booking.status === 'cancelled' && <XCircle className="size-4" />}
        {statusLabels[booking.status]}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <User className="size-4 sm:size-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Клиент</p>
              <p className="font-medium text-sm sm:text-base">{booking.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="size-4 sm:size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Телефон</p>
              <a href={`tel:${booking.phone}`} className="font-medium text-primary hover:underline text-sm sm:text-base">
                {booking.phone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Car className="size-4 sm:size-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Автомобиль</p>
              <p className="font-medium text-sm sm:text-base truncate">{booking.car}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays className="size-4 sm:size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Дата и время</p>
              <p className="font-medium text-sm sm:text-base">
                {new Date(booking.booking_date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                {booking.booking_time}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="size-4 sm:size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Услуга</p>
              <p className="font-medium text-sm sm:text-base">{booking.service}</p>
            </div>
          </div>

          {booking.comment && (
            <div className="flex items-start gap-3">
              <MessageSquare className="size-4 sm:size-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Комментарий</p>
                <p className="font-medium text-sm sm:text-base">{booking.comment}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="font-semibold mb-3 text-sm sm:text-base">Заметка админа</h3>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Добавить заметку к заказу…"
          rows={3}
          className="input resize-none mb-3 text-sm"
        />
        <button
          onClick={saveNote}
          disabled={updating}
          className="rounded-lg bg-white/10 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-white/15 transition-colors disabled:opacity-50"
        >
          {updating ? 'Сохраняем…' : 'Сохранить заметку'}
        </button>
      </div>

      {booking.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus('confirmed')}
            disabled={updating}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="size-4 sm:size-5" />
            Подтвердить
          </button>
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={updating}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <XCircle className="size-4 sm:size-5" />
            Отменить
          </button>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus('completed')}
            disabled={updating}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="size-4 sm:size-5" />
            Выполнена
          </button>
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={updating}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            <XCircle className="size-4 sm:size-5" />
            Отменить
          </button>
        </div>
      )}
    </div>
  )
}
