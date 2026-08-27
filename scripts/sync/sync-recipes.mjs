import fs from 'fs';
import path from 'path';

const recipesDir = 'recipes';
const pagesDir = 'pages';

const txtFiles = fs.readdirSync(recipesDir).filter(f => f.endsWith('.txt'));

for (const txtFile of txtFiles) {
  const txtPath = path.join(recipesDir, txtFile);
  const content = fs.readFileSync(txtPath, 'utf8');
  
  const htmlFile = txtFile.replace('.txt', '.html');
  const htmlPath = path.join(pagesDir, htmlFile);
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`HTML file not found: ${htmlPath}`);
    continue;
  }
  
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  const rawParts = content.split('---').map(p => p.trim()).filter(p => p.length > 0);
  
  if (rawParts.length < 2) {
    console.error(`Invalid format in ${txtFile}`);
    continue;
  }
  
  const headerPart = rawParts[1];
  const headerLines = headerPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let title = headerLines[0] || '';
  let tag = headerLines[1] || '';
  let plu = '';
  
  if (headerLines[2] && headerLines[2].startsWith('PLU:')) {
    plu = headerLines[2].replace('PLU:', '').trim();
  }
  
  const sections = [];
  let currentSection = null;
  
  for (let i = 2; i < rawParts.length; i++) {
    const part = rawParts[i];
    const lines = part.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    for (const line of lines) {
      if (line === 'Komposisi & Takaran' || line === 'Cara Pembuatan' || line === 'Catatan / SOP') {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { heading: line, items: [] };
      } else if (currentSection) {
        currentSection.items.push(line);
      }
    }
  }
  if (currentSection) {
    sections.push(currentSection);
  }
  
  let detailHTML = '';
  detailHTML += `    <h2>${title}</h2>\n`;
  detailHTML += `    <div class="tag">${tag}</div>\n`;
  
  if (plu) {
    detailHTML += `    <div class="plu-tag">PLU: ${plu}</div>\n`;
  }
  
  for (const section of sections) {
    if (section.heading === 'Komposisi & Takaran') {
      detailHTML += `    <h3>Komposisi &amp; Takaran</h3>`;
      
      const hasSizeBlocks = section.items.some(item => item.startsWith('[') && item.endsWith(']'));
      
      if (hasSizeBlocks) {
        const sizeBlocks = [];
        let currentBlock = null;
        
        for (const item of section.items) {
          if (item.startsWith('[') && item.endsWith(']')) {
            if (currentBlock) {
              sizeBlocks.push(currentBlock);
            }
            currentBlock = { title: item.slice(1, -1), items: [] };
          } else if (currentBlock && item.includes(' | ')) {
            const [bahan, jumlah] = item.split(' | ');
            currentBlock.items.push({ bahan: bahan.trim(), jumlah: jumlah.trim() });
          }
        }
        if (currentBlock) {
          sizeBlocks.push(currentBlock);
        }
        
        detailHTML += '\n';
        for (const block of sizeBlocks) {
          detailHTML += `    <div class="size-block">\n`;
          detailHTML += `      <div class="size-title">${block.title}</div>\n`;
          detailHTML += `      <ul class="comp-list">\n`;
          for (const item of block.items) {
            detailHTML += `        <li><span>${item.bahan}</span> <span class="amt">${item.jumlah}</span></li>\n`;
          }
          detailHTML += `      </ul>\n`;
          detailHTML += `    </div>\n`;
        }
      } else {
        detailHTML += '\n';
        detailHTML += `    <ul class="comp-list">\n`;
        for (const item of section.items) {
          if (item.includes(' | ')) {
            const [bahan, jumlah] = item.split(' | ');
            detailHTML += `      <li><span>${bahan.trim()}</span> <span class="amt">${jumlah.trim()}</span></li>\n`;
          }
        }
        detailHTML += `    </ul>\n`;
      }
    } else if (section.heading === 'Cara Pembuatan') {
      detailHTML += `    <h3>Cara Pembuatan</h3>\n`;
      const text = section.items.join('\n');
      detailHTML += `    <div class="cara-text">${text}</div>\n`;
    } else if (section.heading === 'Catatan / SOP') {
      detailHTML += `    <h3>Catatan / SOP</h3>\n`;
      const text = section.items.join('\n');
      detailHTML += `    <div class="note-text">${text}</div>\n`;
    }
  }
  
  // Find markers
  const startMarker = '<div class="detail-content">';
  const startIdx = html.indexOf(startMarker);
  
  if (startIdx === -1) {
    console.error(`Could not find detail-content in ${htmlFile}`);
    continue;
  }
  
  const bodyIdx = html.indexOf('</body>');
  
  if (bodyIdx === -1) {
    console.error(`Could not find </body> in ${htmlFile}`);
    continue;
  }
  
  // Build replacement - keep ONLY ONE </body>
  const before = html.substring(0, startIdx);
  const after = html.substring(bodyIdx + 7); // skip </body> and everything after
  
  const replacement = `<div class="detail-content">\n${detailHTML}  </div>\n  </div>\n</body>`;
  
  const newHtml = before + replacement + after;
  fs.writeFileSync(htmlPath, newHtml, 'utf8');
  console.log(`Synced: ${htmlFile}`);
}

console.log(`\nDone! Synced ${txtFiles.length} recipe files.`);
