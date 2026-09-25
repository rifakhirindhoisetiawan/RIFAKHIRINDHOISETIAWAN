-- scripts/add-bahan-7-10.sql
-- Bahan jadi 10 semua maksimal
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus add column if not exists bahan_12oz_7 text;
alter table ja_di_menus add column if not exists bahan_12oz_8 text;
alter table ja_di_menus add column if not exists bahan_12oz_9 text;
alter table ja_di_menus add column if not exists bahan_12oz_10 text;
alter table ja_di_menus add column if not exists bahan_16oz_7 text;
alter table ja_di_menus add column if not exists bahan_16oz_8 text;
alter table ja_di_menus add column if not exists bahan_16oz_9 text;
alter table ja_di_menus add column if not exists bahan_16oz_10 text;
alter table ja_di_menus add column if not exists bahan_hot_7 text;
alter table ja_di_menus add column if not exists bahan_hot_8 text;
alter table ja_di_menus add column if not exists bahan_hot_9 text;
alter table ja_di_menus add column if not exists bahan_hot_10 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_7 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_8 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_9 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_10 text;
alter table ja_di_menus add column if not exists percepatan_12oz_7 text;
alter table ja_di_menus add column if not exists percepatan_12oz_8 text;
alter table ja_di_menus add column if not exists percepatan_12oz_9 text;
alter table ja_di_menus add column if not exists percepatan_12oz_10 text;
alter table ja_di_menus add column if not exists percepatan_16oz_7 text;
alter table ja_di_menus add column if not exists percepatan_16oz_8 text;
alter table ja_di_menus add column if not exists percepatan_16oz_9 text;
alter table ja_di_menus add column if not exists percepatan_16oz_10 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_7 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_8 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_9 text;
alter table ja_di_menus add column if not exists bahan_ice_12oz_10 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_7 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_8 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_9 text;
alter table ja_di_menus add column if not exists bahan_ice_16oz_10 text;
