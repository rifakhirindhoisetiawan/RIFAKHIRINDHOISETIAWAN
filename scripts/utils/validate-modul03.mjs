import fs from 'fs';

const html = fs.readFileSync('modul/ja-di.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.log('No script found');
  process.exit(1);
}

const script = scriptMatch[1];

try {
  new Function(script);
  console.log('JavaScript syntax is valid!');
} catch (e) {
  console.log('Syntax error:', e.message);
}

const menuCount = (script.match(/name:\s*"/g) || []).length;
console.log('Total menus:', menuCount);

if (script.includes('renderMenu();')) {
  console.log('renderMenu() is called');
} else {
  console.log('WARNING: renderMenu() is NOT called');
}

if (script.includes('loadMenuPhotos();')) {
  console.log('loadMenuPhotos() is called');
} else {
  console.log('WARNING: loadMenuPhotos() is NOT called');
}
