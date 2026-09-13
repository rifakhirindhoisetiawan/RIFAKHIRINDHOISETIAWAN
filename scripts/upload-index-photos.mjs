import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://xsacwgxxoptdrgbbzzib.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYWN3Z3h4b3B0ZHJnYmJ6emliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTQ1MjksImV4cCI6MjEwMTIzMDUyOX0.aLLM-4TECEm4GDIXy82zhF8Nk8_9ROXFjlUaSgoKCT0";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET = 'index-photos';
const LOCAL_DIR = path.join(__dirname, '..', 'images', 'index-photos');

// Thumbnail size for index grid (matches CSS aspect-ratio 9/16 = 120x160)
const THUMB_WIDTH = 120;
const THUMB_HEIGHT = 160;
const WEBP_QUALITY = 75;

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
    console.log(`Created bucket: ${BUCKET}`);
  } else {
    console.log(`Bucket ${BUCKET} exists`);
  }
}

async function uploadOptimized(folder, file) {
  const localPath = path.join(LOCAL_DIR, folder, file);
  const ext = path.extname(file).toLowerCase();
  const baseName = path.basename(file, ext);
  
  // Convert to optimized WebP thumbnail
  const webpBuffer = await sharp(localPath)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'cover', position: 'center' })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const destPath = `${folder}/${baseName}.webp`;
  
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(destPath, webpBuffer, {
      contentType: 'image/webp',
      upsert: true,
      cacheControl: 'public, max-age=31536000, immutable'
    });
  
  if (error) throw error;
  
  const sizeKB = (webpBuffer.length / 1024).toFixed(1);
  console.log(`✓ ${destPath} (${sizeKB} KB)`);
  return destPath;
}

async function main() {
  console.log('🚀 Uploading optimized index photos to Supabase...\n');
  
  await ensureBucket();
  
  const folders = fs.readdirSync(LOCAL_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const folder of folders) {
    const files = fs.readdirSync(path.join(LOCAL_DIR, folder));
    const imgFile = files.find(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    
    if (imgFile) {
      try {
        await uploadOptimized(folder, imgFile);
      } catch (e) {
        console.error(`✗ ${folder}/${imgFile}:`, e.message);
      }
    }
  }
  
  console.log('\n✅ Done! Images uploaded as WebP thumbnails (~2-5 KB each)');
  console.log('📝 Update image-loader.js to use Supabase URLs with transform params');
}

main().catch(console.error);