-- scripts/supabase-schema.sql
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Schema untuk migrasi data TXT ke Supabase

-- 1. JA-DI menus (dari data/ja-di-data.txt)
create table if not exists ja_di_menus (
  id bigint generated always as identity primary key,
  name text not null,
  foto text,
  cls text,
  link text,
  plu_12oz text,
  plu_16oz text,
  plu_hot text,
  plu_ice text,
  bahan_hot_1 text,
  bahan_hot_2 text,
  bahan_hot_3 text,
  bahan_hot_4 text,
  bahan_hot_5 text,
  bahan_hot_6 text,
  bahan_hot_7 text,
  bahan_hot_8 text,
  bahan_hot_9 text,
  bahan_hot_10 text,
  bahan_hot_16oz_1 text,
  bahan_hot_16oz_2 text,
  bahan_hot_16oz_3 text,
  bahan_hot_16oz_4 text,
  bahan_hot_16oz_5 text,
  bahan_hot_16oz_6 text,
  bahan_hot_16oz_7 text,
  bahan_hot_16oz_8 text,
  bahan_hot_16oz_9 text,
  bahan_hot_16oz_10 text,
  percepatan_12oz_1 text,
  percepatan_12oz_2 text,
  percepatan_12oz_3 text,
  percepatan_12oz_4 text,
  percepatan_12oz_5 text,
  percepatan_12oz_6 text,
  percepatan_12oz_7 text,
  percepatan_12oz_8 text,
  percepatan_12oz_9 text,
  percepatan_12oz_10 text,
  percepatan_16oz_1 text,
  percepatan_16oz_2 text,
  percepatan_16oz_3 text,
  percepatan_16oz_4 text,
  percepatan_16oz_5 text,
  percepatan_16oz_6 text,
  percepatan_16oz_7 text,
  percepatan_16oz_8 text,
  percepatan_16oz_9 text,
  percepatan_16oz_10 text,
  bahan_ice_12oz_1 text,
  bahan_ice_12oz_2 text,
  bahan_ice_12oz_3 text,
  bahan_ice_12oz_4 text,
  bahan_ice_12oz_5 text,
  bahan_ice_12oz_6 text,
  bahan_ice_12oz_7 text,
  bahan_ice_12oz_8 text,
  bahan_ice_12oz_9 text,
  bahan_ice_12oz_10 text,
  bahan_ice_16oz_1 text,
  bahan_ice_16oz_2 text,
  bahan_ice_16oz_3 text,
  bahan_ice_16oz_4 text,
  bahan_ice_16oz_5 text,
  bahan_ice_16oz_6 text,
  bahan_ice_16oz_7 text,
  bahan_ice_16oz_8 text,
  bahan_ice_16oz_9 text,
  bahan_ice_16oz_10 text,
  bahan_12oz_1 text,
  bahan_12oz_2 text,
  bahan_12oz_3 text,
  bahan_12oz_4 text,
  bahan_12oz_5 text,
  bahan_12oz_6 text,
  bahan_12oz_7 text,
  bahan_12oz_8 text,
  bahan_12oz_9 text,
  bahan_12oz_10 text,
  bahan_16oz_1 text,
  bahan_16oz_2 text,
  bahan_16oz_3 text,
  bahan_16oz_4 text,
  bahan_16oz_5 text,
  bahan_16oz_6 text,
  bahan_16oz_7 text,
  bahan_16oz_8 text,
  bahan_16oz_9 text,
  bahan_16oz_10 text,
  catatan text,
  created_at timestamp with time zone default now()
);
alter table ja_di_menus enable row level security;
create policy "Allow public read" on ja_di_menus for select using (true);
create policy "Allow service insert" on ja_di_menus for insert with check (true);
create policy "Allow service update" on ja_di_menus for update using (true);
create policy "Allow service delete" on ja_di_menus for delete using (true);

-- 2. Daily tasks (dari data/daily-task-periods.txt)
create table if not exists daily_tasks (
  id bigint generated always as identity primary key,
  title text not null,
  period text, -- pagi/siang/malam
  description text,
  created_at timestamp with time zone default now()
);
alter table daily_tasks enable row level security;
create policy "Allow public read" on daily_tasks for select using (true);
create policy "Allow all for service" on daily_tasks for all using (true) with check (true);

-- 3. Recipes (dari recipes/*.txt & pages/*.html)
create table if not exists recipes (
  id bigint generated always as identity primary key,
  name text not null,
  category text,
  content text,
  image_url text,
  created_at timestamp with time zone default now()
);
alter table recipes enable row level security;
create policy "Allow public read" on recipes for select using (true);
create policy "Allow all for service" on recipes for all using (true) with check (true);

-- 4. Stock opname (public/pastry-bakpau/stock.html)
create table if not exists stock_opname (
  id bigint generated always as identity primary key,
  menu_id bigint,
  product_id bigint,
  product_plu text not null,
  quantity integer not null default 0,
  stok_sistem integer not null default 0,
  stok_fisik integer not null default 0,
  hpp numeric not null default 0,
  selisih integer not null default 0,
  total_nominal numeric not null default 0,
  keterangan text,
  admin text,
  opname_date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);
alter table stock_opname add column if not exists admin text;
alter table stock_opname add column if not exists menu_id bigint;
alter table stock_opname add column if not exists product_id bigint;
alter table stock_opname add column if not exists stok_sistem integer not null default 0;
alter table stock_opname add column if not exists stok_fisik integer not null default 0;
alter table stock_opname add column if not exists hpp numeric not null default 0;
alter table stock_opname add column if not exists selisih integer not null default 0;
alter table stock_opname add column if not exists total_nominal numeric not null default 0;
alter table stock_opname add column if not exists keterangan text;
alter table stock_opname enable row level security;
drop policy if exists "Allow public read" on stock_opname;
drop policy if exists "Allow service insert" on stock_opname;
drop policy if exists "Allow service update" on stock_opname;
drop policy if exists "Allow service delete" on stock_opname;
create policy "Allow public read" on stock_opname for select using (true);
create policy "Allow service insert" on stock_opname for insert with check (true);
create policy "Allow service update" on stock_opname for update using (true) with check (true);
create policy "Allow service delete" on stock_opname for delete using (true);

-- 5. Menu SO (SO ROTI / SO BAKPAU / SO SIRUP) - dikelola dari stock-admin.html
create table if not exists so_menus (
  id bigint generated always as identity primary key,
  name text not null unique,
  lokasi text,
  tim_checker text,
  created_at timestamp with time zone default now()
);
alter table so_menus add column if not exists lokasi text;
alter table so_menus add column if not exists tim_checker text;
alter table so_menus enable row level security;
drop policy if exists "Allow public read" on so_menus;
drop policy if exists "Allow service insert" on so_menus;
drop policy if exists "Allow service update" on so_menus;
drop policy if exists "Allow service delete" on so_menus;
create policy "Allow public read" on so_menus for select using (true);
create policy "Allow service insert" on so_menus for insert with check (true);
create policy "Allow service update" on so_menus for update using (true) with check (true);
create policy "Allow service delete" on so_menus for delete using (true);

-- 6. Produk per menu SO
create table if not exists stock_products (
  id bigint generated always as identity primary key,
  menu_id bigint not null references so_menus(id) on delete cascade,
  plu text,
  kode text,
  name text not null,
  satuan text not null default 'PCS',
  stok_sistem integer not null default 0,
  stok_fisik integer not null default 0,
  hpp numeric not null default 0,
  created_at timestamp with time zone default now(),
  unique (menu_id, plu)
);
alter table stock_products add column if not exists kode text;
alter table stock_products add column if not exists satuan text not null default 'PCS';
alter table stock_products add column if not exists foto_url text;
alter table stock_products add column if not exists stok_fisik integer not null default 0;
alter table stock_products add column if not exists stok_sistem integer not null default 0;
alter table stock_products add column if not exists hpp numeric not null default 0;
alter table stock_products alter column plu drop not null;
create unique index if not exists stock_products_menu_kode_uniq on stock_products (menu_id, kode) where kode is not null;
alter table stock_products enable row level security;
drop policy if exists "Allow public read" on stock_products;
drop policy if exists "Allow service insert" on stock_products;
drop policy if exists "Allow service update" on stock_products;
drop policy if exists "Allow service delete" on stock_products;
create policy "Allow public read" on stock_products for select using (true);
create policy "Allow service insert" on stock_products for insert with check (true);
create policy "Allow service update" on stock_products for update using (true) with check (true);
create policy "Allow service delete" on stock_products for delete using (true);

-- 7. Storage bucket untuk foto menu (admin.html)
insert into storage.buckets (id, name, public)
values ('admin-icons', 'admin-icons', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read admin-icons" on storage.objects;
drop policy if exists "Allow upload admin-icons" on storage.objects;
drop policy if exists "Allow update admin-icons" on storage.objects;
drop policy if exists "Allow delete admin-icons" on storage.objects;
create policy "Public read admin-icons" on storage.objects for select using (bucket_id = 'admin-icons');
create policy "Allow upload admin-icons" on storage.objects for insert with check (bucket_id = 'admin-icons');
create policy "Allow update admin-icons" on storage.objects for update using (bucket_id = 'admin-icons') with check (bucket_id = 'admin-icons');
create policy "Allow delete admin-icons" on storage.objects for delete using (bucket_id = 'admin-icons');

-- 8. Storage bucket untuk foto barang stok opname (stock-admin.html)
insert into storage.buckets (id, name, public)
values ('stock-foto', 'stock-foto', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read stock-foto" on storage.objects;
drop policy if exists "Allow upload stock-foto" on storage.objects;
drop policy if exists "Allow update stock-foto" on storage.objects;
drop policy if exists "Allow delete stock-foto" on storage.objects;
create policy "Public read stock-foto" on storage.objects for select using (bucket_id = 'stock-foto');
create policy "Allow upload stock-foto" on storage.objects for insert with check (bucket_id = 'stock-foto');
create policy "Allow update stock-foto" on storage.objects for update using (bucket_id = 'stock-foto') with check (bucket_id = 'stock-foto');
create policy "Allow delete stock-foto" on storage.objects for delete using (bucket_id = 'stock-foto');
