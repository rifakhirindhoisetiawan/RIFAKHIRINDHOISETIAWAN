import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = path.join(process.cwd(), 'images', 'ja-di-photos');
fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const failedItems = [
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

// Google Image search queries for each failed item
const SEARCH_MAP = {
  'JADI KEREN - KOPSU GULA AREN PREMIX': 'iced coffee palm sugar drink',
  'JADI RINDU - KOPSU MADU PREMIX': 'honey iced coffee drink',
  'JADI MACCHIATTO PREMIX': 'macchiato coffee drink',
  'JADI KEREN - KOPSU GULA AREN MANUAL': 'iced coffee palm sugar',
  'JADI RINDU - KOPSU MADU MANUAL': 'honey iced coffee',
  'JA~DI MACCHIATTO MANUAL': 'macchiato coffee',
  'CAPPUCCINO HOT': 'hot cappuccino coffee',
  'CHOCO BERRY (ICE 12OZ)': 'chocolate strawberry iced drink',
  'BLENDED VANILLA CARAMEL': 'vanilla caramel iced coffee',
  'BLENDED CHOCO': 'chocolate blended drink',
  'BLENDED CHOCO CARAMEL': 'chocolate caramel coffee',
  'ICE DOLCE LATTE (12OZ)': 'sweet iced latte coffee',
  'COCONUT CLOUD LATTE': 'coconut cloud latte',
  'PANDAN CLOUD LATTE': 'pandan cloud latte coffee',
  'SALTED CARAMEL COCA (12OZ)': 'caramel cola drink',
  'TOFFEE POPCORN FANTA (12OZ)': 'fanta orange soda drink',
  'GREEN JUICE': 'green juice smoothie',
  'JUICE SIRSAK': 'soursop juice drink',
  'JUICE ALPUKAT': 'avocado juice drink',
  'JUICE BUAH NAGA': 'dragon fruit juice',
  'JUICE JAMBU': 'guava juice drink',
  'JUICE SEMANGKA': 'watermelon juice fresh',
  'JUICE MELON': 'fresh melon juice',
  'COFFEE LATTE': 'latte coffee drink',
  'TROPICAL APPLE AMERICANO': 'tropical apple iced coffee',
  'KOPI BOTOL JADI ASIK': 'bottled coffee drink',
  'KOPI BOTOL JADI SERU': 'bottled iced coffee',
  'KOPI BOTOL JADI SUKA': 'bottled coffee drink',
  'PINK BERRY SODA': 'pink berry soda drink',
  'HAWAIIAN AMERICANO': 'hawaiian americano coffee',
  'ICE COLLAGEN LATTE': 'collagen iced latte',
  'MANGO COLADA': 'mango colada drink',
  'CLOUDY LYCHEE': 'cloudy lychee drink',
  'COLA CARAMELA': 'caramel cola soda',
  'POPPY BERRY': 'berry soda drink',
  'MACCHIATO CLOUD FOAM': 'macchiato cloud foam coffee'
};

console.log('=== REMAINING FAILED ITEMS ===');
for (const item of failedItems) {
  const slug = slugify(item);
  const destPath = path.join(PHOTOS_DIR, slug, '1.jpg');
  const exists = fs.existsSync(destPath);
  const size = exists ? fs.statSync(destPath).size : 0;
  const status = exists && size > 5000 ? 'OK' : 'MISSING';
  console.log(`${status.padEnd(8)} ${item}`);
  console.log(`         Search query: "${SEARCH_MAP[item] || item.toLowerCase()}"`);
}
console.log(`\nTotal failed: ${failedItems.length}`);
console.log(`Need to download: ${failedItems.filter(item => {
  const slug = slugify(item);
  const destPath = path.join(PHOTOS_DIR, slug, '1.jpg');
  return !fs.existsSync(destPath) || fs.statSync(destPath).size <= 5000;
}).length}`);
