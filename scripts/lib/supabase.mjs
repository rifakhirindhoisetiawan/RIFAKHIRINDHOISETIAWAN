// scripts/lib/supabase.mjs - Node.js client (server-side)
// JANGAN expose sb_secret di browser! Hanya pakai di Node/scripts

import { createClient } from '@supabase/supabase-js';

// Ambil dari env atau fallback ke hardcoded (untuk dev)
const SUPABASE_URL = process.env.SUPABASE_URL || "https://xsacwgxxoptdrgbbzzib.supabase.co";

// Publishable key untuk operasi client-side (read)
export const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_bBfKnQZ6FHvJTzHMJx-ZOA_asWLJOFf";

// Secret key HANYA untuk server/scripts - JANGAN commit ke git, pakai env
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || "sb_secret_i30c-UGWVxb0yKKDJut1-g_0PO0wYS3";

// Client untuk operasi public (anon-like)
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Client dengan privilege secret (bypass RLS, untuk sync/migration)
// Hati-hati: hanya pakai di scripts/server, bukan browser
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

export { SUPABASE_URL };
