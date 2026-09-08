-- Time Zone Reifenservice — website leads (WordPress forms, WhatsApp, calls)
create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'lead_status' and n.nspname = 'public'
  ) then
    create type public.lead_status as enum ('NEW', 'READ', 'ARCHIVED');
  end if;
end
$$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null
    check (type in ('contact', 'whatsapp', 'phone', 'service')),
  status public.lead_status not null default 'NEW',
  form_key text not null default '',
  source_page text not null default '/',
  source_label text not null default '',
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  service text not null default '',
  message text not null default '',
  source text not null default 'wordpress'
    check (source in ('wordpress', 'manual'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_type_idx on public.leads (type);
create index if not exists leads_form_key_idx on public.leads (form_key);

create or replace function public.set_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_leads_updated_at();

alter table public.leads enable row level security;
