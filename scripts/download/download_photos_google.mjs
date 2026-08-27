import https from 'https';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = path.join(process.cwd(), 'images', 'modul03-photos');
fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const menuItems = [
  "COFFEE LATTE PREMIX",
  "VANILLA LATTE PREMIX",
  "SALTED CARAMEL LATTE PREMIX",
  "BUTTERSCOTCH LATTE PREMIX",
  "SALTED BUTTERCORN LATTE PREMIX",
  "JADI KEREN - KOPSU GULA AREN PREMIX",
  "MOCHA LATTE PREMIX",
  "JADI RINDU - KOPSU MADU PREMIX",
  "JADI MACCHIATTO PREMIX",
  "SALTED BUTTERCORN LATTE MANUAL",
  "JADI KEREN - KOPSU GULA AREN MANUAL",
  "JADI RINDU - KOPSU MADU MANUAL",
  "MOCHA LATTE MANUAL",
  "VANILLA LATTE MANUAL",
  "SALTED CARAMEL LATTE MANUAL",
  "BUTTERSCOTCH LATTE MANUAL",
  "JA~DI MACCHIATTO MANUAL",
  "COFFEE LATTE ICE MANUAL",
  "CAPPUCCINO ICE",
  "AMERICANO HOT",
  "AMERICANO ICE",
  "BLACK COFFEE WITH HONEY",
  "HAWAIIAN AMERICANO (ICE UPSIZE)",
  "ESPRESSO HOT",
  "CAPPUCCINO HOT",
  "CAFFELATTE HOT",
  "HOT CHOCOLATE",
  "ICE CHOCOLATE",
  "ICE MATCHA",
  "CHOCO BERRY (ICE 12OZ)",
  "BLENDED VANILLA CARAMEL",
  "BLENDED CHOCO",
  "BLENDED CHOCO CARAMEL",
  "CREAMY COCONUT FRAPPE (UPSIZE)",
  "KOREAN STRAWBERRY MILK",
  "AFFOGATO",
  "ICE COLLAGEN LATTE (12OZ)",
  "ICE DOLCE LATTE (12OZ)",
  "COCONUT CLOUD LATTE",
  "PANDAN CLOUD LATTE",
  "SALTED CARAMEL COCA (12OZ)",
  "TOFFEE POPCORN FANTA (12OZ)",
  "LYCHEE SPRITE (12OZ)",
  "SHAKEN LYCHEE TEA",
  "SHAKEN HONEY LEMON TEA",
  "GREEN JUICE",
  "JUICE SIRSAK",
  "JUICE ALPUKAT",
  "JUICE BUAH NAGA",
  "JUICE JAMBU",
  "JUICE SEMANGKA",
  "JUICE MELON",
  "JUICE PISANG STRAWBERRY",
  "JUICE MANGGA HARUM MANIS",
  "JUICE APEL MIX",
  "JUICE CARROT MIXED FRUIT",
  "JUICE JERUK",
  "JUICE JERUK NAVEL",
  "JUICE JERUK NAVEL CARA CARA",
  "KOLAK LATTE",
  "WATERMELON COOLER",
  "PISANG IJO LATTE",
  "PLU JA-DI",
  "PLANO",
  "TIME KAMERA",
  "COFFEE LATTE",
  "CHOCO BERRY",
  "GREEN GRAPE FRUITYCANO",
  "TROPICAL APPLE AMERICANO",
  "KOPI BOTOL JADI ASIK",
  "KOPI BOTOL JADI SERU",
  "KOPI BOTOL JADI SUKA",
  "CREAMY COCONUT FRAPPE",
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

// Use image-search package to search for images
function searchImage(query) {
  return new Promise((resolve, reject) => {
    const { imageSearch } = require('image-search');
    imageSearch.google(query, { num: 5 }, (err, images) => {
      if (err) {
        reject(err);
        return;
      }
      // Extract direct image URLs
      const urls = images
        .filter(img => img.url && !img.url.includes('google.com'))
        .map(img => img.url);
      resolve(urls);
    });
  });
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

const SEARCH_MAP = {
  'JADI KEREN - KOPSU GULA AREN PREMIX': 'iced coffee palm sugar',
  'JADI RINDU - KOPSU MADU PREMIX': 'honey iced coffee',
  'JADI MACCHIATTO PREMIX': 'macchiato coffee',
  'JADI KEREN - KOPSU GULA AREN MANUAL': 'iced coffee palm sugar',
  'JADI RINDU - KOPSU MADU MANUAL': 'honey iced coffee',
  'MOCHA LATTE MANUAL': 'mocha latte coffee',
  'VANILLA LATTE MANUAL': 'vanilla latte coffee',
  'SALTED CARAMEL LATTE MANUAL': 'salted caramel latte',
  'BUTTERSCOTCH LATTE MANUAL': 'butterscotch coffee',
  'JA~DI MACCHIATTO MANUAL': 'macchiato coffee',
  'BLACK COFFEE WITH HONEY': 'black coffee honey',
  'CAPPUCCINO HOT': 'hot cappuccino coffee',
  'ICE MATCHA': 'iced matcha latte',
  'CHOCO BERRY (ICE 12OZ)': 'chocolate berry drink',
  'BLENDED VANILLA CARAMEL': 'vanilla caramel coffee',
  'BLENDED CHOCO': 'chocolate blended drink',
  'BLENDED CHOCO CARAMEL': 'chocolate caramel coffee',
  'ICE DOLCE LATTE (12OZ)': 'sweet iced latte',
  'COCONUT CLOUD LATTE': 'coconut cloud latte coffee',
  'PANDAN CLOUD LATTE': 'pandan latte coffee',
  'SALTED CARAMEL COCA (12OZ)': 'caramel cola drink',
  'TOFFEE POPCORN FANTA (12OZ)': 'fanta orange soda',
  'LYCHEE SPRITE (12OZ)': 'lychee sprite drink',
  'SHAKEN LYCHEE TEA': 'lychee iced tea',
  'SHAKEN HONEY LEMON TEA': 'honey lemon iced tea',
  'GREEN JUICE': 'green vegetable juice',
  'JUICE SIRSAK': 'soursop juice',
  'JUICE ALPUKAT': 'avocado juice drink',
  'JUICE BUAH NAGA': 'dragon fruit juice',
  'JUICE JAMBU': 'guava juice',
  'JUICE SEMANGKA': 'watermelon juice',
  'JUICE MELON': 'fresh melon juice',
  'KOLAK LATTE': 'kolak banana dessert',
  'WATERMELON COOLER': 'watermelon cooler drink',
  'PISANG IJO LATTE': 'pisang ijo green banana',
  'TIME KAMERA': 'camera photography',
  'COFFEE LATTE': 'latte coffee',
  'CHOCO BERRY': 'chocolate berry drink',
  'GREEN GRAPE FRUITYCANO': 'green grape juice',
  'TROPICAL APPLE AMERICANO': 'tropical apple americano',
  'KOPI BOTOL JADI ASIK': 'bottled coffee drink',
  'KOPI BOTOL JADI SERU': 'bottled coffee drink',
  'KOPI BOTOL JADI SUKA': 'bottled coffee drink',
  'PINK BERRY SODA': 'pink berry soda drink',
  'HAWAIIAN AMERICANO': 'hawaiian americano coffee',
  'ICE COLLAGEN LATTE': 'collagen iced latte',
  'MANGO COLADA': 'mango colada drink',
  'CLOUDY LYCHEE': 'cloudy lychee drink',
  'COLA CARAMELA': 'caramel cola drink',
  'POPPY BERRY': 'poppy berry drink',
  'MACCHIATO CLOUD FOAM': 'macchiato cloud foam coffee'
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
  console.log(`  Searching Google Images: "${searchQuery}"`);
  
  let downloaded = false;
  
  try {
    const imageUrls = await searchImage(searchQuery);
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
    console.log(`  ✗ FAILED: ${itemName}`);
  }
  
  return downloaded;
}

async function main() {
  let successCount = 0;
  let failedItems = [];
  
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
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`SUCCESSFULLY DOWNLOADED: ${successCount}/${menuItems.length}`);
  console.log(`FAILED: ${failedItems.length}`);
  
  if (failedItems.length > 0) {
    console.log('\nFailed items:');
    failedItems.forEach(item => console.log(`  - ${item}`));
  }
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
