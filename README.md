# Mundial 2026 — Porra Technip (reducida)

Fork interno: **landing**, **cuadro (bracket)**, **ranking global único**, **admin solo del bracket oficial** y **registro / login con email y contraseña** (hash en `profiles`, cookie `session_user`). Sin predicción de partidos, sin grupos privados, sin selector de tema ni admin de partidos.

## Requisitos

- Node.js 20+
- Proyecto Supabase vacío (o dedicado a esta app)

## Configuración

1. Copia `.env.local.example` a `.env.local` y rellena las variables de Supabase.
2. En el proyecto Supabase, aplica las migraciones de `supabase/migrations/` en orden (`001` … `004`).
3. Crea el **primer administrador**: en la tabla `profiles`, pon `role = 'admin'` al usuario que corresponda (tras su primer registro por la UI, o insertando la fila con el mismo `email` que usará).

## Auth por email

- **Registro** (`/register`): el servidor inserta en `profiles` con `email`, `full_name` y `password_hash` (PBKDF2). Tras el alta se establece la cookie `session_user`.
- **Login** (`/login`): valida email + contraseña contra `password_hash` y establece la misma cookie.
- No hay botón de Google en la UI; el callback en `/auth/callback` puede seguir existiendo por si en el futuro se usa Supabase Auth, pero el flujo MVP es solo email/contraseña.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Estructura relevante

- `src/app/app/simulador` — simulador de cuadro y guardado de predicciones.
- `src/app/app/ranking` — clasificación global (solo puntos de bracket).
- `src/app/app/admin/bracket` — panel admin del bracket oficial.
- `src/app/app/reglas` — resumen de puntuación solo cuadro.

## Repo remoto

Origen GitHub previsto: `https://github.com/denche2005/mundial-2026-technip.git`
