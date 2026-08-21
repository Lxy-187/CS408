/* ==========================================================================
   数据结构 / 6 图 / 最小生成树（Prim / Kruskal）
   ========================================================================== */

KM.page({
  path: 'ds/graph/mst',
  title: '最小生成树',
  subtitle: 'Prim 长树、Kruskal 挑边 —— 两种贪心，同一条「割性质」',
  tags: ['高频', '必考', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'concept', c: '一、生成树与最小生成树' },

    { t: 'key', id: 'def', title: '定义与三个必记结论', c: String.raw`
      **生成树**：连通图的一个==极小连通子图==，包含全部 $n$ 个顶点、恰好 $n-1$ 条边，
      且==不含回路==。

      **最小生成树（MST）**：带权连通无向图的所有生成树中，==边权之和最小==的那一棵。

      三个结论：

      1. ==MST 不唯一，但最小权值之和唯一==
         （所以问"最小代价是多少"答案唯一，问"树长什么样"可能有多种）；
      2. ==若图中各边权互不相同，则 MST 唯一==；
      3. MST 的边数恒为 $n-1$。==若 $e<n-1$ 则图不连通，MST 不存在==。

      **一个爱考的辨析**：MST 只对==无向图==定义。
      有向图的对应问题叫"最小树形图"，==不在 408 范围内==。
    ` },

    { t: 'key', id: 'cut-property', title: '★ 割性质：两个算法共同的正确性来源', c: String.raw`
      把顶点集任意划分成两个非空集合 $S$ 与 $V-S$（这叫一个**割**），
      则==横跨这个割的所有边中，权值最小的那条一定属于某棵 MST==。

      （若有多条并列最小，则==至少有一条==属于某棵 MST。）

      **Prim 的用法**：令 $S$ = 已经长出来的那部分树，
      每次挑==横跨 $S$ 与 $V-S$ 的最小边==，把它拉进来。

      **Kruskal 的用法**：从小到大考察每条边，
      若这条边的两端不连通，那么==必存在一个割把它俩分开、且它是这个割上的最小边==，
      所以可以放心加入。

      ==理解了割性质，两个算法就是同一件事的两种记账方式==，
      也解释了"为什么贪心在这里不会出错"。
    ` },

    { t: 'diagram', id: 'sample-net', title: '本节的样例网',
      note: '6 个顶点、9 条边，各边权互不相同（所以 MST 唯一）',
      caption: String.raw`各边权互不相同，所以这张图的 MST ==唯一==，
      Prim 和 Kruskal 会给出==完全相同==的边集（虽然选边的顺序不同）。
      总权值 $1+2+3+4+5=15$。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 278" role="img" aria-label="六顶点九条边的带权无向图及其最小生成树">
  <path class="ar plain em" d="M190,53 H290"/>
  <path class="ar plain" d="M290,53 L340,140"/>
  <path class="ar plain" d="M340,140 L290,227"/>
  <path class="ar plain" d="M290,227 H190"/>
  <path class="ar plain" d="M190,227 L140,140"/>
  <path class="ar plain" d="M140,140 L190,53"/>
  <path class="ar plain" d="M140,140 H340"/>
  <path class="ar plain" d="M190,53 L340,140"/>
  <path class="ar plain" d="M290,53 L190,227"/>
  <g class="n p"><rect x="172" y="35" width="36" height="36" rx="18"/><text class="bt sm" x="190" y="53" text-anchor="middle" dominant-baseline="central">A</text></g>
  <g class="n k"><rect x="272" y="35" width="36" height="36" rx="18"/><text class="bt sm" x="290" y="53" text-anchor="middle" dominant-baseline="central">B</text></g>
  <g class="n k"><rect x="322" y="122" width="36" height="36" rx="18"/><text class="bt sm" x="340" y="140" text-anchor="middle" dominant-baseline="central">C</text></g>
  <g class="n k"><rect x="272" y="209" width="36" height="36" rx="18"/><text class="bt sm" x="290" y="227" text-anchor="middle" dominant-baseline="central">D</text></g>
  <g class="n k"><rect x="172" y="209" width="36" height="36" rx="18"/><text class="bt sm" x="190" y="227" text-anchor="middle" dominant-baseline="central">E</text></g>
  <g class="n k"><rect x="122" y="122" width="36" height="36" rx="18"/><text class="bt sm" x="140" y="140" text-anchor="middle" dominant-baseline="central">F</text></g>
  <text class="lb" x="240" y="30" text-anchor="middle">6</text>
  <text class="lb em" x="330" y="88">5</text>
  <text class="lb" x="330" y="196">7</text>
  <text class="lb em" x="240" y="252" text-anchor="middle">2</text>
  <text class="lb" x="142" y="196">8</text>
  <text class="lb em" x="142" y="88">1</text>
  <text class="lb em" x="196" y="132">4</text>
  <text class="lb" x="264" y="104">9</text>
  <text class="lb em" x="258" y="170">3</text>
  <text class="cap" x="120" y="20">样例网 G（琥珀色标签 = MST 用到的边）</text>
  <g class="n g"><rect x="400" y="34" width="286" height="132" rx="7"/>
    <text class="bt sm" x="543" y="56" text-anchor="middle" dominant-baseline="central">最小生成树的 5 条边</text>
    <text class="bs" x="543" y="80" text-anchor="middle" dominant-baseline="central">F–A (1)　　D–E (2)　　B–E (3)</text>
    <text class="bs" x="543" y="102" text-anchor="middle" dominant-baseline="central">F–C (4)　　B–C (5)</text>
    <text class="bs" x="543" y="132" text-anchor="middle" dominant-baseline="central">总权值 = 1 + 2 + 3 + 4 + 5 = 15</text>
    <text class="bs" x="543" y="152" text-anchor="middle" dominant-baseline="central">边数 = n − 1 = 5 ✓</text></g>
  <text class="cap" x="400" y="196">未入选：A–B(6)、C–D(7)、E–F(8)、A–C(9)</text>
  <text class="cap" x="400" y="220">注意 A–B(6) 虽然不算大，但加进去会成环</text>
  <text class="cap" x="400" y="244">而 B–C(5) 虽然更大却是必需的桥梁</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'prim', c: '二、Prim 算法：从一个点开始"长"' },

    { t: 'key', id: 'prim-idea', title: '思想：维护一棵树，每次吸收最近的一个点', c: String.raw`
      从任意一个顶点出发，令 $S=\{v_0\}$。重复 $n-1$ 次：

      ==在所有"一端在 $S$ 内、另一端在 $S$ 外"的边中，挑权值最小的那条==，
      把它和它的外端点一起加入 $S$。

      **实现的关键是两个辅助数组**：

      - $\texttt{lowcost[v]}$：$v$ 到 $S$ 的==最短一条边的权值==（$v\in S$ 时置 0 或 $\infty$）；
      - $\texttt{closest[v]}$：这条最短边在 $S$ 里的那个端点（用来输出 MST 的边）。

      每加入一个新顶点 $u$，就==用 $u$ 的邻边去更新所有 $\texttt{lowcost}$==：
      $\texttt{lowcost[v] = min(lowcost[v], w(u,v))}$。
    ` },

    { t: 'code', id: 'prim-code', title: 'Prim（邻接矩阵版）', lang: 'c',
      note: '两层循环，复杂度 O(n²)',
      c: String.raw`
        void Prim(MGraph G, int v0) {
            int lowcost[MAXV], closest[MAXV];
            bool inS[MAXV] = {false};

            for (int i = 0; i < G.n; i++) {           // 初始化：都以 v0 为参照
                lowcost[i] = G.edges[v0][i];
                closest[i] = v0;
            }
            inS[v0] = true;

            for (int k = 1; k < G.n; k++) {           // 还要加入 n-1 个点
                int min = INF, u = -1;
                for (int j = 0; j < G.n; j++)         // ① 找最近的外部点
                    if (!inS[j] && lowcost[j] < min) { min = lowcost[j]; u = j; }

                printf("(%d,%d) w=%d\n", closest[u], u, lowcost[u]);
                inS[u] = true;

                for (int j = 0; j < G.n; j++)         // ② 用 u 更新 lowcost
                    if (!inS[j] && G.edges[u][j] < lowcost[j]) {
                        lowcost[j] = G.edges[u][j];
                        closest[j] = u;
                    }
            }
        }
      ` },

    { t: 'key', id: 'prim-complexity', title: 'Prim 的复杂度与适用场合', c: String.raw`
      外层循环 $n-1$ 次，内层两个 $O(n)$ 的扫描，故

      $$T_{\text{Prim}}=O(n^2)$$

      ==这个复杂度与边数 $e$ 无关==，所以 **Prim 适合稠密图**（$e$ 接近 $n^2$）。

      **优化**：用小顶堆维护 $\texttt{lowcost}$ 可以降到 $O(e\log n)$，
      ==但 408 只要求掌握 $O(n^2)$ 的版本==，答题写 $O(n^2)$ 即可。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'kruskal', c: '三、Kruskal 算法：从最短的边开始"挑"' },

    { t: 'steps', id: 'kruskal-steps', title: 'Kruskal 的三步', items: [
      { title: '把所有边按权值从小到大排序', c: String.raw`这一步是复杂度的大头，$O(e\log e)$。` },
      { title: '依次考察每条边', c: String.raw`若这条边的两个端点==当前不连通==，就把它加入生成树；
        否则==丢弃==（加了会成环）。` },
      { title: '加满 $n-1$ 条边就停', c: String.raw`若考察完所有边还不足 $n-1$ 条，说明==原图不连通==，MST 不存在。` },
    ] },

    { t: 'key', id: 'kruskal-uf', title: '判环靠[并查集](#/ds/tree/union-find?at=use-cases)', c: String.raw`
      "两端点是否连通"如果每次都去做一遍 DFS，代价是 $O(n+e)$，总复杂度就崩了。
      标准做法是用**并查集**：

      - $\mathrm{Find}(u)=\mathrm{Find}(v)$ $\iff$ ==加入 $(u,v)$ 会成环==，跳过；
      - 否则加入这条边，并 $\mathrm{Union}$ 两个集合。

      带路径压缩和按大小合并后，每次判断==近似 $O(1)$==，于是

      $$T_{\text{Kruskal}}=O(e\log e)$$

      ==瓶颈是排序，不是判环==。因为只与 $e$ 有关，**Kruskal 适合稀疏图**。
    ` },

    { t: 'code', id: 'kruskal-code', title: 'Kruskal 主循环', lang: 'c',
      note: 'Find / Union 见并查集那一页',
      c: String.raw`
        typedef struct { int u, v, w; } Edge;

        void Kruskal(Edge E[], int e, int n) {
            sort(E, e);                              // 按 w 升序
            int S[MAXV];
            Initial(S);                              // 并查集：每点自成一集
            int count = 0;
            for (int i = 0; i < e && count < n - 1; i++) {
                int r1 = Find(S, E[i].u);
                int r2 = Find(S, E[i].v);
                if (r1 != r2) {                      // 不成环 → 选它
                    printf("(%d,%d) w=%d\n", E[i].u, E[i].v, E[i].w);
                    Union(S, r1, r2);
                    count++;
                }
            }
            if (count < n - 1) printf("图不连通，无最小生成树\n");
        }
      ` },

    { t: 'compare', id: 'prim-vs-kruskal', title: 'Prim 与 Kruskal 对照',
      cols: ['', 'Prim', 'Kruskal'],
      rows: [
        ['贪心对象', '**顶点**（每轮吸收一个点）', '**边**（每轮考察一条边）'],
        ['中间状态', '==始终是一棵树==', '==是一个森林==，最后才连成树'],
        ['时间复杂度', '$O(n^2)$', '$O(e\\log e)$'],
        ['与什么有关', '只与 $n$ 有关', '只与 $e$ 有关'],
        ['适合', '==稠密图==', '==稀疏图=='],
        ['常配的存储', '邻接矩阵', '边集数组 + 并查集'],
        ['如何判环', '不需要（外点必不成环）', '==并查集=='],
        ['图不连通时', '只能得到一个连通分量的生成树', '得到==最小生成森林=='],
      ] },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '四、例题' },

    { t: 'example', id: 'ex-both',
      title: '★ 同一张图，两种算法各走一遍',
      source: '经典大题',
      level: 3,
      problem: String.raw`
        对[上面的样例网](#/ds/graph/mst?at=sample-net)
        （边：$FA{=}1,\ DE{=}2,\ BE{=}3,\ FC{=}4,\ BC{=}5,\ AB{=}6,\ CD{=}7,\ EF{=}8,\ AC{=}9$）：

        (1) 用 Prim 算法从 $A$ 出发，写出每一步选中的边；
        (2) 用 Kruskal 算法，写出每一步的取舍；
        (3) 两者结果是否相同？为什么？
      `,
      idea: String.raw`
        **Prim 用"表格法"最不容易乱**：画一张 $\texttt{lowcost}$ 表，
        每加入一个顶点就改一行，==被加入的列打叉表示已归属 $S$==。
        千万别在图上凭眼睛挑，==顶点一多必错==。

        **Kruskal 用"排序 + 划掉"**：把 9 条边按权排成一行，
        从左往右扫，==成环的划掉==。判环时只要在草稿上维护几个"集合"。

        (3) 这一问在考==边权互不相同 $\Rightarrow$ MST 唯一==这条结论。
      `,
      solution: String.raw`
        **(1) Prim（起点 $A$）**

        | 轮 | $S$ | 候选边（横跨割的边） | 选中 |
        |---|---|---|---|
        | 1 | $\{A\}$ | $AB{=}6,\ AF{=}1,\ AC{=}9$ | ==$FA=1$== |
        | 2 | $\{A,F\}$ | $AB{=}6,\ AC{=}9,\ FC{=}4,\ FE{=}8$ | ==$FC=4$== |
        | 3 | $\{A,F,C\}$ | $AB{=}6,\ FE{=}8,\ CB{=}5,\ CD{=}7$ | ==$CB=5$== |
        | 4 | $\{A,F,C,B\}$ | $FE{=}8,\ CD{=}7,\ BE{=}3$ | ==$BE=3$== |
        | 5 | $\{A,F,C,B,E\}$ | $CD{=}7,\ DE{=}2$ | ==$DE=2$== |

        选边顺序：$FA(1),\ FC(4),\ CB(5),\ BE(3),\ DE(2)$，总权 $15$。

        **(2) Kruskal**

        | 序 | 边 | 权 | 两端是否已连通 | 动作 | 当前连通分量 |
        |---|---|---|---|---|---|
        | 1 | $FA$ | 1 | 否 | ==选== | $\{A,F\}$ |
        | 2 | $DE$ | 2 | 否 | ==选== | $\{A,F\},\{D,E\}$ |
        | 3 | $BE$ | 3 | 否 | ==选== | $\{A,F\},\{B,D,E\}$ |
        | 4 | $FC$ | 4 | 否 | ==选== | $\{A,C,F\},\{B,D,E\}$ |
        | 5 | $BC$ | 5 | 否 | ==选== | 全连通，已 5 条边，**结束** |

        选边顺序：$FA(1),\ DE(2),\ BE(3),\ FC(4),\ BC(5)$，总权 $15$。

        **(3)** ==结果完全相同==。因为本图各边权互不相同，MST 唯一，
        任何正确算法都必然给出同一棵树。==只是"选边的先后顺序"不同==：
        Prim 一直保持连通（$1,4,5,3,2$），Kruskal 严格按权递增（$1,2,3,4,5$）。
      `,
      comment: String.raw`
        **从这道题能看清两者的性格**：

        - Prim 第 3 轮选了 $CB=5$，而此时图里还有更小的 $BE=3$、$DE=2$ 没选 ——
          ==因为它们不横跨当前的割==，Prim 够不着；
        - Kruskal 第 2 步就选了 $DE=2$，此时树还是散的两块 ——
          ==Kruskal 允许中间状态是森林==。

        **最常见的两个错**：
        1. ==Prim 每轮只看"新加入那个点"的邻边==。
           必须看==整个 $S$ 到外部==的所有边（这正是 $\texttt{lowcost}$ 数组的作用）。
        2. ==Kruskal 看到成环的边就以为算法结束==。
           成环只是==跳过这一条==，继续看下一条。
      `,
    },

    { t: 'example', id: 'ex-unique',
      title: 'MST 的唯一性与几个判断',
      source: '选择/判断',
      level: 3,
      problem: String.raw`
        判断下列说法是否正确并说明理由：

        (1) 最小生成树是唯一的；
        (2) 图中权值最小的边一定在某棵最小生成树中；
        (3) 图中权值最大的边一定不在最小生成树中；
        (4) 若图中所有边权都不同，则最小生成树唯一；
        (5) 用 Prim 从不同顶点出发，得到的最小生成树可能不同。
      `,
      idea: String.raw`
        这类题的通用武器是==割性质==和==构造反例==。
        凡是说"一定不在"的，先想想==桥==（割边）：桥无论多重都必须在。
      `,
      solution: String.raw`
        **(1) 错。** 权值之和唯一，但树不唯一。
        反例：一个三角形，三边权都为 $1$，任选两条边都是 MST。

        **(2) 对。** 由割性质：取包含该边一个端点的割，
        这条边是这个割上的最小边（因为它是全图最小），故==必属于某棵 MST==。
        注意措辞是"某棵"——若有并列最小的多条边，不能说"每一条都在同一棵里"。

        **(3) 错。** 反例：一条**桥**（割边），删掉它图就断了，
        无论它多重==都必须入选==。
        例如路径图 $A\overset{1}{-}B\overset{100}{-}C$，$BC=100$ 是最大边，但 MST 必含它。

        **(4) 对。** 这是标准结论。
        直观理由：算法每一步的"最小边"都==没有并列==，因此选择是被唯一确定的。

        **(5) 错。** MST 只由图本身决定，==与起点无关==。
        若 MST 唯一，从任何点出发都得到同一棵；
        若 MST 不唯一（有等权边），不同起点==可能==给出不同的那几棵之一，
        但这是"MST 本来就不唯一"造成的，不是起点造成的。
      `,
      comment: String.raw`
        **(3) 是最容易答错的一问**。
        很多人凭"贪心当然不要最贵的"直觉就选了"对"。
        ==只要记住"桥必须入选"这个反例，这类题就全都稳了==。

        **(5) 的措辞要小心**：题目问"可能不同"。
        严格来说，当 MST 不唯一时，不同起点确实可能给出不同的树 ——
        所以更精确的说法是=="起点不影响最小权值和，也不改变 MST 的集合"==。
        考试遇到这种模糊表述，==按"最小代价与起点无关"作答并写明理由==最稳妥。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **说 MST 唯一** —— ==权值和唯一，树不一定唯一==；边权互不相同时才唯一。
      2. **Prim 每轮只看新点的邻边** —— 要看==整个 $S$ 到外部==的所有边。
      3. **Kruskal 遇到成环就停止** —— ==跳过这条，继续==。
      4. **认为最大边一定不在 MST 中** —— ==桥必须在==。
      5. **Prim 的复杂度写成 $O(e\log e)$** —— 基础版是 ==$O(n^2)$==。
      6. **Kruskal 忘了判"图是否连通"** —— 选不满 $n-1$ 条边时要报告无解。
      7. **把 MST 用到有向图上** —— ==MST 只对无向图定义==。
      8. **认为 MST 上两点间的路径就是最短路径** —— ==完全错误==，
         MST 优化的是"总权值"，不是"点对间距离"。这两件事没有蕴含关系。
      9. **Prim 起点选错会得到不同答案** —— ==最小代价与起点无关==。
      10. **边数 $e<n-1$ 时还硬算** —— 此时图必不连通，MST 不存在。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      一个把两个算法统一起来的说法：==它们都在反复回答同一个问题
      —— "现在这个割上，最便宜的边是哪条"==。
      区别只是"割"怎么定：Prim 的割固定为"已建成的树 vs 其余"，
      Kruskal 的割是"这条边两端所在的连通块 vs 其余"。

      按这个理解，=="Prim 适合稠密、Kruskal 适合稀疏"也就顺理成章==：
      前者每轮扫顶点，后者每轮扫边。
    ` },

  ],
});
