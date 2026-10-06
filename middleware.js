import { NextResponse } from 'next/server'
import { adminToken } from './lib/adminToken'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Rutas viejas → ruta oficial del admin
  if (pathname === '/admin' || pathname === '/login') {
    return NextResponse.redirect(new URL('/ADMIN', request.url))
  }

  if (pathname.startsWith('/panel')) {
    const auth = request.cookies.get('admin_auth')?.value
    if (auth !== (await adminToken())) {
      return NextResponse.redirect(new URL('/ADMIN', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/panel/:path*', '/admin', '/login']
}
