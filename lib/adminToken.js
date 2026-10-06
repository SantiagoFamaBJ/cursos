// Token de sesión derivado de la clave (nunca se guarda la clave en la cookie)
export const ADMIN_PASSWORD = process.env.DM_ADMIN_PASSWORD || 'dm2026'

export async function adminToken() {
  const data = new TextEncoder().encode('dm-admin:' + ADMIN_PASSWORD)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
