# Setup Supabase - 2 Menit (copy-paste)

## Link langsung
Buka: https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/sql/new

## Langkah
1. Login Supabase (akun yang punya project xsacwgxxoptdrgbbzzib)
2. Klik link di atas -> akan buka SQL Editor New Query
3. Buka file `scripts/supabase-schema.sql` di VS Code, CTRL+A, CTRL+C
4. Paste ke SQL Editor Supabase, klik **RUN** (atau CTRL+ENTER)
5. Tunggu sampai muncul "Success. No rows returned"

## Verifikasi
Di terminal VS Code jalankan:
```
node scripts/test-supabase.mjs
node scripts/wait-and-sync.mjs
```

Jika masih PGRST205 = tabel belum ke-create, ulangi langkah 4.

## Setelah itu
Data `data/ja-di-data.txt` otomatis masuk ke Supabase, bisa dilihat di:
https://supabase.com/dashboard/project/xsacwgxxoptdrgbbzzib/editor
(Table Editor -> ja_di_menus)
