-- scripts/drop-cat-column.sql
-- Hapus kolom kategori di Supabase (ja_di_menus.cat)
-- HATI-HATI: ini hapus permanen, data cat akan hilang
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table ja_di_menus drop column if exists cat;

-- verifikasi
-- select id, name from ja_di_menus limit 3; -- cat sudah tidak ada
