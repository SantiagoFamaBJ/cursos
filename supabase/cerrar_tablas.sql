-- Cierra las tablas con datos personales de cursos.
-- Correr SOLO después de que esté en producción la versión que lee y escribe por /api/db
-- y de cargar SUPABASE_SERVICE_ROLE_KEY en Vercel.
-- Sin políticas = la clave pública no puede leer ni escribir; el servidor (service_role) sí.

alter table public.inscriptos enable row level security;
alter table public.interesados enable row level security;

-- La tabla "cursos" la comparte la app de encuestas: se cierra cuando se migre esa app.

-- Para deshacer (si algo falla):
-- alter table public.inscriptos disable row level security;
-- alter table public.interesados disable row level security;
