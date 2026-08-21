/* ==========================================================================
   数据结构 / 6 图 / 存储结构与遍历（DFS / BFS）
   ========================================================================== */

KM.page({
  path: 'ds/graph/storage',
  title: '图的存储结构与遍历',
  subtitle: '邻接矩阵还是邻接表，决定了后面每一个图算法的复杂度写成 $O(n^2)$ 还是 $O(n+e)$',
  tags: ['高频', '必考', '代码题'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'terms', c: '一、术语与计数（选择题的主战场）' },

    { t: 'key', id: 'basic-terms', title: '容易混的十个词', c: String.raw`
      | 术语 | 说明 |
      |---|---|
      | **简单图** | 无重边、无自环。==408 里所有图默认都是简单图== |
      | **完全图** | 任意两点间都有边。无向 $\frac{n(n-1)}{2}$ 条，有向 $n(n-1)$ 条 |
      | **子图 / 生成子图** | 生成子图必须==包含全部顶点== |
      | **连通 / 强连通** | 无向图叫连通，==有向图叫强连通==（要求双向都可达） |
      | **连通分量** | ==极大==连通子图（不能再加顶点了） |
      | **生成树** | 连通图的==极小==连通子图，恰有 $n-1$ 条边 |
      | **网** | ==带权==的图 |
      | **简单路径** | 顶点不重复出现的路径 |
      | **回路 / 简单回路** | 首尾相同；简单回路除首尾外顶点不重复 |
      | **稀疏图 / 稠密图** | 通常以 $e<n\log n$ 为界 |

      ==注意"极大"和"极小"是两个方向==：连通分量要顶点尽量多（极大），
      生成树要边尽量少（极小）。这两个词考过判断题。
    ` },

    { t: 'formulas', id: 'count-rules', title: '顶点数、边数、度数的换算', items: [
      { label: '无向图：度数之和', tex: String.raw`\sum_{i} \mathrm{TD}(v_i)=2e` },
      { label: '有向图：入度和 = 出度和', tex: String.raw`\sum \mathrm{ID}(v_i)=\sum \mathrm{OD}(v_i)=e` },
      { label: '无向完全图的边数', tex: String.raw`\frac{n(n-1)}{2}` },
      { label: '有向完全图的弧数', tex: String.raw`n(n-1)` },
      { label: '无向图连通所**必需**的最少边数', tex: String.raw`n-1` },
      { label: '无向图**必然**连通的最少边数', tex: String.raw`\frac{(n-1)(n-2)}{2}+1` },
    ] },

    { t: 'key', id: 'must-connected', title: '★ "$n-1$ 条边"和"$\\frac{(n-1)(n-2)}{2}+1$ 条边"的区别', c: String.raw`
      这两个数字每年都被拿来出选择题，区别在于**必要**还是**充分**：

      - **连通图至少需要 $n-1$ 条边**：少于 $n-1$ 条==一定不连通==；
        但有 $n-1$ 条==不一定连通==（可能是一个环加一个孤立点）。
      - **只要边数 $>\frac{(n-1)(n-2)}{2}$ 就必然连通**：
        构造最坏情况 —— 把 $n-1$ 个顶点连成完全图（$\frac{(n-1)(n-2)}{2}$ 条边），
        剩一个孤立点，==这是"不连通"能达到的最大边数==。再多一条就非连通不可了。

      **有向图的对应结论**：
      $n$ 个顶点的**强连通图**==最少需要 $n$ 条弧==（连成一个有向环）。
      ==注意不是 $n-1$== —— 有向图里 $n-1$ 条弧最多只能做到"有根可达"，做不到强连通。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'matrix', c: '二、邻接矩阵' },

    { t: 'key', id: 'matrix-def', title: '定义与四个特点', c: String.raw`
      $$A[i][j]=\begin{cases}1,&(v_i,v_j)\in E\\ 0,&\text{否则}\end{cases}
      \qquad\text{（网则存权值，无边处存 }\infty\text{）}$$

      1. ==无向图的邻接矩阵一定对称==，可以只存上三角（$\frac{n(n-1)}{2}$ 个元素）；
      2. **求度**：无向图 $\mathrm{TD}(v_i)=$ ==第 $i$ 行（或列）之和==；
         有向图 ==第 $i$ 行之和 = 出度，第 $i$ 列之和 = 入度==；
      3. **空间 $O(n^2)$**，==与边数无关==，所以只适合稠密图；
      4. **判断 $(v_i,v_j)$ 是否有边只要 $O(1)$**，这是它唯一压倒邻接表的优势。

      **关于 $\infty$**：写代码时通常取一个足够大的常数（如 $\texttt{INT\_MAX}$ 或 $\texttt{65535}$），
      ==松弛时要注意别把 $\infty+w$ 算溢出==。
    ` },

    { t: 'key', id: 'matrix-power', title: '★ $A^k$ 的组合意义', c: String.raw`
      设 $A$ 是邻接矩阵，则

      $$\boxed{A^k[i][j]=\text{从 }v_i\text{ 到 }v_j\text{ 长度恰为 }k\text{ 的**路径条数**}}$$

      **理由**：$A^k[i][j]=\sum_{m} A^{k-1}[i][m]\cdot A[m][j]$ ——
      把"长度 $k-1$ 到 $m$ 的走法"和"$m$ 到 $j$ 的一条边"拼起来，正是乘法原理。

      ==注意这里数的是"通路（walk）"，允许顶点重复==，不是简单路径。
      考题常问"从 $a$ 到 $b$ 长度为 3 的路径有几条"，直接算 $A^3$ 的对应元素。
    ` },

    { t: 'diagram', id: 'sample-graph', title: '本章的样例图与它的邻接矩阵',
      note: '5 个顶点、6 条边的无向图',
      caption: String.raw`矩阵==沿主对角线对称==，且主对角线全 $0$（无自环）。
      每行之和就是该顶点的度：$\mathrm{TD}(A)=2,\ \mathrm{TD}(B)=2,\ \mathrm{TD}(C)=3,\ \mathrm{TD}(D)=3,\ \mathrm{TD}(E)=2$，
      合计 $12=2e=2\times 6$ ✓ —— ==这是检查矩阵有没有抄错的最快方法==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 250" role="img" aria-label="一个五顶点无向图及其邻接矩阵">
  <path class="ar plain" d="M70,54 H196"/>
  <path class="ar plain" d="M62,68 V138"/>
  <path class="ar plain" d="M204,68 V138"/>
  <path class="ar plain" d="M70,152 H196"/>
  <path class="ar plain" d="M74,166 L124,208"/>
  <path class="ar plain" d="M192,166 L146,208"/>
  <g class="n k"><rect x="44" y="36" width="36" height="36" rx="18"/><text class="bt sm" x="62" y="54" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="186" y="36" width="36" height="36" rx="18"/><text class="bt sm" x="204" y="54" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n k"><rect x="44" y="134" width="36" height="36" rx="18"/><text class="bt sm" x="62" y="152" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="186" y="134" width="36" height="36" rx="18"/><text class="bt sm" x="204" y="152" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n k"><rect x="117" y="204" width="36" height="36" rx="18"/><text class="bt sm" x="135" y="222" text-anchor="middle" dominant-baseline="central">E</text></g>
  <text class="cap" x="133" y="22" text-anchor="middle">样例图 G</text>
  <text class="lb" x="133" y="120" text-anchor="middle">C—D 是中间那条横边</text>
  <g class="n m"><rect x="330" y="24" width="270" height="196" rx="7"/></g>
  <text class="cap" x="404" y="52">A</text><text class="cap" x="440" y="52">B</text><text class="cap" x="476" y="52">C</text><text class="cap" x="512" y="52">D</text><text class="cap" x="548" y="52">E</text>
  <text class="cap" x="356" y="82">A</text><text class="cap" x="356" y="112">B</text><text class="cap" x="356" y="142">C</text><text class="cap" x="356" y="172">D</text><text class="cap" x="356" y="202">E</text>
  <text class="lb mono" x="404" y="82">0</text><text class="lb mono" x="440" y="82">1</text><text class="lb mono" x="476" y="82">1</text><text class="lb mono" x="512" y="82">0</text><text class="lb mono" x="548" y="82">0</text>
  <text class="lb mono" x="404" y="112">1</text><text class="lb mono" x="440" y="112">0</text><text class="lb mono" x="476" y="112">0</text><text class="lb mono" x="512" y="112">1</text><text class="lb mono" x="548" y="112">0</text>
  <text class="lb mono" x="404" y="142">1</text><text class="lb mono" x="440" y="142">0</text><text class="lb mono" x="476" y="142">0</text><text class="lb mono" x="512" y="142">1</text><text class="lb mono" x="548" y="142">1</text>
  <text class="lb mono" x="404" y="172">0</text><text class="lb mono" x="440" y="172">1</text><text class="lb mono" x="476" y="172">1</text><text class="lb mono" x="512" y="172">0</text><text class="lb mono" x="548" y="172">1</text>
  <text class="lb mono" x="404" y="202">0</text><text class="lb mono" x="440" y="202">0</text><text class="lb mono" x="476" y="202">1</text><text class="lb mono" x="512" y="202">1</text><text class="lb mono" x="548" y="202">0</text>
  <text class="cap" x="614" y="82">度 2</text>
  <text class="cap" x="614" y="112">度 2</text>
  <text class="cap" x="614" y="142">度 3</text>
  <text class="cap" x="614" y="172">度 3</text>
  <text class="cap" x="614" y="202">度 2</text>
  <text class="cap" x="330" y="240">行和 = 度　　主对角线全 0　　沿对角线对称</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'adjlist', c: '三、邻接表及其变体' },

    { t: 'key', id: 'adjlist-def', title: '邻接表：顶点数组 + 边链表', c: String.raw`
      每个顶点一个==单链表==，链表里挂着"与该顶点相邻的边"。

      - **无向图**：每条边==出现两次==（两个端点的链表里各一次），
        共 $2e$ 个边表结点，空间 ==$O(n+2e)$==；
      - **有向图**：每条弧==只出现一次==（在弧尾的链表里），
        共 $e$ 个边表结点，空间 ==$O(n+e)$==。

      **求度**：
      - 无向图：==数一数该顶点链表的长度==，$O(\mathrm{TD}(v))$；
      - 有向图：出度 = 链表长度，很快；
        ==入度必须扫描全部链表==，$O(n+e)$ —— **这是邻接表最大的短板**。

      **邻接表不唯一**：链表里边的先后顺序取决于插入次序，
      ==所以基于邻接表的 DFS / BFS 序列也不唯一==。
      答题时若题目没给邻接表，==要注明"按顶点编号从小到大访问"==。
    ` },

    { t: 'diagram', id: 'adjlist-demo', title: '样例图的邻接表',
      note: '同一条边在两个链表里各出现一次',
      caption: String.raw`边表结点共 $2e=12$ 个 —— ==数一数结点个数就能验证邻接表有没有抄漏==。
      表中每条链的顺序是按顶点字母序排的；如果题目给的邻接表顺序不同，
      ==DFS / BFS 的结果就会不同==，这一点在答题时必须交代清楚。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 232" role="img" aria-label="样例图的邻接表存储结构">
  <text class="cap" x="14" y="18">顶点数组</text>
  <text class="cap" x="120" y="18">边表（相邻顶点）</text>
  <path class="ar" d="M84,44 H108"/><path class="ar" d="M162,44 H186"/>
  <path class="ar" d="M84,82 H108"/><path class="ar" d="M162,82 H186"/>
  <path class="ar" d="M84,120 H108"/><path class="ar" d="M162,120 H186"/><path class="ar" d="M240,120 H264"/>
  <path class="ar" d="M84,158 H108"/><path class="ar" d="M162,158 H186"/><path class="ar" d="M240,158 H264"/>
  <path class="ar" d="M84,196 H108"/><path class="ar" d="M162,196 H186"/>
  <g class="n p"><rect x="30" y="30" width="54" height="28" rx="5"/><text class="bt sm" x="57" y="44" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n p"><rect x="30" y="68" width="54" height="28" rx="5"/><text class="bt sm" x="57" y="82" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n p"><rect x="30" y="106" width="54" height="28" rx="5"/><text class="bt sm" x="57" y="120" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n p"><rect x="30" y="144" width="54" height="28" rx="5"/><text class="bt sm" x="57" y="158" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n p"><rect x="30" y="182" width="54" height="28" rx="5"/><text class="bt sm" x="57" y="196" text-anchor="middle" dominant-baseline="central">E</text></g>
  <g class="n k"><rect x="108" y="30" width="54" height="28" rx="5"/><text class="bt sm" x="135" y="44" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n k"><rect x="186" y="30" width="54" height="28" rx="5"/><text class="bt sm" x="213" y="44" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="108" y="68" width="54" height="28" rx="5"/><text class="bt sm" x="135" y="82" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="186" y="68" width="54" height="28" rx="5"/><text class="bt sm" x="213" y="82" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n k"><rect x="108" y="106" width="54" height="28" rx="5"/><text class="bt sm" x="135" y="120" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="186" y="106" width="54" height="28" rx="5"/><text class="bt sm" x="213" y="120" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n k"><rect x="264" y="106" width="54" height="28" rx="5"/><text class="bt sm" x="291" y="120" text-anchor="middle" dominant-baseline="central">E</text></g>
  <g class="n k"><rect x="108" y="144" width="54" height="28" rx="5"/><text class="bt sm" x="135" y="158" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n k"><rect x="186" y="144" width="54" height="28" rx="5"/><text class="bt sm" x="213" y="158" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="264" y="144" width="54" height="28" rx="5"/><text class="bt sm" x="291" y="158" text-anchor="middle" dominant-baseline="central">E</text></g>
  <g class="n k"><rect x="108" y="182" width="54" height="28" rx="5"/><text class="bt sm" x="135" y="196" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="186" y="182" width="54" height="28" rx="5"/><text class="bt sm" x="213" y="196" text-anchor="middle" dominant-baseline="central">D</text></g>
  <text class="lb" x="346" y="48">链长 2 = 度</text>
  <text class="lb" x="346" y="86">链长 2</text>
  <text class="lb" x="346" y="124">链长 3</text>
  <text class="lb" x="346" y="162">链长 3</text>
  <text class="lb" x="346" y="200">链长 2</text>
  <g class="n a"><rect x="450" y="30" width="238" height="90" rx="7"/>
    <text class="bt sm" x="569" y="52" text-anchor="middle" dominant-baseline="central">边表结点共 2e = 12 个</text>
    <text class="bs" x="569" y="76" text-anchor="middle" dominant-baseline="central">无向图每条边存两遍</text>
    <text class="bs" x="569" y="98" text-anchor="middle" dominant-baseline="central">有向图只在弧尾存一遍，共 e 个</text></g>
  <text class="cap" x="450" y="150">空间 O(n + 2e)，与稀疏程度成正比</text>
  <text class="cap" x="450" y="174">判断两点是否相邻要 O(TD(v))，比矩阵慢</text>
  <text class="cap" x="450" y="198">有向图求入度要扫全表，这是它的软肋</text>
</svg>
` },

    { t: 'key', id: 'other-rep', title: '十字链表与邻接多重表（了解即可，但会考名字）', c: String.raw`
      | 结构 | 用于 | 解决的问题 |
      |---|---|---|
      | **十字链表** | ==有向图== | 把邻接表和逆邻接表合二为一，==求入度和出度都快== |
      | **邻接多重表** | ==无向图== | 每条边==只存一个结点==，两个端点共享，
        ==删边 / 给边打标记只需改一处== |

      **必须记住的对应关系**（判断题最爱换着问）：
      ==十字链表只用于有向图，邻接多重表只用于无向图==，反了就是错的。

      邻接表存无向图时，一条边存了两份，"删除一条边"要改两个链表、
      "标记这条边已访问"也要改两处 —— 邻接多重表就是为了消掉这个冗余。
    ` },

    { t: 'compare', id: 'storage-compare', title: '四种存储结构对照',
      cols: ['', '邻接矩阵', '邻接表', '十字链表', '邻接多重表'],
      rows: [
        ['适用', '任意', '任意', '仅有向图', '仅无向图'],
        ['空间', '$O(n^2)$', '无向 $O(n+2e)$ / 有向 $O(n+e)$', '$O(n+e)$', '$O(n+e)$'],
        ['判断 $(u,v)$ 相邻', '✅ $O(1)$', '$O(\\mathrm{TD}(u))$', '$O(\\mathrm{OD}(u))$', '$O(\\mathrm{TD}(u))$'],
        ['求出度 / 入度', '两者都 $O(n)$', '出度快，==入度慢==', '两者都快', '——'],
        ['找某点的所有邻接点', '$O(n)$', '✅ $O(\\mathrm{TD}(v))$', '快', '快'],
        ['唯一性', '==唯一==', '==不唯一==', '不唯一', '不唯一'],
        ['适合', '稠密图', '稀疏图', '有向稀疏图', '无向稀疏图'],
      ] },

    /* ================================================================== */
    { t: 'h', id: 'bfs', c: '四、广度优先搜索 BFS' },

    { t: 'key', id: 'bfs-idea', title: '像水波一样一圈一圈扩散', c: String.raw`
      BFS 是[二叉树层序遍历](#/ds/tree/traversal?at=level-idea)在图上的推广，
      只多了一件事：==要用 $\texttt{visited}$ 数组防止重复访问==（图有回路，树没有）。

      **访问顺序的性质**：==BFS 按"离起点的边数"从小到大访问顶点==。
      这直接给出了一个重要副产品 ——
      ==BFS 可以求无权图（或所有边权相等的图）的单源最短路径==。
    ` },

    { t: 'code', id: 'bfs-code', title: 'BFS（含非连通图的处理）', lang: 'c',
      note: '外层循环是为了扫到所有连通分量',
      c: String.raw`
        bool visited[MAX_VERTEX_NUM];

        void BFS(Graph G, int v) {
            visit(v);  visited[v] = true;
            EnQueue(Q, v);
            while (!isEmpty(Q)) {
                DeQueue(Q, v);
                for (int w = FirstNeighbor(G, v); w >= 0; w = NextNeighbor(G, v, w))
                    if (!visited[w]) {
                        visit(w);  visited[w] = true;
                        EnQueue(Q, w);
                    }
            }
        }

        void BFSTraverse(Graph G) {
            for (int i = 0; i < G.vexnum; i++) visited[i] = false;
            InitQueue(Q);
            for (int i = 0; i < G.vexnum; i++)
                if (!visited[i]) BFS(G, i);       // 每调用一次 = 一个连通分量
        }
      ` },

    { t: 'warn', id: 'visited-position', title: '$\\texttt{visited}$ 必须在**入队时**置位', c: String.raw`
      标准写法是==访问并置 $\texttt{visited}$ 之后立刻入队==。
      如果改成"出队时才置位"，同一个顶点可能被==多个邻居重复入队==，
      队列长度失控，虽然结果还对但复杂度变差、也不符合标准答案。

      同样的原则在[树的层序遍历](#/ds/tree/traversal?at=level-code)里不存在
      —— 树没有回路，所以不需要 $\texttt{visited}$。==图和树的差别几乎全在这一点上==。
    ` },

    { t: 'code', id: 'bfs-shortest', title: 'BFS 求无权单源最短路径', lang: 'c',
      note: '只比标准 BFS 多两行：记录距离和前驱',
      c: String.raw`
        void BFS_MIN_Distance(Graph G, int u, int d[], int path[]) {
            for (int i = 0; i < G.vexnum; i++) { d[i] = INF; path[i] = -1; }
            d[u] = 0;  visited[u] = true;  EnQueue(Q, u);
            while (!isEmpty(Q)) {
                int v;  DeQueue(Q, v);
                for (int w = FirstNeighbor(G, v); w >= 0; w = NextNeighbor(G, v, w))
                    if (!visited[w]) {
                        d[w]    = d[v] + 1;       // 距离 +1
                        path[w] = v;              // 记下从哪来的
                        visited[w] = true;
                        EnQueue(Q, w);
                    }
            }
        }
      ` },

    /* ================================================================== */
    { t: 'h', id: 'dfs', c: '五、深度优先搜索 DFS' },

    { t: 'code', id: 'dfs-code', title: 'DFS（递归版）', lang: 'c',
      note: '和二叉树的先序遍历骨架完全相同',
      c: String.raw`
        bool visited[MAX_VERTEX_NUM];

        void DFS(Graph G, int v) {
            visit(v);  visited[v] = true;
            for (int w = FirstNeighbor(G, v); w >= 0; w = NextNeighbor(G, v, w))
                if (!visited[w]) DFS(G, w);
        }

        void DFSTraverse(Graph G) {
            for (int i = 0; i < G.vexnum; i++) visited[i] = false;
            for (int i = 0; i < G.vexnum; i++)
                if (!visited[i]) DFS(G, i);
        }
      ` },

    { t: 'key', id: 'complexity', title: '★ 复杂度：只看存储结构，不看是 DFS 还是 BFS', c: String.raw`
      | 存储结构 | 时间 | 为什么 |
      |---|---|---|
      | **邻接矩阵** | ==$O(n^2)$== | 每个顶点都要扫一遍它那一整行（$n$ 个位置） |
      | **邻接表** | ==$O(n+e)$== | 顶点各访问一次 $+$ 每个边表结点各扫一次 |

      ==DFS 和 BFS 的时间复杂度完全一样==，差别只在遍历次序和辅助空间的用法：

      - **BFS 空间**：队列，最坏 $O(n)$（某一层可能有 $n-1$ 个顶点）；
      - **DFS 空间**：递归栈，最坏 $O(n)$（退化成一条链）。

      ==两者都是 $O(n)$，不要答"DFS 空间更小"==。
    ` },

    { t: 'key', id: 'traverse-tree', title: '遍历生成树与连通分量', c: String.raw`
      遍历时"第一次访问某顶点所经过的那条边"合起来构成一棵树：

      - BFS 得到 **BFS 生成树**（==高度一定最小==，因为按层扩展）；
      - DFS 得到 **DFS 生成树**（往往又高又瘦）。

      **对非连通图**，一次调用只能走遍一个连通分量，会得到==生成森林==。
      于是有一条极常考的结论：

      $$\boxed{\text{无向图中 }\mathrm{DFSTraverse}\ \text{里 }\texttt{DFS}\ \text{被调用的次数}=\text{连通分量个数}}$$

      **对有向图这条不成立** —— 调用次数与强连通分量个数==没有直接关系==，
      它取决于顶点的枚举顺序。这是一个很爱设的陷阱。

      **另一条**：邻接矩阵存储时==生成树唯一==（矩阵唯一、扫描顺序唯一）；
      ==邻接表存储时生成树不唯一==（链表顺序可以不同）。
    ` },

    { t: 'example', id: 'ex-traverse',
      title: '写出样例图的 DFS 与 BFS 序列',
      source: '基础必会',
      level: 2,
      problem: String.raw`
        对[本页的样例图](#/ds/graph/storage?at=sample-graph)
        （顶点 $\texttt{A},\texttt{B},\texttt{C},\texttt{D},\texttt{E}$，
        边 $\texttt{AB},\texttt{AC},\texttt{BD},\texttt{CD},\texttt{CE},\texttt{DE}$），
        从 $\texttt{A}$ 出发、==同一顶点的邻接点按字母序访问==，写出：

        (1) DFS 序列与 DFS 生成树；
        (2) BFS 序列与各顶点到 $\texttt{A}$ 的最短路径长度。
      `,
      idea: String.raw`
        DFS ==只要一条路走到黑==：每到一个新顶点，就在它的邻接表里找第一个没访问过的往下钻，
        走不动了才回退。
        BFS ==只要老老实实维护队列==：出一个、把它所有没访问过的邻居全入队。

        ==最容易错的是"回退之后还要继续找下一个邻居"==，
        很多人回退到某点就直接再往上退了，漏掉分支。
      `,
      solution: String.raw`
        **(1) DFS**

        $\texttt{A}\to\texttt{B}$（A 的第一个邻居）
        $\to\texttt{D}$（B 除 A 外只有 D）
        $\to\texttt{C}$（D 的邻居 B 已访问，取 C）
        $\to\texttt{E}$（C 的邻居 A、D 已访问，取 E）
        $\to$ E 的邻居全访问过，回退结束。

        $$\text{DFS 序列}=\texttt{A B D C E}$$

        **DFS 生成树**的边：$\texttt{A-B},\ \texttt{B-D},\ \texttt{D-C},\ \texttt{C-E}$
        —— 是一条==长链，高度 5==。

        **(2) BFS**

        - 访问 $\texttt{A}$，入队 $\texttt{B},\texttt{C}$；
        - 出队 $\texttt{B}$，入队 $\texttt{D}$；
        - 出队 $\texttt{C}$，其邻居 $\texttt{A}$、$\texttt{D}$ 已访问 / 已入队，入队 $\texttt{E}$；
        - 出队 $\texttt{D}$、$\texttt{E}$，无新顶点。

        $$\text{BFS 序列}=\texttt{A B C D E}$$

        | 顶点 | A | B | C | D | E |
        |---|---|---|---|---|---|
        | 到 A 的最短边数 | 0 | 1 | 1 | 2 | 2 |

        **BFS 生成树**的边：$\texttt{A-B},\ \texttt{A-C},\ \texttt{B-D},\ \texttt{C-E}$，==高度 3==。
      `,
      comment: String.raw`
        **对比很说明问题**：同一个图，DFS 生成树高 5、BFS 生成树高 3。
        ==BFS 生成树的高度一定是所有生成树里最小的==，因为它按距离分层。

        **常见错误**：BFS 到 $\texttt{C}$ 时把 $\texttt{D}$ 又入队一次。
        $\texttt{D}$ 在处理 $\texttt{B}$ 时就已经 $\texttt{visited}$ 了 ——
        这正是[上面强调的"入队即置位"](#/ds/graph/storage?at=visited-position)要防的问题。

        **若从别的顶点出发**，序列会完全不同；
        ==若邻接表的链表顺序不同，序列也会不同==。答题时务必写明假设。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '六、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **"$n-1$ 条边一定连通"** —— ==只是必要条件==；充分条件是边数 $>\frac{(n-1)(n-2)}{2}$。
      2. **强连通图最少 $n-1$ 条弧** —— ==是 $n$ 条==（一个有向环）。
      3. **邻接表的空间写成 $O(n+e)$ 却说的是无向图** —— 无向图是 ==$O(n+2e)$==。
      4. **十字链表 / 邻接多重表的适用对象记反** —— ==十字对有向，多重对无向==。
      5. **说邻接矩阵不唯一** —— ==顶点编号定了矩阵就唯一==；不唯一的是邻接表。
      6. **DFS 的时间复杂度按算法写** —— 只取决于==存储结构==：矩阵 $O(n^2)$、表 $O(n+e)$。
      7. **认为 BFS 能求带权图最短路径** —— ==只对无权 / 等权图成立==，
         带权要用 [Dijkstra](#/ds/graph/shortest?at=dijkstra-idea)。
      8. **有向图里数 $\texttt{DFS}$ 的调用次数当强连通分量数** —— ==不成立==。
      9. **忘记 $\texttt{visited}$ 数组** —— 图有回路，不判就死循环。
      10. **$A^k$ 的含义答成"简单路径条数"** —— 是==允许重复顶点的通路条数==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '七、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      图这一章的所有算法，==写起来都是"遍历 + 在遍历时多维护一个数组"==：
      BFS 多维护 $d[\,]$ 就成了无权最短路，
      DFS 多维护"完成时间"就成了[拓扑排序](#/ds/graph/topo?at=complexity-topo)，
      多维护"当前已知最小代价"就成了 [Prim](#/ds/graph/mst?at=prim-idea)。

      ==所以真正要熟到肌肉记忆的只有 DFS / BFS 两个骨架==，其余是往里塞东西。
    ` },

  ],
});
