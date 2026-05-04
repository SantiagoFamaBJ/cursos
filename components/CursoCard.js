'use client'

export default function CursoCard({ curso, onAbrir, onEditar, onEliminar, readOnly, localView }) {
  const inscriptos = curso.inscriptos_data || []
  const activos = inscriptos.filter(i => i.estado !== 'baja')
  const count = activos.length || curso.inscriptos?.[0]?.count || 0
  const interesadosCount = curso.interesados_data?.length || 0

  function getCountdown() {
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const desde = curso.fecha_desde ? new Date(curso.fecha_desde + 'T00:00:00') : null
    const hasta = curso.fecha_hasta ? new Date(curso.fecha_hasta + 'T00:00:00') : desde
    if (!desde) return null
    if (hoy > hasta) return { label: 'Curso finalizado', color: 'red' }
    if (hoy >= desde) return { label: 'En curso', color: 'yellow' }
    const dias = Math.ceil((desde - hoy) / 86400000)
    if (dias <= 14) return { label: `Faltan ${dias} día${dias !== 1 ? 's' : ''}`, color: 'yellow' }
    return { label: `Faltan ${dias} días`, color: 'green' }
  }

  function formatFecha(desde, hasta) {
    if (!desde) return null
    const d = new Date(desde + 'T00:00:00')
    const opts = { day: 'numeric', month: 'long', year: 'numeric' }
    if (!hasta || desde === hasta) return d.toLocaleDateString('es-AR', opts)
    const h = new Date(hasta + 'T00:00:00')
    if (d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear()) {
      return `${d.getDate()} al ${h.toLocaleDateString('es-AR', opts)}`
    }
    return `${d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} — ${h.toLocaleDateString('es-AR', opts)}`
  }

  function formatMonto(n) {
    if (n >= 1000000) return `$${(n/1000000).toFixed(2).replace('.', ',')}M`
    return `$${Math.round(n/1000)}k`
  }

  function calcFinanciero() {
    let total = 0, pendientes = 0, factura1Pend = 0, factura2Pend = 0
    activos.forEach(i => {
      const p1 = i.pago1_moneda === 'USD' ? (i.pago1_ars_equivalente || 0) : (i.pago1_monto || 0)
      const p2 = i.pago2_moneda === 'USD' ? (i.pago2_ars_equivalente || 0) : (i.pago2_monto || 0)
      const p3 = i.pago3_moneda === 'USD' ? (i.pago3_ars_equivalente || 0) : (i.pago3_monto || 0)
      total += Number(p1) + Number(p2) + Number(p3)
      const cantPagos = i.cantidad_pagos || 2
      if (!i.pago_unico && cantPagos >= 2 && !i.pago2_monto) pendientes++
      if (i.confirmado_adm_pago1 && !i.factura_pago1) factura1Pend++
      if (i.confirmado_adm_pago2 && !i.factura_pago2) factura2Pend++
    })
    return { total, pendientes, factura1Pend, factura2Pend }
  }

  const countdown = getCountdown()
  const fecha = formatFecha(curso.fecha_desde, curso.fecha_hasta)
  const { total, pendientes, factura1Pend, factura2Pend } = calcFinanciero()
  const pct = Math.min(Math.round(count / 24 * 100), 100)

  return (
    <div className="card" onClick={onAbrir}>
      {countdown && (
        <div className={`card-countdown ${countdown.color}`}>
          <span className="card-countdown-dot" />
          {countdown.label}
        </div>
      )}

      <div className="card-body">
        <h2 className="card-title">{curso.nombre}</h2>
        {curso.dictante && <p className="card-dictante">{curso.dictante}</p>}
        {fecha && <p className="card-fecha">{fecha}</p>}
        <div className="card-meta">
          {curso.precio1_usd && <span className="badge badge-usd">USD {curso.precio1_usd}{curso.precio1_hasta ? ` hasta ${new Date(curso.precio1_hasta+'T00:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'})}` : ''}</span>}
          {curso.precio2_usd && <span className="badge badge-usd">USD {curso.precio2_usd}</span>}
          {curso.precio1_ars && <span className="badge badge-ars">$ {Number(curso.precio1_ars).toLocaleString('es-AR')}</span>}
        </div>
      </div>

      <div className="card-bottom">
        <div className="card-progress-row">
          <div className="card-progress-count">
            <span className="card-progress-num">{count}</span>
            <span className="card-progress-max">/24</span>
            <span className="card-progress-text">inscriptos</span>
            {interesadosCount > 0 && !localView && <span className="card-progress-interesados">{interesadosCount} inter.</span>}
          </div>
          <div className="card-progress-bar">
            <div className="card-progress-fill" style={{width:`${pct}%`}} />
          </div>
        </div>
        <div className="card-stats">
          {localView ? (
            <>
              <div className="card-stat">
                <span className={`card-stat-value ${factura1Pend > 0 ? 'warning' : ''}`}>{factura1Pend}</span>
                <span className="card-stat-label">Factura 1° pend.</span>
              </div>
              <div className="card-stat">
                <span className={`card-stat-value ${factura2Pend > 0 ? 'warning' : ''}`}>{factura2Pend}</span>
                <span className="card-stat-label">Factura 2° pend.</span>
              </div>
            </>
          ) : (
            <>
              <div className="card-stat">
                <span className={`card-stat-value ${pendientes > 0 ? 'warning' : ''}`}>{pendientes}</span>
                <span className="card-stat-label">2° pago pend.</span>
              </div>
              <div className="card-stat">
                <span className="card-stat-value">{total > 0 ? formatMonto(total) : '—'}</span>
                <span className="card-stat-label">Recaudado ARS</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card-actions" onClick={e => e.stopPropagation()}>
        {curso.codigo_dictante && (
          <button
            className="btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation()
              const url = `${window.location.origin}/curso/${curso.codigo_dictante}`
              if (navigator.share) {
                navigator.share({ title: curso.nombre, url })
              } else {
                navigator.clipboard.writeText(url)
                const btn = e.currentTarget
                const prev = btn.textContent
                btn.textContent = '✓ Copiado'
                setTimeout(() => { btn.textContent = prev }, 1500)
              }
            }}
          >🔗 Link dictante</button>
        )}
        {!readOnly && (
          <>
            <button className="btn-ghost btn-sm" onClick={onEditar}>Editar</button>
            <button className="btn-ghost btn-sm btn-danger" onClick={onEliminar}>Eliminar</button>
          </>
        )}
      </div>
    </div>
  )
}
