'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ModalInscripto from './ModalInscripto'

const COLS = [
  { key: 'confirmado_adm_pago1', label: 'Conf. ADM 1°' },
  { key: 'confirmado_adm_pago2', label: 'Conf. ADM 2°' },
  { key: 'factura_pago1', label: 'Factura 1°' },
  { key: 'factura_pago2', label: 'Factura 2°' },
]

function fmt(monto, moneda, equiv) {
  if (!monto) return '—'
  if (moneda === 'USD') {
    const arsStr = equiv ? ` ($${Number(equiv).toLocaleString('es-AR')})` : ''
    return `${monto} USD${arsStr}`
  }
  return `$${Number(monto).toLocaleString('es-AR')}`
}

export default function DetalleCurso({ curso, onClose }) {
  const [inscriptos, setInscriptos] = useState([])
  const [buscar, setBuscar] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalInscripto, setModalInscripto] = useState(null)

  useEffect(() => { cargar() }, [curso.id])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase
      .from('inscriptos')
      .select('*')
      .eq('curso_id', curso.id)
      .order('creado_en', { ascending: true })
    setInscriptos(data || [])
    setLoading(false)
  }

  async function toggleCheck(id, campo, valor) {
    await supabase.from('inscriptos').update({ [campo]: !valor }).eq('id', id)
    setInscriptos(prev => prev.map(i => i.id === id ? { ...i, [campo]: !valor } : i))
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este inscripto?')) return
    await supabase.from('inscriptos').delete().eq('id', id)
    setInscriptos(prev => prev.filter(i => i.id !== id))
  }

  function exportarCSV() {
    const headers = ['Nombre', 'DNI', 'Email', '1° Pago', 'TC 1°', '2° Pago', 'TC 2°', 'Conf ADM 1°', 'Conf ADM 2°', 'Factura 1°', 'Factura 2°']
    const rows = inscriptos.map(i => [
      i.nombre, i.dni || '', i.email || '',
      fmt(i.pago1_monto, i.pago1_moneda, i.pago1_ars_equivalente), i.tc_pago1 || '',
      fmt(i.pago2_monto, i.pago2_moneda, i.pago2_ars_equivalente), i.tc_pago2 || '',
      i.confirmado_adm_pago1 ? 'Sí' : 'No',
      i.confirmado_adm_pago2 ? 'Sí' : 'No',
      i.factura_pago1 ? 'Sí' : 'No',
      i.factura_pago2 ? 'Sí' : 'No',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${curso.nombre.replace(/\s+/g, '_')}.csv`
    a.click()
  }

  const filtrados = inscriptos.filter(i =>
    i.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    i.dni?.includes(buscar) ||
    i.email?.toLowerCase().includes(buscar.toLowerCase())
  )

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{curso.nombre}</h3>
            <span className="modal-sub">{inscriptos.length} inscriptos</span>
          </div>
          <div className="modal-header-actions">
            <button className="btn-ghost" onClick={exportarCSV}>↓ Exportar CSV</button>
            <button className="btn-primary" onClick={() => setModalInscripto('nuevo')}>+ Agregar</button>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-search">
          <input
            placeholder="Buscar por nombre, DNI o email..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">Cargando...</div>
          ) : filtrados.length === 0 ? (
            <div className="empty-state">No hay inscriptos.</div>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participante</th>
                  <th>1° Pago</th>
                  <th>TC 1°</th>
                  <th>2° Pago</th>
                  <th>TC 2°</th>
                  {COLS.map(c => <th key={c.key}>{c.label}</th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((i, idx) => (
                  <tr key={i.id}>
                    <td className="td-num">{idx + 1}</td>
                    <td>
                      <div className="td-nombre">{i.nombre}</div>
                      {i.dni && <div className="td-dni">DNI {i.dni}</div>}
                      {i.email && <div className="td-email">{i.email}</div>}
                    </td>
                    <td>{fmt(i.pago1_monto, i.pago1_moneda, i.pago1_ars_equivalente)}</td>
                    <td>{i.tc_pago1 ? `$${Number(i.tc_pago1).toLocaleString('es-AR')}` : '—'}</td>
                    <td>{fmt(i.pago2_monto, i.pago2_moneda, i.pago2_ars_equivalente)}</td>
                    <td>{i.tc_pago2 ? `$${Number(i.tc_pago2).toLocaleString('es-AR')}` : '—'}</td>
                    {COLS.map(c => (
                      <td key={c.key} className="td-check">
                        <input
                          type="checkbox"
                          checked={!!i[c.key]}
                          onChange={() => toggleCheck(i.id, c.key, i[c.key])}
                          className="check"
                        />
                      </td>
                    ))}
                    <td className="td-actions">
                      <div className="td-actions-inner">
                        <button className="btn-ghost btn-sm" onClick={() => setModalInscripto(i)}>Editar</button>
                        <button className="btn-ghost btn-sm btn-danger" onClick={() => eliminar(i.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalInscripto && (
        <ModalInscripto
          cursoId={curso.id}
          inscripto={modalInscripto === 'nuevo' ? null : modalInscripto}
          onClose={() => setModalInscripto(null)}
          onSave={() => { setModalInscripto(null); cargar() }}
        />
      )}
    </div>
  )
}
