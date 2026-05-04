'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ModalInscripto from './ModalInscripto'
import ModalInteresado from './ModalInteresado'
import ModalConfirmarInscripcion from './ModalConfirmarInscripcion'

const COLS = [
  { key: 'confirmado_adm_pago1', label: 'Conf. ADM 1°' },
  { key: 'confirmado_adm_pago2', label: 'Conf. ADM 2°' },
  { key: 'confirmado_adm_pago3', label: 'Conf. ADM 3°' },
  { key: 'factura_pago1', label: 'Factura 1°' },
  { key: 'factura_pago2', label: 'Factura 2°' },
  { key: 'factura_pago3', label: 'Factura 3°' },
]

function fmt(monto, moneda, equiv) {
  if (!monto) return '—'
  if (moneda === 'USD') {
    const arsStr = equiv ? ` ($${Number(equiv).toLocaleString('es-AR')})` : ''
    return `${monto} USD${arsStr}`
  }
  return `$${Number(monto).toLocaleString('es-AR')}`
}

export default function DetalleCurso({ curso, onClose, readOnly }) {
  const [inscriptos, setInscriptos] = useState([])
  const [buscar, setBuscar] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalInscripto, setModalInscripto] = useState(null)
  const [sortCol, setSortCol] = useState(null)
  const [sortAsc, setSortAsc] = useState(false)
  const [vista, setVista] = useState('inscriptos')
  const [interesados, setInteresados] = useState([])
  const [modalInteresado, setModalInteresado] = useState(null)
  const [modalConfirmar, setModalConfirmar] = useState(null)

  useEffect(() => { cargar(); cargarInteresados() }, [curso.id])

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

  async function cargarInteresados() {
    const { data } = await supabase
      .from('interesados').select('*')
      .eq('curso_id', curso.id)
      .order('creado_en', { ascending: true })
    setInteresados(data || [])
  }

  async function eliminarInteresado(id) {
    if (!confirm('¿Eliminar este interesado?')) return
    await supabase.from('interesados').delete().eq('id', id)
    setInteresados(prev => prev.filter(i => i.id !== id))
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

  function toggleSort(key) {
    if (sortCol === key) setSortAsc(a => !a)
    else { setSortCol(key); setSortAsc(false) }
  }

  function exportarCSV() {
    const headers = ['Nombre', 'DNI', 'Celular', 'Email', 'Pagos', '1° Pago', 'TC 1°', '2° Pago', 'TC 2°', '3° Pago', 'TC 3°', 'Conf ADM 1°', 'Conf ADM 2°', 'Conf ADM 3°', 'Factura 1°', 'Factura 2°', 'Factura 3°']
    const rows = inscriptos.map(i => [
      i.nombre, i.dni || '', i.celular || '', i.email || '',
      i.cantidad_pagos || 2,
      fmt(i.pago1_monto, i.pago1_moneda, i.pago1_ars_equivalente), i.tc_pago1 || '',
      fmt(i.pago2_monto, i.pago2_moneda, i.pago2_ars_equivalente), i.tc_pago2 || '',
      fmt(i.pago3_monto, i.pago3_moneda, i.pago3_ars_equivalente), i.tc_pago3 || '',
      i.confirmado_adm_pago1 ? 'Sí' : 'No',
      i.confirmado_adm_pago2 ? 'Sí' : 'No',
      i.confirmado_adm_pago3 ? 'Sí' : 'No',
      i.factura_pago1 ? 'Sí' : 'No',
      i.factura_pago2 ? 'Sí' : 'No',
      i.factura_pago3 ? 'Sí' : 'No',
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${curso.nombre.replace(/\s+/g, '_')}.csv`
    a.click()
  }

  const filtrados = [...inscriptos].filter(i =>
    i.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    i.dni?.includes(buscar) ||
    i.email?.toLowerCase().includes(buscar.toLowerCase())
  ).sort((a, b) => {
    if (!sortCol) return 0
    const va = a[sortCol] ? 1 : 0
    const vb = b[sortCol] ? 1 : 0
    return sortAsc ? va - vb : vb - va
  })

  // Only show pago3 col if any inscripto has 3 pagos
  const hasPago3 = inscriptos.some(i => (i.cantidad_pagos || 2) >= 3)
  const visibleCols = hasPago3 ? COLS : COLS.filter(c => !c.key.includes('pago3'))

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{curso.nombre}</h3>
            <span className="modal-sub">{inscriptos.length} inscriptos{!readOnly && ` · ${interesados.length} interesados`}</span>
          </div>
          <div className="modal-header-actions">
            {vista === 'inscriptos' && !readOnly && <button className="btn-ghost" onClick={exportarCSV}>↓ CSV</button>}
            {vista === 'inscriptos' && !readOnly && <button className="btn-primary" onClick={() => setModalInscripto('nuevo')}>+ Inscripto</button>}
            {vista === 'interesados' && <button className="btn-primary" onClick={() => setModalInteresado('nuevo')}>+ Interesado</button>}
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={{padding:'0 26px', borderBottom:'1px solid var(--border)', display:'flex', gap:'4px', flexShrink:0}}>
          <button className={`tab ${vista === 'inscriptos' ? 'active' : ''}`} onClick={() => setVista('inscriptos')}>Inscriptos ({inscriptos.length})</button>
          {!readOnly && <button className={`tab ${vista === 'interesados' ? 'active' : ''}`} onClick={() => setVista('interesados')}>Interesados ({interesados.length})</button>}
        </div>

        <div className="modal-search">
          <input placeholder="Buscar por nombre, DNI o email..." value={buscar} onChange={e => setBuscar(e.target.value)} className="search-input" />
        </div>

        {vista === 'inscriptos' && <div className="table-wrap">
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
                  {hasPago3 && <th>3° Pago</th>}
                  {hasPago3 && <th>TC 3°</th>}
                  {visibleCols.map(c => (
                    <th key={c.key} onClick={() => toggleSort(c.key)} style={{cursor:'pointer', userSelect:'none'}}>
                      {c.label} {sortCol === c.key ? (sortAsc ? '↑' : '↓') : <span style={{opacity:.3}}>↕</span>}
                    </th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((i, idx) => (
                  <tr key={i.id} style={i.estado === 'baja' ? {opacity:.5, textDecoration:'line-through'} : {}}>
                    <td className="td-num">{idx + 1}</td>
                    <td>
                      <div className="td-nombre">{i.nombre}</div>
                      <div className="td-dni">{i.dni ? <>DNI {i.dni}</> : <span className="td-falta">Falta DNI</span>}</div>
                      <div className="td-dni">{i.celular ? <>📱 {i.celular}</> : <span className="td-falta">Falta celular</span>}</div>
                      <div className="td-email">{i.email || <span className="td-falta">Falta email</span>}</div>
                      {i.pago_unico && <span style={{fontSize:'10px',color:'var(--accent)',fontWeight:500}}>Pago único</span>}
                      {i.estado === 'baja' && <span style={{fontSize:'10px',color:'var(--danger)',fontWeight:500}}>⚠ Baja</span>}
                      {(i.cantidad_pagos||2) === 3 && <span style={{fontSize:'10px',color:'var(--text-3)'}}>3 pagos</span>}
                    </td>
                    <td>
                      <div>{fmt(i.pago1_monto, i.pago1_moneda, i.pago1_ars_equivalente)}</div>
                      {i.link_pago1 && <span className="badge-link">Link</span>}
                    </td>
                    <td>{i.tc_pago1 ? `$${Number(i.tc_pago1).toLocaleString('es-AR')}` : '—'}</td>
                    <td>
                      <div>{fmt(i.pago2_monto, i.pago2_moneda, i.pago2_ars_equivalente)}</div>
                      {i.link_pago2 && <span className="badge-link">Link</span>}
                    </td>
                    <td>{i.tc_pago2 ? `$${Number(i.tc_pago2).toLocaleString('es-AR')}` : '—'}</td>
                    {hasPago3 && <td>
                      <div>{fmt(i.pago3_monto, i.pago3_moneda, i.pago3_ars_equivalente)}</div>
                      {i.link_pago3 && <span className="badge-link">Link</span>}
                    </td>}
                    {hasPago3 && <td>{i.tc_pago3 ? `$${Number(i.tc_pago3).toLocaleString('es-AR')}` : '—'}</td>}
                    {visibleCols.map(c => (
                      <td key={c.key} className="td-check">
                        {readOnly ? (
                          <span style={{color: i[c.key] ? 'var(--success-text)' : 'var(--text-3)', fontSize:'14px'}}>
                            {i[c.key] ? '✓' : '—'}
                          </span>
                        ) : (
                          <input type="checkbox" checked={!!i[c.key]} onChange={() => toggleCheck(i.id, c.key, i[c.key])} className="check" />
                        )}
                      </td>
                    ))}
                    <td className="td-actions">
                      {!readOnly && <div className="td-actions-inner">
                        <button className="btn-ghost btn-sm" onClick={() => setModalInscripto(i)}>Editar</button>
                        <button className="btn-ghost btn-sm btn-danger" onClick={() => eliminar(i.id)}>✕</button>
                      </div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>}

        {vista === 'interesados' && (
          <div className="table-wrap">
            {interesados.length === 0 ? (
              <div className="empty-state">No hay interesados.</div>
            ) : (
              <table className="tabla">
                <thead>
                  <tr>
                    <th>#</th><th>Nombre</th><th>DNI</th><th>Celular</th><th>Email</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {interesados.map((i, idx) => (
                    <tr key={i.id} style={i.estado === 'baja' ? {opacity:.5, textDecoration:'line-through'} : {}}>
                      <td className="td-num">{idx + 1}</td>
                      <td><div className="td-nombre">{i.nombre}</div></td>
                      <td>{i.dni || '—'}</td>
                      <td>{i.celular || '—'}</td>
                      <td>{i.email || '—'}</td>
                      <td className="td-actions">
                        <div className="td-actions-inner">
                          <button className="btn-ghost btn-sm" style={{color:'var(--accent)', borderColor:'var(--accent)'}} onClick={() => setModalConfirmar(i)}>✓ Confirmar</button>
                          <button className="btn-ghost btn-sm" onClick={() => setModalInteresado(i)}>Editar</button>
                          <button className="btn-ghost btn-sm btn-danger" onClick={() => eliminarInteresado(i.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

      {modalInscripto && (
        <ModalInscripto
          cursoId={curso.id}
          inscripto={modalInscripto === 'nuevo' ? null : modalInscripto}
          onClose={() => setModalInscripto(null)}
          onSave={() => { setModalInscripto(null); cargar() }}
        />
      )}
      {modalInteresado && (
        <ModalInteresado
          cursoId={curso.id}
          interesado={modalInteresado === 'nuevo' ? null : modalInteresado}
          onClose={() => setModalInteresado(null)}
          onSave={() => { setModalInteresado(null); cargarInteresados() }}
        />
      )}
      {modalConfirmar && (
        <ModalConfirmarInscripcion
          cursoId={curso.id}
          interesado={modalConfirmar}
          onClose={() => setModalConfirmar(null)}
          onSave={() => { setModalConfirmar(null); cargar(); cargarInteresados() }}
        />
      )}
    </div>
  )
}
