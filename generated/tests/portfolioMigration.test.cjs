const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('migration preserves legacy content and enforces database/storage owner permissions',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`
 create role anon; create role authenticated;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 insert into auth.users values ('11111111-1111-4111-8111-111111111111','kiran08461kumar@gmail.com',now());
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth,storage to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id serial primary key,bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant insert,select on storage.objects to anon,authenticated;grant usage on sequence storage.objects_id_seq to anon,authenticated;
 create table public.projects(id bigint,title text,description text,tech_stack text[],github_link text,private_note text);
 insert into public.projects values (1,'Existing','Full details',array['Python'],'https://github.com/test/test','private');
 create table public.skills(id uuid,name text,category text);
 insert into public.skills values ('22222222-2222-4222-8222-222222222222','Python','AI');
 `);
 const migration=fs.readFileSync('supabase/20260916_portfolio_persistence.sql','utf8');
 await db.exec(migration);
 const first=(await db.query('select content from public.portfolio_content')).rows[0].content;
 assert.equal(first.projects[0].title,'Existing');assert.equal(first.projects[0].techStack[0],'Python');assert.equal('private_note' in first.projects[0],false);
 await db.exec(migration);assert.equal((await db.query('select count(*)::int n from public.portfolio_content')).rows[0].n,1);
 await db.exec('set role anon');assert.equal((await db.query('select id from public.portfolio_content')).rows.length,1);
 await assert.rejects(db.exec("update public.portfolio_content set revision=1"),/permission denied/);
 await db.exec("set role authenticated; select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false)");
 assert.equal((await db.query('update public.portfolio_content set revision=1 returning id')).rows.length,0);
 await assert.rejects(db.exec("insert into public.portfolio_admins values ('33333333-3333-4333-8333-333333333333')"),/permission denied/);
 await assert.rejects(db.exec("insert into storage.objects(bucket_id,name) values ('portfolio-assets','resume/not-owner.pdf')"),/row-level security/);
 await db.exec("select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false)");
 await db.exec("update public.portfolio_content set content=jsonb_set(content,'{skills}','[]'),revision=1 where id=1 and revision=0");
 assert.equal((await db.query('select content from public.portfolio_content')).rows[0].content.skills.length,0);
 assert.equal((await db.query('update public.portfolio_content set revision=2 where revision=0 returning id')).rows.length,0);
 await assert.rejects(db.exec('update public.portfolio_content set revision=7'),/exactly one/);
 await assert.rejects(db.exec("update public.portfolio_content set content=content || '{\"messages\":[]}',revision=2"),/check constraint/);
 await db.exec("insert into storage.objects(bucket_id,name) values ('portfolio-assets','resume/owner.pdf')");
 await db.exec('reset role');assert.equal((await db.query('select count(*)::int n from public.projects')).rows[0].n,1);
 }finally{await db.close()}
});
