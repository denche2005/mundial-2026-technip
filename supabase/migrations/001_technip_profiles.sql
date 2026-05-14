-- Technip: perfiles vinculados a Supabase Auth (email/password).

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'participant' check (role in ('participant', 'admin')),
  auth_user_id uuid unique,
  created_at timestamptz not null default now()
);

create index if not exists profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index if not exists profiles_email_lower_idx on public.profiles(lower(email));

create or replace function public.upsert_profile_for_auth_user(
  p_auth_user_id uuid,
  p_email text,
  p_full_name text,
  p_avatar_url text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  select id into v_profile_id
  from public.profiles
  where auth_user_id = p_auth_user_id
  limit 1;

  if v_profile_id is not null then
    update public.profiles
    set
      full_name  = coalesce(nullif(p_full_name, ''), full_name),
      avatar_url = coalesce(p_avatar_url, avatar_url),
      email        = coalesce(nullif(p_email, ''), email)
    where id = v_profile_id;
    return v_profile_id;
  end if;

  if p_email is not null then
    select id into v_profile_id
    from public.profiles
    where lower(email) = lower(p_email)
    limit 1;

    if v_profile_id is not null then
      update public.profiles
      set
        auth_user_id = p_auth_user_id,
        full_name    = coalesce(nullif(p_full_name, ''), full_name),
        avatar_url   = coalesce(p_avatar_url, avatar_url)
      where id = v_profile_id;
      return v_profile_id;
    end if;
  end if;

  insert into public.profiles (email, full_name, avatar_url, auth_user_id)
  values (
    coalesce(p_email, ''),
    coalesce(nullif(p_full_name, ''), split_part(coalesce(p_email, ''), '@', 1)),
    p_avatar_url,
    p_auth_user_id
  )
  returning id into v_profile_id;

  return v_profile_id;
end;
$$;

revoke all on function public.upsert_profile_for_auth_user(uuid, text, text, text) from public;
grant execute on function public.upsert_profile_for_auth_user(uuid, text, text, text) to authenticated, service_role;
