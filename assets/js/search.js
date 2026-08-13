/* ==========================================================================
   search.js —— 全站搜索
   内容全部在内存里（所有 content/*.js 启动时就加载完），直接线性扫描即可，
   几百个专题的量级下比建索引更简单也够快。
   ========================================================================== */

(function (KM) {

  const $ = s => document.querySelector(s);
  let index = [];      // {path, title, sub, crumb, text, lower}
  let sel = -1;

  function build() {
    index = [];
    KM.state.pages.forEach(p => {
      const loc = KM.getLoc(p.path);
      const text = KM.pageText(p);
      index.push({
        path: p.path,
        title: p.title || (loc && loc.topic.title) || p.path,
        crumb: loc ? loc.subject.title + ' › ' + (loc.chapter.no ? loc.chapter.no + ' ' : '') + loc.chapter.title : '',
        text: text,
        lower: text.toLowerCase(),
      });
    });
  }

  /* 简单打分：标题命中 > 正文命中；多关键词全部命中才算 */
  function query(q) {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    const hits = [];
    for (const it of index) {
      const titleLower = it.title.toLowerCase();
      let score = 0, ok = true;
      for (const t of terms) {
        const inTitle = titleLower.includes(t);
        const at = it.lower.indexOf(t);
        if (!inTitle && at < 0) { ok = false; break; }
        if (inTitle) score += 20;
        if (at >= 0) score += 3 + Math.min(6, countOf(it.lower, t));
      }
      if (!ok) continue;
      hits.push({ item: it, score, snip: snippet(it, terms[0]) });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, 20);
  }

  function countOf(s, t) {
    let n = 0, i = 0;
    while ((i = s.indexOf(t, i)) >= 0) { n++; i += t.length; }
    return n;
  }

  function snippet(it, term) {
    const at = it.lower.indexOf(term);
    if (at < 0) return it.text.slice(0, 90);
    const from = Math.max(0, at - 34);
    let s = it.text.slice(from, from + 130).replace(/\n+/g, ' ');
    if (from > 0) s = '…' + s;
    return s;
  }

  function mark(text, terms) {
    let h = KM.esc(text);
    terms.forEach(t => {
      if (!t) return;
      const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      h = h.replace(re, '<mark>$1</mark>');
    });
    return h;
  }

  /* ------------------------------ 交互 ------------------------------ */
  function init() {
    const input = $('#search-input');
    const panel = $('#search-results');
    if (!input) return;

    const run = () => {
      const q = input.value.trim();
      if (!q) { panel.hidden = true; panel.innerHTML = ''; sel = -1; return; }

      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = query(q);
      sel = hits.length ? 0 : -1;

      panel.innerHTML = hits.length
        ? '<div class="sr-group-title">' + hits.length + ' 个结果</div>' +
          hits.map((h, i) =>
            '<a class="sr-item' + (i === 0 ? ' sel' : '') + '" href="#/' + h.item.path + '">' +
              '<div class="sr-item-title">' + mark(h.item.title, terms) + '</div>' +
              '<div class="sr-item-path">' + KM.esc(h.item.crumb) + '</div>' +
              '<div class="sr-item-snip">' + mark(h.snip, terms) + '</div>' +
            '</a>').join('')
        : '<div class="sr-empty">没有找到「' + KM.esc(q) + '」<br><small>试试更短的关键词，或者直接跟 Claude 说要补这块内容</small></div>';
      panel.hidden = false;
    };

    input.addEventListener('input', run);
    input.addEventListener('focus', () => { if (input.value.trim()) run(); });

    input.addEventListener('keydown', e => {
      const items = [...panel.querySelectorAll('.sr-item')];
      if (e.key === 'Escape') { input.blur(); panel.hidden = true; return; }
      if (!items.length) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        items[sel] && items[sel].classList.remove('sel');
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[sel].classList.add('sel');
        items[sel].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[sel]) { location.hash = items[sel].getAttribute('href'); close(); }
      }
    });

    const close = () => { panel.hidden = true; input.blur(); };
    panel.addEventListener('click', e => { if (e.target.closest('.sr-item')) close(); });
    document.addEventListener('click', e => {
      if (!e.target.closest('.search-wrap')) panel.hidden = true;
    });

    // 「/」快速聚焦
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus(); input.select();
      }
    });
  }

  KM.buildSearchIndex = build;
  KM.initSearch = init;

})(window.KM);
