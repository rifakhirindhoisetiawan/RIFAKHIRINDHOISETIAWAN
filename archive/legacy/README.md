# Legacy Scripts (BEKU — jangan dijalankan)

Dipindah ke sini saat restrukturisasi 2026-09-25. Tidak dihapus sesuai permintaan,
tapi **tidak jalan**: input `data/*.txt` sudah dihapus dan path `images/` sudah rename.

- `sync-data.mjs`, `sync-menus.mjs` — generate JA-DI dari `data/ja-di-*.txt` (input hilang)
- `sync-daily-task.mjs`, `sync-daily-tasks.mjs` — generate daily-task dari `data/daily-task-periods.txt` (input hilang, diganti `scripts/generate-daily-task.mjs`)
- `wait-and-sync.mjs`, `sync-to-supabase.mjs` — sync massal era `data/` (input hilang, diganti `scripts/sync-new-menus.mjs`)
- `generate-ja-di.mjs` — baca path Temp absolut mesin lain (rusak dari awal)

Yang masih hidup: `scripts/sync/sync-recipes.mjs`, `scripts/generate-daily-task.mjs`,
`scripts/sync-new-menus.mjs`, `scripts/{download,utils,lib,templates}/`.
