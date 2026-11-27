# PRD — Photo Grid (`grid/grid.html`)

Spesifikasi final UI & fitur menu **GRID**. Simpan sebagai acuan supaya
keputusan tidak hilang. Detail teknis ada di `README-grid.md`.

## Tema

- Palet Mori: bg `#fffbf2`, surface `#f7f3e9`, teks `#1a1917`, redup `#6e6a64`,
  garis `rgba(26,25,23,.14)`, font **JetBrains Mono**.
- Layout full-screen (`position:fixed; inset:0; overflow:hidden`), tanpa scroll.

## UI

- Bingkai grid responsif, panel unduhan menempel di tombol Unduh
  (foto 76×76, tombol 32×32, warna Mori).

## Fitur

- Tambah foto per slot (klik slot kosong) atau banyak sekaligus.
- Drag reorder antar slot (ambang 8px, ada bayangan/ghost + penanda target).
- Zoom per foto via roda mouse (maks 4×, titik jangkar ikut cursor).
- Ganti tata letak untuk 3/4/5 foto: kiri/kanan/atas/bawah besar.
- Tombol **🎲 acak** (pilih tata letak acak, tidak sama dengan yang sekarang).
- Aspect bingkai: `1/1`, `4/5`, `3/4`, `16/9`.
- Jumlah slot 1–25 (default 3); jumlah foto > 3 memakai grid sama rata.
- Export PNG (`1.png`, `2.png`, … urut via `localStorage`) + Simpan /
  Bagikan WA / Bagikan Telegram.
- Cara potong foto (tombol di panel unduhan):
  - **Isi** (default): foto memenuhi sel, sisanya dipotong (collage-style).
  - **Utuh**: seluruh foto terlihat, sisa ruang kosong putih — mencegah foto kepotong.

## State

- Foto & zoom hanya di memori (tidak disimpan).
- Counter nama file & durasi toast di `localStorage`
  (`gridDlCounter`, `grid_toast_dur`).

## Kunci (jangan diubah)

- `const LAYOUTS` adalah **satu sumber kebenaran** untuk tata letak.
  Preview memakai `areas` + `cols`/`rows` sebagai CSS Grid; export memakai
  `areaToRect()` dari definisi yang sama. Kalau tata letak diubah, cukup ubah
  `LAYOUTS` — jangan menyalin koordinat ke tempat lain.
- Edit langsung `grid/grid.html`; entri di `index.html`
  (`href: "grid/grid.html"`, `thumb: "grid/image-index.jpg"`) sudah pas.
- Fallback thumbnail di `src/js/image-loader.js` (`loadJaDiPhoto`) pakai
  `../../grid/image-index.jpg` — jangan dikembalikan ke `public/grid/`.

## Alur kerja

- Setiap perubahan UI yang final wajib dicatat di sini.
- Setiap perubahan selesai langsung di-commit + push ke `origin/main`.
