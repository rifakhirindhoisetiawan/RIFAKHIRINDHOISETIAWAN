# PRD — UI Index (My Love)

Spesifikasi tampilan yang sudah final di `index.html` (root). Simpan sebagai
acuan agar keputusan UI tidak hilang / berubah tanpa sengaja.

---

## 1. Bar Header Atas (tanggal · jam · lonceng · pin)

Tema: **kotak tabel Admin Stok Opname** (`public/stok-opname/stock-admin.html`,
rule `.table-wrap` ± baris 788–792).

| Elemen | Kelas / ID | Gaya final |
|---|---|---|
| Pembungkus bar | `.search-wrapper` | flex, `gap:10px`, kotak **terpisah** (tanpa bingkai) |
| Kotak tanggal/jam | `.search-box` (tanpa input) | bingkai **1.5px** `rgba(26,25,23,.3)`, radius **10px**, latar thead krem `--mori-surface`, teks **JetBrains Mono** tebal, tinggi 46px |
| Tombol lonceng | `#notifBtn.notif-btn` | **sama dengan kotak tanggal**: 1.5px gelap + radius 10px + krem, 46×46 |
| Tombol pin | `#headerPinBtn.notif-btn` | sama seperti lonceng; saat aktif (`aria-pressed="true"`) membalik: latar `--mori-text`, teks `--mori-bg` |
| Tanggal & jam | `#dateTime` (render JS) | dua span mono tebal: tanggal kiri (uppercase), jam kanan (`Space Mono`/mono) |

Ketiga kotak **dipisah** dengan jarak 10px — bukan satu bar menyatu.
Jangan kembalikan ke garis tipis `--mori-line` 8px; user sudah konfirmasi.

## 2. Pop-up Notifikasi (klik lonceng)

Dibuat lewat JS (`#notifPopup`, di-append ke `body`, `position:absolute`),
isi berupa tabel bertema admin SO.

### Struktur
- Tabel `.notif-tbl`: thead `INFO | AKSI` (krem `--mori-surface`, mono 11px uppercase).
- Tiap baris (52px), semuanya rata tengah vertikal (`.notif-sel` align center):
  tile ikon/foto **32px** (radius 8px + garis `--mori-line`) → blok teks
  `.notif-info` (judul mono + sub-keterangan `.notif-sub`) → **badge jumlah**
  `.notif-cnt` (**kotak 32px, ukuran sama dengan tombol panah**: krem
  `--mori-surface`, garis `--mori-line`, radius 8px, angka mono tebal).
  Badge berada di LUAR baris judul supaya sejajar persis dengan panah.
  Jarak badge ↔ panah dirapatkan (padding sel Info kanan 8px, sel Aksi 6px;
  lebar sel Aksi 44px).
- Tombol aksi panah `→` `.notif-buka`: 32px, gaya `.ico` SO (garis `--mori-line`,
  radius 8px, hover `#efe9da`, `:active` geser 2px).
- Sumber data: `NOTIF_ITEMS` (Menu Kopi → komen baru, Musnah → item musnah) +
  baris "Belum SO" (jumlah item > 7 hari, `SO_BELUM_SO_HARI`).

### Perilaku (jangan diubah)
1. **Seluruh baris bisa diklik** (`tr[data-href]`) untuk buka halamannya;
   klik pada tombol panah tetap lewat `<a>` biasa (delegasi klik skip `a`).
2. **Posisi pop-up dihitung dari rect tombol lonceng** saat dibuka:
   `top = bottom tombol + scrollY + 6px`, `right = lebar viewport − right tombol`.
   → pop-up selalu di BAWAH garis bingkai header, tidak pernah menimpanya
   (dulu dipatok `top:58px` dan menimpa garis header).
3. **Sorotan baris `:hover` hanya di perangkat ber-mouse**
   (`@media (hover:hover)`) — di layar sentuh hover nyangkut setelah diklik.
4. Tutup: klik di luar pop-up, atau tombol **Esc**.
5. Animasi masuk `notifMasuk` 0.16s (turun dari atas, seperti dropdown).
6. Lebar `min(240px, calc(100vw - 24px))` (minimal & dempet), `max-height:70vh`,
   scroll dalam. Baris 48px, thead 30px, padding sel 10px, gap ikon-teks 8px,
   jarak badge↔panah 10px (sel Info pr 6px, sel Aksi 42px pl 4 / pr 5).
7. Badge lonceng `#notifBadge` (titik merah) + refresh data tiap 60s dan saat
   perubahan Supabase (`note_entries`, `musnah_menus`, `stock_opname`).

## 3. Variabel Tema (`:root` index.html)

```css
--mori-bg: #fffbf2;
--mori-surface: #f7f3e9;
--mori-text: #1a1917;
--mori-text-2: #6e6a64;
--mori-line: rgba(26, 25, 23, 0.12);
--mori-accent: #1a1917;
--mori-mono: "JetBrains Mono", ui-monospace, monospace;
```

Font global body: Inter. Font JetBrains Mono sudah dimuat via Google Fonts.

## 4. Menu Utama (grid tile dalam frame tabel)

- **Seluruh menu dibungkus frame tabel** ala Admin Stok Opname
  (`.menu-frame`): bingkai `1.5px` gelap + radius `10px` (**tanpa strip
  header krem** — diminta user agar bersih menyatu). Jangan dihapus.
- Grid 4 kolom (`repeat(4, 1fr)`, gap `16px 10px`), padding dalam frame 14px,
  lazy-load foto via `createLazyLoader` + `loadIndexPhoto`.
- Fitur sematan (pin): tersinkron Supabase tabel `portal_pins`
  (`PIN_TABLE = 'portal_pins'`), tombol `#headerPinBtn` masuk/keluar mode semat.

### Kunci Menu (menu terkunci) — jangan dihapus
- Menu yang **belum disematkan** dirender sebagai `<div class="menu-item locked">`
  (bukan `<a>`) → **tidak bisa diklik siapa pun** (aria-disabled, title
  "Menu terkunci — sematkan lewat tombol pin untuk membuka").
- Tampilan terkunci: foto **grayscale + pudar**, label abu — **TANPA lencana
  gembok** (icon dilarang tampil, diminta user), tanpa efek tekan.
- Hanya menu yang **tersimatkan** (baris `.pin-row` atas) yang bisa dibuka.
- Cara membuka/mengunci menu: tekan tombol pin di header (mode semat aktif)
  → semua tile jadi bisa diklik untuk **menyematkan/membatalkan** sematan →
  tekan lagi tombol pin untuk keluar; menu re-render otomatis saat toggle.

## 5. Menu Kopi (`public/kopi/kopi.html`)

- **Bar Header Atas (Search & Tombol Aksi)**:
  - Kotak pencarian (`.search-box`): tinggi 46px, bingkai **1.5px** `rgba(26,25,23,0.3) !important`, radius **10px**, latar `--mori-surface` (#f7f3e9).
  - Tombol Pin Mode & Cek Komentar (`.pin-mode-btn`): ukuran 46×46px, bingkai **1.5px** `rgba(26,25,23,0.3)`, radius **10px**, latar `--mori-surface`, ikon 20×20px, efek `:active` geser 2px.
  - Struktur tata letak sejajar horizontal (`.search-row`) dempet 10px di dalam kontainer utama.

### Frame Tabel Menu (disamakan persis dengan index — jangan diubah)

- Frame `.menu-frame`: bingkai **1.5px** `rgba(26,25,23,0.3)`, radius **10px**, latar
  `--mori-bg`, `overflow: hidden`, **tanpa strip header krem**.
- Grid `.menu-list`: 4 kolom `repeat(4, 1fr)`, gap `16px 10px`
  (media ≥768px `22px 14px`), `width: 100%`, `align-content: start`.
- Padding dalam frame: **14px** (`.menu-frame .menu-list`).
- Tile `.icon-tile`: `max-width: 100px`, `aspect-ratio: 9/16`, radius **8px**,
  `margin-bottom: 10px`, shimmer `#f2eee2`/`#e8e2d2`, foto `saturate(0.55) contrast(1.02)`.
- Label `.item span`: 9px, weight 700, uppercase, `letter-spacing: 1px`,
  `line-height: 1.3`, clamp 2 baris, `word-break: break-word`.
- Media ≤360px: tile `85px`, label 8px + `letter-spacing: 0.6px`.
- Kontainer `.phone` sudah padding `12px 18px 40px` → `.menu-wrap` **TANPA**
  padding kiri-kanan (padding dobel = frame lebih sempit dari index).
- Admin (`public/kopi/admin/index.html`) `.menu-tabel`: `width: 100%`,
  `box-sizing: border-box`, bingkai 1.5px + radius 10px, latar `--mori-bg`,
  **tanpa padding** (tabel flush ke bingkai, strip judul krem menyatu penuh
  — ala `.table-wrap` Admin Plano). Baris cari: latar `--mori-surface`,
  tanpa garis bawah.

## 6. Riwayat Commit Terkait

| Commit | Isi |
|---|---|
| `8072b43` | Header bar bertema tabel admin SO (satu bar menyatu) |
| `1c5b2f7` | Seluruh menu dibungkus frame tabel SO (bingkai 1.5px + radius 10px + bar "MENU") |
| `ecb42b9` | Tombol lonceng & pin dipisah jadi kotak sendiri |
| `ed96030` | Lonceng & pin disamakan persis dengan kotak tanggal (1.5px + 10px) |
| `9114d26` | Optimasi pop-up notifikasi (baris klik, badge, animasi, Esc) |
| `94a37b0` | Badge jumlah pop-up jadi pill hitam solid (teks krem) |
| (saat ini) | Badge jumlah dikotakkan gaya sama dengan tombol panah (krem + garis + radius 8px), ukuran disamakan 32px, jarak dirapatkan, sejajar vertikal dengan panah |
| `f4b052f` | Posisi pop-up dari rect tombol lonceng + hover hanya di mouse |

Referensi tema: `public/stok-opname/stock-admin.html` (bingkai tabel 1.5px +
radius 10px, thead krem tanpa garis bawah), `public/musnah/musnah.html`
(search 46px radius 8px).

## 7. Alur Kerja (auto-push — permanen)

- Setiap perubahan yang selesai **langsung di-commit + push ke GitHub**
  tanpa menunggu perintah user (user tidak perlu mengetik "push" lagi).
- Commit **kecil per topik**, format: `style(<scope>): <perubahan>` —
  scope: `kopi`, `kopi-admin`, `prd`, `index`, dst.
- Push: `git push origin main`.
