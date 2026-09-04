-- scripts/supabase-dr-coffee.sql
-- Buat tabel dr_coffee_menus untuk sinkron admin.html <-> menu-resep-dr-coffee.html
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

create table if not exists dr_coffee_menus (
  id bigint generated always as identity primary key,
  name text not null,
  foto text,
  cls text,
  cat text, -- BLACK, WHITE / MILK BASED, BLENDED, NEW ITEMS & SPECIAL, TEA BASED, JUICE
  variant text, -- Hot / Ice / Hot & Ice
  link text,
  plu_12oz text,
  plu_16oz text,
  plu_hot text,
  -- bahan per size (mirip ja_di_menus, bisa diisi JSON string atau text)
  bahan_hot_1 text, bahan_hot_2 text, bahan_hot_3 text, bahan_hot_4 text, bahan_hot_5 text, bahan_hot_6 text,
  bahan_12oz_1 text, bahan_12oz_2 text, bahan_12oz_3 text, bahan_12oz_4 text, bahan_12oz_5 text, bahan_12oz_6 text,
  bahan_16oz_1 text, bahan_16oz_2 text, bahan_16oz_3 text, bahan_16oz_4 text, bahan_16oz_5 text, bahan_16oz_6 text,
  -- percepatan (premix UHT) - simpan sebagai text / json
  has_percepatan boolean default false,
  bahan_percepatan_12oz text, -- contoh: "Sirup 15g | Es Batu 150g | Premix UHT 140g | Stock espresso 40g"
  catatan text,
  created_at timestamp with time zone default now()
);

alter table dr_coffee_menus enable row level security;

drop policy if exists "Allow public read dr_coffee" on dr_coffee_menus;
drop policy if exists "Allow service insert dr_coffee" on dr_coffee_menus;
drop policy if exists "Allow service update dr_coffee" on dr_coffee_menus;
drop policy if exists "Allow service delete dr_coffee" on dr_coffee_menus;

create policy "Allow public read dr_coffee" on dr_coffee_menus for select using (true);
create policy "Allow service insert dr_coffee" on dr_coffee_menus for insert with check (true);
create policy "Allow service update dr_coffee" on dr_coffee_menus for update using (true);
create policy "Allow service delete dr_coffee" on dr_coffee_menus for delete using (true);

-- Verifikasi
-- select * from dr_coffee_menus limit 5;
