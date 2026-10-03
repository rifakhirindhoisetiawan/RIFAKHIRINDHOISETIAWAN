# Folder NOTE

Menu NOTE berisi dua sub-menu (deretan tile 9:16, gaya MORI):

- **`note/note.html`** — halaman menu NOTE: tile **PLU** dan tile **Admin**.
  Entry point dari `index.html` (`public/note/note.html`).
- **`note/plu.html`** + `note/plu.js` + `note/plu.css` — daftar produk (read-only).
  Data dari Supabase tabel `note_products`; kalau tabelnya belum ada, otomatis
  pakai `note/seed-note-products.json` supaya halaman tidak kosong.
- **`note/note-admin.html`** — kelola produk: tambah / edit / hapus (berpassword),
  upload foto ke bucket `note-foto`. Sumber data yang sama (`note_products`),
  jadi perubahan di sini langsung tampil di menu PLU.

## Setup Supabase

1. Jalankan `scripts/build/add-note-products.sql` di Supabase SQL Editor.
2. Seed 164 produk dari data lama:
   ```bash
   npm install
   node scripts/sync/seed-note-products.mjs
   ```

## Foto tile menu

Taruh file berikut di `public/note/` kalau ingin memakai gambar pada tile menu:

- `image-plu.jpg` — foto untuk tile PLU
- `image-admin.jpg` — foto untuk tile Admin

Kalau file tidak ada, tile menampilkan motif garis putus-putus krem + ikon.

## Catatan

- `note.html` di root masih ada untuk bookmark lama, tapi yang aktif adalah
  folder `note/`.
- `note_products` hanya butuh bucket `note-foto`; policy-nya sudah dibuat di SQL.