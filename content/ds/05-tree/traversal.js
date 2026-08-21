/* ==========================================================================
   数据结构 / 5 树与二叉树 / 遍历（递归 / 非递归 / 层序）
   ========================================================================== */

KM.page({
  path: 'ds/tree/traversal',
  title: '二叉树的遍历',
  subtitle: '把「树」这种二维结构压成一维序列 —— 以及为什么绝大多数二叉树代码题都只是「在遍历框架里插一句」',
  tags: ['高频', '必考', '代码题'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'storage', c: '一、先把结构立起来' },

    { t: 'key', id: 'binode', title: '二叉链表：全站默认的存储结构', c: String.raw`
      二叉树的链式存储叫**二叉链表**，每个结点三个域：数据 + 左孩子指针 + 右孩子指针。

      **一个反复考的计数结论**：含 $n$ 个结点的二叉链表里，
      一共有 $2n$ 个指针域，其中被用掉的（即指向真实孩子的）只有 $n-1$ 个
      （除根外每个结点被恰好一个指针指着），所以
      ==空指针域有 $n+1$ 个==。

      $$\text{空链域} = 2n-(n-1) = n+1$$

      这 $n+1$ 个空指针就是[线索二叉树要利用的资源](#/ds/tree/thread-tree?at=why)。
    ` },

    { t: 'code', id: 'node-def', title: '结点定义', lang: 'c',
      note: '本章所有代码都用这个定义',
      c: String.raw`
        typedef struct BiTNode {
            ElemType data;
            struct BiTNode *lchild, *rchild;
        } BiTNode, *BiTree;
      ` },

    { t: 'diagram', id: 'sample-tree', title: '本章的样例树与它的四种序列',
      note: '后面所有例子都用这棵树',
      caption: String.raw`四种序列==只是同一棵树的四种"念法"==：先序念根最早，后序念根最晚，中序把根念在左右之间，层序则完全不管父子、只按深度排。
      记住这棵树的四组序列，后面手算构造、线索化、判定完全二叉树都可以拿它当草稿。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 246" role="img" aria-label="一棵七结点的样例二叉树，以及它的先序、中序、后序、层序序列">
  <path class="ar plain" d="M170,32 L100,92"/>
  <path class="ar plain" d="M170,32 L250,92"/>
  <path class="ar plain" d="M100,92 L55,152"/>
  <path class="ar plain" d="M100,92 L145,152"/>
  <path class="ar plain" d="M250,92 L300,152"/>
  <path class="ar plain" d="M145,152 L110,212"/>
  <g class="n p"><rect x="154" y="16" width="32" height="32" rx="16"/><text class="bt" x="170" y="32" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="84" y="76" width="32" height="32" rx="16"/><text class="bt" x="100" y="92" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n k"><rect x="234" y="76" width="32" height="32" rx="16"/><text class="bt" x="250" y="92" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="39" y="136" width="32" height="32" rx="16"/><text class="bt" x="55" y="152" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n k"><rect x="129" y="136" width="32" height="32" rx="16"/><text class="bt" x="145" y="152" text-anchor="middle" dominant-baseline="central">E</text></g>
  <g class="n k"><rect x="284" y="136" width="32" height="32" rx="16"/><text class="bt" x="300" y="152" text-anchor="middle" dominant-baseline="central">F</text></g>
  <g class="n k"><rect x="94" y="196" width="32" height="32" rx="16"/><text class="bt" x="110" y="212" text-anchor="middle" dominant-baseline="central">G</text></g>
  <text class="lb" x="252" y="180" text-anchor="middle">C 只有右孩子</text>
  <text class="lb" x="176" y="128" text-anchor="middle">E 只有左孩子</text>
  <g class="n p"><rect x="372" y="16" width="312" height="36" rx="7"/><text class="bt sm" x="528" y="34" text-anchor="middle" dominant-baseline="central">先序 根左右　A B D E G C F</text></g>
  <g class="n g"><rect x="372" y="60" width="312" height="36" rx="7"/><text class="bt sm" x="528" y="78" text-anchor="middle" dominant-baseline="central">中序 左根右　D B G E A C F</text></g>
  <g class="n a"><rect x="372" y="104" width="312" height="36" rx="7"/><text class="bt sm" x="528" y="122" text-anchor="middle" dominant-baseline="central">后序 左右根　D G E B F C A</text></g>
  <g class="n m"><rect x="372" y="148" width="312" height="36" rx="7"/><text class="bt sm" x="528" y="166" text-anchor="middle" dominant-baseline="central">层序 按深度　A B C D E F G</text></g>
  <text class="cap" x="372" y="208">先序的第一个 / 后序的最后一个 = 根</text>
  <text class="cap" x="372" y="228">中序里根把序列切成左右两半</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'recursive', c: '二、三种递归遍历' },

    { t: 'key', id: 'three-def', title: '定义只有一句话：根在第几个访问', c: String.raw`
      设二叉树非空，$L$ 表示遍历左子树、$N$ 表示访问根、$R$ 表示遍历右子树，
      则三种遍历分别是：

      | 名称 | 顺序 | 记法 |
      |---|---|---|
      | 先序 preorder | $N\to L\to R$ | 根**先**被访问 |
      | 中序 inorder | $L\to N\to R$ | 根夹在**中**间 |
      | 后序 postorder | $L\to R\to N$ | 根**后**被访问 |

      ==三者的左右子树相对顺序永远是"先左后右"，变的只有根的位置==。
      所以三个函数的代码骨架完全一样，只有那一句 $\texttt{visit}$ 挪了位置 ——
      这一点是本章所有代码题的总纲。
    ` },

    { t: 'code', id: 'three-recursive', title: '三个递归函数（只差一行的位置）', lang: 'c',
      c: String.raw`
        void PreOrder(BiTree T) {
            if (T != NULL) {
                visit(T);                 // ← 根
                PreOrder(T->lchild);
                PreOrder(T->rchild);
            }
        }

        void InOrder(BiTree T) {
            if (T != NULL) {
                InOrder(T->lchild);
                visit(T);                 // ← 根
                InOrder(T->rchild);
            }
        }

        void PostOrder(BiTree T) {
            if (T != NULL) {
                PostOrder(T->lchild);
                PostOrder(T->rchild);
                visit(T);                 // ← 根
            }
        }
      ` },

    { t: 'key', id: 'complexity', title: '复杂度：时间恒定，空间看树高', c: String.raw`
      - **时间**：每个结点恰好被访问一次，==$O(n)$==，三种遍历都一样。
      - **空间**：递归栈的深度 = ==树的高度 $h$==，即 $O(h)$。
        最好情况（完全二叉树）$h=\lceil \log_2(n+1)\rceil$，空间 $O(\log n)$；
        ==最坏情况（单支树）$h=n$，空间 $O(n)$==。

      考试问"空间复杂度"时，==如果没说树的形态，标准答案就是 $O(n)$==（按最坏算）。
    ` },

    { t: 'method', id: 'by-hand', title: '手算遍历序列：绕树一圈的"投影法"', c: String.raw`
      不要在脑子里跑递归，用画的：

      1. 沿着树的外轮廓画一条闭合曲线，从根的左侧出发，==逆时针==绕整棵树一圈回到根；
      2. 这条线会经过每个结点**恰好三次**（左侧 → 下方 → 右侧）；
      3. 然后：
         - **先序** = 每个结点被经过==第 1 次==（左侧）时输出；
         - **中序** = 被经过==第 2 次==（下方）时输出；
         - **后序** = 被经过==第 3 次==（右侧）时输出。

      一次画线，三种序列一起出来，而且==不会漏结点、不会重复==。
      考场上如果三种序列都要写，这个方法比跑三遍递归快得多。
    ` },

    { t: 'insight', id: 'note-frame', title: '把遍历当成"框架"而不是"算法"', c: String.raw`
      这里放你自己的话。一个可能有用的角度是：

      递归遍历本身没有任何"算法"，它只是==保证每个结点被处理一次、且处理顺序确定==的一个骨架。
      真正的题目（求高度、数叶子、找祖先、判断相似……）都是
      **"选一个合适的遍历顺序 + 在 $\texttt{visit}$ 的位置写一句话"**。

      所以做代码题时先问自己两个问题：
      1. 我需要的信息==来自子树（后序）还是来自祖先（先序）==？
      2. 我要在==进入子树前==做，还是==两棵子树都回来之后==做？
    ` },

    /* ================================================================== */
    { t: 'h', id: 'iterative', c: '三、非递归遍历（手动栈）' },

    { t: 'key', id: 'why-stack', title: '栈到底存了什么', c: String.raw`
      递归的实质是系统帮你维护一个栈，栈里存的是=="还没处理完右子树的祖先结点"==。
      手写非递归就是把这个栈搬到明面上。

      三种遍历的非递归难度是==中序 ≈ 先序 $<$ 后序==：
      先序和中序都是"一路向左压栈，弹出后转向右子树"，
      而后序需要==区分"从左子树回来"还是"从右子树回来"==，必须额外记一点信息。
    ` },

    { t: 'code', id: 'pre-iter', title: '先序非递归', lang: 'c',
      note: '入栈时就访问，出栈后转右',
      c: String.raw`
        void PreOrder2(BiTree T) {
            InitStack(S);
            BiTree p = T;
            while (p || !IsEmpty(S)) {
                if (p) {
                    visit(p);             // 一路向左，边走边访问
                    Push(S, p);
                    p = p->lchild;
                } else {
                    Pop(S, p);            // 左边走到头，回退一层
                    p = p->rchild;        // 转向右子树
                }
            }
        }
      ` },

    { t: 'code', id: 'in-iter', title: '中序非递归', lang: 'c',
      note: '和先序只差 visit 的位置：出栈时才访问',
      c: String.raw`
        void InOrder2(BiTree T) {
            InitStack(S);
            BiTree p = T;
            while (p || !IsEmpty(S)) {
                if (p) {
                    Push(S, p);           // 一路向左，只压不访问
                    p = p->lchild;
                } else {
                    Pop(S, p);
                    visit(p);             // ← 弹出时才访问
                    p = p->rchild;
                }
            }
        }
      ` },

    { t: 'code', id: 'post-iter', title: '后序非递归（辅助指针 r 记录"刚访问过谁"）', lang: 'c',
      note: '408 教材标准写法，要能默写',
      c: String.raw`
        void PostOrder2(BiTree T) {
            InitStack(S);
            BiTree p = T, r = NULL;       // r 指向最近一次访问过的结点
            while (p || !IsEmpty(S)) {
                if (p) {
                    Push(S, p);
                    p = p->lchild;        // 一路向左
                } else {
                    GetTop(S, p);         // 只看栈顶，先不弹
                    if (p->rchild && p->rchild != r) {
                        p = p->rchild;    // 右子树存在且还没访问过 → 去右子树
                    } else {
                        Pop(S, p);
                        visit(p);         // 左右都回来了，才访问根
                        r = p;            // 记下"刚访问完 p"
                        p = NULL;         // 关键：强制下一轮走 else 分支
                    }
                }
            }
        }
      ` },

    { t: 'warn', id: 'post-traps', title: '后序非递归的四个必错点', c: String.raw`
      1. ==用 $\texttt{GetTop}$ 而不是 $\texttt{Pop}$==：栈顶结点的右子树可能还没走，
         现在弹掉就再也回不去了。
      2. ==访问完必须 $\texttt{p = NULL}$==。否则下一轮 $\texttt{if (p)}$ 成立，
         又会把 $p$ 及其左子树重新压一遍，直接死循环。
      3. ==$\texttt{r}$ 的作用是防止右子树被重复进入==：
         从右子树回来时栈顶还是那个根，若不判 $\texttt{p->rchild != r}$ 就会再进一次右子树。
      4. **不要写成 $\texttt{r = p->rchild}$**，$r$ 记录的是==刚刚被 visit 的结点==。
    ` },

    { t: 'method', id: 'post-trick', title: '考场上的后序偷懒法：反转的"根右左"', c: String.raw`
      如果题目只要求==输出后序序列==（而不是要求你在后序位置做别的事），
      有个几乎不会写错的写法：

      1. 按 ==根 → 右 → 左== 的顺序做一次"先序式"非递归遍历（把先序代码里两个孩子对调）；
      2. 把得到的序列==整个逆序==输出。

      因为 $\text{reverse}(N R L) = L R N$，正好是后序。代价是需要一个额外的栈/数组存结果，
      ==空间 $O(n)$==，而标准写法是 $O(h)$。
      **写在解答里要说明这一点**，否则容易被扣空间分。
    ` },

    { t: 'compare', id: 'iter-compare', title: '三种非递归写法对照',
      cols: ['', '压栈时机', 'visit 时机', '额外变量', '难度'],
      rows: [
        ['先序', '沿左链一路压', '压栈的同时', '无', '★'],
        ['中序', '沿左链一路压', '出栈的时候', '无', '★'],
        ['后序', '沿左链一路压', '右子树也回来之后', '`r` 指针（或访问标记）', '★★★'],
        ['层序', '不用栈，用队列', '出队的时候', '队列', '★'],
      ] },

    /* ================================================================== */
    { t: 'h', id: 'level', c: '四、层序遍历与它的变体' },

    { t: 'key', id: 'level-idea', title: '唯一一个不用栈的遍历', c: String.raw`
      层序遍历用**队列**：根入队；然后反复"出队一个、访问它、把它的左右孩子入队"。

      ==队列里任何时刻装的都是"相邻至多两层"的结点==，
      这个不变式是所有层序变体（求宽度、之字形、按层分组）的基础。

      时间 $O(n)$；空间是==队列的最大长度 = 树的最大宽度==，
      完全二叉树时最后一层约 $n/2$ 个结点，所以==最坏空间 $O(n)$==。
    ` },

    { t: 'code', id: 'level-code', title: '层序遍历', lang: 'c',
      c: String.raw`
        void LevelOrder(BiTree T) {
            InitQueue(Q);
            if (T == NULL) return;
            EnQueue(Q, T);
            BiTree p;
            while (!IsEmpty(Q)) {
                DeQueue(Q, p);
                visit(p);
                if (p->lchild) EnQueue(Q, p->lchild);
                if (p->rchild) EnQueue(Q, p->rchild);
            }
        }
      ` },

    { t: 'method', id: 'level-by-layer', title: '要"分层"时加一句：记录当前层的结点数', c: String.raw`
      很多题（求宽度、逐层输出、求某层结点数、自下而上层序）都需要知道==层的边界==。
      标准做法是在外层循环开头先把==当前队列长度 $k$ 存下来==，
      然后内层 $k$ 次出队 —— 这 $k$ 个恰好就是同一层。

      ~~~c
      while (!IsEmpty(Q)) {
          int k = QueueLength(Q);       // 当前层的结点数
          maxWidth = max(maxWidth, k);  // 求最大宽度就在这里比一下
          for (int i = 0; i < k; i++) {
              DeQueue(Q, p);
              visit(p);
              if (p->lchild) EnQueue(Q, p->lchild);
              if (p->rchild) EnQueue(Q, p->rchild);
          }
          level++;                      // 这里天然拿到了层号
      }
      ~~~

      ==把"层号"和"每层结点数"这两件事拿到手，层序类的题就没有新东西了==。
    ` },

    { t: 'code', id: 'is-complete', title: '判断是否为完全二叉树（层序的经典应用）', lang: 'c',
      note: '空孩子也入队，一旦出队遇到 NULL，后面必须全是 NULL',
      c: String.raw`
        bool IsComplete(BiTree T) {
            if (T == NULL) return true;           // 空树是完全二叉树
            InitQueue(Q);
            EnQueue(Q, T);
            BiTree p;
            while (!IsEmpty(Q)) {
                DeQueue(Q, p);
                if (p) {
                    EnQueue(Q, p->lchild);        // 注意：空指针也入队
                    EnQueue(Q, p->rchild);
                } else {
                    while (!IsEmpty(Q)) {         // 遇到第一个空之后
                        DeQueue(Q, p);
                        if (p) return false;      // 还有非空 → 不是完全二叉树
                    }
                }
            }
            return true;
        }
      ` },

    /* ================================================================== */
    { t: 'h', id: 'rebuild', c: '五、由遍历序列反推二叉树' },

    { t: 'key', id: 'which-pair', title: '哪两个序列能唯一确定一棵二叉树', c: String.raw`
      | 组合 | 能否唯一确定 | 原因 |
      |---|---|---|
      | 先序 + 中序 | ==能== | 先序给根，中序切左右 |
      | 后序 + 中序 | ==能== | 后序给根，中序切左右 |
      | 层序 + 中序 | ==能== | 层序给根，中序切左右 |
      | **先序 + 后序** | ==**不能**== | 都定不了左右子树的分界 |
      | 先序 + 层序 | 不能 | 同上 |

      ==规律一句话：必须有中序==。
      中序的作用不可替代 —— 它是唯一一个能==把序列在根处切成"左子树段"和"右子树段"==的序列；
      先序 / 后序 / 层序都只负责==指出谁是根==。
    ` },

    { t: 'diagram', id: 'pre-post-fail', title: '先序 + 后序为什么不行',
      note: '两棵不同的树，先序都是 A B，后序都是 B A',
      caption: String.raw`只有一个孩子时，==先序和后序都无法表达"它是左孩子还是右孩子"==。
      推论：如果已知这棵树里==不存在度为 1 的结点==（即每个结点要么是叶子、要么有两个孩子），
      那么先序 + 后序==就可以唯一确定==了 —— 这是一道常见的思考题。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 180" role="img" aria-label="两棵不同的二叉树拥有相同的先序序列和后序序列">
  <text class="cap" x="80" y="18">树 1：B 是左孩子</text>
  <path class="ar plain" d="M150,46 L110,102"/>
  <g class="n p"><rect x="134" y="30" width="32" height="32" rx="16"/><text class="bt" x="150" y="46" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="94" y="86" width="32" height="32" rx="16"/><text class="bt" x="110" y="102" text-anchor="middle" dominant-baseline="central">B</text></g>
  <text class="lb" x="150" y="132" text-anchor="middle">中序 = B A</text>
  <text class="cap" x="440" y="18">树 2：B 是右孩子</text>
  <path class="ar plain" d="M510,46 L550,102"/>
  <g class="n p"><rect x="494" y="30" width="32" height="32" rx="16"/><text class="bt" x="510" y="46" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="534" y="86" width="32" height="32" rx="16"/><text class="bt" x="550" y="102" text-anchor="middle" dominant-baseline="central">B</text></g>
  <text class="lb" x="510" y="132" text-anchor="middle">中序 = A B</text>
  <path class="sep" d="M340,22 V140"/>
  <g class="n r"><rect x="14" y="140" width="672" height="32" rx="7"/><text class="bt sm" x="350" y="156" text-anchor="middle" dominant-baseline="central">两棵树的先序都是 A B、后序都是 B A —— 只有中序能把它们区分开</text></g>
</svg>
` },

    { t: 'steps', id: 'rebuild-steps', title: '由先序 + 中序构造的手算流程', items: [
      { title: '在先序里取第一个字符，它是根', c: String.raw`后序则取==最后一个==；层序取==最前一个==。` },
      { title: '在中序里找到这个根', c: String.raw`它把中序序列==切成左右两段==：左边那段是左子树的中序，右边那段是右子树的中序。` },
      { title: '按左右两段的长度，去先序里切出对应的两段', c: String.raw`==长度是唯一的桥梁==：中序左段有 $k$ 个字符，那么先序里紧跟根后面的 $k$ 个字符就是左子树的先序。` },
      { title: '对左右两段递归重复', c: String.raw`直到某段长度为 $0$（空子树）或 $1$（叶子）。` },
    ] },

    { t: 'code', id: 'rebuild-code', title: '由先序 + 中序建树', lang: 'c',
      note: 'A 为先序数组，B 为中序数组，下标区间左闭右闭',
      c: String.raw`
        BiTree PreInCreate(ElemType A[], ElemType B[],
                           int l1, int h1, int l2, int h2) {
            if (l1 > h1) return NULL;
            BiTree root = (BiTree)malloc(sizeof(BiTNode));
            root->data = A[l1];                       // 先序首元素即根
            int i;
            for (i = l2; B[i] != root->data; i++) ;   // 在中序里定位根
            int llen = i - l2;                        // 左子树结点数
            int rlen = h2 - i;                        // 右子树结点数
            root->lchild = PreInCreate(A, B, l1 + 1,        l1 + llen, l2,    i - 1);
            root->rchild = PreInCreate(A, B, h1 - rlen + 1, h1,        i + 1, h2);
            return root;
        }
      ` },

    { t: 'example', id: 'ex-rebuild',
      title: '由后序 + 中序还原二叉树并写出先序',
      source: '常考题型',
      level: 3,
      problem: String.raw`
        已知一棵二叉树的**后序**序列为 $\texttt{DGEBFCA}$，
        **中序**序列为 $\texttt{DBGEACF}$，
        画出这棵二叉树并写出它的先序序列与层序序列。
      `,
      idea: String.raw`
        后序的**最后一个**是根 —— 这是和先序唯一的区别，其余步骤完全一样。

        ==每一步只做两件事==：从后序尾部取根、在中序里用这个根切一刀。
        然后要小心的是==从后序里切出左右两段时不要数错长度==：
        后序的排列是"左子树段 + 右子树段 + 根"，
        所以==左段在前、右段紧随其后、根在最后==。
      `,
      solution: String.raw`
        **第 1 层**：后序 $\texttt{DGEBFCA}$ 的末位 $\texttt{A}$ 是根。
        在中序 $\texttt{DBGEACF}$ 中定位 $\texttt{A}$，切成
        $\texttt{DBGE}\ \mid\ \texttt{A}\ \mid\ \texttt{CF}$，
        即左子树 $4$ 个结点、右子树 $2$ 个结点。

        于是后序按 $4+2+1$ 切成
        $\texttt{DGEB}\ \mid\ \texttt{FC}\ \mid\ \texttt{A}$。

        **第 2 层（左）**：后序 $\texttt{DGEB}$ 末位 $\texttt{B}$ 为根；
        中序 $\texttt{DBGE}$ 切为 $\texttt{D}\mid \texttt{B}\mid \texttt{GE}$。
        左子树只有 $\texttt{D}$（叶子），右子树中序 $\texttt{GE}$、后序 $\texttt{GE}$。

        **第 2 层（右）**：后序 $\texttt{FC}$ 末位 $\texttt{C}$ 为根；
        中序 $\texttt{CF}$ 切为 $\varnothing\mid \texttt{C}\mid \texttt{F}$ ——
        ==$\texttt{C}$ 没有左子树，$\texttt{F}$ 是它的右孩子==。

        **第 3 层**：后序 $\texttt{GE}$ 末位 $\texttt{E}$ 为根；
        中序 $\texttt{GE}$ 切为 $\texttt{G}\mid \texttt{E}\mid \varnothing$ ——
        $\texttt{G}$ 是 $\texttt{E}$ 的左孩子。

        得到的正是[本页开头那棵样例树](#/ds/tree/traversal?at=sample-tree)：

        $$\text{先序}=\texttt{ABDEGCF},\qquad \text{层序}=\texttt{ABCDEFG}$$
      `,
      comment: String.raw`
        **自查三件事**（写完一定要做）：

        1. 结点总数对不对（本题 $7$ 个，一个不能多一个不能少）；
        2. ==拿构造出来的树重新走一遍中序==，必须还原成题给的中序；
        3. 每一步切出来的两段长度之和 $+1$ 必须等于当前段长。

        **易错**：第 2 层右子树那一步，中序是 $\texttt{CF}$、根是 $\texttt{C}$，
        很多人下意识把 $\texttt{F}$ 画成左孩子。==根在中序里的位置就是分界线，
        根左边为空就意味着左子树为空==，不能凭"看起来该有个左孩子"来画。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'apply', c: '六、遍历框架的典型应用（代码题模板）' },

    { t: 'method', id: 'choose-order', title: '选哪种遍历：看信息往哪个方向流', c: String.raw`
      | 你要的信息来自 | 用哪种遍历 | 例子 |
      |---|---|---|
      | **子树**（自底向上汇总） | ==后序== | 求高度、求结点数、判平衡、求子树和 |
      | **祖先**（自顶向下传递） | ==先序== | 传深度 / 传路径、打印所有根到叶路径 |
      | **有序性**（BST 专属） | ==中序== | 判断是否 BST、求第 $k$ 小、BST 转有序链表 |
      | **按深度分组** | ==层序== | 求宽度、判完全二叉树、求每层最右结点 |

      ==拿不准时优先试后序==：树上大多数"统计量"都能写成
      "左子树的结果 + 右子树的结果 + 我自己"。
    ` },

    { t: 'code', id: 'basic-stats', title: '四个必须能秒写的统计函数', lang: 'c',
      note: '全部是后序框架：先要左右的答案，再算自己的',
      c: String.raw`
        int Height(BiTree T) {                        // 树的高度
            if (T == NULL) return 0;
            int lh = Height(T->lchild);
            int rh = Height(T->rchild);
            return (lh > rh ? lh : rh) + 1;
        }

        int NodeCount(BiTree T) {                     // 结点总数
            if (T == NULL) return 0;
            return NodeCount(T->lchild) + NodeCount(T->rchild) + 1;
        }

        int LeafCount(BiTree T) {                     // 叶子结点数
            if (T == NULL) return 0;
            if (T->lchild == NULL && T->rchild == NULL) return 1;
            return LeafCount(T->lchild) + LeafCount(T->rchild);
        }

        void Swap(BiTree T) {                         // 交换所有左右子树
            if (T == NULL) return;
            Swap(T->lchild);
            Swap(T->rchild);
            BiTree t = T->lchild; T->lchild = T->rchild; T->rchild = t;
        }
      ` },

    { t: 'warn', id: 'leaf-trap', title: '数叶子时最容易写错的一行', c: String.raw`
      ==判空必须在判叶子之前==。如果写成

      ~~~c
      if (T->lchild == NULL && T->rchild == NULL) return 1;
      if (T == NULL) return 0;
      ~~~

      空树会先解引用空指针 —— 段错误。

      另一个常见错误是==把"只有一个孩子的结点"也数成叶子==：
      叶子的定义是**左右孩子都为空**，把 $\texttt{\&\&}$ 写成 $\texttt{||}$ 就全错。
    ` },

    { t: 'code', id: 'ancestors', title: '求结点 x 的所有祖先（后序非递归的经典用法）', lang: 'c',
      note: '为什么必须用后序：只有后序非递归的栈里，装的恰好是当前结点的全部祖先',
      c: String.raw`
        void PrintAncestors(BiTree T, BiTNode *x) {
            InitStack(S);
            BiTree p = T, r = NULL;
            while (p || !IsEmpty(S)) {
                if (p) {
                    Push(S, p);
                    p = p->lchild;
                } else {
                    GetTop(S, p);
                    if (p->rchild && p->rchild != r) {
                        p = p->rchild;
                    } else {
                        if (p == x) {              // 找到了！
                            Pop(S, p);             // 弹掉 x 自己
                            while (!IsEmpty(S)) {  // 栈里剩下的全是祖先
                                Pop(S, p);
                                visit(p);
                            }
                            return;
                        }
                        Pop(S, p);
                        r = p;
                        p = NULL;
                    }
                }
            }
        }
      ` },

    { t: 'key', id: 'why-post-ancestor', title: '"栈里就是祖先"这件事只对后序成立', c: String.raw`
      在**后序**非递归中，一个结点==只有在左右子树都处理完之后才出栈==。
      所以当我们站在结点 $x$ 上（$x$ 在栈顶、准备被访问）时，
      栈中 $x$ 下面的所有结点==都是还没处理完、正等着 $x$ 返回的祖先==，
      而且从栈顶到栈底就是==从父亲到根==的顺序。

      **先序 / 中序不行**：先序里结点一被访问就可能已经出栈；
      中序里栈中只有"祖先中那些还没访问右子树的"，==已经转向右子树的那些祖先早就弹掉了==。

      同样的技巧还能解：==求两个结点的最近公共祖先（LCA）==
      —— 分别求出两条祖先链，再从根开始比对，最后一个相同的结点就是答案。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '七、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **先序 + 后序以为能唯一确定** —— ==必须有中序==（除非题目保证没有度为 1 的结点）。
      2. **后序非递归漏了那句"访问完把 p 置空"** —— 死循环，这是最高频的手写错误。
      3. **后序非递归用 $\texttt{Pop}$ 取栈顶** —— 应该用 $\texttt{GetTop}$，右子树还没走。
      4. **递归遍历的空间复杂度答成 $O(\log n)$** —— 没给树形态就按最坏 ==$O(n)$==。
      5. **层序判完全二叉树时不把空孩子入队** —— 不入队就区分不出"空洞"。
      6. **构造树时从先序 / 后序里切段切错长度** —— 长度只能由==中序==那一刀决定。
      7. **把"结点的层次"和"树的高度"混用** —— 根记为第 $1$ 层时
         $\text{高度}=\text{最大层次}$；有的教材根记为第 $0$ 层，==看清题目约定==。
      8. **交换左右子树后以为先序会变成后序的逆序** —— 中序确实变成原中序的逆序，
         但先序变成的是"根右左"，==它等于原后序的逆序，不是原后序==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '八、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      跟 Claude 说「把这段对话整理进二叉树遍历」，你的原话会被提炼成这样的绿块，
      放在对应小节里 —— 和蓝色（客观知识）、紫色（方法论）分开，
      复习时一眼能认出==哪些是书上的、哪些是你自己想通的==。
    ` },

  ],
});
