'use client'

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CursoCard from '@/components/CursoCard'
import DetalleCurso from '@/components/DetalleCurso'
import TodosInscriptos from '@/components/TodosInscriptos'
import Ranking from '@/components/Ranking'

const SECRET = process.env.NEXT_PUBLIC_LOCAL_PATH

export default function Local({ params }) {
  const { secret } = use(params)
  const [tab, setTab] = useState('cursos')
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [cursoAbierto, setCursoAbierto] = useState(null)
  const [filtroDictante, setFiltroDictante] = useState('')

  if (secret !== SECRET) return notFound()

  useEffect(() => { cargarCursos() }, [])

  async function cargarCursos() {
    setLoading(true)
    const { data } = await supabase
      .from('cursos')
      .select('*, inscriptos_data:inscriptos(*)')
      .order('fecha_desde', { ascending: false })
    setCursos(data || [])
    setLoading(false)
  }

  const dictantes = [...new Set(cursos.map(c => c.dictante).filter(Boolean))].sort()
  const cursosFiltrados = filtroDictante ? cursos.filter(c => c.dictante === filtroDictante) : cursos

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <img src="/logo.png" alt="Dental Medrano Training" />
            <span className="logo-sep">|</span>
            <span className="logo-label">Cursos</span>
          </div>
          <span style={{fontSize:'11px', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em'}}>Solo lectura</span>
        </div>
      </header>

      <main className="main">
        <div className="tabs">
          <button className={`tab ${tab === 'cursos' ? 'active' : ''}`} onClick={() => setTab('cursos')}>Cursos</button>
          <button className={`tab ${tab === 'inscriptos' ? 'active' : ''}`} onClick={() => setTab('inscriptos')}>Todos los inscriptos</button>
          <button className={`tab ${tab === 'ranking' ? 'active' : ''}`} onClick={() => setTab('ranking')}>Ranking</button>
        </div>

        {tab === 'cursos' && (
          <>
            {dictantes.length > 0 && (
              <div className="filtro-dictante">
                <button className={`btn-ghost btn-sm ${filtroDictante === '' ? 'active' : ''}`} onClick={() => setFiltroDictante('')}>Todos</button>
                {dictantes.map(d => (
                  <button key={d} className={`btn-ghost btn-sm ${filtroDictante === d ? 'active' : ''}`} onClick={() => setFiltroDictante(d)}>{d}</button>
                ))}
              </div>
            )}
            {loading ? (
              <div className="empty-state">Cargando...</div>
            ) : (
              <div className="grid">
                {cursosFiltrados.map(c => (
                  <CursoCard
                    key={c.id}
                    curso={c}
                    onAbrir={() => setCursoAbierto(c)}
                    onEditar={null}
                    onEliminar={null}
                    readOnly
                  />
                ))}
              </div>
            )}
          </>
        )}
        {tab === 'inscriptos' && <TodosInscriptos />}
        {tab === 'ranking' && <Ranking />}
      </main>

      {cursoAbierto && (
        <DetalleCurso
          curso={cursoAbierto}
          onClose={() => setCursoAbierto(null)}
          readOnly
        />
      )}
    </div>
  )
}
