-- scripts/migrate-ja-di-dual.sql
-- Tambah kolom terstruktur untuk Manual vs Premix, biar tidak cuma di catatan
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

-- 1. Tambah kolom manual & premix per size (text, biar bisa di-edit di Table Editor)
alter table ja_di_menus add column if not exists manual_bahan_12oz text;
alter table ja_di_menus add column if not exists manual_bahan_16oz text;
alter table ja_di_menus add column if not exists manual_bahan_hot text;
alter table ja_di_menus add column if not exists premix_bahan_12oz text;
alter table ja_di_menus add column if not exists premix_bahan_16oz text;
alter table ja_di_menus add column if not exists premix_bahan_hot text;

-- 2. Untuk yang sudah kegabung cat "MANUAL & PREMIX", pindah catatan ke kolom baru biar table
-- Contoh COFFEE LATTE id 408, JADI KEREN 413, etc. - kita isi manual_bahan_* dari catatan lama
-- (Opsional, bisa diisi manual lewat admin setelah ini)
-- Update contoh:
-- update ja_di_menus set manual_bahan_12oz = 'Espresso* 1× + Es Batu 150g + Susu UHT 130g', manual_bahan_16oz = 'Espresso* 2× + Es Batu 180g + Susu UHT 165g', manual_bahan_hot = 'Espresso* 1× + Fresh milk 120g', premix_bahan_12oz = 'Stock espresso 40g + Es Batu 150g + Susu UHT 120g', premix_bahan_16oz = 'Stock espresso 80g + Es Batu 200g + Susu UHT 150g' where id = 408;

-- Verifikasi
-- select id, name, cat, manual_bahan_12oz, premix_bahan_12oz, catatan from ja_di_menus where cat like '%MANUAL%PREMIX%' limit 5;
