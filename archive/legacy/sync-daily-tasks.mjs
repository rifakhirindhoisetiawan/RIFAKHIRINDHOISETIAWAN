// scripts/sync-daily-tasks.mjs
import fs from 'fs';
import path from 'path';
try {
  const env = fs.readFileSync('.env', 'utf8');
  env.split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}
import { supabaseAdmin, supabase } from './lib/supabase.mjs';

async function syncDailyTasks() {
  const txtPath = path.join(process.cwd(), 'data', 'daily-task-periods.txt');
  const raw = fs.readFileSync(txtPath, 'utf8');
  const blocks = raw.split('---').map(b => b.trim()).filter(Boolean);
  const rows = blocks.map(b => {
    const lines = b.split('\n').map(l => l.trim()).filter(Boolean);
    return {
      title: lines[0] || '',
      icon: lines[1] || '',
      cls: lines[2] || '',
      href: lines[3] || '',
      slug: lines[4] || ''
    };
  }).filter(r => r.title);
  console.log(`Found ${rows.length} daily tasks`);

  // map to DB schema: title, period (slug), description (href), icon, cls
  // daily_tasks table has: title, period, description, icon, cls, href, slug? We'll insert what's available
  // Our schema has title, period, description - extend with icon/cls if columns exist, else store in description
  // Check existing columns by trying insert with extra fields - Supabase will ignore unknown if not exist, but error if column missing
  // So we try with base fields first, then add optional

  // Clear existing
  await supabaseAdmin.from('daily_tasks').delete().neq('id', 0);
  // Need to ensure table has icon, cls, href, slug columns - if not, add them via SQL? For now try inserting with those, if fails fallback to base
  let payload = rows.map(r => ({
    title: r.title,
    period: r.slug,
    description: r.href,
    // try extra fields - if column not exists, Supabase will error, we handle
  }));
  // First, test if table has icon column by inserting one row with icon
  const testRow = { title: rows[0].title, period: rows[0].slug, description: rows[0].href, icon: rows[0].icon, cls: rows[0].cls, href: rows[0].href, slug: rows[0].slug };
  let { error: testErr } = await supabaseAdmin.from('daily_tasks').insert([testRow]);
  if (testErr) {
    console.log('daily_tasks extra columns not exist, altering? Error:', testErr.message);
    // fallback to base columns only
    console.log('Inserting with base columns only...');
    // delete the partially inserted test row if any
    await supabaseAdmin.from('daily_tasks').delete().neq('id', 0);
    payload = rows.map(r => ({ title: r.title, period: r.slug, description: r.href }));
    const { error } = await supabaseAdmin.from('daily_tasks').insert(payload);
    if (error) {
      console.error('Insert failed:', error.message);
      // try to add columns via SQL using supabaseAdmin? Can't via REST, need to give instruction
      console.log('→ Jalankan di SQL Editor: alter table daily_tasks add column if not exists icon text; add column if not exists cls text; add column if not exists href text; add column if not exists slug text;');
      return;
    }
  } else {
    // success with extra columns, need to insert remaining
    await supabaseAdmin.from('daily_tasks').delete().neq('id', 0);
    const fullPayload = rows.map(r => ({ title: r.title, period: r.slug, description: r.href, icon: r.icon, cls: r.cls, href: r.href, slug: r.slug }));
    const { error } = await supabaseAdmin.from('daily_tasks').insert(fullPayload);
    if (error) console.error('Full insert error:', error.message);
  }
  console.log('✅ daily_tasks synced');

  // verify
  const { data } = await supabase.from('daily_tasks').select('*');
  console.log('Verify:', data);
}

async function syncRecipes() {
  const dir = path.join(process.cwd(), 'recipes');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
  console.log(`Found ${files.length} recipes`);
  const rows = files.map(f => {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const name = f.replace('item-','').replace('.txt','').replace(/-/g,' ').toUpperCase();
    return { name, category: 'JA-DI', content: content.slice(0, 5000), image_url: null };
  });
  await supabaseAdmin.from('recipes').delete().neq('id', 0);
  for (let i=0;i<rows.length;i+=20){
    const batch = rows.slice(i,i+20);
    const { error } = await supabaseAdmin.from('recipes').insert(batch);
    if (error) console.error('recipes batch fail', error.message);
    else console.log(`recipes batch ${i/20+1} OK`);
  }
  console.log('✅ recipes synced');
}

await syncDailyTasks();
await syncRecipes();
console.log('Done all');
