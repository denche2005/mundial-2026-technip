# Checklist de lanzamiento (Porra Mundial 2026 — Technip)

## Local

- [ ] `.env.local` desde `.env.local.example` · `npm run verify:env`
- [ ] Migraciones `supabase/migrations/` 001–004 aplicadas
- [ ] `npm run dev` o `npm run dev:insecure-tls -- --port 3000` (proxy corporativo)
- [ ] Smoke: `/` · `/login` · `/register` · `/app/simulador` · `/app/ranking` · `/app/reglas`

## Producción IIS (`/zip_mundial`)

- [ ] **No** desplegar código fuente ni apps MVC en `wwwroot`; usar artefacto `dist/zip_mundial/` tras `npm run build:deploy`
- [ ] `NEXT_PUBLIC_BASE_PATH=/zip_mundial` y `NEXT_PUBLIC_SITE_URL` en el **mismo** build
- [ ] Node en el servidor + reverse proxy IIS (ARR) al proceso `node server.js`
- [ ] `npm run hosting:probe -- https://es001vs0062/zip_mundial/`

## Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Primer admin: `profiles.role = 'admin'`

## Calidad

- [ ] `npm run lint` · `npm run test` · `npm run build`
