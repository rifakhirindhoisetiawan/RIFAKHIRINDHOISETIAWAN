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

// Use Wikipedia API to search for articles and get their images
async function searchWikipediaAndGetImage(query) {
  // Step 1: Search for articles
  const searchEncoded = encodeURIComponent(query);
  const searchOptions = {
    hostname: 'en.wikipedia.org',
    path: `/w/api.php?action=query&list=search&srsearch=${searchEncoded}&srlimit=2&format=json`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const searchData = await makeRequest(searchOptions);
  const searchParsed = JSON.parse(searchData.toString());
  const results = searchParsed.query?.search || [];
  
  if (results.length === 0) return null;
  
  // Step 2: Get images from the first article
  const title = results[0].title;
  const titleEncoded = encodeURIComponent(title.replace(/ /g, '_'));
  const imagesOptions = {
    hostname: 'en.wikipedia.org',
    path: `/w/api.php?action=query&titles=${titleEncoded}&prop=images&imlimit=5&format=json`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const imagesData = await makeRequest(imagesOptions);
  const imagesParsed = JSON.parse(imagesData.toString());
  const pages = imagesParsed.query?.pages || {};
  const pageId = Object.keys(pages)[0];
  
  if (!pageId || pageId === '-1') return null;
  
  const images = pages[pageId]?.images || [];
  
  // Filter out non-image files
  const validImages = images.filter(img => 
    !img.title.includes('.svg') && 
    !img.title.includes('.webm') &&
    !img.title.includes('.ogv') &&
    !img.title.toLowerCase().includes('icon') && 
    !img.title.toLowerCase().includes('logo') &&
    !img.title.toLowerCase().includes('map') &&
    !img.title.toLowerCase().includes('flag') &&
    !img.title.toLowerCase().includes('diagram')
  );
  
  if (validImages.length === 0) return null;
  
  // Step 3: Get image info for the first valid image
  const imgTitle = validImages[0].title;
  const imgEncoded = encodeURIComponent(imgTitle.replace(/ /g, '_'));
  const infoOptions = {
    hostname: 'en.wikipedia.org',
    path: `/w/api.php?action=query&titles=${imgEncoded}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=400&format=json`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const infoData = await makeRequest(infoOptions);
  const infoParsed = JSON.parse(infoData.toString());
  const infoPages = infoParsed.query?.pages || {};
  const infoPageId = Object.keys(infoPages)[0];
  
  if (!infoPageId || infoPageId === '-1') return null;
  
  const info = infoPages[infoPageId]?.imageinfo?.[0];
  if (!info || !info.url) return null;
  
  return {
    url: info.thumburl || info.url,
    width: info.thumbwidth || info.width,
    title: imgTitle
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
  'COFFEE LATTE': 'latte coffee',
  'CAPPUCCINO HOT': 'cappuccino coffee',
  'HAWAIIAN AMERICANO': 'hawaiian coffee',
  'ICE COLLAGEN LATTE': 'collagen drink',
  'COFFEE LATTE PREMIX': 'latte coffee',
  'VANILLA LATTE PREMIX': 'vanilla latte',
  'SALTED CARAMEL LATTE PREMIX': 'caramel macchiato',
  'BUTTERSCOTCH LATTE PREMIX': 'butterscotch coffee',
  'SALTED BUTTERCORN LATTE PREMIX': 'butterscotch coffee',
  'JADI KEREN - KOPSU GULA AREN PREMIX': 'iced coffee drink',
  'MOCHA LATTE PREMIX': 'mocha coffee',
  'JADI RINDU - KOPSU MADU PREMIX': 'honey coffee drink',
  'JADI MACCHIATTO PREMIX': 'macchiato coffee',
  'SALTED BUTTERCORN LATTE MANUAL': 'butterscotch coffee',
  'JADI KEREN - KOPSU GULA AREN MANUAL': 'iced coffee drink',
  'JADI RINDU - KOPSU MADU MANUAL': 'honey coffee drink',
  'MOCHA LATTE MANUAL': 'mocha coffee',
  'VANILLA LATTE MANUAL': 'vanilla latte',
  'SALTED CARAMEL LATTE MANUAL': 'caramel macchiato',
  'BUTTERSCOTCH LATTE MANUAL': 'butterscotch coffee',
  'JA~DI MACCHIATTO MANUAL': 'macchiato coffee',
  'COFFEE LATTE ICE MANUAL': 'iced latte coffee',
  'CAPPUCCINO ICE': 'cappuccino coffee',
  'AMERICANO HOT': 'americano coffee',
  'AMERICANO ICE': 'americano coffee',
  'BLACK COFFEE WITH HONEY': 'black coffee',
  'HAWAIIAN AMERICANO (ICE UPSIZE)': 'americano coffee',
  'ESPRESSO HOT': 'espresso coffee',
  'CAFFELATTE HOT': 'caffè latte',
  'HOT CHOCOLATE': 'hot chocolate',
  'ICE CHOCOLATE': 'chocolate milk',
  'ICE MATCHA': 'matcha',
  'CHOCO BERRY (ICE 12OZ)': 'chocolate drink',
  'BLENDED VANILLA CARAMEL': 'vanilla coffee',
  'BLENDED CHOCO': 'chocolate milk',
  'BLENDED CHOCO CARAMEL': 'caramel macchiato',
  'CREAMY COCONUT FRAPPE (UPSIZE)': 'coconut coffee',
  'KOREAN STRAWBERRY MILK': 'strawberry milk',
  'AFFOGATO': 'affogato',
  'ICE COLLAGEN LATTE (12OZ)': 'collagen drink',
  'ICE DOLCE LATTE (12OZ)': 'latte coffee',
  'COCONUT CLOUD LATTE': 'coconut coffee',
  'PANDAN CLOUD LATTE': 'pandan coffee',
  'SALTED CARAMEL COCA (12OZ)': 'cola drink',
  'TOFFEE POPCORN FANTA (12OZ)': 'fanta soda',
  'LYCHEE SPRITE (12OZ)': 'lychee drink',
  'SHAKEN LYCHEE TEA': 'lychee tea',
  'SHAKEN HONEY LEMON TEA': 'lemon tea',
  'GREEN JUICE': 'fruit juice',
  'JUICE SIRSAK': 'soursop juice',
  'JUICE ALPUKAT': 'avocado juice',
  'JUICE BUAH NAGA': 'dragon fruit',
  'JUICE JAMBU': 'guava',
  'JUICE SEMANGKA': 'watermelon juice',
  'JUICE MELON': 'melon juice',
  'JUICE PISANG STRAWBERRY': 'banana strawberry',
  'JUICE MANGGA HARUM MANIS': 'mango juice',
  'JUICE APEL MIX': 'apple juice',
  'JUICE CARROT MIXED FRUIT': 'carrot juice',
  'JUICE JERUK': 'orange juice',
  'JUICE JERUK NAVEL': 'orange juice',
  'JUICE JERUK NAVEL CARA CARA': 'orange juice',
  'KOLAK LATTE': 'kolak dessert',
  'WATERMELON COOLER': 'watermelon juice',
  'PISANG IJO LATTE': 'pisang ijo',
  'PLU JA-DI': 'barcode',
  'PLANO': 'barcode',
  'TIME KAMERA': 'camera',
  'CHOCO BERRY': 'chocolate drink',
  'GREEN GRAPE FRUITYCANO': 'grape juice',
  'TROPICAL APPLE AMERICANO': 'tropical juice',
  'KOPI BOTOL JADI ASIK': 'bottled coffee',
  'KOPI BOTOL JADI SERU': 'bottled coffee',
  'KOPI BOTOL JADI SUKA': 'bottled coffee',
  'CREAMY COCONUT FRAPPE': 'coconut coffee',
  'PINK BERRY SODA': 'berry soda',
  'HAWAIIAN AMERICANO': 'americano coffee',
  'ICE COLLAGEN LATTE': 'collagen drink',
  'MANGO COLADA': 'mango juice',
  'CLOUDY LYCHEE': 'lychee drink',
  'COLA CARAMELA': 'cola drink',
  'POPPY BERRY': 'berry drink',
  'MACCHIATO CLOUD FOAM': 'macchiato coffee'
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
  console.log(`  Wikipedia search: "${searchQuery}"`);
  
  let downloaded = false;
  
  try {
    const imgInfo = await searchWikipediaAndGetImage(searchQuery);
    
    if (imgInfo) {
      console.log(`  Found image: ${imgInfo.title} (${imgInfo.width}px)`);
      
      try {
        console.log(`    Downloading: ${imgInfo.url.substring(0, 60)}...`);
        const size = await downloadImage(imgInfo.url, destPath);
        console.log(`    ✓ Downloaded ${size} bytes`);
        downloaded = true;
      } catch (err) {
        console.log(`    Download failed: ${err.message}`);
        try { fs.unlinkSync(destPath); } catch (e) {}
      }
    } else {
      console.log(`  No image found`);
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
