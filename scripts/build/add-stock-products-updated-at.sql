-- Tambah kolom updated_at ke stock_products supaya tanggal edit stok
-- disimpan di database dan terlihat semua perangkat (bukan cuma localStorage).
-- Jalankan di Supabase Dashboard > SQL Editor.

alter table if exists public.stock_products
  add column if not exists updated_at timestamptz;

-- Index agar pengurutan/edit terbaru cepat.
create index if not exists idx_stock_products_updated_at
  on public.stock_products (updated_at desc);
