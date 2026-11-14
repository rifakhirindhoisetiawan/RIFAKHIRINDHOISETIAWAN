# Folder NOTE

Menu NOTE berisi deretan tile 9:16 (gaya MORI) berisi daftar menu catatan.

- **`note/note.html`** — halaman menu NOTE: daftar menu dari tabel `note_menus`
  plus tile **ADMIN** di depan. Entry point dari `index.html`
  (`public/note/note.html`).
- **`note/note-view.html?id=<menu_id>`** — halaman catatan untuk satu menu:
  tambah / edit / hapus catatan, dan render rumus LaTeX (KaTeX) untuk catatan
  berawalan `Rumus ... $$...$$`.
- **`note/note-admin.html`** — kelola daftar menu: tambah / edit / hapus
  (berpassword Supabase Auth), upload foto ke bucket `note-foto`.
- **`note/plu.html`** + `note/plu.js` + `note/plu.css` — daftar produk
  read-only dari tabel `note_products` (fallback ke
  `note/seed-note-products.json`).

## Struktur UI admin

`note-admin.html` dan `note-view.html` memakai pola yang sama dengan Admin
KOPI (`public/kopi/admin/index.html`) dan admin Stok Opname
(`public/stok-opname/stock-admin.html`):

- Baris tulis (**MENU** / **KATEGORI** / **+**) adalah baris pertama **di
  dalam tabel** (`tbody.tulis-body`), bukan form terpisah di atas tabel.
  Input-nya transparan tanpa garis supaya tidak terlihat seperti komponen
  asing yang ditempel di dalam tabel.
- Aksi tiap baris diringkas jadi satu tombol tiga titik (⋮). Saat ditekan,
  tombol aslinya (upload / edit / hapus) muncul menimpanya di baris yang
  sama. Popup-nya berada di luar tabel (`position:fixed`) karena
  `.table-wrap` memakai `overflow:hidden`.
- Tombol aksi memakai warna krem (sama dengan header tabel), bukan hitam.
  Hapus tetap merah.
- Garis tepi tabel `1.5px` warna gelap + radius `10px`.
- Pop-up (konfirmasi hapus, edit catatan) memakai kartu tanpa border dengan
  radius `8px`, input transparan tanpa garis, tombol krem — sama seperti
  Admin Stok Opname.
- **Hapus catatan dikunci Supabase Auth**: pop-up "Konfirmasi Hapus"
  memanggil `supabase.auth.signInWithPassword` dengan akun
  `admin@kopi.com`. Password salah → data **tidak** terhapus. Kalau perangkat
  sudah punya sesi admin, pop-up dilewati.

## Setup Supabase

1. Jalankan `scripts/build/add-note-products.sql` di Supabase SQL Editor.
2. Seed 164 produk dari data lama:
   ```bash
   npm install
   node scripts/sync/seed-note-products.mjs
   ```

## Foto tile menu

- `public/note/image-index.jpg` — foto untuk tile menu NOTE, dan juga jadi
  foto default tile ADMIN (sampai ada foto khusus yang diunggah ke
  `note-foto/note/admin.jpg`).

Kalau file tidak ada, tile menampilkan motif garis putus-putus krem + ikon.

## Catatan

- `note.html` di root masih ada untuk bookmark lama, tapi yang aktif adalah
  folder `note/`.
- `note_products` hanya butuh bucket `note-foto`; policy-nya sudah dibuat di SQL.
- Hapus catatan dan menu dikunci Supabase Auth lewat RLS
  (`scripts/build/add-admin-rls.sql`), bukan password di dalam file.
