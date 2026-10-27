import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, LOCAL_COOKIE, adminToken, localToken, panelPath, localPath, safeEqual, cookieOptions } from './lib/auth'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const seg = decodeURIComponent(pathname.split('/')[2] || '')

  // /login quedó viejo: el ingreso es /ADMIN
  if (pathname === '/login') return NextResponse.redirect(new URL('/ADMIN', request.url))

  // Panel: requiere sesión de admin y la ruta secreta correcta
  if (pathname.startsWith('/panel')) {
    const token = await adminToken()
    const ok = token && safeEqual(request.cookies.get(ADMIN_COOKIE)?.value, token)
    const path = panelPath()
    if (!ok || (path && !safeEqual(seg, path))) {
      return NextResponse.redirect(new URL('/ADMIN', request.url))
    }
  }

  // Vista local (solo lectura): el link secreto da una sesión de lectura
  if (pathname.startsWith('/local')) {
    const path = localPath()
    const token = await localToken()
    if (!path || !token || !safeEqual(seg, path)) {
      return NextResponse.rewrite(new URL('/404', request.url))
    }
    const res = NextResponse.next()
    res.cookies.set(LOCAL_COOKIE, token, cookieOptions)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/panel/:path*', '/local/:path*', '/login'],
}
