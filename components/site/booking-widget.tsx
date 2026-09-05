'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, User, Car, Phone, MessageSquare, X, Check, Layers } from 'lucide-react'
import { useBooking } from './booking-context'
import { useTWA } from './twa-context'
import { services } from '@/lib/site-config'
import { cn } from '@/lib/utils'

interface TimeSlot {
  time: string
  available: boolean
}

interface DayData {
  date: Date
  dayOfWeek: string
  dayNumber: number
  month: string
  year: number
  slots: TimeSlot[]
}

const generateCalendarDays = (): DayData[] => {
  const days: DayData[] = []
  const today = new Date()
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const monthNames = [
    'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
  ]

  const now = new Date()
  const currentHour = now.getHours()

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const slots: TimeSlot[] = []
    const hours = [9, 11, 13, 15, 17, 19]

    hours.forEach((hour) => {
      const isPast = i === 0 && hour <= currentHour
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: !isPast,
      })
    })

    days.push({
      date,
      dayOfWeek: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      month: monthNames[date.getMonth()],
      year: date.getFullYear(),
      slots,
    })
  }

  return days
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length === 0) return ''
  let result = '+375 '
  if (digits.length > 0) result += `(${digits.slice(0, 2)}`
  if (digits.length > 2) result += `) ${digits.slice(2, 5)}`
  if (digits.length > 5) result += `-${digits.slice(5, 7)}`
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`
  return result
}

function validateFields(data: { name: string; car: string; phone: string; service: string }) {
  const errors: Record<string, string> = {}
  if (!data.name.trim()) errors.name = 'Введите ваше имя'
  if (!data.car.trim()) errors.car = 'Введите марку автомобиля'
  if (!data.service) errors.service = 'Выберите услугу'
  const phoneDigits = data.phone.replace(/\D/g, '')
  if (phoneDigits.length === 0) {
    errors.phone = 'Введите номер телефона'
  } else if (phoneDigits.length < 9) {
    errors.phone = 'Введите корректный номер телефона'
  }
  return errors
}

export function BookingWidget() {
  const { isOpen, closeBooking } = useBooking()
  const { isTWA, user, initData, close: closeTWA, requestContact } = useTWA()
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    car: '',
    phone: '',
    service: '',
    comment: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const phoneInputRef = useRef<HTMLInputElement>(null)

  // Auto-fill from TWA user data or URL params
  useEffect(() => {
    if (isTWA && user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.first_name || '',
        phone: prev.phone || user.phone_number || '',
      }))
      return
    }

    // Fallback: try URL params (bot may pass user data as ?user=JSON)
    const params = new URLSearchParams(window.location.search)
    const userParam = params.get('user')
    if (userParam) {
      try {
        const u = JSON.parse(userParam)
        if (u.first_name) {
          setFormData((prev) => ({ ...prev, name: prev.name || u.first_name }))
        }
      } catch {}
    }
    const nameParam = params.get('name')
    if (nameParam) {
      setFormData((prev) => ({ ...prev, name: prev.name || decodeURIComponent(nameParam) }))
    }
  }, [isTWA, user])

  const handleRequestContact = async () => {
    const phone = await requestContact()
    if (phone) {
      // Format phone from Telegram (usually +375...)
      const digits = phone.replace(/\D/g, '')
      const localDigits = digits.startsWith('375') ? digits.slice(3) : digits
      setFormData((prev) => ({ ...prev, phone: formatPhone(localDigits.slice(0, 9)) }))
    }
  }

  const calendarDays = generateCalendarDays()

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const localDigits = raw.startsWith('375') ? raw.slice(3) : raw
    const digits = localDigits.slice(0, 9)
    setFormData((prev) => ({ ...prev, phone: formatPhone(digits) }))
  }, [])

  const handleDayClick = async (day: DayData) => {
    setSelectedDay(day)
    setSelectedSlot(null)
    setShowForm(false)

    // Fetch confirmed bookings for this date to mark slots as unavailable
    try {
      const y = day.date.getFullYear()
      const m = String(day.date.getMonth() + 1).padStart(2, '0')
      const d = String(day.date.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`
      const response = await fetch(`/api/bookings?date=${dateStr}&status=confirmed`)
      const data = await response.json()

      if (data.bookings) {
        const bookedTimes = data.bookings.map((b: { booking_time: string }) => b.booking_time)
        // Update slots availability
        const updatedSlots = day.slots.map((slot) => ({
          ...slot,
          available: slot.available && !bookedTimes.includes(slot.time),
        }))
        setSelectedDay({ ...day, slots: updatedSlots })
      }
    } catch {
      // If API fails, keep original availability
    }
  }

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return
    setSelectedSlot(slot)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    const errs = validateFields(formData)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    if (!selectedDay || !selectedSlot) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          car: formData.car,
          service: formData.service,
          booking_date: `${selectedDay.date.getFullYear()}-${String(selectedDay.date.getMonth() + 1).padStart(2, '0')}-${String(selectedDay.date.getDate()).padStart(2, '0')}`,
          booking_time: selectedSlot.time,
          comment: formData.comment || null,
          source: isTWA ? 'twa' : 'web',
          telegram_user_id: user?.id || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Ошибка при отправке заявки')
        setSubmitting(false)
        return
      }

      setFormSubmitted(true)
    } catch {
      setSubmitError('Ошибка сети. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormSubmitted(false)
    setFormData({ name: '', car: '', phone: '', service: '', comment: '' })
    setSelectedDay(null)
    setSelectedSlot(null)
    setShowForm(false)
    setErrors({})
    closeBooking()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBooking()
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-[#1a1c1f] rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-black to-primary p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">Записаться</h3>
                  <p className="text-white/80 text-sm">Выберите дату и время</p>
                </div>
                <button
                  onClick={() => {
                    if (isTWA) {
                      closeTWA()
                    } else {
                      closeBooking()
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[65vh] overflow-y-auto">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-7 gap-1.5"
              >
                {calendarDays.slice(0, 28).map((day, idx) => {
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const isSelected = selectedDay?.date.toDateString() === day.date.toDateString()
                  return (
                    <motion.button
                      key={idx}
                      variants={item}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        'text-center cursor-pointer rounded-xl py-2 px-1 transition-all duration-200',
                        isSelected
                          ? 'bg-primary/70 text-white shadow-lg'
                          : isToday
                            ? 'bg-white/15 text-white ring-1 ring-primary/60'
                            : 'hover:bg-white/10 text-white'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-[10px] text-white/60 uppercase">{day.dayOfWeek}</div>
                      <div className="text-sm font-bold">{day.dayNumber}</div>
                    </motion.button>
                  )
                })}
              </motion.div>

              <AnimatePresence mode="wait">
                {selectedDay && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <p className="text-white/60 text-sm mb-3">
                      {selectedDay.dayNumber} {selectedDay.month}
                    </p>

                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-3 gap-2"
                    >
                      {selectedDay.slots.map((slot, idx) => (
                        <motion.button
                          key={idx}
                          variants={item}
                          onClick={() => handleSlotClick(slot)}
                          disabled={!slot.available}
                          className={cn(
                            'px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                            !slot.available && 'opacity-40 cursor-not-allowed',
                            selectedSlot?.time === slot.time
                        ? 'bg-primary/70 text-white shadow-lg'
                              : slot.available
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white/5 text-white/40'
                          )}
                          whileHover={slot.available ? { scale: 1.02 } : {}}
                          whileTap={slot.available ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.time}
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>

                    {showForm && selectedSlot && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-4"
                      >
                        <div className="bg-white/5 rounded-xl p-3 mb-3">
                          <p className="text-white/60 text-xs">Выбрано:</p>
                          <p className="text-white font-medium">
                            {selectedDay.dayNumber} {selectedDay.month}, {selectedSlot.time}
                          </p>
                        </div>

                        <AnimatePresence mode="wait">
                          {!formSubmitted ? (
                            <motion.form
                              key="form"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onSubmit={handleSubmit}
                              className="space-y-3"
                            >
                              <div>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                  <input
                                    type="text"
                                    placeholder="Ваше имя *"
                                    value={formData.name}
                                    onChange={(e) => {
                                      setFormData({ ...formData, name: e.target.value })
                                      if (errors.name) setErrors({ ...errors, name: '' })
                                    }}
                                    className={cn(
                                      'w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all',
                                      errors.name ? 'border-red-500' : 'border-transparent'
                                    )}
                                  />
                                </div>
                                {errors.name && (
                                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>
                                )}
                              </div>

                              <div>
                                <div className="relative">
                                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                  <input
                                    type="text"
                                    placeholder="Марка авто *"
                                    value={formData.car}
                                    onChange={(e) => {
                                      setFormData({ ...formData, car: e.target.value })
                                      if (errors.car) setErrors({ ...errors, car: '' })
                                    }}
                                    className={cn(
                                      'w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all',
                                      errors.car ? 'border-red-500' : 'border-transparent'
                                    )}
                                  />
                                </div>
                                {errors.car && (
                                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.car}</p>
                                )}
                              </div>

                              <div>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                  <input
                                    ref={phoneInputRef}
                                    type="tel"
                                    placeholder="+375 (__)___-__-__"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    className={cn(
                                      'w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all',
                                      errors.phone ? 'border-red-500' : 'border-transparent'
                                    )}
                                  />
                                </div>
                                {errors.phone && (
                                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>
                                )}
                                {isTWA && !formData.phone && (
                                  <button
                                    type="button"
                                    onClick={handleRequestContact}
                                    className="mt-1 text-xs text-primary hover:text-primary/80 transition-colors ml-1"
                                  >
                                    Поделиться телефоном из Telegram
                                  </button>
                                )}
                              </div>

                              <div>
                                <div className="relative">
                                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                  <select
                                    value={formData.service}
                                    onChange={(e) => {
                                      setFormData({ ...formData, service: e.target.value })
                                      if (errors.service) setErrors({ ...errors, service: '' })
                                    }}
                                    className={cn(
                                      'w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none',
                                      formData.service ? 'text-white' : 'text-white/40',
                                      errors.service ? 'border-red-500' : 'border-transparent'
                                    )}
                                  >
                                    <option value="" disabled className="bg-[#1a1c1f] text-white/40">
                                      Выберите услугу *
                                    </option>
                                    {services.map((s) => (
                                      <option key={s.title} value={s.title} className="bg-[#1a1c1f] text-white">
                                        {s.title} — {s.price}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {errors.service && (
                                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.service}</p>
                                )}
                              </div>

                              <div>
                                <div className="relative">
                                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                  <textarea
                                    placeholder="Комментарий"
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    rows={2}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-transparent text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                  />
                                </div>
                              </div>

                              {submitError && (
                                <p className="text-red-400 text-sm text-center">{submitError}</p>
                              )}

                              <motion.button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-black to-primary text-white font-semibold shadow-lg disabled:opacity-50"
                                whileHover={submitting ? {} : { scale: 1.02 }}
                                whileTap={submitting ? {} : { scale: 0.98 }}
                              >
                                {submitting ? 'Отправляем…' : 'Отправить'}
                              </motion.button>
                            </motion.form>
                          ) : (
                            <motion.div
                              key="success"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center py-8"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                              >
                                <Check className="w-8 h-8 text-green-400" />
                              </motion.div>
                              <h4 className="text-white font-bold text-lg mb-2">Заявка отправлена!</h4>
                              <p className="text-white/60 text-sm">
                                Скоро с вами свяжется наш менеджер
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
