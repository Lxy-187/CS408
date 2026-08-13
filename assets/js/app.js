/* ==========================================================================
   app.js —— 启动 / 内容加载 / 路由 / 页面渲染
   加载策略：manifest.js 里凡是带 file 字段的专题，都会被动态插入 <script> 加载。
   所以新增一个专题只要改 manifest.js + 新建内容文件，不用碰 index.html。
   （用 <script> 而不是 fetch，是为了双击 index.html 直接打开也能工作。）
   ========================================================================== */

(function (KM) {

  const $ = s => document.querySelector(s);

  // 站点名：改这一处即可（document.title 与首页大标题都取自这里）
  const SITE = '408 专业课';

  /* ------------------------------ 内容加载 ------------------------------ */
  function contentFiles() {
    const files = [];
    KM.state.subjects.forEach(s =>
      (s.chapters || []).forEach(c =>
        (c.topics || []).forEach(t => { if (t.file) files.push(t.file); })));
    return [...new Set(files)];
  }

  function loadScript(src) {
    return new Promise(resolve => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = () => resolve(true);
      el.onerror = () => { console.error('[KM] 内容文件加载失败：' + src); resolve(false); };
      document.head.appendChild(el);
    });
  }

  /* ------------------------------ 路由 ------------------------------ */
  /* 路由形如  #/学科/章/专题?at=块id
     ?at= 是块级深链，用来直接跳到某个定理 / 方法 / 例题，而不是页面开头 */
  function currentRoute() {
    const h = location.hash.replace(/^#\/?/, '');
    const i = h.indexOf('?');
    if (i < 0) return { path: h, at: '' };
    let at = '';
    try { at = new URLSearchParams(h.slice(i + 1)).get('at') || ''; } catch (e) { at = ''; }
    return { path: h.slice(0, i), at };
  }

  const currentPath = () => currentRoute().path;

  /* 跳到页内某一块，并闪一下 —— 落在页面中间时必须让人知道该看哪儿 */
  function jumpTo(id) {
    const el = document.getElementById(id);
    if (!el) {
      console.warn('[KM] 锚点不存在：' + id + '（页面 ' + KM.ctx.path + '）');
      window.scrollTo(0, 0);
      return;
    }
    // 目标若藏在折叠的解答里，先展开
    let p = el.closest('details');
    while (p) { p.open = true; p = p.parentElement && p.parentElement.closest('details'); }

    // 用 instant 而不是继承全局的 smooth：跨页深链的距离常有几千像素，
    // 平滑滚动要滚好几秒，还会和「闪烁提示」抢注意力
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    el.classList.remove('km-target');
    void el.offsetWidth;                      // 强制重排，让动画能重复触发
    el.classList.add('km-target');
    setTimeout(() => el.classList.remove('km-target'), 2600);
  }

  let lastPath = null;

  function route() {
    const { path, at } = currentRoute();
    const view = $('#view');

    // 同一页内跳锚点：不重新渲染，免得把已展开的解答又折回去
    if (path && path === lastPath && KM.hasPage(path)) {
      if (at) jumpTo(at); else window.scrollTo(0, 0);
      return;
    }
    lastPath = path;

    KM.resetSlugs();
    KM.resetExampleCounter();
    KM.ctx.path = path;

    if (!path) {
      view.innerHTML = renderHome();
      document.title = SITE + ' · 复习知识库';
      KM.highlightNav(null);
      KM.buildToc(null);
    } else {
      const page = KM.getPage(path);
      if (page) {
        view.innerHTML = renderPage(page);
        document.title = (page.title || path) + ' · ' + SITE;
        KM.highlightNav(path);
        KM.buildToc(page);
        bindPageTools();
        KM.mountTools(view);      // 交互工具要等 DOM 进文档之后才能挂
      } else {
        view.innerHTML = renderMissing(path);
        document.title = '待补充 · ' + SITE;
        KM.highlightNav(null);
        KM.buildToc(null);
      }
    }

    if (at) jumpTo(at); else window.scrollTo(0, 0);
    document.body.classList.remove('nav-open');
  }

  /* ------------------------------ 首页 ------------------------------ */
  function renderHome() {
    const st = KM.stats();

    let h = '<div class="home-hero">' +
      '<h1>' + SITE + ' · 复习知识库</h1>' +
      '<p>按知识树组织的题型、方法与个人思路。左侧选章节，或按 <code>/</code> 搜索。</p>' +
      '</div>';

    h += '<div class="stat-row">' +
      stat(st.done, '已整理专题') +
      stat(st.chapters, '章节') +
      stat(st.examples, '例题') +
      stat(st.topics - st.done, '待补充') +
      '</div>';

    const rec = KM.recent(6);
    if (rec.length) {
      h += '<h2 class="sec-title">最近更新</h2><div class="recent-list">';
      rec.forEach(p => {
        const loc = KM.getLoc(p.path);
        h += '<a class="recent-item" href="#/' + p.path + '">' +
               '<span class="r-title">' + KM.esc(p.title) + '</span>' +
               '<span class="r-path">' + (loc ? KM.esc(loc.chapter.title) : '') + '</span>' +
               '<span class="r-date">' + KM.esc(p.updated) + '</span>' +
             '</a>';
      });
      h += '</div>';
    }

    // 工具箱：能拨的东西比能读的东西好用，放在总览前面，随时能摸到
    const tools = (KM.allTools ? KM.allTools() : []).filter(t => t.path && KM.hasPage(t.path));
    if (tools.length) {
      h += '<h2 class="sec-title">工具箱</h2><div class="tool-cards">';
      tools.forEach(t => {
        h += '<a class="tool-card" href="#/' + t.path + '">' +
               '<span class="tc-icon">' + KM.esc(t.icon || '⚙') + '</span>' +
               '<span class="tc-text"><b>' + KM.esc(t.title) + '</b>' +
               (t.subtitle ? '<small>' + KM.esc(KM.stripMd(t.subtitle)) + '</small>' : '') +
               '</span></a>';
      });
      h += '</div>';
    }

    h += '<h2 class="sec-title">知识树总览</h2><div class="subject-grid">';
    KM.state.subjects.forEach(s => {
      const n = (s.chapters || []).reduce((a, c) =>
        a + (c.topics || []).filter(t => KM.hasPage(t.path)).length, 0);
      h += '<div class="subject-card"><h3>' + KM.esc(s.title) +
           '<small>' + n + ' 个专题</small></h3><ol>';
      (s.chapters || []).forEach(c => {
        const done = (c.topics || []).filter(t => KM.hasPage(t.path));
        const first = done[0];
        h += '<li>' + (first
              ? '<a href="#/' + first.path + '">' + KM.esc(c.title) + '</a>'
              : KM.esc(c.title)) +
             (done.length ? '<span class="n">· ' + done.length + '</span>' : '') +
             '</li>';
      });
      h += '</ol></div>';
    });
    h += '</div>';
    return h;
  }

  const stat = (n, label) => '<div class="stat"><b>' + n + '</b><span>' + label + '</span></div>';

  /* ------------------------------ 内容页 ------------------------------ */
  function renderPage(p) {
    const loc = KM.getLoc(p.path);

    let h = '<div class="page-head">';
    if (loc) {
      h += '<div class="crumb">' +
             '<a href="#/">首页</a><span class="sep">›</span>' +
             '<span>' + KM.esc(loc.subject.title) + '</span><span class="sep">›</span>' +
             '<span>' + (loc.chapter.no ? loc.chapter.no + ' ' : '') + KM.esc(loc.chapter.title) + '</span>' +
           '</div>';
    }
    h += '<h1 class="page-title">' + KM.esc(p.title) + '</h1>';
    // 副标题走行内 Markdown：常需要写公式（title 不行，它还要进 document.title）
    if (p.subtitle) h += '<p class="page-sub">' + KM.inlineMd(p.subtitle) + '</p>';

    h += '<div class="page-meta">';
    (p.tags || []).forEach(t => {
      const cls = /高频|必考|重点/.test(t) ? 'hot'
                : /大题|证明|解答题/.test(t) ? 'big'
                : /数一|数二|数三/.test(t) ? 'subject' : '';
      h += '<span class="tag ' + cls + '">' + KM.esc(t) + '</span>';
    });
    const nEx = p.blocks.filter(b => b.t === 'example').length;
    const nCard = p.blocks.filter(b => b.t === 'card').length;
    if (nEx) h += '<span class="tag"><span class="n">' + nEx + '</span> 例题</span>';
    if (nCard) h += '<span class="tag"><span class="n">' + nCard + '</span> 张错题卡</span>';
    if (p.updated) h += '<span class="meta-time">更新于 ' + KM.esc(p.updated) + '</span>';
    h += '</div></div>';

    if (nEx || nCard) {
      h += '<div class="page-tools">' +
             '<span>' + (nEx ? '本页有 ' + nEx + ' 道例题' : '本页有 ' + nCard + ' 张错题卡') +
             '，答案默认折叠便于自测：</span>' +
             '<button data-act="open">全部展开</button>' +
             '<button data-act="close">全部折叠</button>' +
           '</div>';
    }

    h += '<div class="page-body">';
    p.blocks.forEach((b, i) => { h += KM.renderBlock(b, i); });
    h += '</div>';

    const nb = KM.neighbors(p.path);
    if (nb.prev || nb.next) {
      h += '<nav class="page-nav">';
      h += nb.prev ? '<a class="prev" href="#/' + nb.prev.path + '"><small>← 上一篇</small><b>' +
                     KM.esc(nb.prev.title) + '</b></a>' : '<span style="flex:1"></span>';
      h += nb.next ? '<a class="next" href="#/' + nb.next.path + '"><small>下一篇 →</small><b>' +
                     KM.esc(nb.next.title) + '</b></a>' : '<span style="flex:1"></span>';
      h += '</nav>';
    }
    return h;
  }

  function renderMissing(path) {
    const loc = KM.getLoc(path);
    const title = loc ? loc.topic.title : path;
    return '<div class="empty-state">' +
      '<div class="big">∅</div>' +
      '<h2>' + KM.esc(title) + '</h2>' +
      '<p>这个专题还没有内容。</p>' +
      '<p>把你和 AI 的对话丢给 Claude，说一句<br>' +
      '「整理到 <code>' + KM.esc(path) + '</code>」，它会帮你归类、排版、写进这一页。</p>' +
      '<p><a href="#/">← 回首页</a></p></div>';
  }

  /* ------------------------------ 页内交互 ------------------------------ */
  function bindPageTools() {
    document.querySelectorAll('.page-tools button').forEach(btn => {
      btn.addEventListener('click', () => {
        const open = btn.dataset.act === 'open';
        document.querySelectorAll('#view details.fold').forEach(d => { d.open = open; });
      });
    });
  }

  function toggleAllFolds() {
    const folds = [...document.querySelectorAll('#view details.fold')];
    if (!folds.length) return;
    const anyClosed = folds.some(d => !d.open);
    folds.forEach(d => { d.open = anyClosed; });
  }

  /* ------------------------------ 主题 ------------------------------ */
  const THEMES = ['auto', 'light', 'dark'];

  // file:// 下部分环境会禁用 localStorage 并抛异常，不能让它拖垮启动
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 记不住就算了 */ } },
  };

  function initTheme() {
    document.documentElement.dataset.theme = store.get('km-theme') || 'auto';
    $('#btn-theme').addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme || 'auto';
      const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
      document.documentElement.dataset.theme = next;
      store.set('km-theme', next);
      $('#btn-theme').title = '主题：' + ({ auto: '跟随系统', light: '浅色', dark: '深色' })[next];
    });
  }

  /* ------------------------------ 启动 ------------------------------ */
  async function boot() {
    if (!KM.state.subjects.length) {
      console.error('[KM] 知识树为空，请检查 content/manifest.js');
    }

    await Promise.all(contentFiles().map(loadScript));

    KM.buildTree();
    KM.buildSearchIndex();
    KM.initSearch();
    initTheme();

    window.addEventListener('hashchange', route);
    route();

    // 顶栏按钮
    $('#btn-expand').addEventListener('click', toggleAllFolds);
    $('#btn-collapse-all').addEventListener('click', KM.collapseAllNav);
    $('#btn-menu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

    // 快捷键
    document.addEventListener('keydown', e => {
      if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      if (e.key === 'e') toggleAllFolds();
      if (e.key === '[') { const n = KM.neighbors(currentPath()); if (n.prev) location.hash = '#/' + n.prev.path; }
      if (e.key === ']') { const n = KM.neighbors(currentPath()); if (n.next) location.hash = '#/' + n.next.path; }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window.KM);
