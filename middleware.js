import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const auth = request.cookies.get('admin_auth')?.value
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  // Only protect /panel routes
  if (pathname.startsWith('/panel')) {
    if (auth !== adminPassword) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/panel/:path*']
}
