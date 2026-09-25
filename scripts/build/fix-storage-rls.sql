-- scripts/fix-storage-rls.sql
-- FIX: Gagal upload gambar "new row violates row-level security policy"
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

-- 1. Pastikan bucket admin-icons public
insert into storage.buckets (id, name, public)
values ('admin-icons', 'admin-icons', true)
on conflict (id) do update set public = true;

-- 2. Hapus policy lama jika ada (biar tidak duplicate)
drop policy if exists "Public read admin-icons" on storage.objects;
drop policy if exists "Allow upload admin-icons" on storage.objects;
drop policy if exists "Allow update admin-icons" on storage.objects;
drop policy if exists "Allow delete admin-icons" on storage.objects;
drop policy if exists "Allow all admin-icons" on storage.objects;

-- 3. Buat policy baru - allow anon/public untuk bucket admin-icons
create policy "Public read admin-icons"
on storage.objects for select
using (bucket_id = 'admin-icons');

create policy "Allow upload admin-icons"
on storage.objects for insert
with check (bucket_id = 'admin-icons');

create policy "Allow update admin-icons"
on storage.objects for update
using (bucket_id = 'admin-icons')
with check (bucket_id = 'admin-icons');

create policy "Allow delete admin-icons"
on storage.objects for delete
using (bucket_id = 'admin-icons');

-- Verifikasi: cek bucket dan policy
-- select * from storage.buckets where id='admin-icons';
-- select policyname, cmd from pg_policies where tablename='objects' and schemaname='storage';
