-- Vistas de puntuación (solo bracket) + RLS mínima alineada con la app (service_role en server actions).

set check_function_bodies = off;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace view public.user_bracket_points
with (security_invoker = true)
as
select
  bp.user_id,
  coalesce(sum(
    case when bp.team = br.team then public.bracket_round_points(bp.round) else 0 end
  ), 0) as bracket_points,
  count(case when bp.team = br.team then 1 end) as bracket_correct
from public.bracket_predictions bp
left join public.bracket_results br
  on bp.round = br.round and bp.position = br.position
group by bp.user_id;

-- Misma forma que el front espera; sin partidos: match/exact/tendency = 0.
create or replace view public.leaderboard_view
with (security_invoker = true)
as
select
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  coalesce(ubp.bracket_points, 0) as total_points,
  0::bigint as match_points,
  coalesce(ubp.bracket_points, 0) as bracket_points,
  0::bigint as exact_results,
  0::bigint as tendency_results,
  coalesce(ubp.bracket_correct, 0) as bracket_correct
from public.profiles p
left join public.user_bracket_points ubp on ubp.user_id = p.id
where p.role in ('participant', 'admin');

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_public" on public.profiles;
create policy "profiles_select_own_or_public"
  on public.profiles for select to authenticated
  using (id = public.current_profile_id() or true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = public.current_profile_id())
  with check (id = public.current_profile_id());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (auth_user_id = auth.uid());

alter table public.tournament_config enable row level security;

drop policy if exists "tournament_config_select_public" on public.tournament_config;
create policy "tournament_config_select_public"
  on public.tournament_config for select to anon, authenticated using (true);

drop policy if exists "tournament_config_update_admin" on public.tournament_config;
create policy "tournament_config_update_admin"
  on public.tournament_config for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.bracket_predictions enable row level security;

drop policy if exists "bracket_predictions_select_own" on public.bracket_predictions;
create policy "bracket_predictions_select_own"
  on public.bracket_predictions for select to authenticated
  using (user_id = public.current_profile_id());

drop policy if exists "bracket_predictions_insert_own" on public.bracket_predictions;
create policy "bracket_predictions_insert_own"
  on public.bracket_predictions for insert to authenticated
  with check (user_id = public.current_profile_id());

drop policy if exists "bracket_predictions_update_own" on public.bracket_predictions;
create policy "bracket_predictions_update_own"
  on public.bracket_predictions for update to authenticated
  using (user_id = public.current_profile_id())
  with check (user_id = public.current_profile_id());

drop policy if exists "bracket_predictions_delete_own" on public.bracket_predictions;
create policy "bracket_predictions_delete_own"
  on public.bracket_predictions for delete to authenticated
  using (user_id = public.current_profile_id());

alter table public.bracket_results enable row level security;

drop policy if exists "bracket_results_select_public" on public.bracket_results;
create policy "bracket_results_select_public"
  on public.bracket_results for select to anon, authenticated using (true);

drop policy if exists "bracket_results_insert_admin" on public.bracket_results;
create policy "bracket_results_insert_admin"
  on public.bracket_results for insert to authenticated
  with check (public.is_admin());

drop policy if exists "bracket_results_update_admin" on public.bracket_results;
create policy "bracket_results_update_admin"
  on public.bracket_results for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "bracket_results_delete_admin" on public.bracket_results;
create policy "bracket_results_delete_admin"
  on public.bracket_results for delete to authenticated
  using (public.is_admin());

grant select on public.leaderboard_view to anon, authenticated;
grant select on public.user_bracket_points to authenticated;
