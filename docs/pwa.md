# PWA Blueprint

Esta app está preparada para convertirse en PWA instalable. El manifest y los meta tags ya están en sitio. Solo falta añadir iconos reales y, si se quiere experiencia offline, un service worker.

## Lo que ya está hecho

- `public/manifest.webmanifest` con metadata, colores e iconos.
- `metadata.manifest` y `appleWebApp` en `src/app/layout.tsx`.
- `viewport.themeColor` en el mismo layout para Android Chrome / status bar.
- `middleware.ts` deja `/manifest.webmanifest` accesible sin auth.

## Pasos para activar PWA completa

1. **Iconos**
   - Generar `public/icon-192.png` y `public/icon-512.png` con el logo final (fondo blanco o transparente, exporta también un maskable).
   - Generar `public/apple-touch-icon.png` (180x180) y referenciarlo en `<link rel="apple-touch-icon">` desde `layout.tsx` si se quiere mejor soporte iOS.

2. **Service worker (opcional para v1)**
   Recomendación: usar [`@ducanh2912/next-pwa`](https://www.npmjs.com/package/@ducanh2912/next-pwa) o [`next-pwa`](https://www.npmjs.com/package/next-pwa) como wrapper de `next.config.ts`.

   ```bash
   npm install @ducanh2912/next-pwa
   ```

   ```ts
   // next.config.ts
   import withPWA from "@ducanh2912/next-pwa";

   const config = {
     // ...existing config
   };

   export default withPWA({
     dest: "public",
     register: true,
     workboxOptions: {
       skipWaiting: true,
       clientsClaim: true,
     },
   })(config);
   ```

3. **Install prompt UX (opcional)**
   - Capturar el evento `beforeinstallprompt` en un componente `InstallPrompt` mostrado solo en mobile cuando el usuario ya está autenticado.
   - Esconder tras `appinstalled` o si el usuario lo descarta más de una vez.

4. **Estrategias de cache sugeridas**
   - `NetworkFirst` para `/app/*` (datos siempre frescos).
   - `StaleWhileRevalidate` para `/_next/static`.
   - `CacheFirst` para iconos, manifest y `flags/*`.

5. **Verificación**
   - Lighthouse → PWA score 100.
   - Chrome DevTools → Application → Manifest sin warnings.
   - Probar instalación en Android, iOS y desktop.

## Notas

- No usar service worker antes de tener el flujo de auth estable: cachear rutas autenticadas mal puede mostrar datos de otro usuario.
- Recomendado activar PWA solo cuando `NEXT_PUBLIC_SITE_URL` apunte a un dominio HTTPS real.
