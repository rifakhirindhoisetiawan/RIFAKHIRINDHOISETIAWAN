import fs from 'fs';
import path from 'path';

const pagesDir = 'pages';
const recipesDir = 'recipes';

fs.mkdirSync(recipesDir, { recursive: true });

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Find detail-content start
  const startMarker = '<div class="detail-content">';
  const startIdx = html.indexOf(startMarker);
  
  if (startIdx === -1) {
    console.log(`Skipping ${file}: no detail-content`);
    continue;
  }
  
  // Find </body> and work backwards to find the closing </div> pattern
  const bodyIdx = html.indexOf('</body>');
  if (bodyIdx === -1) {
    console.log(`Skipping ${file}: no </body>`);
    continue;
  }
  
  // Find the last occurrence of </div> before </body>
  const beforeBody = html.substring(0, bodyIdx);
  const lastDivIdx = beforeBody.lastIndexOf('</div>');
  
  if (lastDivIdx === -1) {
    console.log(`Skipping ${file}: no closing </div>`);
    continue;
  }
  
  // Extract detail content
  const detailContent = html.substring(startIdx + startMarker.length, lastDivIdx);
  
  // Extract title
  const titleMatch = detailContent.match(/<h2>([\s\S]*?)<\/h2>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Extract tag
  const tagMatch = detailContent.match(/<div class="tag">([\s\S]*?)<\/div>/);
  const tag = tagMatch ? tagMatch[1].trim() : '';
  
  const parts = [`pages/${file}`, '---', title, tag];
  
  // Extract Komposisi & Takaran - handle &amp; in HTML
  const komposisiMatch = detailContent.match(/<h3>Komposisi[^<]*Takaran<\/h3>([\s\S]*?)(?=<h3>|$)/);
  if (komposisiMatch) {
    const komposisiContent = komposisiMatch[1];
    parts.push('---');
    parts.push('Komposisi & Takaran');
    
    // Extract size blocks
    const sizeBlocks = komposisiContent.match(/<div class="size-block">([\s\S]*?)<\/div><\/div>/g);
    if (sizeBlocks) {
      for (const block of sizeBlocks) {
        const sizeTitleMatch = block.match(/<div class="size-title">([\s\S]*?)<\/div>/);
        if (sizeTitleMatch) {
          parts.push(`[${sizeTitleMatch[1].trim()}]`);
        }
        const items = block.match(/<li><span>([\s\S]*?)<\/span>\s*<span class="amt">([\s\S]*?)<\/span><\/li>/g);
        if (items) {
          for (const item of items) {
            const itemMatch = item.match(/<span>([\s\S]*?)<\/span>\s*<span class="amt">([\s\S]*?)<\/span>/);
            if (itemMatch) {
              parts.push(`${itemMatch[1].trim()} | ${itemMatch[2].trim()}`);
            }
          }
        }
      }
    } else {
      // Extract regular list items
      const items = komposisiContent.match(/<li><span>([\s\S]*?)<\/span>\s*<span class="amt">([\s\S]*?)<\/span><\/li>/g);
      if (items) {
        for (const item of items) {
          const itemMatch = item.match(/<span>([\s\S]*?)<\/span>\s*<span class="amt">([\s\S]*?)<\/span>/);
          if (itemMatch) {
            parts.push(`${itemMatch[1].trim()} | ${itemMatch[2].trim()}`);
          }
        }
      }
    }
  }
  
  // Extract Cara Pembuatan
  const caraMatch = detailContent.match(/<h3>Cara Pembuatan<\/h3>\s*<div class="cara-text">([\s\S]*?)<\/div>/);
  if (caraMatch) {
    const caraText = caraMatch[1].trim();
    parts.push('---');
    parts.push('Cara Pembuatan');
    parts.push(caraText);
  }
  
  // Extract Catatan / SOP
  const noteMatch = detailContent.match(/<h3>Catatan.*?SOP<\/h3>\s*<div class="note-text">([\s\S]*?)<\/div>/);
  if (noteMatch) {
    const noteText = noteMatch[1].trim();
    parts.push('---');
    parts.push('Catatan / SOP');
    parts.push(noteText);
  }
  
  const output = parts.join('\n');
  const outFile = path.join(recipesDir, file.replace('.html', '.txt'));
  fs.writeFileSync(outFile, output, 'utf8');
}

console.log(`Extracted recipes from ${files.length} files to ${recipesDir}/`);
