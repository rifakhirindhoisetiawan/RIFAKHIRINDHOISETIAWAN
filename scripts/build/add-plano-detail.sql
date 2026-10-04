-- scripts/build/add-plano-detail.sql
-- Kolom detail planogram untuk public/plano-admin.html
-- (No, Rak, Shelving, Baris, PLU, Barcode, Nama Produk, Foto)
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table plano_items
  add column if not exists rak text,
  add column if not exists shelving text,
  add column if not exists baris integer,
  add column if not exists plu text,
  add column if not exists barcode text;

-- group_title tidak dipakai lagi (label Gondola dihapus)
alter table plano_items drop column if exists group_title;

-- Verifikasi: kolom harus muncul di hasil select
select id, rak, shelving, baris, plu, barcode, name, foto_url, sort_order
from plano_items order by sort_order;