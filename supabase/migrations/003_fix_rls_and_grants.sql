-- Server-side only tables: disable RLS so the dashboard API can read/write.
-- (Replace SUPABASE_SERVICE_ROLE_KEY with the real service_role key for production.)
alter table public.leads disable row level security;
alter table public.analytics_events disable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant all on public.leads to anon, authenticated, service_role;
grant all on public.analytics_events to anon, authenticated, service_role;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
