-- Buat tabel note_pins supaya sematan (pin) menu NOTE
-- tersinkron di semua perangkat, sama seperti kopi_pins di menu KOPI.
-- Jalankan di Supabase Dashboard > SQL Editor.

create table if not exists public.note_pins (
  id bigint generated always as identity primary key,
  slug text unique not null,
  oleh text,
  created_at timestamptz default now()
);

-- Aktifkan RLS supaya data terpola.
alter table public.note_pins enable row level security;

-- Anon (publik) boleh baca dan insert pin.
create policy "Anon boleh baca semua pin note"
  on public.note_pins for select
  to anon
  using (true);

create policy "Anon boleh insert pin note"
  on public.note_pins for insert
  to anon
  with check (true);

create policy "Anon boleh hapus pin note"
  on public.note_pins for delete
  to anon
  using (true);
