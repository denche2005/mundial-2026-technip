## GUÍA DE TESTING - MUNDIAL 2026

### 🧪 TESTING MANUAL (RECOMENDADO PRIMERO)

#### 1. **FLUJO DE REGISTRO Y TEMA**
```
[ ] Ir a /register
[ ] Llenar formulario:
    - Nombre: "Test User"
    - Email: "test@example.com"
    - Contraseña: "password123"
    - Confirmar: "password123"
[ ] Aceptar términos
[ ] Click "Crear Cuenta"
[ ] ✓ Debe redirigir a /app/tema (VERIFICACIÓN PRINCIPAL)
[ ] Seleccionar una ciudad (ej: Atlanta)
[ ] ✓ Debe mostrar confirmación "Tema aplicado"
[ ] Click "Continuar a la App →"
[ ] ✓ Debe ir a /app/predicciones
[ ] ✓ Los colores deben cambiar según la ciudad seleccionada
```

#### 2. **VERIFICACIÓN DE TEMA**
```
[ ] En /app/predicciones, revisar los colores
    - Fondo debe ser oscuro (primary-container)
    - Botones deben ser secondary (dorado/naranja)
    - Acentos deben ser tertiary (verde)
[ ] Ir a /app/perfil
[ ] Click en "Tema de la App"
[ ] Cambiar a otra ciudad (ej: Miami)
[ ] ✓ Los colores deben cambiar inmediatamente
[ ] Volver a /app/tema y verificar que se guardó
```

#### 3. **PREDICCIONES - AUTO-SAVE**
```
[ ] Ir a /app/predicciones
[ ] Ingresar predicción: 2-1 en un partido
[ ] Esperar 1 segundo (auto-save con debounce)
[ ] ✓ Debe aparecer CheckCircle2 verde (SAVED)
[ ] Cambiar a 2-2
[ ] ✓ Debe desaparecer el indicador de SAVED
[ ] Esperar 1 segundo
[ ] ✓ Debe volver a aparecer SAVED
```

#### 4. **PUNTOS - VERIFICACIÓN VISUAL**
```
[ ] Ir a /app/simulador
[ ] Hacer predicciones de bracket (seleccionar ganadores)
[ ] Ir a /app/ranking
[ ] ✓ Debe mostrar tu nombre con puntos totales
[ ] Ir a /app/g y crear un grupo (si no existe)
[ ] Invitar a otro usuario
[ ] ✓ Leaderboard del grupo debe funcionar
```

#### 5. **MENÚ SIDE DRAWER**
```
[ ] Ir a /app (cualquier página)
[ ] Click en el ícono de hamburguesa (arriba a la izquierda)
[ ] ✓ Debe abrir el drawer con opciones
[ ] ✓ Debe haber un botón X en la esquina superior derecha
[ ] Click en el X
[ ] ✓ Drawer debe cerrarse
[ ] Click en hamburguesa de nuevo
[ ] Click en un link (ej: Ranking)
[ ] ✓ Drawer debe cerrarse automáticamente
[ ] Click en el backdrop (fuera del drawer)
[ ] ✓ Drawer debe cerrarse
```

#### 6. **BOTTOM NAVIGATION**
```
[ ] En mobile (o viewport < 768px), verificar que aparece
[ ] ✓ 4 tabs: Partidos, Bracket, Ranking, Grupos
[ ] ✓ El tab activo debe estar resaltado en dorado
[ ] Cambiar entre tabs
[ ] ✓ El contenido debe cambiar sin overlaps
[ ] ✓ BottomNav no debe tapar botones (pb-24 en main)
```

#### 7. **RESPONSIVENESS**
```
[ ] Abrir en Desktop (1920px)
    [ ] SideDrawer debe estar siempre visible (izquierda)
    [ ] BottomNav no debe aparecer (hidden md:)
    [ ] Main content debe tener ml-80 (espacio para drawer)
    
[ ] Reducir a Tablet (768px)
    [ ] SideDrawer debe ser overlay (no toma espacio)
    [ ] BottomNav debe empezar a aparecer
    [ ] Layout debe ser fluido
    
[ ] Reducir a Mobile (375px)
    [ ] SideDrawer overlay complete
    [ ] BottomNav debe ocupar espacio (pb-24)
    [ ] Textos deben ser legibles
    [ ] Botones deben ser tocables (48px mínimo)
```

---

### 🗄️ TESTING DE BASE DE DATOS

#### 1. **VERIFICAR PUNTOS DE MATCHES**
```sql
-- En Supabase SQL Editor

-- Ver predicciones de un usuario
SELECT 
  mp.id,
  mp.pred_goals_1,
  mp.pred_goals_2,
  m.goals_1,
  m.goals_2,
  m.status,
  mp.points_awarded
FROM match_predictions mp
JOIN matches m ON mp.match_id = m.id
WHERE mp.user_id = 'YOUR_USER_ID'
ORDER BY m.kickoff_at DESC
LIMIT 10;

-- Esperado:
-- - Si match no ha terminado: points_awarded = NULL
-- - Si marcador exacto: points_awarded = 3
-- - Si tendencia correcta: points_awarded = 1
-- - Si falló: points_awarded = 0
```

#### 2. **VERIFICAR PUNTOS TOTALES**
```sql
-- Ver leaderboard
SELECT 
  p.full_name,
  lv.total_points,
  lv.match_points,
  lv.bracket_points,
  lv.exact_results,
  lv.tendency_results
FROM leaderboard_view lv
JOIN profiles p ON lv.user_id = p.id
ORDER BY lv.total_points DESC
LIMIT 20;

-- Esperado:
-- total_points = match_points + bracket_points
-- exact_results = count de 3-point predictions
-- tendency_results = count de 1-point predictions
```

#### 3. **VERIFICAR RLS**
```sql
-- Como admin, esto debe funcionar:
SELECT * FROM profiles LIMIT 1;

-- Como usuario normal, solo debe ver su perfil:
-- (Esta query fallaría en el cliente, RLS lo previene)
SELECT * FROM match_predictions 
WHERE user_id != current_user;
-- Esperado: 0 rows
```

#### 4. **VERIFICAR THEME_CITY**
```sql
-- Ver temas seleccionados
SELECT 
  id,
  full_name,
  email,
  theme_city,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Esperado:
-- theme_city = 'default' o nombre de ciudad (ej: 'miami', 'argentina')
```

#### 5. **VERIFICAR TRIGGERS**
```sql
-- Después de actualizar un match con resultado:
SELECT 
  id,
  team_1,
  team_2,
  goals_1,
  goals_2,
  status,
  updated_at
FROM matches
WHERE status = 'finished'
ORDER BY updated_at DESC
LIMIT 1;

-- Verificar que se recalcularon puntos:
SELECT 
  user_id,
  count(*) as updated_predictions,
  sum(case when points_awarded IS NOT NULL then 1 else 0 end) as with_points
FROM match_predictions
WHERE match_id = 'MATCH_ID_FROM_ABOVE'
GROUP BY user_id;

-- Esperado: points_awarded debe estar populated
```

---

### 🔒 TESTING DE SEGURIDAD

#### 1. **VERIFICAR AUTENTICACIÓN**
```
[ ] Intentar acceder a /app/predicciones sin login
    [ ] ✓ Debe redirigir a /login

[ ] Login con email incorrecto
    [ ] ✓ Debe mostrar error: "No existe una cuenta..."

[ ] Login con contraseña incorrecta
    [ ] ✓ Debe mostrar error: "Contraseña incorrecta"

[ ] Login con email correcto y contraseña correcta
    [ ] ✓ Debe redirigir a /app
    [ ] ✓ Cookie "session_user" debe estar set (httpOnly)
```

#### 2. **VERIFICAR RLS EN PREDICCIONES**
```
[ ] Login como usuario A
[ ] Ir a /app/predicciones
[ ] Ver mis predicciones
[ ] ✓ Solo debo ver mis predicciones

[ ] En DevTools, intentar query a match_predictions de otro usuario:
    fetch('/api/db/match_predictions?user_id=OTHER_USER_ID')
    [ ] ✓ Debe fallar con "permission denied" o similar
```

#### 3. **VERIFICAR ADMIN PANEL**
```
[ ] Login como usuario normal
[ ] Ir a /app/admin/partidos
[ ] ✓ Debe redirigir (acceso denegado)

[ ] Login como admin
[ ] Ir a /app/admin/partidos
[ ] ✓ Debe mostrar panel
[ ] ✓ Debe poder crear/editar/eliminar partidos
```

#### 4. **VERIFICAR HASHING DE CONTRASEÑAS**
```
[ ] En Supabase, revisar profiles table:
    SELECT id, email, password_hash FROM profiles WHERE email = 'test@example.com';
    
[ ] ✓ password_hash debe ser un string largo (hex)
[ ] ✓ No debe mostrar la contraseña en texto plano
[ ] ✓ Debe tener formato: SALT:HASH (separado por :)
```

---

### 📊 TESTING DE SCORING

#### 1. **MATCH PREDICCIONES - EXACTO (3 PUNTOS)**
```
Predicción: 2-1
Resultado Real: 2-1
[ ] ✓ Debe asignar 3 puntos
[ ] ✓ ScoreInput debe mostrar verde (tertiary)
[ ] ✓ Badge debe mostrar "SAVED" en verde
```

#### 2. **MATCH PREDICCIONES - TENDENCIA (1 PUNTO)**
```
Predicción: 2-1 (gana equipo 1)
Resultado Real: 3-0 (gana equipo 1, diferente score)
[ ] ✓ Debe asignar 1 punto
[ ] ✓ Badge debe mostrar "SAVED" pero no verde oscuro
```

#### 3. **MATCH PREDICCIONES - FALLO (0 PUNTOS)**
```
Predicción: 1-0 (gana equipo 1)
Resultado Real: 0-2 (gana equipo 2)
[ ] ✓ Debe asignar 0 puntos
[ ] ✓ No debe mostrar badge especial
```

#### 4. **BRACKET - PROGRESIÓN CORRECTA**
```
Simulador:
[ ] Seleccionar Teams en r32
[ ] [ ] Avanzar ganadores a r16
    [ ] ✓ r16 debe mostrar los ganadores de r32
[ ] [ ] Avanzar ganadores a qf
    [ ] ✓ qf debe mostrar los ganadores de r16
[ ] [ ] Continuar hasta champion
    [ ] ✓ champion debe ser 1 team
[ ] [ ] Ver puntos en ranking
    [ ] ✓ Debe haber: r32(1) + r16(2) + qf(3) + sf(4) + final(5) + champion(10) = 25 puntos
```

---

### ⚠️ EDGE CASES A PROBAR

#### 1. **Predicción después de kickoff**
```
[ ] Intentar editar predicción de un partido que ya empezó
[ ] ✓ Los inputs deben estar disabled
[ ] ✓ Debe mostrar el resultado real
[ ] ✓ No debe permitir guardar cambios
```

#### 2. **Timeout de sesión**
```
[ ] Dejar sesión abierta > 90 días (maxAge de cookie)
[ ] ✓ Debe redirigir a login al navegar
```

#### 3. **Grupo eliminado**
```
[ ] Crear grupo
[ ] Como admin, eliminar grupo
[ ] Usuario intenta ver grupo
[ ] ✓ Debe mostrar error o redirigir
```

#### 4. **Múltiples pestañas**
```
[ ] Abrir /app en 2 pestañas simultáneamente
[ ] [ ] Cambiar tema en pestaña 1
[ ] [ ] Ir a pestaña 2 y navegar
    [ ] ✓ Debe tener el nuevo tema aplicado
[ ] [ ] Cambiar predicción en pestaña 1
[ ] [ ] Cambiar la misma en pestaña 2
    [ ] ✓ Debe sincronizar (la última change gana)
```

---

### 🐛 CHECKLIST DE DEBUGGING

Si algo no funciona:

```
[ ] Verificar Network tab
    - [ ] Requests están yendo al servidor correcto
    - [ ] Status codes son 200/201 (no 403/500)
    - [ ] Response tiene datos esperados

[ ] Verificar Console
    - [ ] No hay errores de JavaScript
    - [ ] No hay errores de CORS
    - [ ] No hay warnings críticos

[ ] Verificar Supabase Studio
    - [ ] Tabla tiene datos
    - [ ] RLS policies están activas
    - [ ] Índices están creados

[ ] Verificar Cache
    - [ ] Clear browser cache (Ctrl+Shift+Del)
    - [ ] Disable cache en DevTools
    - [ ] Hard refresh (Ctrl+F5)

[ ] Verificar Auth
    - [ ] Cookie session_user está presente
    - [ ] Es httpOnly (no visible en JS)
    - [ ] Tiene maxAge correcto

[ ] Verificar Tema
    - [ ] CSS variables están asignadas
    - [ ] data-theme attribute está en HTML
    - [ ] Estilos se aplican correctamente
```

---

### 📱 DEVICE TESTING

**Testeado en**:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] iPhone 12 (390x844)
- [ ] Samsung Galaxy S21 (360x800)

**Navegadores**:
- [ ] Chrome (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

### ✅ SIGN-OFF CHECKLIST

```
SEGURIDAD:
[ ] RLS está habilitado en todas las tablas
[ ] Autenticación funciona (login/register)
[ ] Contraseñas hasheadas (PBKDF2)
[ ] Session cookies seguras

BD:
[ ] Migraciones aplicadas (19 total)
[ ] Datos se guarden correctamente
[ ] Foreign keys funcionan
[ ] Triggers recalculan puntos

FUNCIONALIDAD:
[ ] Registro → Tema → Predicciones
[ ] Puntos se asignan correctamente
[ ] Leaderboard calcula total
[ ] Bracket es funcional
[ ] Grupos funcionan

UI/UX:
[ ] Responsivo en mobile/desktop
[ ] Menús abren/cierran correctamente
[ ] No hay superposiciones
[ ] Colores se aplican según tema
[ ] Todo está en español

PERFORMANCE:
[ ] Carga inicial < 3 segundos
[ ] Predicción auto-save < 1 segundo
[ ] Rankings cargan < 2 segundos
[ ] No hay memory leaks
```

---

**Última actualización**: Mayo 9, 2026
**Status**: ✅ LISTO PARA TESTING
