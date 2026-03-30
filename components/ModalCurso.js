'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ModalCurso({ curso, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: curso?.nombre || '',
    dictante: curso?.dictante || '',
    fecha_desde: curso?.fecha_desde || '',
    fecha_hasta: curso?.fecha_hasta || '',
    precio1_usd: curso?.precio1_usd || '',
    precio1_hasta: curso?.precio1_hasta || '',
    precio2_usd: curso?.precio2_usd || '',
    precio1_ars: curso?.precio1_ars || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function guardar() {
    if (!form.nombre.trim()) return alert('El nombre es obligatorio')
    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      dictante: form.dictante.trim() || null,
      fecha_desde: form.fecha_desde || null,
      fecha_hasta: form.fecha_hasta || null,
      precio1_usd: form.precio1_usd || null,
      precio1_hasta: form.precio1_hasta || null,
      precio2_usd: form.precio2_usd || null,
      precio1_ars: form.precio1_ars || null,
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
            <span>Dictante</span>
            <input value={form.dictante} onChange={e => set('dictante', e.target.value)} placeholder="Ej: Dr. Sifontes" />
          </label>
          <div className="field-row">
            <label className="field field-grow">
              <span>Fecha inicio</span>
              <input type="date" value={form.fecha_desde} onChange={e => set('fecha_desde', e.target.value)} />
            </label>
            <label className="field field-grow">
              <span>Fecha fin</span>
              <input type="date" value={form.fecha_hasta} onChange={e => set('fecha_hasta', e.target.value)} />
            </label>
          </div>
          <div className="section-label">Precios</div>
          <div className="field-row">
            <label className="field field-grow">
              <span>1° Precio USD</span>
              <input type="number" value={form.precio1_usd} onChange={e => set('precio1_usd', e.target.value)} placeholder="315" />
            </label>
            <label className="field field-grow">
              <span>Válido hasta</span>
              <input type="date" value={form.precio1_hasta} onChange={e => set('precio1_hasta', e.target.value)} />
            </label>
          </div>
          <div className="field-row">
            <label className="field field-grow">
              <span>2° Precio USD</span>
              <input type="number" value={form.precio2_usd} onChange={e => set('precio2_usd', e.target.value)} placeholder="350" />
            </label>
            <label className="field field-grow">
              <span>Precio ARS referencia</span>
              <input type="number" value={form.precio1_ars} onChange={e => set('precio1_ars', e.target.value)} placeholder="215.000" />
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
