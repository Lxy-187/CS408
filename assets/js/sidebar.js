/* ==========================================================================
   sidebar.js —— 左侧知识树 + 右侧页内目录
   ========================================================================== */

(function (KM) {

  const $ = s => document.querySelector(s);

  /* ------------------------------ 知识树 ------------------------------ */
  function buildTree() {
    const root = $('#nav-tree');
    let h = '';

    KM.state.subjects.forEach(s => {
      h += '<div class="nav-subject">' + KM.esc(s.title) + '</div>';

      (s.chapters || []).forEach(c => {
        const topics = c.topics || [];
        const done = topics.filter(t => KM.hasPage(t.path)).length;

        h += '<details class="nav-chapter" data-chapter="' + s.id + '/' + c.id + '">';
        h += '<summary>' +
               '<span class="caret">▶</span>' +
               '<span class="ch-no">' + KM.esc(c.no || '') + '</span>' +
               '<span class="ch-name">' + KM.esc(c.title) + '</span>' +
               (done ? '<span class="ch-count">' + done + '</span>' : '') +
             '</summary>';

        h += '<div class="nav-topics">';
        topics.forEach(t => {
          const has = KM.hasPage(t.path);
          h += has
            ? '<a class="nav-topic" href="#/' + t.path + '" data-path="' + t.path + '">' +
                '<span class="dot"></span><span>' + KM.esc(t.title) + '</span></a>'
            : '<span class="nav-topic empty" title="还没有内容，跟 Claude 说一声就能填上">' +
                '<span class="dot"></span><span>' + KM.esc(t.title) + '</span></span>';
        });
        h += '</div></details>';
      });
    });

    root.innerHTML = h;

    const st = KM.stats();
    $('#stat-line').textContent =
      st.done + ' / ' + st.topics + ' 专题 · ' + st.examples + ' 道例题';
  }

  /* 高亮当前专题，并展开所属章节 */
  function highlight(path) {
    document.querySelectorAll('.nav-topic.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-chapter.has-active').forEach(el => el.classList.remove('has-active'));

    if (!path) return;
    const link = document.querySelector('.nav-topic[data-path="' + CSS.escape(path) + '"]');
    if (!link) return;

    link.classList.add('active');
    const det = link.closest('details.nav-chapter');
    if (det) { det.open = true; det.classList.add('has-active'); }

    // 保证选中项在可视区内
    const box = $('#nav-tree');
    const r = link.getBoundingClientRect(), br = box.getBoundingClientRect();
    if (r.top < br.top + 40 || r.bottom > br.bottom - 40) {
      link.scrollIntoView({ block: 'center' });
    }
  }

  function collapseAll() {
    document.querySelectorAll('details.nav-chapter').forEach(d => { d.open = false; });
  }

  /* ------------------------------ 页内目录 ------------------------------ */
  let tocObserver = null;

  function buildToc(page) {
    const box = document.getElementById('toc');
    if (!box) return;

    const items = page ? KM.outline(page) : [];
    if (items.length < 2) { box.innerHTML = ''; return; }

    box.innerHTML = '<div class="toc-title">本页目录</div>' +
      items.map(it =>
        '<a href="#" data-id="' + it.id + '" class="lv' + it.level + '" title="' +
        KM.esc(it.text) + '">' + KM.esc(it.text) + '</a>').join('');

    box.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const el = document.getElementById(a.dataset.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    spy(items);
  }

  /* 滚动高亮 */
  function spy(items) {
    if (tocObserver) tocObserver.disconnect();
    const links = new Map();
    document.querySelectorAll('#toc a').forEach(a => links.set(a.dataset.id, a));

    const seen = new Set();
    tocObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) seen.add(en.target.id); else seen.delete(en.target.id);
      });
      // 取文档序中第一个可见的
      const first = items.find(it => seen.has(it.id));
      links.forEach(a => a.classList.remove('active'));
      if (first && links.get(first.id)) links.get(first.id).classList.add('active');
    }, { rootMargin: '-70px 0px -65% 0px', threshold: 0 });

    items.forEach(it => {
      const el = document.getElementById(it.id);
      if (el) tocObserver.observe(el);
    });
  }

  KM.buildTree = buildTree;
  KM.highlightNav = highlight;
  KM.collapseAllNav = collapseAll;
  KM.buildToc = buildToc;

})(window.KM);
