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

// Use Wikipedia search (searches article content)
async function searchWikipedia(query) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    const options = {
      hostname: 'en.wikipedia.org',
      path: `/w/api.php?action=query&list=search&srsearch=${q}&srlimit=3&format=json`,
      headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
    };
    makeRequest(options)
      .then(data => {
        try {
          const parsed = JSON.parse(data.toString());
          const results = parsed.query?.search || [];
          resolve(results.map(r => r.title));
        } catch (e) {
          resolve([]);
        }
      })
      .catch(reject);
  });
}

// Get images from a Wikipedia article
async function getWikipediaImages(title) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const options = {
      hostname: 'en.wikipedia.org',
      path: `/w/api.php?action=query&titles=${encoded}&prop=images&imlimit=5&format=json`,
      headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
    };
    makeRequest(options)
      .then(data => {
        try {
          const parsed = JSON.parse(data.toString());
          const pages = parsed.query?.pages || {};
          const pageId = Object.keys(pages)[0];
          if (pageId && pageId !== '-1') {
            const images = pages[pageId]?.images || [];
            resolve(images.map(img => img.title));
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

// Get direct image URL from Wikipedia image file
async function getWikipediaImageUrl(fileTitle) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(fileTitle.replace(/ /g, '_'));
    const options = {
      hostname: 'en.wikipedia.org',
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
            if (info && info.url && !info.mime?.includes('svg')) {
              resolve({
                url: info.thumburl || info.url,
                width: info.thumbwidth || info.width
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
  'JADI KEREN - KOPSU GULA AREN PREMIX': ['cold coffee drink', 'iced coffee', 'palm sugar coffee'],
  'JADI RINDU - KOPSU MADU PREMIX': ['honey coffee', 'cold coffee drink', 'iced coffee'],
  'JADI MACCHIATTO PREMIX': ['macchiato coffee', 'caramel macchiato'],
  'JADI KEREN - KOPSU GULA AREN MANUAL': ['cold coffee drink', 'iced coffee', 'palm sugar coffee'],
  'JADI RINDU - KOPSU MADU MANUAL': ['honey coffee', 'cold coffee drink', 'iced coffee'],
  'MOCHA LATTE MANUAL': ['mocha coffee', 'latte coffee'],
  'VANILLA LATTE MANUAL': ['vanilla latte', 'latte coffee'],
  'SALTED CARAMEL LATTE MANUAL': ['caramel macchiato', 'latte coffee'],
  'BUTTERSCOTCH LATTE MANUAL': ['butterscotch', 'coffee'],
  'JA~DI MACCHIATTO MANUAL': ['macchiato coffee'],
  'BLACK COFFEE WITH HONEY': ['honey', 'coffee'],
  'CAPPUCCINO HOT': ['cappuccino coffee'],
  'CAFFELATTE HOT': ['caffè latte', 'latte coffee'],
  'HOT CHOCOLATE': ['hot chocolate'],
  'ICE CHOCOLATE': ['chocolate milk', 'cold chocolate drink'],
  'ICE MATCHA': ['matcha', 'matcha latte'],
  'CHOCO BERRY (ICE 12OZ)': ['chocolate milk', 'strawberry drink'],
  'BLENDED VANILLA CARAMEL': ['vanilla latte', 'caramel macchiato'],
  'BLENDED CHOCO': ['chocolate milk', 'chocolate drink'],
  'BLENDED CHOCO CARAMEL': ['caramel macchiato', 'chocolate drink'],
  'ICE DOLCE LATTE (12OZ)': ['latte coffee', 'sweet coffee'],
  'COCONUT CLOUD LATTE': ['coconut', 'latte coffee', 'cappuccino'],
  'PANDAN CLOUD LATTE': ['latte coffee', 'cappuccino', 'pandan'],
  'SALTED CARAMEL COCA (12OZ)': ['cola', 'caramel macchiato'],
  'TOFFEE POPCORN FANTA (12OZ)': ['fanta', 'orange soda', 'soft drink'],
  'LYCHEE SPRITE (12OZ)': ['lychee', 'sprite', 'soft drink'],
  'SHAKEN LYCHEE TEA': ['lychee', 'tea'],
  'SHAKEN HONEY LEMON TEA': ['honey lemon tea', 'lemon tea'],
  'GREEN JUICE': ['green juice', 'vegetable juice', 'fruit juice'],
  'JUICE SIRSAK': ['soursop', 'fruit juice'],
  'JUICE ALPUKAT': ['avocado', 'avocado juice', 'fruit juice'],
  'JUICE BUAH NAGA': ['dragon fruit', 'fruit juice'],
  'JUICE JAMBU': ['guava', 'fruit juice'],
  'JUICE SEMANGKA': ['watermelon', 'watermelon juice', 'fruit juice'],
  'JUICE MELON': ['melon', 'cantaloupe', 'fruit juice'],
  'KOLAK LATTE': ['kolak', 'banana', 'coconut milk'],
  'WATERMELON COOLER': ['watermelon juice', 'fruit juice'],
  'PISANG IJO LATTE': ['pisang ijo', 'green banana', 'coconut milk'],
  'TIME KAMERA': ['camera', 'digital camera'],
  'COFFEE LATTE': ['latte coffee', 'caffè latte'],
  'CHOCO BERRY': ['chocolate milk', 'strawberry', 'berry'],
  'GREEN GRAPE FRUITYCANO': ['grape', 'grape juice', 'fruit juice'],
  'TROPICAL APPLE AMERICANO': ['americano coffee', 'apple juice', 'tropical'],
  'KOPI BOTOL JADI ASIK': ['bottled coffee', 'coffee'],
  'KOPI BOTOL JADI SERU': ['bottled coffee', 'coffee'],
  'KOPI BOTOL JADI SUKA': ['bottled coffee', 'coffee'],
  'PINK BERRY SODA': ['soda', 'berry', 'soft drink'],
  'HAWAIIAN AMERICANO': ['americano coffee', 'iced coffee'],
  'ICE COLLAGEN LATTE': ['latte coffee', 'collagen'],
  'MANGO COLADA': ['mango', 'mango juice', 'piña colada'],
  'CLOUDY LYCHEE': ['lychee', 'lychee drink', 'cloud coffee'],
  'COLA CARAMELA': ['cola', 'caramel macchiato', 'soft drink'],
  'POPPY BERRY': ['berry', 'berry drink'],
  'MACCHIATO CLOUD FOAM': ['macchiato coffee', 'cappuccino', 'latte art']
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
  
  // Get search terms from map, or use the item name itself
  const searchTerms = SEARCH_MAP[itemName] || [itemName];
  console.log(`  Search terms: ${searchTerms.join(', ')}`);
  
  let downloaded = false;
  
  for (const term of searchTerms) {
    if (downloaded) break;
    
    try {
      console.log(`  Wikipedia search: "${term}"`);
      const articleTitles = await searchWikipedia(term);
      console.log(`    Found ${articleTitles.length} articles: ${articleTitles.join(', ')}`);
      
      if (articleTitles.length === 0) continue;
      
      // Try first article
      const articleTitle = articleTitles[0];
      const imageTitles = await getWikipediaImages(articleTitle);
      console.log(`    Article has ${imageTitles.length} images`);
      
      // Filter out non-image files
      const validImages = imageTitles.filter(t => 
        !t.includes('.svg') && 
        !t.includes('icon') && 
        !t.includes('logo') &&
        !t.includes('map') &&
        !t.includes('Flag') &&
        !t.includes('Diagram') &&
        !t.includes('Chart')
      );
      console.log(`    Valid images: ${validImages.length}`);
      
      for (const imgTitle of validImages) {
        if (downloaded) break;
        
        const imgInfo = await getWikipediaImageUrl(imgTitle);
        if (!imgInfo || !imgInfo.url) continue;
        if (imgInfo.width && imgInfo.width < 200) continue;
        
        try {
          console.log(`    Downloading: ${imgTitle}`);
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
