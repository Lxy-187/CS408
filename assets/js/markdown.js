/* ==========================================================================
   markdown.js —— 轻量 Markdown 子集 + KaTeX 数学
   为什么不用现成库：内容全部由 Claude 生成，语法可控；
   自己实现可以把「数学优先」做对 —— 先把公式抠出来，再解析 Markdown，
   这样 $\frac{a}{b}$ 里的 * _ 之类不会被误当成强调语法。

   支持语法
     标题        # ~ #####
     强调        **粗**  *着重(紫)*  ==高亮==  ~~删除~~  `代码`
     列表        - / * / 1.        （靠缩进嵌套）
     引用        >
     分割线      ---
     表格        | a | b |  +  |---|---|
     代码块      ```
     行内公式    $...$   或  \(...\)
     独立公式    $$...$$ 或  \[...\]
     链接        [文字](#/路径)
     换行        <br>
   ========================================================================== */

(function (KM) {

  /* ---------------------- KaTeX 宏：写内容时的常用简写 ---------------------- */
  const MACROS = {
    '\\d':      '\\mathrm{d}',
    '\\dx':     '\\,\\mathrm{d}x',
    '\\dt':     '\\,\\mathrm{d}t',
    '\\du':     '\\,\\mathrm{d}u',
    '\\ds':     '\\,\\mathrm{d}s',
    '\\dy':     '\\,\\mathrm{d}y',
    '\\dtheta': '\\,\\mathrm{d}\\theta',
    '\\dxy':    '\\,\\mathrm{d}x\\,\\mathrm{d}y',
    '\\R':      '\\mathbb{R}',
    '\\N':      '\\mathbb{N}',
    '\\Z':      '\\mathbb{Z}',
    '\\Q':      '\\mathbb{Q}',
    '\\C':      '\\mathbb{C}',
    '\\E':      '\\mathrm{E}',
    '\\Var':    '\\mathrm{D}',
    '\\Cov':    '\\mathrm{Cov}',
    '\\rank':   '\\mathrm{r}',
    '\\tr':     '\\mathrm{tr}',
    '\\diag':   '\\mathrm{diag}',
    '\\abs':    '\\left|#1\\right|',
    '\\norm':   '\\left\\|#1\\right\\|',
    '\\set':    '\\left\\{#1\\right\\}',
    '\\pd':     '\\dfrac{\\partial #1}{\\partial #2}',
    '\\deriv':  '\\dfrac{\\mathrm{d}#1}{\\mathrm{d}#2}',
    '\\xto':    '\\xrightarrow{#1}',
    '\\eps':    '\\varepsilon',
    '\\T':      '^{\\mathrm{T}}',
    '\\inv':    '^{-1}',
  };

  function tex(src, display) {
    if (!window.katex) return '<span class="math-error">KaTeX 未加载</span>';
    try {
      return katex.renderToString(src, {
        displayMode: !!display,
        throwOnError: true,
        strict: false,
        macros: MACROS,
        trust: false,
      });
    } catch (e) {
      console.warn('[KM] 公式错误：', src, e.message);
      return '<span class="math-error" title="' + esc(e.message) + '">' +
             (display ? '公式错误: ' : '') + esc(src) + '</span>';
    }
  }

  /* ------------------------------ 工具 ------------------------------ */
  const esc = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 页内锚点必须写成 #/<页面路径>?at=<id> 的深链形式。
  // 直接写 href="#id" 会被路由当成页面路径，跳到「待补充」页。
  const deepHref = id =>
    '#/' + (KM.ctx.path || '') + '?at=' + encodeURIComponent(id);

  // 私有区字符做占位符，正常内容里绝不会出现
  const OPEN = '', CLOSE = '';

  /* ------------------------------ 主入口 ------------------------------ */
  function md(src) {
    if (src == null) return '';
    let s = String(src).replace(/\r\n?/g, '\n');

    // 去掉模板字符串带来的公共缩进，写内容时可以自由缩进
    s = dedent(s);

    const blockStore = [];   // 独立渲染、不参与行内解析的整块 HTML
    const inlineStore = [];  // 行内片段

    const B = html => { blockStore.push(html); return OPEN + 'B' + (blockStore.length - 1) + CLOSE; };
    const I = html => { inlineStore.push(html); return OPEN + 'I' + (inlineStore.length - 1) + CLOSE; };

    // 1) 代码块
    //    ~~~ 是 ``` 的等价写法。内容页的正文一律写在 String.raw`...` 里，
    //    那里面出现不了反引号，所以必须留一条不用反引号的路子。
    const fence = (_, lang, code) =>
      B('<pre><code class="lang-' + esc(lang) + '">' + esc(code.replace(/\n$/, '')) + '</code></pre>');
    s = s.replace(/```([\w-]*)\n([\s\S]*?)```/g, fence);
    s = s.replace(/~~~([\w-]*)\n([\s\S]*?)~~~/g, fence);

    // 2) 独立公式
    s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => B(tex(m.trim(), true)));
    s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => B(tex(m.trim(), true)));

    // 3) 行内代码
    s = s.replace(/`([^`\n]+)`/g, (_, m) => I('<code>' + esc(m) + '</code>'));

    // 4) 行内公式（\$ 可转义出字面美元符号）
    //    允许公式内部跨**一个**换行（写内容时长公式常被折行），但不许跨空行 ——
    //    跨空行说明两个 $ 分属不同段落，多半是漏写了一个 $，此时宁可不匹配。
    s = s.replace(/(^|[^\\])\$((?:[^$\n]|\n(?![ \t]*\n))+?)\$/g,
      (_, pre, m) => pre + I(tex(m.replace(/\s*\n\s*/g, ' ').trim(), false)));
    s = s.replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => I(tex(m.trim(), false)));
    s = s.replace(/\\\$/g, '$');

    // 5) 转义 HTML（此后生成的标签都是我们自己拼的，安全）
    s = esc(s);

    // 6) 块级解析
    const html = parseBlocks(s.split('\n'));

    // 7) 还原占位符
    return html
      .replace(new RegExp(OPEN + 'B(\\d+)' + CLOSE, 'g'), (_, i) => blockStore[+i])
      .replace(new RegExp(OPEN + 'I(\\d+)' + CLOSE, 'g'), (_, i) => inlineStore[+i]);
  }

  /* ------------------------------ 去公共缩进 ------------------------------ */
  function dedent(s) {
    const lines = s.split('\n');
    let min = Infinity;
    for (const l of lines) {
      if (!l.trim()) continue;
      const m = l.match(/^[ \t]*/)[0].length;
      if (m < min) min = m;
    }
    if (!isFinite(min) || min === 0) return s.replace(/^\n+|\s+$/g, '');
    return lines.map(l => l.slice(min)).join('\n').replace(/^\n+|\s+$/g, '');
  }

  /* ------------------------------ 块级 ------------------------------ */
  const RE_BLOCK_ONLY = new RegExp('^' + OPEN + 'B\\d+' + CLOSE + '$');
  const RE_UL = /^([ \t]*)[-*+]\s+(.*)$/;
  const RE_OL = /^([ \t]*)(\d+)[.)]\s+(.*)$/;

  function parseBlocks(lines) {
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const t = line.trim();

      // 空行
      if (!t) { i++; continue; }

      // 独立块占位符
      if (RE_BLOCK_ONLY.test(t)) { out.push(t); i++; continue; }

      // 标题
      const m = t.match(/^(#{1,5})\s+(.*)$/);
      if (m) {
        const lv = m[1].length;
        const text = inline(m[2]);
        const id = slug(m[2]);
        out.push('<h' + lv + ' id="' + id + '">' + text +
                 (lv <= 4 ? '<a class="anchor" href="' + deepHref(id) + '" aria-hidden="true">#</a>' : '') +
                 '</h' + lv + '>');
        i++; continue;
      }

      // 分割线
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { out.push('<hr>'); i++; continue; }

      // 表格
      if (t.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
        const res = parseTable(lines, i);
        out.push(res.html); i = res.next; continue;
      }

      // 引用
      if (/^>\s?/.test(t)) {
        const buf = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + parseBlocks(buf) + '</blockquote>');
        continue;
      }

      // 列表
      if (RE_UL.test(line) || RE_OL.test(line)) {
        const res = parseList(lines, i, indentOf(line));
        out.push(res.html); i = res.next; continue;
      }

      // 段落：吃到空行或下一个块级起点为止
      const buf = [];
      while (i < lines.length) {
        const cur = lines[i], ct = cur.trim();
        if (!ct) break;
        if (RE_BLOCK_ONLY.test(ct)) break;
        if (/^#{1,5}\s/.test(ct) || /^(-{3,}|\*{3,}|_{3,})$/.test(ct)) break;
        if (/^>\s?/.test(ct)) break;
        if (RE_UL.test(cur) || RE_OL.test(cur)) break;
        buf.push(ct);
        i++;
      }
      if (buf.length) out.push('<p>' + inline(buf.join('\n')) + '</p>');
    }

    return out.join('\n');
  }

  const indentOf = l => l.match(/^[ \t]*/)[0].replace(/\t/g, '  ').length;

  function parseList(lines, start, baseIndent) {
    const first = lines[start];
    const ordered = RE_OL.test(first);
    const items = [];
    let i = start;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) {
        // 项之间的空行：后面还接着同级项才继续
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length && (RE_UL.test(lines[j]) || RE_OL.test(lines[j])) &&
            indentOf(lines[j]) === baseIndent) { i = j; continue; }
        break;
      }

      const ind = indentOf(line);
      if (ind !== baseIndent) break;

      const mu = line.match(RE_UL), mo = line.match(RE_OL);
      if (!mu && !mo) break;
      if (!!mo !== ordered) break;

      const body = [ordered ? mo[3] : mu[2]];
      i++;

      // 收集该项的续行与子内容（缩进更深的行）
      const child = [];
      while (i < lines.length) {
        const nl = lines[i];
        if (!nl.trim()) {
          const k = i + 1;
          if (k < lines.length && lines[k].trim() && indentOf(lines[k]) > baseIndent) { child.push(''); i++; continue; }
          break;
        }
        if (indentOf(nl) > baseIndent) { child.push(nl.replace(/^[ \t]{1,4}/, '')); i++; continue; }
        break;
      }

      let html = inline(body.join('\n'));
      if (child.length) html += '\n' + parseBlocks(child);
      items.push('<li>' + html + '</li>');
    }

    const tag = ordered ? 'ol' : 'ul';
    const startAttr = ordered ? ' start="' + first.match(RE_OL)[2] + '"' : '';
    return { html: '<' + tag + startAttr + '>' + items.join('') + '</' + tag + '>', next: i };
  }

  function parseTable(lines, start) {
    const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    const head = cells(lines[start]);
    const align = cells(lines[start + 1]).map(c =>
      /^:-+:$/.test(c) ? 'center' : /^-+:$/.test(c) ? 'right' : 'left');
    let i = start + 2;
    const rows = [];
    while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
      rows.push(cells(lines[i])); i++;
    }
    const th = head.map((h, k) => '<th style="text-align:' + (align[k] || 'left') + '">' + inline(h) + '</th>').join('');
    const tb = rows.map(r =>
      '<tr>' + r.map((c, k) => '<td style="text-align:' + (align[k] || 'left') + '">' + inline(c) + '</td>').join('') + '</tr>'
    ).join('');
    return {
      html: '<div class="table-wrap"><table><thead><tr>' + th + '</tr></thead><tbody>' + tb + '</tbody></table></div>',
      next: i
    };
  }

  /* ------------------------------ 行内 ------------------------------ */
  function inline(s) {
    return s
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+?)__/g, '<strong>$1</strong>')
      .replace(/==([^=]+?)==/g, '<mark>$1</mark>')
      .replace(/~~([^~]+?)~~/g, '<del>$1</del>')
      .replace(/(^|[^*\w])\*([^*\n]+?)\*(?![*\w])/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/&lt;br\s*\/?&gt;/g, '<br>')
      .replace(/\n/g, ' ');
  }

  /* ------------------------------ 锚点 id ------------------------------ */
  const slugSeen = new Map();
  function slug(text) {
    let s = String(text)
      .replace(new RegExp(OPEN + '[BI]\\d+' + CLOSE, 'g'), '')
      .replace(/[*_`~=#]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w一-龥-]/g, '');
    if (!s) s = 'h';
    const n = (slugSeen.get(s) || 0) + 1;
    slugSeen.set(s, n);
    return n > 1 ? s + '-' + n : s;
  }

  KM.md = md;
  KM.tex = tex;
  KM.esc = esc;
  KM.resetSlugs = () => slugSeen.clear();

})(window.KM);
