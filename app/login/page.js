'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'dmt123'
const PANEL_PATH = process.env.NEXT_PUBLIC_SECRET_PANEL_PATH

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  function handleSubmit(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      document.cookie = `admin_auth=${ADMIN_PASSWORD}; max-age=${60*60*24*365}; path=/`
      router.push(`/panel/${PANEL_PATH}`)
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)', padding: '24px'
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '360px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <img src="/logo.png" alt="Dental Medrano Training" style={{height: '40px', marginBottom: '16px'}} />
          <p style={{color: 'var(--text-3)', fontSize: '13px'}}>Panel de administración</p>
        </div>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="••••••••"
              autoFocus
              style={{borderColor: error ? 'var(--danger)' : undefined}}
            />
            {error && <span style={{color: 'var(--danger)', fontSize: '12px'}}>Contraseña incorrecta</span>}
          </label>
          <button type="submit" className="btn-primary" style={{width: '100%', padding: '11px'}}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
