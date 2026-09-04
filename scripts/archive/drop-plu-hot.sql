-- scripts/drop-plu-hot.sql
-- Hapus kolom PLU HOT di Supabase
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus drop column if exists plu_hot;
alter table if exists dr_coffee_menus drop column if exists plu_hot;
