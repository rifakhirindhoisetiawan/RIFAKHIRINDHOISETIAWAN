-- scripts/drop-percepatan.sql
-- Hapus kolom khusus percepatan (Bahan 1-6)
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus drop column if exists percepatan;
alter table ja_di_menus drop column if exists percepatan_12oz;
alter table ja_di_menus drop column if exists percepatan_16oz;
alter table ja_di_menus drop column if exists percepatan_hot;
alter table ja_di_menus drop column if exists percepatan_12oz_1;
alter table ja_di_menus drop column if exists percepatan_12oz_2;
alter table ja_di_menus drop column if exists percepatan_12oz_3;
alter table ja_di_menus drop column if exists percepatan_12oz_4;
alter table ja_di_menus drop column if exists percepatan_12oz_5;
alter table ja_di_menus drop column if exists percepatan_12oz_6;
alter table ja_di_menus drop column if exists percepatan_16oz_1;
alter table ja_di_menus drop column if exists percepatan_16oz_2;
alter table ja_di_menus drop column if exists percepatan_16oz_3;
alter table ja_di_menus drop column if exists percepatan_16oz_4;
alter table ja_di_menus drop column if exists percepatan_16oz_5;
alter table ja_di_menus drop column if exists percepatan_16oz_6;
alter table ja_di_menus drop column if exists percepatan_hot_1;
alter table ja_di_menus drop column if exists percepatan_hot_2;
alter table ja_di_menus drop column if exists percepatan_hot_3;
alter table ja_di_menus drop column if exists percepatan_hot_4;
alter table ja_di_menus drop column if exists percepatan_hot_5;
alter table ja_di_menus drop column if exists percepatan_hot_6;
