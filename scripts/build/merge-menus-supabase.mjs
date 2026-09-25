// scripts/merge-menus-supabase.mjs
// Gabung menu PREMIX + MANUAL di Supabase
import { readFileSync } from 'fs';
import { resolve } from 'path';

const env = Object.fromEntries(
  readFileSync(resolve(import.meta.dirname, '../.env'), 'utf8')
    .split('\n').filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const URL = env.SUPABASE_URL;
const KEY = env.SUPABASE_PUBLISHABLE_KEY;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' };

const MERGE_MAP = {
  'COFFEE LATTE PREMIX': { name: 'COFFEE LATTE', plu: '443775 / 443776 / 443835' },
  'COFFEE LATTE ICE MANUAL': { delete: true },
  'VANILLA LATTE PREMIX': { name: 'VANILLA LATTE', plu: '443790 / 443791' },
  'VANILLA LATTE MANUAL': { delete: true },
  'SALTED CARAMEL LATTE PREMIX': { name: 'SALTED CARAMEL LATTE', plu: '443786 / 443787' },
  'SALTED CARAMEL LATTE MANUAL': { delete: true },
  'BUTTERSCOTCH LATTE PREMIX': { name: 'BUTTERSCOTCH LATTE', plu: '443788 / 443789' },
  'BUTTERSCOTCH LATTE MANUAL': { delete: true },
  'SALTED BUTTERCORN LATTE PREMIX': { name: 'SALTED BUTTERCORN LATTE', plu: '466231 / 466232' },
  'SALTED BUTTERCORN LATTE MANUAL': { delete: true },
  'JADI KEREN - KOPSU GULA AREN PREMIX': { name: 'JADI KEREN - KOPSU GULA AREN', plu: '443779 / 443780' },
  'JADI KEREN - KOPSU GULA AREN MANUAL': { delete: true },
  'MOCHA LATTE PREMIX': { name: 'MOCHA LATTE', plu: '443783 / 443784' },
  'MOCHA LATTE MANUAL': { delete: true },
  'JADI RINDU - KOPSU MADU PREMIX': { name: 'JADI RINDU - KOPSU MADU', plu: '443781 / 443782' },
  'JADI RINDU - KOPSU MADU MANUAL': { delete: true },
  'JADI MACCHIATTO PREMIX': { name: 'JADI MACCHIATTO', plu: '466229 / 466230' },
  'JA~DI MACCHIATTO MANUAL': { delete: true },
  'JADI MACCHIATTO MANUAL': { delete: true },
};

async function fetchAll() {
  const r = await fetch(`${URL}/rest/v1/ja_di_menus?select=id,name,plu_12oz,plu_16oz,plu_hot&order=id`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!r.ok) throw new Error('Fetch gagal: ' + r.status);
  return r.json();
}

async function updateRow(id, payload) {
  const r = await fetch(`${URL}/rest/v1/ja_di_menus?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Update #${id} gagal: ${r.status} ${await r.text()}`);
}

async function deleteRow(id) {
  const r = await fetch(`${URL}/rest/v1/ja_di_menus?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!r.ok) throw new Error(`Delete #${id} gagal: ${r.status} ${await r.text()}`);
}

async function main() {
  console.log('Fetching semua menu...');
  const all = await fetchAll();
  console.log(`Ditemukan ${all.length} menu`);

  let updated = 0, deleted = 0, skipped = 0;

  for (const row of all) {
    const action = MERGE_MAP[row.name];
    if (!action) { skipped++; continue; }

    if (action.delete) {
      console.log(`🗑️  Hapus: "${row.name}" (id: ${row.id})`);
      await deleteRow(row.id);
      deleted++;
    } else {
      const payload = { name: action.name };
      if (action.plu) {
        const parts = action.plu.split('/').map(s => s.trim());
        payload.plu_12oz = parts[0] || null;
        payload.plu_16oz = parts[1] || null;
        payload.plu_hot = parts[2] || null;
      }
      console.log(`✏️  Update: "${row.name}" → "${action.name}" (id: ${row.id})`);
      await updateRow(row.id, payload);
      updated++;
    }
  }

  console.log(`\nSelesai: ${updated} diupdate, ${deleted} dihapus, ${skipped} dilewati`);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
