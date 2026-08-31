'use client'

import { useState, useCallback, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, Loader2, Mail, MapPin, Phone } from 'lucide-react'
import { company, services, socials } from '@/lib/site-config'
import { socialIconMap } from './social-icons'
import { Reveal } from './reveal'
import { cn } from '@/lib/utils'

const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
  'Гомель, улица Широкая 13',
)}&z=16&hl=ru&output=embed`

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

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    car: '',
    phone: '',
    service: '',
    comment: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const localDigits = raw.startsWith('375') ? raw.slice(3) : raw
    const digits = localDigits.slice(0, 9)
    setFormData((prev) => ({ ...prev, phone: formatPhone(digits) }))
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError('')
    const errs = validateFields(formData)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setStatus('loading')

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
          comment: formData.comment || null,
          type: 'inquiry',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Ошибка при отправке заявки')
        setStatus('idle')
        return
      }

      setStatus('success')
    } catch {
      setSubmitError('Ошибка сети. Попробуйте ещё раз.')
      setStatus('idle')
    }
  }

  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Контакты
          </p>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Запишитесь на тонировку
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Оставьте заявку — перезвоним в течение 15 минут, подберём плёнку и
            назовём точную стоимость для вашего авто.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <Reveal className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[360px] flex-col items-center justify-center text-center"
                >
                  <div className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-8" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold">
                    Заявка отправлена!
                  </h3>
                  <p className="mt-2 max-w-sm text-muted-foreground">
                    Спасибо за обращение. Наш менеджер свяжется с вами в
                    ближайшее время для подтверждения записи.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle')
                      setFormData({ name: '', car: '', phone: '', service: '', comment: '' })
                      setErrors({})
                    }}
                    className="mt-6 rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
                  >
                    Отправить ещё одну
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Field label="Ваше имя" htmlFor="name">
                        <input
                          id="name"
                          name="name"
                          placeholder="Александр"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value })
                            if (errors.name) setErrors({ ...errors, name: '' })
                          }}
                          className={cn('input', errors.name && 'border-red-500')}
                        />
                      </Field>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <Field label="Телефон" htmlFor="phone">
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+375 (__) ___-__-__"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          className={cn('input', errors.phone && 'border-red-500')}
                        />
                      </Field>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Field label="Марка и модель авто" htmlFor="car">
                        <input
                          id="car"
                          name="car"
                          placeholder="Volkswagen Passat"
                          value={formData.car}
                          onChange={(e) => {
                            setFormData({ ...formData, car: e.target.value })
                            if (errors.car) setErrors({ ...errors, car: '' })
                          }}
                          className={cn('input', errors.car && 'border-red-500')}
                        />
                      </Field>
                      {errors.car && (
                        <p className="text-red-500 text-xs mt-1">{errors.car}</p>
                      )}
                    </div>
                    <div>
                      <Field label="Услуга" htmlFor="service">
                        <select
                          id="service"
                          name="service"
                          value={formData.service}
                          onChange={(e) => {
                            setFormData({ ...formData, service: e.target.value })
                            if (errors.service) setErrors({ ...errors, service: '' })
                          }}
                          className={cn('input', !formData.service && 'text-muted-foreground', errors.service && 'border-red-500')}
                        >
                          <option value="" disabled>
                            Выберите услугу
                          </option>
                          {services.map((s) => (
                            <option key={s.title} value={s.title}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </Field>
                      {errors.service && (
                        <p className="text-red-500 text-xs mt-1">{errors.service}</p>
                      )}
                    </div>
                  </div>

                  <Field label="Комментарий" htmlFor="message" optional>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Удобное время, вопросы, пожелания…"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="input resize-none"
                    />
                  </Field>

                  {submitError && (
                    <p className="text-red-500 text-sm text-center">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-70"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Отправляем…
                      </>
                    ) : (
                      'Отправить заявку'
                    )}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных
                    данных.
                  </p>
                </form>
              )}
            </div>
          </Reveal>

          {/* Info + socials */}
          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="flex h-full flex-col gap-6">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h3 className="font-display text-xl font-semibold">
                  Контактная информация
                </h3>
                <ul className="mt-5 space-y-4">
                  <InfoRow icon={MapPin} title={company.fullAddress}>
                    Заезд со стороны ул. Широкая
                  </InfoRow>
                  <li>
                    <a href={company.phoneHref} className="group flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Phone className="size-5" />
                      </span>
                      <span>
                        <span className="block font-medium transition-colors group-hover:text-primary">
                          {company.phone}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Звонок и запись
                        </span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${company.email}`}
                      className="group flex items-start gap-3"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Mail className="size-5" />
                      </span>
                      <span>
                        <span className="block font-medium transition-colors group-hover:text-primary">
                          {company.email}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Почта для заявок
                        </span>
                      </span>
                    </a>
                  </li>
                  <InfoRow icon={Clock} title={company.hours}>
                    Воскресенье — по записи
                  </InfoRow>
                </ul>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-sm font-medium text-muted-foreground">
                    Напишите нам в мессенджере:
                  </p>
                  <div className="mt-3 flex gap-3">
                    {socials.map((s) => {
                      const Icon = socialIconMap[s.label]
                      return (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          style={{ ['--brand' as string]: s.color }}
                          className="grid size-12 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:scale-110 hover:border-[var(--brand)] hover:text-[var(--brand)]"
                        >
                          <Icon className="size-6" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Full-width map */}
      <div className="relative mt-16 w-full border-y border-border">
        <iframe
          title="Карта — г. Гомель, ул. Широкая 13"
          src={mapSrc}
          className="h-[380px] w-full grayscale-[0.3] sm:h-[460px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 sm:left-6 sm:translate-x-0">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-background/90 px-5 py-4 shadow-lg backdrop-blur-xl">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">{company.fullAddress}</span>
              <span className="text-sm text-muted-foreground">
                {company.hoursShort}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string
  htmlFor: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-1 text-muted-foreground">— необязательно</span>
        )}
      </label>
      {children}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{children}</span>
      </span>
    </li>
  )
}
