import https from 'https';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = path.join(process.cwd(), 'images', 'ja-di-photos');
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

// Search Commons
async function searchCommons(query) {
  const q = encodeURIComponent(query);
  const options = {
    hostname: 'commons.wikimedia.org',
    path: `/w/api.php?action=opensearch&search=${q}&namespace=6&limit=10&format=json`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const data = await makeRequest(options);
  const parsed = JSON.parse(data.toString());
  return {
    titles: parsed[1] || [],
    urls: parsed[3] || []
  };
}

// Get image info
async function getImageInfo(fileName) {
  const encoded = encodeURIComponent(fileName.replace(/ /g, '_'));
  const options = {
    hostname: 'commons.wikimedia.org',
    path: `/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=500&format=json`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const data = await makeRequest(options);
  const parsed = JSON.parse(data.toString());
  const pages = parsed.query?.pages || {};
  const pageId = Object.keys(pages)[0];
  
  if (!pageId || pageId === '-1') return null;
  
  const info = pages[pageId]?.imageinfo?.[0];
  if (!info || !info.url) return null;
  
  return {
    url: info.thumburl || info.url,
    width: info.thumbwidth || info.width,
    mime: info.mime
  };
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

// Extended search terms for better coverage
const SEARCH_TERMS = {
  'coffee': ['coffee', 'latte', 'cappuccino', 'americano', 'espresso', 'mocha', 'macchiato', 'caffè latte'],
  'milk': ['milk', 'strawberry milk', 'chocolate milk', 'vanilla milk'],
  'juice': ['juice', 'fruit juice', 'fresh juice', 'orange juice', 'apple juice', 'mango juice', 'watermelon juice'],
  'tea': ['tea', 'iced tea', 'green tea', 'matcha', 'lemon tea'],
  'chocolate': ['chocolate', 'hot chocolate', 'chocolate drink', 'chocolate milk'],
  'soda': ['soda', 'soft drink', 'cola', 'fanta', 'sprite', 'carbonated drink'],
  'dessert': ['dessert', 'sweet drink', 'traditional dessert'],
  'coconut': ['coconut', 'coconut water', 'coconut drink', 'coconut milk'],
  'berry': ['berry', 'mixed berries', 'strawberry', 'raspberry', 'blueberry'],
  'tropical': ['tropical', 'tropical drink', 'tropical fruit', 'exotic drink'],
  'ice': ['iced drink', 'cold drink', 'frozen drink', 'slush'],
  'honey': ['honey', 'honey drink', 'honey tea'],
  'bottled': ['bottled drink', 'bottled coffee', 'packaged drink'],
  'cloud': ['cloud', 'foam', 'latte art', 'creamy drink'],
  'frappe': ['frappe', 'blended coffee', 'iced coffee blended'],
  'collagen': ['collagen', 'beauty drink', 'collagen drink'],
  'watermelon': ['watermelon', 'watermelon juice', 'watermelon drink'],
  'avocado': ['avocado', 'avocado juice', 'avocado drink'],
  'dragon fruit': ['dragon fruit', 'dragon fruit juice', 'pitaya'],
  'orange': ['orange', 'orange juice', 'orange drink'],
  'mango': ['mango', 'mango juice', 'mango drink'],
  'banana': ['banana', 'banana juice', 'banana drink'],
  'guava': ['guava', 'guava juice', 'jambu'],
  'carrot': ['carrot', 'carrot juice', 'vegetable juice'],
  'grape': ['grape', 'grape juice', 'green grape'],
  'soursop': ['soursop', 'soursop juice', 'sirsak'],
  'kolak': ['kolak', 'kolak dessert', 'banana in coconut milk'],
  'pisang ijo': ['pisang ijo', 'green banana', 'indonesian dessert'],
  'lychee': ['lychee', 'lychee drink', 'lychee juice'],
  'pandan': ['pandan', 'pandan drink', 'pandan flavor'],
  'caramel': ['caramel', 'caramel sauce', 'caramel flavor'],
  'vanilla': ['vanilla', 'vanilla flavor', 'vanilla syrup'],
  'strawberry': ['strawberry', 'strawberry drink', 'strawberry juice'],
  'matcha': ['matcha', 'matcha tea', 'green tea powder'],
  'camera': ['camera', 'digital camera', 'photography camera'],
  'barcode': ['barcode', 'product code', 'plu label'],
  'fruitycano': ['fruit juice', 'tropical juice', 'exotic juice'],
  'cooler': ['cooler', 'fruit cooler', 'summer cooler drink']
};

function getSearchTermsForItem(itemName) {
  const lower = itemName.toLowerCase();
  const terms = [itemName];
  
  // Add terms from each matching category
  for (const [category, searchTerms] of Object.entries(SEARCH_TERMS)) {
    if (lower.includes(category)) {
      terms.push(...searchTerms);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(terms)];
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
  
  const searchTerms = getSearchTermsForItem(itemName);
  console.log(`  Will try ${searchTerms.length} search terms`);
  
  let downloaded = false;
  
  for (const term of searchTerms) {
    if (downloaded) break;
    
    try {
      const { titles, urls } = await searchCommons(term);
      
      if (titles.length === 0) continue;
      
      // Process each result
      for (let i = 0; i < titles.length && !downloaded; i++) {
        const title = titles[i];
        
        // Skip non-image files
        if (title.includes('.svg') || title.includes('.webm') || title.includes('.ogv')) {
          continue;
        }
        
        const imgInfo = await getImageInfo(title);
        if (!imgInfo || !imgInfo.url) continue;
        if (imgInfo.width && imgInfo.width < 200) continue;
        
        try {
          console.log(`  Downloading: ${title} (${imgInfo.width}px)`);
          const size = await downloadImage(imgInfo.url, destPath);
          console.log(`  ✓ Downloaded ${size} bytes`);
          downloaded = true;
        } catch (err) {
          try { fs.unlinkSync(destPath); } catch (e) {}
        }
      }
    } catch (err) {
      // Continue to next term
    }
    
    // Small delay between searches
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
  
  console.log(`Starting download for ${menuItems.length} menu items...\n`);
  
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
  console.log(`FAILED: ${failedItems.length}`);
  
  if (failedItems.length > 0) {
    console.log('\nFailed items:');
    failedItems.forEach(item => console.log(`  - ${item}`));
  }
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
