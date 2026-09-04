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
  bahan_hot_1 text,
  bahan_hot_2 text,
  bahan_hot_3 text,
  bahan_hot_4 text,
  bahan_hot_5 text,
  bahan_hot_6 text,
  bahan_hot_16oz_1 text,
  bahan_hot_16oz_2 text,
  bahan_hot_16oz_3 text,
  bahan_hot_16oz_4 text,
  bahan_hot_16oz_5 text,
  bahan_hot_16oz_6 text,
  bahan_12oz_1 text,
  bahan_12oz_2 text,
  bahan_12oz_3 text,
  bahan_12oz_4 text,
  bahan_12oz_5 text,
  bahan_12oz_6 text,
  bahan_16oz_1 text,
  bahan_16oz_2 text,
  bahan_16oz_3 text,
  bahan_16oz_4 text,
  bahan_16oz_5 text,
  bahan_16oz_6 text,
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

-- 4. Storage bucket untuk foto menu (admin.html)
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
