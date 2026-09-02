// scripts/sync-to-supabase.mjs
// Push data TXT -> Supabase (butuh tabel sudah dibuat via supabase-schema.sql)
// Jalankan: node scripts/sync-to-supabase.mjs
import fs from 'fs';
import path from 'path';

// load .env
try {
  const env = fs.readFileSync('.env', 'utf8');
  env.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const { supabaseAdmin } = await import('./lib/supabase.mjs');

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
    return {
      name: lines[0] || '',
      icon: lines[1] || '',
      cls: lines[2] || '',
      cat: lines[3] || '',
      link: lines[4] || '',
      plu: lines[5] || ''
    };
  }).filter(r => r.name);

  console.log(`Sync ${rows.length} rows to ja_di_menus...`);
  // hapus dulu biar sync ulang (optional)
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
  // TODO: parse sesuai format file kamu, contoh simple:
  // const rows = txt.split('\n').filter(Boolean).map(title => ({ title }));
  // await supabaseAdmin.from('daily_tasks').delete().neq('id', 0);
  // await supabaseAdmin.from('daily_tasks').insert(rows);
  console.log('ℹ️ daily_tasks sync skipped - sesuaikan parser dulu');
}

async function main() {
  await syncJaDi();
  await syncDailyTask();
  console.log('Done');
}

main().catch(e => console.error(e));
