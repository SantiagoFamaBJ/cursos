// Reemplazo del cliente de Supabase en el navegador.
// Mantiene la misma forma (supabase.from('x').select().eq()...) para no tocar los componentes,
// pero cada consulta pasa por /api/db, que valida la sesión y usa la clave privada en el servidor.

class Consulta {
  constructor(table) {
    this.req = { table, action: null, columns: '*', filters: [], order: [], single: false }
  }
  select(columns = '*') {
    if (!this.req.action) this.req.action = 'select'
    this.req.columns = columns
    return this
  }
  insert(values) { this.req.action = 'insert'; this.req.values = values; return this }
  update(values) { this.req.action = 'update'; this.req.values = values; return this }
  delete() { this.req.action = 'delete'; return this }
  eq(col, value) { this.req.filters.push({ col, op: 'eq', value }); return this }
  in(col, value) { this.req.filters.push({ col, op: 'in', value }); return this }
  order(col, opts = {}) { this.req.order.push({ col, ascending: opts.ascending !== false }); return this }
  single() { this.req.single = true; return this }

  async ejecutar() {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(this.req),
      })
      const json = await res.json().catch(() => ({}))
      return { data: json.data ?? null, error: json.error ?? (res.ok ? null : { message: 'Error ' + res.status }) }
    } catch (e) {
      return { data: null, error: { message: 'Error de conexión' } }
    }
  }
  then(resolve, reject) { return this.ejecutar().then(resolve, reject) }
}

export const supabase = { from: (table) => new Consulta(table) }
