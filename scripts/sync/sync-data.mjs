import fs from 'fs';
import path from 'path';

const txtPath = path.join(process.cwd(), 'data', 'ja-di-data.txt');
const htmlPath = path.join(process.cwd(), 'modul', 'ja-di.html');

// Parse text file
const txtContent = fs.readFileSync(txtPath, 'utf8');
const menuBlocks = txtContent.split('---').map(b => b.trim()).filter(b => b.length > 0);

const menus = menuBlocks.map(block => {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return {
    name: lines[0] || '',
    icon: lines[1] || '',
    cls: lines[2] || '',
    cat: lines[3] || '',
    link: lines[4] || '',
    plu: lines[5] || ''
  };
});

let html = fs.readFileSync(htmlPath, 'utf8');

// Find the menus array
const startMarker = 'const menus = [';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not find menus array in HTML');
  process.exit(1);
}

const arrayStart = startIdx + startMarker.length;
let braceDepth = 0;
let i = arrayStart;

while (i < html.length) {
  if (html[i] === '[' || html[i] === '{') braceDepth++;
  else if (html[i] === ']' || html[i] === '}') braceDepth--;
  
  if (braceDepth === 0 && html[i] === ']') {
    break;
  }
  i++;
}

const arrayEnd = i;
const beforeArray = html.substring(0, startIdx + startMarker.length);
const afterArray = html.substring(arrayEnd);

// Use regex to find all menu objects
const menuObjectRegex = /\{\s*name:\s*"[^"]*"[\s\S]*?\},\s*|\{\s*name:\s*"[^"]*"[\s\S]*?\}\s*$/g;
const arrayContent = html.substring(arrayStart, arrayEnd);
const menuObjects = [];
let match;
while ((match = menuObjectRegex.exec(arrayContent)) !== null) {
  menuObjects.push(match[0]);
}

if (menus.length !== menuObjects.length) {
  console.error(`Mismatch: text file has ${menus.length} menus, HTML has ${menuObjects.length} menus`);
  console.error('First few HTML menu names:');
  for (let idx = 0; idx < Math.min(5, menuObjects.length); idx++) {
    const nameMatch = menuObjects[idx].match(/name:\s*"([^"]*)"/);
    console.error(`  ${idx}: ${nameMatch ? nameMatch[1] : 'unknown'}`);
  }
  process.exit(1);
}

// Replace each menu object with updated values
const updatedObjects = menuObjects.map((obj, idx) => {
  const updated = menus[idx];
  
  // Extract the base structure (everything except the values)
  // and replace values
  let newObj = obj;
  
  // Replace each property value
  newObj = newObj.replace(/name:\s*"[^"]*"/, `name: "${updated.name}"`);
  newObj = newObj.replace(/icon:\s*"[^"]*"/, `icon: "${updated.icon}"`);
  newObj = newObj.replace(/cls:\s*"[^"]*"/, `cls: "${updated.cls}"`);
  
  // Handle optional properties carefully
  if (updated.cat) {
    if (!newObj.includes('cat:')) {
      // Add cat property after cls
      newObj = newObj.replace(/(cls:\s*"[^"]*"),/, `$1,\n          cat: "${updated.cat}",`);
    } else {
      newObj = newObj.replace(/cat:\s*"[^"]*"/, `cat: "${updated.cat}"`);
    }
  } else {
    // Remove cat property if it exists
    newObj = newObj.replace(/\s*,\s*cat:\s*"[^"]*"/, '');
  }
  
  newObj = newObj.replace(/link:\s*"[^"]*"/, `link: "${updated.link}"`);
  
  if (updated.plu) {
    if (!newObj.includes('plu:')) {
      // Add plu property after link
      newObj = newObj.replace(/(link:\s*"[^"]*"),/, `$1,\n          plu: "${updated.plu}",`);
    } else {
      newObj = newObj.replace(/plu:\s*"[^"]*"/, `plu: "${updated.plu}"`);
    }
  } else {
    // Remove plu property if it exists
    newObj = newObj.replace(/\s*,\s*plu:\s*"[^"]*"/, '');
  }
  
  return newObj;
});

const newArrayContent = updatedObjects.join('\n        ');
const finalHtml = beforeArray + '\n        ' + newArrayContent + afterArray;

fs.writeFileSync(htmlPath, finalHtml);
console.log(`Synced ${menus.length} menus from ja-di-data.txt to ja-di.html`);
