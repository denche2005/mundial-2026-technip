# Admin, predicciones y bloqueo de bracket

Documentación de reglas ya implementadas en código y base de datos para revisión antes de lanzamiento.

## Predicciones de partido (usuarios)

| Capa | Comportamiento |
|------|----------------|
| **UI** | [`src/components/predictions-list.tsx`](../src/components/predictions-list.tsx): no se guarda si el partido está `live` / `finished` o si la hora actual es ≥ `kickoff_at`. |
| **Servidor** | [`src/app/app/predicciones/actions.ts`](../src/app/app/predicciones/actions.ts): rechaza upsert si el partido ya empezó o no está en `scheduled`. |
| **Base de datos** | Migración [`supabase/migrations/024_match_predictions_kickoff_guard.sql`](../supabase/migrations/024_match_predictions_kickoff_guard.sql): trigger `BEFORE INSERT OR UPDATE` en `match_predictions` que impide cambiar `pred_goals_*` tras el pitazo; **permite** updates que solo tocan `points_awarded` (puntuación automática). |

## Bracket (simulador)

| Capa | Comportamiento |
|------|----------------|
| **UI** | [`src/components/bracket-simulator.tsx`](../src/components/bracket-simulator.tsx): `disabled={isLocked}` en interacciones. |
| **Servidor** | [`src/app/app/simulador/actions.ts`](../src/app/app/simulador/actions.ts): `saveBracketPredictions` lee `tournament_config.tournament_start_at` y devuelve error si `now >= tournament_start_at`. |
| **Página** | [`src/app/app/simulador/page.tsx`](../src/app/app/simulador/page.tsx): calcula `isLocked` con la misma fecha. |

**Producción:** debe existir una fila coherente en `tournament_config` (seed en migración `004_bracket_predictions.sql`). Ajustar la fecha allí o vía admin de Supabase según la política del producto.

## Admin de partidos

[`src/app/app/admin/partidos/actions.ts`](../src/app/app/admin/partidos/actions.ts):

- **`updateMatchResult`**: puede sobrescribir `goals_1` / `goals_2` y fuerza `status: "finished"`. No impide corregir un resultado ya publicado (diseño intencional para correcciones operativas).
- **`clearMatchResult`**: vuelve el partido a `scheduled`, limpia goles y pone `points_awarded` a `null` en predicciones de ese partido.
- Los triggers en migraciones (`matches` → recalcular puntos) deben mantener el leaderboard alineado; tras un cambio de resultado, comprobar en UI ranking global y por grupo.

**Sugerencia de producto:** si en el futuro no queréis correcciones tras cierto hito, añadid comprobación en `updateMatchResult` (por ejemplo no permitir si todos los partidos de knockout ya tienen resultado oficial).
