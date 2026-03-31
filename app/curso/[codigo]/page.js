'use client'

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CursoDictante({ params }) {
  const { codigo } = use(params)
  const [curso, setCurso] = useState(null)
  const [inscriptos, setInscriptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: cursos } = await supabase
        .from('cursos')
        .select('*')
        .eq('codigo_dictante', codigo)
        .single()

      if (!cursos) { setLoading(false); return }
      setCurso(cursos)

      const { data: insc } = await supabase
        .from('inscriptos')
        .select('nombre, dni, email, celular')
        .eq('curso_id', cursos.id)
        .order('nombre', { ascending: true })

      setInscriptos(insc || [])
      setLoading(false)
    }
    cargar()
  }, [codigo])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)'}}>
      <p style={{color:'var(--text-2)'}}>Cargando...</p>
    </div>
  )

  if (!curso) return notFound()

  function formatFecha(desde, hasta) {
    if (!desde) return null
    const d = new Date(desde + 'T00:00:00')
    const opts = { day: 'numeric', month: 'long', year: 'numeric' }
    if (!hasta || desde === hasta) return d.toLocaleDateString('es-AR', opts)
    const h = new Date(hasta + 'T00:00:00')
    if (d.getMonth() === h.getMonth()) return `${d.getDate()} al ${h.toLocaleDateString('es-AR', opts)}`
    return `${d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} — ${h.toLocaleDateString('es-AR', opts)}`
  }

  const filtrados = inscriptos.filter(i =>
    i.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    i.dni?.includes(buscar)
  )

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <img src="/logo.png" alt="Dental Medrano Training" />
          </div>
        </div>
      </header>

      <main className="main" style={{maxWidth:'720px'}}>
        <div style={{marginBottom:'28px'}}>
          <h1 style={{fontFamily:'Fraunces, serif', fontSize:'26px', fontWeight:'400', color:'var(--text)', marginBottom:'6px'}}>{curso.nombre}</h1>
          {curso.dictante && <p style={{color:'var(--accent)', fontSize:'14px', fontWeight:'500', marginBottom:'4px'}}>{curso.dictante}</p>}
          {formatFecha(curso.fecha_desde, curso.fecha_hasta) && (
            <p style={{color:'var(--text-3)', fontSize:'13px'}}>{formatFecha(curso.fecha_desde, curso.fecha_hasta)}</p>
          )}
        </div>

        <div style={{marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{color:'var(--text-3)', fontSize:'13px'}}>{filtrados.length} inscripto{filtrados.length !== 1 ? 's' : ''}</span>
        </div>

        <input
          placeholder="Buscar por nombre o DNI..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          className="search-input"
          style={{marginBottom:'16px'}}
        />

        <div style={{borderRadius:'10px', border:'1px solid var(--border)', overflow:'hidden'}}>
          <table className="tabla" style={{width:'100%'}}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Email</th>
                <th>Celular</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign:'center', padding:'32px', color:'var(--text-3)'}}>No hay inscriptos.</td></tr>
              ) : (
                filtrados.map((i, idx) => (
                  <tr key={idx}>
                    <td className="td-num">{idx + 1}</td>
                    <td><div className="td-nombre">{i.nombre}</div></td>
                    <td>{i.dni || '—'}</td>
                    <td>{i.email || '—'}</td>
                    <td>{i.celular || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
