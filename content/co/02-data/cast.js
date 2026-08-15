/* ==========================================================================
   计算机组成原理 / 2 数据的表示和运算 / C 语言的整数类型与类型转换
   —— 整数之间的转换（截断 / 扩展 / 重解释）。
      涉及浮点的那几种转换在 float 页的「七、C 语言里的类型转换」。
   ========================================================================== */

KM.page({
  path: 'co/data/cast',
  title: 'C 语言的整数类型与类型转换',
  subtitle: '字长变化按**原类型**处理，符号解释按**目标类型**处理 —— 顺序反了就全错',
  tags: ['高频', '必考', '真题', '概念辨析'],
  updated: '2026-08-11',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'rules', c: '一、所有转换只有三件事' },

    { t: 'key', id: 'three-rules', title: '底层永远只做这三种动作', c: String.raw`
      C 里的类型转换看起来花样很多，落到机器上只有三种动作：

      | 动作 | 什么时候发生 | 干什么 |
      |---|---|---|
      | **重解释** | 字长相同、符号不同（$\texttt{int}\leftrightarrow\texttt{unsigned}$） | ==位模式一个比特都不动==，只换读法 |
      | **截断** | 长 → 短（$\texttt{int}\to\texttt{short}$） | 丢掉高位，只留低位 |
      | **扩展** | 短 → 长（$\texttt{short}\to\texttt{int}$） | 高位补齐，补 0 还是补符号位看**原类型** |

      ==转换从来不做"四舍五入"或"取最接近的值"这类事==，
      它只是把一串位按新规矩重新读一遍。想清楚"位怎么动"，答案就出来了。
    ` },

    { t: 'key', id: 'order-rule', title: '★ 字长和符号同时变时，顺序是死的', c: String.raw`
      $$\boxed{\text{先按\textbf{原类型}改字长（扩展 / 截断），再按\textbf{目标类型}解释符号}}$$

      两句话拆开记：

      - ==补位补什么，看**原来**是什么类型==（原来有符号就补符号位，无符号就补 0）；
      - ==补完怎么读，看**要变成**什么类型==（目标是无符号就当无符号读）。

      顺序反了会在**错误的位宽上取模**，得到一个看起来很像、其实差了几个数量级的答案 ——
      [这道题](#/co/data/cast?at=ex-short-unsigned)的干扰项就是专门为顺序反了的人准备的。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'truncate', c: '二、长转短：截断' },

    { t: 'key', id: 'trunc-mod', title: '截断 = 对 $2^k$ 取模', c: String.raw`
      把 $n$ 位截成 $k$ 位，就是丢掉第 $k$ 位及以上的所有位，等价于

      $$x \bmod 2^{k}$$

      然后==把留下来的 $k$ 位按**目标类型**重新解释==：

      - 目标是无符号：值就是 $x\bmod 2^k$；
      - 目标是有符号：还要看第 $k-1$ 位（新的最高位）——
        ==它要是 1，这个数就变成负的了==。

      **危险就在这一步**：原来是数值位的那一位，截断后可能==摇身一变成了符号位==。
    ` },

    { t: 'diagram', id: 'trunc-demo', title: '32777 装进 short 的现场',
      note: '红格就是那个换了身份的比特',
      caption: String.raw`==截断不改动任何一个保留下来的比特==，改的是"怎么读它们"。差值恒为 $2^{16}$ 的原因就在红格：它的权重从 $+2^{15}$ 变成了 $-2^{15}$。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 270" role="img" aria-label="32777 截断成 short 时，第 15 位从数值位变成符号位">
  <text class="cap" x="0" y="14">int i = 32777 = 2¹⁵ + 9　（32 位）</text>
  <g class="n m"><rect x="20" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="28.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="37" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="45.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="54" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="62.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="71" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="79.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="93" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="101.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="110" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="118.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="127" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="135.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="144" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="152.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="166" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="174.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="183" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="191.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="200" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="208.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="217" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="225.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="239" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="247.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="256" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="264.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="273" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="281.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="290" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="298.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n r"><rect x="321" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="329.0" y="37.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="338" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="346.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="355" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="363.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="372" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="380.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="394" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="402.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="411" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="419.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="428" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="436.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="445" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="453.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="467" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="475.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="484" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="492.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="501" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="509.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="518" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="526.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="540" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="548.0" y="37.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="557" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="565.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="574" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="582.0" y="37.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="591" y="24" width="16" height="26" rx="3"/><text class="bt xs" x="599.0" y="37.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="20" y="66">高 16 位：直接丢弃</text>
  <text class="lb" x="321" y="66">低 16 位：原样保留</text>
  <text class="cap" x="0" y="104">short si —— 同样这 16 个比特，换个类型读</text>
  <g class="n r"><rect x="321" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="329.0" y="127.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="338" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="346.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="355" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="363.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="372" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="380.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="394" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="402.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="411" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="419.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="428" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="436.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="445" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="453.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="467" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="475.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="484" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="492.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="501" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="509.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="518" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="526.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="540" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="548.0" y="127.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="557" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="565.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="574" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="582.0" y="127.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="591" y="114" width="16" height="26" rx="3"/><text class="bt xs" x="599.0" y="127.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <path class="ar" d="M329,164 V144"/>
  <g class="n a"><rect x="20" y="172" width="300" height="62" rx="8"/><text class="bt sm" x="170.0" y="193.0" text-anchor="middle" dominant-baseline="central">si 的真值 = −2¹⁵ + 9</text><text class="bs" x="170.0" y="213.0" text-anchor="middle" dominant-baseline="central">= −32768 + 9 = −32759</text></g>
  <g class="n r"><rect x="336" y="172" width="340" height="62" rx="8"/><text class="bt sm" x="506.0" y="193.0" text-anchor="middle" dominant-baseline="central">红格那一位的身份变了</text><text class="bs" x="506.0" y="213.0" text-anchor="middle" dominant-baseline="central">在 int 里权重 +2¹⁵，在 short 里权重 −2¹⁵</text></g>
  <text class="cap" x="0" y="258">权重从 +32768 翻成 −32768，一来一回正好差 65536 = 2¹⁶</text>
</svg>
` },

    { t: 'warn', id: 'trunc-danger', title: '截断不可逆，扩展可逆', c: String.raw`
      很多人栽在"转出去再转回来应该还是原来的数"上。事实是：

      - ==长 → 短会**丢信息**，丢了就找不回来==；
      - ==短 → 长只是补位，**不丢信息**，值不变==。

      所以 $\texttt{int}\to\texttt{short}\to\texttt{int}$ 这一圈下来，
      ==损失全部发生在第一步==，第二步再忠实也救不回来。

      反过来 $\texttt{short}\to\texttt{int}\to\texttt{short}$ 一定还原，
      因为第一步没丢东西。
    ` },

    { t: 'example',
      id: 'ex-int-short',
      title: 'int → short → int 绕一圈',
      source: '真题 / 错题',
      level: 2,
      problem: String.raw`
        C 语言代码如下（$\texttt{int}$ 为 32 位，$\texttt{short}$ 为 16 位）：

        ~~~c
        int   i  = 32777;
        short si = i;
        int   j  = si;
        ~~~

        执行上述代码段后，$j$ 的值为（　）。

        **A.** $-32777$　　**B.** $-32759$　　**C.** $32759$　　**D.** $32777$
      `,
      idea: String.raw`
        ==先问一句：$32777$ 装得进 short 吗？==

        short 的范围是 $[-32768,\ 32767]$，而 $32777>32767$ ——
        装不进去，那就必然发生截断，==答案里带 32777 的那个（D）先划掉==。

        接着只要算清楚截断后那 16 位怎么读。$32777=2^{15}+9$，
        $2^{15}$ 这一位正好落在 short 的符号位上，所以结果一定是**负数**。
      `,
      solution: String.raw`
        **① $\texttt{short si = i}$：截断**

        $$32777 = 2^{15}+9 = \texttt{0000 0000 0000 0000 1000 0000 0000 1001}_2$$

        取低 16 位：$\texttt{1000 0000 0000 1001}_2$

        最高位是 1，按补码读：

        $$si = -2^{15}+9 = -32768+9 = -32759$$

        **② $\texttt{int j = si}$：符号扩展**

        $si$ 是有符号数且为负，高 16 位全补 1：

        $$j=\texttt{1111 1111 1111 1111 1000 0000 0000 1001}_2$$

        ==符号扩展不改变数值==，所以

        $$\boxed{j=-32759\quad\text{选 B}}$$
      `,
      comment: String.raw`
        **四个选项的来历**：

        | 选项 | 怎么来的 |
        |---|---|
        | A. $-32777$ | 以为截断只是"加个负号" |
        | **B. $-32759$** | ✅ $-2^{15}+9$ |
        | C. $32759$ | 算对了大小但漏了符号 |
        | D. $32777$ | ==以为转出去再转回来值不变== |

        **一个能救命的快速判断**：$-32759$ 和 $32777$ 相差 $65536=2^{16}$。
        ==凡是截断题，正确答案和原值往往正好差一个 $2^{k}$==，
        看到选项里有这种关系，基本就锁定了。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'extend', c: '三、短转长：扩展' },

    { t: 'key', id: 'ext-rule', title: '补 0 还是补符号位，看**原类型**', c: String.raw`
      | 原类型 | 做法 | 名字 |
      |---|---|---|
      | 无符号（$\texttt{unsigned short}$ 等） | 高位==一律补 0== | 零扩展 |
      | 有符号（$\texttt{short}$、$\texttt{char}$） | 高位==一律补符号位==（正补 0、负补 1） | 符号扩展 |

      ==注意这张表里没有"目标类型"这一列==——
      补什么和你要转成什么毫无关系，只看它原来是什么。

      **符号扩展为什么不改变数值**：补码里高位补符号位，
      相当于在最高位反复展开 $-2^{n}+2^{n}=0$，加的都是 0。
      举个数：$-1$ 的 8 位补码是 $\texttt{1111 1111}$，
      扩到 16 位是 $\texttt{1111 1111 1111 1111}$，还是 $-1$。
    ` },

    { t: 'diagram', id: 'order-demo', title: 'short → unsigned int：两步的先后',
      note: '走错顺序会在 16 位上取模，差出一个数量级',
      caption: String.raw`口诀：==补位看原类型，解释看目标类型==。这两步的顺序是 C 标准规定死的，不是可以选的。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 298" role="img" aria-label="short 转 unsigned int：先扩展再解释，还是先解释再扩展">
  <text class="cap" x="0" y="14">short si = −32767　（16 位补码）</text>
  <g class="n r"><rect x="20" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="28.0" y="34.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="37" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="45.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="54" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="62.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="71" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="79.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="93" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="101.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="110" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="118.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="127" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="135.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="144" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="152.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="166" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="174.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="183" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="191.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="200" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="208.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="217" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="225.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="239" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="247.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="256" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="264.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="273" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="281.0" y="34.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="290" y="22" width="16" height="24" rx="3"/><text class="bt xs" x="298.0" y="34.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="20" y="62" width="656" height="24" rx="6"/><text class="bt xs" x="348.0" y="74.0" text-anchor="middle" dominant-baseline="central">✅ 正确：先按原类型（有符号）扩展，再按目标类型（无符号）解释</text></g>
  <g class="n g"><rect x="20" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="28.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="37" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="45.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="54" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="62.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="71" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="79.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="93" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="101.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="110" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="118.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="127" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="135.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="144" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="152.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="166" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="174.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="183" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="191.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="200" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="208.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="217" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="225.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="239" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="247.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="256" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="264.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="273" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="281.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="290" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="298.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="317" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="325.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="334" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="342.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="351" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="359.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="368" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="376.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="390" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="398.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="407" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="415.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="424" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="432.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="441" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="449.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="463" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="471.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="480" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="488.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="497" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="505.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="514" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="522.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="536" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="544.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="553" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="561.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="570" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="578.0" y="106.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="587" y="94" width="16" height="24" rx="3"/><text class="bt xs" x="595.0" y="106.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="20" y="136">① 符号扩展：高位补 1　　② 当无符号读 = 2³² − 32767 = 2³² − 2¹⁵ + 1　← 答案</text>
  <g class="n r"><rect x="20" y="152" width="656" height="24" rx="6"/><text class="bt xs" x="348.0" y="164.0" text-anchor="middle" dominant-baseline="central">❌ 反了：先在 16 位上按无符号解释，再补零扩展</text></g>
  <g class="n m"><rect x="20" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="28.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="37" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="45.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="54" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="62.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="71" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="79.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="93" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="101.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="110" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="118.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="127" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="135.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="144" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="152.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="166" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="174.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="183" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="191.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="200" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="208.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="217" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="225.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="239" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="247.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="256" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="264.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="273" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="281.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="290" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="298.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="317" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="325.0" y="196.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="334" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="342.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="351" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="359.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="368" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="376.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="390" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="398.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="407" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="415.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="424" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="432.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="441" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="449.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="463" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="471.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="480" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="488.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="497" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="505.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="514" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="522.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="536" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="544.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="553" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="561.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="570" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="578.0" y="196.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="587" y="184" width="16" height="24" rx="3"/><text class="bt xs" x="595.0" y="196.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="20" y="226">① 当无符号读 = 2¹⁶ − 32767 = 32769　　② 零扩展 → 得到 2¹⁵ + 1　← 干扰项</text>
  <g class="n a"><rect x="20" y="240" width="656" height="46" rx="8"/><text class="bt sm" x="348.0" y="253.0" text-anchor="middle" dominant-baseline="central">两条路都"算对了"，差别只在【在多少位上取模】</text><text class="bs" x="348.0" y="273.0" text-anchor="middle" dominant-baseline="central">2¹⁶ 还是 2³² —— 补位看原类型，解释看目标类型</text></g>
</svg>
` },

    { t: 'example',
      id: 'ex-short-unsigned',
      title: '带符号短整型 → 无符号整型',
      source: '真题 / 错题',
      level: 3,
      problem: String.raw`
        在 32 位计算机上执行下列 C 语言代码：

        ~~~c
        short si = -32767;
        unsigned int ui = si;
        ~~~

        则 $ui$ 的真值为（　）。

        **A.** $2^{15}-1$　　**B.** $2^{15}+1$　　**C.** $2^{32}-2^{15}-1$　　**D.** $2^{32}-2^{15}+1$
      `,
      idea: String.raw`
        这题同时改了两件事：==字长 16 → 32，符号 有 → 无==。
        只要抓住[顺序](#/co/data/cast?at=order-rule)就不会错：

        1. 扩展看**原类型** —— $si$ 是有符号的，所以是**符号扩展**，高位补 1；
        2. 解释看**目标类型** —— 补完之后当 $\texttt{unsigned int}$ 读。

        ==结果一定是"$2^{32}$ 减去一点点"的大数==，
        所以 A、B 这两个只有 $2^{15}$ 量级的选项，看一眼就能划掉。
      `,
      solution: String.raw`
        **① $-32767$ 的 16 位补码**

        $$32767=\texttt{0111 1111 1111 1111}_2\ \Rightarrow\
        -32767=\texttt{1000 0000 0000 0001}_2$$

        （$-32767=-2^{15}+1$，直接读也一样）

        **② 按原类型符号扩展到 32 位**（高 16 位补符号位 1）

        $$\texttt{1111 1111 1111 1111 1000 0000 0000 0001}_2$$

        **③ 按目标类型当无符号数读**

        位模式不变，只是最高位不再是符号位而是权重 $2^{31}$。
        有符号转无符号，数值上就是加一个 $2^{32}$：

        $$ui = 2^{32}+(-32767)=2^{32}-32767=2^{32}-(2^{15}-1)$$

        $$\boxed{ui=2^{32}-2^{15}+1\quad\text{选 D}}$$
      `,
      comment: String.raw`
        **四个选项全是"顺序 / 符号"的坑**：

        | 选项 | 数值 | 怎么来的 |
        |---|---|---|
        | A. $2^{15}-1$ | $32767$ | 直接把负号丢了 |
        | B. $2^{15}+1$ | $32769$ | ==顺序反了==：先在 16 位上取模（$2^{16}-32767$），再零扩展 |
        | C. $2^{32}-2^{15}-1$ | — | 符号扩展对了，但真值算成了 $-(2^{15}+1)$ |
        | **D. $2^{32}-2^{15}+1$** | — | ✅ $2^{32}-32767$ |

        ==B 是这道题最"贵"的错误答案==：它每一步的机制都用对了，
        只是把两步的先后调了个个儿，于是在 $2^{16}$ 而不是 $2^{32}$ 上取了模。

        **自查动作**：转换涉及"变长 + 变符号"时，先在草稿上写清楚
        「扩展依据谁、解释依据谁」这两个字，再动手。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'reinterpret', c: '四、同字长换符号：一个比特都不动' },

    { t: 'key', id: 'same-width', title: '只换读法，不换内容', c: String.raw`
      $\texttt{int}\leftrightarrow\texttt{unsigned int}$ 时，==内存里的位一动不动==，
      变的只是最高位怎么算：当符号位（权重 $-2^{31}$）还是当数值位（权重 $+2^{31}$）。

      于是有一个通用换算：设字长 $n$，

      $$\text{有符号}\ x<0\ \xrightarrow{\ \text{转无符号}\ }\ x+2^{n}$$
      $$\text{无符号}\ u\ge 2^{n-1}\ \xrightarrow{\ \text{转有符号}\ }\ u-2^{n}$$

      $x\ge0$ 或 $u<2^{n-1}$ 时，==真值不变==。

      | 32 位下 | 有符号 | 无符号 |
      |---|---|---|
      | $\texttt{0xFFFFFFFF}$ | $-1$ | $4294967295=2^{32}-1$ |
      | $\texttt{0x80000000}$ | $-2147483648=-2^{31}$ | $2147483648=2^{31}$ |
      | $\texttt{0x7FFFFFFF}$ | $2147483647$ | $2147483647$（相同） |
    ` },

    /* ================================================================== */
    { t: 'h', id: 'implicit', c: '五、不写强制转换也会转：隐式转换' },

    { t: 'warn', id: 'signed-unsigned-compare', title: '★ 有符号和无符号一起运算，有符号方"投降"', c: String.raw`
      同字长的有符号数和无符号数放在一起运算时，
      C 规定==把有符号数转成无符号数==，于是负数会变成一个巨大的正数。

      经典翻车现场（32 位）：

      | 表达式 | 直觉 | 实际 | 为什么 |
      |---|---|---|---|
      | $\texttt{-1 < 1u}$ | 真 | ==假== | $-1$ 变成 $2^{32}-1$，比 1 大 |
      | $\texttt{-1 > 0u}$ | 假 | ==真== | 同上 |
      | $\texttt{sizeof(int) - 5 > 0}$ | 假 | ==真== | $\texttt{sizeof}$ 是无符号，$4-5$ 变成 $2^{32}-1$ |

      **一句话**：==只要表达式里出现了 $\texttt{unsigned}$，就要立刻警觉==。
      循环里写 $\texttt{for (unsigned i = n; i >= 0; i--)}$ 是死循环，
      因为无符号数永远 $\ge 0$。

      另外还有**整型提升**：比 $\texttt{int}$ 短的类型（$\texttt{char}$、$\texttt{short}$）
      参与运算前会==先提升为 $\texttt{int}$==，提升时同样遵守
      [「补位看原类型」](#/co/data/cast?at=ext-rule)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '六、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **以为转换是可逆的**：==长→短会丢信息且不可逆==，见
         [这道题](#/co/data/cast?at=ex-int-short)。
      2. **扩展依据搞成目标类型**：==补 0 还是补符号位，只看原类型==。
      3. **变长 + 变符号时顺序做反**：==先按原类型改字长，再按目标类型解释==，见
         [这道题](#/co/data/cast?at=ex-short-unsigned)。
      4. **截断当成"取绝对值"或"取余数后仍为正"**：截断后最高位是 1 就是负数。
      5. **忘了有符号会向无符号看齐**：$\texttt{-1 < 1u}$ 是==假==。
      6. **默认 short 一定是 16 位**：C 标准只保证
         $\texttt{short}\le\texttt{int}\le\texttt{long}$，==考试题会明确告诉你位数，按题目给的算==。

      浮点相关的那几种转换（$\texttt{int}\leftrightarrow\texttt{float}\leftrightarrow\texttt{double}$）
      在[这里](#/co/data/float?at=c-cast)，机制完全不同 ——
      ==那边丢的是**精度**，这边丢的是**高位**==。
    ` },

  ],
});
