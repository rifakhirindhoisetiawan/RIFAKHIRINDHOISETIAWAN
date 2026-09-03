// js/supabase.js - Browser client
// Docs: https://supabase.com/docs/guides/api/api-keys
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_KEY } from "./sb-config.js";

export { SUPABASE_URL, SUPABASE_KEY };

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Contoh pakai:
// const { data, error } = await supabase.from('ja_di_menus').select('*');
// const { data, error } = await supabase.from('daily_tasks').select('*');
