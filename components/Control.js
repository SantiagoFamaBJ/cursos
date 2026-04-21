'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Control() {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: cursosData } = await supabase
        .from('cursos')
        .select('id, nombre, fecha_desde')
        .order('fecha_desde', { ascending: false })

      if (!cursosData) { setLoading(false); return }

      const { data: inscData } = await supabase
        .from('inscriptos')
        .select('nombre, curso_id, confirmado_adm_pago1, factura_pago1, link_pago1, cantidad_pagos, pago_unico')
        .in('curso_id', cursosData.map(c => c.id))

      const resultado = cursosData.map(c => ({
        ...c,
        pendientes: (inscData || [])
          .filter(i => i.curso_id === c.id && (!i.confirmado_adm_pago1 || !i.factura_pago1))
          .map(i => ({
            nombre: i.nombre,
            faltaConf: !i.confirmado_adm_pago1,
            faltaFactura: !i.factura_pago1,
            linkPago: !!i.link_pago1,
            pagoUnico: !!i.pago_unico,
            cantPagos: i.cantidad_pagos || 2,
          }))
      })).filter(c => c.pendientes.length > 0)

      setCursos(resultado)
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <div className="empty-state">Cargando...</div>

  if (cursos.length === 0) return (
    <div className="empty-state">
      <p>Todo en orden — no hay pendientes.</p>
    </div>
  )

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '28px'}}>
      {cursos.map(c => (
        <div key={c.id}>
          <h2 style={{
            fontFamily: 'Fraunces, serif', fontSize: '17px', fontWeight: '400',
            color: 'var(--text)', marginBottom: '12px',
            paddingBottom: '8px', borderBottom: '1px solid var(--border)'
          }}>
            {c.nombre}
            <span style={{fontSize: '12px', color: 'var(--text-3)', fontFamily: "'DM Sans', sans-serif", marginLeft: '10px'}}>
              {c.pendientes.length} pendiente{c.pendientes.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
            {c.pendientes.map((p, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: '8px'
              }}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{fontWeight: '500', fontSize: '14px', color: 'var(--text)'}}>{p.nombre}</span>
                  {p.linkPago && <span className="badge-link">Link</span>}
                  {p.pagoUnico && <span style={{fontSize:'10px', color:'var(--accent)', fontWeight:500}}>Pago único</span>}
                  {p.cantPagos === 3 && <span style={{fontSize:'10px', color:'var(--text-3)'}}>3 pagos</span>}
                </div>
                <div style={{display: 'flex', gap: '6px'}}>
                  {p.faltaConf && (
                    <span style={{fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: 'var(--warning-bg)', color: 'var(--warning-text)'}}>Conf. ADM</span>
                  )}
                  {p.faltaFactura && (
                    <span style={{fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: 'var(--danger-bg)', color: 'var(--danger-text)'}}>Factura</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
