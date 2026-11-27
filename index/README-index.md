# index.html — Dokumentasi

Folder ini menyimpan catatan & rencana khusus untuk halaman utama
`index.html` (root). Tujuannya supaya dokumentasi index nggak tercampur
dengan README proyek keseluruhan di `README.md`.

## Isi

| File | Isi |
|---|---|
| `PRD-index.md` | Spesifikasi final UI: header bar, pop-up notifikasi, variabel tema, grid menu, dan keputusan modul terkait. |
| `PLAN-index.md` | Rencana / TODO singkat untuk pengembangan index selanjutnya. |

## File terkait di luar folder ini

- `index.html` — halaman utama (entry PWA).
- `manifest.json` — konfigurasi PWA (`start_url: ./index.html`).
- `assets/images/logo/` — favicon, apple-touch-icon, dan ikon aplikasi.
- `src/js/`, `src/css/` — sumber kanonis JS/CSS yang dipakai index.

## Aturan

- Setiap perubahan UI yang sudah final **wajib** dicatat di `PRD-index.md`
  supaya keputusan nggak hilang.
- Setiap perubahan selesai langsung di-commit + push ke `origin/main`.
