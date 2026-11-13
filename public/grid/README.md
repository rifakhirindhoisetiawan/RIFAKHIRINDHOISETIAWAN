# Folder GRID

Folder ini berisi fitur **Photo Grid** — modul mandiri (satu file HTML, tanpa build step).

- **File utama:** `grid/grid.html` — dibuka dari menu GRID di `index.html` (`public/grid/grid.html`)
- **UI:** bingkai grid responsif, panel unduhan menempel di tombol Unduh (foto 76x76, tombol 32x32, warna Mori)
- **Fitur:**
  - tambah foto per slot (klik slot kosong) atau banyak sekaligus
  - drag reorder antar slot (ambang 8px, ada bayangan/ghost + penanda target)
  - zoom per foto dengan roda mouse (maks 4x, titik jangkar ikut cursor)
  - ganti tata letak untuk 3/4/5 foto: kiri/kanan/atas/bawah besar
    - tombol **🎲 acak** (pilih tata letak acak, tidak sama dengan yang sekarang)
  - aspect bingkai: `1/1`, `4/5`, `3/4`, `16/9`
  - jumlah slot 1–25 (default 3); jumlah foto > 3 memakai grid sama rata
  - export PNG (`1.png`, `2.png`, … urut via `localStorage`) + Simpan / Bagikan WA / Bagikan Telegram
  - **cara potong foto** (tombol di panel unduhan):
    - **Isi** (default): foto memenuhi sel, sisanya dipotong —-collage-style
    - **Utuh**: seluruh foto terlihat, sisa ruang kosong putih — untuk mencegah foto kepotong
- **State:** foto & zoom hanya di memori (tidak disimpan), counter nama file & durasi toast di `localStorage`
  (`gridDlCounter`, `grid_toast_dur`)

## Kenapa foto kadang kepotong?

Sel tata letak "besar" punya bentuk yang jauh berbeda dari foto, misalnya 3 foto tata letak
"kiri besar": sel besar = 1/2 lebar × 1 tinggi (rasio 1:2 untuk kanvas 1:1), sedangkan dua sel
kecil = 1:1. Foto 4:3 yang dipasang di sel 1:2 akan **terpotong** kalau dipaksa memenuhi sel
(mode *cover*). Ini bukan bug, tapi konsekuensi bentuk selnya.

Solusi yang tersedia:

1. **Tombol potong → "Utuh"** (di panel unduhan): seluruh foto terlihat, tidak ada yang kepotong.
   Preview di layar ikut berubah, jadi yang diunduh sama persis dengan yang dilihat.
2. **Zoom per foto** (roda mouse di desktop): memperbesar foto di dalam sel, berguna untuk
   memilih bagian yang dikehendaki.
3. **Pilih aspect lain** (`4/5`, `3/4`, `16/9`): rasio kanvas lain bikin jumlah sel terpotong
   lebih sedikit untuk foto tertentu.


## Struktur kode `grid.html`

```
<style>   tema Mori (krem) + override radius tombol
<script>  1. Konstanta & definisi tata letak
           2. State aplikasi
           3. Referensi elemen DOM
           4. Gestur (drag reorder + zoom)
           5. Render grid
           6. Aksi tombol
           7. Panel unduhan (bubble, simpan, bagikan)
           8. Export ke canvas
```

### Definisi tata letak = satu sumber kebenaran

`const LAYOUTS` (bagian 1) berisi tiap tata letak sebagai daftar `grid-area` CSS per slot,
contohnya jumlah 5 foto, tata letak "kiri besar":

```js
"left-big": {
  cols: 3,
  rows: 2,
  areas: ["1 / 1 / 3 / 2", "1 / 2 / 2 / 3", "2 / 2 / 3 / 3", "1 / 3 / 2 / 4", "2 / 3 / 3 / 4"],
}
```

- **Preview** memakai `areas` + `cols`/`rows` apa adanya sebagai CSS Grid.
- **Export PNG** memakai `areaToRect()` yang mengubah `areas` yang sama jadi kotak piksel.

Karena keduanya dari definisi yang sama, tampilan di layar dan file hasil unduhan
tidak mungkin berbeda. Kalau tata letak diubah, cukup ubah `LAYOUTS` — jangan
menyalin koordinat ke tempat lain.

> Untuk AI lain: edit langsung `grid/grid.html`. Menu di `../index.html` (`href: "public/grid/grid.html"`) sudah pas.
