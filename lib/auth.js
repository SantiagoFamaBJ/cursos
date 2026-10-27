// Autenticación del panel. Solo se usa del lado del servidor (rutas API y middleware).
// Usa Web Crypto para funcionar igual en el middleware (edge) y en las rutas (node).

const enc = new TextEncoder()

export const ADMIN_COOKIE = 'admin_auth'
export const LOCAL_COOKIE = 'local_auth'

// Clave de admin: solo DM_ADMIN_PASSWORD (variable compartida de Dental Medrano). Sin valor por defecto:
// si no está configurada, nadie entra.
export function adminPassword() {
  return (process.env.DM_ADMIN_PASSWORD || '').trim()
}

// Rutas secretas. Se leen solo en el servidor, así no quedan en el JavaScript del navegador.
export function panelPath() {
  return (process.env.SECRET_PANEL_PATH || process.env.NEXT_PUBLIC_SECRET_PANEL_PATH || '').trim()
}

export function localPath() {
  return (process.env.LOCAL_PATH || process.env.NEXT_PUBLIC_LOCAL_PATH || '').trim()
}

async function hmac(key, message) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

// Token de sesión: deriva de la clave pero no la revela. Cambiar la clave cierra todas las sesiones.
export async function adminToken() {
  const pass = adminPassword()
  return pass ? hmac(pass, 'cursos-admin-v2') : null
}

export async function localToken() {
  const path = localPath()
  const pass = adminPassword()
  return path && pass ? hmac(pass, 'cursos-local-v2:' + path) : null
}

export async function isAdmin(cookies) {
  const expected = await adminToken()
  return !!expected && safeEqual(cookies.get(ADMIN_COOKIE)?.value, expected)
}

export async function isLocal(cookies) {
  const expected = await localToken()
  return !!expected && safeEqual(cookies.get(LOCAL_COOKIE)?.value, expected)
}

export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}
