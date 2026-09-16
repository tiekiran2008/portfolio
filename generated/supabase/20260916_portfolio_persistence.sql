-- Run once in your portfolio project's Supabase SQL Editor (as postgres).
-- Existing projects/skills/experience/messages tables and policies are NOT modified.
begin;

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;
grant select on public.portfolio_admins to authenticated;
drop policy if exists portfolio_admin_self on public.portfolio_admins;
create policy portfolio_admin_self on public.portfolio_admins for select to authenticated
  using (user_id = (select auth.uid()));

-- Resolve the existing, confirmed owner once; writes use immutable user ID, not client email.
do $$
declare owner_id uuid;
begin
  select id into strict owner_id from auth.users
    where lower(email) = 'kiran08461kumar@gmail.com' and email_confirmed_at is not null;
  insert into public.portfolio_admins(user_id) values (owner_id) on conflict do nothing;
exception when no_data_found then
  raise exception 'Confirmed admin user not found. Verify the email in Authentication > Users before running this migration.';
end $$;

create table if not exists public.portfolio_content (
  id integer primary key default 1 check (id = 1),
  content jsonb not null default '{}'::jsonb,
  revision integer not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  constraint portfolio_public_fields check (
    jsonb_typeof(content) = 'object'
    and content - array['projects','skills','experience','certificates','resumeUrl']::text[] = '{}'::jsonb
    and (not content ? 'projects' or jsonb_typeof(content->'projects') = 'array')
    and (not content ? 'skills' or jsonb_typeof(content->'skills') = 'array')
    and (not content ? 'experience' or jsonb_typeof(content->'experience') = 'array')
    and (not content ? 'certificates' or jsonb_typeof(content->'certificates') = 'array')
    and (not content ? 'resumeUrl' or jsonb_typeof(content->'resumeUrl') = 'string')
  )
);

-- Copy the existing public rows once. Preserve IDs regardless of their legacy SQL type.
-- Only known public columns are copied; never copy messages or private columns.
do $$
declare name text; rows jsonb; seed jsonb := '{"certificates":[],"resumeUrl":""}'::jsonb;
begin
  foreach name in array array['projects','skills','experience'] loop
    if to_regclass('public.' || name) is not null then
      execute format('select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from public.%I t', name) into rows;
      if name = 'projects' then
        select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'id', x->'id', 'title', x->'title', 'description', x->'description',
          'techStack', coalesce(x->'techStack',x->'tech_stack','[]'::jsonb),
          'githubLink', coalesce(x->'githubLink',x->'github_link','""'::jsonb),
          'demoLink', coalesce(x->'demoLink',x->'demo_link','""'::jsonb),
          'image', x->'image', 'features', x->'features'))), '[]'::jsonb) into rows from jsonb_array_elements(rows) x;
      elsif name = 'skills' then
        select coalesce(jsonb_agg(jsonb_build_object('id',x->'id','name',x->'name','category',x->'category')), '[]'::jsonb) into rows from jsonb_array_elements(rows) x;
      else
        select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',x->'id','role',x->'role','company',x->'company','period',x->'period','description',x->'description','logo',x->'logo'))), '[]'::jsonb) into rows from jsonb_array_elements(rows) x;
      end if;
      seed := seed || jsonb_build_object(name, rows);
    end if;
  end loop;
  insert into public.portfolio_content(id, content) values (1, seed) on conflict (id) do nothing;
end $$;

alter table public.portfolio_content enable row level security;
revoke all on public.portfolio_content from anon, authenticated;
grant select on public.portfolio_content to anon, authenticated;
grant update(content, revision) on public.portfolio_content to authenticated;
drop policy if exists portfolio_read on public.portfolio_content;
create policy portfolio_read on public.portfolio_content for select to anon, authenticated using (true);
drop policy if exists portfolio_owner_update on public.portfolio_content;
create policy portfolio_owner_update on public.portfolio_content for update to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create or replace function public.portfolio_revision_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.revision <> old.revision + 1 then raise exception 'Portfolio revision must increase by exactly one'; end if;
  new.updated_at := now();
  return new;
end $$;
revoke all on function public.portfolio_revision_guard() from public;
drop trigger if exists portfolio_revision_guard on public.portfolio_content;
create trigger portfolio_revision_guard before update on public.portfolio_content
  for each row execute function public.portfolio_revision_guard();

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-assets', 'portfolio-assets', true, 5242880, array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
-- Public reads are provided by this public bucket; only the owner can upload.
drop policy if exists portfolio_owner_upload on storage.objects;
create policy portfolio_owner_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-assets'
    and exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

notify pgrst, 'reload schema';
commit;
