// supabase.js - klien database + config (standalone, 1 file per folder menu)
// Docs: https://supabase.com/docs/guides/api/api-keys
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SUPABASE_URL = "https://xsacwgxxoptdrgbbzzib.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYWN3Z3h4b3B0ZHJnYmJ6emliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTQ1MjksImV4cCI6MjEwMTIzMDUyOX0.aLLM-4TECEm4GDIXy82zhF8Nk8_9ROXFjlUaSgoKCT0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Contoh pakai:
// const { data, error } = await supabase.from('ja_di_menus').select('*');
// const { data, error } = await supabase.from('daily_tasks').select('*');
