/* ==========================================================================
   数据结构 / 5 树与二叉树 / 树、森林与二叉树的转换
   ========================================================================== */

KM.page({
  path: 'ds/tree/forest',
  title: '树、森林与二叉树的转换',
  subtitle: '「左孩子右兄弟」一句话，把任意多叉树塞进二叉链表 —— 以及四种遍历的对应关系',
  tags: ['必考', '概念辨析', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'storage', c: '一、树的三种存储结构' },

    { t: 'key', id: 'why-hard', title: '树难存的原因：孩子个数不定', c: String.raw`
      二叉树好存，是因为==每个结点的指针数是固定的 2 个==。
      一般树的结点可能有 $0$ 个孩子，也可能有 $100$ 个，
      按最大度数开数组会浪费到不可接受。

      三种解法各有取舍，==核心差别在于"求双亲快"还是"求孩子快"==。
    ` },

    { t: 'compare', id: 'three-storage', title: '三种存储表示法',
      cols: ['表示法', '怎么存', '求双亲', '求孩子', '主要问题'],
      rows: [
        ['**双亲表示法**', '一维数组，每个元素存 `data` + 双亲下标', '✅ $O(1)$', '❌ 要扫整个数组', '不方便找孩子'],
        ['**孩子表示法**', '数组 + 每个结点挂一条孩子链表', '❌ 要扫所有链表', '✅ 快', '不方便找双亲'],
        ['**孩子兄弟表示法**', '每结点两个指针：`firstchild` + `nextsibling`', '❌ 不方便', '✅ 沿兄弟链走', '要找双亲得加第三个指针'],
      ] },

    { t: 'key', id: 'child-sibling', title: '★ 孩子兄弟表示法 = 树的二叉链表', c: String.raw`
      每个结点固定两个指针：

      - $\texttt{firstchild}$：指向==它的第一个孩子（长子）==；
      - $\texttt{nextsibling}$：指向==它的下一个兄弟==。

      口诀：**==左孩子，右兄弟==**。

      **关键观察**：这个结构的形状==就是一棵二叉树==（每结点恰两个指针域）。
      所以

      $$\boxed{\text{树 / 森林}\ \xrightarrow{\ \text{孩子兄弟表示}\ }\ \text{二叉树}}$$

      这不是"一种存储技巧"，而是==树与二叉树之间的一一对应==：
      任何关于树的问题都能翻译成二叉树的问题，反之亦然。
      408 里"树的遍历"从来不单独实现，都是转成二叉树来做的。
    ` },

    { t: 'code', id: 'cs-node', title: '孩子兄弟表示法的结点定义', lang: 'c',
      c: String.raw`
        typedef struct CSNode {
            ElemType data;
            struct CSNode *firstchild, *nextsibling;
        } CSNode, *CSTree;
      ` },

    /* ================================================================== */
    { t: 'h', id: 'convert', c: '二、树 → 二叉树' },

    { t: 'method', id: 'tree-to-bin', title: '三步画法：加线、抹线、旋转', c: String.raw`
      1. **加线**：在==所有相邻兄弟之间==连一条线；
      2. **抹线**：对每个结点，==只保留它与第一个孩子的连线==，
         与其余孩子的连线全部抹掉；
      3. **旋转**：把整棵图顺时针转 $45^\circ$，
         ==原来的"孩子连线"变成左斜下（左孩子），"兄弟连线"变成右斜下（右兄弟）==。

      **结果的两个固定特征**（可以用来自查）：

      - ==转换后的二叉树，根结点一定没有右子树==
        （因为树的根没有兄弟）；
      - ==结点总数不变==，每个结点在两边一一对应。
    ` },

    { t: 'diagram', id: 'convert-demo', title: '一棵树转成二叉树',
      note: '虚线 = 兄弟关系，实线 = 长子关系',
      caption: String.raw`左图里把兄弟用虚线连起来、只保留每个结点与长子的实线，就已经是右图了 ——
      =="旋转 45 度"只是为了画得好看，结构在第二步就已经定下来了==。
      注意右图的根 $\texttt{A}$ ==没有右子树==，这是"树转来的二叉树"的标志。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 288" role="img" aria-label="一棵一般树通过左孩子右兄弟法转换成二叉树">
  <text class="cap" x="150" y="14" text-anchor="middle">原来的树</text>
  <path class="ar plain" d="M150,30 L80,95"/>
  <path class="ar plain" d="M150,30 L150,95" opacity="0.35"/>
  <path class="ar plain" d="M150,30 L220,95" opacity="0.35"/>
  <path class="ar plain" d="M80,95 L50,160"/>
  <path class="ar plain" d="M80,95 L110,160" opacity="0.35"/>
  <path class="ar plain" d="M220,95 L220,160"/>
  <path class="ar dash plain" d="M98,95 H132"/>
  <path class="ar dash plain" d="M168,95 H202"/>
  <path class="ar dash plain" d="M68,160 H92"/>
  <g class="n p"><rect x="132" y="12" width="36" height="36" rx="18"/><text class="bt sm" x="150" y="30" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="62" y="77" width="36" height="36" rx="18"/><text class="bt sm" x="80" y="95" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n k"><rect x="132" y="77" width="36" height="36" rx="18"/><text class="bt sm" x="150" y="95" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="202" y="77" width="36" height="36" rx="18"/><text class="bt sm" x="220" y="95" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n k"><rect x="32" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="50" y="160" text-anchor="middle" dominant-baseline="central">E</text></g>
  <g class="n k"><rect x="92" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="110" y="160" text-anchor="middle" dominant-baseline="central">F</text></g>
  <g class="n k"><rect x="202" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="220" y="160" text-anchor="middle" dominant-baseline="central">G</text></g>
  <text class="lb" x="150" y="200" text-anchor="middle">虚线 = 新加的兄弟连线</text>
  <text class="lb" x="150" y="222" text-anchor="middle">浅色实线 = 要抹掉的"非长子"连线</text>
  <path class="sep" d="M320,20 V270"/>
  <text class="cap" x="500" y="14" text-anchor="middle">转换后的二叉树（左孩子右兄弟）</text>
  <path class="ar plain" d="M450,30 L412,82"/>
  <path class="ar dash plain" d="M412,82 L470,134"/>
  <path class="ar plain" d="M412,82 L374,134"/>
  <path class="ar dash plain" d="M374,134 L412,186"/>
  <path class="ar dash plain" d="M470,134 L528,186"/>
  <path class="ar plain" d="M528,186 L490,238"/>
  <g class="n p"><rect x="432" y="12" width="36" height="36" rx="18"/><text class="bt sm" x="450" y="30" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="394" y="64" width="36" height="36" rx="18"/><text class="bt sm" x="412" y="82" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n k"><rect x="356" y="116" width="36" height="36" rx="18"/><text class="bt sm" x="374" y="134" text-anchor="middle" dominant-baseline="central">E</text></g>
  <g class="n k"><rect x="452" y="116" width="36" height="36" rx="18"/><text class="bt sm" x="470" y="134" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="394" y="168" width="36" height="36" rx="18"/><text class="bt sm" x="412" y="186" text-anchor="middle" dominant-baseline="central">F</text></g>
  <g class="n k"><rect x="510" y="168" width="36" height="36" rx="18"/><text class="bt sm" x="528" y="186" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n k"><rect x="472" y="220" width="36" height="36" rx="18"/><text class="bt sm" x="490" y="238" text-anchor="middle" dominant-baseline="central">G</text></g>
  <text class="lb em" x="600" y="34">A 没有右子树</text>
  <text class="lb" x="360" y="270">实线 = 左指针（长子）　虚线 = 右指针（兄弟）</text>
</svg>
` },

    { t: 'key', id: 'forest-to-bin', title: '森林 → 二叉树：把根们也看成兄弟', c: String.raw`
      森林 $F=\{T_1,T_2,\dots,T_m\}$ 转二叉树，只多一句话：

      ==把各棵树的根 $T_1.root,\ T_2.root,\dots$ 也当成互为兄弟==，
      于是 $T_2$ 的根成为 $T_1$ 的根的右孩子，$T_3$ 的根成为 $T_2$ 的根的右孩子……

      **递归定义**：
      $$B(F)=\begin{cases}
      \varnothing, & F=\varnothing\\
      \text{根}=T_1.root,\ \text{左}=B(T_1\text{的子树森林}),\ \text{右}=B(\{T_2,\dots,T_m\}), & \text{否则}
      \end{cases}$$

      **反过来（二叉树 → 森林）的判别**：
      给一棵二叉树，==沿着根的右链走下来有几个结点，原森林就有几棵树==。
      根本身算第一棵，根的右孩子是第二棵的根，以此类推。

      所以：==根没有右子树 $\Rightarrow$ 原来是一棵树；根有右子树 $\Rightarrow$ 原来是森林==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'traversal-map', c: '三、遍历的对应关系（本节最重要的表）' },

    { t: 'key', id: 'tree-traversals', title: '树 / 森林自己的遍历方式', c: String.raw`
      **树**只有两种（没有"中序"，因为孩子多于两个时"中"没有意义）：

      - **先根遍历**：先访问根，再==依次==先根遍历每棵子树；
      - **后根遍历**：先==依次==后根遍历每棵子树，最后访问根。

      **森林**有两种：

      - **先序遍历**：访问 $T_1$ 的根 → 先序遍历 $T_1$ 的子树森林 → 先序遍历 $\{T_2,\dots\}$；
      - **中序遍历**（有的教材叫**后序**）：中序遍历 $T_1$ 的子树森林 → 访问 $T_1$ 的根 →
        中序遍历 $\{T_2,\dots\}$。

      另外还有**层次遍历**（用队列，和二叉树一样）。
    ` },

    { t: 'compare', id: 'map-table', title: '★ 三者遍历的等价关系（必背）',
      cols: ['树', '森林', '对应的二叉树'],
      rows: [
        ['**先根遍历**', '**先序遍历**', '==先序遍历=='],
        ['**后根遍历**', '**中序遍历**', '==中序遍历=='],
        ['—', '—', '后序遍历（三者中无对应）'],
      ] },

    { t: 'key', id: 'why-map', title: '为什么会这样对应（不要死背）', c: String.raw`
      转换后的二叉树里，某结点 $x$ 的

      - **左子树** = $x$ 在原树中的==全部子树森林==；
      - **右子树** = $x$ 的==全部后续兄弟及其子树==。

      于是二叉树的先序 $N\to L\to R$ 就是
      "先访问 $x$ → 再遍历 $x$ 的子树森林 → 再遍历 $x$ 的兄弟们"，
      这==正是树的先根遍历==。

      同理二叉树的中序 $L\to N\to R$ 是
      "先遍历 $x$ 的子树森林 → 访问 $x$ → 再遍历兄弟"，==正是后根遍历==。

      **至于二叉树的后序**：$L\to R\to N$ 意味着"先子树、再兄弟、最后自己"，
      而"自己"排在"兄弟"后面，在原树里==没有任何自然含义==，所以三者无对应。
      ==这是判断题的常客==：问"树的后根遍历对应二叉树的后序遍历吗"，答==否，对应中序==。
    ` },

    { t: 'example', id: 'ex-convert',
      title: '★ 转换 + 四种遍历序列',
      source: '经典题型',
      level: 3,
      problem: String.raw`
        已知一棵树的结构为：根 $\texttt{A}$ 有三个孩子 $\texttt{B}$、$\texttt{C}$、$\texttt{D}$；
        $\texttt{B}$ 有两个孩子 $\texttt{E}$、$\texttt{F}$；$\texttt{D}$ 有一个孩子 $\texttt{G}$。

        (1) 把它转换成二叉树；
        (2) 写出这棵树的**先根**、**后根**遍历序列；
        (3) 写出转换后二叉树的**先序**、**中序**、**后序**遍历序列，并验证对应关系。
      `,
      idea: String.raw`
        (1) ==别真的去"旋转 45 度"==，直接按定义填两个指针：
        每个结点的左指针 = 它的长子，右指针 = 它的下一个兄弟，一填就完事。

        (2)(3) 一个省时技巧：==只算一次，另一个直接抄==。
        树的先根 = 二叉树的先序，树的后根 = 二叉树的中序 ——
        所以真正要动手算的只有二叉树的**后序**那一个。
      `,
      solution: String.raw`
        **(1) 转换结果**（见[上方示意图](#/ds/tree/forest?at=convert-demo)）

        | 结点 | 左指针（长子） | 右指针（兄弟） |
        |---|---|---|
        | A | B | ==NULL== |
        | B | E | C |
        | C | NULL | D |
        | D | G | NULL |
        | E | NULL | F |
        | F | NULL | NULL |
        | G | NULL | NULL |

        **(2) 树的遍历**

        - 先根：访问 $\texttt{A}$ → 遍历子树 $\texttt{B}$（$\texttt{B},\texttt{E},\texttt{F}$）
          → 子树 $\texttt{C}$ → 子树 $\texttt{D}$（$\texttt{D},\texttt{G}$）
          $$\text{先根}=\texttt{A B E F C D G}$$
        - 后根：子树 $\texttt{B}$（$\texttt{E},\texttt{F},\texttt{B}$）→ $\texttt{C}$
          → 子树 $\texttt{D}$（$\texttt{G},\texttt{D}$）→ 最后 $\texttt{A}$
          $$\text{后根}=\texttt{E F B C G D A}$$

        **(3) 二叉树的遍历**

        $$\text{先序}=\texttt{A B E F C D G}\quad\checkmark\ \text{与树的先根一致}$$
        $$\text{中序}=\texttt{E F B C G D A}\quad\checkmark\ \text{与树的后根一致}$$
        $$\text{后序}=\texttt{F E G D C B A}$$

        后序的推导：$\text{post}(A)=\text{post}(B\text{子树})+A$；
        $\text{post}(B\text{子树})=\text{post}(E\text{子树})+\text{post}(C\text{子树})+B$；
        $\text{post}(E\text{子树})=\texttt{F E}$；
        $\text{post}(C\text{子树})=\text{post}(D\text{子树})+C=\texttt{G D C}$。
        拼起来即 $\texttt{F E}+\texttt{G D C}+\texttt{B}+\texttt{A}=\texttt{F E G D C B A}$。
      `,
      comment: String.raw`
        **注意 (3) 的后序序列 $\texttt{FEGDCBA}$ 在原树里没有意义** ——
        它既不是先根也不是后根，正好印证了"二叉树的后序在树上无对应"。

        **自查手法**：转换前后==结点个数必须相同==（本题 7 个），
        且==转换后二叉树的根一定没有右子树==。
        若你画出来的二叉树里 $\texttt{A}$ 有右孩子，说明你把 $\texttt{A}$ 当成森林里的第一棵树了。

        **变形**：若把题目改成"森林由两棵树组成：第一棵是 $\texttt{A}(\texttt{B},\texttt{C})$，
        第二棵是 $\texttt{D}(\texttt{G})$"，则转换后 ==$\texttt{A}$ 的右孩子就是 $\texttt{D}$==，
        序列也随之改变。==看清题目给的是树还是森林==。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'formula', c: '四、常考的计数换算' },

    { t: 'key', id: 'count-rules', title: '树 ↔ 二叉树的三个换算', c: String.raw`
      1. ==结点数不变==。
      2. **树中结点的度** 与 **二叉树中的位置**：
         若结点 $x$ 在原树中有 $k$ 个孩子，那么在二叉树中
         ==$x$ 的左子树的"右链"上恰好有 $k$ 个结点==（长子 + $k-1$ 个兄弟）。
      3. **叶子的对应**：==原树的叶子 $\iff$ 二叉树中"没有左孩子"的结点==。
         （注意不是"没有孩子"，因为叶子可能还有兄弟，即还有右孩子。）

      **由此可得一条爱考的结论**：
      $$\text{树的叶子数}=\text{对应二叉树中左指针为空的结点数}$$

      **另一条**：森林中树的棵数 $=$ ==对应二叉树的根的右链长度==（含根本身）。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **树的后根遍历答成对应二叉树的后序** —— ==对应的是中序==。
      2. **以为树也有"中根遍历"** —— ==树只有先根和后根==（森林才有中序）。
      3. **转换后的二叉树根带了右子树** —— 只有==森林==转过来才会这样。
      4. **抹线时保留错了孩子** —— 保留的是==第一个（最左）孩子==。
      5. **把"孩子兄弟表示法"当成一种独立结构** —— 它==就是二叉链表==，
         所以树的算法都能直接借用二叉树的代码。
      6. **求树的高度时套用二叉树公式** —— 转成二叉树后==高度会变==
         （兄弟被压成了右链），==不能用二叉树的高度当树的高度==。
      7. **原树叶子对应"二叉树的叶子"** —— 对应的是==左指针为空的结点==。
      8. **森林转二叉树时忘了把各树的根连成兄弟链** —— 会漏掉除第一棵外的所有树。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      一个容易记住的换视角方式：==二叉树的"右指针"根本不是"孩子"，它是"下一个"==。
      左指针沿着"深度"走，右指针沿着"同一层的队列"走。
      理解成这样之后，=="树的高度在转换后会变"和"根没有右子树"这两件事就都是显然的==。
    ` },

  ],
});
