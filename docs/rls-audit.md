# RLS Audit - Mundial 2026 Porra

**Date:** 2026-05-09  
**Scope:** `public` schema (plus quick check for `storage` custom usage)  
**Status:** Lockdown migration prepared (`015_rls_lockdown.sql`), not applied remotely.

## Como se hizo la auditoria

1. **Analisis estatico** de `supabase/migrations/001..013` para reconstruir estado acumulado de RLS/policies.
2. Se dejo script de auditoria en `scripts/audit-rls.ts` (con salida JSON en `scripts/data/rls-audit.json`).
3. No se aplicaron cambios en Supabase remoto.

> Nota sobre badge **Unrestricted** en Supabase Studio: normalmente aparece cuando una tabla tiene RLS deshabilitado (o sin controles efectivos para roles cliente). Con `anon` key expuesta en frontend, una tabla abierta suele ser explotable via PostgREST.

## Estado tabla por tabla (pre-migracion 015)

| Tabla | RLS | Policies | Estado de riesgo |
|---|---|---:|---|
| `profiles` | OFF (deshabilitado en `007_simplify_auth.sql`) | N/A | **High** - PII potencialmente expuesta (email, hash legacy). |
| `matches` | OFF | N/A | **Medium** - write no autorizado de fixtures/resultados. |
| `match_predictions` | OFF | N/A | **High** - lectura/escritura de predicciones de terceros. |
| `bracket_predictions` | OFF | N/A | **High** - exposicion de picks privados. |
| `bracket_results` | OFF | N/A | **Medium** - integridad de resultados oficiales. |
| `tournament_config` | OFF | N/A | **Medium** - alteracion de ventanas de juego. |
| `groups` | OFF (creada en `012_groups.sql` sin RLS) | N/A | **High** - metadata de grupos expuesta/modificable. |
| `group_members` | OFF | N/A | **High** - enumeracion de miembros y escalada social. |
| `group_invites` | OFF | N/A | **Critical** - fuga de tokens/codigos de invitacion. |
| `app_events` | ON (`013_hardening.sql`) | 0 | **OK** intencional: solo `service_role`. |

### Views auditadas

- `user_bracket_points`, `user_match_points`, `leaderboard_view`, `group_leaderboard_view` se definieron sin `security_invoker`.
- Riesgo: una vista definer puede terminar saltandose RLS de tablas base en consultas de cliente.
- Fix aplicado en migracion 015: recreadas con `with (security_invoker = true)`.

### Storage

- No se encontraron tablas custom `storage.*` en migraciones del proyecto.
- No se modifico `storage.objects` ni schema interno de Supabase.

## Decisiones implementadas en `015_rls_lockdown.sql`

- Se habilita RLS para tablas abiertas en `public`.
- Se recrean policies idempotentes (`drop policy if exists` + `create policy`).
- Se introducen helpers:
  - `public.current_profile_id()`
  - `public.is_admin()`
  - `public.is_group_member(uuid)`
  - `public.is_group_owner(uuid)`
- Matriz de acceso aplicada:
  - `profiles`: lectura autenticada (incluyendo leaderboards), update own, insert self-linked.
  - `matches`: lectura publica; mutaciones solo admin.
  - `match_predictions` / `bracket_predictions`: CRUD own.
  - `bracket_results`: lectura publica; mutaciones admin.
  - `groups`: select miembros, insert authenticated, update/delete owner.
  - `group_members`: select miembros del grupo, insert bloqueado directo (solo RPC), delete own/owner.
  - `group_invites`: select miembros; mutaciones owner.
  - `app_events`: RLS ON y sin policies de cliente (service-only).
  - `tournament_config` (si existe): lectura publica; escritura admin.

## Tabla final de riesgos (post-migracion 015 esperada)

| Riesgo | Severidad | Estado tras 015 | Evidencia/fix |
|---|---|---|---|
| Exfiltracion anon de predicciones/grupos | Critical/High | **Mitigado** | RLS ON + policies owner/member. |
| Manipulacion de fixtures/resultados | High | **Mitigado** | Policies admin-only en `matches` y `bracket_results`. |
| Abuso de tokens de invitacion | Critical | **Mitigado** | `group_invites` limitado a miembros/owner. |
| Bypass por vistas de leaderboard | High | **Mitigado** | Views recreadas con `security_invoker = true`. |
| Exposicion de campos sensibles en `profiles` | Medium (residual) | **Parcial** | RLS restaurado; recomendado separar vista publica de perfil para minimizar columnas expuestas a cliente. |
| RPC `security definer` sin validacion estricta de actor | Medium (residual) | **Pendiente** | Revisar RPCs para usar `auth.uid()` internamente y rechazar `p_user_id` arbitrario. |

## Scripts entregados

- `scripts/audit-rls.ts`: auditoria (live/static fallback), salida JSON.
- `scripts/sql/audit-rls-rpc.sql`: helper opcional para inspeccion live de `pg_catalog`.
- `scripts/test-rls.ts`: smoke tests basicos de enforcement RLS.

## Como aplicar (sin cambios remotos automaticos)

### Opcion A - Supabase Studio (recomendado rapido)

1. Abrir Supabase Studio -> **SQL Editor**.
2. Pegar contenido de `supabase/migrations/015_rls_lockdown.sql`.
3. Ejecutar.
4. Verificar badges en tabla (ya no deberian aparecer como "Unrestricted" las tablas cerradas).

### Opcion B - Supabase CLI

```bash
supabase db push
```

Si usas ramas/entornos, ejecutar contra el proyecto correcto.

## Verificacion posterior sugerida

1. Ejecutar auditoria:
```bash
npm run audit:rls
```
2. (Opcional) Cargar helper RPC una vez:
   - ejecutar `scripts/sql/audit-rls-rpc.sql` en SQL Editor
   - volver a correr `npm run audit:rls`
3. Probar smoke tests:
```bash
npm run test:rls
```
4. Confirmar que anon/authenticated:
   - no leen `app_events`
   - no leen predicciones de otros usuarios
   - no escriben tablas admin-only.
