import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CANONICAL_HOST } from '@/lib/site'

function withRobots(response: NextResponse) {
  if (process.env.VERCEL_ENV === 'preview') {
    response.headers.set('X-Robots-Tag', 'noindex')
  }
  return response
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase()

  if (
    process.env.VERCEL_ENV === 'production' &&
    host &&
    host !== CANONICAL_HOST
  ) {
    return NextResponse.redirect(
      `https://${CANONICAL_HOST}${request.nextUrl.pathname}${request.nextUrl.search}`,
      308
    )
  }

  // Only run auth check for /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return withRobots(NextResponse.next())
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes except /admin/login
  if (
    request.nextUrl.pathname !== '/admin/login' &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return withRobots(NextResponse.redirect(url))
  }

  // Redirect logged-in users from /admin/login to /admin
  if (
    request.nextUrl.pathname === '/admin/login' &&
    user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return withRobots(NextResponse.redirect(url))
  }

  return withRobots(supabaseResponse)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
