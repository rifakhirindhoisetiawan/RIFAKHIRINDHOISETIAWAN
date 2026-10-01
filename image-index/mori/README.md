# Foto Menu MORI

Ganti foto tile MORI di dashboard cukup dengan menimpa file di folder ini.

## Cara ganti

Taruh fotomu sebagai **`1.jpg`** (disarankan) atau `1.png` di folder ini:

```
image-index/mori/1.jpg
```

Tidak perlu edit `index.html` — loader otomatis mendeteksinya
(`image-loader.js:45`, urutan probe: `.jpg` → `.png` → `.jpeg` → `.svg` → `.webp`).

Kalau ada **lebih dari satu** file (`1.jpg` dan `1.png` sekaligus), yang dipakai
adalah yang muncul duluan di urutan probe — jadi `1.jpg` menang.

## Ukuran yang disarankan

| | |
|---|---|
| Rasio | **9:16** (potret) |
| Resolusi | **169 × 300 px** — sama dengan semua foto menu lain |
| Format | JPG atau PNG |

Rasio 9:16 penting karena tile dashboard memakai `aspect-ratio: 9/16` +
`object-fit: cover`. Foto dengan rasio lain tetap tampil, tapi bagian
atas/bawah akan terpotong.

Ukuran aslinya boleh lebih besar (mis. 570 × 1015 seperti
`image-index/plano/1.jpg`), browser tetap menskalakan. Dismalakan
169 × 300 supaya ringan dan konsisten dengan yang lain.

## Kalau fotonya tidak cocok

Mau foto berbentuk kotak? Logo Mori aslinya (`zib/assets/icon.png`) berukuran
1080 × 1080 dan akan terpotong di tile 9:16. Screenshot aplikasi
(`zib/assets/1.png` s.d. `6.png`) sudah 9:16 dan lebih cocok.

## Catatan

- Setelah ganti, **hard refresh** browser (`Ctrl+Shift+R`) supaya cache gambar bersih.
- File `1.png` yang sekarang berisi logo Mori dengan latar gelap, hasil
  contain-fit supaya tidak terpotong.
