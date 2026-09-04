-- scripts/add-percepatan-column.sql
-- Tambah kolom khusus percepatan di ja_di_menus (biar terpisah dari manual/premix)
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

-- Bahan 1-6 per size untuk percepatan (kayak bahan biasa)
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
alter table ja_di_menus add column if not exists percepatan_hot_1 text;
alter table ja_di_menus add column if not exists percepatan_hot_2 text;
alter table ja_di_menus add column if not exists percepatan_hot_3 text;
alter table ja_di_menus add column if not exists percepatan_hot_4 text;
alter table ja_di_menus add column if not exists percepatan_hot_5 text;
alter table ja_di_menus add column if not exists percepatan_hot_6 text;

-- juga untuk dr_coffee kalau mau sinkron
alter table if exists dr_coffee_menus add column if not exists percepatan_12oz_1 text;
alter table if exists dr_coffee_menus add column if not exists percepatan_12oz_2 text;
alter table if exists dr_coffee_menus add column if not exists percepatan_12oz_3 text;
alter table if exists dr_coffee_menus add column if not exists percepatan_12oz_4 text;
alter table if exists dr_coffee_menus add column if not exists percepatan_12oz_5 text;
alter table if exists dr_coffee_menus add column if not exists percepatan_12oz_6 text;

-- verifikasi
-- select id, name, percepatan_12oz, percepatan from ja_di_menus where percepatan_12oz is not null limit 5;
