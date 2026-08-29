import fs from 'fs';
import path from 'path';

const txtPath = path.join(process.cwd(), 'data', 'daily-task-periods.txt');
const htmlPath = path.join(process.cwd(), 'modul', 'daily-task.html');

const txtContent = fs.readFileSync(txtPath, 'utf8');
const periodBlocks = txtContent.split('---').map(b => b.trim()).filter(b => b.length > 0);

const periods = periodBlocks.map(block => {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return {
    name: lines[0] || '',
    icon: lines[1] || '',
    cls: lines[2] || '',
    href: lines[3] || '',
    slug: lines[4] || ''
  };
});

let html = fs.readFileSync(htmlPath, 'utf8');

// Build the complete new script tag content
const newPeriodsArray = periods.map((p, idx) => {
  const comma = idx < periods.length - 1 ? ',' : '';
  return '        { name: "' + p.name + '", icon: "' + p.icon + '", cls: "' + p.cls + '", href: "' + p.href + '", slug: "' + p.slug + '" }' + comma;
}).join('\n');

const newScriptContent = 
  '      const periods = [\n' +
  newPeriodsArray + '\n' +
  '      ];\n\n' +
  '      const homeGrid = document.getElementById("homeGrid");\n' +
  '      const searchInput = document.getElementById("searchInput");\n\n' +
  '      function renderGrid() {\n' +
  '        const q = searchInput.value.trim().toLowerCase();\n' +
  '        const filtered = periods.filter((p) => p.name.toLowerCase().includes(q));\n\n' +
  '        if (filtered.length === 0) {\n' +
  '          homeGrid.innerHTML =\n' +
  '            \'<div class="empty-msg">Tidak ditemukan</div>\';\n' +
  '          return;\n' +
  '        }\n\n' +
  '        homeGrid.innerHTML = filtered\n' +
  '          .map(\n' +
  '            (p) => `\n' +
  '              <a class="item active-modul" href="${p.href}">\n' +
  '                <div class="icon-tile">\n' +
  '                  <img data-slug="${p.slug}" src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E" alt="${p.name}" />\n' +
  '                </div>\n' +
  '                <span>${p.name}</span>\n' +
  '              </a>\n' +
  '            `,\n' +
  '          )\n' +
  '          .join("");\n\n' +
  '        loadPeriodPhotos();\n' +
  '      }\n\n' +
  '      function loadPeriodPhotos() {\n' +
  '        const folders = {\n' +
  '          hari: \'../images/daily-task-photos/hari/\',\n' +
  '          minggu: \'../images/daily-task-photos/minggu/\',\n' +
  '          bulan: \'../images/daily-task-photos/bulan/\',\n' +
  '        };\n' +
  '        const exts = [\'.jpg\', \'.jpeg\', \'.png\', \'.svg\', \'.webp\'];\n\n' +
  '        document.querySelectorAll(\'img[data-slug]\').forEach((img) => {\n' +
  '          const slug = img.dataset.slug;\n' +
  '          const folder = folders[slug];\n' +
  '          if (!folder) return;\n\n' +
  '          let num = 0;\n' +
  '          function tryNext() {\n' +
  '            num++;\n' +
  '            if (num > 20) return;\n' +
  '            let extIdx = 0;\n' +
  '            function tryExt() {\n' +
  '              if (extIdx >= exts.length) { tryNext(); return; }\n' +
  '              const url = folder + num + exts[extIdx];\n' +
  '              const temp = new Image();\n' +
  '              temp.onload = () => { img.src = url; };\n' +
  '              temp.onerror = () => { extIdx++; tryExt(); };\n' +
  '              temp.src = url;\n' +
  '            }\n' +
  '            tryExt();\n' +
  '          }\n' +
  '          tryNext();\n' +
  '        });\n' +
  '      }\n\n' +
  '      document.addEventListener(\'visibilitychange\', () => {\n' +
  '        if (!document.hidden) {\n' +
  '          loadPeriodPhotos();\n' +
  '        }\n' +
  '      });\n\n' +
  '      renderGrid();';

// Find and replace the entire script tag
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Could not find script tags in HTML');
  process.exit(1);
}

const beforeScript = html.substring(0, scriptStart);
const afterScript = html.substring(scriptEnd + '</script>'.length);

const newHtml = beforeScript + '<script>\n' + newScriptContent + '\n    </script>' + afterScript;

fs.writeFileSync(htmlPath, newHtml);
console.log(`Synced ${periods.length} periods from daily-task-periods.txt to daily-task.html`);
