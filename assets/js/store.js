/* ==========================================================================
   store.js —— 数据层
   知识树（manifest.js 定义）+ 内容页（content/**.js 注册）
   两者通过 path = "学科/章/专题" 关联。
   ========================================================================== */

window.KM = (function () {

  const state = {
    subjects: [],          // 知识树
    pages: new Map(),      // path -> page 对象
    flatTopics: [],        // 扁平化的专题列表（按树的顺序），用于上一页/下一页
    chapterOf: new Map(),  // path -> {subject, chapter, topic}
  };

  // 当前正在渲染的页面路径。markdown.js / blocks.js 生成锚点链接时要用，
  // 因为深链形如 #/<path>?at=<id>，必须带上所属页面。
  const ctx = { path: '' };

  /* ------------------------------ 定义知识树 ------------------------------ */
  function tree(subjects) {
    state.subjects = subjects;
    state.flatTopics.length = 0;
    state.chapterOf.clear();

    subjects.forEach(s => {
      (s.chapters || []).forEach(c => {
        c.subject = s;
        (c.topics || []).forEach(t => {
          t.path = `${s.id}/${c.id}/${t.id}`;
          t.subject = s;
          t.chapter = c;
          state.chapterOf.set(t.path, { subject: s, chapter: c, topic: t });
          state.flatTopics.push(t);
        });
      });
    });
  }

  /* ------------------------------ 注册内容页 ------------------------------ */
  function page(p) {
    if (!p || !p.path) { console.error('[KM] 内容页缺少 path 字段', p); return; }
    if (state.pages.has(p.path)) console.warn('[KM] 重复注册的内容页：' + p.path);
    p.blocks = p.blocks || [];
    state.pages.set(p.path, p);
  }

  /* ------------------------------ 查询 ------------------------------ */
  const getPage   = path => state.pages.get(path) || null;
  const getLoc    = path => state.chapterOf.get(path) || null;
  const hasPage   = path => state.pages.has(path);

  function neighbors(path) {
    // 只在「已有内容」的专题之间跳转，跳过占位条目
    const list = state.flatTopics.filter(t => state.pages.has(t.path));
    const i = list.findIndex(t => t.path === path);
    return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
  }

  function stats() {
    let topics = 0, done = 0, examples = 0;
    state.flatTopics.forEach(t => {
      topics++;
      const p = state.pages.get(t.path);
      if (p) {
        done++;
        examples += p.blocks.filter(b => b.t === 'example').length;
      }
    });
    return { topics, done, examples, chapters: state.subjects.reduce((n, s) => n + (s.chapters || []).length, 0) };
  }

  /* ------------------------------ 错题卡汇总 ------------------------------
     card 块可以写在任何页面里（一般写在 review/ 下）。
     这里把全站的卡片收集起来按日期倒序，供「按时间复习」的汇总页用。 */
  function allCards() {
    const out = [];
    state.pages.forEach(p => {
      (p.blocks || []).forEach(b => {
        if (b.t !== 'card') return;
        if (!b.id) console.warn('[KM] 错题卡缺少 id，汇总页链不过去：', p.path, b.q);
        out.push(Object.assign({}, b, { page: p.path, pageTitle: p.title }));
      });
    });
    return out.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  }

  function recent(n) {
    return [...state.pages.values()]
      .filter(p => p.updated)
      .sort((a, b) => String(b.updated).localeCompare(String(a.updated)))
      .slice(0, n || 8);
  }

  /* --------------------- 把块内容抽成纯文本（供搜索用） --------------------- */
  function blockText(b) {
    const parts = [];
    const push = v => { if (typeof v === 'string') parts.push(v); };
    push(b.title); push(b.c); push(b.problem); push(b.idea);
    push(b.solution); push(b.comment); push(b.source);
    (b.items || []).forEach(it => { push(it.title); push(it.c); push(it); });
    (b.rows || []).forEach(r => (r || []).forEach(push));
    (b.cols || []).forEach(push);
    return parts.join('\n');
  }

  function pageText(p) {
    return [p.title, p.subtitle, (p.tags || []).join(' '),
            ...p.blocks.map(blockText)].filter(Boolean).join('\n');
  }

  /* ------------------------------ 深链自检 ------------------------------ */
  /* 在浏览器控制台跑 KM.audit()，检查全站锚点：
     - 有没有链到不存在的页面 / 不存在的锚点
     - 同一页里有没有重复 id
     新增或改动内容后跑一次，比肉眼查可靠。 */
  function audit() {
    const ids = new Map();   // path -> Set(id)
    const links = [];        // {from, to, at}
    const box = document.createElement('div');

    state.pages.forEach(p => {
      KM.resetSlugs();
      KM.resetExampleCounter();
      ctx.path = p.path;
      box.innerHTML = p.blocks.map((b, i) => KM.renderBlock(b, i)).join('');

      const set = new Set(), dup = [];
      box.querySelectorAll('[id]').forEach(el => {
        if (set.has(el.id)) dup.push(el.id);
        set.add(el.id);
      });
      ids.set(p.path, set);
      if (dup.length) console.warn('[KM audit] ' + p.path + ' 重复 id：', dup);

      box.querySelectorAll('a[href^="#/"]').forEach(a => {
        const [to, qs] = a.getAttribute('href').slice(2).split('?');
        const at = qs ? new URLSearchParams(qs).get('at') : null;
        if (a.classList.contains('anchor') || a.classList.contains('block-anchor')) return;
        links.push({ from: p.path, to, at });
      });
    });
    ctx.path = '';

    const broken = links.filter(l =>
      !state.pages.has(l.to) || (l.at && !ids.get(l.to).has(l.at)));

    console.log('[KM audit] 共 ' + links.length + ' 条页间链接，' +
                (broken.length ? broken.length + ' 条有问题：' : '全部有效'));
    broken.forEach(l => console.error('  ✗ ' + l.from + ' → ' + l.to + (l.at ? '?at=' + l.at : '')));
    return { total: links.length, broken };
  }

  return {
    state, ctx, tree, page,
    getPage, getLoc, hasPage, neighbors, stats, recent, allCards,
    blockText, pageText, audit,
  };
})();
