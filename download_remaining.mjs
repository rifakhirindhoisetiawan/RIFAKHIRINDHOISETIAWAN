import https from 'https';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = path.join(process.cwd(), 'images', 'modul03-photos');
fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const menuItems = [
  "JADI KEREN - KOPSU GULA AREN PREMIX",
  "JADI RINDU - KOPSU MADU PREMIX",
  "JADI MACCHIATTO PREMIX",
  "JADI KEREN - KOPSU GULA AREN MANUAL",
  "JADI RINDU - KOPSU MADU MANUAL",
  "JA~DI MACCHIATTO MANUAL",
  "CAPPUCCINO HOT",
  "CHOCO BERRY (ICE 12OZ)",
  "BLENDED VANILLA CARAMEL",
  "BLENDED CHOCO",
  "BLENDED CHOCO CARAMEL",
  "ICE DOLCE LATTE (12OZ)",
  "COCONUT CLOUD LATTE",
  "PANDAN CLOUD LATTE",
  "SALTED CARAMEL COCA (12OZ)",
  "TOFFEE POPCORN FANTA (12OZ)",
  "GREEN JUICE",
  "JUICE SIRSAK",
  "JUICE ALPUKAT",
  "JUICE BUAH NAGA",
  "JUICE JAMBU",
  "JUICE SEMANGKA",
  "JUICE MELON",
  "COFFEE LATTE",
  "TROPICAL APPLE AMERICANO",
  "KOPI BOTOL JADI ASIK",
  "KOPI BOTOL JADI SERU",
  "KOPI BOTOL JADI SUKA",
  "PINK BERRY SODA",
  "HAWAIIAN AMERICANO",
  "ICE COLLAGEN LATTE",
  "MANGO COLADA",
  "CLOUDY LYCHEE",
  "COLA CARAMELA",
  "POPPY BERRY",
  "MACCHIATO CLOUD FOAM"
];

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

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

// Use Wikipedia REST API to get page images
async function getWikipediaPageImage(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  const options = {
    hostname: 'en.wikipedia.org',
    path: `/api/rest_v1/page/summary/${encoded}`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const data = await makeRequest(options);
  try {
    const parsed = JSON.parse(data.toString());
    if (parsed.thumbnail && parsed.thumbnail.source) {
      return {
        url: parsed.thumbnail.source,
        width: parsed.thumbnail.width
      };
    }
  } catch (e) {}
  
  return null;
}

// Also try to get the original image
async function getWikipediaOriginalImage(title) {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  const options = {
    hostname: 'en.wikipedia.org',
    path: `/api/rest_v1/page/media-list/${encoded}`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const data = await makeRequest(options);
  try {
    const parsed = JSON.parse(data.toString());
    if (parsed.items && parsed.items.length > 0) {
      // Find the first image
      const img = parsed.items.find(item => item.type === 'image' && !item.title.includes('.svg'));
      if (img && img.srcset && img.srcset.length > 0) {
        // Get the largest image
        const largest = img.srcset.reduce((a, b) => a.width > b.width ? a : b);
        return {
          url: `https:${largest.src}`,
          width: largest.width
        };
      }
    }
  } catch (e) {}
  
  return null;
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://en.wikipedia.org/'
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

const SEARCH_MAP = {
  'JADI KEREN - KOPSU GULA AREN PREMIX': 'Iced coffee',
  'JADI RINDU - KOPSU MADU PREMIX': 'Honey',
  'JADI MACCHIATTO PREMIX': 'Macchiato',
  'JADI KEREN - KOPSU GULA AREN MANUAL': 'Iced coffee',
  'JADI RINDU - KOPSU MADU MANUAL': 'Honey',
  'JA~DI MACCHIATTO MANUAL': 'Macchiato',
  'CAPPUCCINO HOT': 'Cappuccino',
  'CHOCO BERRY (ICE 12OZ)': 'Chocolate milk',
  'BLENDED VANILLA CARAMEL': 'Vanilla',
  'BLENDED CHOCO': 'Chocolate milk',
  'BLENDED CHOCO CARAMEL': 'Caramel',
  'ICE DOLCE LATTE (12OZ)': 'Latte',
  'COCONUT CLOUD LATTE': 'Cappuccino',
  'PANDAN CLOUD LATTE': 'Cappuccino',
  'SALTED CARAMEL COCA (12OZ)': 'Coca-Cola',
  'TOFFEE POPCORN FANTA (12OZ)': 'Fanta',
  'GREEN JUICE': 'Juice',
  'JUICE SIRSAK': 'Soursop',
  'JUICE ALPUKAT': 'Avocado',
  'JUICE BUAH NAGA': 'Dragon fruit',
  'JUICE JAMBU': 'Guava',
  'JUICE SEMANGKA': 'Watermelon',
  'JUICE MELON': 'Melon',
  'COFFEE LATTE': 'Caffè latte',
  'TROPICAL APPLE AMERICANO': 'Americano',
  'KOPI BOTOL JADI ASIK': 'Coffee',
  'KOPI BOTOL JADI SERU': 'Coffee',
  'KOPI BOTOL JADI SUKA': 'Coffee',
  'PINK BERRY SODA': 'Soda',
  'HAWAIIAN AMERICANO': 'Americano',
  'ICE COLLAGEN LATTE': 'Collagen',
  'MANGO COLADA': 'Mango',
  'CLOUDY LYCHEE': 'Lychee',
  'COLA CARAMELA': 'Cola',
  'POPPY BERRY': 'Berry',
  'MACCHIATO CLOUD FOAM': 'Macchiato'
};

async function processItem(itemName) {
  const slug = slugify(itemName);
  const destDir = path.join(PHOTOS_DIR, slug);
  const destPath = path.join(destDir, '1.jpg');
  
  // Skip if already exists and valid
  if (fs.existsSync(destPath)) {
    const stats = fs.statSync(destPath);
    if (stats.size > 5000) {
      console.log(`SKIP (already exists): ${itemName}`);
      return true;
    }
  }
  
  console.log(`\nProcessing: ${itemName}`);
  
  const searchQuery = SEARCH_MAP[itemName] || itemName.toLowerCase();
  console.log(`  Wikipedia article: "${searchQuery}"`);
  
  let downloaded = false;
  
  try {
    // Try to get thumbnail from Wikipedia
    const imgInfo = await getWikipediaPageImage(searchQuery);
    
    if (imgInfo) {
      console.log(`  Found thumbnail: ${imgInfo.url} (${imgInfo.width}px)`);
      
      try {
        const size = await downloadImage(imgInfo.url, destPath);
        console.log(`  ✓ Downloaded ${size} bytes`);
        downloaded = true;
      } catch (err) {
        console.log(`  Download failed: ${err.message}`);
        try { fs.unlinkSync(destPath); } catch (e) {}
      }
    }
    
    // If thumbnail failed, try to get original image
    if (!downloaded) {
      const origInfo = await getWikipediaOriginalImage(searchQuery);
      if (origInfo) {
        console.log(`  Found original: ${origInfo.url} (${origInfo.width}px)`);
        
        try {
          const size = await downloadImage(origInfo.url, destPath);
          console.log(`  ✓ Downloaded ${size} bytes`);
          downloaded = true;
        } catch (err) {
          console.log(`  Download failed: ${err.message}`);
          try { fs.unlinkSync(destPath); } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.log(`  Error: ${err.message}`);
  }
  
  if (!downloaded) {
    console.log(`  ✗ FAILED: ${itemName}`);
  }
  
  return downloaded;
}

async function main() {
  let successCount = 0;
  let failedItems = [];
  
  console.log(`Downloading images for ${menuItems.length} failed items...\n`);
  
  for (const item of menuItems) {
    try {
      const success = await processItem(item);
      if (success) {
        successCount++;
      } else {
        failedItems.push(item);
      }
    } catch (err) {
      console.log(`  ✗ ERROR: ${item} - ${err.message}`);
      failedItems.push(item);
    }
    
    // Delay between items
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`SUCCESSFULLY DOWNLOADED: ${successCount}/${menuItems.length}`);
  console.log(`STILL FAILED: ${failedItems.length}`);
  
  if (failedItems.length > 0) {
    console.log('\nStill failed items:');
    failedItems.forEach(item => console.log(`  - ${item}`));
  }
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
