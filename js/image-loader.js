// Optimized Image Loader - Parallel loading, priority probe, IntersectionObserver, Caching
const CACHE_KEY = 'img_loader_cache_v1';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 hari

// In-memory cache untuk session
const memoryCache = new Map();
// Local cache snapshot (load sekali, update in-place) agar tidak re-parse JSON tiap URL
let localCache = null;
let writeTimer = null;

function getCache() {
  if (localCache) return localCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts <= CACHE_TTL) {
        localCache = data;
        return data;
      }
    }
  } catch {}
  localCache = {};
  return localCache;
}

// Debounced write ke localStorage agar tidak blocking main thread saat batch load
function persistCache() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: localCache, ts: Date.now() }));
    } catch {}
  }, 300);
}

function resetLocalCache() {
  localCache = null;
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

// Generate semua kandidat URL sebuah folder.
// Data aktual: tiap folder hanya punya 1 foto: 1.jpg / 1.png. Jadi cukup probe 5 URL (num=1 saja).
const PRIORITY_EXTS = ['.jpg', '.png', '.jpeg', '.svg', '.webp'];

function generateUrls(folder) {
  return PRIORITY_EXTS.map(ext => `${folder}1${ext}`);
}

// Cek cache (memory -> local snapshot)
function checkCache(url) {
  if (memoryCache.has(url)) return memoryCache.get(url);
  const cache = getCache();
  if (url in cache) {
    const val = cache[url];
    memoryCache.set(url, val);
    return val;
  }
  return null;
}

// Simpan ke cache (in-place, tanpa re-parse JSON)
function saveCache(url, result) {
  memoryCache.set(url, result);
  getCache()[url] = result;
  persistCache();
}

// Parallel load - coba 1.jpg dulu (kasus umum: 1 request, 0 request sia-sia),
// lalu sisanya batch parallel kalau ternyata tidak ketemu.
async function findFirstWorkingUrl(urls) {
  // Cek cache dulu
  let allCached = true;
  for (const url of urls) {
    const cached = checkCache(url);
    if (cached === true) return url;
    if (cached !== false) allCached = false;
  }
  // Semua 1.* sudah pernah dibuktikan tidak ada -> folder kosong, selesai tanpa network
  if (allCached) return null;

  // URL pertama (umumnya 1.jpg) dicoba sendiri - kalau ada, langsung selesai
  const first = urls[0];
  const firstOk = await loadSingleImage(first).then(() => true, () => false);
  if (firstOk) {
    saveCache(first, true);
    return first;
  }
  saveCache(first, false);

  // Sisanya (1.png, 1.jpeg, 1.svg, 1.webp) dicoba parallel
  const rest = urls.slice(1);
  const results = await Promise.allSettled(rest.map(url => loadSingleImage(url)));
  for (let j = 0; j < results.length; j++) {
    const url = rest[j];
    if (results[j].status === 'fulfilled') {
      saveCache(url, true);
      return url;
    }
    saveCache(url, false);
  }
  return null;
}

function loadSingleImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error('Failed: ' + url));
    img.src = url;
  });
}

// Transform Supabase URL ke WebP thumbnail
function toWebPThumb(url, width = 120, height = 160, quality = 75) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('supabase.co/storage')) return url;
  if (url.includes('?')) return url; // sudah ada transform
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}width=${width}&height=${height}&quality=${quality}&format=webp`;
}

// Transform Supabase URL ke large WebP
function toWebPLarge(url, width = 360, height = 640, quality = 80) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('supabase.co/storage')) return url;
  if (url.includes('?')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}width=${width}&height=${height}&quality=${quality}&format=webp`;
}

// Main loader untuk index-photos (local files)
export async function loadIndexPhoto(menuFolder, imgEl) {
  const folder = `images/index-photos/${menuFolder}/`;
  const urls = generateUrls(folder);
  
  // Tampilkan placeholder dulu
  imgEl.style.opacity = '0';
  imgEl.style.transition = 'opacity 0.2s ease';
  
  const workingUrl = await findFirstWorkingUrl(urls);
  
  if (workingUrl) {
    imgEl.src = workingUrl;
    imgEl.onload = () => { imgEl.style.opacity = '1'; };
    imgEl.decoding = 'async';
    imgEl.loading = 'lazy';
  } else {
    // Semua kandidat gagal: biarkan src bawaan dari HTML (1.ext) apa adanya
    imgEl.style.opacity = '1';
  }
}

// Loader untuk ja-di-photos (local files) - pakai background-image
export async function loadJaDiPhoto(slug, tileEl) {
  if (tileEl.dataset.hasimg === '1') return; // sudah ada gambar upload
  
  const folder = `../images/ja-di-photos/${slug}/`;
  const urls = generateUrls(folder);
  
  const workingUrl = await findFirstWorkingUrl(urls);
  
  if (workingUrl) {
    tileEl.style.backgroundImage = `url(${workingUrl})`;
    tileEl.classList.add('has-photo');
    tileEl.innerHTML = '';
  } else {
    tileEl.classList.remove('has-photo');
  }
}

// Lazy loader dengan IntersectionObserver
export function createLazyLoader(loadFn, options = {}) {
  const { rootMargin = '100px', threshold = 0.01 } = options;
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        obs.unobserve(el);
        loadFn(el).catch(console.warn);
      }
    });
  }, { rootMargin, threshold });
  
  return {
    observe: (el) => observer.observe(el),
    unobserve: (el) => observer.unobserve(el),
    disconnect: () => observer.disconnect()
  };
}

// Batch load untuk multiple elements
export async function batchLoadImages(elements, loadFn, concurrency = 4) {
  const results = [];
  for (let i = 0; i < elements.length; i += concurrency) {
    const batch = elements.slice(i, i + concurrency);
    await Promise.allSettled(batch.map(el => loadFn(el)));
  }
  return results;
}

// Preload critical images
export function preloadImages(urls) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Clear cache
export function clearImageCache() {
  memoryCache.clear();
  resetLocalCache();
}

export { toWebPThumb, toWebPLarge };

// ===== Daily Task Photo Loader (for hari/minggu/bulan.html) =====
// Data aktual: tiap folder task cuma punya 1 foto (1.jpg). Cukup 5 URL.
function generateDailyUrls(folder, slug) {
  return PRIORITY_EXTS.map(ext => `${folder}${slug}/1${ext}`);
}

export async function loadDailyTaskPhoto(tile, taskText, emojiEl, photoFolder) {
  const slug = taskText.toString().trim().toLowerCase()
    .replace(/[^a-z0-9\u00C0-\uFFFF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  if (!slug) {
    tile.style.opacity = "1";
    return;
  }

  const folder = photoFolder;
  const urls = generateDailyUrls(folder, slug);
  
  tile.style.opacity = "0";
  tile.style.transition = "opacity 0.2s ease";

  const workingUrl = await findFirstWorkingUrl(urls);
  
  if (workingUrl) {
    tile.style.backgroundImage = `url(${workingUrl})`;
    tile.style.backgroundSize = "cover";
    tile.style.backgroundPosition = "center";
    if (emojiEl) emojiEl.style.display = "none";
  }
  
  tile.style.opacity = "1";
}

export function createDailyLazyLoader(photoFolder) {
  return createLazyLoader(async (tile) => {
    const taskText = tile.dataset.taskText;
    const emojiEl = tile.querySelector('.todo-emoji');
    await loadDailyTaskPhoto(tile, taskText, emojiEl, photoFolder);
  });
}