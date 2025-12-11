import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import NextAuth from 'next-auth'
import authConfig from './auth.config'

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

// Create Intl middleware
const intlMiddleware = createMiddleware(routing)

// Trusted hosts from env variable
const trustedHosts = process.env.TRUSTED_HOSTS?.split(',').map(h => h.trim()) || []

// Create NextAuth instance
const { auth } = NextAuth({
  ...authConfig,
  // Make sure your NextAuth version supports `trustHost`
  trustHost: trustedHosts,
})

export default auth((req) => {
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
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}

