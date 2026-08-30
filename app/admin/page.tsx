'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  today: number
}

interface RecentBooking {
  id: string
  name: string
  car: string
  service: string
  booking_date: string
  booking_time: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]

      const res = await fetch(`/api/bookings?date=${today}`)
      const { bookings: todayBookings } = await res.json()

      const resAll = await fetch('/api/bookings')
      const { bookings: allBookings } = await resAll.json()

      const all = allBookings || []
      setStats({
        total: all.length,
        pending: all.filter((b: { status: string }) => b.status === 'pending').length,
        confirmed: all.filter((b: { status: string }) => b.status === 'confirmed').length,
        completed: all.filter((b: { status: string }) => b.status === 'completed').length,
        cancelled: all.filter((b: { status: string }) => b.status === 'cancelled').length,
        today: todayBookings?.length || 0,
      })

      setRecent(all.slice(0, 5))
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const statCards = [
    { label: 'Всего записей', value: stats?.total || 0, icon: CalendarDays, color: 'text-primary' },
    { label: 'Ожидают', value: stats?.pending || 0, icon: Clock, color: 'text-yellow-500' },
    { label: 'Подтверждены', value: stats?.confirmed || 0, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Выполнены', value: stats?.completed || 0, icon: CheckCircle2, color: 'text-blue-500' },
    { label: 'Отменены', value: stats?.cancelled || 0, icon: XCircle, color: 'text-red-500' },
    { label: 'Сегодня', value: stats?.today || 0, icon: CalendarDays, color: 'text-primary' },
  ]

  const statusLabels: Record<string, string> = {
    pending: 'Ожидает',
    confirmed: 'Подтверждена',
    completed: 'Выполнена',
    cancelled: 'Отменена',
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    confirmed: 'bg-green-500/10 text-green-500',
    completed: 'bg-blue-500/10 text-blue-500',
    cancelled: 'bg-red-500/10 text-red-500',
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-8">Дашборд</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <card.icon className={`size-5 ${card.color} mb-2`} />
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold">Последние записи</h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-primary hover:underline"
          >
            Все записи →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">Нет записей</p>
          ) : (
            recent.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="font-medium">{booking.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.car} · {booking.service}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {new Date(booking.booking_date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    {booking.booking_time}
                  </p>
                  <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[booking.status]}`}>
                    {statusLabels[booking.status]}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
