/* ==========================================================================
   数据结构 / 5 树与二叉树 / 并查集
   ========================================================================== */

KM.page({
  path: 'ds/tree/union-find',
  title: '并查集',
  subtitle: '只用一个整型数组表示"谁和谁在同一堆" —— 以及两个把它从 $O(n)$ 压到近似 $O(1)$ 的优化',
  tags: ['必考', '代码题'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'model', c: '一、它解决什么问题' },

    { t: 'key', id: 'problem', title: '"不相交集合"的三个操作', c: String.raw`
      把 $n$ 个元素划分成若干个==互不相交==的集合（数学上就是一个**等价类**划分），
      需要支持：

      | 操作 | 含义 |
      |---|---|
      | $\mathrm{Initial}(S)$ | 把每个元素各自放进一个单元素集合 |
      | $\mathrm{Find}(S,x)$ | 查 $x$ 属于哪个集合，==返回该集合的"代表元"== |
      | $\mathrm{Union}(S,a,b)$ | 把 $a$ 所在集合与 $b$ 所在集合==合并成一个== |

      有了 $\mathrm{Find}$，"判断 $x$ 与 $y$ 是否同属一个集合"就是
      ==比较两次 $\mathrm{Find}$ 的返回值是否相等==。

      **注意并查集只支持"合并"，不支持"拆分"** ——
      这个限制是它能做到近似常数时间的前提。
    ` },

    { t: 'key', id: 'forest-rep', title: '用森林表示：每棵树 = 一个集合，树根 = 代表元', c: String.raw`
      并查集用==双亲表示法的森林==实现，而且==只需要一个 $\texttt{int}$ 数组==：

      $$S[i]=\begin{cases}
      \text{$i$ 的双亲下标}, & i\ \text{不是根}\\[4pt]
      \text{一个负数}, & i\ \text{是根（负数的绝对值 = 该集合的元素个数）}
      \end{cases}$$

      为什么用负数标记根：==既能表示"我是根"，又能顺便存下集合大小==，一个数组顶两个用。
      初始化时全部置 $-1$，表示 $n$ 个只有一个元素的集合。

      **树的形状完全无关紧要** —— 我们从不遍历这棵树，
      ==只关心"从任意结点往上走能到哪个根"==。所以可以放心地把树压扁。
    ` },

    { t: 'code', id: 'naive-code', title: '朴素实现', lang: 'c',
      note: '三个函数加起来不到 15 行',
      c: String.raw`
        #define SIZE 100
        int UFSets[SIZE];

        void Initial(int S[]) {
            for (int i = 0; i < SIZE; i++) S[i] = -1;   // 每个元素自成一集
        }

        int Find(int S[], int x) {
            while (S[x] >= 0) x = S[x];                 // 一路往上直到负数
            return x;                                   // 返回根
        }

        void Union(int S[], int Root1, int Root2) {
            if (Root1 == Root2) return;                 // 已在同一集合
            S[Root2] = Root1;                           // Root2 挂到 Root1 下
        }
      ` },

    { t: 'warn', id: 'naive-bad', title: '朴素实现的致命问题', c: String.raw`
      $\mathrm{Union}$ 只做一次赋值，是 ==$O(1)$==；
      但 $\mathrm{Find}$ 要沿着双亲链一路往上，代价是==树的高度==。

      **最坏情况**：依次执行
      $\mathrm{Union}(1,2),\ \mathrm{Union}(1,3),\ \dots,\ \mathrm{Union}(1,n)$
      （每次都把大树挂到新的单元素结点下），森林会==退化成一条长度为 $n$ 的链==，
      此后每次 $\mathrm{Find}$ 都是 ==$O(n)$==。

      $n$ 次操作总代价 $O(n^2)$ —— 对 Kruskal 这类要做 $O(e)$ 次查询的算法完全不可接受。

      ==注意 $\mathrm{Union}$ 的参数必须是两个"根"==。
      如果直接传元素编号，必须先各做一次 $\mathrm{Find}$，很多人在这里写漏。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'opt1', c: '二、优化一：按大小合并（小树并大树）' },

    { t: 'key', id: 'union-by-size', title: '规则与它保证的高度界', c: String.raw`
      **规则**：合并时==总是把结点数少的那棵树的根，挂到结点数多的那棵树的根下面==。
      （另一种等价做法是按"树高"合并，叫**按秩合并**，效果一样。）

      **为什么有效**：一个结点的深度只有在==它所在的树被并到别人下面==时才 $+1$，
      而这要求==对方至少和自己一样大==，也就是==合并后集合大小至少翻倍==。
      集合大小最多翻倍 $\log_2 n$ 次，所以

      $$\boxed{\text{任一结点的深度} \le \lfloor \log_2 n\rfloor}\quad\Longrightarrow\quad
      \mathrm{Find}=O(\log n)$$

      **推论（爱考）**：采用小树并大树策略后，
      含 $n$ 个元素的并查集，树的==最大高度为 $\lfloor\log_2 n\rfloor+1$==
      （按"高度 = 层数"记）。
    ` },

    { t: 'code', id: 'union-size-code', title: '按大小合并', lang: 'c',
      note: '根上存的是负的元素个数，所以"更小的负数"= 更大的集合',
      c: String.raw`
        void Union(int S[], int Root1, int Root2) {
            if (Root1 == Root2) return;
            if (S[Root2] > S[Root1]) {        // Root2 的集合更小
                S[Root1] += S[Root2];         // 先累加大小
                S[Root2]  = Root1;            // 小的挂到大的下面
            } else {                          // Root1 的集合更小（或相等）
                S[Root2] += S[Root1];
                S[Root1]  = Root2;
            }
        }
      ` },

    { t: 'warn', id: 'sign-trap', title: '负数比较的方向极易写反', c: String.raw`
      根上存的是 ==$-(\text{元素个数})$==，所以：

      $$\text{集合更大}\iff \text{存的数更小（更负）}$$

      判断"谁更小"时用的是 $\texttt{S[Root2] > S[Root1]}$ ——
      ==大于号意味着 Root2 的集合更小==。写反的话就变成"大树并小树"，优化直接失效。

      **累加的顺序也要注意**：必须==先把大小累加到新根上，再改指针==。
      顺序反了的话，$\texttt{S[Root2]}$ 已经被覆盖成双亲下标，累加出来就是垃圾值。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'opt2', c: '三、优化二：路径压缩' },

    { t: 'key', id: 'path-compress', title: '既然走过一趟，就顺手把路铺平', c: String.raw`
      $\mathrm{Find}(x)$ 本来就要从 $x$ 一路走到根。
      **路径压缩**的想法是：==既然已经知道根是谁了，就把这一路上经过的每个结点
      直接改挂到根下面==。

      下一次再查这条路上的任何结点，==都只需要一步==。

      这是一种"边查边整理"的**摊还优化**：单次 $\mathrm{Find}$ 的最坏代价没变，
      但由于每次都在把树压扁，==平均下来每次操作近乎 $O(1)$==。
    ` },

    { t: 'diagram', id: 'compress-demo', title: 'Find(6) 触发的路径压缩',
      note: '压缩前后集合的成员完全不变，只是变浅了',
      caption: String.raw`==并查集不在乎树长什么样，只在乎"往上走能到哪个根"==，
      所以随便压扁都不会破坏正确性。图中 $\mathrm{Find}(6)$ 把 $6$（以及路径上的 $5$）
      直接挂到根 $1$ 下；再执行 $\mathrm{Find}(4)$ 时，$4$ 也会被拉上来。
      ==反复几次之后，整棵树基本就是"根 + 一层孩子"==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 220" role="img" aria-label="并查集中 Find 操作触发路径压缩前后的对比">
  <text class="cap" x="150" y="16" text-anchor="middle">压缩前：Find(6) 要走 3 步</text>
  <path class="ar plain" d="M150,40 L70,100"/><path class="ar plain" d="M150,40 L150,100"/>
  <path class="ar plain" d="M150,40 L230,100"/>
  <path class="ar plain" d="M150,100 L150,160"/>
  <path class="ar plain" d="M230,100 L196,160"/><path class="ar plain" d="M230,100 L262,160"/>
  <g class="n p"><rect x="132" y="22" width="36" height="36" rx="18"/><text class="bt sm" x="150" y="40" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="52" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="70" y="100" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n k"><rect x="132" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="150" y="100" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n a"><rect x="212" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="230" y="100" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n k"><rect x="132" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="150" y="160" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n a"><rect x="178" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="196" y="160" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n k"><rect x="244" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="262" y="160" text-anchor="middle" dominant-baseline="central">7</text></g>
  <text class="lb em" x="150" y="200" text-anchor="middle">琥珀色 = Find(6) 走过的路径</text>
  <path class="ar em" d="M312,105 H366"/>
  <text class="cap" x="530" y="16" text-anchor="middle">压缩后：6 和 5 直接挂在根下</text>
  <path class="ar plain" d="M530,40 L430,100"/><path class="ar plain" d="M530,40 L490,100"/>
  <path class="ar plain" d="M530,40 L570,100"/><path class="ar plain" d="M530,40 L630,100"/>
  <path class="ar plain" d="M490,100 L490,160"/>
  <path class="ar plain" d="M570,100 L570,160"/>
  <g class="n p"><rect x="512" y="22" width="36" height="36" rx="18"/><text class="bt sm" x="530" y="40" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="412" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="430" y="100" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n k"><rect x="472" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="490" y="100" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n a"><rect x="552" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="570" y="100" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n g"><rect x="612" y="82" width="36" height="36" rx="18"/><text class="bt sm" x="630" y="100" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n k"><rect x="472" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="490" y="160" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n k"><rect x="552" y="142" width="36" height="36" rx="18"/><text class="bt sm" x="570" y="160" text-anchor="middle" dominant-baseline="central">7</text></g>
  <text class="lb" x="530" y="200" text-anchor="middle">4 要等下次 Find(4) 才会被拉上来</text>
</svg>
` },

    { t: 'code', id: 'compress-code', title: '带路径压缩的 Find（两趟写法）', lang: 'c',
      note: '第一趟找根，第二趟改指针 —— 考场上写这个版本最不容易错',
      c: String.raw`
        int Find(int S[], int x) {
            int root = x;
            while (S[root] >= 0) root = S[root];    // 第一趟：找到根
            while (x != root) {                     // 第二趟：全部改挂到根
                int next = S[x];
                S[x] = root;
                x = next;
            }
            return root;
        }
      ` },

    { t: 'warn', id: 'compress-trap', title: '路径压缩的两个坑', c: String.raw`
      1. ==第二趟里必须先把 $\texttt{S[x]}$ 存到临时变量再改==。
         若写成
         ~~~c
         while (x != root) { S[x] = root; x = S[x]; }
         ~~~
         那么 $\texttt{x}$ 会被赋成 $\texttt{root}$ 而直接跳出，
         ==路径上只有第一个结点被压缩了==，其余全漏。
      2. ==路径压缩会破坏"根上存的负数 = 集合大小"这个语义吗？不会==。
         压缩只改非根结点的双亲，==根的那个负数没被碰过==，
         而集合的元素个数确实也没变。
         （但如果你用的是"按**秩**（高度）合并"，压缩后真实高度会变小，
         秩就只是个上界估计了 —— 这是允许的，不用去维护它。）
    ` },

    { t: 'key', id: 'complexity', title: '三种组合的复杂度', c: String.raw`
      | 实现 | 单次 $\mathrm{Find}$ | $m$ 次操作总代价 |
      |---|---|---|
      | 朴素 | $O(n)$ | $O(mn)$ |
      | 只按大小合并 | ==$O(\log n)$== | $O(m\log n)$ |
      | 只路径压缩 | 摊还 $O(\log n)$ | $O(m\log n)$ |
      | **两者都用** | ==摊还 $O(\alpha(n))$== | $O(m\,\alpha(n))$ |

      $\alpha(n)$ 是**阿克曼函数的反函数**，增长极其缓慢 ——
      对任何现实中的 $n$（哪怕是宇宙中原子的个数）都有 ==$\alpha(n)\le 4$==，
      所以工程上直接当成常数。

      408 答题时写 =="接近 $O(1)$，严格地说是 $O(\alpha(n))$"== 即可。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'apply', c: '四、典型应用' },

    { t: 'key', id: 'use-cases', title: '看到这几种题就该想到并查集', c: String.raw`
      1. **[Kruskal 算法判断加入某条边是否成环](#/ds/graph/mst?at=kruskal-steps)** ——
         并查集在 408 里最主要的出场场合。
         "两端点已在同一集合"$\iff$"加入这条边会成环"。
      2. **求无向图的连通分量个数** —— 把每条边都 $\mathrm{Union}$ 一遍，
         最后==数一数数组里负数的个数==就是分量数。
      3. **等价类划分 / 亲戚关系 / 朋友圈** —— 题面千变万化，本质都是等价关系。
      4. **判断无向图是否是树** —— $n$ 个顶点、$n-1$ 条边、
         且==所有边加入过程中都不成环==。
    ` },

    { t: 'example', id: 'ex-trace',
      title: '★ 手工模拟并查集的数组状态',
      source: '选择/填空常见',
      level: 3,
      problem: String.raw`
        对 $8$ 个元素 $0\sim 7$ 初始化并查集（采用**小树并大树**，
        两棵树大小相等时把**后一个参数**所在树的根挂到**前一个参数**所在树的根下）。
        依次执行：

        $$\mathrm{Union}(1,2),\ \mathrm{Union}(3,4),\ \mathrm{Union}(1,3),\
        \mathrm{Union}(5,6),\ \mathrm{Union}(5,7),\ \mathrm{Union}(1,5)$$

        (1) 写出最终数组 $S[0..7]$；
        (2) 此时 $\mathrm{Find}(6)$ 要比较几次？若启用路径压缩，之后数组变成什么样？
      `,
      idea: String.raw`
        ==每一步只改两个格子==：新根的大小、被挂结点的双亲。
        建议画一张 $8$ 列的表，每执行一次 Union 就改一行，
        ==千万别在脑子里记，一定要写下来==。

        大小相等的情形要按题目给的约定处理 —— ==这是最容易和标准答案对不上的地方==，
        所以题面通常会明说（本题就说了）。
      `,
      solution: String.raw`
        **(1) 逐步执行**

        | 操作 | 两边大小 | 动作 | 结果 |
        |---|---|---|---|
        | $\mathrm{Union}(1,2)$ | 1 : 1 | 相等 → $2$ 挂到 $1$ | $S[2]=1,\ S[1]=-2$ |
        | $\mathrm{Union}(3,4)$ | 1 : 1 | 相等 → $4$ 挂到 $3$ | $S[4]=3,\ S[3]=-2$ |
        | $\mathrm{Union}(1,3)$ | 2 : 2 | 相等 → $3$ 挂到 $1$ | $S[3]=1,\ S[1]=-4$ |
        | $\mathrm{Union}(5,6)$ | 1 : 1 | 相等 → $6$ 挂到 $5$ | $S[6]=5,\ S[5]=-2$ |
        | $\mathrm{Union}(5,7)$ | 2 : 1 | $7$ 的树小 → 挂到 $5$ | $S[7]=5,\ S[5]=-3$ |
        | $\mathrm{Union}(1,5)$ | 4 : 3 | $5$ 的树小 → 挂到 $1$ | $S[5]=1,\ S[1]=-7$ |

        **最终数组**

        | 下标 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
        |---|---|---|---|---|---|---|---|---|
        | $S[i]$ | $-1$ | ==$-7$== | 1 | 1 | 3 | 1 | 5 | 5 |

        对应的森林：$\{0\}$ 单独一棵；另一棵以 $1$ 为根，
        $1$ 的孩子是 $2,3,5$，$3$ 的孩子是 $4$，$5$ 的孩子是 $6,7$。
        ==树高 3==，与 $\lfloor\log_2 8\rfloor+1=4$ 的上界相符 ✓

        **(2)** $\mathrm{Find}(6)$：$6\to 5\to 1$，共向上走 ==2 步==（比较 2 次到达根）。

        路径压缩后，路径上的 $6$ 和 $5$ 都直接挂到根 $1$（$5$ 本来就挂在 $1$ 下，不变）：

        | 下标 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
        |---|---|---|---|---|---|---|---|---|
        | $S[i]$ | $-1$ | $-7$ | 1 | 1 | 3 | 1 | ==1== | 5 |

        注意 ==$S[4]$ 和 $S[7]$ 没变==：它们不在 $\mathrm{Find}(6)$ 走过的路径上。
      `,
      comment: String.raw`
        **最容易错的三处**：

        1. ==$S[1]$ 的绝对值必须始终等于该集合的元素个数==（最终是 7）。
           算完拿这个校验一遍，错了立刻能发现。
        2. ==大小相等时的方向==。题目不说的话两种答案都算对，但要写明约定。
        3. ==路径压缩只压这一次走过的路径==，不是把整棵树压平。
           把 $S[4]$ 也改成 $1$ 就错了。

        **一个有用的观察**：数组里==负数的个数 = 集合的个数==。
        本题最终有 $S[0]=-1$ 和 $S[1]=-7$ 两个负数，所以是 2 个集合 ✓
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **$\mathrm{Union}$ 直接传元素编号** —— 参数必须是==两个根==，
         调用前要先各做一次 $\mathrm{Find}$。
      2. **按大小合并时符号判反** —— 根上存的是==负的元素个数==，
         "数更大"意味着"集合更小"。
      3. **先改指针再累加大小** —— 累加会读到已被覆盖的值。
      4. **路径压缩写成一趟且丢失临时变量** —— 只有第一个结点被压缩。
      5. **以为路径压缩后树高一定是 1** —— ==只有被走过的那条路径被压平==。
      6. **认为并查集能拆分集合** —— ==不能==，它只支持合并。
      7. **数连通分量时数"元素个数"** —— 应该数==根的个数==（数组里的负数）。
      8. **复杂度答成 $O(1)$** —— 严格说是==摊还 $O(\alpha(n))$==，写"近似常数"更稳妥。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      并查集是本章里==唯一一个"树的形状完全不重要"的结构==。
      前面所有内容（遍历、线索、BST、哈夫曼）都在精心维护树的形态，
      而并查集恰恰相反 —— ==它巴不得把树压成一层==。

      想通这个反差之后，路径压缩就不再需要理由了：
      既然只关心"根是谁"，那么==任何缩短到根距离的动作都是白赚的==。
    ` },

  ],
});
