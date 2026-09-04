-- scripts/final-sync-supabase.sql
-- Sinkronkan Supabase biar sama kayak admin.html & supabase-schema.sql terbaru
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

-- 1. Tambah PLU HOT & ICE (sekarang 4 baris: 12OZ/16OZ/HOT/ICE)
alter table ja_di_menus add column if not exists plu_hot text;
alter table ja_di_menus add column if not exists plu_ice text;

-- 2. Tambah Bahan HOT ALL (tabel di bawah HOT 16OZ)
alter table ja_di_menus add column if not exists bahan_hot_all_1 text;
alter table ja_di_menus add column if not exists bahan_hot_all_2 text;
alter table ja_di_menus add column if not exists bahan_hot_all_3 text;
alter table ja_di_menus add column if not exists bahan_hot_all_4 text;
alter table ja_di_menus add column if not exists bahan_hot_all_5 text;
alter table ja_di_menus add column if not exists bahan_hot_all_6 text;

-- 3. Hapus kolom percepatan umum (sudah gak dipakai, sekarang cuma Bahan 1-6)
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

-- 4. Sudah dihapus sebelumnya, pastikan ke-drop juga
alter table ja_di_menus drop column if exists cat;
alter table ja_di_menus drop column if exists manual_bahan_12oz;
alter table ja_di_menus drop column if exists manual_bahan_16oz;
alter table ja_di_menus drop column if exists manual_bahan_hot;
alter table ja_di_menus drop column if exists premix_bahan_12oz;
alter table ja_di_menus drop column if exists premix_bahan_16oz;
alter table ja_di_menus drop column if exists premix_bahan_hot;

-- verifikasi
-- select id, name, plu_hot, plu_ice, bahan_hot_all_1 from ja_di_menus limit 3;
