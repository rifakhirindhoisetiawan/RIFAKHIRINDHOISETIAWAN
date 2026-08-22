import https from 'https';

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

async function test() {
  const queries = [
    'cappuccino hot',
    'macchiato',
    'chocolate drink',
    'avocado juice',
    'dragon fruit',
    'bottled coffee',
    'coconut latte',
    'pandan latte',
    'berry soda',
    'collagen drink'
  ];
  
  for (const q of queries) {
    const searchQuery = encodeURIComponent(q);
    const options = {
      hostname: 'commons.wikimedia.org',
      path: `/w/api.php?action=opensearch&search=${searchQuery}&namespace=6&limit=5&format=json`,
      headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
    };
    
    try {
      const data = await makeRequest(options);
      const parsed = JSON.parse(data.toString());
      const titles = parsed[1] || [];
      console.log(`"${q}": ${titles.length} results`);
    } catch (err) {
      console.log(`"${q}": Error - ${err.message}`);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
}

test();
