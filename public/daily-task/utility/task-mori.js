/* public/utility/task-mori.js
   Halaman kegiatan Daily Task (HARI / MINGGU / BULAN).
   Satu modul untuk ketiga halaman supaya perilakunya selalu sama:
   - Sumber data: tabel Supabase `daily_task_items` (dikelola dari menu ADMIN),
     jadi kegiatan yang diketik di admin langsung sinkron di sini.
   - Status centang disimpan di localStorage (hanya di perangkat ini).
   - Realtime Supabase: perubahan dari admin / tab lain langsung tampil. */

import { supabase } from '../../kopi/supabase.js';

const ITEM_TABLE = 'daily_task_items';

// Period diambil dari atribut data-period pada <body> (paling andal, tetap
// benar walau halaman dibuka lewat WebView/PWA/hash routing). Cadangan: nama
// file terakhir, mis. hari.html -> "hari".
const PERIOD = (() => {
  const dariQuery = new URLSearchParams(location.search).get('p') || '';
  const dariBody = (document.body && document.body.dataset.period) || '';
  const dariFile = (location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
  return String(dariQuery || dariBody || dariFile).trim().toLowerCase();
})();

const STORAGE_KEY = 'todo-' + PERIOD;
const JUDUL = PERIOD.toUpperCase();

const el = (id) => document.getElementById(id);
const body = el('kegiatanBody');
const cari = el('cari');
const hintEl = el('hint');

// Semua huruf jadi kapital, sama seperti di halaman admin.
const kapital = (s) => (s || '').toUpperCase();

let kegiatan = [];

function setHint(pesan) {
  if (!pesan) {
    hintEl.hidden = true;
    hintEl.textContent = '';
    return;
  }
  hintEl.hidden = false;
  hintEl.textContent = pesan;
}

/* ===== Status centang (localStorage, per perangkat) ===== */
function bacaStatus() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function simpanStatus(status) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch (e) {
    /* localStorage penuh / diblokir: status centang tidak tersimpan */
  }
}

/* ===== Data dari Supabase ===== */
async function muatKegiatan() {
  if (!PERIOD) {
    kegiatan = [];
    render();
    setHint('Period menu tidak terbaca — isi atribut data-period pada <body>.');
    return;
  }
  const { data, error } = await supabase
    .from(ITEM_TABLE)
    .select('id, text, sort_order')
    .eq('period', PERIOD)
    .order('sort_order');
  if (error) throw new Error(error.message);
  kegiatan = data || [];
  setHint('');
  render();
}

/* ===== Tabel ===== */
// Halaman menu ini read-only untuk datanya: kegiatan hanya bisa ditambah /
// dihapus dari menu ADMIN. Di sini cukup mencentang yang sudah dikerjakan.
function render() {
  const q = (cari.value || '').trim().toLowerCase();
  const status = bacaStatus();

  const rows = kegiatan
    .filter((d) => !q || (d.text || '').toLowerCase().includes(q))
    .map((d, i) => {
      const selesai = !!status[d.id];
      return (
        '<tr data-id="' + d.id + '"' + (selesai ? ' class="selesai"' : '') + '>' +
        '<td class="c-no">' + (i + 1) + '</td>' +
        '<td class="c-teks"><div class="isi" title="' + String(d.text).replace(/"/g, '&quot;') + '">' + kapital(d.text) + '</div></td>' +
        '<td class="c-aksi"><div class="acts">' +
        '<button type="button" class="centang" data-toggle="' + d.id + '" title="' + (selesai ? 'Batalkan selesai' : 'Tandai selesai') + '" aria-label="' + (selesai ? 'Batalkan selesai' : 'Tandai selesai') + '">' +
        (selesai ? '↺' : '✓') +
        '</button></div></td></tr>'
      );
    })
    .join('');

  const isi =
    kegiatan.length === 0
      ? '<tr><td class="c-no"></td><td class="c-teks"><div class="empty">Belum ada kegiatan</div></td><td class="c-aksi"></td></tr>'
      : rows || '<tr><td class="c-no"></td><td class="c-teks"><div class="empty">Tidak ada yang cocok</div></td><td class="c-aksi"></td></tr>';

  body.innerHTML = isi;
}

function toggleSelesai(id) {
  const status = bacaStatus();
  if (status[id]) delete status[id];
  else status[id] = true;
  simpanStatus(status);
  render();
}

/* ===== Event =====
   Hanya menyalakan/mematikan centang. Penambahan kegiatan tidak diizinkan
   di halaman menu — tugasnya milik menu ADMIN. */
body.addEventListener('click', (e) => {
  const toggle = e.target.closest('[data-toggle]');
  if (toggle) toggleSelesai(parseInt(toggle.dataset.toggle, 10));
});

cari.addEventListener('input', render);

/* ===== Realtime: sinkron otomatis dengan menu admin ===== */
try {
  supabase
    .channel('daily_task_items_' + PERIOD)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: ITEM_TABLE, filter: 'period=eq.' + PERIOD },
      () => {
        muatKegiatan().catch((e) => setHint('Gagal sinkron: ' + e.message));
      }
    )
    .subscribe();
} catch (e) {
  console.warn('Realtime kegiatan tidak aktif', e.message);
}

/* ===== Mulai ===== */
// Nama menu (HARI / MINGGU / BULAN) sengaja tidak ditulis di halaman ini:
// judul sudah ada di tab browser dan tile menu di halaman sebelumnya.
document.title = JUDUL + ' ' + String.fromCharCode(0x2014) + ' Daily Task';
muatKegiatan().catch((e) => setHint('Gagal memuat kegiatan: ' + e.message));