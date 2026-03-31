'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const empty = { nombre: '', dni: '', celular: '', email: '' }

export default function ModalInteresado({ cursoId, interesado, onClose, onSave }) {
  const [form, setForm] = useState(interesado ? {
    nombre: interesado.nombre || '',
    dni: interesado.dni || '',
    celular: interesado.celular || '',
    email: interesado.email || '',
  } : { ...empty })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function guardar() {
    if (!form.nombre.trim()) return alert('El nombre es obligatorio')
    setSaving(true)
    const payload = {
      curso_id: cursoId,
      nombre: form.nombre.trim(),
      dni: form.dni.trim() || null,
      celular: form.celular.trim() || null,
      email: form.email.trim() || null,
    }
    const { error } = interesado
      ? await supabase.from('interesados').update(payload).eq('id', interesado.id)
      : await supabase.from('interesados').insert(payload)
    if (error) { alert('Error: ' + error.message); setSaving(false); return }
    setSaving(false)
    onSave()
  }

  return (
    <div className="overlay overlay-top" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{interesado ? 'Editar interesado' : 'Agregar interesado'}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="field">
            <span>Nombre completo</span>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="María Victoria Araiz" />
          </label>
          <div className="field-row">
            <label className="field field-grow">
              <span>DNI</span>
              <input value={form.dni} onChange={e => set('dni', e.target.value)} placeholder="44447562" />
            </label>
            <label className="field field-grow">
              <span>Celular</span>
              <input value={form.celular} onChange={e => set('celular', e.target.value)} placeholder="+54 11 1234-5678" />
            </label>
          </div>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="nombre@email.com" />
          </label>
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
