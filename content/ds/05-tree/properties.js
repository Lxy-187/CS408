/* ==========================================================================
   数据结构 / 5 树与二叉树 / 二叉树的性质与计数
   ========================================================================== */

KM.page({
  path: 'ds/tree/properties',
  title: '二叉树的性质与计数',
  subtitle: '五条性质、一个 $n_0=n_2+1$、一个卡特兰数 —— 选择题里出现频率最高的一页',
  tags: ['高频', '必考', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'terms', c: '一、术语：先把词统一了' },

    { t: 'key', id: 'basic-terms', title: '容易被题面绕进去的六个词', c: String.raw`
      | 术语 | 定义 | 提醒 |
      |---|---|---|
      | **结点的度** | 该结点的**孩子个数** | 不是"分支数"，二叉树里度只能是 $0/1/2$ |
      | **树的度** | 所有结点度的**最大值** | "度为 $m$ 的树"至少要有一个结点真的有 $m$ 个孩子 |
      | **层次 / 深度** | 根为第 $1$ 层，往下逐层 $+1$ | ==有的教材根为第 $0$ 层==，看题目约定 |
      | **树的高度** | 最大层次 | 空树高度 $0$，只有根时高度 $1$ |
      | **路径长度** | 路径上**分支的条数** | 不是结点数，==结点数 $-1$== |
      | **森林** | $m\ (m\ge 0)$ 棵互不相交的树 | ==$m=0$ 的空森林也是森林== |

      **两个必须分清的模型**：

      - **树**：结点的孩子==无序==（除非明说是有序树），且==不存在"空子树的位置"==；
      - **二叉树**：左右孩子==有序==，只有一个孩子时==必须说清是左是右==。

      所以==二叉树不是"度为 2 的树"==，它是一种独立定义的结构。
      "只有一个孩子"的结点在树里只有 1 种形态，在二叉树里有 ==2 种==。
    ` },

    { t: 'key', id: 'special-trees', title: '满二叉树 / 完全二叉树 / 平衡二叉树', c: String.raw`
      - **满二叉树**：高度为 $h$ 且恰有 $2^h-1$ 个结点 ——
        ==每一层都被塞满==，除叶子外每个结点都有两个孩子。
      - **完全二叉树**：结点编号与同高度满二叉树==前 $n$ 个编号一一对应==。
        直观说法是"==从上到下、从左到右连续填，中间不能留洞=="。
      - **平衡二叉树（AVL）**：任一结点的左右子树==高度差绝对值 $\le 1$==（见 [AVL 的定义与旋转](#/ds/tree/bst?at=avl-def)）。

      ==满二叉树一定是完全二叉树，反之不然==。
      判完全二叉树的机械做法见[层序遍历那一节](#/ds/tree/traversal?at=is-complete)。
    ` },

    { t: 'diagram', id: 'full-vs-complete', title: '满 / 完全 / 非完全，一眼区分',
      note: '灰色 = 空缺的位置',
      caption: String.raw`判断的关键不是"看起来整齐"，而是==按层序编号后，编号是否连续==。
      中间那棵树 $9$ 号缺失、$10$ 号存在，编号出现空洞，所以==不是==完全二叉树。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 208" role="img" aria-label="满二叉树、完全二叉树、非完全二叉树三者的对比">
  <text class="cap" x="14" y="16">满二叉树（7 个结点，高 3）</text>
  <path class="ar plain" d="M96,42 L60,88"/><path class="ar plain" d="M96,42 L132,88"/>
  <path class="ar plain" d="M60,88 L36,134"/><path class="ar plain" d="M60,88 L84,134"/>
  <path class="ar plain" d="M132,88 L108,134"/><path class="ar plain" d="M132,88 L156,134"/>
  <g class="n g"><rect x="82" y="28" width="28" height="28" rx="14"/><text class="bt xs" x="96" y="42" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="46" y="74" width="28" height="28" rx="14"/><text class="bt xs" x="60" y="88" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n g"><rect x="118" y="74" width="28" height="28" rx="14"/><text class="bt xs" x="132" y="88" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n g"><rect x="22" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="36" y="134" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n g"><rect x="70" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="84" y="134" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n g"><rect x="94" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="108" y="134" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n g"><rect x="142" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="156" y="134" text-anchor="middle" dominant-baseline="central">7</text></g>
  <text class="lb" x="96" y="176" text-anchor="middle">编号 1..7 连续且填满</text>
  <path class="sep" d="M234,20 V186"/>
  <text class="cap" x="256" y="16">完全二叉树（9 个结点）</text>
  <path class="ar plain" d="M356,42 L320,88"/><path class="ar plain" d="M356,42 L392,88"/>
  <path class="ar plain" d="M320,88 L296,134"/><path class="ar plain" d="M320,88 L344,134"/>
  <path class="ar plain" d="M392,88 L368,134"/><path class="ar plain" d="M392,88 L416,134"/>
  <path class="ar plain" d="M296,134 L284,178"/><path class="ar plain" d="M296,134 L308,178"/>
  <g class="n g"><rect x="342" y="28" width="28" height="28" rx="14"/><text class="bt xs" x="356" y="42" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="306" y="74" width="28" height="28" rx="14"/><text class="bt xs" x="320" y="88" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n g"><rect x="378" y="74" width="28" height="28" rx="14"/><text class="bt xs" x="392" y="88" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n g"><rect x="282" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="296" y="134" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n g"><rect x="330" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="344" y="134" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n g"><rect x="354" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="368" y="134" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n g"><rect x="402" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="416" y="134" text-anchor="middle" dominant-baseline="central">7</text></g>
  <g class="n g"><rect x="270" y="164" width="28" height="28" rx="14"/><text class="bt xs" x="284" y="178" text-anchor="middle" dominant-baseline="central">8</text></g>
  <g class="n g"><rect x="294" y="164" width="28" height="28" rx="14"/><text class="bt xs" x="308" y="178" text-anchor="middle" dominant-baseline="central">9</text></g>
  <path class="sep" d="M472,20 V186"/>
  <text class="cap" x="494" y="16">不是完全二叉树</text>
  <path class="ar plain" d="M594,42 L558,88"/><path class="ar plain" d="M594,42 L630,88"/>
  <path class="ar plain" d="M558,88 L534,134"/><path class="ar plain" d="M558,88 L582,134"/>
  <path class="ar plain" d="M630,88 L606,134"/><path class="ar plain" d="M630,88 L654,134"/>
  <path class="ar plain" d="M534,134 L546,178"/>
  <g class="n k"><rect x="580" y="28" width="28" height="28" rx="14"/><text class="bt xs" x="594" y="42" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="544" y="74" width="28" height="28" rx="14"/><text class="bt xs" x="558" y="88" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n k"><rect x="616" y="74" width="28" height="28" rx="14"/><text class="bt xs" x="630" y="88" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n k"><rect x="520" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="534" y="134" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n k"><rect x="568" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="582" y="134" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n k"><rect x="592" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="606" y="134" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n k"><rect x="640" y="120" width="28" height="28" rx="14"/><text class="bt xs" x="654" y="134" text-anchor="middle" dominant-baseline="central">7</text></g>
  <g class="n m"><rect x="520" y="164" width="28" height="28" rx="14"/><text class="bt xs" x="534" y="178" text-anchor="middle" dominant-baseline="central">8</text></g>
  <g class="n r"><rect x="532" y="164" width="28" height="28" rx="14"/><text class="bt xs" x="546" y="178" text-anchor="middle" dominant-baseline="central">9</text></g>
  <text class="lb" x="594" y="176" text-anchor="middle">8 号空着却有 9 号</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'five', c: '二、五条性质（必须背到能倒着用）' },

    { t: 'formulas', id: 'five-formulas', title: '二叉树的五条基本性质', items: [
      { label: '① 第 $i$ 层最多的结点数', tex: String.raw`2^{\,i-1}\quad(i\ge 1)` },
      { label: '② 高为 $h$ 的二叉树最多的结点数', tex: String.raw`2^{h}-1` },
      { label: '③ 叶子数与度为 2 的结点数', tex: String.raw`n_0=n_2+1` },
      { label: '④ 含 $n$ 个结点的完全二叉树的高度', tex: String.raw`h=\lceil \log_2(n+1)\rceil=\lfloor \log_2 n\rfloor+1` },
      { label: '⑤ 完全二叉树中编号 $i$ 的父结点', tex: String.raw`\lfloor i/2\rfloor,\ \ \text{左孩子}\ 2i,\ \ \text{右孩子}\ 2i+1` },
    ] },

    { t: 'key', id: 'proof-n0n2', title: '$n_0=n_2+1$ 的证明：数两遍边', c: String.raw`
      这条性质==每年都考==，而且它的证法可以迁移到"度为 $m$ 的树"上，值得真正记住。

      **从结点数看**：
      $$n=n_0+n_1+n_2$$

      **从边数看**：除根之外每个结点头上恰有一条边，所以边数 $=n-1$；
      而每条边都是某个结点"射出去"的，度为 $1$ 的结点射出 $1$ 条、度为 $2$ 的射出 $2$ 条：
      $$n-1=n_1+2n_2$$

      两式相减：
      $$n_0+n_1+n_2-1=n_1+2n_2\ \Longrightarrow\ \boxed{n_0=n_2+1}$$

      ==注意 $n_1$ 被消掉了== —— 这就是为什么"叶子数只和度为 2 的结点数有关，
      和度为 1 的结点有多少个完全无关"。
    ` },

    { t: 'key', id: 'general-tree-count', title: '推广：一般树 / $m$ 叉树的同类结论', c: String.raw`
      同样"数两遍边"的手法，对任何树都成立：

      $$n=1+\sum_{i\ge 1} i\cdot n_i \qquad\text{（结点数 = 1 + 边数）}$$

      其中 $n_i$ 是度为 $i$ 的结点数。展开就是各种题面的样子，例如
      "一棵树有 $n_1$ 个度为 1、$n_2$ 个度为 2、$n_3$ 个度为 3 的结点，问叶子数"：

      $$n_0+n_1+n_2+n_3 = 1 + n_1+2n_2+3n_3 \ \Longrightarrow\ n_0 = 1+n_2+2n_3$$

      $m$ 叉树的另外三条：

      | 结论 | 公式 |
      |---|---|
      | 第 $i$ 层最多结点数 | $m^{\,i-1}$ |
      | 高为 $h$ 时最多结点数 | $\dfrac{m^{h}-1}{m-1}$ |
      | 含 $n$ 个结点时的**最小**高度 | $\lceil \log_m\big(n(m-1)+1\big)\rceil$ |

      ==最小高度那条由"高为 $h$ 最多装 $\frac{m^h-1}{m-1}$ 个"反解得到==，别硬背。
    ` },

    { t: 'key', id: 'complete-counts', title: '完全二叉树的三个附加结论（选择题常客）', c: String.raw`
      设完全二叉树有 $n$ 个结点：

      1. ==度为 1 的结点最多只有 1 个==（只可能出现在"最后一个分支结点"上），且
         $$n_1=\begin{cases}1,& n\ \text{为偶数}\\ 0,& n\ \text{为奇数}\end{cases}$$
      2. 叶子数固定为
         $$n_0=\left\lceil \frac{n}{2}\right\rceil$$
         最好用的记法不是这个公式，而是：==编号 $>\lfloor n/2\rfloor$ 的结点全是叶子==，
         所以 $n_0=n-\lfloor n/2\rfloor=\lceil n/2\rceil$。
         再由 $n_2=n_0-1$ 和 $n_1=n-n_0-n_2$ 把另外两个补齐即可。
      3. 编号 $i$ 所在的层次为 $\lfloor \log_2 i\rfloor+1$。

      **推论**：完全二叉树里==分支结点恰好是编号 $1\sim\lfloor n/2\rfloor$ 的那些==。
      [堆排序建堆时从 $\lfloor n/2\rfloor$ 开始向前调整](#/ds/sort/select-heap?at=build-heap)，
      用的正是这一条。
    ` },

    { t: 'diagram', id: 'index-rule', title: '顺序存储：下标算术就是"指针"',
      note: '编号从 1 开始，第 0 个位置空着不用',
      caption: String.raw`只要==从下标 1 开始存==，父子关系就退化成纯算术：父 $\lfloor i/2\rfloor$、左 $2i$、右 $2i+1$。
      ==这就是堆能用数组实现的全部原因==。若从下标 $0$ 开始存，则要改成父 $\lfloor (i-1)/2\rfloor$、左 $2i+1$、右 $2i+2$ ——
      两套千万别混。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 224" role="img" aria-label="完全二叉树的顺序存储与下标算术关系">
  <path class="ar plain" d="M300,42 L228,92"/><path class="ar plain" d="M300,42 L372,92"/>
  <path class="ar plain" d="M228,92 L192,142"/><path class="ar plain" d="M228,92 L264,142"/>
  <path class="ar plain" d="M372,92 L336,142"/>
  <g class="n p"><rect x="286" y="28" width="28" height="28" rx="14"/><text class="bt xs" x="300" y="42" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="214" y="78" width="28" height="28" rx="14"/><text class="bt xs" x="228" y="92" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n k"><rect x="358" y="78" width="28" height="28" rx="14"/><text class="bt xs" x="372" y="92" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n k"><rect x="178" y="128" width="28" height="28" rx="14"/><text class="bt xs" x="192" y="142" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n k"><rect x="250" y="128" width="28" height="28" rx="14"/><text class="bt xs" x="264" y="142" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n k"><rect x="322" y="128" width="28" height="28" rx="14"/><text class="bt xs" x="336" y="142" text-anchor="middle" dominant-baseline="central">6</text></g>
  <text class="lb em" x="252" y="66">2i</text>
  <text class="lb em" x="342" y="66">2i+1</text>
  <text class="cap" x="430" y="60">父 = ⌊i/2⌋</text>
  <text class="cap" x="430" y="82">左 = 2i　右 = 2i+1</text>
  <text class="cap" x="430" y="104">层次 = ⌊log₂ i⌋ + 1</text>
  <text class="cap" x="430" y="126">i ＞ ⌊n/2⌋ ⇒ 一定是叶子</text>
  <text class="cap" x="14" y="184">数组</text>
  <g class="n m"><rect x="62" y="166" width="44" height="34" rx="5"/><text class="bt sm" x="84" y="183" text-anchor="middle" dominant-baseline="central">—</text></g>
  <g class="n p"><rect x="110" y="166" width="44" height="34" rx="5"/><text class="bt sm" x="132" y="183" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="158" y="166" width="44" height="34" rx="5"/><text class="bt sm" x="180" y="183" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n k"><rect x="206" y="166" width="44" height="34" rx="5"/><text class="bt sm" x="228" y="183" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n k"><rect x="254" y="166" width="44" height="34" rx="5"/><text class="bt sm" x="276" y="183" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n k"><rect x="302" y="166" width="44" height="34" rx="5"/><text class="bt sm" x="324" y="183" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n k"><rect x="350" y="166" width="44" height="34" rx="5"/><text class="bt sm" x="372" y="183" text-anchor="middle" dominant-baseline="central">6</text></g>
  <text class="lb" x="84" y="216" text-anchor="middle">下标 0</text>
  <text class="lb" x="132" y="216" text-anchor="middle">1</text>
  <text class="lb" x="180" y="216" text-anchor="middle">2</text>
  <text class="lb" x="228" y="216" text-anchor="middle">3</text>
  <text class="lb" x="276" y="216" text-anchor="middle">4</text>
  <text class="lb" x="324" y="216" text-anchor="middle">5</text>
  <text class="lb" x="372" y="216" text-anchor="middle">6</text>
  <text class="cap" x="430" y="190">顺序存储只适合完全二叉树：</text>
  <text class="cap" x="430" y="210">单支树要占 2ʰ−1 个格子，浪费到不可用</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'catalan', c: '三、计数：$n$ 个结点能搭出多少棵不同的二叉树' },

    { t: 'key', id: 'catalan-def', title: '卡特兰数', c: String.raw`
      $n$ 个**不同**结点（或 $n$ 个相同结点，只数**形态**）能构成的二叉树棵数是

      $$b_n=\frac{1}{n+1}\binom{2n}{n}=\frac{(2n)!}{n!\,(n+1)!}$$

      前几项要背下来：

      $$b_0=1,\ b_1=1,\ b_2=2,\ b_3=5,\ b_4=14,\ b_5=42,\ b_6=132$$

      **递推来源**（比公式更该记）：枚举左子树有 $k$ 个结点，则右子树有 $n-1-k$ 个：

      $$b_n=\sum_{k=0}^{n-1} b_k\, b_{\,n-1-k}$$

      ==$n=3$ 时 $b_3=b_0b_2+b_1b_1+b_2b_0=2+1+2=5$==，考场上现推也很快。
    ` },

    { t: 'key', id: 'catalan-links', title: '同一个数字的三张面孔', c: String.raw`
      卡特兰数在 408 里至少有三个化身，==看到"5、14、42"就该警觉==：

      1. $n$ 个结点的**二叉树形态数**；
      2. $n$ 个元素依次进栈，可能的**出栈序列个数**；
      3. $n$ 对括号的**合法匹配方案数**。

      它们同构的理由：把"进栈"看成"向下走一层建左子树"、"出栈"看成"回退"，
      一棵二叉树的先序遍历轨迹就是一个合法的进出栈序列。

      ==注意区分"形态数"和"排列数"==：
      若题目问的是"$n$ 个**互不相同的关键字**能构成多少棵不同的二叉树"，
      答案是 $b_n\cdot n!$（先定形态、再往结点上放值）；
      而"多少棵不同的**二叉排序树**"则仍是 ==$b_n$==（BST 的值一旦定了形态就唯一）。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '四、例题' },

    { t: 'example', id: 'ex-n0',
      title: '已知部分度数，反求叶子数',
      source: '选择题高频',
      level: 2,
      problem: String.raw`
        (1) 一棵二叉树有 $\texttt{15}$ 个度为 $2$ 的结点、$\texttt{6}$ 个度为 $1$ 的结点，
        问它一共有多少个结点？

        (2) 一棵完全二叉树有 $\texttt{768}$ 个结点，问它有多少个叶子结点？高度是多少？
      `,
      idea: String.raw`
        (1) ==看到"度"就写 $n_0=n_2+1$==，别去画树。
        $n_2$ 给了，$n_0$ 立刻有，$n_1$ 也给了，加起来就是 $n$。
        题目故意给 $n_1$ 是为了让你以为它有用 —— ==它只在最后求和时用一次==。

        (2) 完全二叉树==不要用 $n_0=n_2+1$ 硬解==，
        直接用"==编号大于 $\lfloor n/2\rfloor$ 的都是叶子=="这条，一步出答案。
      `,
      solution: String.raw`
        **(1)** $n_0=n_2+1=15+1=16$，故

        $$n=n_0+n_1+n_2=16+6+15=\boxed{37}$$

        **(2)** $n=768$（偶数），$\lfloor n/2\rfloor=384$，
        编号 $1\sim 384$ 是分支结点，编号 $385\sim 768$ 全是叶子：

        $$n_0=768-384=\boxed{384}$$

        高度：$h=\lfloor \log_2 768\rfloor+1$。因为 $2^9=512\le 768<1024=2^{10}$，
        所以 $\lfloor \log_2 768\rfloor=9$，$h=\boxed{10}$。

        **交叉验证**：$n$ 为偶数 $\Rightarrow n_1=1$，
        于是 $n_2=768-384-1=383$，检查 $n_0=n_2+1=384$ ✓。
      `,
      comment: String.raw`
        **(2) 的另一种算法**：$h=\lceil\log_2(n+1)\rceil=\lceil\log_2 769\rceil=10$，
        两个公式结果必然一致，==算完用另一个验一遍是最省事的自查==。

        **变形题**：若把 (2) 改成 $767$ 个结点（奇数），
        则 $n_1=0$、$n_0=\lceil 767/2\rceil=384$、$n_2=383$，
        ==叶子数居然没变==。这是完全二叉树"奇数个结点时最后一个分支结点有两个孩子"的直接后果。
      `,
    },

    { t: 'example', id: 'ex-catalan',
      title: '数二叉树的形态',
      source: '选择题',
      level: 3,
      problem: String.raw`
        (1) $3$ 个结点能构成多少种不同形态的二叉树？

        (2) 关键字 $\{1,2,3\}$ 能构成多少棵不同的**二叉排序树**？多少棵不同的**二叉树**？

        (3) 高度为 $4$ 的二叉树最多有多少个结点？最少有多少个？
      `,
      idea: String.raw`
        (1)(2) 都是卡特兰数，==区别在"值能不能自由摆"==。
        BST 一旦形态定了，每个位置放哪个值就==被中序有序性钉死了==，所以棵数 = 形态数；
        普通二叉树可以任意摆，所以要再乘 $3!$。

        (3) "最多"是满二叉树，"最少"是==每层只有一个结点的单支树==。
        注意单支树的形态其实有 $2^{h-1}$ 种（每层可以选左或右），但结点数都是 $h$。
      `,
      solution: String.raw`
        **(1)** $b_3=\dfrac{1}{4}\dbinom{6}{3}=\dfrac{20}{4}=\boxed{5}$ 种。

        五种形态是：左单支、右单支、左折（先左后右）、右折（先右后左）、以及满的那棵。

        **(2)** 二叉排序树：$\boxed{5}$ 棵（与形态数相同）。
        普通二叉树：$b_3\times 3!=5\times 6=\boxed{30}$ 棵。

        **(3)** 最多 $2^4-1=\boxed{15}$ 个；最少 $\boxed{4}$ 个。
      `,
      comment: String.raw`
        **(2) 这一问是最容易丢分的地方**：题面只差"排序"两个字，答案差 $6$ 倍。
        自查方法是问自己一句 =="值还有选择的余地吗"== ——
        BST 里没有（中序必须升序），普通二叉树里有。

        **(3) 的常见错**：把"最少"答成 $1$。
        高度为 $4$ 意味着==至少存在一条长度为 3 的路径==，那条路径上就有 4 个结点。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **把二叉树当成"度为 2 的树"** —— 二叉树==左右有序==，且允许某结点只有右孩子；
         "度为 2 的树"里不存在"空的左孩子位置"这种说法。
      2. **$n_0=n_2+1$ 用到了一般树上** —— 一般树的对应式是 $n_0=1+\sum_{i\ge 2}(i-1)n_i$。
      3. **完全二叉树的 $n_1$ 忘了分奇偶** —— $n$ 偶数时 $n_1=1$，奇数时 $n_1=0$。
      4. **顺序存储从下标 0 开始却用 $2i$ 公式** —— ==从 0 开始必须用 $2i+1/2i+2$==。
      5. **高度公式两套混用** —— $\lceil\log_2(n+1)\rceil$ 与 $\lfloor\log_2 n\rfloor+1$
         结果相同，但==前者不能写成 $\lceil\log_2 n\rceil$==（$n=8$ 时会算成 3，正确是 4）。
      6. **"形态数"与"带标号的棵数"混淆** —— 见上面例题 (2)。
      7. **"路径长度"数成了结点数** —— 路径长度是==边数==。
      8. **默认根在第 1 层** —— 若题目说"根在第 0 层"，性质 ① 要改成 $2^i$。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      这一节的结论很多，==但真正需要"背"的只有 $n_0=n_2+1$ 和卡特兰数前几项==，
      其余全部能从"数两遍边"和"高为 $h$ 最多装多少"两句话现推。
      把你自己的推导习惯记在这里。
    ` },

  ],
});
