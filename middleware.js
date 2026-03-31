import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = 'dmt123'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const auth = request.cookies.get('admin_auth')?.value

  if (pathname.startsWith('/panel')) {
    if (auth !== ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/panel/:path*']
}
