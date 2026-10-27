import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdmin, localPath } from '@/lib/auth'

// Link "Vista local" del panel: solo un admin obtiene la ruta secreta (no queda en el JavaScript público).
export async function GET(req) {
  const path = localPath()
  if (!path || !(await isAdmin(await cookies()))) {
    return NextResponse.redirect(new URL('/ADMIN', req.url))
  }
  return NextResponse.redirect(new URL(`/local/${encodeURIComponent(path)}`, req.url))
}
