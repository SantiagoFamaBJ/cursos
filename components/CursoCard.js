'use client'

export default function CursoCard({ curso, onAbrir, onEditar, onEliminar }) {
  const count = curso.inscriptos?.[0]?.count ?? 0

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

  const fecha = formatFecha(curso.fecha_desde, curso.fecha_hasta)

  return (
    <div className="card" onClick={onAbrir}>
      <div className="card-body">
        <h2 className="card-title">{curso.nombre}</h2>
        {fecha && <p className="card-fecha">{fecha}</p>}
        <div className="card-meta">
          {curso.precio1_usd && (
            <span className="badge badge-usd">USD {curso.precio1_usd}{curso.precio1_hasta ? ` hasta ${new Date(curso.precio1_hasta + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}` : ''}</span>
          )}
          {curso.precio2_usd && (
            <span className="badge badge-usd">USD {curso.precio2_usd}</span>
          )}
          {curso.precio1_ars && <span className="badge badge-ars">$ {Number(curso.precio1_ars).toLocaleString('es-AR')}</span>}
        </div>
        <div className="card-inscriptos">
          <span className="inscriptos-count">{count}</span>
          <span className="inscriptos-label">inscripto{count !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="card-actions" onClick={e => e.stopPropagation()}>
        <button className="btn-ghost btn-sm" onClick={onEditar}>Editar</button>
        <button className="btn-ghost btn-sm btn-danger" onClick={onEliminar}>Eliminar</button>
      </div>
    </div>
  )
}
