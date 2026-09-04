-- scripts/drop-hot-all.sql
-- Hapus tabel HOT di bawah ICE 16OZ (bahan_hot_all)
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus drop column if exists bahan_hot_all_1;
alter table ja_di_menus drop column if exists bahan_hot_all_2;
alter table ja_di_menus drop column if exists bahan_hot_all_3;
alter table ja_di_menus drop column if exists bahan_hot_all_4;
alter table ja_di_menus drop column if exists bahan_hot_all_5;
alter table ja_di_menus drop column if exists bahan_hot_all_6;
