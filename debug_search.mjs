import https from 'https';
import fs from 'fs';

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

async function test() {
  // Search for latte coffee
  const searchQuery = encodeURIComponent('latte coffee');
  const options = {
    hostname: 'commons.wikimedia.org',
    path: `/w/api.php?action=opensearch&search=${searchQuery}&namespace=6&limit=5&format=json`,
    headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
  };
  
  const data = await makeRequest(options);
  const parsed = JSON.parse(data.toString());
  console.log('Search results:', JSON.stringify(parsed, null, 2));
  
  // Now get image info for the first result
  const urls = parsed[3] || [];
  if (urls.length > 0) {
    const match = urls[0].match(/\/([^\/]+)$/);
    if (match) {
      const fileName = decodeURIComponent(match[1]);
      console.log('\nTrying to get image info for:', fileName);
      
      const encodedName = encodeURIComponent(fileName);
      const infoOptions = {
        hostname: 'commons.wikimedia.org',
        path: `/w/api.php?action=query&titles=${encodedName}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=500&format=json`,
        headers: { 'User-Agent': 'MenuPhotoDownloader/1.0' }
      };
      
      const infoData = await makeRequest(infoOptions);
      const infoParsed = JSON.parse(infoData.toString());
      console.log('Image info:', JSON.stringify(infoParsed, null, 2));
      
      const pages = infoParsed.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      const info = pages[pageId]?.imageinfo?.[0];
      if (info) {
        console.log('\nDirect URL:', info.url);
        console.log('Thumb URL:', info.thumburl);
        console.log('Mime:', info.mime);
        console.log('Size:', info.width, 'x', info.height);
      }
    }
  }
}

test().catch(console.error);
