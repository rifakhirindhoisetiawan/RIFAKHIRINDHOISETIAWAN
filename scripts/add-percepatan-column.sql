-- scripts/add-percepatan-column.sql
-- Tambah kolom khusus percepatan di ja_di_menus (biar terpisah dari manual/premix)
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus add column if not exists percepatan_12oz text;
alter table ja_di_menus add column if not exists percepatan_16oz text;
alter table ja_di_menus add column if not exists percepatan_hot text;
-- alternatif single kolom JSON/text kalau mau simpel:
alter table ja_di_menus add column if not exists percepatan text;

-- juga untuk dr_coffee kalau mau sinkron
alter table if exists dr_coffee_menus add column if not exists percepatan_12oz text;
alter table if exists dr_coffee_menus add column if not exists percepatan_16oz text;
alter table if exists dr_coffee_menus add column if not exists percepatan text;

-- verifikasi
-- select id, name, percepatan_12oz, percepatan from ja_di_menus where percepatan_12oz is not null limit 5;
