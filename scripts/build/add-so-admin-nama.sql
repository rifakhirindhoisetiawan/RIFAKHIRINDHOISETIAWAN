-- add-so-admin-nama.sql
-- Tabel untuk NAMA tile ADMIN di Stok Opname, supaya bisa diubah dari
-- stock-admin.html tanpa mengubah kode.
--
-- Kenapa perlu tabel, bukan ditulis langsung di HTML:
-- Nama ini sebelumnya ditulis sebagai literal 'ADMIN STOCK OPNAME' di dua
-- file (stock-admin.html dan stock.html). Kalau hanya diubah di satu file,
-- daftar menu yang dilihat pelanggan akan tetap memakai nama lama.
-- Dengan satu baris di server, begitu nama diubah semua perangkat --
-- HP kasir maupun HP pelanggan -- langsung ikut berubah.
--
-- Kenapa tabel terpisah, bukan baris di so_menus:
-- Tile ADMIN bukan record menu. so_menus.id adalah
-- bigint generated always as identity, sedangkan tile admin memakai id
-- tetap 'admin' supaya fotonya bisa dicari di path storage 'menu/admin.jpg'
-- (lihat AKUN_TILE / fotoMenuUrl di stock-admin.html). Memaksanya jadi
-- baris so_menus akan membuat tile admin muncul sebagai menu biasa,
-- dan baris itu bisa ikut terhapus.
--
-- Struktur: satu baris, id selalu 'admin'. Upsert dipakai supaya tidak
-- perlu INSERT terpisah lebih dulu.
--
-- Cara pakai: Supabase Dashboard > SQL Editor > salin semua > Run.
-- Aman dijalankan berulang kali (idempotent).
--
-- Catatan keamanan: policy di bawah mengizinkan siapa pun (anon) mengubah
-- nama ini, sama seperti policy so_menus yang sudah dipakai di repo ini
-- (lihat add-admin-rls.sql). Itu disengaja supaya kasir tidak perlu login.
-- Kalau nanti mau hanya admin yang boleh mengubah, ganti policy update
-- dengan versi "admin only" yang ada di bagian bawah file ini.

-- ============================================================
-- 1. Tabel
-- ============================================================
create table if not exists public.so_admin (
  id   text primary key,
  name text not null
);

comment on table public.so_admin is
  'Nama tile ADMIN Stok Opname. Satu baris, id selalu ''admin''. Dibaca semua perangkat.';

-- ============================================================
-- 2. RLS
-- ============================================================
alter table public.so_admin enable row level security;

-- BACA: semua orang, supaya nama yang sama muncul di semua HP
drop policy if exists "so_admin_select_public" on public.so_admin;
create policy "so_admin_select_public" on public.so_admin
  for select to anon, authenticated using (true);

-- UBAH NAMA: semua orang (kasir tidak perlu login)
drop policy if exists "so_admin_update_public" on public.so_admin;
create policy "so_admin_update_public" on public.so_admin
  for update to anon, authenticated using (true) with check (true);

-- BUAT BARIS PERTAMA: semua orang. Upsert butuh izin ini supaya
-- stock-admin.html bisa menyimpan nama tanpa INSERT terpisah.
drop policy if exists "so_admin_insert_public" on public.so_admin;
create policy "so_admin_insert_public" on public.so_admin
  for insert to anon, authenticated with check (true);

-- ============================================================
-- 3. Isi awal
-- ============================================================
-- Memakai insert ... on conflict do nothing supaya nama yang sudah
-- pernah diganti tidak ditimpa balik ke ADMIN STOCK OPNAME.
insert into public.so_admin (id, name)
values ('admin', 'ADMIN STOCK OPNAME')
on conflict (id) do nothing;

-- ============================================================
-- OPSIONAL: hanya admin yang boleh mengubah nama
-- ------------------------------------------------------------
-- HAPUS policy "so_admin_update_public" dan "so_admin_insert_public"
-- dulu, karena policy "public" lebih longgar dan TIDAK otomatis kalah
-- oleh policy yang lebih sempit (keduanya sama-sama diizinkan).
--
-- drop policy if exists "so_admin_update_public" on public.so_admin;
-- drop policy if exists "so_admin_insert_public" on public.so_admin;
--
-- create policy "so_admin_update_admin" on public.so_admin
--   for update to authenticated using (true) with check (true);
-- create policy "so_admin_insert_admin" on public.so_admin
--   for insert to authenticated with check (true);
--
-- policy "so_admin_select_public" tetap dipakai supaya semua orang
-- tetap bisa MELIHAT nama yang sudah diganti, hanya mengubahnya yang
-- dibatasi.

-- ============================================================
-- KEMBALIKE NAMA AWAL
-- ------------------------------------------------------------
-- update public.so_admin set name = 'ADMIN STOCK OPNAME' where id = 'admin';
