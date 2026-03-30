# Dental Medrano Training — App de inscriptos

App web privada para gestionar inscriptos a cursos. Acceso por link secreto, sin login.

---

## Stack
- **Next.js 15** (App Router)
- **Supabase** (base de datos PostgreSQL)
- **Vercel** (deploy automático desde GitHub)

---

## Setup paso a paso

### 1. Supabase — crear la base de datos

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo
2. Una vez creado, andá a **SQL Editor**
3. Pegá el contenido de `supabase_schema.sql` y ejecutalo (botón **Run**)
4. Guardá estos dos valores (los vas a necesitar después):
   - `Project URL` → en Settings > API
   - `anon public key` → en Settings > API

---

### 2. Proyecto local

```bash
# Clonar / crear el proyecto
cd dental-medrano-training
npm install

# Copiar variables de entorno
cp .env.local.example .env.local
```

Editá `.env.local` con tus valores reales:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1N...
NEXT_PUBLIC_SECRET_PANEL_PATH=a8f3k2x9
```

> **Importante**: cambiá `a8f3k2x9` por cualquier código secreto que quieras. 
> Ese código va a ser parte de la URL: `tuapp.vercel.app/panel/TU_CODIGO`
> Podés generar uno en: https://www.random.org/strings/

Probalo localmente:
```bash
npm run dev
# Abrí: http://localhost:3000/panel/a8f3k2x9
```

---

### 3. GitHub

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

---

### 4. Vercel — deploy

1. Entrá a [vercel.com](https://vercel.com) → **Add New Project**
2. Importá el repositorio de GitHub
3. En **Environment Variables** agregá las tres variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SECRET_PANEL_PATH`
4. Click **Deploy** — listo

Cada vez que hagas `git push`, Vercel redeploya automáticamente.

---

## Uso

### URL de acceso
```
https://TU-APP.vercel.app/panel/TU_CODIGO_SECRETO
```

Compartí este link con tu equipo. La raíz (`/`) no muestra nada.

### Flujo
1. **Dashboard** → ves todas las cards de cursos
2. **+ Nuevo curso** → nombre, fecha, precio
3. Click en una card → se abre la tabla de inscriptos
4. **+ Agregar** → formulario con nombre, DNI, pagos
   - Si el pago es en USD → aparece campo extra para el equivalente en pesos (para la factura)
5. Los checkboxes (Conf. ADM, Factura) se guardan al instante al hacer click
6. **↓ Exportar CSV** → descarga el archivo listo para abrir en Excel

---

## Seguridad
- La URL secreta no está indexada (robots noindex)
- Supabase tiene RLS desactivado pero la `anon key` solo permite leer/escribir (no borrar la base)
- Si querés más seguridad en el futuro, se puede activar Supabase Auth fácilmente
