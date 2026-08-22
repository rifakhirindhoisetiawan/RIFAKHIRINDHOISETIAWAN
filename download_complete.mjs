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

// Search Commons for images
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

// Get image info from Commons
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

const SEARCH_MAP = {
  'JADI KEREN - KOPSU GULA AREN PREMIX': ['iced coffee drink', 'cold coffee', 'palm sugar drink'],
  'JADI RINDU - KOPSU MADU PREMIX': ['honey coffee drink', 'iced honey coffee'],
  'JADI MACCHIATTO PREMIX': ['macchiato coffee', 'caramel macchiato'],
  'JADI KEREN - KOPSU GULA AREN MANUAL': ['iced coffee drink', 'cold coffee'],
  'JADI RINDU - KOPSU MADU MANUAL': ['honey coffee drink', 'iced honey coffee'],
  'MOCHA LATTE MANUAL': ['mocha coffee', 'latte coffee'],
  'VANILLA LATTE MANUAL': ['vanilla latte', 'latte coffee'],
  'SALTED CARAMEL LATTE MANUAL': ['caramel macchiato', 'caramel coffee'],
  'BUTTERSCOTCH LATTE MANUAL': ['butterscotch', 'butterscotch coffee'],
  'JA~DI MACCHIATTO MANUAL': ['macchiato coffee'],
  'BLACK COFFEE WITH HONEY': ['honey', 'black coffee'],
  'CAPPUCCINO HOT': ['cappuccino coffee', 'hot cappuccino'],
  'CAFFELATTE HOT': ['caffè latte', 'latte coffee'],
  'ICE MATCHA': ['matcha', 'matcha tea', 'green tea'],
  'CHOCO BERRY (ICE 12OZ)': ['chocolate milk', 'strawberry chocolate'],
  'BLENDED VANILLA CARAMEL': ['vanilla coffee', 'caramel coffee'],
  'BLENDED CHOCO': ['chocolate milk', 'hot chocolate'],
  'BLENDED CHOCO CARAMEL': ['caramel macchiato', 'chocolate caramel'],
  'ICE DOLCE LATTE (12OZ)': ['sweet latte', 'latte coffee'],
  'COCONUT CLOUD LATTE': ['coconut drink', 'cappuccino', 'latte'],
  'PANDAN CLOUD LATTE': ['pandan', 'latte', 'cappuccino'],
  'SALTED CARAMEL COCA (12OZ)': ['cola', 'soft drink'],
  'TOFFEE POPCORN FANTA (12OZ)': ['fanta', 'orange soda', 'soft drink'],
  'LYCHEE SPRITE (12OZ)': ['lychee', 'lychee drink', 'soft drink'],
  'SHAKEN LYCHEE TEA': ['lychee', 'lychee tea', 'iced tea'],
  'SHAKEN HONEY LEMON TEA': ['honey lemon tea', 'lemon tea', 'iced tea'],
  'GREEN JUICE': ['green juice', 'vegetable juice', 'smoothie'],
  'JUICE SIRSAK': ['soursop', 'soursop juice', 'fruit juice'],
  'JUICE ALPUKAT': ['avocado', 'avocado juice', 'fruit juice'],
  'JUICE BUAH NAGA': ['dragon fruit', 'dragon fruit juice'],
  'JUICE JAMBU': ['guava', 'guava juice', 'fruit juice'],
  'JUICE SEMANGKA': ['watermelon', 'watermelon juice', 'fruit juice'],
  'JUICE MELON': ['melon', 'cantaloupe', 'fruit juice'],
  'KOLAK LATTE': ['kolak', 'banana dessert', 'coconut milk dessert'],
  'WATERMELON COOLER': ['watermelon juice', 'watermelon drink'],
  'PISANG IJO LATTE': ['pisang ijo', 'green banana', 'coconut milk'],
  'TIME KAMERA': ['camera', 'digital camera', 'photography'],
  'COFFEE LATTE': ['latte coffee', 'caffè latte'],
  'CHOCO BERRY': ['chocolate milk', 'berry drink'],
  'GREEN GRAPE FRUITYCANO': ['green grape', 'grape juice'],
  'TROPICAL APPLE AMERICANO': ['tropical drink', 'apple juice', 'americano'],
  'KOPI BOTOL JADI ASIK': ['bottled coffee', 'coffee bottle'],
  'KOPI BOTOL JADI SERU': ['bottled coffee', 'coffee bottle'],
  'KOPI BOTOL JADI SUKA': ['bottled coffee', 'coffee bottle'],
  'PINK BERRY SODA': ['berry soda', 'pink drink', 'soda'],
  'HAWAIIAN AMERICANO': ['americano coffee', 'hawaiian coffee'],
  'ICE COLLAGEN LATTE': ['collagen drink', 'beauty drink', 'latte'],
  'MANGO COLADA': ['mango', 'mango juice', 'piña colada'],
  'CLOUDY LYCHEE': ['lychee', 'lychee drink', 'cloud drink'],
  'COLA CARAMELA': ['cola', 'caramel soda', 'soft drink'],
  'POPPY BERRY': ['berry', 'berry drink', 'fruit'],
  'MACCHIATO CLOUD FOAM': ['macchiato', 'cappuccino', 'latte art']
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
  
  // Use search map if available, otherwise use the item name
  const searchTerms = SEARCH_MAP[itemName] || [itemName.toLowerCase()];
  console.log(`  Search terms: ${searchTerms.join(', ')}`);
  
  let downloaded = false;
  
  for (const term of searchTerms) {
    if (downloaded) break;
    
    try {
      console.log(`  Searching Commons: "${term}"`);
      const { titles, urls } = await searchCommons(term);
      console.log(`    Found ${titles.length} results`);
      
      if (titles.length === 0) continue;
      
      // Process results
      for (let i = 0; i < titles.length && !downloaded; i++) {
        const title = titles[i];
        console.log(`    Trying: ${title}`);
        
        // Skip non-image files
        if (title.includes('.svg') || title.includes('.webm') || title.includes('.ogv')) {
          console.log(`      Skipping (not an image)`);
          continue;
        }
        
        // Get image info
        const imgInfo = await getImageInfo(title);
        if (!imgInfo || !imgInfo.url) {
          console.log(`      No image info`);
          continue;
        }
        
        // Skip if too small
        if (imgInfo.width && imgInfo.width < 200) {
          console.log(`      Too small (${imgInfo.width}px)`);
          continue;
        }
        
        try {
          console.log(`    Downloading: ${imgInfo.url.substring(0, 60)}...`);
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
    await new Promise(r => setTimeout(r, 300));
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
