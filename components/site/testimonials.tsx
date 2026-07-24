import { Quote, Star } from 'lucide-react'
import { testimonials } from '@/lib/site-config'
import { Reveal, Stagger, StaggerItem } from './reveal'

export function Testimonials() {
  return (
    <section id="reviews" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Отзывы
          </p>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Что говорят наши клиенты
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Более 8000 автомобилей и сотни благодарных владельцев по всей
            Гомельской области. Вот лишь несколько отзывов.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 sm:p-8">
                <Quote
                  className="size-8 text-primary/40"
                  aria-hidden="true"
                />
                <div
                  className="mt-4 flex gap-1"
                  aria-label={`Оценка ${t.rating} из 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < t.rating
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground/30'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-muted-foreground">
                  {t.text}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {t.car}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
