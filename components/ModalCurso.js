'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ModalCurso({ curso, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: curso?.nombre || '',
    fecha: curso?.fecha || '',
    precio_usd: curso?.precio_usd || '',
    precio_ars: curso?.precio_ars || '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function guardar() {
    if (!form.nombre.trim()) return alert('El nombre es obligatorio')
    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      fecha: form.fecha || null,
      precio_usd: form.precio_usd || null,
      precio_ars: form.precio_ars || null,
    }
    if (curso) {
      await supabase.from('cursos').update(payload).eq('id', curso.id)
    } else {
      await supabase.from('cursos').insert(payload)
    }
    setSaving(false)
    onSave()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{curso ? 'Editar curso' : 'Nuevo curso'}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="field">
            <span>Nombre del curso</span>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Implantología avanzada" />
          </label>
          <label className="field">
            <span>Fecha</span>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Precio USD</span>
              <input type="number" value={form.precio_usd} onChange={e => set('precio_usd', e.target.value)} placeholder="380" />
            </label>
            <label className="field">
              <span>Precio ARS referencia</span>
              <input type="number" value={form.precio_ars} onChange={e => set('precio_ars', e.target.value)} placeholder="215.000" />
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={guardar} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
