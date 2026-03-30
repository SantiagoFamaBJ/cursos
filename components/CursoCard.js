'use client'

export default function CursoCard({ curso, onAbrir, onEditar, onEliminar }) {
  const inscriptos = curso.inscriptos_data || []
  const count = inscriptos.length || curso.inscriptos?.[0]?.count || 0

  // Countdown
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

  // Financiero
  function calcFinanciero() {
    let total = 0
    let pendientes = 0
    inscriptos.forEach(i => {
      const p1 = i.pago1_moneda === 'USD' ? (i.pago1_ars_equivalente || 0) : (i.pago1_monto || 0)
      const p2 = i.pago2_moneda === 'USD' ? (i.pago2_ars_equivalente || 0) : (i.pago2_monto || 0)
      total += Number(p1) + Number(p2)
      if (!i.pago2_monto) pendientes++
    })
    return { total, pendientes }
  }

  const countdown = getCountdown()
  const fecha = formatFecha(curso.fecha_desde, curso.fecha_hasta)
  const { total, pendientes } = calcFinanciero()

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
        <div className="card-stats">
          <div className="card-stat">
            <span className="card-stat-value">{count}</span>
            <span className="card-stat-label">Inscriptos</span>
          </div>
          <div className="card-stat">
            <span className={`card-stat-value ${pendientes > 0 ? 'warning' : ''}`}>{pendientes}</span>
            <span className="card-stat-label">2° pago pend.</span>
          </div>
          <div className="card-stat">
            <span className="card-stat-value" style={{fontSize:'14px', paddingTop:'4px'}}>
              {total > 0 ? `$${Math.round(total/1000)}k` : '—'}
            </span>
            <span className="card-stat-label">Recaudado</span>
            {total > 0 && <span className="card-stat-sub">ARS</span>}
          </div>
        </div>
      </div>
      <div className="card-actions" onClick={e => e.stopPropagation()}>
        <button className="btn-ghost btn-sm" onClick={onEditar}>Editar</button>
        <button className="btn-ghost btn-sm btn-danger" onClick={onEliminar}>Eliminar</button>
      </div>
    </div>
  )
}
