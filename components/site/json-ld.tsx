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

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Сколько стоит тонировка авто в Гомеле?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'От 60 BYN за тонировку фар до 400 BYN за оклейку кузова. Тонировка задних стёкол — от 250 BYN.',
        },
      },
      {
        '@type': 'Question',
        name: 'Сколько времени занимает тонировка?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'В среднем 1,5 часа. Большинство работ выполняем в день обращения.',
        },
      },
      {
        '@type': 'Question',
        name: 'Какая гарантия на тонировку?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Официальная гарантия от 1 года на плёнку и работу мастера.',
        },
      },
      {
        '@type': 'Question',
        name: 'Нужно ли снимать тонировку для техосмотра?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Съёмная тонировка легко снимается перед техосмотром и устанавливается обратно.',
        },
      },
      {
        '@type': 'Question',
        name: 'Как записаться на тонировку?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Позвоните по телефону +375 (25) 653-33-33 или оставьте заявку на сайте.',
        },
      },
      {
        '@type': 'Question',
        name: 'Где находится AutoTint?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'г. Гомель, ул. Широкая 4Б, блок 7, к.56. Работаем Пн–Сб 9:00–20:00.',
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  )
}