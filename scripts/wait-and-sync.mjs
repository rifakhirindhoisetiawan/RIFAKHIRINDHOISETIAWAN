// scripts/wait-and-sync.mjs
// Cek tabel ada belum, kalau sudah sync otomatis
// Jalankan: node scripts/wait-and-sync.mjs

import fs from 'fs';
import path from 'path';

try {
  const env = fs.readFileSync('.env', 'utf8');
  env.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const { supabase, supabaseAdmin } = await import('./lib/supabase.mjs');

async function tableExists(name) {
  const { error } = await supabase.from(name).select('id').limit(1);
  if (!error) return true;
  if (error.code === 'PGRST205' || error.code === '42P01') return false;
  console.log(`  ${name} error:`, error.message);
  return false;
}

async function syncJaDi() {
  const txtPath = path.join(process.cwd(), 'data', 'ja-di-data.txt');
  const txt = fs.readFileSync(txtPath, 'utf8');
  const blocks = txt.split('---').map(b => b.trim()).filter(Boolean);
  const rows = blocks.map(b => {
    const lines = b.split('\n').map(l => l.trim());
    // format: name, icon, cls, cat, link, plu (plu bisa kosong)
    return {
      name: lines[0] || '',
      icon: lines[1] || '',
      cls: lines[2] || '',
      cat: lines[3] || '',
      link: lines[4] || '',
      plu: lines[5] || null
    };
  }).filter(r => r.name);

  console.log(`Found ${rows.length} menus in ja-di-data.txt`);

  // cek apakah sudah ada data
  const { data: existing } = await supabaseAdmin.from('ja_di_menus').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('⚠️  Tabel sudah ada data, hapus dulu untuk sync ulang...');
    const { error: delErr } = await supabaseAdmin.from('ja_di_menus').delete().neq('id', 0);
    if (delErr) console.error('Delete error:', delErr.message);
  }

  console.log('Insert ke ja_di_menus...');
  // insert batch 20 biar tidak timeout
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const { error } = await supabaseAdmin.from('ja_di_menus').insert(batch);
    if (error) {
      console.error(`  Batch ${i/20+1} gagal:`, error.message);
      return false;
    }
    console.log(`  Batch ${i/20+1} OK (${batch.length} rows)`);
  }
  console.log('✅ ja_di_menus selesai');
  return true;
}

async function main() {
  console.log('Cek koneksi Supabase...');
  console.log('URL:', process.env.SUPABASE_URL);

  const tables = ['ja_di_menus', 'daily_tasks', 'recipes'];
  for (const t of tables) {
    const exists = await tableExists(t);
    console.log(`- ${t}: ${exists ? 'ADA ✅' : 'BELUM ADA ❌ (PGRST205)'}`);
  }

  const jaExists = await tableExists('ja_di_menus');
  if (!jaExists) {
    console.log('\n❌ Tabel belum dibuat!');
    console.log('→ Buka: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new');
    console.log('→ Copy isi scripts/supabase-schema.sql, paste, klik RUN');
    console.log('→ Lalu jalankan lagi: node scripts/wait-and-sync.mjs');
    process.exit(1);
  }

  console.log('\nTabel sudah ada, mulai sync...');
  await syncJaDi();

  // verifikasi
  const { data, error } = await supabase.from('ja_di_menus').select('name,cat,plu').limit(5);
  if (!error) {
    console.log('\nVerifikasi 5 data pertama dari Supabase:');
    data.forEach((r, i) => console.log(`  ${i+1}. ${r.name} | ${r.cat} | ${r.plu}`));
    const { count } = await supabase.from('ja_di_menus').select('*', { count: 'exact', head: true });
    console.log(`\nTotal di Supabase: ${count} rows`);
  }

  console.log('\n✅ SELESAI! Data sudah di Supabase.');
  console.log('Lihat di: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/editor');
}

main().catch(e => console.error(e));
