-- ============================================
-- DENTAL MEDRANO TRAINING — Schema Supabase
-- Ejecutar en: Supabase > SQL Editor
-- ============================================

create table cursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha date,
  precio_usd numeric,
  precio_ars numeric,
  creado_en timestamptz default now()
);

create table inscriptos (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid references cursos(id) on delete cascade,
  nombre text not null,
  dni text,

  -- Pago 1
  pago1_monto numeric,
  pago1_moneda text check (pago1_moneda in ('ARS', 'USD')),
  pago1_ars_equivalente numeric,   -- si moneda=USD, el equiv en pesos para factura

  -- Pago 2
  pago2_monto numeric,
  pago2_moneda text check (pago2_moneda in ('ARS', 'USD')),
  pago2_ars_equivalente numeric,

  -- Tipo de cambio (referencia)
  tc_pago1 numeric,
  tc_pago2 numeric,

  -- Checkboxes administración
  confirmado_adm_pago1 boolean default false,
  confirmado_adm_pago2 boolean default false,
  factura_pago1 boolean default false,
  factura_pago2 boolean default false,

  creado_en timestamptz default now()
);

-- Deshabilitar RLS (acceso por link secreto, sin auth)
alter table cursos disable row level security;
alter table inscriptos disable row level security;
