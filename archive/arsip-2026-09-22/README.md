# Arsip 2026-09-22

Rapi file root - dipindah ke sini biar root bersih & mudah dicari AI.

## fix-scripts/ (6 file tidak terpakai)
- debug_media.ps1
- fix_media.ps1 / fix_media.py / fix_media_v2.ps1 / fix_media_v3.ps1
- fix_mobile.py
> Script perbaikan media/gambar sekali pakai, tidak ada referensi di HTML/JS.

## disabled-pages/ (3 halaman disabled di index.html)
- plano.html
- time-kamera.html
- modul/selanjutnya.html (disabled via disabledLabels)
> Masih ada di index.html tapi diberi class disabled (PLANO, TIME KAMERA, SELANJUTNYA). Kalau mau aktifkan lagi, pindah balik ke root/modul.

## file-zib/file zib/ (duplikat memos)
- Isi memos-main (extract zip) duplikat dari repo memos. Tidak dipakai di app.

## grid/ (dipindah, bukan arsip)
- grid.html root → grid/index.html (biar mudah dicari AI)
- href di index.html:312 sudah ganti ke "grid/"

Root sekarang tinggal file aktif: .env, admin.html, index.html, memos.html, note.html, produk-ja-di.html, manifest.json, package.json, start.bat/ps1, plus folder images/, js/, modul/, pages/, data/, recipes/, scripts/, utility/, grid/, archive/, etc.
