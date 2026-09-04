-- scripts/readd-cat.sql
-- Balikin kolom cat biar JA-DI bisa sinkron (select * butuh cat)
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus add column if not exists cat text;
