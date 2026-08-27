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

function searchCommons(query) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    const options = {
      hostname: 'commons.wikimedia.org',
      path: `/w/api.php?action=opensearch&search=${q}&namespace=6&limit=10&format=json`,
      headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
    };
    makeRequest(options)
      .then(data => {
        try {
          const parsed = JSON.parse(data.toString());
          resolve({
            titles: parsed[1] || [],
            urls: parsed[3] || []
          });
        } catch (e) {
          resolve({ titles: [], urls: [] });
        }
      })
      .catch(reject);
  });
}

function getImageInfo(fileName) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(fileName);
    const options = {
      hostname: 'commons.wikimedia.org',
      path: `/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=400&format=json`,
      headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
    };
    makeRequest(options)
      .then(data => {
        try {
          const parsed = JSON.parse(data.toString());
          const pages = parsed.query?.pages || {};
          const pageId = Object.keys(pages)[0];
          if (pageId && pageId !== '-1') {
            const info = pages[pageId]?.imageinfo?.[0];
            if (info && info.url) {
              resolve({
                url: info.thumburl || info.url,
                width: info.thumbwidth || info.width,
                mime: info.mime
              });
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      })
      .catch(() => resolve(null));
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
        'Referer': 'https://commons.wikimedia.org/'
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

const CATEGORY_MAP = {
  'latte': ['latte', 'caffè latte', 'coffee with milk'],
  'cappuccino': ['cappuccino', 'cappuccino coffee'],
  'americano': ['americano coffee', 'iced americano'],
  'espresso': ['espresso', 'espresso shot'],
  'mocha': ['mocha coffee', 'mocha latte'],
  'matcha': ['matcha', 'matcha latte', 'iced matcha'],
  'chocolate': ['hot chocolate', 'chocolate drink', 'chocolate milk'],
  'strawberry': ['strawberry milk', 'strawberry drink'],
  'vanilla': ['vanilla latte', 'vanilla coffee'],
  'caramel': ['caramel macchiato', 'caramel coffee', 'caramel latte'],
  'coconut': ['coconut drink', 'coconut water'],
  'butter': ['butterscotch', 'butterscotch coffee'],
  'honey': ['honey coffee', 'honey drink'],
  'juice': ['fruit juice', 'fresh juice', 'juice drink'],
  'avocado': ['avocado juice', 'avocado drink'],
  'dragon fruit': ['dragon fruit juice', 'dragon fruit'],
  'orange': ['orange juice', 'orange drink'],
  'mango': ['mango juice', 'mango drink'],
  'watermelon': ['watermelon juice', 'watermelon drink'],
  'melon': ['melon juice', 'cantaloupe'],
  'soursop': ['soursop juice', 'soursop drink'],
  'guava': ['guava juice', 'guava drink'],
  'banana': ['banana juice', 'banana drink'],
  'apple': ['apple juice', 'apple drink'],
  'carrot': ['carrot juice', 'carrot drink'],
  'bottled coffee': ['bottled coffee', 'coffee bottle'],
  'frappe': ['frappe', 'coffee frappe', 'iced coffee'],
  'soda': ['soda', 'soft drink', 'soda drink'],
  'berry': ['berry drink', 'mixed berries'],
  'lychee': ['lychee drink', 'lychee juice'],
  'cola': ['cola', 'coca cola', 'cola drink'],
  'macchiato': ['macchiato coffee', 'caramel macchiato'],
  'cloud': ['latte art', 'coffee with foam'],
  'kolak': ['kolak', 'kolak dessert', 'banana in coconut milk'],
  'pisang ijo': ['pisang ijo', 'green banana dessert'],
  'grape': ['grape juice', 'green grape'],
  'tropical': ['tropical drink', 'tropical juice'],
  'cola caramel': ['cola with caramel', 'caramel soda'],
  'fanta': ['fanta', 'orange soda'],
  'sprite': ['sprite', 'lemon lime soda'],
  'affogato': ['affogato', 'affogato dessert'],
  'collagen': ['collagen drink', 'beauty drink'],
  'dolce': ['sweet latte', 'dolce latte']
};

function getSearchTerms(name) {
  const terms = [name];
  const lower = name.toLowerCase();
  
  for (const [keyword, searches] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) {
      terms.push(...searches);
    }
  }
  
  // Additional specific mappings
  if (lower.includes('fruitycano')) terms.push('fruit juice', 'tropical juice');
  if (lower.includes('cooler')) terms.push('fruit cooler', 'summer drink');
  if (lower.includes('plano')) terms.push('barcode', 'label');
  if (lower.includes('kamera')) terms.push('camera', 'photography');
  if (lower.includes('plu')) terms.push('barcode', 'product label');
  if (lower.includes('pop')) terms.push('poppy', 'poppy seed');
  
  // For Korean strawberry milk
  if (lower.includes('korean strawberry')) terms.push('strawberry milk', 'korean drink');
  
  // For ice drinks
  if (lower.includes('ice') && !lower.includes('espresso')) {
    terms.push('iced drink', 'cold drink');
  }
  
  return [...new Set(terms)]; // Remove duplicates
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
  console.log(`  Search terms: ${searchTerms.join(', ')}`);
  
  let downloaded = false;
  
  for (const term of searchTerms) {
    if (downloaded) break;
    
    try {
      console.log(`  Searching: "${term}"`);
      const { urls } = await searchCommons(term);
      console.log(`    Found ${urls.length} results`);
      
      if (urls.length === 0) continue;
      
      for (const pageUrl of urls) {
        if (downloaded) break;
        
        const match = pageUrl.match(/File:(.+)$/);
        if (!match) continue;
        
        const fileName = 'File:' + decodeURIComponent(match[1]);
        console.log(`    Trying: ${match[1]}`);
        
        const imgInfo = await getImageInfo(fileName);
        if (!imgInfo || !imgInfo.url) continue;
        
        // Skip if too small
        if (imgInfo.width && imgInfo.width < 200) continue;
        
        try {
          console.log(`    Downloading from: ${imgInfo.url.substring(0, 60)}...`);
          const size = await downloadImage(imgInfo.url, destPath);
          console.log(`    ✓ Downloaded ${size} bytes`);
          downloaded = true;
        } catch (err) {
          console.log(`    Download failed: ${err.message}`);
          try { fs.unlinkSync(destPath); } catch (e) {}
        }
      }
    } catch (err) {
      console.log(`    Error: ${err.message}`);
    }
    
    // Small delay
    await new Promise(r => setTimeout(r, 200));
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
