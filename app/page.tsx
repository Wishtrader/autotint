'use client'

import dynamic from 'next/dynamic'
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

const BookingWidget = dynamic(() => import('@/components/site/booking-widget'), {
  ssr: false,
})

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
    </>
  )
}