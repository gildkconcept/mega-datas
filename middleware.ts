import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './middleware/auth'

export async function middleware(request: NextRequest) {
  const user = await verifyToken(request)
  const { pathname } = request.nextUrl

  console.log('=== MIDDLEWARE ===')
  console.log('Path:', pathname)
  console.log('User:', user)

  // Routes protégées
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      console.log('→ Non authentifié, redirection vers login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      console.log('→ Non authentifié, redirection vers login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user.role !== 'admin') {
      console.log('→ Pas admin, redirection vers dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Rediriger les utilisateurs connectés loin des pages auth
  if ((pathname === '/login' || pathname === '/register') && user) {
    if (user.role === 'admin') {
      console.log('→ Admin connecté, redirection vers admin')
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    console.log('→ User connecté, redirection vers dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
}