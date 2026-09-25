# Folder GRID

Folder ini berisi fitur **Photo Grid** yang sebelumnya di `grid.html` (root).

- **File utama:** `grid/index.html` (54487 bytes) — buka via `grid/` dari menu GRID di `index.html`
- **UI:** grid-frame responsive, download inline card di bawah tabel (foto 62x62, tombol 32x32 kotak 1:1 icon-only, warna indigo #6366f1)
- **Fitur:** tambah foto, drag reorder, zoom, ganti layout (3/4/5), aspect 1/1-16/9, download jadi `1.png`, `2.png`... urut via localStorage
- **Edit:** semua logic ada di satu file `index.html` (CSS + JS inline), manifest di `../manifest.json`

> Untuk AI lain: edit langsung `grid/index.html`. Menu di `../index.html:312` href `grid/` sudah pas.
