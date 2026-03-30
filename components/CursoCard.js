'use client'

export default function CursoCard({ curso, onAbrir, onEditar, onEliminar }) {
  const count = curso.inscriptos?.[0]?.count ?? 0
  const fecha = curso.fecha
    ? new Date(curso.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="card" onClick={onAbrir}>
      <div className="card-body">
        <h2 className="card-title">{curso.nombre}</h2>
        {fecha && <p className="card-fecha">{fecha}</p>}
        <div className="card-meta">
          {curso.precio_usd && <span className="badge badge-usd">USD {curso.precio_usd}</span>}
          {curso.precio_ars && <span className="badge badge-ars">$ {Number(curso.precio_ars).toLocaleString('es-AR')}</span>}
        </div>
        <div className="card-inscriptos">
          <span className="inscriptos-count">{count}</span>
          <span className="inscriptos-label">inscripto{count !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="card-actions" onClick={e => e.stopPropagation()}>
        <button className="btn-ghost" onClick={onEditar}>Editar</button>
        <button className="btn-ghost btn-danger" onClick={onEliminar}>Eliminar</button>
      </div>
    </div>
  )
}
