-- scripts/add-ice-12-16.sql
-- Tambah tabel ICE 12oz & 16oz + Percepatan 12oz/16oz
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

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

-- percepatan 12/16 juga (kalau belum ada)
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
