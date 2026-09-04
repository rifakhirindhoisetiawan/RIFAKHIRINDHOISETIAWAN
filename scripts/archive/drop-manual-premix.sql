-- scripts/drop-manual-premix.sql
-- Hapus kolom Manual vs Premix (karena sudah pakai percepatan aja)
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus drop column if exists manual_bahan_12oz;
alter table ja_di_menus drop column if exists manual_bahan_16oz;
alter table ja_di_menus drop column if exists manual_bahan_hot;
alter table ja_di_menus drop column if exists premix_bahan_12oz;
alter table ja_di_menus drop column if exists premix_bahan_16oz;
alter table ja_di_menus drop column if exists premix_bahan_hot;
