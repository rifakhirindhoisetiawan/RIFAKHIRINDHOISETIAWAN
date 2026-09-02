import fs from 'fs';
let head = fs.readFileSync('C:\\Users\\T480S\\AppData\\Local\\Temp\\opencode\\head.html','utf8');
let fallback = fs.readFileSync('C:\\Users\\T480S\\AppData\\Local\\Temp\\opencode\\menus-array.js','utf8');
fallback = fallback.replace('const menus =', 'const fallbackMenus =');
const tail = `
    <script type="module">
      import { supabase } from '../js/supabase.js';
      ${fallback}
      let menus = [...fallbackMenus];
      let isSupabase = false;
      const menuGrid = document.getElementById('menuGrid');
      const searchInput = document.getElementById('searchInput');
      const statusEl = document.getElementById('status');
      function slugify(str) {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      function normalizeMenu(m) {
        let link = m.link || '';
        let cat = m.cat || '';
        if (!link && cat.endsWith('.html')) { link = cat; cat = ''; }
        if (cat && cat.includes('.html') && !link) { link = cat; cat = ''; }
        return { ...m, link, cat };
      }
      function renderMenu() {
        const q = (searchInput.value || '').trim().toLowerCase();
        const filtered = menus.map(normalizeMenu).filter(m => {
          if (!q) return true;
          return m.name.toLowerCase().includes(q) ||
                 (m.cat && m.cat.toLowerCase().includes(q)) ||
                 (m.plu && m.plu.toLowerCase().includes(q));
        });
        if (filtered.length === 0) {
          menuGrid.innerHTML = '<div class="empty-msg">Tidak ditemukan</div>';
          return;
        }
        menuGrid.innerHTML = filtered.map(m => {
          const slug = slugify(m.name);
          const hasLink = m.link && m.link.length > 0;
          const tag = hasLink ? 'a' : 'div';
          const href = hasLink ? ' href="' + m.link + '"' : '';
          const plu = m.plu ? '<span class="plu-tag">' + m.plu + '</span>' : '';
          return '<' + tag + ' class="item' + (hasLink ? ' active-modul' : '') + '"' + href + '>' +
                   '<div class="icon-tile ' + (m.cls||'g-a') + ' icon-photo" data-slug="' + slug + '"><span style="font-size:32px">' + (m.icon||'☕') + '</span></div>' +
                   '<span>' + m.name + plu + '</span>' +
                 '</' + tag + '>';
        }).join('');
        loadMenuPhotos();
      }
      function loadMenuPhotos() {
        const exts = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
        document.querySelectorAll('.icon-photo[data-slug]').forEach((tile) => {
          const slug = tile.dataset.slug;
          const folder = '../images/ja-di-photos/' + slug + '/';
          function tryNum(num) {
            if (num > 20) { tile.classList.remove('has-photo'); return; }
            function tryExt(extIdx) {
              if (extIdx >= exts.length) { tryNum(num + 1); return; }
              const url = folder + num + exts[extIdx];
              const img = new Image();
              img.onload = () => {
                tile.style.backgroundImage = 'url(' + url + ')';
                tile.classList.add('has-photo');
                tile.innerHTML = '';
              };
              img.onerror = () => tryExt(extIdx + 1);
              img.src = url;
            }
            tryExt(0);
          }
          tryNum(1);
        });
      }
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) loadMenuPhotos();
      });
      searchInput.addEventListener('input', renderMenu);
      async function loadFromSupabase() {
        statusEl.textContent = 'Memuat dari Supabase...';
        try {
          const { data, error } = await supabase.from('ja_di_menus').select('*').order('id', { ascending: true });
          if (error) throw error;
          if (data && data.length > 0) {
            menus = data;
            isSupabase = true;
            statusEl.textContent = '✅ ' + data.length + ' menu dari Supabase';
            statusEl.style.color = '#10b981';
          } else {
            statusEl.textContent = '⚠️ Supabase kosong, pakai data lokal';
            statusEl.style.color = '#f59e0b';
          }
        } catch (e) {
          console.warn('Supabase error, fallback:', e.message);
          statusEl.textContent = '⚠️ Offline (' + e.message.slice(0,40) + ')';
          statusEl.style.color = '#ef4444';
          menus = [...fallbackMenus];
        }
        renderMenu();
        setTimeout(() => { statusEl.textContent = isSupabase ? '✅ Live dari Supabase' : '📦 Data lokal'; statusEl.style.color = isSupabase ? '#10b981' : '#9aa0ab'; }, 3000);
      }
      try {
        supabase.channel('ja_di_menus_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'ja_di_menus' }, () => {
            console.log('Realtime change, reload...');
            loadFromSupabase();
          })
          .subscribe();
      } catch(e) { console.log('Realtime not enabled', e.message); }
      loadFromSupabase();
    </script>
  </body>
</html>
`;
// head already contains <!doctype html> ... up to before <script>, we need to inject status element
// head currently ends before <script>, we need to add status div inside .menu-wrap before .grid
// head contains: ... <div class="grid" id="menuGrid"></div>\n      </div>\n    </div>\n\n    <script>
// we inject status before grid
let fullHead = head.replace('<div class="grid" id="menuGrid"></div>', '<div id="status" style="font-size:11px;color:#9aa0ab;text-align:center;padding:6px 0 8px;font-weight:600"></div><div class="grid" id="menuGrid"></div>');
const full = fullHead + tail;
fs.writeFileSync('modul/ja-di.html', full, 'utf8');
console.log('wrote new ja-di.html length', full.length);
