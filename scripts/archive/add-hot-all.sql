-- scripts/add-hot-all.sql
-- Tambah tabel Bahan HOT di bawah 16oz HOT
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus add column if not exists bahan_hot_all_1 text;
alter table ja_di_menus add column if not exists bahan_hot_all_2 text;
alter table ja_di_menus add column if not exists bahan_hot_all_3 text;
alter table ja_di_menus add column if not exists bahan_hot_all_4 text;
alter table ja_di_menus add column if not exists bahan_hot_all_5 text;
alter table ja_di_menus add column if not exists bahan_hot_all_6 text;
