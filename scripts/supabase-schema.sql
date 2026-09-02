-- scripts/supabase-schema.sql
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Schema untuk migrasi data TXT ke Supabase

-- 1. JA-DI menus (dari data/ja-di-data.txt)
create table if not exists ja_di_menus (
  id bigint generated always as identity primary key,
  name text not null,
  icon text,
  cls text,
  cat text,
  link text,
  plu text,
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
