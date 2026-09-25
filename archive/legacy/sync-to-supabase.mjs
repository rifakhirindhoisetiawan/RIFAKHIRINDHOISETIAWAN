// scripts/sync-to-supabase.mjs
// Push data TXT -> Supabase (butuh tabel sudah dibuat via supabase-schema.sql)
// Jalankan: node scripts/sync-to-supabase.mjs
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// load .env
try {
  const env = fs.readFileSync('.env', 'utf8');
  env.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const { supabaseAdmin } = await import('./lib/supabase.mjs');

const DATA_FILE = path.join(process.cwd(), 'data', 'menus-new.json');

function tanya(pertanyaan) {
  return new Promise((resolve, reject) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdout.write(pertanyaan + ' ');
    const collector = (data) => {
      process.stdin.off('data', collector);
      process.stdin.pause();
      const jawaban = data.trim();
      resolve(jawaban);
    };
    process.stdin.on('data', collector);
    // Timeout after 30 detik
    setTimeout(() => {
      process.stdin.off('data', collector);
      process.stdin.pause();
      resolve(null);
    }, 30000);
  });
}

async function tambahMenuInteraktif() {
  const items = [];
  let lagi = 'y';

  while (lagi.toLowerCase() === 'y') {
    console.log('\n--- Input menu baru ---');
    const nama = await tanya('Nama menu: ');
    if (!nama.trim()) {
      console.log('⚠️ Nama tidak boleh kosong, menu di-skip');
      continue;
    }

    const icon = await tanya('Icon (tekan Enter untuk "🆕"): ') || '🆕';
    const cls = await tanya('Class (tekan Enter untuk "g-a"): ') || 'g-a';
    const cat = await tanya('Kategori (cat): ');
    const link = await tanya('Link (tekan Enter untuk kosongkan): ') || '';
    const plu = await tanya('PLU (tekan Enter untuk kosongkan): ') || '';

    items.push({
      name: nama.trim(),
      foto: icon.trim(),
      cls: cls.trim(),
      cat: cat.trim(),
      link: link.trim(),
      plu: plu.trim() ? Number(plu.trim()) : null,
    });

    lagi = await tanya('\nMau input menu lagi? (y/n): ');
  }

  if (items.length === 0) {
    console.log('Tidak ada menu baru ditambahkan.');
    return;
  }

  // Simpan ke file menus-new.json
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
  console.log(`\n✅ ${items.length} menu disimpan ke ${DATA_FILE}`);

  // Sync ke Supabase (deduplicasi by name/plu)
  try {
    const { data: existingData } = await supabaseAdmin
      .from('ja_di_menus')
      .select('id, name, plu_12oz, plu_16oz');

    const existingNames = new Set((existingData || []).map(r => r.name));
    const existingPlus = new Set((existingData || []).map(r => [r.plu_12oz, r.plu_16oz].filter(Boolean).join(' / ')).filter(Boolean));

    const toInsert = [];
    const skipped = [];

    for (const item of items) {
      const pluParts = String(item.plu_12oz || item.plu || '').split('/').map(s => s.trim()).filter(Boolean);
      const payload = {
        name: item.name,
        foto: item.foto || item.icon || '',
        cls: item.cls || 'g-a',
        cat: item.cat || '',
        link: item.link || '',
        plu_12oz: pluParts[0] || item.plu_12oz || null,
        plu_16oz: pluParts.slice(1).join(' / ') || item.plu_16oz || null,
      };

      if (existingNames.has(payload.name)) {
        skipped.push({ name: payload.name, reason: 'sudah ada (nama)' });
        continue;
      }
      const pluKey = [payload.plu_12oz, payload.plu_16oz].filter(Boolean).join(' / ');
      if (pluKey && existingPlus.has(pluKey)) {
        skipped.push({ name: payload.name, reason: 'sudah ada (PLU)' });
        continue;
      }

      toInsert.push(payload);
    }

    if (toInsert.length === 0 && skipped.length > 0) {
      console.log('\n⏭️ Semua item sudah ada di database:');
      skipped.forEach(s => console.log(`   "${s.name}" → ${s.reason}`));
      return;
    }

    if (toInsert.length > 0) {
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
    }

    const { data: finalData } = await supabaseAdmin
      .from('ja_di_menus')
      .select('count', { count: 'exact', head: true });

    console.log(`\n✅ Selesai! Total ja_di_menus: ${finalData} rows`);
    console.log(`   Baru ditambahkan: ${toInsert.length}`);
    if (skipped.length > 0) console.log(`   Di-skip: ${skipped.length}`);
  } catch (e) {
    console.error('❌ Error saat sync ke Supabase:', e.message);
  }
}

async function syncJaDi() {
  const txtPath = path.join(process.cwd(), 'data', 'ja-di-data.txt');
  if (!fs.existsSync(txtPath)) {
    console.log('skip ja-di: file not found', txtPath);
    return;
  }
  const txt = fs.readFileSync(txtPath, 'utf8');
  const blocks = txt.split('---').map(b => b.trim()).filter(Boolean);
  const rows = blocks.map(b => {
    const lines = b.split('\n').map(l => l.trim()).filter(Boolean);
    const pluParts = String(lines[5] || '').split('/').map(s => s.trim()).filter(Boolean);
    return {
      name: lines[0] || '',
      foto: lines[1] || '',
      cls: lines[2] || '',
      cat: lines[3] || '',
      link: lines[4] || '',
      plu_12oz: pluParts[0] || null,
      plu_16oz: pluParts.slice(1).join(' / ') || null
    };
  }).filter(r => r.name);

  console.log(`Sync ${rows.length} rows to ja_di_menus...`);
  await supabaseAdmin.from('ja_di_menus').delete().neq('id', 0);
  const { error } = await supabaseAdmin.from('ja_di_menus').insert(rows);
  if (error) console.error('ja_di_menus error:', error.message);
  else console.log('✅ ja_di_menus synced');
}

async function syncDailyTask() {
  const txtPath = path.join(process.cwd(), 'data', 'daily-task-periods.txt');
  if (!fs.existsSync(txtPath)) {
    console.log('skip daily-task: not found');
    return;
  }
  const txt = fs.readFileSync(txtPath, 'utf8');
  console.log('daily-task-periods.txt preview:', txt.slice(0, 200));
  console.log('ℹ️ daily_tasks sync skipped - sesuaikan parser dulu');
}

async function main() {
  await syncJaDi();
  await syncDailyTask();

  // Tanyakan apakah mau input menu baru interaktif
  const tambah = await tanya('\nMau menambah menu baru interaktif? (y/n): ');
  if (tambah && tambah.toLowerCase() === 'y') {
    await tambahMenuInteraktif();
  }

  console.log('Done');
}

main().catch(e => console.error(e));