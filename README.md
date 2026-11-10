# My Love

PWA menu (Supabase). Entry `index.html` → `public/` modules. Start `start.bat` / `npx serve .`.

```
.
├─ index.html              # grid utama (import → src/js/image-loader.js, assets/)
├─ manifest.json           # PWA (start_url ./index.html)
├─ memos.html · note.html  # shim redirect
├─ assets/images/     # ikon & thumb grid (1.jpg/1.png per folder)
├─ src/
│  ├─ js/supabase.js       # KANONIS Supabase client
│  ├─ js/image-loader.js   # KANONIS loader + WebP thumb
│  └─ css/mori-style.css   # KANONIS tema krem Mori
├─ js/*, image-loader.js   # shim re-export → src/ (jangan edit, kompat saja)
├─ public/
│  ├─ mori-style.css       # shim @import → src/css/mori-style.css
│  ├─ kopi/                # KOPI (kopi.html + categories/ + pages/ + admin/)
│  │  ├─ categories/       # 9 kategori
│  │  ├─ pages/            # 63 halaman item-<slug>.html
│  │  └─ admin/            # admin ja_di_menus
│  ├─ daily-task/          # daily-task.html + utility/ (hari/minggu/bulan)
│  ├─ plano/               # plano/index.html + shelving/rak/ (56 rak)
│  ├─ stok-opname/         # ex pastry-bakpau (stock.html)
│  └─ mori/ note/ exp/ musnah/ ofo/ grid/ link/ ... # modul standalone
├─ scripts/{build,sync,lib,templates,utils,archive,download}/
├─ docs/SETUP_SUPABASE.md
├─ data/recipes/
└─ app-mori/               # proyek terpisah (Capacitor/Mori downloader)
```

Kanonis: `src/`. Semua `public/*/supabase.js` & `js/` di root cuma shim biar `../kopi/supabase.js` & `../../js/supabase.js` tetap jalan tanpa pecah link.

## Catatan Styling Admin Kopi
- `public/kopi/admin/index.html`: Diselaraskan dengan Admin Stok Opname (`public/plano/admin.html`) mencakup bingkai tabel sudut meluncur (radius 10px), ketebalan garis luar tabel (`1.5px solid rgba(26,25,23,0.3)`), tinggi baris section header dan tabel menu bawah (`36px`), serta warna teks dan thumbnail foto.
- `public/kopi/pages/item-*.html` (78 halaman): Judul menu dan tabel PLU digabung dalam satu kartu `.side` — garis luar `1px solid var(--mori-line)`, radius `10px`, latar `#fffbf2`. Baris judul memakai `.plu-head` (halaman tanpa tombol komentar memakai `.side > h1`), sedangkan `.plu-table` dibuat tanpa bingkai sendiri agar tidak muncul garis ganda.
