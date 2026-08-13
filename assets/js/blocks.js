/* ==========================================================================
   blocks.js —— 内容块渲染器
   一个内容页 = 一个 blocks 数组。每个块有 t 字段决定类型和配色。
   块类型清单见 CLAUDE.md，新增类型时两边都要改。
   ========================================================================== */

(function (KM) {

  const md = s => '<div class="prose">' + KM.md(s) + '</div>';
  const esc = KM.esc;

  /* ---------------------------- 锚点 ----------------------------
     每个块都可以写 id: 'xxx'（短 ASCII，与中文标题解耦），
     别处就能用 #/<页面路径>?at=xxx 精确链过来。
     没写 id 的块退回自动生成的 id，仍然可寻址，只是改标题会断链。 */
  const idAttr = id => (id ? ' id="' + esc(id) + '"' : '');

  const anchorLink = id => (id && KM.ctx.path)
    ? '<a class="block-anchor" href="#/' + KM.ctx.path + '?at=' + encodeURIComponent(id) +
      '" title="这一块的直达链接" aria-hidden="true">#</a>'
    : '';

  /* 各类提示块的图标与中文名 */
  const KINDS = {
    key:     { icon: '◆', label: '核心结论', kind: 'KEY' },
    method:  { icon: '▶', label: '方法套路', kind: 'METHOD' },
    insight: { icon: '★', label: '我的思路', kind: 'INSIGHT' },
    warn:    { icon: '⚠', label: '易错警示', kind: 'PITFALL' },
    quote:   { icon: '❝', label: '原始记录', kind: 'NOTE' },
  };

  /* ------------------------------ 分发 ------------------------------ */
  function render(b, idx) {
    switch (b.t) {
      case 'md':      return md(b.c);
      case 'h':       return heading(b);
      case 'key':
      case 'method':
      case 'insight':
      case 'warn':
      case 'quote':   return callout(b);
      case 'steps':   return steps(b);
      case 'example': return example(b, idx);
      case 'compare': return compare(b);
      case 'formulas':return formulas(b);
      case 'code':    return codeblock(b);
      case 'tool':    return toolblock(b);
      case 'card':    return card(b);
      case 'cards':   return cardIndex(b);
      default:
        console.warn('[KM] 未知块类型：' + b.t, b);
        return md(b.c || '');
    }
  }

  /* ------------------------------ 二级标题 ------------------------------ */
  function heading(b) {
    const id = b.id || ('sec-' + slugify(b.c || b.title || ''));
    return '<h2 class="sec-title"' + idAttr(id) + '>' + inlineMd(b.c || b.title) +
           anchorLink(id).replace('block-anchor', 'anchor') + '</h2>';
  }

  /* ------------------------------ 代码块 ------------------------------
     408 专用：数据结构 / 算法的实现代码值得单独成块，
     有标题、有语言标签、可被 ?at= 精确引用。
     { t:'code', id:'kmp-next', title:'求 next 数组', lang:'c', c: String.raw`...` } */
  function codeblock(b) {
    const head = (b.title || b.lang)
      ? '<div class="code-head">' +
          (b.lang ? '<span class="code-lang">' + esc(b.lang) + '</span>' : '') +
          '<span class="code-title">' + inlineMd(b.title || '') + '</span>' +
          (b.note ? '<span class="code-note">' + inlineMd(b.note) + '</span>' : '') +
          anchorLink(b.id) +
        '</div>'
      : '';
    return '<div class="codeblock"' + idAttr(b.id) + '>' + head +
           '<pre><code class="lang-' + esc(b.lang || '') + '">' +
           esc(dedent(String(b.c == null ? '' : b.c))) +
           '</code></pre></div>';
  }

  /* 去掉模板字符串带来的公共缩进，但保留代码自身的层次缩进 */
  function dedent(s) {
    const lines = s.replace(/\r\n?/g, '\n').replace(/^\n+|\s+$/g, '').split('\n');
    let min = Infinity;
    for (const l of lines) {
      if (!l.trim()) continue;
      min = Math.min(min, l.match(/^[ \t]*/)[0].length);
    }
    return (!isFinite(min) || min === 0) ? lines.join('\n')
                                         : lines.map(l => l.slice(min)).join('\n');
  }

  /* ------------------------------ 交互工具 ------------------------------
     { t:'tool', id:'widget', use:'ieee754', title:'…', note:'…' }
     use = tools/ 下注册的工具 id（见 tools.js）。这里只吐一个空壳，
     真正的 DOM 由 KM.mountTools() 在插入文档之后填。
     省略 use 时退回用 id 当工具名，方便一页只嵌一个工具的场合。 */
  function toolblock(b) {
    const use = b.use || b.id || '';
    const def = KM.getTool ? KM.getTool(use) : null;
    const title = b.title || (def && def.title) || '交互工具';
    const note  = b.note != null ? b.note : (def && def.subtitle) || '';
    // bare:true 去掉标题栏和外框，让工具自己占满整页（卡片练习这种要专注的场合）
    if (b.bare) {
      return '<div class="toolbox bare"' + idAttr(b.id) + '>' +
               '<div class="tool-mount" data-tool="' + esc(use) + '"></div></div>';
    }
    return '<div class="toolbox"' + idAttr(b.id) + '>' +
             '<div class="tool-head">' +
               '<span class="tool-tag">TOOL</span>' +
               '<span class="tool-title">' + inlineMd(title) + '</span>' +
               (note ? '<span class="tool-note">' + inlineMd(note) + '</span>' : '') +
               anchorLink(b.id) +
             '</div>' +
             '<div class="tool-mount" data-tool="' + esc(use) + '"></div>' +
           '</div>';
  }

  /* ------------------------------ 提示块 ------------------------------ */
  function callout(b) {
    const k = KINDS[b.t];
    const head = (b.title || b.t !== 'quote')
      ? '<div class="block-head">' +
          '<span class="b-icon">' + k.icon + '</span>' +
          '<span class="b-kind">' + k.kind + '</span>' +
          '<span class="b-title">' + inlineMd(b.title || k.label) + '</span>' +
          anchorLink(b.id) +
        '</div>'
      : '';
    return '<div class="block ' + b.t + '"' + idAttr(b.id) + '>' + head + md(b.c) + '</div>';
  }

  /* ------------------------------ 步骤流程 ------------------------------ */
  function steps(b) {
    const head = b.title
      ? '<div class="block-head" style="--cl:var(--c-method)">' +
          '<span class="b-icon">▶</span><span class="b-kind">STEPS</span>' +
          '<span class="b-title">' + inlineMd(b.title) + '</span>' +
          anchorLink(b.id) + '</div>'
      : '';
    const items = (b.items || []).map(it => {
      const o = typeof it === 'string' ? { c: it } : it;
      return '<div class="step">' +
             (o.title ? '<div class="step-title">' + inlineMd(o.title) + '</div>' : '') +
             (o.c ? md(o.c) : '') + '</div>';
    }).join('');
    return '<div class="steps-wrap"' + idAttr(b.id) + '>' +
           head + '<div class="steps">' + items + '</div></div>';
  }

  /* ------------------------------ 例题卡 ------------------------------ */
  let exCounter = 0;
  function example(b) {
    exCounter++;
    // 位置编号 ex-N 会因为插入新例题而错位，所以优先用作者写死的 id
    const id = b.id || ('ex-' + exCounter);
    const stars = b.level ? '★'.repeat(Math.max(1, Math.min(5, b.level))) +
                            '☆'.repeat(5 - Math.max(1, Math.min(5, b.level))) : '';

    let h = '<section class="ex"' + idAttr(id) + '>';
    h += '<div class="ex-head">';
    h += '<span class="ex-badge">例 ' + exCounter + '</span>';
    if (b.title)  h += '<span class="ex-title">' + inlineMd(b.title) + '</span>';
    if (b.source) h += '<span class="ex-src">' + inlineMd(b.source) + '</span>';
    if (stars)    h += '<span class="ex-stars" title="难度 ' + b.level + '/5">' + stars + '</span>';
    h += anchorLink(b.id);
    h += '</div>';

    h += '<div class="ex-body">';
    if (b.problem) h += '<div class="ex-problem">' + md(b.problem) + '</div>';

    h += fold('f-idea',     '思路',   '先自己想 30 秒再展开', b.idea,     b.openIdea);
    h += fold('f-solution', '解答',   '',                     b.solution, b.openSolution);
    h += fold('f-comment',  '点评 / 拓展', '',                b.comment,  b.openComment);
    h += '</div></section>';
    return h;
  }

  function fold(cls, label, hint, content, open) {
    if (!content) return '';
    return '<details class="fold ' + cls + '"' + (open ? ' open' : '') + '>' +
             '<summary><span class="caret">▶</span>' + label +
             (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') +
           '</summary>' +
           '<div class="fold-body">' + md(content) + '</div></details>';
  }

  /* ------------------------------ 错题卡 ------------------------------
     一张卡 = 一个丢过分的点，不是一整道题。
     「我写的」摊开放着（复习时要一眼看见自己的错），
     「正确是什么」和「根因」折叠，方便先自测再对答案。
     { t:'card', id:'exp-sign', date:'2026-08-11', where:'组成原理 · 浮点',
       q:'情境一句话', wrong:'我当时怎么写的', right:'正确的做法',
       why:'为什么会错 + 一句话口诀', link:'co/data/float?at=ex-neg-frac' } */
  function card(b) {
    const id = b.id || '';
    let h = '<div class="card-item"' + idAttr(id) + '>';
    h += '<div class="card-head">' +
           '<span class="card-tag">错点</span>' +
           (b.where ? '<span class="card-where">' + inlineMd(b.where) + '</span>' : '') +
           '<span class="card-date"' + (b.date ? ' title="记录于 ' + esc(b.date) + '"' : '') +
             '>' + dateLabel(b.date) + '</span>' +
           anchorLink(id) +
         '</div>';
    h += '<div class="card-body">';
    if (b.q)     h += '<div class="card-q">' + md(b.q) + '</div>';
    if (b.options) h += optionList(b.options, null, null);   // 静态页不标答案，留给折叠段
    if (b.wrong) h += '<div class="card-wrong"><span class="cw-tag">我写的</span>' +
                      md(b.wrong) + '</div>';
    h += fold('f-solution', '正确是什么', '先自己想一遍', b.right, b.open);
    h += fold('f-comment',  '根因 · 一句话记住', '',       b.why,   b.open);
    if (b.link) h += '<div class="card-foot"><a href="#/' + esc(b.link) + '">→ 回到知识点</a></div>';
    return h + '</div></div>';
  }

  /* 选择题的选项。answer / mine 传进来就标记，传 null 就是干净的题面（自测用）。
     卡片正面不标、翻面之后才标，靠的就是这两个参数。 */
  function optionList(options, answer, mine) {
    const items = (options || []).map(o => {
      const k = o.k || '';
      const right = answer && k === answer;
      const bad = mine && k === mine && k !== answer;
      return '<div class="opt' + (right ? ' ok' : '') + (bad ? ' bad' : '') + '">' +
               '<span class="opt-k">' + esc(k) + '</span>' +
               '<span class="opt-c">' + inlineMd(o.c || '') + '</span>' +
               (right ? '<span class="opt-mark ok">✓ 正确</span>' : '') +
               (bad ? '<span class="opt-mark bad">✗ 我选的</span>' : '') +
             '</div>';
    }).join('');
    return '<div class="opts">' + items + '</div>';
  }

  /* 日期 → 「今天 / 昨天 / N 天前」，复习时要的是"多久没看了"而不是绝对日期 */
  function daysSince(date) {
    const t = Date.parse(String(date) + 'T00:00:00');
    if (isNaN(t)) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((today.getTime() - t) / 86400000);
  }
  function dateLabel(date) {
    const n = daysSince(date);
    if (n === null) return esc(date || '—');
    return n <= 0 ? '今天' : n === 1 ? '昨天' : n + ' 天前';
  }

  /* ------------------------------ 错题卡汇总 ------------------------------
     { t:'cards' } 会把全站所有 card 块按时间倒序列出来，分成几档。
     卡片本身写在各自的科目页里，这里只出清单，点进去看详情。 */
  const BUCKETS = [
    { label: '今天 / 昨天',  max: 1 },
    { label: '最近一周',    max: 7 },
    { label: '最近一个月',  max: 30 },
    { label: '更早',        max: Infinity },
  ];

  function cardIndex(b) {
    const all = (KM.allCards ? KM.allCards() : [])
      .filter(c => !b.only || String(c.page).indexOf(b.only) === 0);
    if (!all.length) return '<div class="card-empty">还没有错题卡。</div>';

    let h = '<div class="card-index"' + idAttr(b.id) + '>';
    let rest = all.slice();
    BUCKETS.forEach(bk => {
      const group = rest.filter(c => {
        const n = daysSince(c.date);
        return n !== null && n <= bk.max;
      });
      if (!group.length) return;
      rest = rest.filter(c => group.indexOf(c) < 0);
      h += '<div class="ci-group"><div class="ci-label">' + esc(bk.label) +
           '<span class="n">' + group.length + '</span></div>';
      group.forEach(c => {
        h += '<a class="ci-row" href="#/' + esc(c.page) + '?at=' + encodeURIComponent(c.id || '') + '">' +
               '<span class="ci-date">' + esc(String(c.date || '').slice(5)) + '</span>' +
               '<span class="ci-q">' + inlineMd(c.q || '（未写情境）') + '</span>' +
               (c.where ? '<span class="ci-where">' + inlineMd(c.where) + '</span>' : '') +
             '</a>';
      });
      h += '</div>';
    });
    // 日期写错格式的卡片不能悄悄消失
    if (rest.length) {
      h += '<div class="ci-group"><div class="ci-label">日期缺失或格式不对<span class="n">' +
           rest.length + '</span></div>';
      rest.forEach(c => {
        h += '<a class="ci-row" href="#/' + esc(c.page) + '?at=' + encodeURIComponent(c.id || '') + '">' +
               '<span class="ci-date">—</span>' +
               '<span class="ci-q">' + inlineMd(c.q || '') + '</span></a>';
      });
      h += '</div>';
    }
    return h + '</div>';
  }

  /* ------------------------------ 对比表 ------------------------------ */
  function compare(b) {
    const cols = b.cols || [];
    const th = cols.map(c => '<th>' + inlineMd(c) + '</th>').join('');
    const tb = (b.rows || []).map(r =>
      '<tr>' + r.map(c => '<td>' + inlineMd(String(c == null ? '' : c)) + '</td>').join('') + '</tr>'
    ).join('');
    return '<div class="compare"' + idAttr(b.id) + '>' +
           (b.title ? '<div class="compare-title">' + inlineMd(b.title) + anchorLink(b.id) + '</div>' : '') +
           '<div class="table-wrap"><table class="data"><thead><tr>' + th +
           '</tr></thead><tbody>' + tb + '</tbody></table></div></div>';
  }

  /* ------------------------------ 公式速查 ------------------------------ */
  function formulas(b) {
    const head = b.title
      ? '<div class="block-head" style="--cl:var(--c-key)">' +
          '<span class="b-icon">◆</span><span class="b-kind">FORMULA</span>' +
          '<span class="b-title">' + inlineMd(b.title) + '</span>' +
          anchorLink(b.id) + '</div>'
      : '';
    const items = (b.items || []).map(it =>
      '<div class="formula-item">' +
        (it.label ? '<div class="f-label">' + inlineMd(it.label) + '</div>' : '') +
        KM.tex(it.tex, true) +
      '</div>').join('');
    return '<div class="formulas-wrap"' + idAttr(b.id) + '>' +
           head + '<div class="formula-grid">' + items + '</div></div>';
  }

  /* ------------------------------ 小工具 ------------------------------ */
  // 只做行内解析：去掉外层 <p>
  function inlineMd(s) {
    const h = KM.md(s || '');
    const m = h.match(/^<p>([\s\S]*)<\/p>$/);
    return m ? m[1] : h;
  }

  function slugify(s) {
    return String(s).replace(/[*_`~=#$\\]/g, '').trim()
      .replace(/\s+/g, '-').replace(/[^\w一-龥-]/g, '') || 'sec';
  }

  /* 提取页面大纲（供右侧目录用）：h 块 + 例题 */
  function outline(page) {
    const items = [];
    let ex = 0;
    (page.blocks || []).forEach(b => {
      if (b.t === 'h') {
        items.push({ level: 2, id: b.id || ('sec-' + slugify(b.c || b.title || '')),
                     text: stripMd(b.c || b.title) });
      } else if (b.t === 'example') {
        ex++;
        items.push({ level: 3, id: b.id || ('ex-' + ex),
                     text: '例' + ex + (b.title ? ' · ' + stripMd(b.title) : '') });
      } else if (b.t === 'card' && b.id) {
        // 卡片的情境常以公式开头，进目录会退化成一串 □，所以优先用 where 当标签
        items.push({ level: 3, id: b.id, text: stripMd(b.where || b.q || '错点') });
      }
    });
    return items;
  }

  function stripMd(s) {
    return String(s || '')
      .replace(/\$[^$]*\$/g, '□')   // 公式压成一个方块，目录里不适合展开
      .replace(/\*\*|==|~~|`/g, '') // 只去成对标记，单个 = ~ * 是正文内容
      .trim();
  }

  KM.renderBlock = render;
  KM.inlineMd = inlineMd;          // 供页头副标题等单行场合复用
  KM.renderOptions = optionList;   // 卡片练习（tools/deck.js）翻面时要带标记地重画一遍
  KM.cardDateLabel = dateLabel;
  KM.resetExampleCounter = () => { exCounter = 0; };
  KM.outline = outline;
  KM.stripMd = stripMd;
  KM.slugify = slugify;

})(window.KM);
