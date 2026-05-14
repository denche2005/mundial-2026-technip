-- Configuración del torneo + cuadro oficial + predicciones de usuario.

create table if not exists public.tournament_config (
  id integer primary key default 1 check (id = 1),
  tournament_start_at timestamptz not null default '2026-06-11T00:00:00Z',
  created_at timestamptz not null default now()
);

insert into public.tournament_config (tournament_start_at)
values ('2026-06-11T00:00:00Z')
on conflict (id) do nothing;

create table if not exists public.bracket_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  round text not null check (round in ('r32', 'r16', 'qf', 'sf', 'final', 'champion')),
  position integer not null,
  team text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, round, position)
);

create table if not exists public.bracket_results (
  id uuid primary key default gen_random_uuid(),
  round text not null check (round in ('r32', 'r16', 'qf', 'sf', 'final', 'champion')),
  position integer not null,
  team text not null,
  created_at timestamptz not null default now(),
  unique (round, position)
);

create or replace function public.bracket_round_points(round_name text)
returns integer as $$
begin
  return case round_name
    when 'r32' then 1
    when 'r16' then 2
    when 'qf' then 3
    when 'sf' then 4
    when 'final' then 5
    when 'champion' then 10
    else 0
  end;
end;
$$ language plpgsql immutable;
