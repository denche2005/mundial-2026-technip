-- Login interno por email/contraseña (hash en profiles, cookie session_user).

alter table public.profiles
  add column if not exists password_hash text;

create index if not exists profiles_email_unique_not_null on public.profiles(email)
  where email is not null and email <> '';
