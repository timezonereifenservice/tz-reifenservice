-- Dashboard users (custom auth — not Supabase Auth)
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null default '',
  password_hash text not null,
  role text not null check (role in ('Admin', 'Viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);
create index if not exists users_email_idx on public.users (email);

create or replace function public.set_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_users_updated_at();

alter table public.users enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant all on public.users to anon, authenticated, service_role;
alter table public.users disable row level security;

notify pgrst, 'reload schema';
