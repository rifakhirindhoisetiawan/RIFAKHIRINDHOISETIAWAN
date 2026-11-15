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
- Tiap baris (52px): tile ikon/foto **32px** (radius 8px + garis `--mori-line`) →
  judul mono + **badge jumlah** `.notif-cnt` + sub-keterangan `.notif-sub`.
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
6. Lebar `min(300px, calc(100vw - 24px))`, `max-height:70vh`, scroll dalam.
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

## 4. Menu Utama (grid tile)

- Grid 4 kolom (`repeat(4, 1fr)`, gap `16px 10px`), lazy-load foto via
  `createLazyLoader` + `loadIndexPhoto`.
- Fitur sematan (pin): tersinkron Supabase tabel `portal_pins`
  (`PIN_TABLE = 'portal_pins'`), tombol `#headerPinBtn` masuk/keluar mode semat.

## 5. Riwayat Commit Terkait

| Commit | Isi |
|---|---|
| `8072b43` | Header bar bertema tabel admin SO (satu bar menyatu) |
| `ecb42b9` | Tombol lonceng & pin dipisah jadi kotak sendiri |
| `ed96030` | Lonceng & pin disamakan persis dengan kotak tanggal (1.5px + 10px) |
| `9114d26` | Optimasi pop-up notifikasi (baris klik, badge, animasi, Esc) |
| `f4b052f` | Posisi pop-up dari rect tombol lonceng + hover hanya di mouse |

Referensi tema: `public/stok-opname/stock-admin.html` (bingkai tabel 1.5px +
radius 10px, thead krem tanpa garis bawah), `public/musnah/musnah.html`
(search 46px radius 8px).
