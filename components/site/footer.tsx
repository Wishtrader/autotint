import { MapPin, Phone } from 'lucide-react'
import { company, footerSocials } from '@/lib/site-config'
import { socialIconMap } from './social-icons'

const navLinks = [
  { label: 'Услуги', href: '#services' },
  { label: 'Преимущества', href: '#benefits' },
  { label: 'Как мы работаем', href: '#process' },
  { label: 'Работы', href: '#gallery' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Контакты', href: '#contact' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
                Т
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                {company.name}
              </span>
            </a>
            <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              {company.tagline} в Гомеле. Атермальные и защитные плёнки,
              безупречная работа мастеров и гарантия на каждый заказ.
            </p>
            <div className="mt-5 flex gap-3">
              {footerSocials.map((s) => {
                const Icon = socialIconMap[s.label]
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{ ['--brand' as string]: s.color }}
                    className="grid size-11 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:scale-110 hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  >
                    <Icon className="size-5" />
                  </a>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold">Навигация</h3>
            <ul className="mt-4 space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold">Контакты</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {company.fullAddress}
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                <a
                  href={company.phoneHref}
                  className="transition-colors hover:text-foreground"
                >
                  {company.phone}
                </a>
              </li>
              <li className="pl-6">{company.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {company.name}. Все права защищены.
          </p>
          <p>г. Гомель, Республика Беларусь</p>
        </div>
      </div>
    </footer>
  )
}
