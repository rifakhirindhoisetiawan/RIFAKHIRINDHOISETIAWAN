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

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.get(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('timeout'));
    });
  });
}

// Try Pixabay API (free images, requires API key but we can try without)
async function searchPixabay(query) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    // Pixabay has a demo key but it's rate limited
    const options = {
      hostname: 'pixabay.com',
      path: `/api/?key=&q=${q}&image_type=photo&per_page=5`,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };
    makeRequest(options)
      .then(data => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.hits && parsed.hits.length > 0) {
            const urls = parsed.hits.map(hit => hit.largeImageURL || hit.webformatURL);
            resolve(urls);
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      })
      .catch(() => resolve([]));
  });
}

// Try Unsplash API
async function searchUnsplash(query) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    const options = {
      hostname: 'unsplash.com',
      path: `/napi/search/photos?query=${q}&per_page=5`,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };
    makeRequest(options)
      .then(data => {
        try {
          const parsed = JSON.parse(data.toString());
          const results = parsed.results || [];
          const urls = results
            .filter(r => r.urls && r.urls.regular)
            .map(r => r.urls.regular);
          resolve(urls);
        } catch (e) {
          resolve([]);
        }
      })
      .catch(() => resolve([]));
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

function getSearchTerms(name) {
  const terms = [name];
  const lower = name.toLowerCase();
  
  if (lower.includes('latte')) terms.push('latte coffee');
  if (lower.includes('cappuccino')) terms.push('cappuccino');
  if (lower.includes('americano')) terms.push('americano coffee');
  if (lower.includes('espresso')) terms.push('espresso coffee');
  if (lower.includes('mocha')) terms.push('mocha coffee');
  if (lower.includes('matcha')) terms.push('matcha latte');
  if (lower.includes('chocolate') || lower.includes('choco')) {
    terms.push('chocolate drink');
    if (lower.includes('berry')) terms.push('strawberry chocolate');
  }
  if (lower.includes('strawberry')) terms.push('strawberry drink');
  if (lower.includes('vanilla')) terms.push('vanilla latte');
  if (lower.includes('caramel')) terms.push('caramel coffee');
  if (lower.includes('coconut')) terms.push('coconut drink');
  if (lower.includes('butter')) terms.push('butterscotch coffee');
  if (lower.includes('honey')) terms.push('honey coffee');
  if (lower.includes('juice')) {
    terms.push('fresh juice');
    if (lower.includes('alpukat')) terms.push('avocado juice drink');
    if (lower.includes('buah naga')) terms.push('dragon fruit juice');
    if (lower.includes('jeruk')) terms.push('orange juice');
    if (lower.includes('mangga')) terms.push('mango juice');
    if (lower.includes('semangka')) terms.push('watermelon juice');
    if (lower.includes('melon')) terms.push('melon juice');
    if (lower.includes('sirsak')) terms.push('soursop juice');
    if (lower.includes('jambu')) terms.push('guava juice');
    if (lower.includes('pisang')) terms.push('banana juice drink');
    if (lower.includes('apel')) terms.push('apple juice');
    if (lower.includes('carrot')) terms.push('carrot juice');
  }
  if (lower.includes('kopi botol')) terms.push('bottled coffee');
  if (lower.includes('frappe')) terms.push('coffee frappe');
  if (lower.includes('fruitycano')) terms.push('fruit juice drink');
  if (lower.includes('cooler')) terms.push('fruit cooler');
  if (lower.includes('soda')) terms.push('soda drink');
  if (lower.includes('berry')) terms.push('berry drink');
  if (lower.includes('lychee')) terms.push('lychee drink');
  if (lower.includes('cola')) terms.push('cola drink');
  if (lower.includes('macchiato')) terms.push('macchiato coffee');
  if (lower.includes('cloud')) terms.push('cloud coffee');
  if (lower.includes('plano')) terms.push('restaurant menu plan');
  if (lower.includes('kamera')) terms.push('camera');
  if (lower.includes('plu')) terms.push('barcode label');
  if (lower.includes('kolak')) terms.push('kolak dessert');
  if (lower.includes('pisang ijo')) terms.push('pisang ijo dessert');
  if (lower.includes('green grape')) terms.push('grape juice');
  if (lower.includes('tropical')) terms.push('tropical drink');
  if (lower.includes('pink berry')) terms.push('berry soda');
  if (lower.includes('coca')) terms.push('cola drink');
  if (lower.includes('fanta')) terms.push('fanta soda');
  if (lower.includes('sprite')) terms.push('sprite drink');
  if (lower.includes('affogato')) terms.push('affogato dessert');
  if (lower.includes('collagen')) terms.push('collagen drink');
  if (lower.includes('dolce')) terms.push('sweet coffee');
  
  return terms;
}

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
  const searchTerms = getSearchTerms(itemName);
  
  let downloaded = false;
  
  for (const term of searchTerms) {
    if (downloaded) break;
    
    try {
      console.log(`  Searching: "${term}"`);
      
      // Try Unsplash first (higher quality images)
      const unsplashUrls = await searchUnsplash(term);
      console.log(`    Unsplash: ${unsplashUrls.length} results`);
      
      for (const imgUrl of unsplashUrls) {
        if (downloaded) break;
        
        try {
          console.log(`    Trying Unsplash: ${imgUrl.substring(0, 50)}...`);
          const size = await downloadImage(imgUrl, destPath);
          console.log(`    ✓ Downloaded ${size} bytes`);
          downloaded = true;
        } catch (err) {
          console.log(`    Failed: ${err.message}`);
          try { fs.unlinkSync(destPath); } catch (e) {}
        }
      }
      
      // If Unsplash failed, try Pixabay
      if (!downloaded) {
        const pixabayUrls = await searchPixabay(term);
        console.log(`    Pixabay: ${pixabayUrls.length} results`);
        
        for (const imgUrl of pixabayUrls) {
          if (downloaded) break;
          
          try {
            console.log(`    Trying Pixabay: ${imgUrl.substring(0, 50)}...`);
            const size = await downloadImage(imgUrl, destPath);
            console.log(`    ✓ Downloaded ${size} bytes`);
            downloaded = true;
          } catch (err) {
            console.log(`    Failed: ${err.message}`);
            try { fs.unlinkSync(destPath); } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.log(`    Error: ${err.message}`);
    }
    
    // Small delay
    await new Promise(r => setTimeout(r, 300));
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
    await new Promise(r => setTimeout(r, 500));
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
