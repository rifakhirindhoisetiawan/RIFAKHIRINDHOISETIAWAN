/* public/note/plu.js
   Daftar produk NOTE (menu PLU).
   Sumber data: Supabase tabel note_products (dikelola dari note-admin.html).
   Kalau tabel belum ada, daftar lama dari seed-note-products.json dipakai
   supaya halaman tidak kosong selamanya. */

import { supabase } from '../kopi/supabase.js';

const TABLE = 'note_products';
const SEED_URL = 'seed-note-products.json?v=1';

const isi = document.getElementById('isi');
const cari = document.getElementById('cari');
const hintEl = document.getElementById('hint');

let semua = [];

function setHint(pesan) {
  if (!pesan) {
    hintEl.hidden = true;
    hintEl.textContent = '';
    return;
  }
  hintEl.hidden = false;
  hintEl.textContent = pesan;
}

function kelasBadge(kat) {
  const k = (kat || '').toUpperCase();
  if (!k) return 'badge';
  if (k.indexOf('KOPI') === 0) return 'badge badge-kopi';
  if (k.indexOf('JUICE') >= 0) return 'badge badge-juice';
  if (k.indexOf('ICE') >= 0) return 'badge badge-ice';
  if (k.indexOf('NON') === 0) return 'badge badge-nonkopi';
  return 'badge';
}

function barisKosong(pesan) {
  return '<tr><td class="c-plu"></td><td class="c-des"><div class="empty">' + pesan +
    '</div></td><td class="c-kat"></td><td class="c-foto"></td></tr>';
}

function render() {
  const q = (cari.value || '').trim().toLowerCase();
  const rows = semua.filter((p) => {
    if (!q) return true;
    return (p.plu || '').toLowerCase().includes(q) ||
      (p.deskripsi || '').toLowerCase().includes(q) ||
      (p.kategori || '').toLowerCase().includes(q);
  });

  if (!rows.length) {
    isi.innerHTML = barisKosong(
      semua.length ? 'Tidak ada yang cocok' : 'Belum ada produk. Tambah lewat menu Admin.'
    );
    return;
  }

  isi.innerHTML = rows
    .map((p) => {
      const thumb = p.foto_url
        ? '<div class="thumb"><img src="' + p.foto_url + '" alt="" loading="lazy" decoding="async" /></div>'
        : '<div class="thumb kosong"></div>';
      return (
        '<tr>' +
        '<td class="c-plu">' + (p.plu || '') + '</td>' +
        '<td class="c-des"><div class="isi" title="' + String(p.deskripsi || '').replace(/"/g, '&quot;') + '">' + (p.deskripsi || '') + '</div></td>' +
        '<td class="c-kat"><span class="' + kelasBadge(p.kategori) + '">' + (p.kategori || '-') + '</span></td>' +
        '<td class="c-foto">' + thumb + '</td>' +
        '</tr>'
      );
    })
    .join('');
}

async function muat() {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('plu, deskripsi, kategori, foto_url')
      .order('sort_order');
    if (!error && data && data.length) {
      semua = data;
      setHint('');
      render();
      return;
    }
  } catch (e) {
    /* jatuh ke daftar lokal di bawah */
  }

  // Fallback: daftar lama yang masih tersimpan sebagai JSON.
  try {
    const r = await fetch(SEED_URL);
    if (r.ok) {
      semua = await r.json();
      setHint('');
      render();
      return;
    }
  } catch (e) {
    /* tidak ada file seed */
  }
  semua = [];
  render();
}

cari.addEventListener('input', render);

// Realtime: perubahan dari menu Admin langsung tampil.
try {
  supabase
    .channel('note_products_plu')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      () => {
        muat();
      }
    )
    .subscribe();
} catch (e) {
  console.warn('Realtime NOTE tidak aktif', e.message);
}

muat();