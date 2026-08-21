/* ==========================================================================
   数据结构 / 5 树与二叉树 / 线索二叉树
   ========================================================================== */

KM.page({
  path: 'ds/tree/thread-tree',
  title: '线索二叉树',
  subtitle: '把 $n+1$ 个空指针废物利用，让二叉树在某种遍历序下变成一条双向链表',
  tags: ['必考', '概念辨析', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'why', c: '一、动机：两笔浪费' },

    { t: 'key', id: 'motivation', title: '空指针多，找前驱后继又贵', c: String.raw`
      **浪费一：空间。** $n$ 个结点的二叉链表有 $2n$ 个指针域，
      真正指向孩子的只有 $n-1$ 个，==剩下 $n+1$ 个全是 $\texttt{NULL}$==
      （推导见[二叉链表的空链域计数](#/ds/tree/traversal?at=binode)）。
      也就是说==一半以上的指针在闲着==。

      **浪费二：时间。** 二叉链表只能"从上往下"走。
      想知道"某结点在中序序列里的前驱 / 后继是谁"，
      唯一办法是==从根重新遍历一遍==，$O(n)$；
      而如果要把整棵树按中序反复扫，代价就更离谱了。

      **线索二叉树的做法**：用那 $n+1$ 个空指针，存放==该结点在某种遍历序下的前驱 / 后继==。
      这些指针叫**线索（thread）**，加线索的过程叫**线索化**。
    ` },

    { t: 'key', id: 'tag-def', title: '靠 tag 区分"孩子"还是"线索"', c: String.raw`
      同一个 $\texttt{lchild}$ 域现在有两种含义，必须加标志位区分：

      $$\texttt{ltag}=\begin{cases}0,& \texttt{lchild}\ \text{指向左孩子}\\ 1,& \texttt{lchild}\ \text{指向前驱线索}\end{cases}
      \qquad
      \texttt{rtag}=\begin{cases}0,& \texttt{rchild}\ \text{指向右孩子}\\ 1,& \texttt{rchild}\ \text{指向后继线索}\end{cases}$$

      ==这是 408 教材（严蔚敏）的约定：0 是孩子，1 是线索==。
      有些资料反过来，答题时先在草稿上写一句"本题约定 tag=1 为线索"，避免自己绕晕。

      每个结点多出 $2$ 个标志位（各 1 bit），==换来 $n+1$ 个可用指针==，非常划算。
    ` },

    { t: 'code', id: 'thread-node', title: '线索链表的结点定义', lang: 'c',
      c: String.raw`
        typedef struct ThreadNode {
            ElemType data;
            struct ThreadNode *lchild, *rchild;
            int ltag, rtag;               // 0=孩子指针  1=线索
        } ThreadNode, *ThreadTree;
      ` },

    { t: 'diagram', id: 'node-layout', title: '线索链表的结点结构',
      note: '两个 tag 各占 1 bit',
      caption: String.raw`结点由 5 个域组成。==$\texttt{lchild}$ / $\texttt{rchild}$ 的"意思"由旁边的 tag 决定==，
      所以任何遍历线索树的代码，==第一件事永远是先看 tag==，绝不能直接跟着指针走。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 128" role="img" aria-label="线索二叉树结点的五个域：lchild、ltag、data、rtag、rchild">
  <g class="n k"><rect x="90" y="24" width="112" height="44" rx="6"/><text class="bt sm" x="146" y="46" text-anchor="middle" dominant-baseline="central">lchild</text></g>
  <g class="n a"><rect x="202" y="24" width="56" height="44" rx="6"/><text class="bt sm" x="230" y="46" text-anchor="middle" dominant-baseline="central">ltag</text></g>
  <g class="n p"><rect x="258" y="24" width="112" height="44" rx="6"/><text class="bt sm" x="314" y="46" text-anchor="middle" dominant-baseline="central">data</text></g>
  <g class="n a"><rect x="370" y="24" width="56" height="44" rx="6"/><text class="bt sm" x="398" y="46" text-anchor="middle" dominant-baseline="central">rtag</text></g>
  <g class="n k"><rect x="426" y="24" width="112" height="44" rx="6"/><text class="bt sm" x="482" y="46" text-anchor="middle" dominant-baseline="central">rchild</text></g>
  <text class="cap" x="146" y="88" text-anchor="middle">左孩子 或 前驱</text>
  <text class="cap" x="482" y="88" text-anchor="middle">右孩子 或 后继</text>
  <text class="lb em" x="230" y="88" text-anchor="middle">0/1</text>
  <text class="lb em" x="398" y="88" text-anchor="middle">0/1</text>
  <text class="cap" x="314" y="112" text-anchor="middle">tag = 0 → 是孩子　　tag = 1 → 是线索</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'inorder-thread', c: '二、中序线索二叉树（最常考的一种）' },

    { t: 'diagram', id: 'inorder-list', title: '线索化之后，中序序列变成了一条双向链表',
      note: '仍以样例树 A B D E G C F 为例，中序为 D B G E A C F',
      caption: String.raw`图中只画了**线索**（虚线），真正的孩子指针没画。可以看到：
      ==每个空的 $\texttt{lchild}$ 都补上了中序前驱，每个空的 $\texttt{rchild}$ 都补上了中序后继==。
      非空的那些指针仍然指着孩子，所以==线索并没有把树变成链表，而是让树"同时也是"一条链表==。
      首结点 $\texttt{D}$ 的前驱和尾结点 $\texttt{F}$ 的后继都是空 —— 这两个空是==必然剩下的==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 214" role="img" aria-label="中序线索二叉树中，各结点的前驱线索与后继线索">
  <text class="cap" x="0" y="18">上方虚线 = ltag 为 1 的前驱线索</text>
  <path class="ar dash" d="M60,94 Q38,56 18,92"/>
  <path class="ar dash" d="M196,94 Q166,54 138,92"/>
  <path class="ar dash" d="M400,94 Q370,54 342,92"/>
  <path class="ar dash" d="M468,94 Q438,58 410,92"/>
  <path class="ar dash" d="M76,126 Q106,166 134,128"/>
  <path class="ar dash" d="M212,126 Q242,166 270,128"/>
  <path class="ar dash" d="M280,126 Q310,166 338,128"/>
  <path class="ar dash" d="M484,126 Q510,166 534,128"/>
  <g class="n m"><rect x="0" y="94" width="32" height="32" rx="5"/><text class="bt sm" x="16" y="110" text-anchor="middle" dominant-baseline="central">∧</text></g>
  <g class="n k"><rect x="40" y="94" width="56" height="32" rx="5"/><text class="bt sm" x="68" y="110" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n k"><rect x="108" y="94" width="56" height="32" rx="5"/><text class="bt sm" x="136" y="110" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n k"><rect x="176" y="94" width="56" height="32" rx="5"/><text class="bt sm" x="204" y="110" text-anchor="middle" dominant-baseline="central">G</text></g>
  <g class="n k"><rect x="244" y="94" width="56" height="32" rx="5"/><text class="bt sm" x="272" y="110" text-anchor="middle" dominant-baseline="central">E</text></g>
  <g class="n p"><rect x="312" y="94" width="56" height="32" rx="5"/><text class="bt sm" x="340" y="110" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="380" y="94" width="56" height="32" rx="5"/><text class="bt sm" x="408" y="110" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="448" y="94" width="56" height="32" rx="5"/><text class="bt sm" x="476" y="110" text-anchor="middle" dominant-baseline="central">F</text></g>
  <g class="n m"><rect x="520" y="94" width="32" height="32" rx="5"/><text class="bt sm" x="536" y="110" text-anchor="middle" dominant-baseline="central">∧</text></g>
  <text class="cap" x="0" y="200">下方虚线 = rtag 为 1 的后继线索</text>
  <text class="lb" x="580" y="100">B、E、A、C 的某一侧</text>
  <text class="lb" x="580" y="118">仍是真孩子指针</text>
</svg>
` },

    { t: 'code', id: 'in-thread-code', title: '中序线索化', lang: 'c',
      note: '就是中序遍历，只是把 visit 换成"补两根线索"',
      c: String.raw`
        void InThread(ThreadTree p, ThreadTree *pre) {
            if (p == NULL) return;
            InThread(p->lchild, pre);            // 左

            if (p->lchild == NULL) {             // 建前驱线索
                p->lchild = *pre;
                p->ltag = 1;
            }
            if (*pre != NULL && (*pre)->rchild == NULL) {
                (*pre)->rchild = p;              // 给"上一个结点"补后继线索
                (*pre)->rtag = 1;
            }
            *pre = p;                            // 当前结点成为下一轮的 pre

            InThread(p->rchild, pre);            // 右
        }

        void CreateInThread(ThreadTree T) {
            ThreadTree pre = NULL;
            if (T != NULL) {
                InThread(T, &pre);
                pre->rchild = NULL;              // 处理最后一个结点
                pre->rtag = 1;
            }
        }
      ` },

    { t: 'warn', id: 'thread-code-traps', title: '线索化代码的三个坑', c: String.raw`
      1. ==后继线索是"回头补"的==。当前结点 $p$ 的后继此刻还不知道是谁，
         所以代码里给 $p$ 建的是**前驱**线索，给 $\texttt{pre}$ 建的是**后继**线索。
         写反了就全乱。
      2. ==$\texttt{pre}$ 必须能被修改并带回上层==（C 里用二级指针或引用，
         408 答题一般写 $\texttt{ThreadTree \&pre}$）。
         写成普通局部变量，线索就只在一层里生效。
      3. ==最后一个结点要在遍历结束后单独处理==。
         它的后继不存在，循环里没人给它补，必须在 $\texttt{CreateInThread}$ 里收尾。
    ` },

    { t: 'method', id: 'in-succ', title: '在中序线索树上找前驱 / 后继', c: String.raw`
      **求中序后继**（记住这两句就够）：

      - $\texttt{p->rtag == 1}$ → 后继就是 $\texttt{p->rchild}$，==$O(1)$==；
      - $\texttt{p->rtag == 0}$ → 后继是==右子树中最左下的结点==（一路 $\texttt{lchild}$ 走到 $\texttt{ltag==1}$）。

      **求中序前驱**（完全对称）：

      - $\texttt{p->ltag == 1}$ → 前驱就是 $\texttt{p->lchild}$；
      - $\texttt{p->ltag == 0}$ → 前驱是==左子树中最右下的结点==。

      **求整棵树中序的第一个结点**：从根出发一路走 $\texttt{lchild}$，
      直到 $\texttt{ltag == 1}$ 为止 —— ==最左下角那个==。
    ` },

    { t: 'code', id: 'in-traverse', title: '不用栈、不用递归地中序遍历', lang: 'c',
      note: '这才是线索化真正的收益：O(1) 空间',
      c: String.raw`
        ThreadNode *FirstNode(ThreadNode *p) {        // 以 p 为根的子树中序第一个
            while (p->ltag == 0) p = p->lchild;
            return p;
        }

        ThreadNode *NextNode(ThreadNode *p) {         // p 的中序后继
            if (p->rtag == 0) return FirstNode(p->rchild);
            return p->rchild;
        }

        void InOrderThread(ThreadTree T) {
            for (ThreadNode *p = FirstNode(T); p != NULL; p = NextNode(p))
                visit(p);
        }
      ` },

    { t: 'key', id: 'benefit', title: '收益到底是什么（这是简答题的答点）', c: String.raw`
      | | 普通二叉链表 | 中序线索链表 |
      |---|---|---|
      | 中序遍历时间 | $O(n)$ | $O(n)$ |
      | 中序遍历**空间** | $O(h)$（递归栈 / 显式栈） | ==$O(1)$== |
      | 求某结点的中序后继 | $O(n)$（要重新遍历） | ==平均 $O(1)$、最坏 $O(h)$== |
      | 插入 / 删除结点 | 简单 | ==麻烦，要顺带维护线索== |

      ==线索化换来的是"遍历不用栈"和"就地找前驱后继"，代价是修改树变复杂==。
      所以它适合==建好之后很少改动、但要反复按序访问==的场景。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pre-post', c: '三、先序 / 后序线索树：不对称的难处' },

    { t: 'compare', id: 'three-compare', title: '三种线索树找前驱 / 后继的难易',
      cols: ['线索树', '求后继', '求前驱', '要不要父指针'],
      rows: [
        ['中序', '✅ 容易', '✅ 容易', '不要'],
        ['先序', '✅ 容易', '❌ 难', '求前驱要'],
        ['后序', '❌ 难', '✅ 容易', '求后继要'],
      ] },

    { t: 'key', id: 'pre-rules', title: '先序线索树：后继好求，前驱难求', c: String.raw`
      **求先序后继**（先序是"根左右"，后继就在自己脚下）：

      - $\texttt{ltag == 0}$（有左孩子）→ 后继是==左孩子==；
      - 否则若 $\texttt{rtag == 0}$（有右孩子）→ 后继是==右孩子==；
      - 否则 $\texttt{rchild}$ 就是后继线索。

      **求先序前驱**：前驱一定在==自己的"上方"==，而线索树里没有向上的指针，所以

      - 若 $p$ 是父的**左孩子** → 前驱是==父==；
      - 若 $p$ 是父的**右孩子**且父==没有左子树== → 前驱还是父；
      - 若 $p$ 是父的**右孩子**且父==有左子树== → 前驱是==父的左子树中先序遍历的最后一个结点==。

      三种情况都要先知道"父是谁"，==所以必须加父指针（三叉链表）或者从根重新遍历==。
    ` },

    { t: 'key', id: 'post-rules', title: '后序线索树：前驱好求，后继难求', c: String.raw`
      **求后序前驱**（后序是"左右根"，前驱在自己脚下）：

      - $\texttt{rtag == 0}$（有右孩子）→ 前驱是==右孩子==；
      - 否则若 $\texttt{ltag == 0}$ → 前驱是==左孩子==；
      - 否则 $\texttt{lchild}$ 就是前驱线索。

      **求后序后继**（要往上找）：

      - $p$ 是**根** → ==没有后继==；
      - $p$ 是父的**右孩子** → 后继是==父==；
      - $p$ 是父的**左孩子**且==父无右子树== → 后继是父；
      - $p$ 是父的**左孩子**且==父有右子树== → 后继是==父的右子树中后序遍历的第一个结点==
        （即从父的右孩子出发，"能往左走就往左，不能就往右"，走到叶子）。

      同样==需要父指针==。
    ` },

    { t: 'warn', id: 'pre-thread-loop', title: '★ 先序线索化的死循环陷阱', c: String.raw`
      先序线索化的代码里，==建线索发生在递归左子树之**前**==（因为先序先访问根）。
      于是可能出现：给 $p$ 建了前驱线索之后 $\texttt{p->lchild}$ 已经==指向了它的前驱==，
      这时若再无脑 $\texttt{PreThread(p->lchild)}$，就会==顺着线索走回祖先，无限循环==。

      正确写法必须先判 tag：

      ~~~c
      void PreThread(ThreadTree p, ThreadTree *pre) {
          if (p == NULL) return;
          if (p->lchild == NULL) { p->lchild = *pre; p->ltag = 1; }
          if (*pre && (*pre)->rchild == NULL) { (*pre)->rchild = p; (*pre)->rtag = 1; }
          *pre = p;
          if (p->ltag == 0) PreThread(p->lchild, pre);   // ← 必须判 tag
          if (p->rtag == 0) PreThread(p->rchild, pre);   // ← 同理
      }
      ~~~

      ==中序线索化没有这个问题==：它先递归完左子树才建线索，
      进左子树时 $\texttt{lchild}$ 还是原样。这是一道很爱考的辨析点。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '四、例题' },

    { t: 'example', id: 'ex-count-threads',
      title: '数一数：线索有几根，空指针剩几个',
      source: '选择题高频',
      level: 2,
      problem: String.raw`
        一棵含 $n$ 个结点的二叉树，对它做**中序**线索化。

        (1) 一共会产生多少根线索？
        (2) 线索化之后，还剩几个真正的空指针？分别是谁的？
        (3) 若这棵树是**满二叉树**且 $n=15$，其中有多少个结点的 $\texttt{ltag}$ 为 $1$？
      `,
      idea: String.raw`
        (1)(2) 别去画树。==空指针总数是 $n+1$（定值），线索化把它们几乎全用掉==，
        关键是想清楚"哪几个用不掉"。

        (3) $\texttt{ltag}=1$ 意味着==该结点原本没有左孩子==。
        满二叉树里没有左孩子的结点就是==叶子==，所以直接数叶子。
        再注意中序第一个结点的前驱是空，它的 $\texttt{ltag}$ ==仍然是 1==
        （tag 标记的是"这个域装的是线索"，哪怕线索值为 $\texttt{NULL}$）。
      `,
      solution: String.raw`
        **(1)** 空指针共 $n+1$ 个。中序序列有 $n$ 个结点，
        其中 $n-1$ 个有前驱、$n-1$ 个有后继，能建的线索是"空指针里指向真实结点的那些"：

        - 首结点的前驱不存在 → 这一根线索指向 $\texttt{NULL}$；
        - 尾结点的后继不存在 → 这一根线索也指向 $\texttt{NULL}$。

        所以真正指向某个结点的线索是

        $$\text{有效线索数}=(n+1)-2=\boxed{n-1}$$

        **(2)** 剩 $\boxed{2}$ 个空：==中序第一个结点的 $\texttt{lchild}$== 与
        ==中序最后一个结点的 $\texttt{rchild}$==。
        注意它们的 $\texttt{tag}$ 都被置为 $1$（是"空线索"，不是"有孩子"）。

        **(3)** 满二叉树 $n=15$，$h=4$，叶子数 $n_0=\dfrac{n+1}{2}=8$。
        没有左孩子的结点恰是这 $8$ 个叶子，故 $\texttt{ltag}=1$ 的结点有 $\boxed{8}$ 个。
      `,
      comment: String.raw`
        **(1) 的陷阱**：很多人答 $n+1$。
        ==$n+1$ 是"被 tag 标成线索的指针域个数"，而"有效线索（真的指向一个结点）"只有 $n-1$ 个==。
        题目问哪个要看清 —— 问"线索数"一般指有效线索 $n-1$，
        问"$\texttt{tag}$ 为 1 的指针域个数"才是 $n+1$。

        **一个通用换算**：
        $$\texttt{ltag}=1\ \text{的个数}=\text{无左孩子的结点数},\qquad
        \texttt{rtag}=1\ \text{的个数}=\text{无右孩子的结点数}$$
        两者相加正好 $n+1$（因为空链域总数就是 $n+1$）。
      `,
    },

    { t: 'example', id: 'ex-draw-thread',
      title: '手画中序线索二叉树',
      source: '大题常见小问',
      level: 3,
      problem: String.raw`
        对[样例树](#/ds/tree/traversal?at=sample-tree)（先序 $\texttt{ABDEGCF}$、中序 $\texttt{DBGEACF}$）
        进行中序线索化，写出每个结点的 $\texttt{ltag}$、$\texttt{rtag}$，
        以及线索所指向的结点。
      `,
      idea: String.raw`
        ==别在树上边想边画，先把中序序列写成一行==：

        $$\texttt{D}\ \texttt{B}\ \texttt{G}\ \texttt{E}\ \texttt{A}\ \texttt{C}\ \texttt{F}$$

        然后逐个结点问两句：
        1. 它有左孩子吗？没有 → $\texttt{ltag}=1$，线索指向==这一行里它左边那个==；
        2. 它有右孩子吗？没有 → $\texttt{rtag}=1$，线索指向==这一行里它右边那个==。

        ==线索的值直接从这一行读，根本不用回到树上找==，这是最省事的做法。
      `,
      solution: String.raw`
        中序序列：$\texttt{D B G E A C F}$

        | 结点 | 左孩子 | ltag | lchild 指向 | 右孩子 | rtag | rchild 指向 |
        |---|---|---|---|---|---|---|
        | A | B | 0 | B | C | 0 | C |
        | B | D | 0 | D | E | 0 | E |
        | C | 无 | **1** | ==A== | F | 0 | F |
        | D | 无 | **1** | ==NULL== | 无 | **1** | ==B== |
        | E | G | 0 | G | 无 | **1** | ==A== |
        | F | 无 | **1** | ==C== | 无 | **1** | ==NULL== |
        | G | 无 | **1** | ==B== | 无 | **1** | ==E== |

        **核对**：$\texttt{tag}=1$ 的指针域共 $5+3=8=n+1=8$ ✓；
        其中指向 $\texttt{NULL}$ 的两个（$\texttt{D}$ 的左、$\texttt{F}$ 的右）
        正好是中序的首尾，有效线索 $8-2=6=n-1$ ✓。
      `,
      comment: String.raw`
        **画图版本**见[本页上方的线索示意图](#/ds/tree/thread-tree?at=inorder-list)。

        **考场自查**：填完表后数一遍 $\texttt{tag}=1$ 的总数，
        ==必须恰好等于 $n+1$==。多了少了立刻能发现是哪一行填错。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **tag 约定反了** —— 408 教材是 ==0 为孩子、1 为线索==。
      2. **"线索数"答成 $n+1$** —— 有效线索是 ==$n-1$==，$n+1$ 是被标为线索的指针域数。
      3. **以为线索化后树就变成链表了** —— 孩子指针一根没少，==只是把空的补上了==。
      4. **中序线索树里以为找后继一定 $O(1)$** —— $\texttt{rtag}=0$ 时要走到右子树最左下，
         ==最坏 $O(h)$==。
      5. **先序线索化不判 tag 就递归左子树** —— ==死循环==，见上文。
      6. **认为后序线索树能像中序那样不用栈遍历** —— ==不能==，求后序后继需要父指针。
      7. **线索化代码里给当前结点建后继线索** —— 应该给 $\texttt{pre}$ 建后继、给自己建前驱。
      8. **忘记收尾** —— 最后一个结点的 $\texttt{rtag}$ 要在遍历结束后手动置 1。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      一个可以自己验证的角度：==线索二叉树本质上是"把某种遍历的结果，事先缓存进了空指针里"==。
      缓存的是哪种遍历，就叫哪种线索树；
      "求后继难不难"完全取决于==那种遍历里，后继是在自己的子树中还是在祖先方向==。
      按这个思路，先序 / 中序 / 后序三张规则表就不用背了。
    ` },

  ],
});
