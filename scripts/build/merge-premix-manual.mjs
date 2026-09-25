// scripts/merge-premix-manual.mjs
// Gabung bahan Manual + Premix dalam satu menu
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
  const keys = Object.keys(payload).join(', ');
  console.log(`✅ #${id}: ${keys}`);
}

async function main() {
  // COFFEE LATTE (id:408) - tambah Manual version di catatan
  // Saat ini: PREMIX (Stock espresso, Susu UHT)
  // DR COFFEE Manual: Espresso* 1×, Fresh milk 120g (Hot) / Espresso* 1×, Es Batu 150g, Susu UHT 130g (12oz) / Espresso* 2×, Es Batu 180g, Susu UHT 165g (16oz)
  await patch(408, {
    catatan: 'MANUAL: Hot → Espresso* 1× + Fresh milk 120g | 12oz Ice → Espresso* 1× + Es Batu 150g + Susu UHT 130g (gula 20g, less 10g) | 16oz Ice → Espresso* 2× + Es Batu 180g + Susu UHT 165g (gula 40g, less 30g) · PREMIX: 12oz → Stock espresso 40g + Es Batu 150g + Susu UHT 120g | 16oz → Stock espresso 80g + Es Batu 200g + Susu UHT 150g'
  });

  // VANILLA LATTE (id:409) - 16oz tambah Premix option
  await patch(409, {
    bahan_16oz_5: 'Susu UHT / Premix 140 g'
  });

  // SALTED CARAMEL LATTE (id:410) - 16oz tambah Premix option
  await patch(410, {
    bahan_16oz_5: 'Susu UHT / Premix 140 g'
  });

  // BUTTERSCOTCH LATTE (id:411) - 16oz tambah Premix option
  await patch(411, {
    bahan_16oz_5: 'Susu UHT / Premix 140 g'
  });

  // JADI KEREN - KOPSU GULA AREN (id:413) - tambah Manual version
  // PREMIX: Gula Aren 13g, Es Batu 150g, Premix UHT 140g, Stock espresso 40g
  // MANUAL: Gula Aren 13g, Krimer 20g, Espresso* 1×, Es Batu 150g, Susu UHT 100g
  await patch(413, {
    catatan: 'MANUAL: Gula Aren 13g + Krimer 20g + Espresso* 1× + Es Batu 150g + Susu UHT 100g | 16oz → Gula Aren 20g + Krimer 25g + Espresso* 2× + Es Batu 180g + Susu UHT 100g · PREMIX: Gula Aren 13g + Es Batu 150g + Premix UHT 140g + Stock espresso 40g | 16oz → Gula Aren 20g + Es Batu 180g + Premix UHT 200g + Stock espresso 80g'
  });

  // MOCHA LATTE (id:414) - 16oz tambah Premix option
  await patch(414, {
    bahan_16oz_5: 'Susu UHT / Premix 140 g'
  });

  // JADI RINDU - KOPSU MADU (id:415) - tambah Manual version
  // PREMIX: Madu 25g, Es Batu 150g, Premix UHT 140g, Stock espresso 40g
  // MANUAL: Madu 25g, Krimer 20g, Espresso* 1×, Es Batu 150g, Susu UHT 100g
  await patch(415, {
    catatan: 'MANUAL: Madu 25g + Krimer 20g + Espresso* 1× + Es Batu 150g + Susu UHT 100g | 16oz → Madu 35g + Krimer 25g + Espresso* 2× + Es Batu 180g + Susu UHT 100g · PREMIX: Madu 25g + Es Batu 150g + Premix UHT 140g + Stock espresso 40g | 16oz → Madu 35g + Es Batu 180g + Premix UHT 200g + Stock espresso 80g'
  });

  // JADI MACCHIATTO (id:416) - tambah Premix option
  // MANUAL: Caramel Sauce 20g, Krimer 20g, Espresso* 1×, Es Batu 150g, Susu UHT 100g
  await patch(416, {
    bahan_12oz_5: 'Susu UHT / Premix 100 g',
    bahan_16oz_5: 'Susu UHT / Premix 100 g',
    catatan: 'Larutkan krimer dan caramel sauce dengan espresso panas di dalam milk jug, aduk hingga semua larut! · PREMIX: ganti Susu UHT dengan Premix UHT'
  });

  console.log('\n✨ Semua menu sudah gabung Manual + Premix!');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
