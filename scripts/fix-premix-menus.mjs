// scripts/fix-premix-menus.mjs
// Fix kategori, hapus duplikat, update bahan kurang
import { readFileSync } from 'fs';
import { resolve } from 'path';

const env = Object.fromEntries(
  readFileSync(resolve(import.meta.dirname, '../.env'), 'utf8')
    .split('\n').filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const URL = env.SUPABASE_URL;
const KEY = env.SUPABASE_PUBLISHABLE_KEY;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function patch(id, payload) {
  const r = await fetch(`${URL}/rest/v1/ja_di_menus?id=eq.${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(`PATCH #${id} gagal: ${r.status} ${await r.text()}`);
  console.log(`✅ PATCH #${id}: ${JSON.stringify(payload).slice(0,80)}...`);
}

async function del(id) {
  const r = await fetch(`${URL}/rest/v1/ja_di_menus?id=eq.${id}`, {
    method: 'DELETE', headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
  });
  if (!r.ok) throw new Error(`DELETE #${id} gagal: ${r.status}`);
  console.log(`🗑️  DELETE #${id}`);
}

async function main() {
  // 1. Fix kategori PREMIX → MANUAL & PREMIX
  const premixIds = [408, 409, 410, 411, 412, 413, 414, 415, 416];
  for (const id of premixIds) {
    await patch(id, { cat: 'MANUAL & PREMIX' });
  }

  // 2. Hapus duplikat COFFEE LATTE (id:473)
  await del(473);

  // 3. Update bahan yang kurang berdasarkan DR COFFEE

  // COFFEE LATTE (id:408) - tambah bahan_16oz
  await patch(408, {
    bahan_16oz_1: 'Stock espresso 80 g',
    bahan_16oz_2: 'Es Batu 200 g',
    bahan_16oz_3: 'Susu UHT 150 g'
  });

  // JADI KEREN - KOPSU GULA AREN (id:413) - tambah bahan_16oz
  await patch(413, {
    bahan_16oz_1: 'Gula Aren 20 g',
    bahan_16oz_2: 'Es Batu 180 g',
    bahan_16oz_3: 'Premix UHT 200 g',
    bahan_16oz_4: 'Stock espresso 80 g'
  });

  // MOCHA LATTE (id:414) - isi semua bahan
  await patch(414, {
    bahan_12oz_1: 'Saus Coklat 15 g',
    bahan_12oz_2: 'Krimer 20 g',
    bahan_12oz_3: 'Espresso* 1×',
    bahan_12oz_4: 'Es Batu 150 g',
    bahan_12oz_5: 'Susu UHT / Premix 100–140 g',
    bahan_16oz_1: 'Saus Coklat 25 g',
    bahan_16oz_2: 'Krimer 25 g',
    bahan_16oz_3: 'Espresso* 2×',
    bahan_16oz_4: 'Es Batu 180 g',
    bahan_16oz_5: 'Susu UHT 100 g',
    catatan: 'Larutkan krimer dan saus coklat dengan espresso panas di dalam milk jug, aduk hingga semua larut! · 5 g saus coklat diulirkan di gelas'
  });

  // JADI RINDU - KOPSU MADU (id:415) - tambah bahan_16oz
  await patch(415, {
    bahan_16oz_1: 'Madu 35 g',
    bahan_16oz_2: 'Es Batu 180 g',
    bahan_16oz_3: 'Premix UHT 200 g',
    bahan_16oz_4: 'Stock espresso 80 g'
  });

  console.log('\n✨ Selesai!');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
