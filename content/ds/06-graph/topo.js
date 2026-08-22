/* ==========================================================================
   数据结构 / 6 图 / 拓扑排序与关键路径
   ========================================================================== */

KM.page({
  path: 'ds/graph/topo',
  title: '拓扑排序与关键路径',
  subtitle: 'AOV 网排先后，AOE 网算工期 —— 两张表填对，这一节就没有别的了',
  tags: ['高频', '必考', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'aov', c: '一、AOV 网与拓扑排序' },

    { t: 'key', id: 'aov-def', title: 'AOV 网：顶点表示活动', c: String.raw`
      **AOV 网**（Activity On Vertex）：用==顶点表示活动==、==有向边表示先后关系==的有向图。
      $\langle u,v\rangle$ 表示"活动 $u$ 必须在活动 $v$ 之前完成"。

      ==AOV 网中不允许出现回路==：有环就意味着"甲要等乙、乙又要等甲"，逻辑上不可能完成。
      所以 AOV 网必须是 **DAG（有向无环图）**。

      **拓扑序列**：把所有顶点排成一个线性序列，使得==对图中任意一条弧 $\langle u,v\rangle$，
      $u$ 都排在 $v$ 前面==。这个序列==就叫这张图的一个拓扑序列==。

      **两个关键结论**：

      1. ==有向图存在拓扑序列 $\iff$ 该图无环==
         —— 所以拓扑排序也是**判断有向图是否有环**的标准手段；
      2. ==拓扑序列一般不唯一==。
         只有当排序过程中==每一步入度为 0 的顶点都恰好只有一个==时才唯一
         （等价于：图中存在一条经过所有顶点的有向路径，即**哈密顿路径**）。
    ` },

    { t: 'steps', id: 'kahn-steps', title: '拓扑排序（入度为 0 法）', items: [
      { title: '统计所有顶点的入度', c: String.raw`把入度为 $0$ 的顶点==全部压入栈或队列==。` },
      { title: '取出一个入度为 0 的顶点并输出', c: String.raw`用栈还是队列==不影响正确性，只影响得到哪一个拓扑序列==。` },
      { title: '删掉它的所有出边', c: String.raw`即==把它每个后继的入度减 1==；某个后继的入度减到 $0$ 就入栈。` },
      { title: '重复直到栈空', c: String.raw`==若输出的顶点数 $<n$，说明图中有环==，拓扑排序失败。
        这是判环的判据。` },
    ] },

    { t: 'code', id: 'topo-code', title: '拓扑排序', lang: 'c',
      note: '邻接表存储，时间 O(n+e)',
      c: String.raw`
        bool TopologicalSort(Graph G) {
            InitStack(S);
            int indegree[MAXV] = {0};
            for (int i = 0; i < G.vexnum; i++)          // 统计入度
                for (ArcNode *p = G.vertices[i].first; p; p = p->next)
                    indegree[p->adjvex]++;

            for (int i = 0; i < G.vexnum; i++)
                if (indegree[i] == 0) Push(S, i);

            int count = 0;
            while (!IsEmpty(S)) {
                int v;  Pop(S, v);
                print[count++] = v;                     // 输出
                for (ArcNode *p = G.vertices[v].first; p; p = p->next)
                    if (--indegree[p->adjvex] == 0)     // 入度减到 0 就入栈
                        Push(S, p->adjvex);
            }
            return count == G.vexnum;                   // false 说明有环
        }
      ` },

    { t: 'key', id: 'complexity-topo', title: '复杂度与另外两种做法', c: String.raw`
      **复杂度**：邻接表 ==$O(n+e)$==（每个顶点入栈出栈一次、每条边被删一次）；
      邻接矩阵 $O(n^2)$。

      **做法二：DFS 求逆后序**（[对照二叉树的后序遍历](#/ds/tree/traversal?at=three-recursive)）

      对图做 DFS，==在某顶点"退栈"（其所有后继都处理完）时把它记下来==，
      最后==把记录的序列逆置==，就是一个拓扑序列。

      直观理由：一个顶点只有在它的所有后继都完成之后才退栈，
      所以==退栈越晚的顶点越靠前==。若 DFS 过程中遇到==指向"正在栈中"的顶点的边（后向边）==，
      说明有环。

      **做法三：逆拓扑排序**
      —— 每次取==出度为 0== 的顶点输出。得到的序列满足"任意弧 $\langle u,v\rangle$ 中 $v$ 在 $u$ 前"。
      ==等价于：把所有边反向后做一次普通拓扑排序==。
    ` },

    { t: 'example', id: 'ex-topo',
      title: '拓扑序列与它的不唯一性',
      source: '选择/填空',
      level: 2,
      problem: String.raw`
        有向图的弧为：
        $V_1\!\to\! V_2$、$V_1\!\to\! V_3$、$V_2\!\to\! V_4$、$V_2\!\to\! V_5$、
        $V_3\!\to\! V_4$、$V_3\!\to\! V_6$、$V_4\!\to\! V_6$、$V_5\!\to\! V_6$。

        (1) 写出各顶点的入度；
        (2) 给出两个不同的拓扑序列；
        (3) 该图共有多少个不同的拓扑序列？
      `,
      idea: String.raw`
        (1) ==入度就是"箭头指进来的条数"==，逐条弧数一遍，别漏。

        (2) 每一步==把当前入度为 0 的顶点列出来==，任选一个即可；
        选择的自由度就是不唯一的来源。

        (3) 数方案数时==按"每一步有几种选择"相乘==会算重（后面的选择依赖前面的），
        更稳的做法是==按第一个分叉点分类枚举==。
      `,
      solution: String.raw`
        **(1) 入度**

        | 顶点 | $V_1$ | $V_2$ | $V_3$ | $V_4$ | $V_5$ | $V_6$ |
        |---|---|---|---|---|---|---|
        | 入度 | **0** | 1 | 1 | 2 | 1 | 3 |

        **(2)** 只有 $V_1$ 入度为 0，必须先输出。删去 $V_1$ 后 $V_2,V_3$ 入度都变 0：

        - 序列甲：$V_1,\ V_2,\ V_3,\ V_4,\ V_5,\ V_6$
        - 序列乙：$V_1,\ V_3,\ V_2,\ V_5,\ V_4,\ V_6$

        **(3)** $V_1$ 必首、$V_6$ 必末。中间要排 $V_2,V_3,V_4,V_5$，约束是
        $V_2\prec V_4$、$V_2\prec V_5$、$V_3\prec V_4$。

        枚举 $V_4$ 的位置（它必须排在 $V_2$ 和 $V_3$ 之后）：

        - $V_4$ 排在中间四个的第 3 位：前两位是 $\{V_2,V_3\}$ 的排列（2 种），
          第 4 位是 $V_5$ → **2 种**；
        - $V_4$ 排在第 4 位：前三位是 $V_2,V_3,V_5$ 的排列且要求 $V_2\prec V_5$
          → $3!/2=3$ 种 → **3 种**。

        合计 $\boxed{5}$ 个不同的拓扑序列。
      `,
      comment: String.raw`
        **(3) 这类"数拓扑序列个数"的题**，==别去背公式==，
        找出"哪个顶点最受约束"然后按它的位置分类，几乎总是最快的。

        **一个常考的反向问法**："若某有向图的拓扑序列唯一，能说明什么？"
        答：==说明图中存在一条经过全部顶点的有向路径==
        （每一步入度为 0 的顶点都唯一，相当于顶点被串成一条链）。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'aoe', c: '二、AOE 网与关键路径' },

    { t: 'key', id: 'aoe-def', title: 'AOE 网：边表示活动，顶点表示事件', c: String.raw`
      **AOE 网**（Activity On Edge）：==有向边表示活动，边上的权值表示活动持续时间==；
      ==顶点表示"事件"==，即"它的所有入边活动都已完成、出边活动可以开始"这个瞬间。

      AOE 网必须是 DAG，且==只有一个入度为 0 的顶点（源点 / 开始事件）
      和一个出度为 0 的顶点（汇点 / 结束事件）==。

      **关键路径**：从源点到汇点==路径长度最长==的那条路径。
      **关键活动**：关键路径上的活动。

      **为什么最长的才是关键**：整个工程完成，必须等==所有==路径都走完，
      所以工期 $=$ ==最长路径的长度==。
      $$\boxed{\text{完成整个工程的最短时间}=\text{关键路径长度}}$$

      这句话看起来矛盾（最短 = 最长），但正是 AOE 的核心：
      ==并行的分支互相等待，木桶由最长那块板决定==。
    ` },

    { t: 'key', id: 'four-quantities', title: '★ 四个量：$ve,\\ vl,\\ e,\\ l$', c: String.raw`
      **对事件（顶点）**：

      | 记号 | 名称 | 递推方向 | 递推式 |
      |---|---|---|---|
      | $ve(k)$ | 事件 $k$ 的==最早==发生时间 | ==正向==（按拓扑序） | $ve(k)=\max\limits_{\langle j,k\rangle}\{ve(j)+w(j,k)\}$，$ve(\text{源})=0$ |
      | $vl(k)$ | 事件 $k$ 的==最迟==发生时间 | ==逆向==（按逆拓扑序） | $vl(k)=\min\limits_{\langle k,j\rangle}\{vl(j)-w(k,j)\}$，$vl(\text{汇})=ve(\text{汇})$ |

      **对活动（边 $a_i=\langle j,k\rangle$）**：

      | 记号 | 含义 | 公式 |
      |---|---|---|
      | $e(i)$ | 活动 $i$ 的==最早开始==时间 | $e(i)=ve(j)$ ==（弧尾事件的最早）== |
      | $l(i)$ | 活动 $i$ 的==最迟开始==时间 | $l(i)=vl(k)-w(j,k)$ ==（弧头事件的最迟减去时长）== |
      | $d(i)$ | ==时间余量== | $d(i)=l(i)-e(i)$ |

      $$\boxed{d(i)=0\iff a_i\ \text{是关键活动}}$$

      **两个方向的记法（这是最容易记混的）**：
      ==$ve$ 取 $\max$（要等最慢的前驱），$vl$ 取 $\min$（不能拖累最紧的后继）==。
    ` },

    { t: 'diagram', id: 'aoe-sample', title: '样例 AOE 网与它的关键路径',
      note: '结点内是事件编号，下方是 ve / vl',
      caption: String.raw`==琥珀色顶点满足 $ve=vl$（关键事件），琥珀色的弧是关键活动==。
      关键路径 $V_1\to V_3\to V_4\to V_6$，长度 $2+4+2=8$，==恰好等于 $ve(V_6)$==。
      注意 $V_5$ 的 $ve=6$ 而 $vl=7$，==有 1 单位的余量==，所以它不在关键路径上。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 258" role="img" aria-label="六事件八活动的 AOE 网，标出关键路径">
  <path class="ar" d="M86,110 L182,72"/>
  <path class="ar em" d="M86,130 L182,170"/>
  <path class="ar" d="M212,76 L328,166"/>
  <path class="ar" d="M218,60 H322"/>
  <path class="ar em" d="M218,180 H322"/>
  <path class="ar" d="M216,172 L452,128"/>
  <path class="ar em" d="M356,172 L452,132"/>
  <path class="ar" d="M356,68 L452,108"/>
  <g class="n a"><rect x="50" y="102" width="36" height="36" rx="18"/><text class="bt sm" x="68" y="120" text-anchor="middle" dominant-baseline="central">V1</text></g>
  <g class="n k"><rect x="182" y="42" width="36" height="36" rx="18"/><text class="bt sm" x="200" y="60" text-anchor="middle" dominant-baseline="central">V2</text></g>
  <g class="n a"><rect x="182" y="162" width="36" height="36" rx="18"/><text class="bt sm" x="200" y="180" text-anchor="middle" dominant-baseline="central">V3</text></g>
  <g class="n a"><rect x="322" y="162" width="36" height="36" rx="18"/><text class="bt sm" x="340" y="180" text-anchor="middle" dominant-baseline="central">V4</text></g>
  <g class="n k"><rect x="322" y="42" width="36" height="36" rx="18"/><text class="bt sm" x="340" y="60" text-anchor="middle" dominant-baseline="central">V5</text></g>
  <g class="n a"><rect x="452" y="102" width="36" height="36" rx="18"/><text class="bt sm" x="470" y="120" text-anchor="middle" dominant-baseline="central">V6</text></g>
  <text class="lb" x="68" y="152" text-anchor="middle">0 / 0</text>
  <text class="lb" x="200" y="30" text-anchor="middle">3 / 4</text>
  <text class="lb" x="200" y="212" text-anchor="middle">2 / 2</text>
  <text class="lb" x="340" y="212" text-anchor="middle">6 / 6</text>
  <text class="lb" x="340" y="30" text-anchor="middle">6 / 7</text>
  <text class="lb" x="470" y="152" text-anchor="middle">8 / 8</text>
  <text class="lb" x="126" y="80" text-anchor="middle">a1=3</text>
  <text class="lb em" x="120" y="158" text-anchor="middle">a2=2</text>
  <text class="lb" x="290" y="112" text-anchor="middle">a3=2</text>
  <text class="lb" x="270" y="50" text-anchor="middle">a4=3</text>
  <text class="lb em" x="270" y="198" text-anchor="middle">a5=4</text>
  <text class="lb" x="330" y="140" text-anchor="middle">a6=3</text>
  <text class="lb em" x="410" y="168" text-anchor="middle">a7=2</text>
  <text class="lb" x="410" y="76" text-anchor="middle">a8=1</text>
  <text class="cap" x="14" y="238">ve / vl 相等的事件 = 关键事件（琥珀）</text>
  <g class="n a"><rect x="516" y="42" width="172" height="70" rx="7"/>
    <text class="bt sm" x="602" y="62" text-anchor="middle" dominant-baseline="central">关键路径</text>
    <text class="bs" x="602" y="84" text-anchor="middle" dominant-baseline="central">V1 → V3 → V4 → V6</text>
    <text class="bs" x="602" y="102" text-anchor="middle" dominant-baseline="central">长度 2 + 4 + 2 = 8</text></g>
  <text class="cap" x="516" y="140">工期 = 8</text>
  <text class="cap" x="516" y="162">关键活动：a2、a5、a7</text>
  <text class="cap" x="516" y="184">其余活动都有正的时间余量</text>
</svg>
` },

    { t: 'method', id: 'four-steps', title: '手算关键路径的四步（顺序不能乱）', c: String.raw`
      1. **先做一次拓扑排序**，得到顶点的处理顺序；
      2. **正推 $ve$**：按拓扑序，$ve(\text{源})=0$，其余 ==取所有前驱的 $ve+w$ 的最大值==；
      3. **逆推 $vl$**：$vl(\text{汇})=ve(\text{汇})$，然后按==逆拓扑序==，
         ==取所有后继的 $vl-w$ 的最小值==；
      4. **逐条活动填表**：$e=ve(\text{弧尾})$，$l=vl(\text{弧头})-w$，$d=l-e$，
         ==$d=0$ 的就是关键活动==。

      **表格建议画成两张**：一张 $n$ 行（事件的 $ve,vl$），一张 $e$ 行（活动的 $e,l,d$）。
      ==混在一张表里几乎必错==。
    ` },

    { t: 'example', id: 'ex-critical',
      title: '★ 求关键路径（完整四步）',
      source: '经典大题',
      level: 4,
      problem: String.raw`
        AOE 网的活动如下（括号内为持续时间）：
        $a_1{=}\langle V_1,V_2\rangle(3)$、$a_2{=}\langle V_1,V_3\rangle(2)$、
        $a_3{=}\langle V_2,V_4\rangle(2)$、$a_4{=}\langle V_2,V_5\rangle(3)$、
        $a_5{=}\langle V_3,V_4\rangle(4)$、$a_6{=}\langle V_3,V_6\rangle(3)$、
        $a_7{=}\langle V_4,V_6\rangle(2)$、$a_8{=}\langle V_5,V_6\rangle(1)$。

        求：(1) 各事件的 $ve$、$vl$；(2) 各活动的 $e$、$l$、$d$；
        (3) 关键路径与工程总工期；(4) 若把 $a_5$ 的时间从 $4$ 缩短到 $1$，工期变成多少？
      `,
      idea: String.raw`
        ==第一步一定要先写出拓扑序列==（本题取 $V_1,V_2,V_3,V_4,V_5,V_6$），
        后面正推逆推都严格按这个顺序，==否则会用到还没算出来的值==。

        (4) 这一问考的是==关键路径会转移==：
        缩短关键活动确实能缩短工期，但==缩短到一定程度后，
        原来的非关键路径就变成新的关键路径了==，再缩也没用。
        所以必须==重算==，不能简单地"工期减 3"。
      `,
      solution: String.raw`
        **拓扑序列**：$V_1,V_2,V_3,V_4,V_5,V_6$

        **(1) 正推 $ve$**

        $$ve(V_1)=0,\quad ve(V_2)=0+3=3,\quad ve(V_3)=0+2=2$$
        $$ve(V_4)=\max\{ve(V_2)+2,\ ve(V_3)+4\}=\max\{5,\ 6\}=\boxed{6}$$
        $$ve(V_5)=ve(V_2)+3=6$$
        $$ve(V_6)=\max\{ve(V_3)+3,\ ve(V_4)+2,\ ve(V_5)+1\}=\max\{5,8,7\}=\boxed{8}$$

        **逆推 $vl$**（从 $vl(V_6)=ve(V_6)=8$ 开始，按逆拓扑序）

        $$vl(V_5)=8-1=7,\qquad vl(V_4)=8-2=6$$
        $$vl(V_3)=\min\{vl(V_4)-4,\ vl(V_6)-3\}=\min\{2,\ 5\}=\boxed{2}$$
        $$vl(V_2)=\min\{vl(V_4)-2,\ vl(V_5)-3\}=\min\{4,\ 4\}=4$$
        $$vl(V_1)=\min\{vl(V_2)-3,\ vl(V_3)-2\}=\min\{1,\ 0\}=\boxed{0}\ \checkmark$$

        | 事件 | $V_1$ | $V_2$ | $V_3$ | $V_4$ | $V_5$ | $V_6$ |
        |---|---|---|---|---|---|---|
        | $ve$ | 0 | 3 | **2** | **6** | 6 | **8** |
        | $vl$ | **0** | 4 | **2** | **6** | 7 | **8** |

        **(2) 活动表**

        | 活动 | 弧 | $w$ | $e=ve(\text{尾})$ | $l=vl(\text{头})-w$ | $d=l-e$ |
        |---|---|---|---|---|---|
        | $a_1$ | $V_1\!\to\! V_2$ | 3 | 0 | $4-3=1$ | 1 |
        | $a_2$ | $V_1\!\to\! V_3$ | 2 | 0 | $2-2=0$ | ==**0**== |
        | $a_3$ | $V_2\!\to\! V_4$ | 2 | 3 | $6-2=4$ | 1 |
        | $a_4$ | $V_2\!\to\! V_5$ | 3 | 3 | $7-3=4$ | 1 |
        | $a_5$ | $V_3\!\to\! V_4$ | 4 | 2 | $6-4=2$ | ==**0**== |
        | $a_6$ | $V_3\!\to\! V_6$ | 3 | 2 | $8-3=5$ | 3 |
        | $a_7$ | $V_4\!\to\! V_6$ | 2 | 6 | $8-2=6$ | ==**0**== |
        | $a_8$ | $V_5\!\to\! V_6$ | 1 | 6 | $8-1=7$ | 1 |

        **(3)** 关键活动 $a_2,a_5,a_7$，关键路径
        $$V_1\xrightarrow{2}V_3\xrightarrow{4}V_4\xrightarrow{2}V_6,\qquad \text{总工期}=8$$

        **(4)** 把 $a_5$ 改成 $1$，重算：

        $$ve(V_4)=\max\{3+2,\ 2+1\}=5,\qquad ve(V_6)=\max\{2+3,\ 5+2,\ 6+1\}=7$$

        新工期为 $\boxed{7}$，==只缩短了 1，而不是 3==。
        新的关键路径变成 $V_1\to V_2\to V_5\to V_6$（$3+3+1=7$）
        和 $V_1\to V_2\to V_4\to V_6$（$3+2+2=7$）==两条==。
      `,
      comment: String.raw`
        **(4) 是这一节最值得记住的结论**：

        ==缩短关键活动可以缩短工期，但只在"它仍然是关键活动"的范围内有效==。
        一旦缩到别的路径变成最长，工期就不再下降了。

        推论（常考判断题）：
        - "缩短任一关键活动一定能缩短工期" —— ==错==。
          若关键路径有多条，只缩短其中一条上的活动，工期不变
          （另一条关键路径仍然那么长）。
        - "延长任一关键活动一定会延长工期" —— ==对==。
        - "缩短所有关键活动一定能缩短工期" —— ==对==（在缩短量足够小时）。

        **验算 $ve/vl$ 的三个自查**：
        1. ==$vl(\text{源})$ 必须等于 $0$==，不为 0 就是算错了；
        2. ==$ve(k)\le vl(k)$ 恒成立==；
        3. 关键活动一定==首尾相接构成从源到汇的完整路径==，
           若你标出的关键活动接不成一条路，说明有一处算错了。
      `,
    },

    { t: 'example', id: 'ex-upper-tri-aoe',
      title: '★★ 从压缩存储的一维数组还原 AOE 网并求关键路径',
      source: '统考真题',
      level: 4,
      problem: String.raw`
        已知有 6 个顶点（顶点编号为 $0\sim 5$）的有向带权图 $G$，
        其邻接矩阵 $A$ 为**上三角矩阵**，==按行为主序（行优先）==保存在一维数组中：

        $$[\,4,\ 6,\ \infty,\ \infty,\ \infty,\ 5,\ \infty,\ \infty,\ \infty,\ 4,\ 3,\ \infty,\ \infty,\ 3,\ 3\,]$$

        要求：
        (1) 写出图 $G$ 的邻接矩阵 $A$；
        (2) 画出有向带权图 $G$；
        (3) 求图 $G$ 的关键路径，并计算该关键路径的长度。
      `,
      idea: String.raw`
        **这是一道"跨章缝合"题**：前半截考[特殊矩阵的压缩存储](#/ds/stack-queue/special-matrix?at=tri-rule)，
        后半截考关键路径。==两截都不难，难在别在第一步就把矩阵还原错==。

        还原的机械做法：==先数每一行有几个元素==。
        $6$ 阶严格上三角（不含对角线）按行优先存放时，
        第 $0$ 行有 $5$ 个、第 $1$ 行 $4$ 个、第 $2$ 行 $3$ 个、第 $3$ 行 $2$ 个、第 $4$ 行 $1$ 个，
        共 $5+4+3+2+1=15$ 个 —— ==正好和数组长度对上，说明分行分对了==。

        然后按 $5,4,3,2,1$ 把数组切成五段，逐段填进矩阵的对应行即可。

        (3) 走[标准四步](#/ds/graph/topo?at=four-steps)：拓扑序 → 正推 $ve$ → 逆推 $vl$ → 填活动表。
      `,
      solution: String.raw`
        **(1) 还原邻接矩阵**

        按 $5,4,3,2,1$ 切分数组：

        | 行 | 该行的元素（对应列） | 非 $\infty$ 的弧 |
        |---|---|---|
        | 0 | $4,\ 6,\ \infty,\ \infty,\ \infty$（列 $1\sim 5$） | $\langle 0,1\rangle=4$，$\langle 0,2\rangle=6$ |
        | 1 | $5,\ \infty,\ \infty,\ \infty$（列 $2\sim 5$） | $\langle 1,2\rangle=5$ |
        | 2 | $4,\ 3,\ \infty$（列 $3\sim 5$） | $\langle 2,3\rangle=4$，$\langle 2,4\rangle=3$ |
        | 3 | $\infty,\ 3$（列 $4,5$） | $\langle 3,5\rangle=3$ |
        | 4 | $3$（列 $5$） | $\langle 4,5\rangle=3$ |

        完整的 $6\times 6$ 邻接矩阵（对角线记 $0$，无弧记 $\infty$）：

        | | 0 | 1 | 2 | 3 | 4 | 5 |
        |---|---|---|---|---|---|---|
        | **0** | 0 | **4** | **6** | ∞ | ∞ | ∞ |
        | **1** | ∞ | 0 | **5** | ∞ | ∞ | ∞ |
        | **2** | ∞ | ∞ | 0 | **4** | **3** | ∞ |
        | **3** | ∞ | ∞ | ∞ | 0 | ∞ | **3** |
        | **4** | ∞ | ∞ | ∞ | ∞ | 0 | **3** |
        | **5** | ∞ | ∞ | ∞ | ∞ | ∞ | 0 |

        **(2)** 图 $G$ 共 $7$ 条弧，见[下方示意图](#/ds/graph/topo?at=upper-tri-graph)。
        ==它是一个有向无环图，且只有一个源点 $0$、一个汇点 $5$==，符合 AOE 网的要求。

        **(3) 求关键路径**

        拓扑序列：$0,\ 1,\ 2,\ 3,\ 4,\ 5$。

        **正推 $ve$**：
        $$ve(0)=0,\quad ve(1)=4,\quad ve(2)=\max\{0+6,\ 4+5\}=\boxed{9}$$
        $$ve(3)=9+4=13,\quad ve(4)=9+3=12,\quad ve(5)=\max\{13+3,\ 12+3\}=\boxed{16}$$

        **逆推 $vl$**（从 $vl(5)=ve(5)=16$ 开始）：
        $$vl(4)=16-3=13,\quad vl(3)=16-3=13$$
        $$vl(2)=\min\{vl(3)-4,\ vl(4)-3\}=\min\{9,\ 10\}=\boxed{9}$$
        $$vl(1)=vl(2)-5=4,\quad vl(0)=\min\{vl(1)-4,\ vl(2)-6\}=\min\{0,\ 3\}=\boxed{0}\ \checkmark$$

        | 顶点 | 0 | 1 | 2 | 3 | 4 | 5 |
        |---|---|---|---|---|---|---|
        | $ve$ | 0 | 4 | 9 | 13 | 12 | 16 |
        | $vl$ | 0 | 4 | 9 | 13 | **13** | 16 |

        **活动表**：

        | 活动 | $\langle 0,1\rangle$ | $\langle 0,2\rangle$ | $\langle 1,2\rangle$ | $\langle 2,3\rangle$ | $\langle 2,4\rangle$ | $\langle 3,5\rangle$ | $\langle 4,5\rangle$ |
        |---|---|---|---|---|---|---|---|
        | $e$ | 0 | 0 | 4 | 9 | 9 | 13 | 12 |
        | $l$ | 0 | 3 | 4 | 9 | 10 | 13 | 13 |
        | $d=l-e$ | **0** | 3 | **0** | **0** | 1 | **0** | 1 |

        关键活动为 $\langle 0,1\rangle,\ \langle 1,2\rangle,\ \langle 2,3\rangle,\ \langle 3,5\rangle$。

        $$\text{关键路径}:\ 0\to 1\to 2\to 3\to 5,\qquad
        \text{长度}=4+5+4+3=\boxed{16}$$
      `,
      comment: String.raw`
        **第 (1) 问的两个常见错法**：

        1. ==把对角线也算进去了==。题目说"上三角矩阵"，
           而这是一个有向无环图（没有自环），==对角线全是 0 / 不存==，
           所以每行的元素个数是 $5,4,3,2,1$ 而不是 $6,5,4,3,2$。
           ==数组长度 15 就是用来自检这一点的==：若按含对角线切分需要 21 个元素，对不上。
        2. ==按列优先切分==。题目明说"行为主序"。

        **想更快地定位某条弧**：$n$ 阶严格上三角按行优先存放时，
        $\langle i,j\rangle\ (i<j)$ 的数组下标为
        $$k=\frac{i(2n-i-1)}{2}+j-i-1$$
        代入 $n=6$、$\langle 3,5\rangle$：$k=\frac{3\times 8}{2}+5-3-1=12+1=13$ ✓
        （数组第 13 个元素正是 $3$。）
        ==公式不用背，按[数前面有多少个](#/ds/stack-queue/special-matrix?at=derive-any)现推即可。==

        **第 (3) 问的自检三件事**（[和前一题一样](#/ds/graph/topo?at=ex-critical)）：
        $vl(0)=0$ ✓；每个顶点 $ve\le vl$ ✓；
        ==四条关键活动首尾相接连成了从源点 0 到汇点 5 的完整路径== ✓
      `,
    },

    { t: 'diagram', id: 'upper-tri-graph', title: '由一维数组还原出来的 AOE 网',
      note: '琥珀色 = 关键路径上的弧',
      caption: String.raw`==只有一个入度为 0 的顶点（$0$）和一个出度为 0 的顶点（$5$）==，符合 AOE 网的定义。
      顶点 $4$ 的 $ve=12$ 而 $vl=13$，==有 1 个单位的机动时间==，因此不在关键路径上；
      $\langle 0,2\rangle$ 虽然是一条直达弧，但 $d=3$，==也是非关键活动==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 218" role="img" aria-label="六顶点 AOE 网，标出关键路径 0-1-2-3-5">
  <path class="ar em" d="M86,96 L184,68"/>
  <path class="ar" d="M88,110 H312"/>
  <path class="ar em" d="M216,74 L314,102"/>
  <path class="ar em" d="M346,102 L444,74"/>
  <path class="ar" d="M346,124 L444,156"/>
  <path class="ar em" d="M476,74 L574,102"/>
  <path class="ar" d="M476,156 L574,124"/>
  <g class="n a"><rect x="52" y="92" width="36" height="36" rx="18"/><text class="bt sm" x="70" y="110" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n a"><rect x="182" y="42" width="36" height="36" rx="18"/><text class="bt sm" x="200" y="60" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n a"><rect x="312" y="92" width="36" height="36" rx="18"/><text class="bt sm" x="330" y="110" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n a"><rect x="442" y="42" width="36" height="36" rx="18"/><text class="bt sm" x="460" y="60" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n k"><rect x="442" y="152" width="36" height="36" rx="18"/><text class="bt sm" x="460" y="170" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n a"><rect x="572" y="92" width="36" height="36" rx="18"/><text class="bt sm" x="590" y="110" text-anchor="middle" dominant-baseline="central">5</text></g>
  <text class="lb em" x="126" y="72">4</text>
  <text class="lb" x="250" y="126" text-anchor="middle">6</text>
  <text class="lb em" x="256" y="102">5</text>
  <text class="lb em" x="392" y="76" text-anchor="middle">4</text>
  <text class="lb" x="380" y="146">3</text>
  <text class="lb em" x="522" y="76" text-anchor="middle">3</text>
  <text class="lb" x="530" y="150">3</text>
  <text class="lb" x="70" y="146" text-anchor="middle">0/0</text>
  <text class="lb" x="200" y="32" text-anchor="middle">4/4</text>
  <text class="lb" x="330" y="146" text-anchor="middle">9/9</text>
  <text class="lb" x="460" y="32" text-anchor="middle">13/13</text>
  <text class="lb em" x="460" y="206" text-anchor="middle">12/13　有 1 的余量</text>
  <text class="lb" x="590" y="146" text-anchor="middle">16/16</text>
  <text class="cap" x="14" y="24">结点下方 / 上方为 ve / vl　　关键路径 0→1→2→3→5，长度 16</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '三、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **$ve$ 与 $vl$ 的 $\max/\min$ 记反** —— ==$ve$ 取 max，$vl$ 取 min==。
      2. **$e$ 和 $l$ 用错端点** —— ==$e(i)=ve(\text{弧尾})$，$l(i)=vl(\text{弧头})-w$==。
      3. **不先做拓扑排序就开始推** —— 会用到尚未确定的值。
      4. **认为关键路径唯一** —— ==可能有多条==，它们长度相同。
      5. **认为"缩短任一关键活动就能缩短工期"** —— 多条关键路径时不成立。
      6. **AOV 和 AOE 混淆** —— ==AOV 顶点是活动，AOE 边才是活动==；
         AOE 的顶点是"事件"，没有持续时间。
      7. **拓扑排序失败时不报告有环** —— 输出顶点数 $<n$ 就说明有环。
      8. **以为拓扑序列唯一** —— 一般不唯一；唯一 $\iff$ 存在哈密顿路径。
      9. **关键路径当成"最短路径"去求** —— ==关键路径是最长路径==。
      10. **AOE 网有多个源点或汇点还硬算** —— 标准 AOE 网==只有一个源、一个汇==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '四、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      $ve$ 和 $vl$ 的两个方向可以用一句大白话记住：

      - ==$ve$ 是"我最早什么时候能开工" —— 得等**最慢的那个**前驱，所以取 max==；
      - ==$vl$ 是"我最晚拖到什么时候还不误事" —— 得迁就**最急的那个**后继，所以取 min==。

      而 $d=l-e$ 就是"这件事可以摸鱼多久"，==摸鱼时间为 0 的就是关键活动==。
    ` },

  ],
});
