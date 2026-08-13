/* ==========================================================================
   工具 / IEEE 754 浮点数位模式
   —— 这个文件同时也是「工具格式示范」：一个文件里注册工具本体 + 它自己的说明页。

   工具本身用 BigInt 存位模式、用 DataView 做位与值的互转，
   所以显示的一切（包括「精确十进制值」）都是真的，不是近似算出来的。
   ========================================================================== */

KM.tool({
  id: 'ieee754',
  title: 'IEEE 754 位模式',
  subtitle: '点任意一位翻转，实时看阶码和尾数怎么变成一个数',
  icon: '⬚',
  path: 'tools/co/ieee754',

  mount(root) {

    /* ---------------------- 两种精度的全部参数 ---------------------- */
    const LAYOUT = {
      32: { total: 32, e: 8,  m: 23, bias: 127,  label: '单精度 float' },
      64: { total: 64, e: 11, m: 52, bias: 1023, label: '双精度 double' },
    };

    let P = 32;          // 当前精度
    let bits = 0n;       // 位模式（BigInt，最高位是符号位）
    let typed = '';      // 用户最后一次在十进制框里敲的内容，用来提示精度丢失

    /* ---------------------- 位模式 ↔ 数值 ---------------------- */
    const dv = new DataView(new ArrayBuffer(8));

    function toValue(b) {
      if (P === 32) { dv.setUint32(0, Number(b & 0xffffffffn)); return dv.getFloat32(0); }
      dv.setBigUint64(0, b & 0xffffffffffffffffn); return dv.getFloat64(0);
    }
    function fromValue(v) {
      if (P === 32) { dv.setFloat32(0, v); return BigInt(dv.getUint32(0)); }
      dv.setFloat64(0, v); return dv.getBigUint64(0);
    }

    /* ---------------------- 拆位 ---------------------- */
    function decode() {
      const L = LAYOUT[P];
      const eMask = (1n << BigInt(L.e)) - 1n;
      const mMask = (1n << BigInt(L.m)) - 1n;

      const S = Number((bits >> BigInt(L.total - 1)) & 1n);
      const E = Number((bits >> BigInt(L.m)) & eMask);
      const M = bits & mMask;
      const maxE = Number(eMask);

      let kind;
      if (E === 0 && M === 0n)       kind = 'zero';
      else if (E === 0)              kind = 'denorm';
      else if (E === maxE && !M)     kind = 'inf';
      else if (E === maxE)           kind = 'nan';
      else                           kind = 'norm';

      // 规格化数补回隐藏位；非规格化数没有隐藏位，且指数固定为 1-bias
      const hidden = kind === 'norm' ? 1 : 0;
      const sig  = kind === 'norm' ? M + (1n << BigInt(L.m)) : M;
      const exp2 = kind === 'norm' ? E - L.bias : 1 - L.bias;

      return { L, S, E, M, maxE, kind, hidden, sig, exp2, value: toValue(bits) };
    }

    /* ---------------------- 精确十进制展开 ----------------------
       二进制小数在十进制里总是有限的（因为 2 整除 10），所以能算准。
       sig × 2^exp2：exp2 ≥ 0 直接左移；exp2 < 0 时乘 5^|exp2| 再点小数点。 */
    function exactDecimal(sig, exp2, neg) {
      if (sig === 0n) return neg ? '-0' : '0';
      let s;
      if (exp2 >= 0) {
        s = (sig << BigInt(exp2)).toString();
      } else {
        const d = -exp2;
        const t = (sig * (5n ** BigInt(d))).toString().padStart(d + 1, '0');
        const ip = t.slice(0, t.length - d);
        const fp = t.slice(t.length - d).replace(/0+$/, '');
        s = fp ? ip + '.' + fp : ip;
      }
      return (neg ? '-' : '') + s;
    }

    const bin = (v, n) => v.toString(2).padStart(n, '0');

    // 非规格化数的精确值能有一百多位，读数行里截一下，完整值挂在 title 上
    function clip(s, n) {
      return s.length <= n ? KM.esc(s)
        : '<span title="' + KM.esc(s) + '">' + KM.esc(s.slice(0, n)) + '…</span>';
    }

    function hex() {
      const L = LAYOUT[P];
      return '0x' + bits.toString(16).toUpperCase().padStart(L.total / 4, '0');
    }

    /* ---------------------- 界面骨架 ---------------------- */
    root.innerHTML =
      '<div class="tool-row">' +
        '<span class="tool-label">精度</span>' +
        '<button class="tool-btn" data-prec="32">单精度 32 位</button>' +
        '<button class="tool-btn" data-prec="64">双精度 64 位</button>' +
        '<span class="tool-note" style="margin-left:auto">点位格翻转 0 / 1</span>' +
      '</div>' +
      '<div class="bitgrid" id="f754-bits"></div>' +
      '<div class="tool-row">' +
        '<span class="tool-label">十进制</span>' +
        '<input class="tool-field" id="f754-dec" style="flex:1 1 200px" ' +
               'spellcheck="false" autocomplete="off" placeholder="例如 -12.75">' +
        '<span class="tool-label">十六进制</span>' +
        '<input class="tool-field" id="f754-hex" style="flex:0 1 190px" ' +
               'spellcheck="false" autocomplete="off" placeholder="例如 C14C0000">' +
      '</div>' +
      '<div class="tool-row">' +
        '<span class="tool-label">相邻数</span>' +
        '<button class="tool-btn" data-step="-1">← 前一个可表示数</button>' +
        '<button class="tool-btn" data-step="1">后一个可表示数 →</button>' +
      '</div>' +
      '<div class="tool-row" id="f754-presets">' +
        '<span class="tool-label">预设</span>' +
      '</div>' +
      '<div class="tool-out" id="f754-out"></div>';

    const $bits    = root.querySelector('#f754-bits');
    const $dec     = root.querySelector('#f754-dec');
    const $hex     = root.querySelector('#f754-hex');
    const $out     = root.querySelector('#f754-out');
    const $presets = root.querySelector('#f754-presets');

    /* ---------------------- 位格子 ---------------------- */
    function group(name, cls, from, count, sub) {
      // from = 最高位的位序号（第 total-1 位是符号位），从高到低排
      let h = '<div class="bitgroup ' + cls + '">' +
              '<div class="bitgroup-head">' + name +
              (sub ? ' <span class="sub">' + sub + '</span>' : '') + '</div><div class="bits">';
      for (let k = 0; k < count; k++) {
        const idx = from - k;
        const on = ((bits >> BigInt(idx)) & 1n) === 1n;
        // 每 4 位断一次，方便和十六进制对照（按整个字长从低位数）
        const nib = (idx % 4 === 0 && k !== count - 1) ? ' nib' : '';
        h += '<button class="bit' + (on ? ' on' : '') + nib + '" data-bit="' + idx +
             '" title="第 ' + idx + ' 位">' + (on ? '1' : '0') + '</button>';
      }
      return h + '</div></div>';
    }

    function drawBits() {
      const L = LAYOUT[P];
      $bits.innerHTML =
        group('Sign 符号 S', 'bit-sign', L.total - 1, 1, '(1 位)') +
        group('Exponent 阶码 E', 'bit-exp', L.total - 2, L.e, '(' + L.e + ' 位，偏置 ' + L.bias + ')') +
        group('Mantissa 尾数 M', 'bit-man', L.m - 1, L.m, '(' + L.m + ' 位)');
    }

    /* ---------------------- 读数 ---------------------- */
    const KIND = {
      norm:   { label: '规格化数',   cl: 'var(--c-key)' },
      denorm: { label: '非规格化数', cl: 'var(--c-method)' },
      zero:   { label: '零',         cl: 'var(--fg-muted)' },
      inf:    { label: '无穷大',     cl: 'var(--c-warn)' },
      nan:    { label: 'NaN 非数',   cl: 'var(--c-warn)' },
    };

    function formulaTex(d) {
      const L = d.L;
      if (d.kind === 'nan') return '\\text{NaN}\\ \\ (E\\ \\text{全 1，}M\\neq 0)';
      if (d.kind === 'inf') return (d.S ? '-' : '+') + '\\infty\\ \\ (E\\ \\text{全 1，}M=0)';
      if (d.kind === 'zero') return (d.S ? '-' : '+') + '0\\ \\ (E=0,\\ M=0)';

      // 尾数二进制，去掉尾部的 0 免得刷屏
      let f = bin(d.M, L.m).replace(/0+$/, '');
      const mant = '\\texttt{' + d.hidden + '.' + (f || '0') + '}_2';
      const expl = d.kind === 'norm'
        ? '2^{' + d.E + '-' + L.bias + '}'
        : '2^{1-' + L.bias + '}';
      return '(-1)^{' + d.S + '}\\times ' + mant + '\\times ' + expl +
             '\\ =\\ ' + '(-1)^{' + d.S + '}\\times ' + mant + '\\times 2^{' + d.exp2 + '}';
    }

    function line(k, v) { return '<div class="tool-line"><span class="k">' + k +
                                 '</span><span class="v">' + v + '</span></div>'; }

    // 把用户敲的十进制串摊平成不带指数的写法，好和精确值逐字比对。
    // 1e20 这种也要认，因为"输了个大数结果对不上"正是最该提示的情况。
    function normDec(s) {
      const m = String(s).trim().match(/^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/);
      if (!m || (!m[2] && !m[3])) return null;
      const ip = m[2] || '', fp = m[3] || '';
      let digits = ip + fp;
      let point = ip.length + (m[4] ? parseInt(m[4], 10) : 0);   // 小数点该落在第几位
      if (point <= 0) { digits = '0'.repeat(1 - point) + digits; point = 1; }
      if (point > digits.length) digits += '0'.repeat(point - digits.length);
      const I = digits.slice(0, point).replace(/^0+(?=\d)/, '') || '0';
      const F = digits.slice(point).replace(/0+$/, '');
      const num = F ? I + '.' + F : I;
      return (m[1] === '-' && /[1-9]/.test(num) ? '-' : '') + num;
    }

    function draw() {
      const d = decode(), L = d.L;
      const kd = KIND[d.kind];

      // 大字：JS 的最短往返表示，-0 要单独认一下
      let shown = Object.is(d.value, -0) ? '-0' : String(d.value);

      let h = '<div class="f754-value">' +
                '<span class="tool-badge" style="--cl:' + kd.cl + '">' + kd.label + '</span>' +
                '<span class="big">' + KM.esc(shown) + '</span>' +
              '</div>';

      h += '<div class="f754-formula">' + KM.tex(formulaTex(d), true) + '</div>';

      h += line('符号位 S', d.S + '　<span class="dim">→ ' + (d.S ? '负' : '正') + '</span>');

      const eLine = bin(BigInt(d.E), L.e) + '<sub>2</sub> = ' + d.E +
        (d.kind === 'norm'
          ? '　<span class="dim">→ 指数 e = ' + d.E + ' − ' + L.bias + ' = ' + d.exp2 + '</span>'
          : d.kind === 'denorm'
            ? '　<span class="dim">→ E=0，指数锁定 1 − ' + L.bias + ' = ' + d.exp2 + '</span>'
            : '　<span class="dim">→ E 全 1，留给 ∞ / NaN</span>');
      h += line('阶码 E', eLine);

      const mBin = bin(d.M, L.m);
      h += line('尾数 M', '<span style="overflow-wrap:anywhere">' + mBin + '<sub>2</sub></span>' +
        (d.kind === 'norm' || d.kind === 'denorm'
          ? '　<span class="dim">→ 有效值 ' + d.hidden + '.M = ' +
            exactDecimal(d.sig, -L.m, false) + '</span>'
          : ''));

      h += line('十六进制', hex());

      if (d.kind === 'norm' || d.kind === 'denorm' || d.kind === 'zero') {
        const exact = exactDecimal(d.sig, d.exp2 - L.m, d.S === 1);
        h += line('精确值', clip(exact, 72));
        const ulp = exactDecimal(1n, d.exp2 - L.m, false);
        h += line('相邻间隔', '2<sup>' + (d.exp2 - L.m) + '</sup> = ' + clip(ulp, 60) +
                  '　<span class="dim">这一带每两个可表示数相差这么多</span>');
      }

      // 输入 0.1 却存进去 0.1000000149…：这一行是这个工具最值钱的地方
      let note = '';
      if (typed && (d.kind === 'norm' || d.kind === 'denorm')) {
        const want = normDec(typed);
        const got = exactDecimal(d.sig, d.exp2 - L.m, d.S === 1);
        if (want && want !== got) {
          note = '⚠ 输入的 ' + KM.esc(want) + ' 无法精确表示，已舍入到最近的可表示值 ' +
                 clip(got, 60) + '　—— 这就是精度丢失';
        }
      }
      h += '<div class="f754-note">' + note + '</div>';

      $out.innerHTML = h;
      if (document.activeElement !== $dec) $dec.value = shown;
      if (document.activeElement !== $hex) $hex.value = hex().slice(2);
      $dec.classList.remove('bad'); $hex.classList.remove('bad');

      root.querySelectorAll('.bit').forEach(el => {
        const on = ((bits >> BigInt(el.dataset.bit)) & 1n) === 1n;
        el.classList.toggle('on', on);
        el.textContent = on ? '1' : '0';
      });
    }

    /* ---------------------- 预设 ---------------------- */
    function presets() {
      const L = LAYOUT[P];
      const mMask = (1n << BigInt(L.m)) - 1n;
      const maxE  = (1n << BigInt(L.e)) - 1n;
      return [
        ['0',            0n],
        ['1',            fromValue(1)],
        ['−1',           fromValue(-1)],
        ['0.1',          fromValue(0.1)],
        ['12.375',       fromValue(12.375)],
        ['最大规格化数', ((maxE - 1n) << BigInt(L.m)) | mMask],
        ['最小规格化数', 1n << BigInt(L.m)],
        ['最小非规格化', 1n],
        ['+∞',           maxE << BigInt(L.m)],
        ['NaN',          (maxE << BigInt(L.m)) | (1n << BigInt(L.m - 1))],
      ];
    }

    function drawPresets() {
      $presets.innerHTML = '<span class="tool-label">预设</span>' +
        presets().map((p, i) => '<button class="tool-btn" data-preset="' + i + '">' +
                                KM.esc(p[0]) + '</button>').join('');
    }

    /* ---------------------- 事件 ---------------------- */
    function setPrec(p) {
      const v = toValue(bits);            // 换精度时保住当前数值，看同一个数在两种格式下的差别
      P = p;
      bits = Number.isNaN(v) ? fromValue(NaN) : fromValue(v);
      root.querySelectorAll('[data-prec]').forEach(b =>
        b.classList.toggle('on', +b.dataset.prec === P));
      drawBits(); drawPresets(); draw();
    }

    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || !root.contains(b)) return;

      if (b.dataset.prec)   { setPrec(+b.dataset.prec); return; }
      if (b.dataset.bit)    { typed = ''; bits ^= (1n << BigInt(b.dataset.bit)); draw(); return; }
      if (b.dataset.preset) { typed = ''; bits = presets()[+b.dataset.preset][1]; draw(); return; }

      if (b.dataset.step) {
        // 把位模式当成「有序序号」走一步：正数直接加减，负数方向相反。
        // 这样一步正好是 1 个 ulp，跨越 0 和规格化边界也自然衔接。
        const L = LAYOUT[P];
        const d = decode();
        if (d.kind === 'nan') return;
        const signBit = 1n << BigInt(L.total - 1);
        const mag = bits & (signBit - 1n);
        const infPat = ((1n << BigInt(L.e)) - 1n) << BigInt(L.m);
        let ord = d.S ? -mag : mag;
        ord += BigInt(b.dataset.step);
        const nMag = ord < 0n ? -ord : ord;
        if (nMag > infPat) return;                    // 到 ±∞ 就停住
        bits = ord < 0n ? (nMag | signBit) : nMag;
        typed = '';
        draw();
        return;
      }
    });

    $dec.addEventListener('input', () => {
      const t = $dec.value.trim();
      let v;
      if (/^[+-]?(inf|infinity|∞)$/i.test(t)) v = t[0] === '-' ? -Infinity : Infinity;
      else if (/^nan$/i.test(t)) v = NaN;
      else if (t === '' ) { return; }
      else if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) v = Number(t);
      else { $dec.classList.add('bad'); return; }
      typed = t;
      bits = fromValue(v);
      draw();
    });

    $hex.addEventListener('input', () => {
      const L = LAYOUT[P];
      const t = $hex.value.trim().replace(/^0[xX]/, '').replace(/[\s_]/g, '');
      if (!t || !/^[0-9a-fA-F]+$/.test(t) || t.length > L.total / 4) {
        $hex.classList.add('bad'); return;
      }
      typed = '';
      bits = BigInt('0x' + t);
      draw();
    });

    /* ---------------------- 启动 ---------------------- */
    bits = fromValue(12.375);            // 一个够典型又能手算验证的默认值
    root.querySelector('[data-prec="32"]').classList.add('on');
    drawBits(); drawPresets(); draw();
  },
});


/* ==========================================================================
   工具的说明页
   ========================================================================== */

KM.page({
  path: 'tools/co/ieee754',
  title: 'IEEE 754 位模式',
  subtitle: '把 32 / 64 个二进制位拨来拨去，看它们怎么合成一个浮点数',
  tags: ['交互工具', '组成原理'],
  updated: '2026-08-11',

  blocks: [

    { t: 'md', c: String.raw`
      浮点数这一节，==所有的困惑最后都能落到"这 32 位到底怎么解释"上==。
      与其记结论，不如自己拨几下：把阶码全拨成 1 看看变成什么，
      把最小的那位尾数拨掉看看数变了多少。

      配套的知识页在这两处：
      [IEEE 754 的表示与范围](#/co/data/float?at=format) ·
      [浮点运算的五步](#/co/data/float-op?at=five-steps)。
    ` },

    { t: 'tool', id: 'widget', use: 'ieee754' },

    { t: 'method', id: 'how-to-use', title: '拿它验证什么（按考点排）', c: String.raw`
      1. **手算互转的对答案**：自己把 $-12.75$ 转成十六进制，再在"十进制"框里输入
         $-12.75$ 看是不是 $\texttt{C14C0000}$。转换方法见
         [十进制 → IEEE 754 的五步](#/co/data/float?at=dec-to-754)。
      2. **看清隐藏位**：改尾数 M 时，读数行里的"有效值 $1.M$"永远以 1 开头 ——
         那个 1 在位格里==根本不存在==。
      3. **摸边界**：点"最小规格化数"，再点一次"← 前一个可表示数"，
         阶码就掉成全 0 变成非规格化数。==这就是渐进下溢的现场==。
      4. **理解精度**：读数最后一行"相邻间隔"就是 ulp。
         输入 $1$ 时它是 $2^{-23}$，输入 $10^{20}$ 时它已经变成 $2^{43}$
         —— 比 $1$ 大得多，所以 $10^{20}+1$ 一定原地不动。
      5. **看精度丢失**：输入 $0.1$，看提示行给出的实际存储值。
    ` },

    { t: 'key', id: 'what-it-computes', title: '读数里的"精确值"是真的精确', c: String.raw`
      工具没有用浮点去算浮点：位模式存在大整数（BigInt）里，
      "精确值"是用 $\text{尾数}\times 2^{\text{指数}}$ 的整数运算展开出来的。

      所以输入 $0.1$ 时看到的
      $0.1000000014901161193847656250$ 是==这个位模式代表的真实数值==，
      而不是又一次四舍五入的结果。大字那一行才是 JS 的默认显示
      （最短的、能往返回同一位模式的写法）。
    ` },

  ],
});
