// js/item-bahan.js - SATU halaman resep = SEMUA varian (manual/premix/hot/ice/12oz/16oz) dalam satu tabel
// Gaya kartu ala DR.COFFEE. Ringan: fetch langsung (tanpa supabase-js) + cache localStorage 10 menit
import { SUPABASE_URL, SUPABASE_KEY } from './sb-config.js';

const COLS = 'id,name,link,cat,plu_12oz,plu_16oz,plu_hot,bahan_12oz_1,bahan_12oz_2,bahan_12oz_3,bahan_12oz_4,bahan_12oz_5,bahan_12oz_6,bahan_16oz_1,bahan_16oz_2,bahan_16oz_3,bahan_16oz_4,bahan_16oz_5,bahan_16oz_6,bahan_hot_1,bahan_hot_2,bahan_hot_3,bahan_hot_4,bahan_hot_5,bahan_hot_6,catatan';

const DR_CSS = '.dr-recipe{margin:12px 0 0;padding:10px 12px;background:#fff;border-radius:8px;border:1px solid #bbdefb;font-family:"Segoe UI",system-ui,-apple-system,sans-serif}'
  + '.dr-tag{display:inline-block;background:#1565c0;color:#fff;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}'
  + '.dr-sizes{display:grid;grid-template-columns:1fr;gap:8px}'
  + '.dr-size{background:#fff;border-radius:8px;border:1px solid #bbdefb;overflow:hidden}'
  + '.dr-size h4{font-size:0.8rem;color:#fff;background:#1565c0;padding:6px 12px;margin:0;text-transform:uppercase;letter-spacing:0.5px}'
  + '.dr-size ul{list-style:none;font-size:0.82rem;line-height:1.5;margin:0;padding:2px 0}'
  + '.dr-size li{display:flex;align-items:center;gap:10px;border-bottom:1px solid #e3f2fd;padding:4px 12px;color:#0d2847}'
  + '.dr-size li:last-child{border-bottom:none}'
  + '.dr-num{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:#e3f2fd;color:#1565c0;font-size:0.68rem;font-weight:800;display:inline-flex;align-items:center;justify-content:center}'
  + '.dr-method{font-size:0.8rem;background:#e3f2fd;border:1px dashed #1e88e5;padding:6px 10px;border-radius:6px;margin-top:8px;line-height:1.45;color:#0d2847}'
  + '.dr-amt{font-weight:600;color:#1565c0;white-space:nowrap}'
  + '.dr-variant{font-size:0.82rem;font-weight:800;color:#0d2847;margin:10px 0 6px;letter-spacing:0.3px}'
  + '.dr-variant:first-of-type{margin-top:0}'
  + '.dr-vplu{font-weight:600;color:#1565c0;font-size:0.72rem;margin-left:8px;letter-spacing:0}';

function ensureDrStyle() {
  if (document.getElementById('dr-style')) return;
  const st = document.createElement('style');
  st.id = 'dr-style';
  st.textContent = DR_CSS;
  document.head.appendChild(st);
}

function cleanTitle(t) {
  return (t || '').replace(/\(.*?\)/g, ' ').replace(/\b(HOT|ICE|MANUAL|PREMIX|12OZ|16OZ|UPSIZE|REGULAR)\b/gi, ' ').replace(/\s+/g, ' ').trim();
}

function styleTitle(box) {
  const h2 = box.querySelector('h2');
  if (h2 && !h2.hasAttribute('data-admin-h')) {
    h2.setAttribute('data-admin-h', '1');
    const ct = cleanTitle(h2.textContent);
    if (ct) h2.textContent = ct;
    h2.style.color = '#0d2847';
    h2.style.fontSize = '1.35rem';
    h2.style.fontWeight = '700';
    h2.style.borderBottom = '2px solid #1565c0';
    h2.style.paddingBottom = '10px';
    h2.style.marginBottom = '14px';
  }
}

function baseName(n) {
  return (n || '').toUpperCase().replace(/\(.*?\)/g, ' ').replace(/\b(HOT|ICE|MANUAL|PREMIX|12OZ|16OZ|UPSIZE|REGULAR)\b/g, ' ').replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function variantLabel(name, base, cat) {
  const bw = new Set(base.split(' '));
  const rest = name.toUpperCase().replace(/[^A-Z0-9() ]/g, ' ').split(/\s+/).filter(w => w && !bw.has(w)).join(' ').replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  return rest || (cat || '').trim() || 'Lainnya';
}

function sizeBlock(title, list) {
  const size = document.createElement('div');
  size.className = 'dr-size';
  const h = document.createElement('h4');
  h.textContent = title;
  const ul = document.createElement('ul');
  list.forEach((b, i) => {
    const li = document.createElement('li');
    const num = document.createElement('span');
    num.className = 'dr-num';
    num.textContent = String(i + 1);
    const s = document.createElement('span');
    s.textContent = b;
    li.appendChild(num);
    li.appendChild(s);
    ul.appendChild(li);
  });
  size.appendChild(h);
  size.appendChild(ul);
  return size;
}

function renderBahan(box, self, all) {
  if (!self) return;
  styleTitle(box);
  const tagEl = box.querySelector('.tag');
  if (tagEl) tagEl.style.display = 'none';

  // pil PLU milik halaman ini, di bawah judul
  const pluBadges = [];
  if (self.plu_12oz) pluBadges.push('12OZ: ' + self.plu_12oz);
  if (self.plu_16oz) pluBadges.push('16OZ: ' + self.plu_16oz);
  if (self.plu_hot) pluBadges.push('HOT: ' + self.plu_hot);
  let pluTag = box.querySelector('.plu-tag:not([data-admin-plu])');
  if (!pluTag && pluBadges.length) {
    pluTag = document.createElement('span');
    pluTag.className = 'plu-tag';
    const h2ref = box.querySelector('h2');
    if (h2ref && h2ref.nextSibling) h2ref.parentNode.insertBefore(pluTag, h2ref.nextSibling);
    else box.prepend(pluTag);
  }
  if (pluTag && pluBadges.length) {
    pluTag.style.display = '';
    pluTag.style.marginLeft = '0';
    pluTag.style.marginRight = '8px';
    pluTag.textContent = pluBadges[0];
    let next = pluTag.nextElementSibling;
    while (next && next.classList && next.classList.contains('plu-tag') && next.hasAttribute('data-admin-plu')) {
      const rm = next;
      next = next.nextElementSibling;
      rm.remove();
    }
    for (let i = 1; i < pluBadges.length; i++) {
      const s = document.createElement('span');
      s.className = 'plu-tag';
      s.setAttribute('data-admin-plu', '1');
      s.textContent = pluBadges[i];
      pluTag.after(s);
    }
    box.querySelectorAll('.plu-tag').forEach(t => {
      t.style.background = '#1565c0';
      t.style.color = '#ffffff';
      t.style.borderRadius = '4px';
      t.style.marginLeft = '0';
      t.style.marginRight = '8px';
    });
  }

  // kartu gabungan semua varian se-nama
  const base = baseName(self.name);
  const family = all.filter(r => baseName(r.name) === base);
  const variants = family.map(r => ({
    row: r,
    label: variantLabel(r.name, base, r.cat),
    b12: [1, 2, 3, 4, 5, 6].map(i => r['bahan_12oz_' + i]).filter(Boolean),
    b16: [1, 2, 3, 4, 5, 6].map(i => r['bahan_16oz_' + i]).filter(Boolean),
    bHot: [1, 2, 3, 4, 5, 6].map(i => r['bahan_hot_' + i]).filter(Boolean),
    note: (r.catatan || '').trim()
  })).filter(v => v.b12.length || v.b16.length || v.bHot.length || v.note);
  variants.sort((a, b) => (a.row.id === self.id ? -1 : b.row.id === self.id ? 1 : a.row.id - b.row.id));
  if (!variants.length) return;
  const showLabels = variants.length > 1;
  ensureDrStyle();

  const card = document.createElement('div');
  card.className = 'dr-recipe';
  card.setAttribute('data-admin-bahan', '1');
  const tag = document.createElement('span');
  tag.className = 'dr-tag';
  tag.textContent = 'Bahan';
  card.appendChild(tag);

  const shownNotes = new Set();
  variants.forEach(v => {
    if (showLabels) {
      const vh = document.createElement('div');
      vh.className = 'dr-variant';
      vh.textContent = v.label;
      const pluParts = [];
      if (v.row.plu_12oz) pluParts.push('12OZ ' + v.row.plu_12oz);
      if (v.row.plu_16oz) pluParts.push('16OZ ' + v.row.plu_16oz);
      if (v.row.plu_hot) pluParts.push('HOT ' + v.row.plu_hot);
      if (pluParts.length) {
        const ps = document.createElement('span');
        ps.className = 'dr-vplu';
        ps.textContent = 'PLU ' + pluParts.join(' • ');
        vh.appendChild(ps);
      }
      card.appendChild(vh);
    }
    if (v.bHot.length) card.appendChild(sizeBlock('Hot', v.bHot));
    if (v.b12.length || v.b16.length) {
      const grid = document.createElement('div');
      grid.className = 'dr-sizes';
      if (v.b12.length) grid.appendChild(sizeBlock('Regular (12OZ)', v.b12));
      if (v.b16.length) grid.appendChild(sizeBlock('Upsize (16OZ)', v.b16));
      card.appendChild(grid);
    }
    if (v.note && !shownNotes.has(v.note)) {
      shownNotes.add(v.note);
      const note = document.createElement('div');
      note.className = 'dr-method';
      note.textContent = v.note;
      card.appendChild(note);
    }
  });

  const old = box.querySelector('[data-admin-bahan]');
  if (old) old.replaceWith(card);
  else box.appendChild(card);
}

(async () => {
  try {
    const file = (location.pathname.split('/').pop() || '').split('?')[0];
    if (!file) return;
    const box = document.querySelector('.detail-content');
    if (!box) return;
    const cacheKey = 'bahan_all2';
    const headers = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };

    function pickSelf(all) {
      let self = all.find(r => (r.link || '').endsWith(file));
      if (!self) {
        const h2 = (box.querySelector('h2') || {}).textContent;
        const t = (h2 || '').trim().toUpperCase();
        if (t) self = all.find(r => (r.name || '').trim().toUpperCase() === t);
      }
      if (!self) {
        // halaman yang barisnya sudah digabung: cocokkan nama dasar
        const h2 = (box.querySelector('h2') || {}).textContent;
        const t = baseName(h2 || '');
        if (t) self = all.find(r => baseName(r.name || '') === t);
      }
      return self || null;
    }

    async function getAll() {
      const r = await fetch(SUPABASE_URL + '/rest/v1/ja_di_menus?select=' + COLS + '&order=id', { headers });
      if (!r.ok) throw new Error('fetch gagal');
      return r.json();
    }

    // 1. tampilkan cache dulu (instan)
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now() - cached.t < 10 * 60 * 1000 && Array.isArray(cached.all)) {
        renderBahan(box, pickSelf(cached.all), cached.all);
      }
    } catch (e) {}

    // 2. data fresh di belakang layar
    try {
      const fresh = await getAll();
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), all: fresh }));
      } catch (e) {}
      renderBahan(box, pickSelf(fresh), fresh);
    } catch (e) {
      console.warn('item-bahan:', e.message);
    }
  } catch (e) {
    console.warn('item-bahan:', e.message);
  }
})();
