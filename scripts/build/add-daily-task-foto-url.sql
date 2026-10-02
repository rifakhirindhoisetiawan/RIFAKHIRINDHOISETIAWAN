-- scripts/build/add-daily-task-foto-url.sql
-- Kolom foto_url untuk menu Daily Task (dipakai tombol upload foto ↑ di
-- public/daily-task/daily-task-admin.html, bucket Supabase Storage "stock-foto").
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > paste & Run
-- Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

alter table daily_tasks add column if not exists foto_url text;

-- Verifikasi: kolom harus muncul di hasil select
select id, title, slug, foto_url from daily_tasks order by id;