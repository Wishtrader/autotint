'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { benefits } from '@/lib/site-config'
import { Reveal } from './reveal'

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(value)

  // Extract numeric part for animated count-up; keep suffix/prefix intact.
  const match = value.match(/^(\D*)(\d+)(.*)$/)

  useEffect(() => {
    if (!inView || !match) return
    const [, prefix, numStr, suffix] = match
    const target = parseInt(numStr, 10)
    const duration = 1200
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(target * eased)
      setDisplay(`${prefix}${current}${suffix}`)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, match])

  return <span ref={ref}>{display}</span>
}

export function Benefits() {
  return (
    <section id="benefits" className="relative border-y border-border bg-card/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Почему мы
            </p>
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Премиальный сервис, которому доверяют
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Мы не гонимся за скоростью в ущерб качеству. Каждый автомобиль
              проходит через чистый бокс, а плёнку наносят мастера с многолетним
              опытом. Используем только оригинальные материалы с документами.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Оригинальные плёнки с сертификатами',
                'Оклейка в чистом отапливаемом боксе',
                'Официальный гарантийный талон',
                'Помощь в подборе по ГОСТ и без штрафов',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    ✓
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <div className="font-display text-4xl font-bold text-primary sm:text-5xl">
                  <Counter value={b.value} />
                </div>
                <div className="mt-2 font-semibold">{b.label}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {b.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
