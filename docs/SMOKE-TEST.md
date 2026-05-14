# Smoke test local

Con dependencias instaladas (`npm install`) y `.env.local` configurado:

> **CI / agente:** `next build` debe completar sin errores de tipos (incluye ESLint de Next). En este repo `vitest` está en `package.json`; si `node_modules/vitest` no existe, ejecuta `npm install` antes de `npm run test`.

```bash
npm run dev
```

Abrir `http://localhost:3000` y comprobar:

1. **Landing** `/` — carga y CTAs.
2. **Sesión** `/login` (y registro si aplica) — redirección a `/app` o `/app/tema`.
3. **Partidos** `/app/predicciones` — lista, guardado, bloqueo si partido en curso o pasado.
4. **Cuadro** `/app/simulador` — interacción y mensaje de bloqueo si `tournament_start_at` ya pasó.
5. **Ranking** `/app/ranking` — lista y desglose.
6. **Grupos** `/app/grupos` — crear / unirse / listado.
7. **Admin** `/app/admin/partidos` — solo con usuario `role = admin`.

Producción / instalación PWA: ver [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md).
