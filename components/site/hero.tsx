'use client'

import { motion } from 'framer-motion'
import { MapPin, ShieldCheck, Star } from 'lucide-react'
import { company } from '@/lib/site-config'
import { useBooking } from './booking-context'

const ease = [0.21, 0.47, 0.32, 0.98] as const

export function Hero() {
  const { openBooking } = useBooking()

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-16 lg:pt-20"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-car.png"
          alt="Автомобиль премиум-класса с профессиональной тонировкой стёкол"
          className="size-full object-cover object-[75%_center] lg:object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent lg:from-background lg:via-background/20" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur"
          >
            <MapPin className="size-4 text-primary" />
            {company.city}, {company.address}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl"
          >
            Тонировка авто{' '}
            <span className="text-primary">премиум-класса</span> в Гомеле
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            Атермальные и защитные плёнки мировых брендов. Идеальная работа
            мастеров, гарантия 5 лет и комфорт в салоне в любую погоду.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <button
              onClick={openBooking}
              className="rounded-full bg-primary px-7 py-3.5 text-center text-base font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              Записаться на тонировку
            </button>
            <a
              href="#services"
              className="rounded-full border border-border bg-card/50 px-7 py-3.5 text-center text-base font-semibold text-foreground backdrop-blur transition-colors hover:bg-card"
            >
              Наши услуги и цены
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease }}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <div className="flex items-center gap-2">
              <Star className="size-5 fill-primary text-primary" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">4.9</span> из 5
                по отзывам
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Гарантия <span className="font-semibold text-foreground">от 1 года</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
