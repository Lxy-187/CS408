/* ==========================================================================
   数据结构 / 6 图 / 最短路径（BFS / Dijkstra / Floyd）
   ========================================================================== */

KM.page({
  path: 'ds/graph/shortest',
  title: '最短路径',
  subtitle: '无权用 BFS、单源带权用 Dijkstra、全源用 Floyd —— 以及 Dijkstra 为什么怕负权',
  tags: ['高频', '必考', '手算', '综合应用'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'overview', c: '一、三个问题，三种算法' },

    { t: 'compare', id: 'three-algos', title: '先把选型问题解决掉',
      cols: ['问题', '算法', '时间', '能否负权', '本质'],
      rows: [
        ['无权图的单源最短路', '**BFS**', '$O(n+e)$', '不适用', '按层扩散'],
        ['带权图的**单源**最短路', '**Dijkstra**', '$O(n^2)$', '==不能==', '贪心'],
        ['带权图的**全源**最短路', '**Floyd**', '$O(n^3)$', '==可以（但不能有负权回路）==', '动态规划'],
      ] },

    { t: 'key', id: 'why-bfs-works', title: '无权图为什么 BFS 就够了', c: String.raw`
      所有边权都是 1 时，"路径长度"就是"经过的边数"。
      而 [BFS 恰好按边数从小到大访问顶点](#/ds/graph/storage?at=bfs-shortest)，
      ==第一次访问到某顶点时走的就是最短路==，后面不可能更短。

      **边权全部相等（都是 $w$）时同样成立**，答案乘个 $w$ 即可。
      ==只要边权不全相等，BFS 就失效==，必须换 Dijkstra。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'dijkstra', c: '二、Dijkstra：单源带权最短路' },

    { t: 'key', id: 'dijkstra-idea', title: '思想：每次"敲定"一个离源点最近的顶点', c: String.raw`
      维护三样东西：

      | 数组 | 含义 |
      |---|---|
      | $\texttt{S[]}$ | 已经==确定==了最短路的顶点集合 |
      | $\texttt{dist[v]}$ | 从源点到 $v$ 的==当前已知最短距离==（只允许中间经过 $S$ 中的点） |
      | $\texttt{path[v]}$ | $v$ 在最短路上的==前驱顶点==，用来回溯出整条路径 |

      **每一轮做两件事**：

      1. **选点**：在 $S$ 之外挑 $\texttt{dist}$ 最小的顶点 $u$，==把它并入 $S$（此时它的 dist 被永久敲定）==；
      2. **松弛**：用 $u$ 去更新它所有邻居：
         $$\text{若}\ \texttt{dist[u]} + w(u,v) < \texttt{dist[v]},\ \text{则}\ \texttt{dist[v]}\leftarrow \texttt{dist[u]}+w(u,v),\ \texttt{path[v]}\leftarrow u$$

      重复 $n-1$ 轮，所有顶点进入 $S$。

      **和 [Prim](#/ds/graph/mst?at=prim-idea) 长得几乎一样**，但==比较的量不同==：
      Prim 比的是"$v$ 到树的**一条边**的权"，Dijkstra 比的是"源点到 $v$ 的**整条路径**长度"。
      ==这是这两个算法唯一但致命的区别==，写代码时松弛那一行差一个 $\texttt{dist[u]}+$。
    ` },

    { t: 'code', id: 'dijkstra-code', title: 'Dijkstra（邻接矩阵版）', lang: 'c',
      note: '对照 Prim 看，差别只在一处',
      c: String.raw`
        void Dijkstra(MGraph G, int v0, int dist[], int path[]) {
            bool S[MAXV] = {false};
            for (int i = 0; i < G.n; i++) {
                dist[i] = G.edges[v0][i];
                path[i] = (dist[i] < INF && i != v0) ? v0 : -1;
            }
            dist[v0] = 0;  S[v0] = true;

            for (int k = 1; k < G.n; k++) {
                int min = INF, u = -1;
                for (int j = 0; j < G.n; j++)          // ① 选出未确定中最近的
                    if (!S[j] && dist[j] < min) { min = dist[j]; u = j; }
                if (u == -1) break;                    // 剩下的都不可达
                S[u] = true;                           // ② 敲定 u

                for (int j = 0; j < G.n; j++)          // ③ 用 u 松弛
                    if (!S[j] && dist[u] + G.edges[u][j] < dist[j]) {
                        dist[j] = dist[u] + G.edges[u][j];
                        path[j] = u;
                    }
            }
        }
      ` },

    { t: 'diagram', id: 'dij-graph', title: '本节的样例有向网',
      note: '5 个顶点，源点为 V0',
      caption: String.raw`注意 $V_1\!\leftrightarrow\! V_4$ 与 $V_2\!\leftrightarrow\! V_3$ 都是==两条方向相反、权值不同的弧==，
      在有向图里它们是两条独立的边，==不能当成一条无向边==。
      $V_0\to V_1$ 虽然有一条直达的弧（权 $10$），但绕道 $V_4$ 只要 $5+3=8$ ——
      ==这就是为什么必须做松弛，而不能直接读邻接矩阵==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 276" role="img" aria-label="五顶点有向带权图，用于演示 Dijkstra 算法">
  <path class="ar" d="M98,62 H228"/>
  <path class="ar" d="M92,78 L232,184"/>
  <path class="ar" d="M268,62 H398"/>
  <path class="ar" d="M244,80 Q230,131 244,182"/>
  <path class="ar" d="M256,182 Q270,131 256,80"/>
  <path class="ar" d="M414,80 Q400,131 414,182"/>
  <path class="ar" d="M426,182 Q440,131 426,80"/>
  <path class="ar" d="M266,186 L402,80"/>
  <path class="ar" d="M268,202 H398"/>
  <g class="n p"><rect x="62" y="44" width="36" height="36" rx="18"/><text class="bt sm" x="80" y="62" text-anchor="middle" dominant-baseline="central">V0</text></g>
  <g class="n k"><rect x="232" y="44" width="36" height="36" rx="18"/><text class="bt sm" x="250" y="62" text-anchor="middle" dominant-baseline="central">V1</text></g>
  <g class="n k"><rect x="402" y="44" width="36" height="36" rx="18"/><text class="bt sm" x="420" y="62" text-anchor="middle" dominant-baseline="central">V2</text></g>
  <g class="n k"><rect x="402" y="184" width="36" height="36" rx="18"/><text class="bt sm" x="420" y="202" text-anchor="middle" dominant-baseline="central">V3</text></g>
  <g class="n k"><rect x="232" y="184" width="36" height="36" rx="18"/><text class="bt sm" x="250" y="202" text-anchor="middle" dominant-baseline="central">V4</text></g>
  <text class="lb" x="165" y="52" text-anchor="middle">10</text>
  <text class="lb em" x="146" y="140" text-anchor="middle">5</text>
  <text class="lb em" x="335" y="52" text-anchor="middle">1</text>
  <text class="lb" x="216" y="136" text-anchor="middle">2</text>
  <text class="lb em" x="284" y="136" text-anchor="middle">3</text>
  <text class="lb" x="386" y="136" text-anchor="middle">4</text>
  <text class="lb" x="454" y="136" text-anchor="middle">6</text>
  <text class="lb" x="352" y="146" text-anchor="middle">9</text>
  <text class="lb em" x="335" y="222" text-anchor="middle">2</text>
  <text class="cap" x="14" y="22">样例有向网（琥珀色 = 最终最短路径树用到的弧）</text>
  <g class="n g"><rect x="500" y="40" width="188" height="126" rx="7"/>
    <text class="bt sm" x="594" y="62" text-anchor="middle" dominant-baseline="central">V0 出发的最终 dist</text>
    <text class="bs" x="594" y="86" text-anchor="middle" dominant-baseline="central">V1 = 8　V2 = 9</text>
    <text class="bs" x="594" y="108" text-anchor="middle" dominant-baseline="central">V3 = 7　V4 = 5</text>
    <text class="bs" x="594" y="140" text-anchor="middle" dominant-baseline="central">敲定顺序 V4 → V3 → V1 → V2</text></g>
  <text class="cap" x="14" y="244">V0→V1 走 V0-V4-V1 = 8，比直达的弧（权 10）更短</text>
  <text class="cap" x="14" y="266">V0→V2 走 V0-V4-V1-V2 = 9</text>
</svg>
` },

    { t: 'example', id: 'ex-dijkstra',
      title: '★ Dijkstra 手算表（必须练熟的题型）',
      source: '经典大题',
      level: 3,
      problem: String.raw`
        有向网的弧与权值为：
        $V_0\!\to\! V_1(10)$、$V_0\!\to\! V_4(5)$、$V_1\!\to\! V_2(1)$、$V_1\!\to\! V_4(2)$、
        $V_2\!\to\! V_3(4)$、$V_3\!\to\! V_2(6)$、$V_4\!\to\! V_1(3)$、$V_4\!\to\! V_2(9)$、$V_4\!\to\! V_3(2)$。

        以 $V_0$ 为源点执行 Dijkstra，写出每一轮的 $\texttt{dist}$ 数组、被敲定的顶点，
        以及最终各条最短路径。
      `,
      idea: String.raw`
        **一定要画表格**，一行一轮，列是 $V_1\sim V_4$。每轮：
        1. ==先在未敲定的列里圈出最小值==（这个顶点这一轮被敲定，用方框标出来）；
        2. ==再用它去松弛==，被更新的格子写新值并记下前驱。

        **已敲定的顶点，后面的轮次里那一列就不用再看了**——
        这一点是 Dijkstra 全部效率的来源，也是它怕负权的原因。

        ==前驱 $\texttt{path}$ 一定要同步记==，不然最后写路径时要重推一遍。
      `,
      solution: String.raw`
        初始（只看 $V_0$ 的直接出弧）：
        $\texttt{dist}=[\,0,\ 10,\ \infty,\ \infty,\ 5\,]$，$S=\{V_0\}$。

        | 轮 | $V_1$ | $V_2$ | $V_3$ | $V_4$ | 敲定 | 松弛后发生了什么 |
        |---|---|---|---|---|---|---|
        | 初始 | 10 (V0) | ∞ | ∞ | **5** (V0) | ==$V_4$== | — |
        | 1 | **8** (V4) | 14 (V4) | **7** (V4) | — | ==$V_3$== | $V_4$ 把三条边全松弛了：$V_1$ 从 10 降到 8 |
        | 2 | **8** (V4) | 13 (V3) | — | — | ==$V_1$== | $V_3\!\to\! V_2$ 使 $V_2$ 从 14 降到 13 |
        | 3 | — | **9** (V1) | — | — | ==$V_2$== | $V_1\!\to\! V_2$ 使 $V_2$ 从 13 降到 9 |
        | 4 | — | — | — | — | 全部完成 | $V_2\!\to\! V_3$ 得 $9+4=13>7$，不更新 |

        **最终结果**

        $$\texttt{dist}=[\,0,\ 8,\ 9,\ 7,\ 5\,]$$

        | 终点 | 最短距离 | 最短路径 |
        |---|---|---|
        | $V_1$ | 8 | $V_0\to V_4\to V_1$ |
        | $V_2$ | 9 | $V_0\to V_4\to V_1\to V_2$ |
        | $V_3$ | 7 | $V_0\to V_4\to V_3$ |
        | $V_4$ | 5 | $V_0\to V_4$ |

        路径由 $\texttt{path}$ 数组==倒着回溯==得到：
        $V_2$ 的前驱是 $V_1$，$V_1$ 的前驱是 $V_4$，$V_4$ 的前驱是 $V_0$。
      `,
      comment: String.raw`
        **这道题的三个教学点**：

        1. ==$V_2$ 被更新了三次==（$\infty\to 14\to 13\to 9$），
           说明"某个顶点的 dist 会反复下降，直到它被敲定"。
           **只有被敲定的那一刻才是最终值**。
        2. ==$V_1$ 的直达弧权 10，最终值却是 8==。
           很多人初始化完就把 10 当答案了。
        3. 第 4 轮松弛 $V_2\to V_3$ 得 13，但 $V_3$ 早已敲定为 7 ——
           ==已敲定的顶点不再接受松弛==。

        **考场自查**：$\texttt{dist}$ 数组==只会单调下降，绝不会上升==；
        某一轮出现某个值变大了，就一定抄错了。
      `,
    },

    { t: 'warn', id: 'negative-weight', title: '★ Dijkstra 为什么不能有负权边', c: String.raw`
      Dijkstra 的正确性依赖一个假设：
      ==当前 dist 最小的那个顶点，它的 dist 不可能再变小==
      （因为任何绕路都要再加上一条非负的边，只会更长）。

      **有负权边时这个假设崩了**。反例：

      $$V_0\xrightarrow{\ 3\ }V_1,\qquad V_0\xrightarrow{\ 4\ }V_2,\qquad V_2\xrightarrow{\ -2\ }V_1$$

      Dijkstra 的执行：初始 $\texttt{dist}=[0,3,4]$，
      第一轮选中 $V_1$（$3$ 最小）并==永久敲定 $\texttt{dist}[V_1]=3$==。
      但真实最短路是 $V_0\to V_2\to V_1$，长度 $4+(-2)=\boxed{2}$。==算错了==。

      **结论**：
      - 有负权边 → ==Dijkstra 不适用==（Floyd 或 Bellman-Ford 可以）；
      - 有负权**回路** → ==最短路径根本不存在==（可以无限绕圈让长度趋于 $-\infty$），
        任何算法都无解。
    ` },

    { t: 'diagram', id: 'neg-example', title: '负权反例',
      note: 'Dijkstra 会把 V1 敲定为 3，实际最短是 2',
      caption: String.raw`==问题的根源是"敲定"这个动作==：Dijkstra 一旦把某顶点并入 $S$ 就不再回头，
      而负权边意味着"后面的路可能反而更省"，破坏了这个前提。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 148" role="img" aria-label="含负权边的三顶点图，说明 Dijkstra 会给出错误结果">
  <path class="ar" d="M98,52 L212,52"/>
  <path class="ar" d="M92,68 L212,112"/>
  <path class="ar" d="M230,96 L230,70"/>
  <g class="n p"><rect x="62" y="34" width="36" height="36" rx="18"/><text class="bt sm" x="80" y="52" text-anchor="middle" dominant-baseline="central">V0</text></g>
  <g class="n k"><rect x="212" y="34" width="36" height="36" rx="18"/><text class="bt sm" x="230" y="52" text-anchor="middle" dominant-baseline="central">V1</text></g>
  <g class="n r"><rect x="212" y="96" width="36" height="36" rx="18"/><text class="bt sm" x="230" y="114" text-anchor="middle" dominant-baseline="central">V2</text></g>
  <text class="lb" x="155" y="42" text-anchor="middle">3</text>
  <text class="lb" x="140" y="102" text-anchor="middle">4</text>
  <text class="lb em" x="256" y="86">−2</text>
  <g class="n r"><rect x="320" y="30" width="364" height="44" rx="7"/>
    <text class="bt sm" x="502" y="44" text-anchor="middle" dominant-baseline="central">Dijkstra：第一轮 dist[V1]=3 最小 → 敲定 3（错）</text>
    <text class="bs" x="502" y="64" text-anchor="middle" dominant-baseline="central">再也不会回头检查 V0→V2→V1</text></g>
  <g class="n g"><rect x="320" y="86" width="364" height="44" rx="7"/>
    <text class="bt sm" x="502" y="100" text-anchor="middle" dominant-baseline="central">真实最短：V0 → V2 → V1 = 4 + (−2) = 2</text>
    <text class="bs" x="502" y="120" text-anchor="middle" dominant-baseline="central">Floyd 能算对（它不"敲定"，而是枚举中转点）</text></g>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'floyd', c: '三、Floyd：全源最短路（动态规划）' },

    { t: 'key', id: 'floyd-idea', title: '递推式：允许中间经过前 $k$ 个顶点', c: String.raw`
      定义 $A^{(k)}[i][j]$ = 从 $v_i$ 到 $v_j$、==中间顶点只允许取自 $\{v_0,\dots,v_k\}$== 时的最短路径长度。

      初值 $A^{(-1)}=$ 邻接矩阵（不许经过任何中间点）。递推：

      $$\boxed{A^{(k)}[i][j]=\min\Big(A^{(k-1)}[i][j],\ \ A^{(k-1)}[i][k]+A^{(k-1)}[k][j]\Big)}$$

      含义：要么==不经过 $v_k$==（沿用旧值），要么==在 $v_k$ 处中转一下==。

      做完 $k=0,1,\dots,n-1$ 共 $n$ 轮，$A^{(n-1)}$ 就是全源最短路径矩阵。

      **辅助的路径矩阵** $\texttt{path}[i][j]$ 记录"$i$ 到 $j$ 的路径上的中转点"，
      每次发生更新时置为 $k$，最后==递归拆分==即可还原完整路径。
    ` },

    { t: 'code', id: 'floyd-code', title: 'Floyd：五行的三重循环', lang: 'c',
      note: 'k 必须在最外层 —— 这是本节最容易写错的一点',
      c: String.raw`
        void Floyd(MGraph G, int A[][MAXV], int path[][MAXV]) {
            for (int i = 0; i < G.n; i++)
                for (int j = 0; j < G.n; j++) {
                    A[i][j]    = G.edges[i][j];
                    path[i][j] = -1;
                }

            for (int k = 0; k < G.n; k++)              // ← 中转点，必须最外层
                for (int i = 0; i < G.n; i++)
                    for (int j = 0; j < G.n; j++)
                        if (A[i][k] + A[k][j] < A[i][j]) {
                            A[i][j]    = A[i][k] + A[k][j];
                            path[i][j] = k;            // 记下中转点
                        }
        }
      ` },

    { t: 'warn', id: 'k-outermost', title: '$k$ 放在最外层，不是随便排的', c: String.raw`
      递推式要求"计算 $A^{(k)}$ 时，用到的 $A^{(k-1)}$ 必须已经==全部==算完"。
      把 $k$ 放在最外层，正好保证第 $k$ 轮开始时整张表都是 $A^{(k-1)}$。

      ==若把 $k$ 写到最内层==，就变成了"对每个 $(i,j)$ 单独枚举一次中转点"，
      只能考虑==一次中转==，得不到多次中转的最短路，==结果直接错==。

      （顺带一提：Floyd 用的是==原地更新==，即第 $k$ 轮里 $A[i][k]$ 和 $A[k][j]$
      可能已经被本轮改过。==这不影响正确性==，因为 $A[i][k]$ 经过 $v_k$ 中转不会更短。
      这是一个常被追问的细节。）
    ` },

    { t: 'example', id: 'ex-floyd',
      title: '★ Floyd 手算三轮',
      source: '经典大题',
      level: 3,
      problem: String.raw`
        有向网含三个顶点 $A,B,C$，弧为
        $A\!\to\! B(4)$、$A\!\to\! C(11)$、$B\!\to\! A(6)$、$B\!\to\! C(2)$、$C\!\to\! A(3)$。
        用 Floyd 算法求各顶点对之间的最短路径长度，写出每一轮的矩阵。
      `,
      idea: String.raw`
        每一轮==只需要看两条线==：第 $k$ 行和第 $k$ 列。
        因为 $A[i][k]+A[k][j]$ 里，$i=k$ 或 $j=k$ 时式子退化成"自己加 0"，不可能变小。

        所以手算时的机械做法是：
        ==把第 $k$ 行和第 $k$ 列圈起来，只更新剩下的那些格子==。
        三个顶点时每轮只有 $2\times 2=4$ 个格子要看，其中对角线又不用看，==实际只有 2 个==。
      `,
      solution: String.raw`
        **初始矩阵 $A^{(-1)}$**（$\infty$ 表示无弧）

        | | A | B | C |
        |---|---|---|---|
        | **A** | 0 | 4 | 11 |
        | **B** | 6 | 0 | 2 |
        | **C** | 3 | ∞ | 0 |

        **第 1 轮（$k=A$）**：只看不含 $A$ 的格子 $BC$、$CB$。

        - $A[B][C]=\min(2,\ A[B][A]+A[A][C]=6+11=17)=2$，不变；
        - $A[C][B]=\min(\infty,\ A[C][A]+A[A][B]=3+4=7)=\boxed{7}$ ==更新==。

        | $A^{(0)}$ | A | B | C |
        |---|---|---|---|
        | **A** | 0 | 4 | 11 |
        | **B** | 6 | 0 | 2 |
        | **C** | 3 | ==7== | 0 |

        **第 2 轮（$k=B$）**：看 $AC$、$CA$。

        - $A[A][C]=\min(11,\ 4+2=6)=\boxed{6}$ ==更新==；
        - $A[C][A]=\min(3,\ 7+6=13)=3$，不变。

        | $A^{(1)}$ | A | B | C |
        |---|---|---|---|
        | **A** | 0 | 4 | ==6== |
        | **B** | 6 | 0 | 2 |
        | **C** | 3 | 7 | 0 |

        **第 3 轮（$k=C$）**：看 $AB$、$BA$。

        - $A[A][B]=\min(4,\ 6+7=13)=4$，不变；
        - $A[B][A]=\min(6,\ 2+3=5)=\boxed{5}$ ==更新==。

        **最终 $A^{(2)}$**

        | | A | B | C |
        |---|---|---|---|
        | **A** | 0 | 4 | **6** |
        | **B** | **5** | 0 | 2 |
        | **C** | 3 | 7 | 0 |

        对应的路径：$A\to C$ 走 $A\to B\to C$；
        $B\to A$ 走 $B\to C\to A$；$C\to B$ 走 $C\to A\to B$。
      `,
      comment: String.raw`
        **注意第 3 轮的 $A[A][B]$**：此时 $A[A][C]$ 已经在本轮之前被更新成 $6$ 了，
        计算用的就是新值 $6+7=13$。==这就是"原地更新"，不影响正确性==。

        **自查方法**：
        1. ==主对角线必须始终是 0==；
        2. ==矩阵中的每个元素只会变小，不会变大==；
        3. 最终矩阵的每个非 $\infty$ 元素，都应能在图上找到对应路径。

        **常见错误**：漏了第 1 轮 $C\to B$ 那次更新（从 $\infty$ 变 $7$）。
        ==$\infty$ 参与比较时最容易被跳过，要特别留意含 $\infty$ 的格子==。
      `,
    },

    { t: 'key', id: 'floyd-notes', title: 'Floyd 的几个补充结论', c: String.raw`
      1. **时间 $O(n^3)$，空间 $O(n^2)$**；==与边数无关==，稀疏图也是 $O(n^3)$。
      2. ==Floyd 允许负权边==（因为它枚举中转点，不做"敲定"），
         但==不允许负权回路==（此时 $A[i][i]$ 会变成负数，可以据此**检测**负环）。
      3. **求全源最短路的另一种做法**：对每个顶点跑一次 Dijkstra，
         总时间同样是 $O(n^3)$。==两者复杂度相同，但 Floyd 代码短得多、且能处理负权==。
      4. Floyd ==同时适用于有向图和无向图==（无向图看作双向弧）。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '四、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **Dijkstra 松弛时忘了加 $\texttt{dist[u]}$** —— 写成比较边权就变成 Prim 了。
      2. **对已敲定的顶点继续松弛** —— 进入 $S$ 后 $\texttt{dist}$ 就冻结了。
      3. **认为 Dijkstra 能处理负权** —— ==不能==，反例见上文。
      4. **认为"有负权就一定无解"** —— ==只有负权**回路**才无解==，
         单纯的负权边 Floyd 能算。
      5. **Floyd 把 $k$ 写在内层循环** —— 只能考虑一次中转，结果错。
      6. **Floyd 忘了初始化对角线为 0** —— $A[i][i]$ 必须是 0 而不是 $\infty$。
      7. **用 BFS 求带权最短路** —— ==只在边权全相等时成立==。
      8. **把最小生成树上的路径当作最短路径** —— [两者毫无关系](#/ds/graph/mst?at=pitfall-list)。
      9. **$\infty$ 相加溢出** —— 代码里要先判 $A[i][k]$ 和 $A[k][j]$ 是否为 $\infty$，
         或者把 $\infty$ 取成 $\texttt{INT\_MAX}/2$ 这样的安全值。
      10. **Dijkstra 的复杂度答成 $O(e\log n)$** —— 那是堆优化版；
          408 的基础版是 ==$O(n^2)$==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '五、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      把三个算法排成一条线会更好记：

      ==BFS 是"每条边权都是 1 的 Dijkstra"==，
      ==Dijkstra 是"限制了枚举顺序的 Floyd"==（贪心地按距离顺序敲定，省掉了枚举中转点）。

      而它们的适用范围恰好按"限制越强、速度越快"排列：
      $O(n+e)\to O(n^2)\to O(n^3)$，代价是==对图的假设越来越弱==。
    ` },

  ],
});
