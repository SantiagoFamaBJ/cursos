'use client'

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CursoCard from '@/components/CursoCard'
import ModalCurso from '@/components/ModalCurso'
import DetalleCurso from '@/components/DetalleCurso'
import TodosInscriptos from '@/components/TodosInscriptos'
import Ranking from '@/components/Ranking'
import Control from '@/components/Control'

const SECRET = process.env.NEXT_PUBLIC_SECRET_PANEL_PATH

export default function Panel({ params }) {
  const { secret } = use(params)
  const [tab, setTab] = useState('cursos')
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCurso, setModalCurso] = useState(null)
  const [cursoAbierto, setCursoAbierto] = useState(null)
  const [filtroDictante, setFiltroDictante] = useState('')

  if (secret !== SECRET) return notFound()

  useEffect(() => { cargarCursos() }, [])

  async function cargarCursos() {
    setLoading(true)
    const { data: cursosData } = await supabase
      .from('cursos')
      .select('*')
      .order('fecha_desde', { ascending: false })

    if (!cursosData) { setLoading(false); return }

    const ids = cursosData.map(c => c.id)

    const { data: inscData } = await supabase
      .from('inscriptos')
      .select('*')
      .in('curso_id', ids)

    const { data: interData } = await supabase
      .from('interesados')
      .select('*')
      .in('curso_id', ids)

    const cursosConDatos = cursosData.map(c => ({
      ...c,
      inscriptos_data: (inscData || []).filter(i => i.curso_id === c.id),
      interesados_data: (interData || []).filter(i => i.curso_id === c.id),
    }))

    setCursos(cursosConDatos)
    setLoading(false)
  }

  async function eliminarCurso(id) {
    if (!confirm('¿Eliminar este curso y todos sus inscriptos?')) return
    await supabase.from('cursos').delete().eq('id', id)
    cargarCursos()
  }

  // Dictantes únicos para el filtro
  const dictantes = [...new Set(cursos.map(c => c.dictante).filter(Boolean))].sort()

  const cursosFiltrados = filtroDictante
    ? cursos.filter(c => c.dictante === filtroDictante)
    : cursos

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <img src="/logo.png" alt="Dental Medrano Training" />
            <span className="logo-sep">|</span>
            <span className="logo-label">Cursos</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <a
              href={`/local/${process.env.NEXT_PUBLIC_LOCAL_PATH}`}
              target="_blank"
              style={{fontSize:'13px', color:'var(--text-3)', textDecoration:'none', borderBottom:'1px solid var(--border)'}}
            >
              Vista local ↗
            </a>
            {tab === 'cursos' && (
              <button className="btn-primary" onClick={() => setModalCurso('nuevo')}>
                + Nuevo curso
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="tabs">
          <button className={`tab ${tab === 'cursos' ? 'active' : ''}`} onClick={() => setTab('cursos')}>Cursos</button>
          <button className={`tab ${tab === 'inscriptos' ? 'active' : ''}`} onClick={() => setTab('inscriptos')}>Todos los inscriptos</button>
          <button className={`tab ${tab === 'ranking' ? 'active' : ''}`} onClick={() => setTab('ranking')}>Ranking</button>
          <button className={`tab ${tab === 'control' ? 'active' : ''}`} onClick={() => setTab('control')}>Control</button>
        </div>

        {tab === 'cursos' && (
          <>
            {dictantes.length > 0 && (
              <div className="filtro-dictante">
                <button
                  className={`btn-ghost btn-sm ${filtroDictante === '' ? 'active' : ''}`}
                  onClick={() => setFiltroDictante('')}
                >
                  Todos
                </button>
                {dictantes.map(d => (
                  <button
                    key={d}
                    className={`btn-ghost btn-sm ${filtroDictante === d ? 'active' : ''}`}
                    onClick={() => setFiltroDictante(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
            {loading ? (
              <div className="empty-state">Cargando...</div>
            ) : cursosFiltrados.length === 0 ? (
              <div className="empty-state">
                <p>No hay cursos todavía.</p>
                <button className="btn-primary" onClick={() => setModalCurso('nuevo')}>Crear el primero</button>
              </div>
            ) : (
              <div className="grid">
                {cursosFiltrados.map(c => (
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
          </>
        )}

        {tab === 'inscriptos' && <TodosInscriptos />}
        {tab === 'ranking' && <Ranking />}
        {tab === 'control' && <Control />}
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
          onClose={() => { setCursoAbierto(null); cargarCursos() }}
        />
      )}
    </div>
  )
}
