# Mundial 2026 — Porra Technip

Porra interna: landing, registro/login, simulador de cuadro eliminatorio, ranking global y panel admin del bracket oficial.

## Stack

| Capa | Tecnología | Para qué |
|------|------------|----------|
| Framework | **Next.js 15** (App Router) | Rutas, SSR, Server Actions |
| UI | **React 19** + **Tailwind CSS 4** | Componentes y estilos Technip |
| Datos | **Supabase** (Postgres) | Perfiles, predicciones, resultados, vista de ranking |
| Auth | Cookie `session_user` + hash en `profiles` | Login email/contraseña (sin OAuth en UI) |
| Tests | **Vitest** | Lógica del bracket (`generateKnockout`, `stableThirds`) |

## Arrancar en local

```powershell
cd c:\Users\dcherednychenko\Documents\mundial-2026-technip
copy .env.local.example .env.local
# Edita .env.local con tus claves Supabase

npm install
npm run verify:env

# Red corporativa (certificado proxy): una de estas dos
npm run dev:insecure-tls -- --port 3000
# o: npm run dev

# Si falla la caché de Next:
npm run dev:fresh
```

Abre **http://localhost:3000**

- Landing: `/`
- Login: `/login` · Registro: `/register`
- App (requiere sesión): `/app/simulador` · `/app/ranking` · `/app/reglas`
- Admin: `/app/admin/bracket` (usuario con `role = admin` en Supabase)

## Estructura del repo

```
mundial-2026-technip/
├── public/                 # Estáticos (logo, manifest, service worker)
├── scripts/                # Utilidades (build deploy, TLS dev, probes)
├── supabase/migrations/    # Esquema SQL (001–004)
├── src/
│   ├── app/                # Rutas Next (páginas y API)
│   │   ├── page.tsx        # Landing pública
│   │   ├── login/ register/
│   │   ├── app/            # Zona autenticada
│   │   │   ├── layout.tsx  # Barra superior + nav inferior
│   │   │   ├── simulador/  # Cuadro + actions (guardar picks)
│   │   │   ├── ranking/
│   │   │   ├── reglas/
│   │   │   └── admin/bracket/
│   │   └── api/admin/bracket/  # API admin (opcional)
│   ├── components/         # UI reutilizable
│   │   ├── bracket-simulator.tsx   # Fase grupos + knockout
│   │   ├── bracket-scoring-table.tsx
│   │   ├── admin-bracket-panel.tsx
│   │   ├── top-app-bar.tsx / side-drawer.tsx / bottom-nav.tsx
│   │   └── ui/             # flag, save-indicator
│   ├── actions/auth.ts     # login, registro, logout
│   ├── lib/
│   │   ├── session.ts      # Lee cookie de sesión
│   │   ├── base-path.ts    # Prefijo /zip_mundial en deploy
│   │   ├── bracket/        # Grupos, generación knockout, puntos
│   │   └── supabase/       # Clientes server + service role
│   └── middleware.ts       # Protege /app/*
└── docs/RELEASE-CHECKLIST.md
```

### Dónde vive cada pieza

- **Páginas** → `src/app/.../page.tsx` (una carpeta = una URL).
- **Lógica de servidor** (guardar bracket, auth) → `actions.ts` junto a la página o `src/actions/`.
- **Componentes grandes** → `src/components/` (simulador, tablas, shell).
- **Reglas de negocio puras** (sin React) → `src/lib/bracket/`.
- **Base de datos** → `supabase/migrations/`; puntos por ronda en función SQL `bracket_round_points`.

## Despliegue (no es “solo copiar a wwwroot”)

Esta app **no** es ASP.NET ni HTML estático. Es **Node.js** con `output: 'standalone'`.

1. Build con variables de producción:
   ```bash
   set NEXT_PUBLIC_BASE_PATH=/zip_mundial
   set NEXT_PUBLIC_SITE_URL=https://es001vs0062/zip_mundial
   npm run build:deploy
   ```
2. Copia la carpeta generada **`dist/zip_mundial/`** al servidor (no el código fuente ni otra app MVC).
3. En el servidor: `node server.js` en un puerto interno + **IIS ARR** haciendo proxy de `https://es001vs0062/zip_mundial/` → ese puerto.

Si en `wwwroot` ves `bin/`, `Views/`, `Web.config` de **otro proyecto**, esa carpeta no es este Next.js.

Detalle: [docs/RELEASE-CHECKLIST.md](docs/RELEASE-CHECKLIST.md)

## Repo

https://github.com/denche2005/mundial-2026-technip
