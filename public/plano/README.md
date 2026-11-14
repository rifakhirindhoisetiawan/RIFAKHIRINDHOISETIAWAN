# Folder PLANO

Modul **PLANO** — daftar rak & shelving (planogram) beserta kelolaan produknya.

- **`plano/index.html`** — halaman menu PLANO: grid tile rak (4 kolom, tile
  penuh radius `8px`) dari tabel `plano_items`, pencarian "Cari rak...", plus
  tile **ADMIN** di depan. Entry point dari `index.html`
  (`public/plano/index.html`).
- **`plano/admin.html`** — admin PLANO: kelola daftar rak (tambah / ubah /
  hapus, upload foto rak) dan daftar produk per rak (PLU, barcode, shelving,
  baris, RH, tanggal kedaluwarsa). Detail rak dibuka dengan klik baris.
- **`plano/shelving/rak/view.html?rak=<nama>`** — tampilan shelving untuk satu
  rak. **`plano/shelving/rak/rak-*.html`** (57 halaman) adalah salinan per
  rak supaya tetap bisa dibuka lewat tautan lama.
- **`plano/planogram-contoh.html`** — contoh planogram.

## Struktur UI admin

`plano/admin.html` memakai pola yang sama dengan Admin Stok Opname
(`public/stok-opname/stock-admin.html`):

- **Satu tabel untuk semua keperluan**: baris **CARI RAK** (pencarian, tanpa
  ikon kaca pembesar) dan baris **NAMA RAK** (input + tombol `+`) berada
  **di dalam tabel**, bukan kotak terpisah di atas tabel.
  - Baris cari: input transparan tanpa garis, font `inherit` (Inter) `13px`
    weight `700` uppercase.
  - Baris tulis: tulisan "Nama Rak" di **ujung kiri**, tombol `+` di **ujung
    kanan** kolom Aksi, satu blok krem dengan baris cari (tanpa garis
    pemisah).
- **Bingkai tabel**: `1.5px solid rgba(26,25,23,0.3)`, radius `10px`, latar
  `--mori-bg`, scrollbar disembunyikan.
- **Header**: mono `clamp(10px,2.6vw,12px)` weight `700`, letter-spacing
  `.5px`, uppercase, tinggi `34px`, padding `0 12px`, latar krem
  `--mori-surface`.
- **Sel**: tinggi `52px` (supaya foto antar baris tidak nempel), padding
  `0 12px`, garis bawah `--mori-line`, hover `--mori-surface`.
- **Kolom**: No `44px`, Foto `78px`, Aksi `116px`.
- **Foto**: kotak `44×44`, radius `8px`, tanpa border, foto rak dipotong
  `object-fit:cover`; foto kosong = kotak krem + tanda `-`; tile ADMIN =
  kotak hitam.
- **Tombol**: krem `--mori-surface` + ikon gelap, radius `8px`, **warna tidak
  berubah saat hover** (hanya bergeser 2px saat ditekan); hapus tetap merah
  `--mori-danger`. Ikon `↑` (upload), `✎` (edit), `✕` (hapus).
- **Jarak halaman**: container `padding: 14px 18px 40px` +
  `padding-top: max(14px, env(safe-area-inset-top))`.

## Semat menu

`plano/index.html` punya tombol **semat** di header. Menu yang disematkan
tampil di baris paling atas. Status sematan disimpan di `localStorage`
(`plano_pinned_v1`) per perangkat.

## Setup Supabase

1. Tabel utama `plano_items` (rak + produk).
2. Kolom detail produk: jalankan `scripts/build/add-plano-detail.sql`, dan
   kolom RH: `scripts/build/add-plano-rh.sql` di Supabase SQL Editor.
3. Bucket foto rak: `plano-foto` (path `plano/<nama>.jpg`, file admin
   `plano/admin.jpg`).
