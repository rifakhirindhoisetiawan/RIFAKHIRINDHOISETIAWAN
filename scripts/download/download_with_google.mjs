import fs from 'fs';
import path from 'path';
import https from 'https';

const PHOTOS_DIR = path.join(process.cwd(), 'images', 'ja-di-photos');
fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const remainingItems = [
  "blended-choco",
  "blended-choco-caramel",
  "cloudy-lychee",
  "coconut-cloud-latte",
  "coffee-latte",
  "cola-caramela",
  "green-juice",
  "hawaiian-americano",
  "ice-collagen-latte",
  "ja-di-macchiatto-manual",
  "jadi-macchiatto-premix",
  "juice-alpukat",
  "juice-buah-naga",
  "juice-melon",
  "juice-semangka",
  "juice-sirsak",
  "kopi-botol-jadi-suka",
  "macchiato-cloud-foam",
  "pandan-cloud-latte",
  "pink-berry-soda",
  "tropical-apple-americano"
];

const ORIGINAL_ITEMS = {
  'blended-choco': 'BLENDED CHOCO',
  'blended-choco-caramel': 'BLENDED CHOCO CARAMEL',
  'cloudy-lychee': 'CLOUDY LYCHEE',
  'coconut-cloud-latte': 'COCONUT CLOUD LATTE',
  'coffee-latte': 'COFFEE LATTE',
  'cola-caramela': 'COLA CARAMELA',
  'green-juice': 'GREEN JUICE',
  'hawaiian-americano': 'HAWAIIAN AMERICANO',
  'ice-collagen-latte': 'ICE COLLAGEN LATTE',
  'ja-di-macchiatto-manual': 'JA~DI MACCHIATTO MANUAL',
  'jadi-macchiatto-premix': 'JADI MACCHIATTO PREMIX',
  'juice-alpukat': 'JUICE ALPUKAT',
  'juice-buah-naga': 'JUICE BUAH NAGA',
  'juice-melon': 'JUICE MELON',
  'juice-semangka': 'JUICE SEMANGKA',
  'juice-sirsak': 'JUICE SIRSAK',
  'kopi-botol-jadi-suka': 'KOPI BOTOL JADI SUKA',
  'macchiato-cloud-foam': 'MACCHIATO CLOUD FOAM',
  'pandan-cloud-latte': 'PANDAN CLOUD LATTE',
  'pink-berry-soda': 'PINK BERRY SODA',
  'tropical-apple-americano': 'TROPICAL APPLE AMERICANO'
};

const SEARCH_MAP = {
  'BLENDED CHOCO': 'chocolate blended coffee drink',
  'BLENDED CHOCO CARAMEL': 'chocolate caramel iced coffee',
  'CLOUDY LYCHEE': 'cloudy lychee drink',
  'COCONUT CLOUD LATTE': 'coconut cloud latte coffee',
  'COFFEE LATTE': 'latte coffee cappuccino',
  'COLA CARAMELA': 'caramel cola soda drink',
  'GREEN JUICE': 'green juice smoothie drink',
  'HAWAIIAN AMERICANO': 'hawaiian americano coffee',
  'ICE COLLAGEN LATTE': 'collagen iced latte coffee',
  'JA~DI MACCHIATTO MANUAL': 'macchiato coffee caramel',
  'JADI MACCHIATTO PREMIX': 'macchiato coffee caramel',
  'JUICE ALPUKAT': 'avocado juice drink',
  'JUICE BUAH NAGA': 'dragon fruit juice',
  'JUICE MELON': 'fresh melon juice',
  'JUICE SEMANGKA': 'watermelon juice',
  'JUICE SIRSAK': 'soursop juice drink',
  'KOPI BOTOL JADI SUKA': 'bottled coffee drink',
  'MACCHIATO CLOUD FOAM': 'macchiato cloud foam coffee',
  'PANDAN CLOUD LATTE': 'pandan cloud latte coffee',
  'PINK BERRY SODA': 'pink berry soda drink',
  'TROPICAL APPLE AMERICANO': 'tropical apple americano'
};

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.get(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': urlObj.origin + '/'
      }
    };
    makeRequest(options)
      .then(data => {
        if (data.length < 5000) {
          reject(new Error('File too small'));
          return;
        }
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, data);
        resolve(data.length);
      })
      .catch(reject);
  });
}

async function searchGoogleImages(query) {
  const { imageSearch } = require('image-search');
  
  return new Promise((resolve, reject) => {
    imageSearch.google(query, { num: 5 }, (err, images) => {
      if (err) {
        reject(err);
        return;
      }
      // Extract direct image URLs
      const urls = images
        .filter(img => img.url && !img.url.includes('google.com') && !img.url.includes('gstatic.com'))
        .map(img => img.url);
      resolve(urls);
    });
  });
}

async function processItem(slug) {
  const originalItem = ORIGINAL_ITEMS[slug];
  const destDir = path.join(PHOTOS_DIR, slug);
  const destPath = path.join(destDir, '1.jpg');
  
  // Skip if already exists and valid
  if (fs.existsSync(destPath)) {
    const stats = fs.statSync(destPath);
    if (stats.size > 5000) {
      console.log(`SKIP (already exists): ${slug}`);
      return true;
    }
  }
  
  console.log(`\nProcessing: ${originalItem} (${slug})`);
  
  const searchQuery = SEARCH_MAP[originalItem] || originalItem.toLowerCase();
  console.log(`  Searching Google Images: "${searchQuery}"`);
  
  let downloaded = false;
  
  try {
    const imageUrls = await searchGoogleImages(searchQuery);
    console.log(`    Found ${imageUrls.length} images`);
    
    for (const imgUrl of imageUrls) {
      if (downloaded) break;
      
      try {
        console.log(`    Trying: ${imgUrl.substring(0, 60)}...`);
        const size = await downloadImage(imgUrl, destPath);
        console.log(`    ✓ Downloaded ${size} bytes`);
        downloaded = true;
      } catch (err) {
        console.log(`    Failed: ${err.message}`);
        try { fs.unlinkSync(destPath); } catch (e) {}
      }
    }
  } catch (err) {
    console.log(`    Error: ${err.message}`);
  }
  
  if (!downloaded) {
    console.log(`  ✗ FAILED: ${originalItem}`);
  }
  
  return downloaded;
}

async function main() {
  let successCount = 0;
  let stillFailed = [];
  
  console.log(`Downloading images for ${remainingItems.length} remaining items...\n`);
  
  for (const slug of remainingItems) {
    try {
      const success = await processItem(slug);
      if (success) {
        successCount++;
      } else {
        stillFailed.push(slug);
      }
    } catch (err) {
      console.log(`  ✗ ERROR: ${slug} - ${err.message}`);
      stillFailed.push(slug);
    }
    
    // Delay between items
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`SUCCESSFULLY DOWNLOADED: ${successCount}/${remainingItems.length}`);
  console.log(`STILL FAILED: ${stillFailed.length}`);
  
  if (stillFailed.length > 0) {
    console.log('\nStill failed items:');
    stillFailed.forEach(slug => console.log(`  - ${ORIGINAL_ITEMS[slug]} (${slug})`));
  }
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
