import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { BookingProvider } from '@/components/site/booking-context'
import { Analytics } from '@/components/site/analytics'
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AutoTint — Премиальная тонировка автомобилей в Гомеле',
    template: '%s | AutoTint',
  },
  description:
    'Профессиональная тонировка автомобилей премиум-класса в Гомеле. Атермальная плёнка, съёмная тонировка, бронирование стёкол, оклейка кузова. Гарантия качества. ул. Широкая 4Б.',
  keywords: [
    'тонировка авто',
    'тонировка автомобилей Гомель',
    'атермальная плёнка Гомель',
    'бронирование стёкол Гомель',
    'съёмная тонировка',
    'тонировка фар',
    'оклейка кузова плёнкой',
    'защитная плёнка на авто',
    'тонировка стёкол цена',
    'тонировка Гомель недорого',
    'премиум тонировка',
    'тонировка по ГОСТ',
    'автотонировка',
    'плёнка на стёкла авто',
    'тонировка Land Cruiser',
    'тонировка BMW',
    'тонировка Mercedes',
    'тонировка Toyota',
    'tonировка Volkswagen',
    'тонировка Kia',
  ],
  authors: [{ name: 'AutoTint' }],
  creator: 'AutoTint',
  publisher: 'AutoTint',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AutoTint — Премиальная тонировка автомобилей в Гомеле',
    description:
      'Профессиональная тонировка автомобилей премиум-класса в Гомеле. Атермальная плёнка, съёмная тонировка, бронирование стёкол. Гарантия качества.',
    url: SITE_URL,
    siteName: 'AutoTint',
    locale: 'ru_BY',
    type: 'website',
    images: [
      {
        url: '/images/hero-car.png',
        width: 1200,
        height: 630,
        alt: 'AutoTint — Премиальная тонировка автомобилей в Гомеле',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoTint — Премиальная тонировка автомобилей в Гомеле',
    description:
      'Профессиональная тонировка автомобилей премиум-класса в Гомеле. Гарантия качества.',
    images: ['/images/hero-car.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
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
        <BookingProvider>{children}</BookingProvider>
        <Analytics />
        {process.env.NODE_ENV === 'production' && <VercelAnalytics />}
      </body>
    </html>
  )
}