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
  // Test Latte_coffee.jpg
  const fileName = 'File:Latte_coffee.jpg';
  const encoded = encodeURIComponent(fileName);
  const options = {
    hostname: 'commons.wikimedia.org',
    path: `/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=400&format=json`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const data = await makeRequest(options);
  const parsed = JSON.parse(data.toString());
  console.log('Image info:', JSON.stringify(parsed, null, 2));
  
  const pages = parsed.query?.pages || {};
  const pageId = Object.keys(pages)[0];
  const info = pages[pageId]?.imageinfo?.[0];
  if (info) {
    console.log('\nDirect URL:', info.url);
    console.log('Thumb URL:', info.thumburl);
    console.log('Mime:', info.mime);
    console.log('Size:', info.width, 'x', info.height);
  }
}

test().catch(console.error);
