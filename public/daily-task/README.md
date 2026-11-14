# Folder DAILY-TASK

Folder ini berisi fitur **Daily Task** yang sebelumnya di `modul/daily-task.html`.

- **File utama:** `daily-task/daily-task.html` — buka via `daily-task/` dari menu DAILY TASK di `index.html`
- **Admin:** `daily-task/daily-task-admin.html` (kelola menu, tombol gear di daily-task.html)
- **Alias:** `daily-task/index.html` (copy dari daily-task.html agar `daily-task/` langsung kebuka)
- **Compat:** `modul/daily-task.html` + `modul/daily-task-admin.html` masih ada biar bookmark lama tetap jalan
- **Path:** `../manifest.json`, database via `../kopi/supabase.js` (kanonis di KOPI), `../utility/*.html`, foto admin di `image-daily-task/` (di folder ini)

## Tabel kegiatan (utility/hari|minggu|bulan + utility/index.html)

- Satu tabel untuk semua keperluan: baris **CARI** (pencarian, tanpa ikon kaca
  pembesar) dan baris **TULIS** (input + tombol `+`) berada **di dalam
  tabel**, sama seperti Admin Stok Opname — bukan form terpisah di atas.
- **Ceklis otomatis mengurutkan:** kegiatan yang dicentang otomatis turun ke
  paling bawah daftar; yang di-uncheck naik lagi ke **paling atas** (bukan
  kembali ke urutan menu). Status centang disimpan di `localStorage` per
  periode (`todo-hari`, `todo-minggu`, `todo-bulan`, `todo-<slug menu>`).
- Style tabel mengikuti Admin Stok Opname: bingkai `1.5px solid
  rgba(26,25,23,0.3)` radius `10px`, header krem `--mori-surface`, tinggi
  baris `45px`, hover `--mori-surface`, kolom No `44px`, font mono.
- Sumber data: tabel Supabase `daily_task_items` (dikelola dari menu ADMIN).

## Semat menu (bisa dilihat semua orang)

- Tombol pin di header `daily-task.html` menyematkan menu ke baris paling atas.
- Sematan disimpan di tabel Supabase `daily_task_pins` + cache `localStorage`
  (`daily_task_pinned_v1`), jadi **terlihat semua perangkat** — dan berubah
  realtime lewat channel `daily_task_pins_changes`.
- Perlu tabel + policy + masuk ke `supabase_realtime` (SQL ada di README
  utama repo).

