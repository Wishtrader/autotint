'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, X, SlidersHorizontal } from 'lucide-react'
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

const dateFilters = [
  { value: 'all', label: 'Все даты' },
  { value: 'today', label: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра' },
  { value: 'week', label: 'Эта неделя' },
  { value: 'month', label: 'Этот месяц' },
  { value: 'past', label: 'Прошедшие' },
]

function DropdownFilter({
  label,
  options,
  value,
  onChange,
  icon,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const active = value !== 'all'
  const currentLabel = options.find((o) => o.value === value)?.label || label

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1 text-xs font-medium uppercase transition-colors',
          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {icon}
        {label}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 min-w-[160px] rounded-xl border border-border bg-card shadow-xl p-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                value === opt.value
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DateFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const active = value !== 'all'
  const currentLabel = dateFilters.find((d) => d.value === value)?.label || 'Дата'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1 text-xs font-medium uppercase transition-colors',
          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Дата
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 min-w-[160px] rounded-xl border border-border bg-card shadow-xl p-1">
          {dateFilters.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                value === opt.value
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<'date' | 'name'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    const res = await fetch('/api/bookings')
    const { bookings: data } = await res.json()
    setBookings(data || [])
    setLoading(false)
  }

  const services = [...new Set(bookings.map((b) => b.service))].sort()

  const filterByDateRange = (b: Booking): boolean => {
    if (dateFilter === 'all') return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const bookingDate = new Date(b.booking_date + 'T00:00:00')

    switch (dateFilter) {
      case 'today':
        return bookingDate.toDateString() === today.toDateString()
      case 'tomorrow': {
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        return bookingDate.toDateString() === tomorrow.toDateString()
      }
      case 'week': {
        const weekEnd = new Date(today)
        weekEnd.setDate(today.getDate() + 7)
        return bookingDate >= today && bookingDate <= weekEnd
      }
      case 'month': {
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return bookingDate >= today && bookingDate <= monthEnd
      }
      case 'past':
        return bookingDate < today
      default:
        return true
    }
  }

  const filtered = bookings.filter((b) => {
    if (search) {
      const q = search.toLowerCase()
      const match = b.name.toLowerCase().includes(q) || b.phone.includes(q) || b.car.toLowerCase().includes(q)
      if (!match) return false
    }
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (serviceFilter !== 'all' && b.service !== serviceFilter) return false
    if (!filterByDateRange(b)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const da = a.booking_date + (a.booking_time || '')
      const db = b.booking_date + (b.booking_time || '')
      return sortDir === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
    }
    return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  })

  const toggleSort = (field: 'date' | 'name') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const hasActiveFilters = search || statusFilter !== 'all' || serviceFilter !== 'all' || dateFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setServiceFilter('all')
    setDateFilter('all')
  }

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold">Записи</h1>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3" />
            Сбросить фильтры
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
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
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">
            {hasActiveFilters ? 'Нет записей по выбранным фильтрам' : 'Нет записей'}
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                    <th className="p-4">
                      <button
                        onClick={() => toggleSort('name')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Клиент
                        <ChevronDown className={cn('size-3 transition-transform', sortField === 'name' && sortDir === 'asc' && 'rotate-180')} />
                      </button>
                    </th>
                    <th className="p-4">Авто</th>
                    <th className="p-4">
                      <DropdownFilter
                        label="Услуга"
                        options={[
                          { value: 'all', label: 'Все услуги' },
                          ...services.map((s) => ({ value: s, label: s })),
                        ]}
                        value={serviceFilter}
                        onChange={setServiceFilter}
                      />
                    </th>
                    <th className="p-4">
                      <DateFilter value={dateFilter} onChange={setDateFilter} />
                    </th>
                    <th className="p-4">
                      <DropdownFilter
                        label="Статус"
                        options={[
                          { value: 'all', label: 'Все статусы' },
                          ...Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l })),
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                      />
                    </th>
                    <th className="p-4 text-xs font-medium text-muted-foreground uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sorted.map((booking) => (
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

            {/* Mobile filters row */}
            <div className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-border overflow-x-auto">
              <SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />
              <DropdownFilter
                label="Услуга"
                options={[
                  { value: 'all', label: 'Все услуги' },
                  ...services.map((s) => ({ value: s, label: s })),
                ]}
                value={serviceFilter}
                onChange={setServiceFilter}
              />
              <DateFilter value={dateFilter} onChange={setDateFilter} />
              <DropdownFilter
                label="Статус"
                options={[
                  { value: 'all', label: 'Все статусы' },
                  ...Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l })),
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-border">
              {sorted.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="block p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{booking.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.phone}</p>
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', statusColors[booking.status])}>
                      {statusLabels[booking.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{booking.car} · {booking.service}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.booking_date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      {booking.booking_time}
                    </p>
                    <select
                      value={booking.status}
                      onChange={(e) => {
                        e.preventDefault()
                        updateStatus(booking.id, e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] bg-transparent border border-border rounded-lg px-2 py-1 appearance-none cursor-pointer"
                    >
                      <option value="pending">Ожидает</option>
                      <option value="confirmed">Подтвердить</option>
                      <option value="completed">Выполнена</option>
                      <option value="cancelled">Отменить</option>
                    </select>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
