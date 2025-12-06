import { NextResponse } from 'next/server'

export function middleware(request) {
    // Get the pathname
    const path = request.nextUrl.pathname

    // Define protected routes
    const isProtectedRoute = path.startsWith('/dashboard')

    // Get auth status from cookie (we'll set this on login)
    const token = request.cookies.get('isLoggedIn')?.value

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    // Redirect to dashboard if logged in and trying to access login page
    if (path === '/admin-login' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

// Specify which routes to run middleware on
export const config = {
    matcher: ['/dashboard/:path*', '/admin-login']
}