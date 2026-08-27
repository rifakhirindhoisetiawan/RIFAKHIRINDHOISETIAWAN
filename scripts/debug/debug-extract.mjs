import fs from 'fs';

const html = fs.readFileSync('pages/item-espresso-hot.html', 'utf8');

// Test the extraction regex
const detailMatch = html.match(/<div class="detail-content">([\s\S]*?)<\/div>\s*<\/div>\s*<\/body>/);
console.log('detailMatch:', detailMatch ? 'YES' : 'NO');

if (detailMatch) {
  const detail = detailMatch[1];
  console.log('Detail content:');
  console.log(detail);
  console.log('\n---\n');
  
  const komposisiMatch = detail.match(/<h3>Komposisi.*?Takaran<\/h3>([\s\S]*?)(?=<h3>|<\/div>\s*<\/div>\s*<\/body>)/);
  console.log('komposisiMatch:', komposisiMatch ? 'YES' : 'NO');
  
  if (komposisiMatch) {
    const komposisiContent = komposisiMatch[1];
    console.log('Komposisi content:');
    console.log(JSON.stringify(komposisiContent));
    
    const items = komposisiContent.match(/<li><span>([\s\S]*?)<\/span>\s*<span class="amt">([\s\S]*?)<\/span><\/li>/g);
    console.log('items:', items);
  }
}
