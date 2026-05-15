-- Admin guarda ganadores por ronda (posiciones 101+ en orden de selección).
-- Usuarios guardan ganadores por partido (position = match.position + 100).
-- Puntuación: mismo round + mismo team; en knockout no exige misma position exacta.

create or replace view public.user_bracket_points
with (security_invoker = true)
as
select
  bp.user_id,
  coalesce(sum(
    case
      when exists (
        select 1
        from public.bracket_results br
        where br.round = bp.round
          and upper(trim(br.team)) = upper(trim(bp.team))
          and (
            (bp.round = 'champion' and br.position = bp.position)
            or (bp.position >= 100 and br.position >= 100)
            or (bp.position > 0 and bp.position < 100 and br.position = bp.position)
          )
      ) then public.bracket_round_points(bp.round)
      else 0
    end
  ), 0)::bigint as bracket_points,
  count(*) filter (
    where exists (
      select 1
      from public.bracket_results br
      where br.round = bp.round
        and upper(trim(br.team)) = upper(trim(bp.team))
        and (
          (bp.round = 'champion' and br.position = bp.position)
          or (bp.position >= 100 and br.position >= 100)
          or (bp.position > 0 and bp.position < 100 and br.position = bp.position)
        )
    )
  )::bigint as bracket_correct
from public.bracket_predictions bp
group by bp.user_id;

grant select on public.user_bracket_points to anon, authenticated;
