'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { services } from '@/lib/site-config'
import { Reveal, Stagger, StaggerItem } from './reveal'

export function Services() {
  return (
    <section id="services" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Услуги
          </p>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Полный спектр работ с плёнкой
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Подбираем оптимальное решение под ваш автомобиль, бюджет и требования
            законодательства Республики Беларусь.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <StaggerItem key={service.title}>
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-7"
                >
                  <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                    <span className="font-display text-lg font-bold text-primary">
                      {service.price}
                    </span>
                    <a
                      href="#contact"
                      className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Записаться: ${service.title}`}
                    >
                      Записаться
                      <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </motion.article>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
