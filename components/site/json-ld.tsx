import { company, services, testimonials } from '@/lib/site-config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'

const avgRating =
  testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length

export function JsonLd() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: company.name,
    description: `${company.tagline} в ${company.city}. Профессиональная тонировка автомобилей, атермальная плёнка, бронирование стёкол.`,
    url: SITE_URL,
    logo: `${SITE_URL}${company.logo}`,
    image: `${SITE_URL}/images/hero-car.png`,
    telephone: company.phone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Широкая 4Б',
      addressLocality: 'Гомель',
      addressCountry: 'BY',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.4345,
      longitude: 30.9754,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00',
    },
    priceRange: '$$',
    areaServed: {
      '@type': 'City',
      name: 'Гомель',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: testimonials.length,
      bestRating: 5,
    },
    review: testimonials.map((t) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: t.name },
      reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
      reviewBody: t.text,
    })),
  }

  const serviceList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Услуги AutoTint',
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.title,
        description: s.description,
        provider: {
          '@type': 'AutoRepair',
          name: company.name,
        },
        areaServed: {
          '@type': 'City',
          name: 'Гомель',
        },
        offers: {
          '@type': 'Offer',
          price: s.price.replace(/[^0-9]/g, ''),
          priceCurrency: 'BYN',
        },
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceList) }}
      />
    </>
  )
}