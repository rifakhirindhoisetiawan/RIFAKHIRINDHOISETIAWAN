import fs from 'fs';
let head = fs.readFileSync('C:\\Users\\T480S\\AppData\\Local\\Temp\\opencode\\daily-head.html','utf8');
// fallback periods from txt
const fallback = `const fallbackPeriods = [
        { name: "HARI", icon: "☀️", cls: "g-a", href: "../utility/hari.html", slug: "hari" },
        { name: "MINGGU", icon: "📅", cls: "g-b", href: "../utility/minggu.html", slug: "minggu" },
        { name: "BULAN", icon: "🌙", cls: "g-c", href: "../utility/bulan.html", slug: "bulan" }
      ];`;

const tail = `
    <script type="module">
      import { supabase } from '../js/supabase.js';
      ${fallback}
      let periods = [...fallbackPeriods];
      const homeGrid = document.getElementById("homeGrid");
      const searchInput = document.getElementById("searchInput");

      function renderGrid() {
        const q = searchInput.value.trim().toLowerCase();
        // normalize periods: support both {name,title} and {period,slug}
        const filtered = periods.filter((p) => {
          const name = (p.name || p.title || '').toLowerCase();
          return name.includes(q);
        });
        if (filtered.length === 0) {
          homeGrid.innerHTML = '<div class="empty-msg">Tidak ditemukan</div>';
          return;
        }
        homeGrid.innerHTML = filtered
          .map(
            (p) => {
              const name = p.name || p.title || '';
              const icon = p.icon || '📅';
              const cls = p.cls || 'g-a';
              const href = p.href || p.description || '#';
              const slug = p.slug || p.period || name.toLowerCase();
              return \`<a class="item active-modul" href="\${href}">
                <div class="icon-tile">
                  <img data-slug="\${slug}" src="../images/daily-task-photos/\${slug}/1.jpg" alt="\${name}" onerror="dtProbe(this)" />
                </div>
                <span>\${name}</span>
              </a>\`;
            }
          )
          .join("");
      }

      function dtProbe(img) {
        const slug = img.dataset.slug;
        const folder = '../images/daily-task-photos/' + slug + '/';
        const exts = ['.jpg', '.jpeg', '.webp', '.svg'];
        let i = 0;
        function next() {
          if (i >= exts.length) return;
          const url = folder + '1' + exts[i++];
          const t = new Image();
          t.onload = () => { img.src = url; };
          t.onerror = next;
          t.src = url;
        }
        next();
      }
      window.dtProbe = dtProbe;

      async function loadFromSupabase() {
        try {
          const { data, error } = await supabase.from('daily_tasks').select('*').order('id');
          if (error) throw error;
          if (data && data.length) {
            // map Supabase rows to periods format
            periods = data.map(r => ({
              name: r.title || r.name,
              icon: r.icon || fallbackPeriods.find(f=>f.slug===r.period)?.icon || '📅',
              cls: r.cls || fallbackPeriods.find(f=>f.slug===r.period)?.cls || 'g-a',
              href: r.href || r.description || '#',
              slug: r.slug || r.period
            }));
            console.log('daily_tasks from Supabase:', periods.length);
          }
        } catch(e) {
          console.warn('Supabase daily_tasks fallback', e.message);
        }
        renderGrid();
      }
      searchInput.addEventListener('input', renderGrid);
      loadFromSupabase();
      // realtime
      try {
        supabase.channel('daily_tasks_changes').on('postgres_changes',{event:'*',schema:'public',table:'daily_tasks'},()=>loadFromSupabase()).subscribe();
      } catch(e){}
      window.renderGrid = renderGrid;
    </script>
  </body>
</html>
`;
const full = head + tail;
fs.writeFileSync('modul/daily-task.html', full, 'utf8');
console.log('wrote daily-task.html', full.length);
