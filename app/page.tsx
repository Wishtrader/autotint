'use client'

import dynamic from 'next/dynamic'
import Script from 'next/script'
import { Nav } from '@/components/site/nav'
import { Hero } from '@/components/site/hero'
import { Services } from '@/components/site/services'
import { Benefits } from '@/components/site/benefits'
import { Process } from '@/components/site/process'
import { Gallery } from '@/components/site/gallery'
import { Testimonials } from '@/components/site/testimonials'
import { Contact } from '@/components/site/contact'
import { Footer } from '@/components/site/footer'
import { JsonLd } from '@/components/site/json-ld'

const BookingWidget = dynamic(
  () => import('@/components/site/booking-widget').then((m) => m.BookingWidget),
  { ssr: false },
)

export default function Page() {
  return (
    <>
      <JsonLd />
      <Nav />
      <main>
        <Hero />
        <Services />
        <Benefits />
        <Process />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <BookingWidget />
      <Script
        src="https://ecb-frontend.vercel.app/widget/chatbot-widget.js"
        data-chatbot-id="8917d229-b7eb-474d-9479-bd8037575081"
        data-api-url="https://ecb-frontend.vercel.app"
        data-title="Autotint"
        data-primary-color="#f0953b"
        strategy="afterInteractive"
      />
    </>
  )
}