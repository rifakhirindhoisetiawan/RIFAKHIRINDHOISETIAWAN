-- scripts/fix-missing-percepatan-ice.sql
-- Fix kolom percepatan & ice yang hilang (1-6 belum ada, 7-10 sudah ada)
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus add column if not exists percepatan_12oz_1 text;
alter table ja_di_menus add column if not exists percepatan_12oz_2 text;
alter table ja_di_menus add column if not exists percepatan_12oz_3 text;
alter table ja_di_menus add column if not exists percepatan_12oz_4 text;
alter table ja_di_menus add column if not exists percepatan_12oz_5 text;
alter table ja_di_menus add column if not exists percepatan_12oz_6 text;
alter table ja_di_menus add column if not exists percepatan_16oz_1 text;
alter table ja_di_menus add column if not exists percepatan_16oz_2 text;
alter table ja_di_menus add column if not exists percepatan_16oz_3 text;
alter table ja_di_menus add column if not exists percepatan_16oz_4 text;
alter table ja_di_menus add column if not exists percepatan_16oz_5 text;
alter table ja_di_menus add column if not exists percepatan_16oz_6 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_1 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_2 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_3 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_4 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_5 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_6 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_1 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_2 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_3 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_4 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_5 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_6 text;

-- hapus bahan_hot_all yang sudah tidak dipakai (biar tidak error pas save)
alter table ja_di_menus drop column if exists bahan_hot_all_1;
alter table ja_di_menus drop column if exists bahan_hot_all_2;
alter table ja_di_menus drop column if exists bahan_hot_all_3;
alter table ja_di_menus drop column if exists bahan_hot_all_4;
alter table ja_di_menus drop column if exists bahan_hot_all_5;
alter table ja_di_menus drop column if exists bahan_hot_all_6;
