# Folder INDEX — halaman utama

- **File utama:** `index/index.html` — daftar menu GRID / KOPI / DAILY TASK / NOTE / dll.
- **Root `index.html`** cuma redirect shim ke sini (biar `http://localhost:8000/` tetap kebuka).
- **`image-index/`** — thumbnail tile menu + ikon app (favicon, PWA). Dipakai langsung (sefolder) oleh `index.html` via `thumb` eksplisit per menu.
- **Catatan path:** dari sini semua link keluar berawalan `../` (`../grid/`, `../kopi/`, ...). JS sendiri: `./image-loader.js`. Manifest PWA: `start_url ../index.html`, `scope ../` (cakupan root).
