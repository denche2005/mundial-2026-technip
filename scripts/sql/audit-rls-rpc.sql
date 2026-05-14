-- Optional helper for scripts/audit-rls.ts
-- Run this once in Supabase SQL Editor if you want the audit script to fetch
-- exact RLS state from pg_catalog/pg_policies via RPC.

create or replace function public._rls_audit_dump()
returns jsonb
language sql
security definer
set search_path = public, pg_catalog
as $$
  with table_base as (
    select
      c.relname as tablename,
      c.relrowsecurity as rowsecurity,
      c.relforcerowsecurity as rowsecurity_forced
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
  ),
  table_policies as (
    select
      p.tablename,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'policyname', p.policyname,
            'cmd', p.cmd,
            'roles', p.roles,
            'qual', p.qual,
            'with_check', p.with_check
          )
          order by p.policyname
        ),
        '[]'::jsonb
      ) as policies
    from pg_policies p
    where p.schemaname = 'public'
    group by p.tablename
  ),
  views_data as (
    select
      c.relname as viewname,
      coalesce((c.reloptions::text[] @> array['security_invoker=true']), false) as security_invoker
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'v'
  )
  select jsonb_build_object(
    'tables',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'tablename', tb.tablename,
            'rowsecurity', tb.rowsecurity,
            'rowsecurity_forced', tb.rowsecurity_forced,
            'policies', coalesce(tp.policies, '[]'::jsonb)
          )
          order by tb.tablename
        )
        from table_base tb
        left join table_policies tp on tp.tablename = tb.tablename
      ),
      '[]'::jsonb
    ),
    'views',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'viewname', vd.viewname,
            'security_invoker', vd.security_invoker
          )
          order by vd.viewname
        )
        from views_data vd
      ),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public._rls_audit_dump() from public;
grant execute on function public._rls_audit_dump() to service_role;
-- Optional helper: install once in Supabase SQL editor so that
-- `npm run audit:rls` can dump live RLS state from pg_catalog.
--
-- This RPC is **read-only** and runs as `security definer` so it can
-- introspect pg_catalog. Access is restricted to the `service_role`,
-- which is the only role that should ever call it.

create or replace function public._rls_audit_dump()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_tables jsonb;
  v_views  jsonb;
begin
  select coalesce(jsonb_agg(t order by t->>'tablename'), '[]'::jsonb)
    into v_tables
  from (
    select jsonb_build_object(
      'tablename', c.relname,
      'rowsecurity', c.relrowsecurity,
      'rowsecurity_forced', c.relforcerowsecurity,
      'policies', coalesce((
        select jsonb_agg(jsonb_build_object(
          'policyname', p.policyname,
          'cmd', p.cmd,
          'roles', p.roles,
          'qual', p.qual,
          'with_check', p.with_check
        ) order by p.policyname)
        from pg_policies p
        where p.schemaname = 'public' and p.tablename = c.relname
      ), '[]'::jsonb)
    ) as t
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  ) s;

  select coalesce(jsonb_agg(v order by v->>'viewname'), '[]'::jsonb)
    into v_views
  from (
    select jsonb_build_object(
      'viewname', c.relname,
      -- security_invoker option is stored in reloptions as 'security_invoker=true|false'.
      'security_invoker', coalesce(
        (
          select option_value::boolean
          from pg_options_to_table(c.reloptions)
          where option_name = 'security_invoker'
        ),
        false
      )
    ) as v
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'v'
  ) s;

  return jsonb_build_object('tables', v_tables, 'views', v_views);
end;
$$;

revoke all on function public._rls_audit_dump() from public;
revoke all on function public._rls_audit_dump() from anon, authenticated;
grant execute on function public._rls_audit_dump() to service_role;
