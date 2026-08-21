/* ==========================================================================
   数据结构 / 2 线性表 / 顺序存储与链式存储的选择
   ========================================================================== */

KM.page({
  path: 'ds/list/list-compare',
  title: '顺序存储与链式存储的选择',
  subtitle: '三个维度（空间 / 存取 / 增删）一一比过去 —— 以及"链表更省空间"这句话在什么时候是错的',
  tags: ['概念辨析', '必考'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'layout', c: '一、先看物理布局' },

    { t: 'diagram', id: 'memory-layout', title: '内存里它们长什么样',
      note: '上：顺序表（一整块）　下：链表（分散 + 指针）',
      caption: String.raw`==顺序表必须一次要到一整块连续空间==，用不完的部分就闲置在那；
      ==链表可以东一块西一块==，但每个结点都要额外背一个指针域。
      这两句话就是下面所有性能差异的来源。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 234" role="img" aria-label="顺序表与链表在内存中的物理布局对比">
  <text class="cap" x="14" y="20">顺序表：一整块连续空间，容量 8，实际用 5</text>
  <g class="n k"><rect x="120" y="30" width="56" height="32" rx="4"/><text class="bt xs" x="148" y="46" text-anchor="middle" dominant-baseline="central">a1</text></g>
  <g class="n k"><rect x="176" y="30" width="56" height="32" rx="4"/><text class="bt xs" x="204" y="46" text-anchor="middle" dominant-baseline="central">a2</text></g>
  <g class="n k"><rect x="232" y="30" width="56" height="32" rx="4"/><text class="bt xs" x="260" y="46" text-anchor="middle" dominant-baseline="central">a3</text></g>
  <g class="n k"><rect x="288" y="30" width="56" height="32" rx="4"/><text class="bt xs" x="316" y="46" text-anchor="middle" dominant-baseline="central">a4</text></g>
  <g class="n k"><rect x="344" y="30" width="56" height="32" rx="4"/><text class="bt xs" x="372" y="46" text-anchor="middle" dominant-baseline="central">a5</text></g>
  <g class="n m"><rect x="400" y="30" width="56" height="32" rx="4"/><text class="bt xs" x="428" y="46" text-anchor="middle" dominant-baseline="central">闲置</text></g>
  <g class="n m"><rect x="456" y="30" width="56" height="32" rx="4"/><text class="bt xs" x="484" y="46" text-anchor="middle" dominant-baseline="central">闲置</text></g>
  <g class="n m"><rect x="512" y="30" width="56" height="32" rx="4"/><text class="bt xs" x="540" y="46" text-anchor="middle" dominant-baseline="central">闲置</text></g>
  <text class="lb em" x="580" y="50">地址可算 → O(1)</text>
  <text class="cap" x="14" y="86">链表：结点分散在各处，靠指针串起来</text>
  <g class="n g"><rect x="40" y="150" width="66" height="34" rx="4"/><text class="bt xs" x="60" y="167" text-anchor="middle" dominant-baseline="central">a1</text><text class="bs" x="92" y="167" text-anchor="middle" dominant-baseline="central">→</text></g>
  <g class="n g"><rect x="222" y="102" width="66" height="34" rx="4"/><text class="bt xs" x="242" y="119" text-anchor="middle" dominant-baseline="central">a2</text><text class="bs" x="274" y="119" text-anchor="middle" dominant-baseline="central">→</text></g>
  <g class="n g"><rect x="150" y="192" width="66" height="34" rx="4"/><text class="bt xs" x="170" y="209" text-anchor="middle" dominant-baseline="central">a3</text><text class="bs" x="202" y="209" text-anchor="middle" dominant-baseline="central">→</text></g>
  <g class="n g"><rect x="380" y="154" width="66" height="34" rx="4"/><text class="bt xs" x="400" y="171" text-anchor="middle" dominant-baseline="central">a4</text><text class="bs" x="432" y="171" text-anchor="middle" dominant-baseline="central">→</text></g>
  <g class="n g"><rect x="330" y="98" width="66" height="34" rx="4"/><text class="bt xs" x="350" y="115" text-anchor="middle" dominant-baseline="central">a5</text><text class="bs" x="362" y="115" text-anchor="middle" dominant-baseline="central">∧</text></g>
  <path class="ar" d="M106,158 L220,124"/>
  <path class="ar" d="M256,136 L196,190"/>
  <path class="ar" d="M216,204 L378,172"/>
  <path class="ar" d="M414,154 L360,134"/>
  <text class="lb em" x="470" y="204">要取第 5 个？只能从头一个个走</text>
  <text class="lb" x="470" y="224">每个结点多一个指针域</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'three-dims', c: '二、三个维度的对比' },

    { t: 'compare', id: 'main-table', title: '★ 顺序表 vs 链表（这张表要能默写）',
      cols: ['维度', '顺序表', '链表'],
      rows: [
        ['**空间分配**', '静态：编译期定死；动态：==要一整块连续空间==，扩容代价 $O(n)$',
         '==按需分配，无需连续空间==，扩容无代价'],
        ['**空间利用率**', '==无指针开销，但预分配可能大量闲置==', '==无闲置，但每个结点背一个指针域=='],
        ['**存取方式**', '==随机存取 $O(1)$==（地址可算）', '==只能顺序存取 $O(n)$=='],
        ['**按值查找（无序）**', '$O(n)$', '$O(n)$'],
        ['**按值查找（有序）**', '==$O(\\log n)$（可折半）==', '$O(n)$（==不能折半==）'],
        ['**插入 / 删除**', '$O(n)$，平均移动约半个表', '==找到前驱后 $O(1)$==；按位序仍需 $O(n)$ 找'],
        ['**适合场景**', '==表长稳定、很少增删、常按位置访问==', '==长度变化大、频繁增删、不常按位置访问=='],
      ] },

    { t: 'key', id: 'space-crossover', title: '★ "链表更省空间"什么时候是错的', c: String.raw`
      设每个数据元素占 $e$ 字节，每个指针占 $p$ 字节，
      顺序表预分配容量 $m$、实际存了 $n$ 个元素。

      $$S_{\text{顺序}}=m\cdot e,\qquad S_{\text{链式}}=n\cdot(e+p)$$

      链表更省 $\iff n(e+p)<me \iff \dfrac{n}{m}<\dfrac{e}{e+p}$。

      **代入具体数字**（$32$ 位系统，元素是 $\texttt{int}$，$e=p=4$）：

      $$\frac{n}{m}<\frac{4}{8}=50\%$$

      也就是说==只要顺序表的空间利用率超过 50%，顺序表就比链表更省==。

      **结论要记牢**：
      - ==元素本身很小（如 $\texttt{int}$、$\texttt{char}$）时，指针开销占比极大，链表往往更费==；
      - ==元素很大（如一整条学生记录，几百字节）时，指针开销可以忽略，链表的优势才体现出来==；
      - ==只有在"表长严重不可预测、预分配会浪费大半"时，链表才明显更省==。

      "链表比顺序表省空间"==是一个常见的想当然==，考试里经常拿来做判断题。
    ` },

    { t: 'key', id: 'random-access', title: '"随机存取"这个词的准确含义', c: String.raw`
      **随机存取（random access）** = ==取任意一个位置的元素，代价都相同（且是 $O(1)$）==。

      - 顺序表：$\mathrm{LOC}(a_i)=\mathrm{LOC}(a_1)+(i-1)L$，一步算出 → ==支持==；
      - 链表：必须从头沿指针走 $i$ 步 → ==不支持，只能顺序存取==。

      **由此推出的几条**：

      1. ==链表不能用[折半查找](#/ds/search/binary?at=binary-req)==（取不到"中间那个"）；
      2. ==链表不能用[希尔排序、快速排序、堆排序](#/ds/sort/sort-compare?at=linked-list)==
         （都依赖下标跳跃）；
      3. ==链表最适合的排序是[归并排序](#/ds/sort/merge-radix?at=merge-complexity)==
         （只需顺序访问，且在链表上空间可降到 $O(1)$）。

      =="能不能随机存取"是顺序表与链表最本质的差别==，
      上面这一串结论全部由它推出，不用单独记。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'choose', c: '三、怎么选：问三个问题' },

    { t: 'method', id: 'three-questions', title: '选型的三问', c: String.raw`
      **问题一：表长能不能事先估准？**
      - 能，且比较稳定 → ==顺序表==；
      - 完全不可预测、可能差几个数量级 → ==链表==。

      **问题二：主要操作是"按位置访问"还是"增删"？**
      - 大量按位置访问（尤其是随机位置） → ==顺序表==；
      - 大量在中间插入删除 → ==链表==。

      **问题三：需不需要"有序 + 快速查找"？**
      - 需要 → ==顺序表==（可折半，$O(\log n)$）；
        若还要频繁增删，则应该换成[平衡树](#/ds/tree/bst?at=avl-def)或[散列表](#/ds/search/hash?at=idea)。

      **一个容易忽略的实际因素**：==顺序表的空间局部性远好于链表==。
      顺序表的元素挨在一起，一次读一个 Cache 块能带回好几个元素；
      链表结点分散在堆上，==几乎每访问一个结点就是一次 Cache 缺失==。
      所以在现代机器上，==即使理论复杂度相同，顺序表通常也快得多==。
      408 的选择题一般不考这一点，但简答题写上去是加分的。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '四、例题' },

    { t: 'example', id: 'ex-space',
      title: '★ 算一算：什么时候链表真的更省',
      source: '计算题',
      level: 3,
      problem: String.raw`
        某线性表的元素为一个结构体，占 $12$ 字节；指针占 $4$ 字节。

        (1) 若用顺序表存储，预分配容量为 $1000$，实际只存了 $400$ 个元素，
        求顺序表与单链表各占多少空间，哪个更省？
        (2) 一般地，顺序表的空间利用率低于多少时，单链表才更省空间？
        (3) 若改用**双链表**，这个临界值变成多少？
      `,
      idea: String.raw`
        ==把两个式子写出来直接比==：
        $$S_{\text{顺序}}=m\cdot e,\qquad S_{\text{链式}}=n\cdot(e+k\cdot p)$$
        $k$ 是每个结点的指针个数（单链表 1、双链表 2）。

        (2)(3) 就是解不等式 $n(e+kp)<me$，即 ==$\frac{n}{m}<\frac{e}{e+kp}$==。
      `,
      solution: String.raw`
        $e=12$，$p=4$。

        **(1)**
        $$S_{\text{顺序}}=1000\times 12=12\,000\ \text{字节}$$
        $$S_{\text{单链}}=400\times(12+4)=400\times 16=6\,400\ \text{字节}$$

        ==单链表更省==（利用率只有 $40\%$，闲置了 $600$ 个格子）。

        **(2)** 令 $n(e+p)<me$：
        $$\frac{n}{m}<\frac{e}{e+p}=\frac{12}{16}=\boxed{75\%}$$

        即==顺序表利用率低于 $75\%$ 时，单链表更省==。
        本题利用率 $40\%<75\%$，与 (1) 的结论一致 ✓

        **(3)** 双链表每个结点两个指针：
        $$\frac{n}{m}<\frac{e}{e+2p}=\frac{12}{20}=\boxed{60\%}$$

        临界值降低了 —— ==双链表更费空间，所以要求顺序表浪费得更狠才划不来==。
      `,
      comment: String.raw`
        **注意元素大小对结论的影响有多大**：

        | 元素大小 $e$ | 单链表更省的条件（利用率低于） |
        |---|---|
        | 4 字节（$	exttt{int}$） | ==50%== |
        | 12 字节 | 75% |
        | 100 字节 | ≈ 96% |

        ==元素越大，链表越占便宜==；元素只有一个 $\texttt{int}$ 时，
        ==链表的指针开销和数据一样多==，几乎不可能省。

        **一个常见的错误设法**：把顺序表的空间算成 $n\cdot e$。
        ==顺序表占的是**预分配的容量** $m$，不是实际长度 $n$== ——
        闲置的部分也是实实在在占着内存的。这一点正是本题的考点。
      `,
    },

    { t: 'example', id: 'ex-judge',
      title: '六个判断题',
      source: '选择/判断',
      level: 2,
      problem: String.raw`
        判断对错并说明理由：

        (1) 链表的每个结点中都恰好包含一个指针域；
        (2) 顺序表的插入操作的时间复杂度一定是 $O(n)$；
        (3) 链表的优点之一是可以随机访问表中任一元素；
        (4) 线性表采用链式存储时，结点的存储地址必须是不连续的；
        (5) 在有序的线性表上做查找，链式存储一定比顺序存储慢；
        (6) 若线性表最常用的操作是"在最后一个元素之后插入一个新元素"和"删除第一个元素"，
        则采用==带尾指针的循环单链表==最节省时间。
      `,
      idea: String.raw`
        凡是出现"一定""必须""都"这类绝对词，先找反例。
      `,
      solution: String.raw`
        **(1) 错。** ==双链表有两个指针域==；
        十字链表、[二叉链表](#/ds/tree/traversal?at=binode)等也不止一个。

        **(2) 错。** ==在表尾插入是 $O(1)$==（不需要移动任何元素）。
        $O(n)$ 说的是最坏情况和平均情况。

        **(3) 错。** ==链表只能顺序存取==，这是它最核心的短板。

        **(4) 错。** 链式存储==只是"不要求"连续，不是"必须不连续"==。
        malloc 出来的结点完全可能恰好相邻。

        **(5) 对（就"查找"这一操作而言）。**
        有序顺序表可以[折半查找 $O(\log n)$](#/ds/search/binary?at=binary-req)，
        而链表只能顺序查找 $O(n)$。
        ==注意题目限定了"有序表上做查找"==；若表无序，两者都是 $O(n)$，不分高下。

        **(6) 对。** 带尾指针 $r$ 的循环单链表中：
        - "在最后一个元素之后插入"→ ==$r$ 就是尾结点，$O(1)$==；
        - "删除第一个元素"→ ==$\texttt{r->next}$ 就是头结点，$\texttt{r->next->next}$ 就是首元结点，$O(1)$==。

        两个操作都是 $O(1)$。若用头指针的循环单链表，第一个操作要 $O(n)$。
      `,
      comment: String.raw`
        **(6) 是这类题的经典形式**，出题人会把四个选项写成
        "单链表 / 双链表 / 带头指针的循环单链表 / ==带尾指针的循环单链表=="，
        ==答案几乎总是最后一个==。

        原因：==尾指针能同时以 $O(1)$ 摸到表头和表尾==
        （表头就在 $\texttt{r->next}$），而头指针只能摸到表头。

        **(4) 的变形**："顺序存储的元素地址必须连续吗？" —— ==必须==。
        这个方向是对的，==只有链式那边是"不要求"==。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **"链表一定比顺序表省空间"** —— ==元素小的时候往往更费==。
      2. **算顺序表空间时用 $n$ 而不是 $m$** —— ==闲置的容量也占内存==。
      3. **"链表支持随机存取"** —— ==只能顺序存取==。
      4. **"顺序表插入一定 $O(n)$"** —— ==表尾插入是 $O(1)$==。
      5. **"链表插入一定 $O(1)$"** —— ==按位序插入仍要 $O(n)$ 找前驱==。
      6. **"链式存储的地址必须不连续"** —— 是==不要求==连续。
      7. **认为链表能折半查找** —— ==不能==。
      8. **忘了"带尾指针的循环单链表"这个答案** —— 表头表尾都能 $O(1)$ 摸到。
      9. **动态分配的顺序表当成链式存储** —— ==仍是顺序存储==。
      10. **只比时间不比空间** —— 选型题通常两个维度都要提。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      整页可以压缩成一句对偶：

      ==顺序表把"关系"写在地址里，链表把"关系"写在指针里。==

      写在地址里 → 关系是免费的（不占额外空间）、可计算的（$O(1)$ 随机存取），
      但==维护这个地址约束很贵==（增删要挪）。

      写在指针里 → 关系要花空间存、只能顺着走，
      但==改起来很便宜==（改个指针就行）。

      所有对比表里的条目，都是这句话的推论。
    ` },

  ],
});
