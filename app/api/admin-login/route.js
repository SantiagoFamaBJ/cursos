import { NextResponse } from 'next/server'
import { ADMIN_PASSWORD, adminToken } from '../../../lib/adminToken'

export async function POST(req) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  if (typeof password !== 'string' || password.trim() !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true, panel: process.env.NEXT_PUBLIC_SECRET_PANEL_PATH || '' })
  res.cookies.set('admin_auth', await adminToken(), {
    httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
