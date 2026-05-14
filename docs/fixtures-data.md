# Fixtures Data Pipeline (Mundial 2026)

Este proyecto usa un flujo reproducible para obtener y sembrar los partidos de fase de grupos en `public.matches`.

## Fuentes de datos

- **Primaria (usada por defecto):** API pública de FIFA usada por su web SPA  
  `https://api.fifa.com/api/v3/calendar/matches?language=es-ES&count=300&idCompetition=17&idSeason=285023`
- **Fallback documentado:** OpenFootball (`cup.txt`)  
  `https://raw.githubusercontent.com/openfootball/world-cup/master/2026--canada-mexico-usa/cup.txt`

> Nota: la fase eliminatoria suele venir con placeholders (ej: `1A vs 2B`) hasta cerrar grupos. Este seed inserta solo fase de grupos.

## Archivos generados

- `scripts/data/fixtures-raw.json`  
  Payload original de la fuente (sin transformar).
- `scripts/data/fixtures-normalized.json`  
  Array normalizado listo para insertar en `public.matches`:
  - `kickoff_at` (UTC ISO8601)
  - `stage` (`group`)
  - `group_code` (`A`..`L`)
  - `team_1`, `team_2` (códigos FIFA de 3 letras)
  - `status` (`scheduled`)
- `supabase/migrations/014_seed_world_cup_2026_matches.sql`  
  Seed SQL idempotente regenerado desde el JSON normalizado.

## Comandos

1) Scrape + normalización + regeneración de migración:

```bash
npm run scrape:fixtures
```

2) Seed directo vía API Supabase (opcional, manual):

```bash
npm run seed:matches
```

## Pasos exactos por entorno

### A) Supabase local (CLI)

1. Inicia el stack local:

```bash
supabase start
```

2. Aplica migraciones (incluye `014_seed_world_cup_2026_matches.sql`):

```bash
supabase db reset
```

3. Verifica conteo esperado:

```sql
select stage, count(*) from public.matches group by stage order by stage;
```

Debe devolver `group = 72`.

### B) Supabase remoto (producción/proyecto cloud)

1. Regenera seed SQL desde FIFA:

```bash
npm run scrape:fixtures
```

2. Sube y aplica migraciones pendientes al proyecto remoto:

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
```

3. Verifica en Supabase SQL Editor:

```sql
select count(*) as group_matches
from public.matches
where stage = 'group';
```

Debe devolver `72`.

### C) Seed manual vía service-role (si no usarás `db push`)

1. Valida variables:

```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

2. Ejecuta seed idempotente:

```bash
npm run seed:matches
```

3. Verifica en SQL Editor:

```sql
select count(*) as group_matches
from public.matches
where stage = 'group';
```

## Variables de entorno requeridas

En `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` debe ser **service role** real del proyecto destino (no `anon`).

## Actualización manual si FIFA cambia estructura

1. Ejecuta `npm run scrape:fixtures`.
2. Si hay warnings por equipos no mapeables o grupos incompletos, revisa:
   - `scripts/data/fixtures-raw.json`
   - `scripts/data/fixtures-normalized.json`
3. Corrige manualmente `fixtures-normalized.json` manteniendo el esquema.
4. Vuelve a correr `npm run scrape:fixtures` para regenerar `014_seed_world_cup_2026_matches.sql`.
5. Ejecuta `npm run seed:matches` cuando quieras aplicar en DB.

## Criterios de calidad esperados

- 72 partidos de fase de grupos
- 12 grupos (`A`..`L`) con 6 partidos cada uno
- Códigos de equipo alineados con `src/lib/bracket/groups.ts`
