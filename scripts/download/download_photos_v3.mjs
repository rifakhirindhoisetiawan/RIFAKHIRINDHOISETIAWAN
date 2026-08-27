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

// Search Wikipedia for articles, then get their images
async function searchWikipedia(query) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    const options = {
      hostname: 'en.wikipedia.org',
      path: `/w/api.php?action=opensearch&search=${q}&namespace=0&limit=5&format=json`,
      headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
    };
    makeRequest(options)
      .then(data => {
        try {
          const parsed = JSON.parse(data.toString());
          // [query, titles, descriptions, urls]
          const titles = parsed[1] || [];
          const articleUrls = parsed[3] || [];
          resolve({ titles, articleUrls });
        } catch (e) {
          resolve({ titles: [], articleUrls: [] });
        }
      })
      .catch(reject);
  });
}

// Get images from a Wikipedia article
async function getWikipediaImages(articleUrl) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(articleUrl);
    const title = urlObj.pathname.replace('/wiki/', '');
    const encodedTitle = encodeURIComponent(title);
    
    const options = {
      hostname: 'en.wikipedia.org',
      path: `/w/api.php?action=query&titles=${encodedTitle}&prop=images&imlimit=5&format=json`,
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
    const encoded = encodeURIComponent(fileTitle);
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
  if (lower.includes('cappuccino')) terms.push('cappuccino coffee');
  if (lower.includes('americano')) terms.push('americano coffee');
  if (lower.includes('espresso')) terms.push('espresso coffee');
  if (lower.includes('mocha')) terms.push('mocha coffee');
  if (lower.includes('matcha')) terms.push('matcha');
  if (lower.includes('chocolate') || lower.includes('choco')) {
    terms.push('hot chocolate');
    if (lower.includes('berry')) terms.push('strawberry');
  }
  if (lower.includes('strawberry')) terms.push('strawberry milk');
  if (lower.includes('vanilla')) terms.push('vanilla latte');
  if (lower.includes('caramel')) terms.push('caramel macchiato');
  if (lower.includes('coconut')) terms.push('coconut');
  if (lower.includes('butter')) terms.push('butterscotch');
  if (lower.includes('honey')) terms.push('honey');
  if (lower.includes('juice')) {
    terms.push('fruit juice');
    if (lower.includes('alpukat')) terms.push('avocado');
    if (lower.includes('buah naga')) terms.push('dragon fruit');
    if (lower.includes('jeruk')) terms.push('orange juice');
    if (lower.includes('mangga')) terms.push('mango juice');
    if (lower.includes('semangka')) terms.push('watermelon juice');
    if (lower.includes('melon')) terms.push('melon');
    if (lower.includes('sirsak')) terms.push('soursop');
    if (lower.includes('jambu')) terms.push('guava');
    if (lower.includes('pisang')) terms.push('banana');
    if (lower.includes('apel')) terms.push('apple juice');
    if (lower.includes('carrot')) terms.push('carrot juice');
  }
  if (lower.includes('kopi botol')) terms.push('bottled coffee');
  if (lower.includes('frappe')) terms.push('frappe');
  if (lower.includes('fruitycano')) terms.push('fruit juice');
  if (lower.includes('cooler')) terms.push('fruit juice');
  if (lower.includes('soda')) terms.push('soda');
  if (lower.includes('berry')) terms.push('berry');
  if (lower.includes('lychee')) terms.push('lychee');
  if (lower.includes('cola')) terms.push('cola');
  if (lower.includes('macchiato')) terms.push('macchiato');
  if (lower.includes('cloud')) terms.push('coffee');
  if (lower.includes('plano')) terms.push('barcode');
  if (lower.includes('kamera')) terms.push('camera');
  if (lower.includes('plu')) terms.push('barcode');
  if (lower.includes('kolak')) terms.push('kolak');
  if (lower.includes('pisang ijo')) terms.push('pisang ijo');
  if (lower.includes('green grape')) terms.push('grape');
  if (lower.includes('tropical')) terms.push('tropical');
  if (lower.includes('pink berry')) terms.push('berry');
  if (lower.includes('pop')) terms.push('poppy');
  if (lower.includes('coca')) terms.push('cola');
  if (lower.includes('fanta')) terms.push('fanta');
  if (lower.includes('sprite')) terms.push('sprite');
  if (lower.includes('affogato')) terms.push('affogato');
  if (lower.includes('collagen')) terms.push('collagen');
  if (lower.includes('dolce')) terms.push('latte');
  
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
      console.log(`  Wikipedia search: "${term}"`);
      const { articleUrls } = await searchWikipedia(term);
      console.log(`    Found ${articleUrls.length} articles`);
      
      for (const articleUrl of articleUrls) {
        if (downloaded) break;
        
        try {
          const imageTitles = await getWikipediaImages(articleUrl);
          console.log(`    Article has ${imageTitles.length} images`);
          
          for (const imgTitle of imageTitles) {
            if (downloaded) break;
            if (imgTitle.includes('.svg')) continue;
            if (imgTitle.includes('icon') || imgTitle.includes('logo') || imgTitle.includes('map')) continue;
            
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
        } catch (e) {
          // Skip this article
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
