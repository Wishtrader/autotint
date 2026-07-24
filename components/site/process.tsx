'use client'

import { steps } from '@/lib/site-config'
import { Reveal, Stagger, StaggerItem } from './reveal'

export function Process() {
  return (
    <section id="process" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Как мы работаем
          </p>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Четыре шага до идеального результата
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <StaggerItem key={step.number}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-7">
                <span className="font-display text-5xl font-bold text-primary/25">
                  {step.number}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
