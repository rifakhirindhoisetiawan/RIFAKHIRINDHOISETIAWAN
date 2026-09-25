// scripts/sync-dr-coffee.mjs - Sync Dr Coffee menus to Supabase
// Jalankan: node scripts/sync-dr-coffee.mjs
import fs from 'fs';
try{ const env=fs.readFileSync('.env','utf8'); env.split('\n').forEach(l=>{const idx=l.indexOf('='); if(idx>0){const k=l.slice(0,idx).trim(); const v=l.slice(idx+1).trim(); if(k&&v) process.env[k]=v}})}catch{}
import { supabaseAdmin } from './lib/supabase.mjs';

const html = fs.readFileSync('menu-resep-dr-coffee.html','utf8');
const catRegex = /<span class="category-tag">([^<]+)<\/span>/g;
const h3Regex = /<h3>([^<]+?)(?:<span[^>]*>.*?<\/span>)?<\/h3>/g;
let cats=[]; let m;
while((m=catRegex.exec(html))!==null) cats.push({cat:m[1].trim(), idx:m.index});
let recipes=[];
while((m=h3Regex.exec(html))!==null){
  let name=m[1].trim().replace(/<[^>]+>/g,'').trim();
  let cat=""; for(let i=cats.length-1;i>=0;i--) if(cats[i].idx < m.index){ cat=cats[i].cat; break; }
  recipes.push({name, cat});
}
console.log(`Found ${recipes.length} recipes from HTML`);

// Cek table exists
const { error: checkErr } = await supabaseAdmin.from('dr_coffee_menus').select('id').limit(1);
if(checkErr && checkErr.code==='PGRST205'){
  console.error('❌ Tabel dr_coffee_menus belum ada. Jalankan dulu: scripts/supabase-dr-coffee.sql di SQL Editor');
  console.error('Link: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new');
  process.exit(1);
}

// Ambil existing
const { data: existing } = await supabaseAdmin.from('dr_coffee_menus').select('id,name');
const existingNames = new Set((existing||[]).map(r=>r.name.toLowerCase()));
let inserted=0, skipped=0;
for(const r of recipes){
  const key = r.name.toLowerCase();
  if(existingNames.has(key)){ skipped++; continue; }
  // Tentukan cat utama berdasarkan page header? sederhana: pakai cat tag
  // Map ke kategori admin (biar filter enak)
  let mainCat = r.cat;
  // Normalisasi: jika cat mengandung "Ice" atau "Hot", tetap simpan original
  const payload = {
    name: r.name,
    cat: r.cat || 'UNCATEGORIZED',
    variant: r.cat,
    plu_12oz: null,
    plu_16oz: null,
    plu_hot: null,
    foto: '☕',
    cls: 'g-a',
    has_percepatan: r.name.includes('Jadi') || r.name.includes('Latte') || false
  };
  const { error } = await supabaseAdmin.from('dr_coffee_menus').insert([payload]);
  if(error){ console.error('Insert gagal', r.name, error.message); } else { inserted++; console.log(`+ ${r.name} [${r.cat}]`); }
}
console.log(`\nDone: inserted ${inserted}, skipped ${skipped} (sudah ada)`);
const { data: all } = await supabaseAdmin.from('dr_coffee_menus').select('id,name,plu_12oz,plu_16oz').order('id');
console.log(`Total di DB: ${all?.length}`);
all?.forEach(r=> console.log(` - #${r.id} ${r.name} PLU:${r.plu_12oz||'-'}/${r.plu_16oz||'-'}`));
