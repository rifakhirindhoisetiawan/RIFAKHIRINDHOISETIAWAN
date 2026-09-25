// scripts/test-supabase.mjs - Test koneksi Supabase
// Jalankan: node scripts/test-supabase.mjs
// Pastikan .env sudah diisi SUPABASE_URL yang benar

import fs from 'fs';

// Load .env manual (tanpa dotenv)
try {
  const env = fs.readFileSync('.env', 'utf8');
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const { supabase, supabaseAdmin, SUPABASE_URL } = await import('./lib/supabase.mjs');

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);

if (SUPABASE_URL.includes('YOUR_PROJECT_REF')) {
  console.error('\n❌ ERROR: SUPABASE_URL masih placeholder!');
  console.error('→ Buka Supabase Dashboard > Project Settings > API > copy Project URL');
  console.error('→ Paste ke .env dan js/supabase.js (SUPABASE_URL)');
  process.exit(1);
}

async function test() {
  console.log('\n1. Test dengan publishable key (client)...');
  const { data, error } = await supabase.from('_test').select('*').limit(1);
  // error "relation does not exist" = koneksi OK tapi tabel belum ada (wajar)
  // error "Invalid API key" / "Failed to fetch" = URL/key salah
  if (error) {
    console.log('   Response:', error.message, `(code: ${error.code})`);
    if (error.message.includes('Invalid API key')) console.log('   → Cek publishable key salah');
    if (error.message.includes('Failed to fetch') || error.code === 'ENOTFOUND') console.log('   → Cek SUPABASE_URL salah / internet');
    if (error.code === '42P01' || error.code === 'PGRST205') console.log('   ✅ Koneksi BERHASIL! (tabel _test memang belum ada, wajar)');
  } else {
    console.log('   ✅ Koneksi OK, data:', data);
  }

  console.log('\n2. Test dengan secret key (admin)...');
  const { data: d2, error: e2 } = await supabaseAdmin.from('_test').select('*').limit(1);
  if (e2) {
    console.log('   Response:', e2.message, `(code: ${e2.code})`);
    if (e2.code === '42P01' || e2.code === 'PGRST205') console.log('   ✅ Admin koneksi BERHASIL!');
  } else {
    console.log('   ✅ Admin OK, data:', d2);
  }

  console.log('\nDone. Jika ✅ muncul, Supabase sudah tersambung.');
  console.log('Next: buat tabel di SQL Editor (lihat scripts/supabase-schema.sql)');
}

test().catch(e => console.error('Fatal:', e));
