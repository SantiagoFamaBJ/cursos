import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

// Vista del dictante: con su código ve solo su curso y la lista de sus inscriptos.
export async function GET(_req, { params }) {
  const { codigo } = await params
  if (typeof codigo !== 'string' || codigo.trim().length < 4) {
    return NextResponse.json({ curso: null }, { status: 404 })
  }
  const db = supabaseAdmin()
  const { data: curso } = await db
    .from('cursos')
    .select('id, nombre, dictante, fecha_desde, fecha_hasta')
    .eq('codigo_dictante', codigo.trim())
    .maybeSingle()
  if (!curso) return NextResponse.json({ curso: null }, { status: 404 })

  const campos = 'nombre, dni, email, celular'
  const [{ data: inscriptos }, { data: interesados }] = await Promise.all([
    db.from('inscriptos').select(campos).eq('curso_id', curso.id).order('nombre', { ascending: true }),
    db.from('interesados').select(campos).eq('curso_id', curso.id).order('nombre', { ascending: true }),
  ])

  const { id, ...publico } = curso
  return NextResponse.json(
    { curso: publico, inscriptos: inscriptos || [], interesados: interesados || [] },
    { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
  )
}
