-- scripts/add-hot-16oz.sql
-- HOT sekarang ada 12oz & 16oz kayak request
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus add column if not exists bahan_hot_16oz_1 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_2 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_3 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_4 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_5 text;
alter table ja_di_menus add column if not exists bahan_hot_16oz_6 text;

-- untuk dr_coffee juga kalau mau
alter table if exists dr_coffee_menus add column if not exists bahan_hot_16oz_1 text;
alter table if exists dr_coffee_menus add column if not exists bahan_hot_16oz_2 text;
alter table if exists dr_coffee_menus add column if not exists bahan_hot_16oz_3 text;
alter table if exists dr_coffee_menus add column if not exists bahan_hot_16oz_4 text;
alter table if exists dr_coffee_menus add column if not exists bahan_hot_16oz_5 text;
alter table if exists dr_coffee_menus add column if not exists bahan_hot_16oz_6 text;
