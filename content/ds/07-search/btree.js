/* ==========================================================================
   数据结构 / 7 查找 / B 树与 B+ 树
   ========================================================================== */

KM.page({
  path: 'ds/search/btree',
  title: 'B 树与 B+ 树',
  subtitle: '为磁盘而生的多路平衡树 —— 把树压矮，让每次 I/O 读回来的一整块都有用',
  tags: ['高频', '必考', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'why', c: '一、动机：树高就是 I/O 次数' },

    { t: 'key', id: 'motivation', title: '为什么二叉的不够用', c: String.raw`
      当数据量大到放不进内存、必须存在磁盘上时，
      ==查找的代价不再由"比较次数"决定，而是由"读了几个磁盘块"决定==。
      一次磁盘 I/O 比一次内存比较慢几个数量级。

      而每次 I/O ==读回来的是一整个磁盘块（几 KB）==，
      如果用 [AVL 树](#/ds/tree/bst?at=avl-def)，一个结点只有一个关键字，
      读回 4KB 却只用了十几个字节 —— ==带宽被彻底浪费==，而且树高 $\log_2 n$ 太大。

      **B 树的两个改造**：

      1. ==让一个结点装很多关键字==（正好装满一个磁盘块），把"分支数"从 2 提到 $m$；
      2. ==保证所有叶结点在同一层==，树严格平衡。

      结果：树高降到 ==$\log_m n$==。
      $m=100$ 时，$10^6$ 条记录的树高只有 $3$ —— ==三次 I/O 就能定位任意记录==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'def', c: '二、$m$ 阶 B 树的定义' },

    { t: 'key', id: 'btree-def', title: '五条定义（要能一条不落地默写）', c: String.raw`
      一棵 $m$ 阶 B 树或为空，或满足：

      1. 树中每个结点==至多有 $m$ 棵子树==（即至多 $m-1$ 个关键字）；
      2. 若根结点不是终端结点，则==至少有 2 棵子树==；
      3. 除根之外的所有非叶结点==至少有 $\lceil m/2\rceil$ 棵子树==
         （即至少 $\lceil m/2\rceil-1$ 个关键字）；
      4. 所有非叶结点的结构为
         $$(\,n,\ P_0,\ K_1,\ P_1,\ K_2,\ P_2,\ \dots,\ K_n,\ P_n\,)$$
         其中 $K_1<K_2<\dots<K_n$，子树 $P_{i-1}$ 中所有关键字 $<K_i<$ 子树 $P_i$ 中所有关键字，
         且 ==$\lceil m/2\rceil-1\le n\le m-1$==；
      5. ==所有叶结点都出现在同一层次上==，且不带信息
         （可以理解为查找失败时到达的==外部结点 / 方框==，实际并不存在）。

      **一句话总结**：
      ==B 树是"每个结点最多 $m$ 路、最少半满、且绝对平衡"的有序多路查找树==。
    ` },

    { t: 'diagram', id: 'node-layout', title: 'B 树结点的内部布局',
      note: '关键字与指针交替排列，n 个关键字对应 n+1 个指针',
      caption: String.raw`==关键字把"值域"切成 $n+1$ 个区间，每个区间对应一个子树指针==。
      这就是 "$n$ 个关键字 $\Rightarrow$ $n+1$ 棵子树" 的来源，
      也是 B 树与 [B+ 树](#/ds/search/btree?at=bplus-def)最本质的区别所在（B+ 树是 $n$ 棵）。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 150" role="img" aria-label="B 树结点的关键字与指针交替布局">
  <g class="n m"><rect x="40" y="30" width="46" height="40" rx="5"/><text class="bt xs" x="63" y="50" text-anchor="middle" dominant-baseline="central">n=3</text></g>
  <g class="n k"><rect x="90" y="30" width="34" height="40" rx="5"/><text class="bt xs" x="107" y="50" text-anchor="middle" dominant-baseline="central">P0</text></g>
  <g class="n a"><rect x="124" y="30" width="46" height="40" rx="5"/><text class="bt sm" x="147" y="50" text-anchor="middle" dominant-baseline="central">K1</text></g>
  <g class="n k"><rect x="170" y="30" width="34" height="40" rx="5"/><text class="bt xs" x="187" y="50" text-anchor="middle" dominant-baseline="central">P1</text></g>
  <g class="n a"><rect x="204" y="30" width="46" height="40" rx="5"/><text class="bt sm" x="227" y="50" text-anchor="middle" dominant-baseline="central">K2</text></g>
  <g class="n k"><rect x="250" y="30" width="34" height="40" rx="5"/><text class="bt xs" x="267" y="50" text-anchor="middle" dominant-baseline="central">P2</text></g>
  <g class="n a"><rect x="284" y="30" width="46" height="40" rx="5"/><text class="bt sm" x="307" y="50" text-anchor="middle" dominant-baseline="central">K3</text></g>
  <g class="n k"><rect x="330" y="30" width="34" height="40" rx="5"/><text class="bt xs" x="347" y="50" text-anchor="middle" dominant-baseline="central">P3</text></g>
  <text class="cap" x="107" y="90" text-anchor="middle">&lt; K1</text>
  <text class="cap" x="187" y="90" text-anchor="middle">K1~K2</text>
  <text class="cap" x="267" y="90" text-anchor="middle">K2~K3</text>
  <text class="cap" x="347" y="90" text-anchor="middle">&gt; K3</text>
  <text class="cap" x="40" y="122">琥珀 = 关键字（3 个）　　蓝 = 子树指针（4 个）</text>
  <g class="n g"><rect x="400" y="24" width="286" height="52" rx="7"/>
    <text class="bt sm" x="543" y="42" text-anchor="middle" dominant-baseline="central">关键字数 n 的取值范围</text>
    <text class="bs" x="543" y="64" text-anchor="middle" dominant-baseline="central">⌈m/2⌉ − 1 ≤ n ≤ m − 1　（根结点下限为 1）</text></g>
  <text class="cap" x="376" y="100">5 阶：每个非根结点 2~4 个关键字、3~5 棵子树</text>
  <text class="cap" x="376" y="124">3 阶（2-3 树）：1~2 个关键字、2~3 棵子树</text>
</svg>
` },

    { t: 'key', id: 'height', title: 'B 树的高度界（选择题常客）', c: String.raw`
      设 $m$ 阶 B 树含 $n$ 个关键字，高度 $h$ ==不计最后那层叶（失败）结点==，则

      $$\log_m(n+1)\ \le\ h\ \le\ \log_{\lceil m/2\rceil}\frac{n+1}{2}+1$$

      **左边（最小高度）**：每个结点都塞满 $m-1$ 个关键字，
      第 $i$ 层最多 $m^{i-1}$ 个结点，故 $n\le (m-1)(1+m+\dots+m^{h-1})=m^h-1$。

      **右边（最大高度）**：每个结点都只有下限个关键字。
      令 $k=\lceil m/2\rceil$，第 1 层 1 个结点、第 2 层 2 个、第 $i$ 层至少 $2k^{i-2}$ 个。
      第 $h+1$ 层（叶结点层）至少有 $2k^{h-1}$ 个，而叶结点数恒为 $n+1$，
      于是 $n+1\ge 2k^{h-1}$。

      ==第二条的推导用到了"叶结点数 = 关键字总数 + 1"==，这本身也是常考结论：
      $n$ 个关键字把值域切成 $n+1$ 个失败区间。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'insert', c: '三、插入：溢出就分裂' },

    { t: 'steps', id: 'insert-steps', title: 'B 树的插入', items: [
      { title: '先查找，定位到某个终端结点', c: String.raw`==新关键字永远插在最底层的终端结点上==，
        绝不会插在中间层（这一点和 [BST](#/ds/tree/bst?at=insert-leaf) 一样）。` },
      { title: '插入后若关键字数 ≤ $m-1$，结束', c: String.raw`没溢出就什么都不用做。` },
      { title: '若溢出（达到 $m$ 个），分裂', c: String.raw`把结点从==第 $\lceil m/2\rceil$ 个关键字==处砍开：
        - 左边 $\lceil m/2\rceil-1$ 个留在原结点；
        - ==中间那个关键字上升到父结点==；
        - 右边的另建一个新结点。` },
      { title: '父结点可能也溢出，继续向上分裂', c: String.raw`==若一直分裂到根，则根也分裂，
        新建一个只含一个关键字的根，树高 $+1$==。
        这是 B 树==唯一==会长高的方式 —— 所以它"从根部长高"，而不是从叶子长高。` },
    ] },

    { t: 'diagram', id: 'split-demo', title: '5 阶 B 树：插入 60 引发的分裂',
      note: '5 阶 ⇒ 每个结点最多 4 个关键字',
      caption: String.raw`分裂点取==第 $\lceil m/2\rceil=3$ 个关键字==（也就是 $50$），它上升成为新的根。
      ==分裂后左右两个结点各有 2 个关键字，恰好满足下限 $\lceil m/2\rceil-1=2$== ——
      这不是巧合，$m$ 阶 B 树的分裂规则就是按下限设计的。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 190" role="img" aria-label="五阶 B 树插入导致结点分裂的过程">
  <text class="cap" x="14" y="18">插入 60 之后（5 个关键字，溢出）</text>
  <g class="n k"><rect x="14" y="30" width="52" height="36" rx="5"/><text class="bt sm" x="40" y="48" text-anchor="middle" dominant-baseline="central">20</text></g>
  <g class="n k"><rect x="66" y="30" width="52" height="36" rx="5"/><text class="bt sm" x="92" y="48" text-anchor="middle" dominant-baseline="central">30</text></g>
  <g class="n r"><rect x="118" y="30" width="52" height="36" rx="5"/><text class="bt sm" x="144" y="48" text-anchor="middle" dominant-baseline="central">50</text></g>
  <g class="n k"><rect x="170" y="30" width="52" height="36" rx="5"/><text class="bt sm" x="196" y="48" text-anchor="middle" dominant-baseline="central">52</text></g>
  <g class="n k"><rect x="222" y="30" width="52" height="36" rx="5"/><text class="bt sm" x="248" y="48" text-anchor="middle" dominant-baseline="central">60</text></g>
  <text class="lb em" x="144" y="84" text-anchor="middle">第 ⌈5/2⌉ = 3 个关键字，上升</text>
  <path class="ar em" d="M300,48 H364"/>
  <text class="lb em" x="332" y="38" text-anchor="middle">分裂</text>
  <text class="cap" x="400" y="18">分裂后：树高 +1</text>
  <g class="n a"><rect x="520" y="26" width="52" height="36" rx="5"/><text class="bt sm" x="546" y="44" text-anchor="middle" dominant-baseline="central">50</text></g>
  <path class="ar plain" d="M534,62 L468,104"/>
  <path class="ar plain" d="M558,62 L622,104"/>
  <g class="n k"><rect x="416" y="104" width="52" height="36" rx="5"/><text class="bt sm" x="442" y="122" text-anchor="middle" dominant-baseline="central">20</text></g>
  <g class="n k"><rect x="468" y="104" width="52" height="36" rx="5"/><text class="bt sm" x="494" y="122" text-anchor="middle" dominant-baseline="central">30</text></g>
  <g class="n k"><rect x="596" y="104" width="52" height="36" rx="5"/><text class="bt sm" x="622" y="122" text-anchor="middle" dominant-baseline="central">52</text></g>
  <g class="n k"><rect x="648" y="104" width="52" height="36" rx="5"/><text class="bt sm" x="674" y="122" text-anchor="middle" dominant-baseline="central">60</text></g>
  <text class="cap" x="400" y="166">左右各 2 个关键字，都不小于下限 ⌈m/2⌉−1 = 2</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'delete', c: '四、删除：不够就借，借不到就合并' },

    { t: 'key', id: 'delete-cases', title: '四种情况，按顺序判断', c: String.raw`
      **第 0 步：如果被删关键字不在终端结点上**，
      ==先用它的直接前驱或直接后继顶替==（前驱 = 左子树中最右下结点的最后一个关键字），
      问题转化为"删除终端结点中的关键字"。==这一步和 [BST 的删除](#/ds/tree/bst?at=bst-delete)完全同理==。

      然后对终端结点分三种情况：

      | 情况 | 条件 | 做法 |
      |---|---|---|
      | **① 直接删** | 删后关键字数 $\ge \lceil m/2\rceil-1$ | 删掉就完事 |
      | **② 兄弟够借** | 相邻兄弟的关键字数 $>\lceil m/2\rceil-1$ | ==父子换位法== |
      | **③ 兄弟不够，合并** | 相邻兄弟也只有下限个 | ==本结点 + 父中的分隔关键字 + 兄弟== 合成一个 |

      **② 父子换位法的细节**（方向极易记反）：
      若向==右兄弟==借，则 ==右兄弟的最小关键字上移到父结点，
      父结点中原来的那个分隔关键字下移到本结点末尾==。
      向左兄弟借时完全镜像。

      口诀：==**借的不是兄弟的关键字，而是父亲的；兄弟去补父亲的缺**==。
      这样才能保持"父中的分隔值介于两个子结点之间"这一性质。

      **③ 合并的连锁反应**：合并会让==父结点少一个关键字==，
      父结点可能因此低于下限，需要==继续向上处理==；
      ==若一直传到根、根变空，则删掉根，树高 $-1$==。
    ` },

    { t: 'warn', id: 'delete-trap', title: '删除时最容易犯的三个错', c: String.raw`
      1. ==忘了"先转化成终端结点删除"==。直接从中间层挖掉一个关键字，
         会让该结点的关键字数和子树数对不上（$n$ 个关键字必须配 $n+1$ 棵子树）。
      2. ==借的时候直接把兄弟的关键字搬过来==。
         必须走父结点中转，否则有序性被破坏。
      3. ==合并时忘了把父结点的分隔关键字一起并进去==。
         合并的是==三部分==：左结点 + 父中的分隔关键字 + 右结点。
         漏掉中间那个，关键字就丢了。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'bplus', c: '五、B+ 树' },

    { t: 'key', id: 'bplus-def', title: '$m$ 阶 B+ 树的定义', c: String.raw`
      1. 每个分支结点最多 $m$ 棵子树；
      2. ==非叶根结点至少 2 棵子树，其他每个分支结点至少 $\lceil m/2\rceil$ 棵子树==；
      3. ==结点的子树个数与关键字个数**相等**==；
      4. ==所有叶结点包含**全部**关键字==及指向对应记录的指针，
         且叶结点==按关键字大小顺序链接成一个链表==；
      5. ==所有分支结点中只保存它各个子结点中关键字的**最大值**==（以及指针），
         ==不保存记录==，只起"索引"作用。

      **一句话**：==B+ 树把数据全部沉到叶子层，上面几层纯粹是索引；
      而且叶子被串成了一条有序链表==。

      **这就是数据库索引和[文件系统的索引结构](#/ds/search/btree?at=bplus-why)几乎都用 B+ 树的原因。**
    ` },

    { t: 'diagram', id: 'bplus-demo', title: 'B+ 树：数据全在叶子，叶子串成链',
      note: '分支结点里的值是"子树中的最大关键字"',
      caption: String.raw`==注意 $15$、$32$、$50$ 在分支结点和叶结点里各出现了一次== ——
      B+ 树允许关键字重复出现（分支层是索引副本），而 ==B 树中每个关键字只出现一次==。
      底部那条虚线链表让"查所有 $>20$ 的记录"这类==范围查询==变成一次定位 + 顺序扫描。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 196" role="img" aria-label="B+ 树的结构：分支结点为索引，叶结点存全部关键字并链成链表">
  <g class="n p"><rect x="278" y="20" width="52" height="34" rx="5"/><text class="bt sm" x="304" y="37" text-anchor="middle" dominant-baseline="central">32</text></g>
  <g class="n p"><rect x="330" y="20" width="52" height="34" rx="5"/><text class="bt sm" x="356" y="37" text-anchor="middle" dominant-baseline="central">50</text></g>
  <path class="ar plain" d="M296,54 L182,92"/>
  <path class="ar plain" d="M364,54 L480,92"/>
  <g class="n k"><rect x="130" y="92" width="52" height="34" rx="5"/><text class="bt sm" x="156" y="109" text-anchor="middle" dominant-baseline="central">15</text></g>
  <g class="n k"><rect x="182" y="92" width="52" height="34" rx="5"/><text class="bt sm" x="208" y="109" text-anchor="middle" dominant-baseline="central">32</text></g>
  <g class="n k"><rect x="454" y="92" width="52" height="34" rx="5"/><text class="bt sm" x="480" y="109" text-anchor="middle" dominant-baseline="central">42</text></g>
  <g class="n k"><rect x="506" y="92" width="52" height="34" rx="5"/><text class="bt sm" x="532" y="109" text-anchor="middle" dominant-baseline="central">50</text></g>
  <path class="ar plain" d="M146,126 L74,156"/>
  <path class="ar plain" d="M200,126 L228,156"/>
  <path class="ar plain" d="M468,126 L392,156"/>
  <path class="ar plain" d="M522,126 L562,156"/>
  <g class="n g"><rect x="26" y="156" width="46" height="32" rx="5"/><text class="bt xs" x="49" y="172" text-anchor="middle" dominant-baseline="central">9</text></g>
  <g class="n g"><rect x="72" y="156" width="46" height="32" rx="5"/><text class="bt xs" x="95" y="172" text-anchor="middle" dominant-baseline="central">15</text></g>
  <g class="n g"><rect x="182" y="156" width="46" height="32" rx="5"/><text class="bt xs" x="205" y="172" text-anchor="middle" dominant-baseline="central">20</text></g>
  <g class="n g"><rect x="228" y="156" width="46" height="32" rx="5"/><text class="bt xs" x="251" y="172" text-anchor="middle" dominant-baseline="central">32</text></g>
  <g class="n g"><rect x="346" y="156" width="46" height="32" rx="5"/><text class="bt xs" x="369" y="172" text-anchor="middle" dominant-baseline="central">38</text></g>
  <g class="n g"><rect x="392" y="156" width="46" height="32" rx="5"/><text class="bt xs" x="415" y="172" text-anchor="middle" dominant-baseline="central">42</text></g>
  <g class="n g"><rect x="516" y="156" width="46" height="32" rx="5"/><text class="bt xs" x="539" y="172" text-anchor="middle" dominant-baseline="central">46</text></g>
  <g class="n g"><rect x="562" y="156" width="46" height="32" rx="5"/><text class="bt xs" x="585" y="172" text-anchor="middle" dominant-baseline="central">50</text></g>
  <path class="ar dash" d="M118,172 H180"/>
  <path class="ar dash" d="M274,172 H344"/>
  <path class="ar dash" d="M438,172 H514"/>
  <text class="cap" x="14" y="34">紫 = 根（索引）</text>
  <text class="cap" x="14" y="56">蓝 = 分支（索引）</text>
  <text class="cap" x="14" y="78">绿 = 叶结点</text>
  <text class="cap" x="14" y="100">　　含全部关键字</text>
  <text class="cap" x="14" y="140">虚线 = 叶结点顺序链表</text>
</svg>
` },

    { t: 'compare', id: 'b-vs-bplus', title: '★ B 树与 B+ 树的六点区别（必背）',
      cols: ['', 'B 树', 'B+ 树'],
      rows: [
        ['$n$ 个关键字对应几棵子树', '==$n+1$ 棵==', '==$n$ 棵=='],
        ['关键字数的范围（非根）', '$\\lceil m/2\\rceil-1 \\sim m-1$', '$\\lceil m/2\\rceil \\sim m$'],
        ['关键字出现的次数', '==每个只出现一次==', '==叶结点含全部；分支层是重复的索引=='],
        ['记录存在哪', '所有结点都可能存记录', '==只有叶结点存记录=='],
        ['查找是否可能提前命中', '==可能在中间层命中，查找长度不定==', '==每次都必须走到叶子，查找长度固定=='],
        ['能否顺序 / 范围查找', '❌ 只能多路查找', '==✅ 叶子链表支持顺序扫描=='],
      ] },

    { t: 'key', id: 'bplus-why', title: '为什么数据库和文件系统都选 B+ 树', c: String.raw`
      1. ==分支结点不存记录，同样大小的磁盘块能装下更多关键字==，
         分支因子 $m$ 更大 → 树更矮 → I/O 更少；
      2. ==叶子链表让范围查询（$\texttt{BETWEEN}$、排序输出）代价极低==，
         一次定位后顺序读即可，而 B 树必须反复中序遍历、上下折返；
      3. ==每次查找的 I/O 次数固定为树高==，性能稳定可预测。

      操作系统里的文件索引、数据库的聚簇索引，用的都是 B+ 树。
      **常考的一句辨析**：==B+ 树的分支结点"不是数据，只是路标"==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '六、例题' },

    { t: 'example', id: 'ex-build',
      title: '★ 依次插入构造 5 阶 B 树',
      source: '经典大题',
      level: 3,
      problem: String.raw`
        依次插入关键字 $20,\ 30,\ 50,\ 52,\ 60,\ 68,\ 70,\ 72$，构造一棵 **5 阶 B 树**。
        写出每次分裂的时机与结果，并画出最终的树。
      `,
      idea: String.raw`
        先把参数算清楚写在草稿最上面：
        $m=5$，$\lceil m/2\rceil=3$，==每个非根结点 $2\sim 4$ 个关键字、$3\sim 5$ 棵子树==。

        然后只需要盯住一件事：==什么时候某个结点凑到了 5 个关键字==。
        一旦凑到 5 个就砍第 3 个上去。==除此之外插入什么都不用做==。
      `,
      solution: String.raw`
        **第 1~4 步**：插入 $20,30,50,52$，都在同一个结点里，
        $$[\,20\ \ 30\ \ 50\ \ 52\,]\qquad(4\ \text{个，未溢出})$$

        **第 5 步：插入 $60$** → 变成 $[\,20\ 30\ 50\ 52\ 60\,]$，==5 个，溢出==。
        取第 $\lceil 5/2\rceil=3$ 个关键字 $50$ 上升：

        $$\text{根}=[\,50\,],\qquad \text{左}=[\,20\ 30\,],\qquad \text{右}=[\,52\ 60\,]$$

        树高变为 2。

        **第 6~7 步**：插入 $68,70$，都落在右子结点：
        $$\text{右}=[\,52\ 60\ 68\ 70\,]\qquad(4\ \text{个，未溢出})$$

        **第 8 步：插入 $72$** → 右子结点变成 $[\,52\ 60\ 68\ 70\ 72\,]$，==溢出==。
        取第 3 个关键字 $68$ 上升到根：

        $$\text{根}=[\,50\ \ 68\,]$$
        $$\text{子结点}=[\,20\ 30\,],\quad [\,52\ 60\,],\quad [\,70\ 72\,]$$

        **最终的树**：根有 2 个关键字、3 棵子树（==根的下限是 1 个关键字，满足==）；
        三个终端结点各有 2 个关键字（==等于下限 $\lceil m/2\rceil-1=2$，满足==）。
        树高 2，所有叶结点在同一层 ✓
      `,
      comment: String.raw`
        **自查清单**（每画完一步都过一遍）：

        1. ==每个非根结点的关键字数在 $[2,4]$ 内==；
        2. ==每个结点的子树数 = 关键字数 + 1==；
        3. ==所有终端结点在同一层==；
        4. 中序读出来==必须是递增的==（$20,30,50,52,60,68,70,72$）✓

        **最常见的三个错**：
        1. ==分裂时上升的是第 $\lceil m/2\rceil$ 个==，不是"中间随便一个"。
           5 阶取第 3 个、4 阶取第 2 个、3 阶取第 2 个。
        2. ==分裂后忘了把左右两半都挂到父结点上==，指针数对不上。
        3. ==把新关键字插到中间层==。B 树的插入永远发生在终端结点。
      `,
    },

    { t: 'example', id: 'ex-height',
      title: 'B 树的高度与结点数估算',
      source: '选择题',
      level: 3,
      problem: String.raw`
        (1) 一棵 3 阶 B 树（2-3 树）含 $8$ 个关键字，其最小高度和最大高度分别是多少？
        （高度不含叶结点层）

        (2) 若一棵 $m=5$ 的 B 树高度为 $3$（不含叶结点层），它最多能存多少个关键字？
      `,
      idea: String.raw`
        ==这类题不要套公式，直接"往极端里塞"==：

        - 求**最小**高度 → 每个结点都塞满（$m-1$ 个关键字、$m$ 棵子树）；
        - 求**最大**高度 → 每个结点都只放下限（根放 1 个、其余放 $\lceil m/2\rceil-1$ 个）。

        逐层数结点数比套对数公式可靠得多。
      `,
      solution: String.raw`
        **(1)** $m=3$，$\lceil m/2\rceil=2$，非根结点关键字数 $1\sim 2$，子树数 $2\sim 3$。

        - **最小高度**：全塞满。
          $h=1$ 时最多 $2$ 个关键字；
          $h=2$ 时最多 $2+3\times 2=8$ 个关键字。
          $8\le 8$，故==最小高度 $=2$==。
        - **最大高度**：全放下限。
          $h=1$：至少 1 个关键字；
          $h=2$：根 1 个 + 2 个子结点各 1 个 $=3$；
          $h=3$：根 1 + 第 2 层 2 个结点各 1 个 + 第 3 层 4 个结点各 1 个 $=7$；
          $h=4$：$1+2+4+8=15>8$。
          $7\le 8<15$，故==最大高度 $=3$==。

        **(2)** $m=5$，全塞满时每个结点 $4$ 个关键字、$5$ 棵子树。

        - 第 1 层：$1$ 个结点；
        - 第 2 层：$5$ 个；
        - 第 3 层：$25$ 个。

        $$\text{关键字总数}=4\times(1+5+25)=4\times 31=\boxed{124}$$

        （即 $m^h-1=5^3-1=124$，与公式一致。）
      `,
      comment: String.raw`
        **(1) 的最大高度容易算错**：很多人忘了==根结点的下限是 1 个关键字==
        （定义第 2 条：非终端的根至少 2 棵子树），
        按 $\lceil m/2\rceil-1=1$ 算恰好也是 1，本题正好巧合；
        但对 $m=5$ 就不一样了 —— ==根下限 1 个，其余结点下限 2 个==。

        **一个好用的检查**：==叶（失败）结点数恒等于关键字数 $+1$==。
        (2) 中 $124$ 个关键字对应 $125$ 个失败结点，
        而第 4 层（叶结点层）恰好有 $5^3=125$ 个位置 ✓ ——
        算完拿这条验一遍，能挡住大部分粗心错误。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '七、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **"$m$ 阶"理解成"最多 $m$ 个关键字"** —— ==是最多 $m$ 棵**子树**、$m-1$ 个关键字==。
      2. **非根结点的下限记成 $\lceil m/2\rceil$ 个关键字** —— ==是 $\lceil m/2\rceil-1$ 个关键字
         （$\lceil m/2\rceil$ 棵子树）==。
      3. **忘了根结点的下限更松** —— 根只要 1 个关键字（2 棵子树）。
      4. **分裂点取错** —— 上升的是==第 $\lceil m/2\rceil$ 个==关键字。
      5. **B+ 树的子树数记成 $n+1$** —— ==B+ 树是 $n$ 棵==，这是最高频的辨析点。
      6. **B+ 树的关键字数范围记成和 B 树一样** —— ==B+ 是 $\lceil m/2\rceil\sim m$==。
      7. **认为 B 树也能范围查询** —— ==只有 B+ 树有叶子链表==。
      8. **认为 B 树的查找长度固定** —— ==B 树可能在中间层就命中==，B+ 树才固定。
      9. **删除时忘了先换成终端结点的关键字**。
      10. **借关键字时不经过父结点** —— 破坏有序性，必须"父子换位"。
      11. **说 B 树是二叉排序树的推广所以查找也是 $O(\log_2 n)$** ——
          ==是 $O(\log_m n)$==，底数是 $m$ 才是它的意义所在。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '八、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      B 树的所有规则都可以从==一个目标==反推出来：
      ==让每个结点正好装满一个磁盘块，同时保证树绝对平衡==。

      - "至多 $m$ 棵子树"是==块的大小上限==；
      - "至少半满"是==为了不让空间浪费太多，也保证树不会太高==；
      - "所有叶子同层"是==为了让每次查找的 I/O 次数一样多，性能可预测==；
      - "分裂时中间那个上升"是==唯一能让左右两半都满足下限的切法==。

      记住这条因果链，五条定义就不用背了。
    ` },

  ],
});
