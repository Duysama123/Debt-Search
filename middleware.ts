import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if user is authenticated via cookie
    const checkAuth = request.cookies.get('auth_token')
    const isAuthenticated = checkAuth?.value === 'authenticated'

    // Public paths that don't need auth
    const publicPaths = ['/login', '/login/forgot', '/logo.png', '/manifest.json']

    // Allow public assets (nextjs internals, images, api unless protected)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // file extensions like .png, .ico
    ) {
        return NextResponse.next()
    }

    // If active on a public path
    if (publicPaths.some(path => pathname.startsWith(path))) {
        // If logged in, redirect to home
        if (isAuthenticated && (pathname === '/login' || pathname === '/login/forgot')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    // Default: Protect all other routes
    if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
