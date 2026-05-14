# Checklist de lanzamiento (Porra Mundial 2026)

Usar antes del primer deploy a producción y al conectar el dominio definitivo.

## Entorno y secretos

- [ ] Copiar [`.env.local.example`](../.env.local.example) a `.env.local` (solo local) y configurar variables en el proveedor de hosting para producción.
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] `NEXT_PUBLIC_SITE_URL` = URL pública final (`https://tu-dominio.com`), sin barra final inconsistente.

## Supabase

- [ ] Aplicar todas las migraciones en orden (`supabase db push` o pipeline CI contra el proyecto de producción).
- [ ] Incluir en especial: `024_match_predictions_kickoff_guard.sql`, `025_storage_avatars.sql`, `026_rotate_group_invite_ambiguous_group_id.sql` si el proyecto las usa.
- [ ] **Auth → URL configuration:** redirect URLs y site URL deben incluir el dominio de producción y la ruta de callback OAuth que use la app.
- [ ] Ejecutar scripts opcionales de confianza: `npm run audit:rls` y `npm run test:rls` con `.env.local` apuntando al proyecto correcto.

## PWA

- [ ] Iconos [`public/icon-192.png`](../public/icon-192.png) y [`public/icon-512.png`](../public/icon-512.png) presentes tras deploy.
- [ ] Probar en Chrome (Android o desktop): instalación “Añadir a la pantalla de inicio”.
- [ ] El service worker [`public/sw.js`](../public/sw.js) solo se registra en **producción** ([`ServiceWorkerRegister`](../src/components/service-worker-register.tsx)); validar en build `next build` + `next start`, no solo en `next dev`.

## Calidad antes del deploy

- [ ] `npm run lint`
- [ ] `npm run test` (requiere `vitest` instalado: `npm install` en la raíz del repo)
- [ ] `npm run build`

## Smoke manual (tras deploy o `next start`)

Rutas mínimas: `/` → login/registro → `/app/tema` (si aplica) → `/app/predicciones` → `/app/simulador` → `/app/ranking` → `/app/grupos` → `/app/perfil`. Con rol admin: `/app/admin/partidos` y bracket oficial si lo usáis.

Reglas de negocio detalladas: [ADMIN-AND-LOCKS.md](./ADMIN-AND-LOCKS.md).

## Dominio

Cuando compréis el dominio: actualizar `NEXT_PUBLIC_SITE_URL`, variables en Supabase Auth, y cualquier enlace absoluto generado (invitaciones `group_invites`, compartir bracket, etc.).
