import { Nav } from '@/components/site/nav'
import { Hero } from '@/components/site/hero'
import { Services } from '@/components/site/services'
import { Benefits } from '@/components/site/benefits'
import { Process } from '@/components/site/process'
import { Gallery } from '@/components/site/gallery'
import { Testimonials } from '@/components/site/testimonials'
import { Contact } from '@/components/site/contact'
import { Footer } from '@/components/site/footer'

export default function Page() {
  return (
    <>
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
    </>
  )
}
