# My Love

PWA menu (Supabase). Entry `index.html` → `public/` modules. Start `start.bat` / `npx serve .`.

```
.
├─ index.html              # grid utama (import → src/js/image-loader.js, assets/)
├─ manifest.json           # PWA (start_url ./index.html)
├─ memos.html · note.html  # shim redirect
├─ assets/image-index/     # ikon & thumb grid (1.jpg/1.png per folder)
├─ src/
│  ├─ js/supabase.js       # KANONIS Supabase client
│  ├─ js/image-loader.js   # KANONIS loader + WebP thumb
│  └─ css/mori-style.css   # KANONIS tema krem Mori
├─ js/*, image-loader.js   # shim re-export → src/ (jangan edit, kompat saja)
├─ public/
│  ├─ mori-style.css       # shim @import → src/css/mori-style.css
│  ├─ kopi/supabase.js     # shim → src/js/supabase.js
│  ├─ kopi/ · pages/       # KOPI + halaman item
│  ├─ mori/                # app Mori (standalone)
│  ├─ admin/               # admin ja_di_menus
│  ├─ plano/               # plano/index.html + plano/admin.html
│  └─ note/ daily-task/ exp/ musnah/ ofo/ grid/ ... # modul lain
├─ scripts/{build,sync,lib,templates,utils,archive,download}/
├─ docs/SETUP_SUPABASE.md
├─ data/recipes/
└─ zib/                    # proyek terpisah (Capacitor/Mori downloader)
```

Kanonis: `src/`. Semua `public/*/supabase.js` & `js/` di root cuma shim biar `../kopi/supabase.js` & `../../js/supabase.js` tetap jalan tanpa pecah link.
