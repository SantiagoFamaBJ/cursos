import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { isAdmin, isLocal } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Puente entre el panel y la base: el navegador ya no habla directo con Supabase.
// Admin: lee y escribe. Vista local: solo lee. Sin sesión: nada.
const TABLAS = new Set(['cursos', 'inscriptos', 'interesados'])
const ACCIONES = new Set(['select', 'insert', 'update', 'delete'])
const COLUMNA = /^[a-z0-9_]+$/
const SELECT = /^[a-z0-9_,\s()*]+$/i

const error = (message, status) => NextResponse.json({ data: null, error: { message } }, { status })

export async function POST(req) {
  const jar = await cookies()
  const admin = await isAdmin(jar)
  const local = !admin && (await isLocal(jar))
  if (!admin && !local) return error('No autorizado', 401)

  const body = await req.json().catch(() => null)
  if (!body) return error('Pedido inválido', 400)
  const { table, action, columns = '*', filters = [], order = [], single = false, values } = body

  if (!TABLAS.has(table) || !ACCIONES.has(action)) return error('Operación no permitida', 400)
  if (action !== 'select' && !admin) return error('Solo lectura', 403)
  if (typeof columns !== 'string' || !SELECT.test(columns)) return error('Columnas inválidas', 400)
  if (!Array.isArray(filters) || !Array.isArray(order)) return error('Pedido inválido', 400)
  for (const f of filters) {
    if (!f || !COLUMNA.test(f.col) || !['eq', 'in'].includes(f.op)) return error('Filtro inválido', 400)
    if (f.op === 'in' && !Array.isArray(f.value)) return error('Filtro inválido', 400)
  }
  for (const o of order) if (!o || !COLUMNA.test(o.col)) return error('Orden inválido', 400)
  // Nunca editar o borrar sin filtro (evita vaciar una tabla por error)
  if ((action === 'update' || action === 'delete') && filters.length === 0) return error('Falta filtro', 400)
  if ((action === 'insert' || action === 'update') && (!values || typeof values !== 'object')) return error('Faltan datos', 400)

  let db
  try {
    db = supabaseAdmin()
  } catch (e) {
    console.error('[api/db] config:', e.message)
    return error('Falta configuración del servidor', 500)
  }
  let q = db.from(table)
  if (action === 'select') q = q.select(columns)
  if (action === 'insert') q = q.insert(values)
  if (action === 'update') q = q.update(values)
  if (action === 'delete') q = q.delete()
  for (const f of filters) q = f.op === 'eq' ? q.eq(f.col, f.value) : q.in(f.col, f.value)
  for (const o of order) q = q.order(o.col, { ascending: o.ascending !== false })
  if (single) q = q.single()

  const { data, error: err } = await q
  if (err) console.error('[api/db]', table, action, err.message)
  return NextResponse.json({ data: data ?? null, error: err ? { message: err.message } : null })
}
