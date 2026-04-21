'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const empty = {
  nombre: '', dni: '', email: '', celular: '',
  cantidad_pagos: 2,
  pago1_monto: '', pago1_moneda: 'ARS', pago1_ars_equivalente: '', tc_pago1: '', link_pago1: false,
  pago2_monto: '', pago2_moneda: 'ARS', pago2_ars_equivalente: '', tc_pago2: '', link_pago2: false,
  pago3_monto: '', pago3_moneda: 'ARS', pago3_ars_equivalente: '', tc_pago3: '', link_pago3: false,
  confirmado_adm_pago1: false, confirmado_adm_pago2: false, confirmado_adm_pago3: false,
  factura_pago1: false, factura_pago2: false, factura_pago3: false,
  pago_unico: false,
}

export default function ModalInscripto({ cursoId, inscripto, onClose, onSave }) {
  const init = inscripto ? {
    ...inscripto,
    dni: inscripto.dni || '',
    email: inscripto.email || '',
    celular: inscripto.celular || '',
    cantidad_pagos: inscripto.cantidad_pagos || 2,
    tc_pago1: inscripto.tc_pago1 ?? '',
    tc_pago2: inscripto.tc_pago2 ?? '',
    tc_pago3: inscripto.tc_pago3 ?? '',
    pago1_monto: inscripto.pago1_monto ?? '',
    pago2_monto: inscripto.pago2_monto ?? '',
    pago3_monto: inscripto.pago3_monto ?? '',
    pago1_ars_equivalente: inscripto.pago1_ars_equivalente ?? '',
    pago2_ars_equivalente: inscripto.pago2_ars_equivalente ?? '',
    pago3_ars_equivalente: inscripto.pago3_ars_equivalente ?? '',
    link_pago1: inscripto.link_pago1 ?? false,
    link_pago2: inscripto.link_pago2 ?? false,
    link_pago3: inscripto.link_pago3 ?? false,
    pago_unico: inscripto.pago_unico ?? false,
  } : { ...empty }

  const [form, setForm] = useState(init)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const num = v => { const n = parseFloat(v); return isNaN(n) ? null : n }

  const cantPagos = form.pago_unico ? 1 : form.cantidad_pagos

  async function guardar() {
    if (!(form.nombre || '').trim()) return alert('El nombre es obligatorio')
    setSaving(true)
    const payload = {
      curso_id: cursoId,
      nombre: form.nombre.trim(),
      dni: (form.dni || '').trim() || null,
      email: (form.email || '').trim() || null,
      celular: (form.celular || '').trim() || null,
      cantidad_pagos: cantPagos,
      pago_unico: !!form.pago_unico,
      pago1_monto: num(form.pago1_monto),
      pago1_moneda: form.pago1_monto ? form.pago1_moneda : null,
      pago1_ars_equivalente: form.pago1_moneda === 'USD' ? num(form.pago1_ars_equivalente) : null,
      tc_pago1: num(form.tc_pago1),
      link_pago1: !!form.link_pago1,
      confirmado_adm_pago1: !!form.confirmado_adm_pago1,
      factura_pago1: !!form.factura_pago1,
      pago2_monto: cantPagos >= 2 ? num(form.pago2_monto) : null,
      pago2_moneda: cantPagos >= 2 && form.pago2_monto ? form.pago2_moneda : null,
      pago2_ars_equivalente: cantPagos >= 2 && form.pago2_moneda === 'USD' ? num(form.pago2_ars_equivalente) : null,
      tc_pago2: cantPagos >= 2 ? num(form.tc_pago2) : null,
      link_pago2: cantPagos >= 2 ? !!form.link_pago2 : false,
      confirmado_adm_pago2: cantPagos >= 2 ? !!form.confirmado_adm_pago2 : false,
      factura_pago2: cantPagos >= 2 ? !!form.factura_pago2 : false,
      pago3_monto: cantPagos >= 3 ? num(form.pago3_monto) : null,
      pago3_moneda: cantPagos >= 3 && form.pago3_monto ? form.pago3_moneda : null,
      pago3_ars_equivalente: cantPagos >= 3 && form.pago3_moneda === 'USD' ? num(form.pago3_ars_equivalente) : null,
      tc_pago3: cantPagos >= 3 ? num(form.tc_pago3) : null,
      link_pago3: cantPagos >= 3 ? !!form.link_pago3 : false,
      confirmado_adm_pago3: cantPagos >= 3 ? !!form.confirmado_adm_pago3 : false,
      factura_pago3: cantPagos >= 3 ? !!form.factura_pago3 : false,
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

          <div className="section-label">Modalidad de pago</div>
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
            {[1,2,3].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => { set('cantidad_pagos', n); if (n === 1) set('pago_unico', true); else set('pago_unico', false) }}
                className={`btn-ghost btn-sm ${cantPagos === n ? 'active' : ''}`}
              >
                {n === 1 ? 'Pago único' : n === 2 ? '2 pagos' : '3 pagos'}
              </button>
            ))}
          </div>

          <div className="section-label">1° Pago</div>
          <PagoFields
            monto={form.pago1_monto} moneda={form.pago1_moneda}
            equiv={form.pago1_ars_equivalente} tc={form.tc_pago1} link={form.link_pago1}
            onChange={(k, v) => set(k === 'tc' ? 'tc_pago1' : k === 'link' ? 'link_pago1' : `pago1_${k}`, v)}
          />

          {cantPagos >= 2 && <>
            <div className="section-label">2° Pago</div>
            <PagoFields
              monto={form.pago2_monto} moneda={form.pago2_moneda}
              equiv={form.pago2_ars_equivalente} tc={form.tc_pago2} link={form.link_pago2}
              onChange={(k, v) => set(k === 'tc' ? 'tc_pago2' : k === 'link' ? 'link_pago2' : `pago2_${k}`, v)}
            />
          </>}

          {cantPagos >= 3 && <>
            <div className="section-label">3° Pago</div>
            <PagoFields
              monto={form.pago3_monto} moneda={form.pago3_moneda}
              equiv={form.pago3_ars_equivalente} tc={form.tc_pago3} link={form.link_pago3}
              onChange={(k, v) => set(k === 'tc' ? 'tc_pago3' : k === 'link' ? 'link_pago3' : `pago3_${k}`, v)}
            />
          </>}

          <div className="section-label">Estado</div>
          <div className="checks-grid">
            <label className="check-label"><input type="checkbox" checked={!!form.confirmado_adm_pago1} onChange={e => set('confirmado_adm_pago1', e.target.checked)} className="check" />Conf. ADM 1°</label>
            {cantPagos >= 2 && <label className="check-label"><input type="checkbox" checked={!!form.confirmado_adm_pago2} onChange={e => set('confirmado_adm_pago2', e.target.checked)} className="check" />Conf. ADM 2°</label>}
            {cantPagos >= 3 && <label className="check-label"><input type="checkbox" checked={!!form.confirmado_adm_pago3} onChange={e => set('confirmado_adm_pago3', e.target.checked)} className="check" />Conf. ADM 3°</label>}
            <label className="check-label"><input type="checkbox" checked={!!form.factura_pago1} onChange={e => set('factura_pago1', e.target.checked)} className="check" />Factura 1°</label>
            {cantPagos >= 2 && <label className="check-label"><input type="checkbox" checked={!!form.factura_pago2} onChange={e => set('factura_pago2', e.target.checked)} className="check" />Factura 2°</label>}
            {cantPagos >= 3 && <label className="check-label"><input type="checkbox" checked={!!form.factura_pago3} onChange={e => set('factura_pago3', e.target.checked)} className="check" />Factura 3°</label>}
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
