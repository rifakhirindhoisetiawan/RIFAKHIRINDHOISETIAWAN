-- scripts/add-plu-ice.sql
-- Tambah PLU ICE di bawah PLU HOT
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus add column if not exists plu_ice text;
alter table if exists dr_coffee_menus add column if not exists plu_ice text;
