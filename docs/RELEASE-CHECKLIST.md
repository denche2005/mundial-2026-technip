# Checklist de lanzamiento (Porra Mundial 2026)

Usar antes del primer deploy a producción y al conectar el dominio definitivo.

## Desarrollo local (red corporativa)

- [ ] Copiar [`.env.local.example`](../.env.local.example) a `.env.local` y ejecutar `npm run verify:env`.
- [ ] TLS: `NODE_EXTRA_CA_CERTS` apuntando al PEM corporativo **o** `npm run dev:insecure-tls -- --port 3000` (solo dev; no producción).
- [ ] Migraciones aplicadas al proyecto Supabase que uses (`supabase db push`).

## Alineación con IT (IIS / `wwwroot` / subpath)

Esta app **requiere Node.js** en runtime (Server Actions, sesión servidor). **No** es suficiente copiar solo HTML estático a `wwwroot` sin un proceso `next start` (o equivalente) detrás.

Preguntas para infraestructura:

- [ ] ¿Puede IIS hacer **reverse proxy** (ARR) de `https://host/zip_mundial/` a `http://127.0.0.1:<puerto>` donde corre Node?
- [ ] Si insisten en “solo archivos en `wwwroot`”: ¿hay **otra URL** con Node, o solo estático? (Si solo estático, habría que replantear auth — no soportado por el código actual.)
- [ ] ¿Certificado TLS interno y PEM para `NODE_EXTRA_CA_CERTS` en el servidor de build/CI?

Prueba rápida tras desplegar: `npm run hosting:probe -- https://host/zip_mundial/`.

## Entorno y secretos

- [ ] Copiar [`.env.local.example`](../.env.local.example) a `.env.local` (solo local) y configurar variables en el proveedor de hosting para producción.
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] `NEXT_PUBLIC_SITE_URL` = URL pública final (p. ej. `https://es001vs0062/zip_mundial`), sin barra final inconsistente.
- [ ] Si la app vive en subcarpeta: `NEXT_PUBLIC_BASE_PATH=/zip_mundial` **en el mismo build** que desplegáis (debe coincidir con la ruta real de IIS).

## Supabase

- [ ] Aplicar todas las migraciones en orden (`supabase db push` o pipeline CI contra el proyecto de producción).
- [ ] Incluir en especial: `024_match_predictions_kickoff_guard.sql`, `025_storage_avatars.sql`, `026_rotate_group_invite_ambiguous_group_id.sql` si el proyecto las usa.
- [ ] **Auth → URL configuration:** redirect URLs y site URL deben incluir el dominio de producción y la ruta de callback OAuth que use la app.
- [ ] Ejecutar scripts opcionales de confianza: `npm run audit:rls` y `npm run test:rls` con `.env.local` apuntando al proyecto correcto.

## Despliegue Node (`output: 'standalone'`)

Tras `npm run build`, Next genera `.next/standalone`. En el servidor, además de arrancar `node server.js` (o `node .next/standalone/server.js` según estructura), hay que copiar **`public/`** y **`.next/static`** junto al standalone según [la documentación de Next.js](https://nextjs.org/docs/app/building-your-application/deploying#nodejs-server) (artefacto típico en pipelines internos).

- [ ] Variables de entorno en runtime iguales que en build para `NEXT_PUBLIC_*` y `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Smoke: `next start` local con los mismos `NEXT_PUBLIC_BASE_PATH` / `NEXT_PUBLIC_SITE_URL` que producción antes de publicar.

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

Con subpath `NEXT_PUBLIC_BASE_PATH`, las mismas rutas van **detrás** del prefijo (p. ej. `/zip_mundial/login`).

Reglas de negocio detalladas: [ADMIN-AND-LOCKS.md](./ADMIN-AND-LOCKS.md).

## Dominio

Cuando compréis el dominio: actualizar `NEXT_PUBLIC_SITE_URL`, variables en Supabase Auth, y cualquier enlace absoluto generado (invitaciones `group_invites`, compartir bracket, etc.).
