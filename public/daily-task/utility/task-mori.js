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
const inputBaru = el('inputBaru');
const formTambah = el('formTambah');
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
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    // Format lama ({id: true}) dinormalisasi ke {id: {c: true, t: 0}}
    const out = {};
    for (const id in raw) {
      const v = raw[id];
      out[id] = v === true ? { c: true, t: 0 }
        : (v && typeof v === 'object' ? { c: !!v.c, t: Number(v.t) || 0 }
        : { c: !!v, t: 0 });
    }
    return out;
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
  const status = bacaStatus();

  // Yang sudah dicentang otomatis pindah ke paling bawah (tetap urut
  // sort_order). Yang belum di atas; yang baru saja di-uncheck pindah ke
  // paling atas (paling baru di atas); yang belum pernah disentuh tetap
  // urut sort_order.
  const terurut = kegiatan
    .map((d) => ({ d, st: status[d.id] }))
    .sort((a, b) => {
      const ac = !!(a.st && a.st.c), bc = !!(b.st && b.st.c);
      if (ac === bc) {
        if (!ac) {
          const at = (a.st && a.st.t) || 0, bt = (b.st && b.st.t) || 0;
          if (at || bt) return bt - at;
        }
        return (a.d.sort_order || 0) - (b.d.sort_order || 0);
      }
      return ac ? 1 : -1;
    })
    .map((x) => x.d);

  const rows = terurut
    .map((d, i) => {
      const selesai = !!(status[d.id] && status[d.id].c);
      return (
        '<tr data-id="' + d.id + '"' + (selesai ? ' class="selesai"' : '') + '>' +
        '<td class="c-no">' + (i + 1) + '</td>' +
        '<td class="c-teks"><div class="isi" title="' + String(d.text).replace(/"/g, '&quot;') + '">' + kapital(d.text) + '</div></td>' +
        '<td class="c-aksi"><div class="acts">' +
        '<button type="button" class="centang" data-toggle="' + d.id + '" title="' + (selesai ? 'Batalkan selesai' : 'Tandai selesai') + '" aria-label="' + (selesai ? 'Batalkan selesai' : 'Tandai selesai') + '"></button></div></td></tr>'
      );
    })
    .join('');

  const isi =
    kegiatan.length === 0
      ? '<tr><td class="c-no"></td><td class="c-teks"><div class="empty">Belum ada kegiatan</div></td><td class="c-aksi"></td></tr>'
      : rows;

  body.innerHTML = isi;
}

function toggleSelesai(id) {
  const status = bacaStatus();
  const kunci = String(id);
  const sedang = status[kunci] && status[kunci].c;
  // Urutan toggle dinaikkan monoton: tidak bergantung pada resolusi milidetik
  // Date.now(), jadi pengurutan "paling baru di-uncheck paling atas" selalu benar.
  let maxT = 0;
  for (const k in status) {
    const t = (status[k] && status[k].t) || 0;
    if (t > maxT) maxT = t;
  }
  status[kunci] = { c: !sedang, t: maxT + 1 };
  simpanStatus(status);
  render();
}

/* ===== Event =====
   Hanya menyalakan/mematikan centang. Penambahan kegiatan tidak diizinkan
   di halaman menu — tugasnya milik menu ADMIN. */
async function tambahKegiatan(teks) {
  const bersih = String(teks || '').trim();
  if (!bersih) return;
  const maxOrder = kegiatan.reduce((m, d) => Math.max(m, d.sort_order || 0), 0);
  const { error } = await supabase.from(ITEM_TABLE).insert([
    {
      period: PERIOD,
      text: bersih,
      sort_order: maxOrder + 1,
    },
  ]);
  if (error) {
    setHint('Gagal menambah: ' + error.message);
  } else {
    if (inputBaru) inputBaru.value = '';
    setHint('');
    await muatKegiatan();
  }
}

body.addEventListener('click', (e) => {
  const toggle = e.target.closest('[data-toggle]');
  if (toggle) toggleSelesai(parseInt(toggle.dataset.toggle, 10));
});

// Form tambah kegiatan hanya ada di halaman index (utility/index.html).
// Di hari/minggu/bulan.html form-nya tidak ada, jadi event-nya tidak dipasang
// supaya script tidak crash sebelum muatKegiatan() dijalankan.
if (formTambah && inputBaru) {
  formTambah.addEventListener('submit', (e) => {
    e.preventDefault();
    tambahKegiatan(inputBaru.value);
  });
  // Baris tambah dibuat ulang tiap render, jadi event-nya pakai delegasi.
  kegiatanBody.addEventListener('click', (e) => {
    if (e.target.closest('#btnItemTambah')) tambahKegiatan();
  });
  kegiatanBody.addEventListener('keydown', (e) => {
    if (e.target.id !== 'itemTambah' || e.key !== 'Enter') return;
    e.preventDefault();
    tambahKegiatan();
  });
  // Huruf pertama tiap kata otomatis kapital saat mengetik.
  kegiatanBody.addEventListener('input', (e) => {
    const input = e.target;
    if (input.id !== 'itemTambah') return;
    const pos = input.selectionStart;
    const baru = kapital(input.value);
    if (baru !== input.value) {
      input.value = baru;
      const posBaru = Math.min(pos, baru.length);
      try { input.setSelectionRange(posBaru, posBaru); } catch (err) {}
    }
  });
}

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