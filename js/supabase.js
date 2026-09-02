// js/supabase.js - Browser client (publishable key ONLY - aman untuk frontend)
// Docs: https://supabase.com/docs/guides/api/api-keys
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// TODO: GANTI DENGAN PROJECT URL KAMU - cek Supabase Dashboard > Project Settings > API > Project URL
// Contoh: https://abcdefghijklm.supabase.co
export const SUPABASE_URL = "https://xsacwgxxoptdrgbbzzib.supabase.co"; 

// Publishable key - aman untuk browser (sudah kamu berikan)
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bBfKnQZ6FHvJTzHMJx-ZOA_asWLJOFf";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Contoh pakai:
// const { data, error } = await supabase.from('ja_di_menus').select('*');
// const { data, error } = await supabase.from('daily_tasks').select('*');
