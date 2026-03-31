'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ModalConfirmarInscripcion({ cursoId, interesado, onClose, onSave }) {
  const [form, setForm] = useState({
    pago1_monto: '', pago1_moneda: 'ARS', pago1_ars_equivalente: '', tc_pago1: '', link_pago1: false,
    pago2_monto: '', pago2_moneda: 'ARS', pago2_ars_equivalente: '', tc_pago2: '', link_pago2: false,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const num = v => { const n = parseFloat(v); return isNaN(n) ? null : n }

  async function confirmar() {
    setSaving(true)
    // Insert as inscripto
    const payload = {
      curso_id: cursoId,
      nombre: interesado.nombre,
      dni: interesado.dni || null,
      celular: interesado.celular || null,
      email: interesado.email || null,
      pago1_monto: num(form.pago1_monto),
      pago1_moneda: form.pago1_monto ? form.pago1_moneda : null,
      pago1_ars_equivalente: form.pago1_moneda === 'USD' ? num(form.pago1_ars_equivalente) : null,
      tc_pago1: num(form.tc_pago1),
      link_pago1: !!form.link_pago1,
      pago2_monto: num(form.pago2_monto),
      pago2_moneda: form.pago2_monto ? form.pago2_moneda : null,
      pago2_ars_equivalente: form.pago2_moneda === 'USD' ? num(form.pago2_ars_equivalente) : null,
      tc_pago2: num(form.tc_pago2),
      link_pago2: !!form.link_pago2,
    }
    const { error } = await supabase.from('inscriptos').insert(payload)
    if (error) { alert('Error: ' + error.message); setSaving(false); return }
    // Delete from interesados
    await supabase.from('interesados').delete().eq('id', interesado.id)
    setSaving(false)
    onSave()
  }

  return (
    <div className="overlay overlay-top" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Confirmar inscripción</h3>
            <span className="modal-sub">{interesado.nombre}</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="section-label">1° Pago</div>
          <PagoFields
            monto={form.pago1_monto} moneda={form.pago1_moneda}
            equiv={form.pago1_ars_equivalente} tc={form.tc_pago1} link={form.link_pago1}
            onChange={(k, v) => set(k === 'tc' ? 'tc_pago1' : k === 'link' ? 'link_pago1' : `pago1_${k}`, v)}
          />
          <div className="section-label">2° Pago</div>
          <PagoFields
            monto={form.pago2_monto} moneda={form.pago2_moneda}
            equiv={form.pago2_ars_equivalente} tc={form.tc_pago2} link={form.link_pago2}
            onChange={(k, v) => set(k === 'tc' ? 'tc_pago2' : k === 'link' ? 'link_pago2' : `pago2_${k}`, v)}
          />
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={confirmar} disabled={saving}>
            {saving ? 'Confirmando...' : '✓ Confirmar inscripción'}
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
