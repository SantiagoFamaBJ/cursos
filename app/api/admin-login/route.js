import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminPassword, adminToken, panelPath, safeEqual, cookieOptions } from '@/lib/auth'

export async function POST(req) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  const pass = adminPassword()
  if (!pass || typeof password !== 'string' || !safeEqual(password.trim(), pass)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true, panel: panelPath() })
  res.cookies.set(ADMIN_COOKIE, await adminToken(), cookieOptions)
  return res
}
