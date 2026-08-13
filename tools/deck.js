/* ==========================================================================
   工具 / 卡片练习（错题本的翻面模式）
   —— 数据来源是全站的 card 块（KM.allCards()），这里只管「怎么练」：
      一次只显示一张，点一下翻面看答案，左右切换，掌握了就标记掉。
      「掌握」记在 localStorage 里，换页面 / 关浏览器都还在。
   ========================================================================== */

KM.tool({
  id: 'deck',
  title: '错题卡片练习',
  subtitle: '一张一张翻，点击卡片看答案',
  icon: '🗂',
  path: 'review/index/deck',

  mount(root) {

    /* ---------------------- 掌握状态（本地存储） ---------------------- */
    const KEY = 'km-deck-known';
    const store = {
      get() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } },
      set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* 记不住就算了 */ } },
    };
    let known = store.get();

    const SUBJECTS = { co: '组成原理', ds: '数据结构', os: '操作系统', net: '计算机网络' };

    /* 卡片属于哪一科：优先看它所在的错题本章节（review/<科目>/…），
       其次看它链去的知识点（<科目>/…） */
    function subjectOf(c) {
      const parts = String(c.page || '').split('/');
      if (parts[0] === 'review' && SUBJECTS[parts[1]]) return parts[1];
      const s = String(c.link || '').split('/')[0];
      return SUBJECTS[s] ? s : 'other';
    }

    const source = KM.allCards().filter(c => c.id);
    let subject = 'all';
    let onlyUnknown = false;
    let deck = [];
    let idx = 0, flipped = false, shuffled = false;

    /* ---------------------- 组牌 ---------------------- */
    function build(keepId) {
      deck = source.filter(c =>
        (subject === 'all' || subjectOf(c) === subject) &&
        (!onlyUnknown || !known[c.id]));
      if (shuffled) {
        for (let i = deck.length - 1; i > 0; i--) {          // Fisher–Yates
          const j = Math.floor(Math.random() * (i + 1));
          const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
        }
      }
      const at = keepId ? deck.findIndex(c => c.id === keepId) : -1;
      idx = at >= 0 ? at : 0;
      flipped = false;
    }

    /* ---------------------- 骨架 ---------------------- */
    root.innerHTML =
      '<div class="deck">' +
        '<div class="deck-bar">' +
          '<div class="deck-filters" id="dk-filters"></div>' +
          '<div class="deck-actions">' +
            '<button class="tool-btn" id="dk-shuffle">乱序</button>' +
            '<button class="tool-btn" id="dk-unknown">只练没掌握的</button>' +
          '</div>' +
        '</div>' +
        '<div class="deck-progress"><div class="dk-fill" id="dk-fill"></div></div>' +
        '<div class="deck-meta"><span id="dk-count"></span><span id="dk-known"></span></div>' +
        '<div class="deck-stage" id="dk-stage"></div>' +
        '<div class="deck-nav">' +
          '<button class="tool-btn" id="dk-prev">← 上一张</button>' +
          '<button class="tool-btn dk-know" id="dk-known-btn">记住了 ✓</button>' +
          '<button class="tool-btn" id="dk-forget">再看看</button>' +
          '<button class="tool-btn" id="dk-next">下一张 →</button>' +
        '</div>' +
        '<div class="deck-hint">点卡片翻面 · <kbd>空格</kbd> 翻面 · ' +
          '<kbd>←</kbd> <kbd>→</kbd> 切换 · <kbd>K</kbd> 标记记住了</div>' +
      '</div>';

    const $ = s => root.querySelector(s);
    const stage = $('#dk-stage');

    /* ---------------------- 筛选条 ---------------------- */
    function drawFilters() {
      const counts = {};
      source.forEach(c => { const s = subjectOf(c); counts[s] = (counts[s] || 0) + 1; });
      let h = '<button class="tool-btn' + (subject === 'all' ? ' on' : '') +
              '" data-sub="all">全部 ' + source.length + '</button>';
      Object.keys(counts).forEach(s => {
        h += '<button class="tool-btn' + (subject === s ? ' on' : '') + '" data-sub="' + s + '">' +
             (SUBJECTS[s] || '其他') + ' ' + counts[s] + '</button>';
      });
      $('#dk-filters').innerHTML = h;
    }

    /* ---------------------- 画一张卡 ---------------------- */
    function draw() {
      const n = deck.length;
      $('#dk-count').textContent = n ? '第 ' + (idx + 1) + ' / ' + n + ' 张' : '';
      const nKnown = source.filter(c => known[c.id]).length;
      $('#dk-known').textContent = '已掌握 ' + nKnown + ' / ' + source.length;
      $('#dk-fill').style.width = n ? ((idx + 1) / n * 100) + '%' : '0%';

      if (!n) {
        stage.innerHTML = '<div class="deck-empty">' +
          (onlyUnknown ? '<b>这一档的卡片全部标记为掌握了。</b><br>' +
                         '再点一次「只练没掌握的」取消筛选，回头抽查。'
                       : '还没有卡片。') + '</div>';
        return;
      }

      const c = deck[idx];
      const mistake = !!c.wrong;
      const isKnown = !!known[c.id];

      let h = '<div class="deck-card' + (flipped ? ' flipped' : '') +
              (isKnown ? ' known' : '') + '" id="dk-card">';

      h += '<div class="dc-head">' +
             '<span class="dc-kind ' + (mistake ? 'mis' : 'quiz') + '">' +
               (mistake ? '错点' : '练习') + '</span>' +
             (c.where ? '<span class="dc-where">' + KM.inlineMd(c.where) + '</span>' : '') +
             (isKnown ? '<span class="dc-known">已掌握</span>' : '') +
             '<span class="dc-date">' + KM.cardDateLabel(c.date) + '</span>' +
           '</div>';

      if (!flipped) {
        /* ---- 正面：题目 ---- */
        h += '<div class="dc-face front">';
        h += '<div class="dc-q">' + KM.md(c.q || '') + '</div>';
        if (c.options) h += KM.renderOptions(c.options, null, null);
        h += '<div class="dc-flip-hint">点一下看答案</div>';
        h += '</div>';
      } else {
        /* ---- 背面：答案 ---- */
        h += '<div class="dc-face back">';
        if (c.answer) {
          h += '<div class="dc-answer">正确答案 <b>' + KM.esc(c.answer) + '</b>' +
               (c.mine && c.mine !== c.answer
                 ? '<span class="dc-mine">我选了 ' + KM.esc(c.mine) + '</span>' : '') +
               '</div>';
        }
        if (c.options) h += KM.renderOptions(c.options, c.answer, c.mine);
        if (c.wrong) h += '<div class="card-wrong"><span class="cw-tag">我写的</span>' +
                          KM.md(c.wrong) + '</div>';
        if (c.right) h += '<div class="dc-sec"><div class="dc-label">正确是什么</div>' +
                          KM.md(c.right) + '</div>';
        if (c.why)   h += '<div class="dc-sec why"><div class="dc-label">根因 · 一句话记住</div>' +
                          KM.md(c.why) + '</div>';
        if (c.link)  h += '<div class="dc-link"><a href="#/' + KM.esc(c.link) + '">→ 回到知识点</a></div>';
        h += '</div>';
      }

      h += '</div>';
      stage.innerHTML = h;

      // 点卡片翻面，但点里面的链接时不要跟着翻
      const el = $('#dk-card');
      el.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        flip();
      });

      $('#dk-unknown').classList.toggle('on', onlyUnknown);
      $('#dk-shuffle').classList.toggle('on', shuffled);
    }

    /* ---------------------- 动作 ---------------------- */
    function flip() { flipped = !flipped; draw(); }

    function go(step) {
      if (!deck.length) return;
      idx = (idx + step + deck.length) % deck.length;
      flipped = false;
      draw();
    }

    function mark(isKnown) {
      if (!deck.length) return;
      const c = deck[idx];
      if (isKnown) known[c.id] = new Date().toISOString().slice(0, 10);
      else delete known[c.id];
      store.set(known);
      // 「只练没掌握的」模式下，标记完这张就该从牌堆里消失
      if (onlyUnknown && isKnown) {
        const at = idx;
        build();
        idx = Math.min(at, Math.max(0, deck.length - 1));
        flipped = false;
        draw();
      } else {
        go(1);
      }
    }

    /* ---------------------- 事件 ---------------------- */
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || !root.contains(b)) return;
      if (b.dataset.sub)      { subject = b.dataset.sub; build(); drawFilters(); draw(); return; }
      if (b.id === 'dk-prev') { go(-1); return; }
      if (b.id === 'dk-next') { go(1); return; }
      if (b.id === 'dk-known-btn') { mark(true); return; }
      if (b.id === 'dk-forget')    { mark(false); return; }
      if (b.id === 'dk-shuffle')   { shuffled = !shuffled; build(deck[idx] && deck[idx].id); draw(); return; }
      if (b.id === 'dk-unknown')   { onlyUnknown = !onlyUnknown; build(); draw(); return; }
    });

    // 键盘：翻页和翻面。工具被换掉之后监听器自己摘掉，免得堆在 document 上
    function onKey(e) {
      if (!document.body.contains(root)) { document.removeEventListener('keydown', onKey); return; }
      if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      if (e.key === 'ArrowRight')      { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      else if (e.key === 'k' || e.key === 'K')     { mark(true); }
    }
    document.addEventListener('keydown', onKey);

    /* ---------------------- 启动 ---------------------- */
    build();
    drawFilters();
    draw();
  },
});


/* ==========================================================================
   卡片练习页 —— 只有一个工具，别的什么都不放
   ========================================================================== */

KM.page({
  path: 'review/index/deck',
  title: '卡片练习',
  subtitle: '一次只看一张。先自己答，再翻面',
  tags: ['错题'],
  updated: '2026-08-11',

  blocks: [
    { t: 'tool', id: 'deck', use: 'deck', bare: true },
  ],
});
