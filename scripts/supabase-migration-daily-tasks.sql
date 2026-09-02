-- Jalankan di SQL Editor: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new
alter table daily_tasks add column if not exists icon text;
alter table daily_tasks add column if not exists cls text;
alter table daily_tasks add column if not exists href text;
alter table daily_tasks add column if not exists slug text;
-- update existing rows dengan data dari txt
update daily_tasks set icon='☀️', cls='g-a', href='../utility/hari.html', slug='hari' where title='HARI';
update daily_tasks set icon='📅', cls='g-b', href='../utility/minggu.html', slug='minggu' where title='MINGGU';
update daily_tasks set icon='🌙', cls='g-c', href='../utility/bulan.html', slug='bulan' where title='BULAN';
