/* ==========================================================================
   数据结构 / 5 树与二叉树 / 二叉排序树与平衡二叉树
   ========================================================================== */

KM.page({
  path: 'ds/tree/bst',
  title: '二叉排序树与平衡二叉树',
  subtitle: '中序有序是 BST 的全部性质；AVL 则是为了不让它退化成一条链',
  tags: ['高频', '必考', '手算', '综合应用'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'bst-def', c: '一、二叉排序树（BST）' },

    { t: 'key', id: 'def', title: '定义与那条最有用的推论', c: String.raw`
      **二叉排序树**（BST，又叫二叉查找树）或者为空，或者满足：

      1. 若左子树非空，则左子树上==所有==结点的值 $<$ 根的值；
      2. 若右子树非空，则右子树上==所有==结点的值 $>$ 根的值；
      3. 左右子树本身也是二叉排序树。

      ==注意是"所有结点"而不是"左右孩子"== —— 这是判断题最爱设的陷阱。

      **推论（比定义还常用）**：
      $$\boxed{\text{对 BST 做中序遍历，得到的是一个递增有序序列}}$$

      反过来也成立：==一棵二叉树是 BST $\iff$ 它的中序序列递增==。
      所以"判断是不是 BST"的标准写法就是[中序遍历一遍，看是否始终递增](#/ds/tree/traversal?at=choose-order)。
    ` },

    { t: 'diagram', id: 'bst-sample', title: '一棵 BST 与它的中序序列',
      note: '按 45, 24, 53, 12, 37, 93 的顺序依次插入得到',
      caption: String.raw`==每个结点的值都落在"它左边界与右边界之间"==：
      例如 $37$ 必须同时满足 $37>24$（在 $24$ 的右子树里）和 $37<45$（在 $45$ 的左子树里）。
      判断一棵树是不是 BST 时，==要检查的是这个区间约束，而不是父子两两大小==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 216" role="img" aria-label="一棵二叉排序树及其递增的中序序列">
  <path class="ar plain" d="M180,40 L110,100"/><path class="ar plain" d="M180,40 L250,100"/>
  <path class="ar plain" d="M110,100 L60,160"/><path class="ar plain" d="M110,100 L160,160"/>
  <path class="ar plain" d="M250,100 L300,160"/>
  <g class="n p"><rect x="162" y="22" width="36" height="36" rx="18"/><text class="bt sm" x="180" y="40" text-anchor="middle" dominant-baseline="central">45</text></g>
  <g class="n k"><rect x="92" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="110" y="100" text-anchor="middle" dominant-baseline="central">24</text></g>
  <g class="n k"><rect x="232" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="250" y="100" text-anchor="middle" dominant-baseline="central">53</text></g>
  <g class="n k"><rect x="42" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="60" y="160" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n k"><rect x="142" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="160" y="160" text-anchor="middle" dominant-baseline="central">37</text></g>
  <g class="n k"><rect x="282" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="300" y="160" text-anchor="middle" dominant-baseline="central">93</text></g>
  <text class="lb" x="216" y="146" text-anchor="middle">53 没有左孩子</text>
  <g class="n g"><rect x="376" y="30" width="308" height="40" rx="7"/><text class="bt sm" x="530" y="50" text-anchor="middle" dominant-baseline="central">中序：12  24  37  45  53  93</text></g>
  <text class="cap" x="376" y="96">37 所受的约束：24 &lt; 37 &lt; 45</text>
  <text class="cap" x="376" y="118">93 所受的约束：53 &lt; 93 &lt; +∞</text>
  <text class="cap" x="376" y="140">12 所受的约束：−∞ &lt; 12 &lt; 24</text>
  <g class="n a"><rect x="376" y="156" width="308" height="42" rx="7"/><text class="bt sm" x="530" y="170" text-anchor="middle" dominant-baseline="central">查找 = 从根开始的一路比较</text><text class="bs" x="530" y="188" text-anchor="middle" dominant-baseline="central">比较次数 ≤ 树的高度，所以 BST 的效率完全取决于形态</text></g>
</svg>
` },

    { t: 'code', id: 'bst-search', title: 'BST 查找（递归 + 非递归）', lang: 'c',
      note: '非递归版空间 O(1)，考场首选',
      c: String.raw`
        BSTNode *BST_Search(BiTree T, ElemType key) {
            while (T != NULL && key != T->data) {
                if (key < T->data) T = T->lchild;
                else               T = T->rchild;
            }
            return T;                     // 找不到时自然返回 NULL
        }

        BSTNode *BST_SearchR(BiTree T, ElemType key) {
            if (T == NULL) return NULL;
            if (key == T->data) return T;
            if (key <  T->data) return BST_SearchR(T->lchild, key);
            else                return BST_SearchR(T->rchild, key);
        }
      ` },

    { t: 'code', id: 'bst-insert', title: 'BST 插入', lang: 'c',
      note: '新结点一定成为叶子，绝不会插在中间',
      c: String.raw`
        int BST_Insert(BiTree *T, ElemType k) {
            if (*T == NULL) {                       // 找到空位，挂上去
                *T = (BiTree)malloc(sizeof(BSTNode));
                (*T)->data = k;
                (*T)->lchild = (*T)->rchild = NULL;
                return 1;
            }
            if (k == (*T)->data) return 0;          // 已存在，不插
            if (k <  (*T)->data) return BST_Insert(&(*T)->lchild, k);
            else                 return BST_Insert(&(*T)->rchild, k);
        }
      ` },

    { t: 'key', id: 'insert-leaf', title: '"插入必成叶子"这句话的三个后果', c: String.raw`
      1. ==插入不改变任何已有结点的相对位置==，所以插入 $n$ 个关键字得到的形态
         **完全由插入顺序决定**；
      2. ==同一个集合，不同插入顺序会得到不同的 BST==，
         但它们的**中序序列都相同**（都是升序）；
      3. 由 1 可知：==若插入序列本身有序，BST 会退化成一条单支链==，
         查找变成 $O(n)$ —— 这正是 AVL 要解决的问题。
    ` },

    { t: 'steps', id: 'bst-delete', title: 'BST 删除：三种情况', items: [
      { title: '被删结点是叶子', c: String.raw`==直接删掉==，不影响任何性质。` },
      { title: '被删结点只有一棵子树', c: String.raw`让==它的子树顶替它的位置==（子树整体上移一层），
        父结点原来指向它的那根指针改指向该子树。` },
      { title: '被删结点有两棵子树', c: String.raw`不能直接删。做法是==找它的直接前驱或直接后继 $z$ 顶替==：
        - **直接前驱** = 左子树中==最右下==的结点；
        - **直接后继** = 右子树中==最左下==的结点。

        把 $z$ 的值抄到被删结点上，然后==转而删除 $z$==。
        关键点：$z$ 一定==至多只有一棵子树==（前驱没有右孩子、后继没有左孩子），
        于是问题退化成前两种情况，==递归最多再走一层==。` },
    ] },

    { t: 'key', id: 'why-succ', title: '为什么用直接前驱 / 后继顶替，而不是随便找一个', c: String.raw`
      因为 BST 的性质等价于"中序有序"。删除一个结点相当于==从中序序列里抠掉一个元素==，
      而能无缝补位的只有==它在中序序列里紧挨着的那个==。

      换句话说：在中序序列 $\dots,\ z_{\text{前驱}},\ x,\ z_{\text{后继}},\dots$ 中删掉 $x$，
      把 $z_{\text{前驱}}$ 或 $z_{\text{后继}}$ 挪到 $x$ 的位置，==序列仍然有序==。
      换成别的结点就会破坏区间约束。

      ==用前驱还是后继由你自己定，两种答案都对==，但同一道题里必须自始至终用同一种，
      并且在答案里写一句"本题用直接前驱顶替"。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'bst-asl', c: '二、BST 的查找效率与 ASL' },

    { t: 'key', id: 'asl-def', title: '成功 ASL 与失败 ASL', c: String.raw`
      **查找成功的平均查找长度**：每个结点被找到时的比较次数 = 它所在的层次。

      $$\mathrm{ASL}_{\text{成功}}=\frac{1}{n}\sum_{i=1}^{n}(\text{结点 }i\text{ 的层次})$$

      **查找失败的平均查找长度**：要先==把树"扩充"==——
      在每个空指针的位置挂一个==方框（外部结点）==。
      $n$ 个结点的 BST 恰有 $n+1$ 个外部结点，落到某个外部结点表示查找失败。

      $$\mathrm{ASL}_{\text{失败}}=\frac{1}{n+1}\sum(\text{外部结点的层次}-1)$$

      ==失败时要减 1==：走到外部结点的那一步不需要比较（发现指针为空就结束了），
      比较次数等于它父结点所在的层次。
    ` },

    { t: 'example', id: 'ex-asl',
      title: '算一棵 BST 的成功 / 失败 ASL',
      source: '必考小题',
      level: 2,
      problem: String.raw`
        依次插入 $45,\,24,\,53,\,12,\,37,\,93$ 构造二叉排序树，
        求 $\mathrm{ASL}_{\text{成功}}$ 与 $\mathrm{ASL}_{\text{失败}}$（假设各结点查找概率相等）。
      `,
      idea: String.raw`
        成功 ASL ==只跟每层有几个结点有关==，画完树按层数一数就行。

        失败 ASL 的关键是==别漏外部结点==。机械做法：
        $n$ 个结点必然有 $n+1$ 个空指针位，这里 $n=6$ 所以==必须数出 7 个方框==，
        数不够就是漏了。
      `,
      solution: String.raw`
        树的形态见[上方示意图](#/ds/tree/bst?at=bst-sample)：

        - 第 1 层：$45$（1 个）
        - 第 2 层：$24,\,53$（2 个）
        - 第 3 层：$12,\,37,\,93$（3 个）

        $$\mathrm{ASL}_{\text{成功}}=\frac{1\times 1+2\times 2+3\times 3}{6}=\frac{14}{6}=\frac{7}{3}\approx 2.33$$

        **外部结点**（共 $6+1=7$ 个）：
        $12$ 的左右各一（第 4 层）、$37$ 的左右各一（第 4 层）、
        $93$ 的左右各一（第 4 层）、$53$ 的左边一个（第 3 层）。

        $$\mathrm{ASL}_{\text{失败}}=\frac{6\times(4-1)+1\times(3-1)}{7}=\frac{18+2}{7}=\frac{20}{7}\approx 2.86$$
      `,
      comment: String.raw`
        **两个自查**：

        1. 外部结点个数必须是 ==$n+1$==；
        2. $\mathrm{ASL}_{\text{失败}}$ 通常==略大于== $\mathrm{ASL}_{\text{成功}}$
           （失败一定要走到底），算出来反而更小就一定错了。

        **常见错**：失败 ASL 忘了减 1，算成 $\frac{6\times 4+1\times 3}{7}=\frac{27}{7}$。
        =="落到方框"不算一次比较==，这是定义决定的。
      `,
    },

    { t: 'key', id: 'bst-shape', title: '同一组关键字，最好与最坏的形态', c: String.raw`
      | 情况 | 形态 | 高度 | 查找 |
      |---|---|---|---|
      | 最好 | 完全二叉树（平衡） | $\lceil\log_2(n+1)\rceil$ | ==$O(\log n)$== |
      | 最坏 | 单支链（插入序列已有序） | $n$ | ==$O(n)$== |
      | 随机插入的平均 | —— | $O(\log n)$ | $O(\log n)$ |

      ==这就是"BST 的效率取决于插入顺序"这句话的量化版本==。
      注意最坏情况恰恰出现在==输入已经排好序==时，而这在实际中非常常见 ——
      所以必须有自平衡机制。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'avl', c: '三、平衡二叉树（AVL）' },

    { t: 'key', id: 'avl-def', title: '平衡因子与 AVL 的定义', c: String.raw`
      结点的**平衡因子** $\mathrm{BF}$ 定义为

      $$\mathrm{BF}(x)=h(x.\text{左子树})-h(x.\text{右子树})$$

      **平衡二叉树（AVL 树）**：==任一结点的平衡因子只能取 $-1,\,0,\,+1$==。
      （408 默认 AVL 同时也是 BST；单说"平衡二叉树"时指的就是这个。）

      **记号约定**：$\mathrm{BF}>0$ 表示==左边高==。写成"左减右"是主流约定，
      少数资料用"右减左"，==答题前先声明==。

      **高度界**：AVL 的高度 $h$ 与结点数 $n$ 满足
      $$h < 1.44\log_2(n+2)$$
      即==高度始终是 $O(\log n)$==，查找 / 插入 / 删除都是 $O(\log n)$。
    ` },

    { t: 'key', id: 'avl-min-nodes', title: '高度为 $h$ 的 AVL 最少有几个结点', c: String.raw`
      设 $N_h$ 为高度 $h$ 的 AVL 树的**最少**结点数。
      要让结点尽量少，就让左右子树==高度差取满 1==、且各自都是最少的：

      $$\boxed{N_h=N_{h-1}+N_{h-2}+1},\qquad N_0=0,\ N_1=1$$

      前几项（==选择题直接考数值，背下来==）：

      | $h$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
      |---|---|---|---|---|---|---|---|---|---|
      | $N_h$ | 1 | 2 | 4 | 7 | 12 | 20 | 33 | 54 | 88 |

      形式上是==类斐波那契==（$N_h+1$ 恰好是斐波那契数列）。
      典型问法："含 $12$ 个结点的 AVL 树最大高度是多少？"
      $N_5=12\le 12<20=N_6$，故答案 ==$5$==。
    ` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'rotate', c: '四、四种旋转' },

    { t: 'key', id: 'min-unbalanced', title: '第一步永远是：找最小不平衡子树', c: String.raw`
      插入一个结点后，==只有从插入点到根这条路径上的结点，平衡因子才可能改变==。
      沿这条路径==从插入点向上==走，遇到的**第一个** $|\mathrm{BF}|=2$ 的结点，
      就是**最小不平衡子树的根**，记作 $A$。

      **两个关键事实**：

      1. ==只需要对这一棵最小不平衡子树做一次调整==（插入的情形），
         调整完它的高度会恢复成插入之前的值，==上面的祖先自动全部恢复平衡==；
      2. 因此**插入最多只需要一次旋转**（LL/RR 算一次单旋，LR/RL 算一次双旋）。

      ==删除则不同==：删除后子树高度可能真的减少 1，
      需要==继续向上检查、可能连续旋转 $O(\log n)$ 次==。这是插入与删除最大的区别。
    ` },

    { t: 'key', id: 'four-types', title: '四种类型的命名法：看"插入点在 $A$ 的哪个孙子方向"', c: String.raw`
      设最小不平衡子树的根为 $A$：

      | 类型 | 插入位置 | 调整 | 新的子树根 |
      |---|---|---|---|
      | **LL** | $A$ 的==左==孩子的==左==子树 | 一次==右==单旋转 | $A$ 的左孩子 $B$ |
      | **RR** | $A$ 的==右==孩子的==右==子树 | 一次==左==单旋转 | $A$ 的右孩子 $B$ |
      | **LR** | $A$ 的==左==孩子的==右==子树 | ==先左旋 $B$，再右旋 $A$== | $B$ 的右孩子 $C$ |
      | **RL** | $A$ 的==右==孩子的==左==子树 | ==先右旋 $B$，再左旋 $A$== | $B$ 的左孩子 $C$ |

      **两条不会记错的规律**：

      - ==两个字母相同（LL/RR）→ 单旋；两个字母不同（LR/RL）→ 双旋==；
      - ==单旋后新根是 $B$（儿子），双旋后新根是 $C$（孙子）==。

      **旋转方向的记法**：LL 是"左边太重"，要把左边的往上提、根往==右==压，所以叫右旋。
      ==别去背"L 对应左旋"，那是反的==。
    ` },

    { t: 'diagram', id: 'rot-ll', title: 'LL 型：一次右单旋转',
      note: 'RR 型是它的左右镜像，把所有左右对调即可',
      caption: String.raw`右旋的三个动作：==$B$ 上升成为新根==、==$A$ 下降成为 $B$ 的右孩子==、
      ==$B$ 原来的右子树 $B_R$ 改挂到 $A$ 的左边==。
      为什么 $B_R$ 能安全地挂到 $A$ 的左边？因为 BST 里 $B_R$ 的值全都满足 $B<B_R<A$，
      ==它本来就属于"$A$ 的左子树"这个区间==。旋转前后中序序列不变：$B_L\,B\,B_R\,A\,A_R$。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 214" role="img" aria-label="LL 型失衡的右单旋转过程">
  <text class="cap" x="170" y="16" text-anchor="middle">旋转前（A 失衡，BF = +2）</text>
  <path class="ar plain" d="M170,40 L120,100"/><path class="ar plain" d="M170,40 L230,100"/>
  <path class="ar plain" d="M120,100 L80,160"/><path class="ar plain" d="M120,100 L160,160"/>
  <g class="n r"><rect x="156" y="26" width="28" height="28" rx="14"/><text class="bt sm" x="170" y="40" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="106" y="86" width="28" height="28" rx="14"/><text class="bt sm" x="120" y="100" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n m"><rect x="210" y="86" width="40" height="28" rx="6"/><text class="bt xs" x="230" y="100" text-anchor="middle" dominant-baseline="central">A_R</text></g>
  <g class="n g"><rect x="60" y="146" width="40" height="28" rx="6"/><text class="bt xs" x="80" y="160" text-anchor="middle" dominant-baseline="central">B_L</text></g>
  <g class="n m"><rect x="140" y="146" width="40" height="28" rx="6"/><text class="bt xs" x="160" y="160" text-anchor="middle" dominant-baseline="central">B_R</text></g>
  <text class="lb em" x="80" y="190" text-anchor="middle">h+1（插在这里）</text>
  <text class="lb" x="160" y="190" text-anchor="middle">h</text>
  <text class="lb" x="230" y="130" text-anchor="middle">h</text>
  <path class="ar em" d="M296,100 H364"/>
  <text class="lb em" x="330" y="90" text-anchor="middle">右旋</text>
  <text class="cap" x="500" y="16" text-anchor="middle">旋转后（全部恢复平衡）</text>
  <path class="ar plain" d="M470,40 L420,100"/><path class="ar plain" d="M470,40 L530,100"/>
  <path class="ar plain" d="M530,100 L490,160"/><path class="ar plain" d="M530,100 L570,160"/>
  <g class="n k"><rect x="456" y="26" width="28" height="28" rx="14"/><text class="bt sm" x="470" y="40" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n g"><rect x="400" y="86" width="40" height="28" rx="6"/><text class="bt xs" x="420" y="100" text-anchor="middle" dominant-baseline="central">B_L</text></g>
  <g class="n p"><rect x="516" y="86" width="28" height="28" rx="14"/><text class="bt sm" x="530" y="100" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n m"><rect x="470" y="146" width="40" height="28" rx="6"/><text class="bt xs" x="490" y="160" text-anchor="middle" dominant-baseline="central">B_R</text></g>
  <g class="n m"><rect x="550" y="146" width="40" height="28" rx="6"/><text class="bt xs" x="570" y="160" text-anchor="middle" dominant-baseline="central">A_R</text></g>
  <text class="lb em" x="612" y="104">B_R 换了个爸爸</text>
</svg>
` },

    { t: 'code', id: 'rot-code', title: '两个单旋转的指针操作', lang: 'c',
      note: '只有三行赋值，考代码题时按这个写',
      c: String.raw`
        // 右单旋：处理 LL 型。A 是最小不平衡子树的根
        void R_Rotate(BiTree *A) {
            BiTree B = (*A)->lchild;
            (*A)->lchild = B->rchild;     // B 的右子树挂到 A 的左边
            B->rchild    = *A;            // A 成为 B 的右孩子
            *A = B;                       // B 顶替原来 A 的位置
        }

        // 左单旋：处理 RR 型
        void L_Rotate(BiTree *A) {
            BiTree B = (*A)->rchild;
            (*A)->rchild = B->lchild;
            B->lchild    = *A;
            *A = B;
        }

        // LR 型：先对 A 的左孩子左旋，再对 A 右旋
        void LR_Rotate(BiTree *A) { L_Rotate(&(*A)->lchild); R_Rotate(A); }
        // RL 型：先对 A 的右孩子右旋，再对 A 左旋
        void RL_Rotate(BiTree *A) { R_Rotate(&(*A)->rchild); L_Rotate(A); }
      ` },

    { t: 'diagram', id: 'rot-lr', title: 'LR 型：双旋转，孙子当新根',
      note: '新结点插在 C 的左边或右边都算 LR',
      caption: String.raw`双旋转的结果可以==一步到位地记住==：==$C$ 上升为新根，$B$ 和 $A$ 分列左右，
      $C$ 原来的两棵子树 $C_L$、$C_R$ 分别甩给 $B$ 当右子树、给 $A$ 当左子树==。
      中序序列前后一致：$B_L\,B\,C_L\,C\,C_R\,A\,A_R$。
      ==考场上不用真的转两次，直接照这个结果画==，再回头验一遍中序即可。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 272" role="img" aria-label="LR 型失衡的双旋转过程">
  <text class="cap" x="160" y="16" text-anchor="middle">旋转前（A 失衡）</text>
  <path class="ar plain" d="M170,38 L110,94"/><path class="ar plain" d="M170,38 L240,94"/>
  <path class="ar plain" d="M110,94 L64,150"/><path class="ar plain" d="M110,94 L150,150"/>
  <path class="ar plain" d="M150,150 L120,206"/><path class="ar plain" d="M150,150 L184,206"/>
  <g class="n r"><rect x="156" y="24" width="28" height="28" rx="14"/><text class="bt sm" x="170" y="38" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="96" y="80" width="28" height="28" rx="14"/><text class="bt sm" x="110" y="94" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n m"><rect x="220" y="80" width="40" height="28" rx="6"/><text class="bt xs" x="240" y="94" text-anchor="middle" dominant-baseline="central">A_R</text></g>
  <g class="n m"><rect x="44" y="136" width="40" height="28" rx="6"/><text class="bt xs" x="64" y="150" text-anchor="middle" dominant-baseline="central">B_L</text></g>
  <g class="n a"><rect x="136" y="136" width="28" height="28" rx="14"/><text class="bt sm" x="150" y="150" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n g"><rect x="100" y="192" width="40" height="28" rx="6"/><text class="bt xs" x="120" y="206" text-anchor="middle" dominant-baseline="central">C_L</text></g>
  <g class="n g"><rect x="164" y="192" width="40" height="28" rx="6"/><text class="bt xs" x="184" y="206" text-anchor="middle" dominant-baseline="central">C_R</text></g>
  <text class="lb em" x="152" y="240" text-anchor="middle">新结点插在 C_L 或 C_R 里</text>
  <path class="ar em" d="M300,120 H364"/>
  <text class="lb em" x="332" y="110" text-anchor="middle">先左旋 B</text>
  <text class="lb em" x="332" y="140" text-anchor="middle">再右旋 A</text>
  <text class="cap" x="500" y="16" text-anchor="middle">旋转后（C 成为新根）</text>
  <path class="ar plain" d="M500,38 L440,94"/><path class="ar plain" d="M500,38 L560,94"/>
  <path class="ar plain" d="M440,94 L404,150"/><path class="ar plain" d="M440,94 L472,150"/>
  <path class="ar plain" d="M560,94 L528,150"/><path class="ar plain" d="M560,94 L600,150"/>
  <g class="n a"><rect x="486" y="24" width="28" height="28" rx="14"/><text class="bt sm" x="500" y="38" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="426" y="80" width="28" height="28" rx="14"/><text class="bt sm" x="440" y="94" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n p"><rect x="546" y="80" width="28" height="28" rx="14"/><text class="bt sm" x="560" y="94" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n m"><rect x="384" y="136" width="40" height="28" rx="6"/><text class="bt xs" x="404" y="150" text-anchor="middle" dominant-baseline="central">B_L</text></g>
  <g class="n g"><rect x="452" y="136" width="40" height="28" rx="6"/><text class="bt xs" x="472" y="150" text-anchor="middle" dominant-baseline="central">C_L</text></g>
  <g class="n g"><rect x="508" y="136" width="40" height="28" rx="6"/><text class="bt xs" x="528" y="150" text-anchor="middle" dominant-baseline="central">C_R</text></g>
  <g class="n m"><rect x="580" y="136" width="40" height="28" rx="6"/><text class="bt xs" x="600" y="150" text-anchor="middle" dominant-baseline="central">A_R</text></g>
  <text class="lb" x="500" y="196" text-anchor="middle">C 的两棵子树被分给了 B 和 A</text>
  <text class="lb" x="500" y="220" text-anchor="middle">中序序列前后完全一致</text>
</svg>
` },

    { t: 'method', id: 'rotate-check', title: '旋转完一定要做的两个自查', c: String.raw`
      1. ==重新写一遍中序序列==，必须与旋转前完全相同。
         旋转是"改变形态、保持中序"的操作，中序变了就一定错了。
      2. ==重新算一遍每个结点的平衡因子==，必须全部落在 $\{-1,0,1\}$ 里。

      这两步加起来不到 20 秒，却能挡住这一节几乎所有的失分。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '五、例题' },

    { t: 'example', id: 'ex-avl-build',
      title: '★ 依次插入构造 AVL 树（四种旋转全出现）',
      source: '经典大题',
      level: 4,
      problem: String.raw`
        依次插入关键字 $16,\ 3,\ 7,\ 11,\ 9,\ 26,\ 18,\ 14,\ 15$，
        构造一棵平衡二叉树。写出每次失衡时的**最小不平衡子树的根**、**失衡类型**，
        并画出最终的树。
      `,
      idea: String.raw`
        ==每插一个就沿着插入路径回头看一次==，不要插完一堆再统一检查。

        判类型的机械方法：从失衡结点 $A$ 出发，==沿着"刚才插入走过的那条路"再走两步==，
        第一步是 L 还是 R、第二步是 L 还是 R，拼起来就是类型。
        不用去看整棵子树长什么样。

        另一个提速点：==每次旋转后，那棵子树的高度会恢复成插入前的值==，
        所以上面的祖先不用再检查了，直接插下一个。
      `,
      solution: String.raw`
        | 步 | 插入 | 失衡结点 $A$ | 类型 | 旋转后该子树 |
        |---|---|---|---|---|
        | 1 | 16 | — | — | 16 |
        | 2 | 3 | — | — | 16(3, ·) |
        | 3 | 7 | **16** | ==LR== | 7(3, 16) |
        | 4 | 11 | — | — | 7(3, 16(11, ·)) |
        | 5 | 9 | **16** | ==LL== | 11(9, 16) |
        | 6 | 26 | **7** | ==RR== | 11(7(3,9), 16(·,26)) |
        | 7 | 18 | **16** | ==RL== | 18(16, 26) |
        | 8 | 14 | — | — | 无需调整 |
        | 9 | 15 | **16** | ==LR== | 15(14, 16) |

        **逐步说明（只写关键几步）**

        - **第 3 步**：插 $7$ 后，$16$ 的左子树高 $2$、右子树高 $0$，$\mathrm{BF}(16)=2$。
          路径是 $16\to 3\to 7$，即==左、右==，故为 **LR**。
          双旋后 $C=7$ 上升为根：$7(3,\,16)$。
        - **第 5 步**：插 $9$ 后，$\mathrm{BF}(16)=2$，路径 $16\to 11\to 9$ 为==左、左==，
          **LL**，右单旋得 $11(9,\,16)$。此时整棵树为 $7(3,\ 11(9,16))$。
        - **第 6 步**：插 $26$ 后，从 $26$ 往上：$16$ 的 $\mathrm{BF}=-1$ 正常、
          $11$ 的 $\mathrm{BF}=-1$ 正常、==$7$ 的 $\mathrm{BF}=-2$ 失衡==。
          路径 $7\to 11\to 16$ 为==右、右==，**RR**，左单旋，$11$ 上升：
          $$11\big(\,7(3,9),\ 16(\cdot,26)\,\big)$$
        - **第 7 步**：插 $18$ 后 $\mathrm{BF}(16)=-2$，路径 $16\to 26\to 18$ 为==右、左==，
          **RL**，双旋后 $C=18$ 上升：$18(16,\,26)$。
          此时全树恰是一棵满二叉树 $11(\,7(3,9),\ 18(16,26)\,)$。
        - **第 9 步**：插 $15$ 后 $\mathrm{BF}(16)=2$，路径 $16\to 14\to 15$ 为==左、右==，
          **LR**，$C=15$ 上升：$15(14,\,16)$。

        **最终的 AVL 树**

        $$11\Big(\ 7(3,\,9),\ \ 18\big(\,15(14,\,16),\ 26\,\big)\ \Big)$$

        中序验证：$3,7,9,11,14,15,16,18,26$ ==严格递增== ✓
        高度 $4$，$9$ 个结点，各结点 $\mathrm{BF}$ 分别为
        $\mathrm{BF}(11)=-1$、$\mathrm{BF}(18)=1$、其余均为 $0$ ✓
      `,
      comment: String.raw`
        **这道题为什么值得反复练**：一道题里四种旋转全部出现了一遍，
        而且第 6 步演示了==失衡结点不一定是插入点的父亲或祖父==
        （$26$ 的父是 $16$、祖父是 $11$，但失衡的是曾祖父 $7$）。

        **最容易错的地方**：
        1. ==第 6 步只看到 $16$ 的 BF 就停下==。必须一路走到根，
            找到==第一个 $|\mathrm{BF}|=2$ 的==才停；
        2. ==LR 旋完把 $B$ 当新根==。双旋的新根永远是==孙子 $C$==；
        3. 第 8 步插 $14$ 后不检查就往下做 —— 这一步确实平衡，
            但==必须验一遍==，否则第 9 步的 $A$ 会找错。
      `,
    },

    { t: 'example', id: 'ex-avl-height',
      title: 'AVL 的高度界',
      source: '选择题',
      level: 2,
      problem: String.raw`
        (1) 高度为 $6$ 的 AVL 树至少有多少个结点？
        (2) 含 $20$ 个结点的 AVL 树，最大高度是多少？
        (3) 若某 AVL 树共 $255$ 个结点，其最小高度是多少？
      `,
      idea: String.raw`
        (1)(2) 都是 $N_h=N_{h-1}+N_{h-2}+1$ 的正反用法，==把表列出来最快==。
        (3) 问"最小高度"就跟平衡无关了 —— ==任何二叉树的最小高度都是完全二叉树的高度==。
      `,
      solution: String.raw`
        列表：$N_1=1,\ N_2=2,\ N_3=4,\ N_4=7,\ N_5=12,\ N_6=\boxed{20}$。

        **(1)** $20$ 个。

        **(2)** 找满足 $N_h\le 20$ 的最大 $h$：$N_6=20\le 20$、$N_7=33>20$，
        故最大高度为 $\boxed{6}$。

        **(3)** $255=2^8-1$，恰好是高为 $8$ 的满二叉树，
        故最小高度 $\boxed{8}$（且它确实是一棵合法的 AVL 树）。
      `,
      comment: String.raw`
        **(2) 的边界要小心**：$N_6=20$ 说明"高度 6 的 AVL 至少 20 个结点"，
        而我们恰好有 20 个 —— ==所以高度 6 是可以达到的==，答案就是 6，不是 5。
        如果题目给的是 19 个，答案才降为 5。

        ==$N_h\le n$ 的最大 $h$ 就是答案==，把不等式方向记牢。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '六、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **BST 的定义只检查父子** —— 必须是==左子树所有结点== $<$ 根 $<$ ==右子树所有结点==。
      2. **删除双孩子结点时随便找个结点顶替** —— 只能用==直接前驱或直接后继==。
      3. **失败 ASL 忘了减 1** —— 落到外部结点那一步不算比较。
      4. **外部结点数不是 $n+1$** —— 数漏了就一定错。
      5. **旋转类型记成"L 就左旋"** —— ==LL 用右旋==，方向是反的。
      6. **双旋后把 $B$ 当新根** —— 双旋的新根是==孙子 $C$==。
      7. **只检查插入点的父亲和祖父** —— 最小不平衡子树的根可能==更高==（见例题第 6 步）。
      8. **以为删除也只需一次旋转** —— ==删除可能需要 $O(\log n)$ 次连续旋转==，
         因为子树高度真的降低了，失衡会向上传播。
      9. **平衡因子写成"右减左"却不声明** —— 会导致 LL / RR 的判断整体反掉。
      10. **认为 AVL 的中序遍历需要重新排序** —— AVL 首先是 BST，==中序天然有序==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '七、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      一个统一四种旋转的角度：==所有旋转都只是在"三个结点 $A,B,C$ 和四棵子树"之间重排==，
      而重排的唯一约束是==中序序列不能变==。
      把中序序列写出来（例如 LR 型是 $B_L\,B\,C_L\,C\,C_R\,A\,A_R$），
      再问"谁当根能让两边最平衡"，答案自然就是中间那个 $C$。
      ==按这个思路，四种旋转根本不用背，现推 10 秒==。
    ` },

  ],
});
