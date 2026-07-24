import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AutoTint — Премиальная тонировка автомобилей в Гомеле',
  description:
    'Профессиональная тонировка автомобилей премиум-класса в Гомеле. Атермальная плёнка, съёмная тонировка, бронирование стёкол. Гарантия качества. ул. Широкая 13.',
  generator: 'v0.app',
  keywords: [
    'тонировка',
    'тонировка авто Гомель',
    'атермальная плёнка',
    'бронирование стёкол',
    'съёмная тонировка',
  ],
  openGraph: {
    title: 'AutoTint — Премиальная тонировка автомобилей в Гомеле',
    description:
      'Профессиональная тонировка автомобилей премиум-класса в Гомеле. ул. Широкая 13.',
    locale: 'ru_BY',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1c1f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
