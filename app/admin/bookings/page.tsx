'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Booking {
  id: string
  name: string
  phone: string
  car: string
  service: string
  booking_date: string
  booking_time: string
  status: string
  created_at: string
}

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchBookings()
  }, [supabase])

  const fetchBookings = async () => {
    let query = supabase
      .from('bookings')
      .select('id, name, phone, car, service, booking_date, booking_time, status, created_at')
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const filtered = bookings.filter((b) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.name.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.car.toLowerCase().includes(q)
    )
  })

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id)

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Записи</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по имени, телефону, авто…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input pr-10 appearance-none"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="confirmed">Подтверждена</option>
            <option value="completed">Выполнена</option>
            <option value="cancelled">Отменена</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">Нет записей</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                  <th className="p-4">Клиент</th>
                  <th className="p-4">Авто</th>
                  <th className="p-4">Услуга</th>
                  <th className="p-4">Дата и время</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <Link href={`/admin/bookings/${booking.id}`} className="hover:text-primary transition-colors">
                        <p className="font-medium">{booking.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.phone}</p>
                      </Link>
                    </td>
                    <td className="p-4 text-sm">{booking.car}</td>
                    <td className="p-4 text-sm">{booking.service}</td>
                    <td className="p-4 text-sm">
                      {new Date(booking.booking_date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      {booking.booking_time}
                    </td>
                    <td className="p-4">
                      <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[booking.status])}>
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <select
                          value={booking.status}
                          onChange={(e) => updateStatus(booking.id, e.target.value)}
                          className="text-xs bg-transparent border border-border rounded-lg px-2 py-1 appearance-none cursor-pointer"
                        >
                          <option value="pending">Ожидает</option>
                          <option value="confirmed">Подтвердить</option>
                          <option value="completed">Выполнена</option>
                          <option value="cancelled">Отменить</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
