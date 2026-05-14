# Stripe Monetization Blueprint

Diseño de monetización pensado para activarse después del lanzamiento del MVP, sin romper el modelo gratuito que sostiene la viralidad.

## Principios

- El producto base sigue siendo gratis (registro, 1 grupo, ranking, premios top 10).
- Stripe entra como upgrade "Pro" con valor claro (varios grupos, más miembros, branding, exportes).
- No bloquear la viralidad: invitar amigos siempre debe ser gratis para el invitado.

## Planes propuestos

| Plan | Precio | Grupos | Miembros por grupo | Extras |
| --- | ---: | ---: | ---: | --- |
| Free | 0 € | 1 grupo (owner) | 50 | Ranking, bracket, top 10 |
| Pro | 4,99 € / temporada | 10 grupos | 200 | Branding del grupo, export CSV, badges |
| Empresa | 29 € / temporada | Ilimitado | 1.000 | White-label, soporte directo |

(Precios indicativos. Validar con A/B testing antes del Mundial.)

## Cambios de modelo de datos

Migración futura sugerida (`014_billing.sql`):

```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  plan text not null check (plan in ('pro', 'empresa')),
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index on public.subscriptions(user_id);

-- View that resolves the active plan for a user. Used by the API to enforce
-- group / member quotas.
create view public.user_plan as
select
  p.id as user_id,
  coalesce(
    (select plan from public.subscriptions s
       where s.user_id = p.id
         and s.status in ('active', 'trialing')
       order by created_at desc
       limit 1),
    'free'
  ) as plan
from public.profiles p;
```

## Cambios en server actions

`createGroup` debe consultar `user_plan` y rechazar si supera el límite:

```ts
const { data: plan } = await supabase
  .from("user_plan")
  .select("plan")
  .eq("user_id", user.id)
  .single();
const limits = PLAN_LIMITS[plan?.plan ?? "free"];
const { count: ownedCount } = await supabase
  .from("groups")
  .select("*", { count: "exact", head: true })
  .eq("owner_id", user.id);
if ((ownedCount ?? 0) >= limits.maxGroups) {
  redirect("/app/billing?reason=group-limit");
}
```

Mismo patrón para `redeem_group_invite` (cap por `max_members`).

## Stack recomendado

- **Stripe Checkout** (no Elements): rapidez para MVP, flujo hospedado, menos código.
- Endpoint `app/api/billing/checkout/route.ts` que crea la sesión y redirige.
- Endpoint `app/api/billing/webhook/route.ts` que escucha `customer.subscription.*` y actualiza la tabla `subscriptions`.
- Variables `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`.

## Flujo de upgrade

1. Usuario llega a `/app/billing` desde un upsell o desde un límite alcanzado.
2. Selecciona un plan → POST `/api/billing/checkout` → redirección a Stripe.
3. Webhook `checkout.session.completed` graba la suscripción.
4. Webhook `customer.subscription.updated|deleted` mantiene `status` y `current_period_end`.
5. Cron diario opcional: marcar como `expired` los grupos por encima del límite y notificar al owner.

## Riesgos a mitigar

- **Pagos sin valor real**: validar la propuesta de upgrade con encuestas pre-Mundial.
- **Reconciliación**: soporte directo a Stripe Dashboard para cancelaciones / reembolsos.
- **Refund window**: ofrecer reembolso completo durante los primeros 7 días para reducir fricción.
