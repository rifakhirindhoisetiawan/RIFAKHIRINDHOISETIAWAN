import fs from 'fs';
import path from 'path';

try {
  const env = fs.readFileSync('.env', 'utf8');
  env.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const { supabaseAdmin } = await import('./lib/supabase.mjs');

const DATA_FILE = path.join(process.cwd(), 'data', 'menus-new.json');

async function syncNewMenus() {
  if (!fs.existsSync(DATA_FILE)) {
    console.log('❌ File data/menus-new.json tidak ditemukan!');
    console.log('→ Buat file data/menus-new.json dengan format JSON');
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  let newItems;
  try {
    newItems = JSON.parse(raw);
  } catch (e) {
    console.error('❌ Format JSON salah:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(newItems)) {
    console.error('❌ Format JSON harus array of objects');
    process.exit(1);
  }

  console.log(`Found ${newItems.length} item(s) di menus-new.json`);

  const validItems = newItems.filter(item => {
    if (!item.name || !item.name.trim()) {
      console.log(`⚠️  Skip: name kosong untuk item`);
      return false;
    }
    return true;
  });

  if (validItems.length === 0) {
    console.log('Tidak ada item valid untuk disync');
    return;
  }

  console.log(`Item valid: ${validItems.length}`);

  const { data: existingData } = await supabaseAdmin
    .from('ja_di_menus')
    .select('id, name, plu');

  const existingNames = new Set((existingData || []).map(r => r.name));
  const existingPlus = new Set((existingData || []).map(r => r.plu).filter(Boolean));

  const toInsert = [];
  const skipped = [];

  for (const item of validItems) {
    const payload = {
      name: item.name.trim(),
      icon: item.icon || '',
      cls: item.cls || 'g-a',
      cat: item.cat || '',
      link: item.link || '',
      plu: item.plu || null,
    };

    if (existingNames.has(payload.name)) {
      skipped.push({ name: payload.name, reason: 'sudah ada (nama)' });
      continue;
    }
    if (payload.plu && existingPlus.has(payload.plu)) {
      skipped.push({ name: payload.name, reason: 'sudah ada (PLU)' });
      continue;
    }

    toInsert.push(payload);
  }

  if (skipped.length > 0) {
    console.log(`\n⏭️  Skip ${skipped.length} item(s):`);
    skipped.forEach(s => console.log(`   "${s.name}" → ${s.reason}`));
  }

  if (toInsert.length === 0) {
    console.log('\nSemua item sudah ada di database. Tidak ada yang baru.');
    return;
  }

  console.log(`\nMasukkan ${toInsert.length} item(s) baru ke ja_di_menus...`);

  for (let i = 0; i < toInsert.length; i += 20) {
    const batch = toInsert.slice(i, i + 20);
    const { error } = await supabaseAdmin.from('ja_di_menus').insert(batch);
    if (error) {
      console.error(`Batch ${i / 20 + 1} gagal:`, error.message);
    } else {
      console.log(`  Batch ${i / 20 + 1} OK (${batch.length} rows)`);
    }
  }

  const { data: finalData } = await supabaseAdmin
    .from('ja_di_menus')
    .select('count', { count: 'exact', head: true });

  console.log(`\n✅ Selesai! Total ja_di_menus: ${finalData} rows`);
  console.log(`   Baru ditambahkan: ${toInsert.length}`);
  console.log(`   Di-skip: ${skipped.length}`);
}

syncNewMenus().catch(e => console.error('Fatal:', e));