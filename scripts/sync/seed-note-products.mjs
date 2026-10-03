// scripts/sync/seed-note-products.mjs
// Jalankan sekali setelah SQL scripts/build/add-note-products.sql dieksekusi:
//   node scripts/sync/seed-note-products.mjs
//
// Isi tabel note_products dari data lama yang masih hardcoded di
// public/note/note.html (164 produk). Script ini idempoten: kalau PLU
// sudah ada, barisnya di-update, bukan diduplikasi.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../lib/supabase.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TABLE = 'note_products';
const SEED_FILE = path.join(__dirname, '..', '..', 'public', 'note', 'seed-note-products.json');

const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
console.log(`Seed berisi ${seed.length} produk.\n`);

// PLU yang sudah ada di DB -> pakai update, sisanya insert.
const { data: lama, error: errBaca } = await supabase.from(TABLE).select('id, plu');
if (errBaca) {
  console.error('Gagal membaca tabel:', errBaca.message);
  console.error('Jalankan dulu: scripts/build/add-note-products.sql');
  process.exit(1);
}

const existing = new Map((lama || []).map((r) => [String(r.plu), r.id]));
console.log(`Sudah ada di DB: ${existing.size} baris.\n`);

let tambah = 0;
let update = 0;
let gagal = 0;

for (const row of seed) {
  const plu = String(row.plu);
  const payload = {
    plu,
    deskripsi: row.deskripsi,
    kategori: row.kategori || 'RTE',
    sort_order: row.sort_order,
  };
  try {
    if (existing.has(plu)) {
      const { error } = await supabase.from(TABLE).update(payload).eq('id', existing.get(plu));
      if (error) throw error;
      update += 1;
    } else {
      const { error } = await supabase.from(TABLE).insert([payload]);
      if (error) throw error;
      tambah += 1;
    }
    process.stdout.write('.');
  } catch (e) {
    gagal += 1;
    console.error(`\nGagal ${plu}: ${e.message}`);
  }
}

console.log('\n');
console.log(`✓ ${tambah} baris baru, ${update} di-update, ${gagal} gagal.`);
console.log('Cek hasilnya di: public/note/note-admin.html');