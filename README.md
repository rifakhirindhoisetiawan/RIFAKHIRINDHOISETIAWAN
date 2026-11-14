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
│  │  ├─ pages/            # 78 halaman item-<slug>.html
│  │  ├─ css/              # comment-notes.css (tabel komentar di pop-up catatan)
│  │  └─ admin/            # admin ja_di_menus
│  ├─ daily-task/          # daily-task.html + utility/ (hari/minggu/bulan)
│  ├─ plano/               # plano/index.html + admin.html + shelving/rak/ (57 rak)
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
- `public/kopi/pages/item-*.html` (78 halaman): Judul menu dan tabel PLU digabung dalam satu kartu `.side` — garis luar `1.5px solid rgba(26,25,23,.3)`, radius `10px`, latar `#fffbf2`. Baris judul memakai `.plu-head` (halaman tanpa tombol komentar memakai `.side > h1`), sedangkan `.plu-table` dibuat tanpa bingkai sendiri agar tidak muncul garis ganda.
- Tiap bagian resep (P12/P16/…) dibungkus `.resep-card` dengan header `.resep-head` + tombol minimize, dan otomatis collapsed saat halaman dibuka. Blok **Catatan** memakai kartu yang sama.
- Performa halaman item: menu dirender lebih dulu dari cache `localStorage` (`kopi_menu_v1_<id>`), lalu di-refresh lewat REST `fetch` langsung ke Supabase (tanpa menunggu `supabase-js`). Library `supabase-js` dari jsDelivr baru dimuat saat modal catatan dibuka; `<head>` memakai `preconnect`/`dns-prefetch` ke Supabase.

## Catatan Styling Admin Stok Opname (pola acuan)
Semua halaman admin memakai pola tabel yang sama dengan `public/stok-opname/stock-admin.html`:

- **Bingkai tabel**: `1.5px solid rgba(26,25,23,0.3)`, radius `10px`, latar `--mori-bg`, scrollbar disembunyikan.
- **Header tabel**: mono kecil `clamp(10px,2.6vw,12px)` weight `700`, letter-spacing `.5px`, uppercase, tinggi `34px`, padding `0 12px`, latar krem `--mori-surface`.
- **Sel**: tinggi `45px` (PLANO `52px` supaya foto antar baris tidak nempel), padding `0 12px`, garis bawah `--mori-line`, hover `--mori-surface`.
- **Baris cari + baris tulis**: jadi baris **di dalam tabel** (`tbody.cari-body` & `tbody.tambah`), input transparan tanpa garis, latar krem — bukan form terpisah di atas tabel.
- **Kolom**: No `44px`, Foto `78px` (foto kotak `44×44`, radius `8px`, tanpa border), Aksi `116px`.
- **Tombol**: krem `--mori-surface` + ikon gelap, radius `8px`, tidak berubah warna saat hover; hapus tetap merah `--mori-danger`.
- **Font input**: `font: inherit` (Inter, bukan mono) `13px` weight `600–700` uppercase — mono hanya untuk kolom angka/kode.
- **Jarak halaman**: container `padding: 14px 18px 40px` + `padding-top: max(14px, env(safe-area-inset-top))`.

## Catatan per modul (hasil penyamaan UI)

- **`public/plano/admin.html`** — tabel Daftar Rak disamakan penuh dengan Admin Stok Opname: baris **CARI RAK** (tanpa ikon kaca pembesar) dan **NAMA RAK** (input di ujung kiri, tombol `+` di ujung kanan) menyatu jadi satu blok krem di dalam tabel; kolom No/Foto/Aksi `44/78/116px`; foto kotak `44×44`; tombol aksi krem radius `8px`; ikon `↑ ✎ ✕` sudah benar. Tabel detail produk admin planogram diperbarui: garis pemisah kolom dihilangkan, baris tambah produk menyatu langsung di dalam tabel produk (`tbody.tambah`) tanpa kotak/border, dan kolom kedaluwarsa dibersihkan dari latar bergaris.
- **`public/plano/index.html`** — menu rak 4 kolom (tile penuh, radius `8px`) + tombol **semat** di header; menu yang disematkan naik ke baris atas.
- **`public/daily-task/daily-task.html`** — semat menu **realtime**: tabel `daily_task_pins` disinkron ke Supabase (bisa dilihat semua perangkat), bukan hanya `localStorage`.
- **`public/daily-task/utility/*`** — tabel kegiatan: baris cari + baris tulis di dalam tabel, dan **kegiatan yang dicentang otomatis turun ke bawah** (tidak dicentang naik lagi ke paling atas). Status centang disimpan di `localStorage` per periode.
- **`public/daily-task/daily-task-admin.html`** — tabel menu & tabel kegiatan disamakan dengan Admin Stok Opname; kotak search dihapus (pencarian lewat kolom "Rak").
- **`public/note/note-view.html`** — pop-up **Hapus catatan** kini benar-benar memverifikasi password lewat `supabase.auth.signInWithPassword` (sebelumnya password sebarang bisa menghapus data).
- **`public/note/note-admin.html`** — tabel & pop-up konfirmasi disamakan dengan Admin Stok Opname (kartu pop-up tanpa border, radius `8px`).
- **`public/kopi/komentar.html`** — daftar komentar jadi satu tabel (`Menu | Komentar | Aksi`) bergaya Admin Stok Opname.
- **`public/kopi/pages/item-*.html`** — pop-up **Catat/Komentar** di setiap halaman item: tabel komentar `No | Catatan | Aksi` + baris tulis krem, tombol krem radius `8px` (file CSS bersama `public/kopi/css/comment-notes.css`).
- **`index.html`** — pop-up notifikasi jadi tabel bergaya Admin Stok Opname (`Info | Aksi`), dan sematan portal ikut realtime.

## Perbaikan karakter rusak (mojibake)

12 file pernah korup encoding (UTF-8 → CP1252) sehingga ikon & simbol tampil salah
(`â†` → `↑`, `âœŽ` → `✎`, `âœ•` → `✕`, `â€”` → `—`, `Â·` → `·`, `Â±` → `±`):
`public/plano/admin.html`, `public/kopi/pages/item-*.html` (8 halaman),
`public/time-kamera/time-kamera.html`, `public/dual-kamera/dual-kamera.html`,
`public/laporan/laporan.html`, `public/link/link.html`. Sudah 0 karakter rusak di repo.

## Setup Supabase tambahan

Semat menu (portal + daily task) butuh tabel + RLS + realtime publication:

```sql
create table if not exists public.daily_task_pins (
  id bigint generated always as identity primary key,
  label text not null,
  dibuat timestamptz not null default now()
);
create unique index if not exists daily_task_pins_label_uniq on public.daily_task_pins(label);
alter table public.daily_task_pins enable row level security;
create policy "pins_select" on public.daily_task_pins for select using (true);
create policy "pins_insert" on public.daily_task_pins for insert with check (true);
create policy "pins_delete" on public.daily_task_pins for delete using (true);
do $$
begin
  alter publication supabase_realtime add table public.daily_task_pins;
exception
  when duplicate_object then null;
end $$;
```

Tabel `portal_pins` (semat menu di halaman utama) memakai pola yang sama.

