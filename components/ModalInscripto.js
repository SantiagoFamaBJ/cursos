'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const empty = {
  nombre: '', dni: '', email: '', celular: '',
  pago1_monto: '', pago1_moneda: 'ARS', pago1_ars_equivalente: '', tc_pago1: '', link_pago1: false,
  pago2_monto: '', pago2_moneda: 'ARS', pago2_ars_equivalente: '', tc_pago2: '', link_pago2: false,
  confirmado_adm_pago1: false, confirmado_adm_pago2: false,
  factura_pago1: false, factura_pago2: false,
}

export default function ModalInscripto({ cursoId, inscripto, onClose, onSave }) {
  const init = inscripto ? {
    ...inscripto,
    dni: inscripto.dni || '',
    email: inscripto.email || '',
    celular: inscripto.celular || '',
    tc_pago1: inscripto.tc_pago1 ?? '',
    tc_pago2: inscripto.tc_pago2 ?? '',
    pago1_monto: inscripto.pago1_monto ?? '',
    pago2_monto: inscripto.pago2_monto ?? '',
    pago1_ars_equivalente: inscripto.pago1_ars_equivalente ?? '',
    pago2_ars_equivalente: inscripto.pago2_ars_equivalente ?? '',
    link_pago1: inscripto.link_pago1 ?? false,
    link_pago2: inscripto.link_pago2 ?? false,
  } : { ...empty }

  const [form, setForm] = useState(init)
  const [saving, setSaving] = useState(false)
  const [pagoUnico, setPagoUnico] = useState(!!(inscripto?.pago_unico))

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function guardar() {
    if (!(form.nombre || '').trim()) return alert('El nombre es obligatorio')
    setSaving(true)
    const num = v => { const n = parseFloat(v); return isNaN(n) ? null : n }
    const payload = {
      curso_id: cursoId,
      nombre: form.nombre.trim(),
      dni: (form.dni || '').trim() || null,
      email: (form.email || '').trim() || null,
      celular: (form.celular || '').trim() || null,
      pago1_monto: num(form.pago1_monto),
      pago1_moneda: form.pago1_monto ? form.pago1_moneda : null,
      pago1_ars_equivalente: form.pago1_moneda === 'USD' ? num(form.pago1_ars_equivalente) : null,
      tc_pago1: num(form.tc_pago1),
      link_pago1: !!form.link_pago1,
      pago_unico: !!pagoUnico,
      pago2_monto: pagoUnico ? null : num(form.pago2_monto),
      pago2_moneda: pagoUnico ? null : (form.pago2_monto ? form.pago2_moneda : null),
      pago2_ars_equivalente: pagoUnico ? null : (form.pago2_moneda === 'USD' ? num(form.pago2_ars_equivalente) : null),
      tc_pago2: pagoUnico ? null : num(form.tc_pago2),
      link_pago2: pagoUnico ? false : !!form.link_pago2,
      confirmado_adm_pago1: !!form.confirmado_adm_pago1,
      confirmado_adm_pago2: !!form.confirmado_adm_pago2,
      factura_pago1: !!form.factura_pago1,
      factura_pago2: !!form.factura_pago2,
    }
    const { error } = inscripto
      ? await supabase.from('inscriptos').update(payload).eq('id', inscripto.id)
      : await supabase.from('inscriptos').insert(payload)
    if (error) { alert('Error: ' + error.message); setSaving(false); return }
    setSaving(false)
    onSave()
  }

  return (
    <div className="overlay overlay-top" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{inscripto ? 'Editar inscripto' : 'Agregar inscripto'}</h3>
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

          <div className="section-label">1° Pago</div>
          <PagoFields
            monto={form.pago1_monto} moneda={form.pago1_moneda}
            equiv={form.pago1_ars_equivalente} tc={form.tc_pago1}
            link={form.link_pago1}
            onChange={(k, v) => set(k === 'tc' ? 'tc_pago1' : k === 'link' ? 'link_pago1' : `pago1_${k}`, v)}
          />

          <div className="section-label" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span>2° Pago</span>
            <label style={{display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', textTransform:'none', letterSpacing:'0', fontSize:'12px', color:'var(--text-2)'}}>
              <input type="checkbox" checked={pagoUnico} onChange={e => setPagoUnico(e.target.checked)} className="check" />
              Pago único
            </label>
          </div>
          {!pagoUnico && (
            <PagoFields
              monto={form.pago2_monto} moneda={form.pago2_moneda}
              equiv={form.pago2_ars_equivalente} tc={form.tc_pago2}
              link={form.link_pago2}
              onChange={(k, v) => set(k === 'tc' ? 'tc_pago2' : k === 'link' ? 'link_pago2' : `pago2_${k}`, v)}
            />
          )}

          <div className="section-label">Estado</div>
          <div className="checks-grid">
            {[
              ['confirmado_adm_pago1', 'Confirmado ADM 1°'],
              ['confirmado_adm_pago2', 'Confirmado ADM 2°'],
              ['factura_pago1', 'Factura 1°'],
              ['factura_pago2', 'Factura 2°'],
            ].map(([k, label]) => (
              <label key={k} className="check-label">
                <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} className="check" />
                {label}
              </label>
            ))}
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

function PagoFields({ monto, moneda, equiv, tc, link, onChange }) {
  return (
    <div className="pago-block">
      <div className="field-row">
        <label className="field field-grow">
          <span>Monto</span>
          <input type="text" inputMode="decimal" value={monto} onChange={e => onChange('monto', e.target.value)} placeholder="0" />
        </label>
        <label className="field">
          <span>Moneda</span>
          <select value={moneda} onChange={e => onChange('moneda', e.target.value)}>
            <option value="ARS">ARS $</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label className="field">
          <span>TC</span>
          <input type="text" inputMode="decimal" value={tc} onChange={e => onChange('tc', e.target.value)} placeholder="1435" />
        </label>
      </div>
      {moneda === 'USD' && (
        <label className="field field-equiv">
          <span>Equivalente en pesos <em>(para factura)</em></span>
          <div className="input-prefix">
            <span>$</span>
            <input type="text" inputMode="decimal" value={equiv} onChange={e => onChange('ars_equivalente', e.target.value)} placeholder="215.080" />
          </div>
        </label>
      )}
      <label className="check-label">
        <input type="checkbox" checked={!!link} onChange={e => onChange('link', e.target.checked)} className="check" />
        Pagó con link de pago
      </label>
    </div>
  )
}
