// js/supabase.js - Browser client (publishable key ONLY - aman untuk frontend)
// Docs: https://supabase.com/docs/guides/api/api-keys
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// TODO: GANTI DENGAN PROJECT URL KAMU - cek Supabase Dashboard > Project Settings > API > Project URL
// Contoh: https://abcdefghijklm.supabase.co
export const SUPABASE_URL = "https://xsacwgxxoptdrgbbzzib.supabase.co"; 

// Publishable key - aman untuk browser (sudah kamu berikan)
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYWN3Z3h4b3B0ZHJnYmJ6emliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY1NDUyOSwiZXhwIjoyMTAxMjMwNTI5fQ.D2p7JQTspccAEVO65Dn6H0GBcMOxAZ0V8-Lltv-WAwE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Contoh pakai:
// const { data, error } = await supabase.from('ja_di_menus').select('*');
// const { data, error } = await supabase.from('daily_tasks').select('*');
