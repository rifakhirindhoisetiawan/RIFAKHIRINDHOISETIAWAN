# RIFAKHIRINDHOISETIAWAN

Proyek modul resep & menu (halaman HTML statis + skrip bantu).

## Struktur Folder

```
.
├── index.html, modul01–05.html   # Halaman utama situs
├── plano.html, plu-ja-di.html    # Halaman pendukung
│   produk-ja-di.html, time-kamera.html
├── pages/                        # Halaman kategori & item menu (dihasilkan)
├── recipes/                      # Sumber resep (file .txt per item)
├── images/                       # Gambar (index, modul02, modul03, ...)
├── utility/                      # Halaman utilitas (hari/minggu/bulan/periode)
├── data/                         # Data sumber teks (modul03-data, modul03-menus)
├── scripts/                      # Semua skrip Node (.mjs), jalankan dari root proyek
│   ├── download/                 # Unduh foto (banyak versi eksperimen)
│   ├── sync/                     # Sinkronkan data/resep ke HTML
│   ├── debug/                    # Skrip debug
│   ├── test/                     # Skrip uji
│   └── utils/                    # Ekstrak, validasi, list gagal
├── package.json
└── manifest.json
```

## Cara Menjalankan Skrip

Semua skrip menggunakan `process.cwd()` (jalur relatif terhadap root proyek),
sehingga **jalankan dari root proyek**, bukan dari dalam `scripts/`.

```bash
# Sinkronkan resep .txt -> pages/*.html
node scripts/sync/sync-recipes.mjs

# Sinkronkan data modul03
node scripts/sync/sync-data.mjs
node scripts/sync/sync-menus.mjs

# Unduh foto (pilih versi yang masih dipakai, mis. yang _final)
node scripts/download/download_photos_final.mjs
```

## Catatan Maintenance

- Folder `scripts/download/` berisi banyak varian eksperimen
  (`_v2`, `_v3`, `_google`, `_wiki2`, `_remaining`, dll). Setelah versi
  final terbukti stabil, pertimbangkan menghapus yang sudah tidak dipakai
  agar tidak membingungkan.
- Skrip `sync-*` membaca `data/*.txt` dan menulis ke `modul03.html` /
  `pages/*.html`. Jangan pindahkan file data tanpa memperbarui jalurnya.
