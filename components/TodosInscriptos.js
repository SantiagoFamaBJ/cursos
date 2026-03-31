'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TodosInscriptos() {
  const [data, setData] = useState([])
  const [buscar, setBuscar] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('inscriptos')
        .select('nombre, dni, email, celular, cursos(nombre)')
        .order('nombre', { ascending: true })
      setData(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  // Contar cursos por nombre
  const conteo = {}
  data.forEach(i => {
    const key = (i.nombre || '').toLowerCase().trim()
    if (!conteo[key]) conteo[key] = 0
    conteo[key]++
  })

  const filtrados = data.filter(i =>
    i.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    i.dni?.includes(buscar) ||
    i.email?.toLowerCase().includes(buscar.toLowerCase())
  )

  return (
    <div>
      <div style={{marginBottom: '16px'}}>
        <input
          placeholder="Buscar por nombre, DNI o email..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          className="search-input"
        />
      </div>
      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <div className="table-wrap" style={{maxHeight: '65vh', borderRadius: '10px', border: '1px solid var(--border)'}}>
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Email</th>
                <th>Celular</th>
                <th>Curso</th>
                <th>Cursos</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((i, idx) => {
                const key = (i.nombre || '').toLowerCase().trim()
                return (
                  <tr key={idx}>
                    <td className="td-num">{idx + 1}</td>
                    <td><div className="td-nombre">{i.nombre}</div></td>
                    <td>{i.dni || '—'}</td>
                    <td>{i.email || '—'}</td>
                    <td>{i.celular || '—'}</td>
                    <td><div className="td-curso">{i.cursos?.nombre || '—'}</div></td>
                    <td className="td-cursos-count">{conteo[key] || 1}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
