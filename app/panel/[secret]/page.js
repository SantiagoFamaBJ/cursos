'use client'

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CursoCard from '@/components/CursoCard'
import ModalCurso from '@/components/ModalCurso'
import DetalleCurso from '@/components/DetalleCurso'

const SECRET = process.env.NEXT_PUBLIC_SECRET_PANEL_PATH

export default function Panel({ params }) {
  const { secret } = use(params)
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCurso, setModalCurso] = useState(null)
  const [cursoAbierto, setCursoAbierto] = useState(null)

  if (secret !== SECRET) return notFound()

  useEffect(() => {
    cargarCursos()
  }, [])

  async function cargarCursos() {
    setLoading(true)
    const { data } = await supabase
      .from('cursos')
      .select('*, inscriptos(count)')
      .order('fecha_desde', { ascending: false })
    setCursos(data || [])
    setLoading(false)
  }

  async function eliminarCurso(id) {
    if (!confirm('¿Eliminar este curso y todos sus inscriptos?')) return
    await supabase.from('cursos').delete().eq('id', id)
    cargarCursos()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">✦</span>
            Dental Medrano Training
            <span className="logo-sep">—</span>
            Cursos
          </div>
          <button className="btn-primary" onClick={() => setModalCurso('nuevo')}>
            + Nuevo curso
          </button>
        </div>
      </header>

      <main className="main">
        {loading ? (
          <div className="empty-state">Cargando...</div>
        ) : cursos.length === 0 ? (
          <div className="empty-state">
            <p>No hay cursos todavía.</p>
            <button className="btn-primary" onClick={() => setModalCurso('nuevo')}>
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="grid">
            {cursos.map(c => (
              <CursoCard
                key={c.id}
                curso={c}
                onAbrir={() => setCursoAbierto(c)}
                onEditar={() => setModalCurso(c)}
                onEliminar={() => eliminarCurso(c.id)}
              />
            ))}
          </div>
        )}
      </main>

      {modalCurso && (
        <ModalCurso
          curso={modalCurso === 'nuevo' ? null : modalCurso}
          onClose={() => setModalCurso(null)}
          onSave={() => { setModalCurso(null); cargarCursos() }}
        />
      )}

      {cursoAbierto && (
        <DetalleCurso
          curso={cursoAbierto}
          onClose={() => setCursoAbierto(null)}
        />
      )}
    </div>
  )
}
