# SEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Maximize SEO visibility for AutoTint (car tinting business in Gomel) on Google, Yandex, and AI search results.

**Architecture:** Enhance Next.js App Router metadata API with comprehensive meta tags, add JSON-LD structured data for LocalBusiness/Service/AggregateRating, generate sitemap.xml and robots.ts, integrate Google Analytics + Yandex.Metrika, and optimize technical SEO (image optimization, noindex admin, caching).

**Tech Stack:** Next.js 16.2.6 (App Router), TypeScript, React 19, Vercel Analytics (existing), Google Analytics (GA4), Yandex.Metrika

**Spec:** N/A (plan based on brainstorming session)

## Global Constraints

- Domain: `autotint.vercel.app`
- Language: Russian (`lang="ru"`, locale `ru_BY`)
- Site structure: Single-page (one public URL `/`)
- Admin pages: `/admin/*` — must be noindexed
- Analytics: Both Google Analytics and Yandex.Metrika in production only
- All new files follow existing code conventions (ES modules, TypeScript, Tailwind CSS)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `app/layout.tsx` | Modify | Enhance metadata, add analytics scripts, add metadataBase |
| `app/page.tsx` | Modify | Add JSON-LD structured data component |
| `app/sitemap.ts` | Create | Dynamic sitemap generation |
| `app/robots.ts` | Create | Dynamic robots.txt generation |
| `components/site/json-ld.tsx` | Create | JSON-LD structured data component |
| `components/site/analytics.tsx` | Create | Google Analytics + Yandex.Metrika scripts |
| `public/site.webmanifest` | Create | Web app manifest for PWA hints |
| `next.config.mjs` | Modify | Enable image optimization, add security headers |
| `.env.local` | Modify | Add NEXT_PUBLIC_SITE_URL |

---

### Task 1: Environment & Config Setup

**Files:**
- Modify: `.env.local`
- Modify: `next.config.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add NEXT_PUBLIC_SITE_URL to .env.local**

Append to `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://autotint.vercel.app
```

- [ ] **Step 2: Update next.config.mjs with image optimization and headers**

Replace contents of `next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 3: Update package.json name**

Change `"name": "my-project"` to `"name": "autotint"` in `package.json`.

- [ ] **Step 4: Commit**

```bash
git add .env.local next.config.mjs package.json
git commit -m "chore: SEO setup — env vars, image optimization, security headers"
```

---

### Task 2: Analytics Component (Google Analytics + Yandex.Metrika)

**Files:**
- Create: `components/site/analytics.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create analytics component**

Create `components/site/analytics.tsx`:
```tsx
'use client'

import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const YM_ID = process.env.NEXT_PUBLIC_YM_ID

export function Analytics() {
  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `}
          </Script>
        </>
      )}
      {YM_ID && (
        <Script id="ym-init" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${YM_ID}, "init", {
              defer: true,
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true,
              webvisor: true
            });
          `}
        </Script>
      )}
      {YM_ID && (
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
      )}
    </>
  )
}
```

- [ ] **Step 2: Add analytics env vars to .env.local**

Append to `.env.local`:
```
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_YM_ID=
```

(Leave values empty for now — user fills in after creating GA4 property and Yandex.Metrika counter)

- [ ] **Step 3: Integrate analytics into root layout**

In `app/layout.tsx`, add import and render:
```tsx
import { Analytics } from '@/components/site/analytics'
```
Add `<Analytics />` inside `<body>`, after `<BookingProvider>` and before the Vercel `<Analytics />`.

- [ ] **Step 4: Verify build succeeds**

Run: `pnpm build`
Expected: Build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add components/site/analytics.tsx app/layout.tsx .env.local
git commit -m "feat: add Google Analytics + Yandex.Metrika integration"
```

---

### Task 3: Enhanced Metadata in Root Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace metadata export in app/layout.tsx**

Replace the entire `metadata` export with:
```tsx
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
    'тонировка Volkswagen',
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
}
```

- [ ] **Step 2: Remove generator line**

Delete the `generator: 'v0.app'` line from metadata (it reveals the scaffolding tool and adds no value).

- [ ] **Step 3: Verify build succeeds**

Run: `pnpm build`
Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: comprehensive SEO metadata — OG, Twitter, robots, canonical, keywords"
```

---

### Task 4: JSON-LD Structured Data

**Files:**
- Create: `components/site/json-ld.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create JSON-LD component**

Create `components/site/json-ld.tsx`:
```tsx
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
```

- [ ] **Step 2: Add JsonLd to the main page**

In `app/page.tsx`, add import and render:
```tsx
import { JsonLd } from '@/components/site/json-ld'
```
Add `<JsonLd />` as the first child inside the `<>` fragment (before `<Nav />`).

- [ ] **Step 3: Verify build succeeds**

Run: `pnpm build`
Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add components/site/json-ld.tsx app/page.tsx
git commit -m "feat: JSON-LD structured data — LocalBusiness, Services, Reviews"
```

---

### Task 5: Sitemap & Robots.txt

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Create sitemap.ts**

Create `app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
```

- [ ] **Step 2: Create robots.ts**

Create `app/robots.ts`:
```ts
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autotint.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Verify build succeeds**

Run: `pnpm build`
Expected: Build completes without errors. Verify `sitemap.xml` and `robots.txt` are generated in `.next/server/app/`.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: dynamic sitemap.xml and robots.txt generation"
```

---

### Task 6: Admin Noindex & Web Manifest

**Files:**
- Modify: `app/admin/layout.tsx`
- Create: `public/site.webmanifest`

- [ ] **Step 1: Add noindex meta tag to admin layout**

In `app/admin/layout.tsx`, add a `<head>` with noindex inside the returned JSX. Since this is a client component, add it as the first child in the return:
```tsx
return (
  <>
    <head>
      <meta name="robots" content="noindex, nofollow" />
    </head>
    <div className="min-h-screen bg-background">
      {/* ... rest of the layout */}
    </div>
  </>
)
```

Note: The admin layout already returns different things based on `loading` and `isLoginPage`. Add the `<head>` to ALL return paths:
- The loading return (line 55-60): wrap in `<>` and add `<head>`
- The `isLoginPage` return (line 63-65): wrap in `<>` and add `<head>`
- The main return (line 67-143): wrap in `<>` and add `<head>`

- [ ] **Step 2: Create web manifest**

Create `public/site.webmanifest`:
```json
{
  "name": "AutoTint — Тонировка автомобилей в Гомеле",
  "short_name": "AutoTint",
  "description": "Профессиональная тонировка автомобилей премиум-класса в Гомеле",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1c1f",
  "theme_color": "#1a1c1f",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    },
    {
      "src": "/apple-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 3: Add manifest link to root layout**

In `app/layout.tsx`, add to the metadata:
```tsx
manifest: '/site.webmanifest',
```

- [ ] **Step 4: Verify build succeeds**

Run: `pnpm build`
Expected: Build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx public/site.webmanifest app/layout.tsx
git commit -m "feat: admin noindex tag, web app manifest"
```

---

### Task 7: Image Optimization Migration

**Files:**
- Modify: components using `next/image` (check for `unoptimized` prop usage)

- [ ] **Step 1: Search for unoptimized prop usage**

Run: `grep -r "unoptimized" --include="*.tsx" --include="*.ts" .`

If any components pass `unoptimized` to `<Image>`, remove that prop so they benefit from the new image optimization config.

- [ ] **Step 2: Verify build succeeds with image optimization**

Run: `pnpm build`
Expected: Build completes. Images should now be served as AVIF/WebP with responsive sizes.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: enable Next.js image optimization (AVIF/WebP)"
```

---

### Task 8: Final Verification & Deploy

- [ ] **Step 1: Full build test**

Run: `pnpm build`
Expected: Clean build with no errors.

- [ ] **Step 2: Local dev verification**

Run: `pnpm dev`
Then manually check:
- View page source at `http://localhost:3000` — verify meta tags, OG tags, JSON-LD
- Check `http://localhost:3000/sitemap.xml` — verify sitemap renders
- Check `http://localhost:3000/robots.txt` — verify robots.txt renders
- Check `http://localhost:3000/admin` — verify noindex tag is present in source

- [ ] **Step 3: Validate structured data**

Open Chrome DevTools → Elements tab → search for `application/ld+json`. Copy the JSON-LD and validate at:
- https://search.google.com/structured-data/testing-tool
- https://validator.schema.org/

- [ ] **Step 4: Final commit with all changes**

```bash
git add -A
git commit -m "feat: complete SEO optimization — metadata, structured data, sitemap, analytics"
```

---

## Post-Deploy Checklist

After deploying to Vercel, user should:

1. **Google Search Console:** Add property `autotint.vercel.app`, verify, submit sitemap
2. **Yandex.Webmaster:** Add site `autotint.vercel.app`, verify, submit sitemap
3. **Google Analytics:** Create GA4 property, get Measurement ID, add to `.env.local` as `NEXT_PUBLIC_GA_ID`
4. **Yandex.Metrika:** Create counter, get Counter ID, add to `.env.local` as `NEXT_PUBLIC_YM_ID`
5. **Request indexing:** Use Google Search Console "URL Inspection" to request indexing of `/`
6. **Test Rich Results:** Use https://search.google.com/test/rich-results on the live URL
