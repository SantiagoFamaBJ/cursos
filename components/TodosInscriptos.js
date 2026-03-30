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
        .select('*, cursos(nombre, fecha_desde)')
        .order('nombre', { ascending: true })
      setData(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const filtrados = data.filter(i =>
    i.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    i.dni?.includes(buscar) ||
    i.email?.toLowerCase().includes(buscar.toLowerCase())
  )

  // Agrupar por nombre+dni para ver cuántos cursos hizo cada uno
  const conteo = {}
  data.forEach(i => {
    const key = (i.nombre || '').toLowerCase().trim()
    if (!conteo[key]) conteo[key] = 0
    conteo[key]++
  })

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
        <div className="table-wrap" style={{maxHeight: '60vh', borderRadius: '10px', border: '1px solid var(--border)'}}>
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Participante</th>
                <th>Curso</th>
                <th>1° Pago</th>
                <th>2° Pago</th>
                <th>Cursos</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((i, idx) => {
                const key = (i.nombre || '').toLowerCase().trim()
                const totalCursos = conteo[key] || 1
                return (
                  <tr key={i.id}>
                    <td className="td-num">{idx + 1}</td>
                    <td>
                      <div className="td-nombre">{i.nombre}</div>
                      {i.dni && <div className="td-dni">DNI {i.dni}</div>}
                      {i.email && <div className="td-email">{i.email}</div>}
                    </td>
                    <td>
                      <div className="td-curso">{i.cursos?.nombre}</div>
                      {i.cursos?.fecha_desde && (
                        <div className="td-dni">{new Date(i.cursos.fecha_desde + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      )}
                    </td>
                    <td>{i.pago1_monto ? (i.pago1_moneda === 'USD' ? `${i.pago1_monto} USD` : `$${Number(i.pago1_monto).toLocaleString('es-AR')}`) : '—'}</td>
                    <td>{i.pago2_monto ? (i.pago2_moneda === 'USD' ? `${i.pago2_monto} USD` : `$${Number(i.pago2_monto).toLocaleString('es-AR')}`) : '—'}</td>
                    <td className="td-cursos-count">{totalCursos}</td>
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
