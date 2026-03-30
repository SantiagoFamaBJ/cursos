'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('inscriptos')
        .select('nombre, dni, email, cursos(nombre)')
        .order('nombre', { ascending: true })

      const map = {}
      ;(data || []).forEach(i => {
        const key = (i.nombre || '').toLowerCase().trim()
        if (!map[key]) map[key] = { nombre: i.nombre, dni: i.dni, email: i.email, cursos: [] }
        if (i.cursos?.nombre) map[key].cursos.push(i.cursos.nombre)
      })

      const lista = Object.values(map)
        .sort((a, b) => b.cursos.length - a.cursos.length)

      setRanking(lista)
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <div className="empty-state">Cargando...</div>
  if (ranking.length === 0) return <div className="empty-state">No hay participantes todavía.</div>

  const total = ranking.length

  return (
    <div>
      <p style={{color: 'var(--text-3)', fontSize: '13px', marginBottom: '20px'}}>
        {total} participante{total !== 1 ? 's' : ''} únicos
      </p>
      <div className="ranking-list">
        {ranking.map((p, idx) => (
          <div key={idx} className="ranking-item">
            <div className={`ranking-pos ${idx < 3 && p.cursos.length > 1 ? 'top' : ''}`}>{idx + 1}</div>
            <div className="ranking-info">
              <div className="ranking-nombre">{p.nombre}</div>
              {p.dni && <div className="ranking-cursos-list">DNI {p.dni}</div>}
              {p.email && <div className="ranking-cursos-list">{p.email}</div>}
              <div className="ranking-cursos-list">{p.cursos.join(' · ')}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="ranking-count">{p.cursos.length}</div>
              <div className="ranking-count-label">curso{p.cursos.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
