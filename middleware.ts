import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

import NextAuth from 'next-auth'
import authConfig from './auth.config'

// Public pages that don’t require auth
const publicPages = [
  '/',
  '/search',
  '/sign-in',
  '/sign-up',
  '/cart',
  '/cart/(.*)',
  '/product/(.*)',
  '/page/(.*)',
]

// Initialize i18n middleware
const intlMiddleware = createMiddleware(routing)

// Set NEXTAUTH_URL automatically based on environment
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL =
    process.env.NODE_ENV === 'production'
      ? 'http://167.172.31.245:3000'
      : 'http://localhost:3000'
}

// Initialize NextAuth (do NOT use `trustHost` array)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Regex to match public pages
  const publicPathnameRegex = new RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

  if (isPublicPage) {
    return intlMiddleware(req)
  } else {
    if (!req.auth) {
      // Redirect to sign-in if user is not authenticated
      const newUrl = new URL(
        `/sign-in?callbackUrl=${encodeURIComponent(req.nextUrl.pathname) || '/'}`,
        req.nextUrl.origin
      )
      return Response.redirect(newUrl)
    } else {
      return intlMiddleware(req)
    }
  }
})

export const config = {
  // Skip API and _next paths for i18n middleware
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}


