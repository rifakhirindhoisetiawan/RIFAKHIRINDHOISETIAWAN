-- add-plano-detail.sql
-- Kolom detail produk + RLS untuk tabel plano_items (dipakai public/plano/admin.html).
--
-- Cara pakai: Supabase Dashboard > SQL Editor > salin > Run.
-- Aman dijalankan berulang kali (kalau kolom/policy sudah ada, dilewati).
--
-- Kolom yang ditambahkan:
--   rak      -> nama rak (baris kosong = master rak, terisi = produk di rak itu)
--   shelving -> kode shelving
--   baris    -> nomor baris (angka, NULL = belum diisi)
--   plu      -> kode PLU
--   barcode  -> barcode produk
--   foto_url -> URL publik foto produk di bucket Storage

alter table public.plano_items
  add column if not exists rak     text,
  add column if not exists shelving text,
  add column if not exists baris    integer,
  add column if not exists plu      text,
  add column if not exists barcode  text,
  add column if not exists foto_url text;

-- ------------------------------------------------------------------
-- RLS: hapus hanya untuk user yang sudah login (authenticated).
-- Tanpa ini, siapa pun yang punya URL + anon key bisa hapus semua rak.
-- Jalankan blok ini juga kalau tabel belum punya RLS sama sekali.
-- ------------------------------------------------------------------
alter table public.plano_items enable row level security;

-- Baca tetap publik: halaman utama plano butuh daftar rak tanpa login.
drop policy if exists "plano_items_select_public" on public.plano_items;
create policy "plano_items_select_public"
  on public.plano_items for select
  to anon, authenticated
  using (true);

-- Tambah & ubah tetap publik (mode admin sederhana, sinkron antar perangkat).
-- Kalau mau adminpun wajib login, ganti to anon, authenticated -> to authenticated.
drop policy if exists "plano_items_insert_public" on public.plano_items;
create policy "plano_items_insert_public"
  on public.plano_items for insert
  to anon, authenticated
  with check (true);

drop policy if exists "plano_items_update_public" on public.plano_items;
create policy "plano_items_update_public"
  on public.plano_items for update
  to anon, authenticated
  using (true)
  with check (true);

-- Hapus: hanya authenticated.
drop policy if exists "plano_items_delete_admin" on public.plano_items;
create policy "plano_items_delete_admin"
  on public.plano_items for delete
  to authenticated
  using (true);
