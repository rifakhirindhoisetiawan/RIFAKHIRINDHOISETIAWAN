# RIFAKHIRINDHOISETIAWAN

Proyek modul resep & menu (halaman HTML statis + skrip bantu).

## Struktur Folder

```
.
├── index.html                      # Halaman utama (PWA)
├── grid.html                       # Photo grid tool
├── plano.html                      # Halaman_PLANO (rak)
├── plu-ja-di.html                  # Daftar produk PLU
├── produk-ja-di.html               # Detail produk
├── time-kamera.html                # Utility kamera/waktu
├── modul/                          # Halaman modul
│   ├── daily-task.html             # Daily Task
│   ├── ja-di.html                  # JA-DI (menu & resep)
│   └── selanjutnya.html            # Shelving/Rak
├── pages/                          # Halaman kategori & item (dihasilkan)
│   ├── cat-*.html                  # Kategori menu
│   ├── item-*.html                 # Item menu
│   ├── rak/                        # Layout rak
│   └── shelving/                   # Detail shelving
├── utility/                        # Halaman utilitas
├── images/                         # Gambar
├── data/                           # Data sumber teks
├── recipes/                        # Sumber resep (.txt)
├── scripts/                        # Skrip Node (.mjs)
│   ├── download/                   # Download foto
│   ├── sync/                       # Sinkron data/resep ke HTML
│   └── utils/                      # Ekstrak, validasi
├── package.json
└── manifest.json
```

## Cara Menjalankan Skrip

Semua skrip menggunakan `process.cwd()`, jalankan dari **root proyek**.

```bash
# Sinkronkan resep .txt -> pages/*.html
node scripts/sync/sync-recipes.mjs

# Sinkronkan data JA-DI
node scripts/sync/sync-data.mjs
node scripts/sync/sync-menus.mjs

# Download foto (Wikimedia Commons)
node scripts/download/download_all.mjs

# Download foto (Google fallback)
node scripts/download/download_with_google.mjs
```

## Catatan

- `scripts/download/download_all.mjs` — primary downloader (Wikimedia Commons)
- `scripts/download/download_with_google.mjs` — fallback untuk item yang gagal
- `scripts/sync/*` membaca `data/*.txt` dan menulis ke `modul/ja-di.html` & `pages/*.html`
