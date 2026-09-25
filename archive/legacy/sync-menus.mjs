import fs from 'fs';
import path from 'path';

const txtPath = path.join(process.cwd(), 'data', 'ja-di-menus.txt');
const htmlPath = path.join(process.cwd(), 'modul', 'ja-di.html');

const txtLines = fs.readFileSync(txtPath, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l.length > 0);

let html = fs.readFileSync(htmlPath, 'utf8');

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
const arrayContent = html.substring(arrayStart, arrayEnd);
const afterArray = html.substring(arrayEnd);

const menuBlockRegex = /(\{\s*\n\s*name:\s*"[^"]*")([\s\S]*?)(\},\s*|\}\s*$)/g;

const menuBlocks = [];
let blockMatch;
while ((blockMatch = menuBlockRegex.exec(arrayContent)) !== null) {
  menuBlocks.push({
    prefix: blockMatch[1],
    middle: blockMatch[2],
    suffix: blockMatch[3]
  });
}

if (txtLines.length !== menuBlocks.length) {
  console.error(`Mismatch: text file has ${txtLines.length} menus, HTML has ${menuBlocks.length} menus`);
  process.exit(1);
}

const updatedBlocks = menuBlocks.map((block, idx) => {
  const newName = txtLines[idx];
  const newPrefix = block.prefix.replace(/name:\s*"[^"]*"/, `name: "${newName}"`);
  return newPrefix + block.middle + block.suffix;
});

const newArrayContent = updatedBlocks.join('\n        ');
const newHtml = beforeArray + '\n        ' + newArrayContent + '\n      ' + afterArray;

fs.writeFileSync(htmlPath, newHtml);
console.log(`Synced ${txtLines.length} menu names from ja-di-menus.txt to ja-di.html`);
