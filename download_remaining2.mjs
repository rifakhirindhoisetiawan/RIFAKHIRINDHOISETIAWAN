import https from 'https';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = path.join(process.cwd(), 'images', 'modul03-photos');
fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const failedItems = [
  "JADI MACCHIATTO PREMIX",
  "JA~DI MACCHIATTO MANUAL",
  "BLENDED CHOCO",
  "BLENDED CHOCO CARAMEL",
  "COCONUT CLOUD LATTE",
  "PANDAN CLOUD LATTE",
  "GREEN JUICE",
  "JUICE SIRSAK",
  "JUICE ALPUKAT",
  "JUICE BUAH NAGA",
  "JUICE JAMBU",
  "JUICE SEMANGKA",
  "JUICE MELON",
  "COFFEE LATTE",
  "TROPICAL APPLE AMERICANO",
  "KOPI BOTOL JADI SUKA",
  "PINK BERRY SODA",
  "HAWAIIAN AMERICANO",
  "ICE COLLAGEN LATTE",
  "CLOUDY LYCHEE",
  "COLA CARAMELA",
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

// Search Commons directly for images
async function searchCommonsDirect(query) {
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

// For each failed item, try multiple search queries
const SEARCH_QUERIES = {
  'JADI MACCHIATTO PREMIX': ['macchiato coffee', 'caramel macchiato', 'espresso macchiato'],
  'JA~DI MACCHIATTO MANUAL': ['macchiato coffee', 'caramel macchiato', 'espresso macchiato'],
  'BLENDED CHOCO': ['chocolate milk', 'hot chocolate', 'chocolate drink', 'milkshake'],
  'BLENDED CHOCO CARAMEL': ['caramel macchiato', 'chocolate caramel', 'mocha coffee'],
  'COCONUT CLOUD LATTE': ['coconut coffee', 'cappuccino', 'latte art', 'coffee foam'],
  'PANDAN CLOUD LATTE': ['pandan', 'green tea', 'matcha', 'cappuccino'],
  'GREEN JUICE': ['smoothie', 'green smoothie', 'vegetable juice', 'healthy drink'],
  'JUICE SIRSAK': ['soursop', 'graviola', 'tropical fruit', 'fruit juice'],
  'JUICE ALPUKAT': ['avocado', 'avocado juice', 'smoothie', 'green drink'],
  'JUICE BUAH NAGA': ['dragon fruit', 'pitaya', 'tropical fruit', 'fruit juice'],
  'JUICE JAMBU': ['guava', 'tropical fruit', 'fruit juice', 'guava juice'],
  'JUICE SEMANGKA': ['watermelon', 'watermelon juice', 'summer drink', 'fruit juice'],
  'JUICE MELON': ['melon', 'cantaloupe', 'honeydew', 'fruit juice'],
  'COFFEE LATTE': ['latte', 'caffè latte', 'coffee with milk', 'latte art'],
  'TROPICAL APPLE AMERICANO': ['americano', 'iced coffee', 'apple juice', 'tropical drink'],
  'KOPI BOTOL JADI SUKA': ['bottled coffee', 'packaged coffee', 'ready to drink coffee'],
  'PINK BERRY SODA': ['soda', 'berry drink', 'pink drink', 'fruit soda'],
  'HAWAIIAN AMERICANO': ['americano', 'iced coffee', 'black coffee'],
  'ICE COLLAGEN LATTE': ['collagen', 'beauty drink', 'latte', 'iced coffee'],
  'CLOUDY LYCHEE': ['lychee', 'lychee drink', 'cloud drink', 'tropical drink'],
  'COLA CARAMELA': ['cola', 'caramel', 'soda', 'soft drink'],
  'MACCHIATO CLOUD FOAM': ['macchiato', 'cappuccino', 'latte art', 'coffee foam']
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
  
  const queries = SEARCH_QUERIES[itemName] || [itemName.toLowerCase()];
  console.log(`  Will try ${queries.length} search queries`);
  
  let downloaded = false;
  
  for (const query of queries) {
    if (downloaded) break;
    
    try {
      console.log(`  Searching: "${query}"`);
      const { titles } = await searchCommonsDirect(query);
      console.log(`    Found ${titles.length} results`);
      
      if (titles.length === 0) continue;
      
      // Try each result
      for (const title of titles) {
        if (downloaded) break;
        
        // Skip non-images
        if (title.includes('.svg') || title.includes('.webm') || title.includes('.ogv')) {
          continue;
        }
        
        const imgInfo = await getImageInfo(title);
        if (!imgInfo || !imgInfo.url) continue;
        if (imgInfo.width && imgInfo.width < 200) continue;
        
        try {
          console.log(`    Downloading: ${title} (${imgInfo.width}px)`);
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
  
  console.log(`Downloading images for ${failedItems.length} remaining items...\n`);
  
  for (const item of failedItems) {
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
  console.log(`SUCCESSFULLY DOWNLOADED: ${successCount}/${failedItems.length}`);
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
