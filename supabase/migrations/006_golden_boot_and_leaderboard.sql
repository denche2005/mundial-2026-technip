-- Pichichi / máximo goleador: 5 puntos si aciertas el jugador oficial.

create table if not exists public.golden_boot_predictions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  player_id text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.golden_boot_result (
  id int primary key default 1 check (id = 1),
  player_id text,
  updated_at timestamptz not null default now()
);

insert into public.golden_boot_result (id, player_id)
values (1, null)
on conflict (id) do nothing;

create or replace view public.user_golden_boot_points
with (security_invoker = true)
as
select
  gbp.user_id,
  case
    when gbr.player_id is not null
      and gbp.player_id = gbr.player_id
    then 5
    else 0
  end::bigint as golden_boot_points
from public.golden_boot_predictions gbp
left join public.golden_boot_result gbr on gbr.id = 1;

grant select on public.user_golden_boot_points to anon, authenticated;

-- Postgres no permite insertar columnas en medio con CREATE OR REPLACE VIEW.
drop view if exists public.leaderboard_view;

create view public.leaderboard_view
with (security_invoker = true)
as
select
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  (
    coalesce(ubp.bracket_points, 0) + coalesce(ugbp.golden_boot_points, 0)
  )::bigint as total_points,
  0::bigint as match_points,
  coalesce(ubp.bracket_points, 0) as bracket_points,
  0::bigint as exact_results,
  0::bigint as tendency_results,
  coalesce(ubp.bracket_correct, 0) as bracket_correct,
  coalesce(ugbp.golden_boot_points, 0) as golden_boot_points
from public.profiles p
left join public.user_bracket_points ubp on ubp.user_id = p.id
left join public.user_golden_boot_points ugbp on ugbp.user_id = p.id
where p.role in ('participant', 'admin');

grant select on public.leaderboard_view to anon, authenticated;
