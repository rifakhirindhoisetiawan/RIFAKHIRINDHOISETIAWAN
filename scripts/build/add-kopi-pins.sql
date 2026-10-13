-- add-kopi-pins.sql
-- Tabel untuk daftar menu KOPI yang disematkan (pin), supaya SEMATAN
-- TERLIHAT DI SEMUA HP, bukan cuma di satu perangkat.
--
-- Kenapa perlu tabel, bukan localStorage:
-- localStorage hanya ada di satu browser di satu HP. Kalau tiap kasir
-- menyematkan menu sendiri-sendiri, tidak ada yang tahu menu apa yang
-- paling sering dipakai. Dengan satu tabel bersama, siapa pun yang
-- menyematkan langsung terlihat di semua HP.
--
-- Struktur: satu baris per menu (bukan satu baris berisi daftar).
-- Dengan begitu dua orang yang menyematkan menu BERBEDA tidak saling
-- menimpa -- keduanya muncul bersama.
--
-- Cara pakai: Supabase Dashboard > SQL Editor > salin semua > Run.
-- Aman dijalankan berulang kali (idempotent).
--
-- Catatan keamanan: policy di bawah mengizinkan siapa pun (anon)
-- menyemat dan melepas. Itu disengaja supaya kasir tidak perlu login.
-- Kalau nanti mau hanya admin yang boleh mengubah, ganti policy
-- insert/delete berikut dengan versi "admin only" yang ada di bagian
-- bawah file ini.

-- ============================================================
-- 1. Tabel
-- ============================================================
create table if not exists public.kopi_pins (
  slug    text primary key,
  oleh    text,
  dibuat  timestamptz not null default now()
);

comment on table public.kopi_pins is
  'Menu KOPI yang disematkan. Satu baris per slug menu. Dibaca semua perangkat.';

-- ============================================================
-- 2. RLS
-- ============================================================
alter table public.kopi_pins enable row level security;

-- BACA: semua orang (supaya daftar sematan sama di semua HP)
drop policy if exists "pins_select_public" on public.kopi_pins;
create policy "pins_select_public" on public.kopi_pins
  for select to anon, authenticated using (true);

-- SEMAT: semua orang (kasir tidak perlu login)
drop policy if exists "pins_insert_public" on public.kopi_pins;
create policy "pins_insert_public" on public.kopi_pins
  for insert to anon, authenticated with check (true);

-- LEPAS SEMAT: semua orang (hapus baris = lepas sematan)
drop policy if exists "pins_delete_public" on public.kopi_pins;
create policy "pins_delete_public" on public.kopi_pins
  for delete to anon, authenticated using (true);

-- ============================================================
-- 3. Realtime
-- ============================================================
-- Supabase Dashboard > Database > Replication > Publication "supabase_realtime"
-- > Add table: public.kopi_pins
-- (atau jalankan SQL di bawah kalau publication-nya belum ada)

-- do $$ begin
--   alter publication supabase_realtime add table public.kopi_pins;
-- exception when duplicate_object then null;
-- end $$;

-- ============================================================
-- OPSIONAL: hanya admin yang boleh mengubah
-- ------------------------------------------------------------
-- Kalau nanti sematan hanya boleh diubah admin (harus login lewat
-- Supabase Auth), jalankan ini -- dan HAPUS tiga policy di atas dulu,
-- karena policy "public" lebih longgar dan tidak otomatis kalah.
--
-- drop policy if exists "pins_insert_public" on public.kopi_pins;
-- drop policy if exists "pins_delete_public" on public.kopi_pins;
--
-- create policy "pins_insert_admin" on public.kopi_pins
--   for insert to authenticated with check (true);
-- create policy "pins_delete_admin" on public.kopi_pins
--   for delete to authenticated using (true);
--
--olicy "pins_select_public" tetap dipakai supaya semua orang tetap
-- bisa MELIHAT daftar sematan, hanya mengubahnya yang dibatasi.

-- ============================================================
-- OPSIONAL: batasi jumlah sematan (misal maks 12)
-- ------------------------------------------------------------
-- create or replace function public.kopi_pins_batas() returns trigger
-- language plpgsql as $$
-- begin
--   if (select count(*) from public.kopi_pins) > 12 then
--     raise exception 'Maksimal 12 menu yang bisa disematkan';
--   end if;
--   return new;
-- end; $$;
--
-- drop trigger if exists kopi_pins_batas_trg on public.kopi_pins;
-- create trigger kopi_pins_batas_trg
--   before insert on public.kopi_pins
--   for each row execute function public.kopi_pins_batas();

-- ============================================================
-- BERESIHKAN SEMATAN YAH SUDAH TIDAK ADA MENUNYA
-- ------------------------------------------------------------
-- Kalau ada menu yang sudah dihapus dari ja_di_menus tapi sematannya
-- masih nempel, barisnya jadi sampah. Jalankan ini sesekali:
--
-- delete from public.kopi_pins p
-- where not exists (
--   select 1 from public.ja_di_menus m
--   where lower(regexp_replace(m.name, '[^a-z0-9]+', '-', 'g')) = p.slug
-- );