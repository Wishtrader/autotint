'use client'

import { motion } from 'framer-motion'
import { Reveal } from './reveal'

const images = [
  {
    src: '/images/gallery-1.png',
    alt: 'Нанесение тонировочной плёнки на боковое стекло автомобиля',
    span: 'sm:col-span-2 sm:row-span-2',
  },
  {
    src: '/images/gallery-2.png',
    alt: 'Тонировка лобового стекла атермальной плёнкой',
    span: '',
  },
  {
    src: '/images/gallery-3.png',
    alt: 'Внедорожник с затонированными стёклами на закате',
    span: '',
  },
]

export function Gallery() {
  return (
    <section id="gallery" className="relative border-t border-border bg-card/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Наши работы
          </p>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Результат говорит сам за себя
          </h2>
        </Reveal>

        <div className="mt-14 grid auto-rows-[220px] gap-4 sm:grid-cols-3">
          {images.map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`group relative overflow-hidden rounded-2xl border border-border ${img.span}`}
            >
              <img
                src={img.src || '/placeholder.svg'}
                alt={img.alt}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
