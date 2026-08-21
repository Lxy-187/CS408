/* ==========================================================================
   数据结构 / 7 查找 / 折半查找与判定树
   —— 顺序查找、折半查找、分块查找三种线性表上的查找都在这一页
   ========================================================================== */

KM.page({
  path: 'ds/search/binary',
  title: '折半查找与判定树',
  subtitle: '顺序 / 折半 / 分块三种查找，以及把 ASL 算对的唯一可靠办法 —— 画判定树',
  tags: ['高频', '必考', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'asl', c: '一、ASL：这一章所有题的评分标准' },

    { t: 'key', id: 'asl-def', title: '平均查找长度', c: String.raw`
      **查找长度**：一次查找中==和关键字比较的次数==。

      $$\mathrm{ASL}=\sum_{i=1}^{n} P_i\,C_i$$

      其中 $P_i$ 是查找第 $i$ 个元素的概率（==没特别说明就是等概率 $1/n$==），
      $C_i$ 是找到它需要的比较次数。

      **必须分开算两个 ASL**：

      - $\mathrm{ASL}_{\text{成功}}$：对 $n$ 个==存在的==元素求平均；
      - $\mathrm{ASL}_{\text{失败}}$：对==所有可能的失败情形==求平均
        （有序表上是 $n+1$ 个"区间"，散列表上是各个位置）。

      ==题目问哪个一定要看清==。只说"平均查找长度"而没说成功失败时，
      默认指==成功==，但稳妥的做法是两个都写出来。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'seq', c: '二、顺序查找' },

    { t: 'key', id: 'seq-basic', title: '一般无序表：从头扫到尾', c: String.raw`
      $$\mathrm{ASL}_{\text{成功}}=\frac{1+2+\dots+n}{n}=\frac{n+1}{2},
      \qquad \mathrm{ASL}_{\text{失败}}=n+1$$

      失败要比较 $n+1$ 次的原因：**哨兵写法**下要多比一次哨兵位置。
      若不用哨兵、循环条件里判下标，则失败是比较 $n$ 次 ——
      ==两种说法都有教材用，答题时写清楚你用的是哪种==。408 教材（王道）用哨兵，取 $n+1$。

      **时间复杂度 $O(n)$**，==对存储结构没有要求==：
      顺序表、链表都能用，元素有序无序都能用。这是它唯一的优点。
    ` },

    { t: 'code', id: 'seq-code', title: '带哨兵的顺序查找', lang: 'c',
      note: '0 号位放哨兵，省掉每轮的越界判断',
      c: String.raw`
        int Search_Seq(SSTable ST, ElemType key) {
            ST.elem[0] = key;                    // 哨兵
            int i;
            for (i = ST.TableLen; ST.elem[i] != key; --i) ;
            return i;                            // 返回 0 表示查找失败
        }
      ` },

    { t: 'key', id: 'seq-ordered', title: '有序表上的顺序查找：失败可以提前结束', c: String.raw`
      若表已按关键字==递增==排列，扫描到==第一个大于 $key$ 的元素==就可以断定失败，
      不必扫到底。用判定树（把 $n+1$ 个失败区间都画成方框）算得

      $$\mathrm{ASL}_{\text{成功}}=\frac{n+1}{2},\qquad
      \mathrm{ASL}_{\text{失败}}=\frac{n}{2}+\frac{n}{n+1}$$

      ==成功的 ASL 和无序表完全一样==（有序性帮不上成功的忙），
      失败的 ASL 大约减半 —— 这就是"有序"在顺序查找里的全部价值。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'binary', c: '三、折半查找' },

    { t: 'key', id: 'binary-req', title: '两个硬前提', c: String.raw`
      折半查找（二分查找）要求：

      1. ==表必须有序==；
      2. ==必须是顺序存储==（要能 $O(1)$ 地取中间元素）。

      ==链表不能折半查找==，这是一个高频判断题。
      同样，==频繁插入删除的表也不适合==（维持有序的代价太大）——
      那种场景应该用 [BST / AVL](#/ds/tree/bst?at=def) 或 [B 树](#/ds/search/btree?at=why)。
    ` },

    { t: 'code', id: 'binary-code', title: '折半查找', lang: 'c',
      note: '注意三处：mid 的取法、两个 ± 1、循环条件的等号',
      c: String.raw`
        int Binary_Search(SeqList L, ElemType key) {
            int low = 0, high = L.TableLen - 1;
            while (low <= high) {                 // 注意是 <=
                int mid = (low + high) / 2;       // 向下取整
                if (L.elem[mid] == key)  return mid;
                else if (L.elem[mid] > key) high = mid - 1;   // 去左半
                else                        low  = mid + 1;   // 去右半
            }
            return -1;
        }
      ` },

    { t: 'warn', id: 'binary-traps', title: '折半查找代码的四个必错点', c: String.raw`
      1. ==循环条件必须是 $\texttt{low <= high}$==。
         写成 $\texttt{<}$ 会漏掉"区间只剩一个元素"的情形。
      2. ==缩小区间时必须跳过 mid==（$\texttt{mid-1}$ / $\texttt{mid+1}$）。
         写成 $\texttt{high = mid}$ 会==死循环==（当 $\texttt{low}$ 与 $\texttt{high}$ 相邻时 mid 恒等于 low）。
      3. ==$\texttt{mid}$ 的取法影响判定树的形状==。
         $\lfloor\cdot\rfloor$ 与 $\lceil\cdot\rceil$ 给出的判定树不同、ASL 也可能不同，
         ==408 默认向下取整==，答题时最好写一句"取 $mid=\lfloor(low+high)/2\rfloor$"。
      4. **大数溢出**：$\texttt{(low+high)/2}$ 在 $\texttt{int}$ 范围内可能溢出，
         工程上写 $\texttt{low + (high-low)/2}$。==考试不扣这个分，但知道更好==。
    ` },

    { t: 'key', id: 'decision-tree', title: '★ 判定树：把折半查找画成一棵二叉树', c: String.raw`
      **构造规则**：当前区间的 $mid$ 作根，左半区间递归构成左子树，右半区间构成右子树。

      判定树的三个性质：

      1. ==它是一棵二叉排序树==（中序遍历就是原来的有序表）；
      2. ==它一定是"平衡"的==：任一结点的左右子树结点数最多差 1
         （向下取整时，==右子树结点数 = 左子树结点数 或 左子树 + 1==）；
      3. ==树高 $h=\lceil\log_2(n+1)\rceil$==，
         所以查找一个元素的比较次数 $\le \lceil\log_2(n+1)\rceil$。

      **ASL 就直接从树上读**：

      $$\mathrm{ASL}_{\text{成功}}=\frac{1}{n}\sum_i(\text{结点 }i\text{ 的层次}),\qquad
      \mathrm{ASL}_{\text{失败}}=\frac{1}{n+1}\sum(\text{方框的层次}-1)$$

      当 $n$ 较大时有近似式 $\mathrm{ASL}_{\text{成功}}\approx \log_2(n+1)-1$，
      ==但考试要的是精确值，必须画树数层==。
    ` },

    { t: 'diagram', id: 'tree-11', title: '$n=11$ 的折半查找判定树',
      note: '结点里是元素的下标（1 起），取 mid 向下取整',
      caption: String.raw`==这棵树的形状只由 $n$ 决定，和表里存什么值无关==，
      所以"$n=11$ 的折半查找 ASL 是多少"这种题，画一次树就能同时答出成功和失败两个答案。
      本图各层结点数为 $1,2,4,4$，故
      $\mathrm{ASL}_{\text{成功}}=\frac{1\times 1+2\times 2+3\times 4+4\times 4}{11}=\frac{33}{11}=3$。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 236" role="img" aria-label="11 个元素的折半查找判定树">
  <path class="ar plain" d="M350,30 L180,86"/><path class="ar plain" d="M350,30 L520,86"/>
  <path class="ar plain" d="M180,86 L90,142"/><path class="ar plain" d="M180,86 L270,142"/>
  <path class="ar plain" d="M520,86 L430,142"/><path class="ar plain" d="M520,86 L610,142"/>
  <path class="ar plain" d="M90,142 L130,198"/><path class="ar plain" d="M270,142 L310,198"/>
  <path class="ar plain" d="M430,142 L470,198"/><path class="ar plain" d="M610,142 L650,198"/>
  <g class="n p"><rect x="334" y="14" width="32" height="32" rx="16"/><text class="bt sm" x="350" y="30" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n k"><rect x="164" y="70" width="32" height="32" rx="16"/><text class="bt sm" x="180" y="86" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n k"><rect x="504" y="70" width="32" height="32" rx="16"/><text class="bt sm" x="520" y="86" text-anchor="middle" dominant-baseline="central">9</text></g>
  <g class="n k"><rect x="74" y="126" width="32" height="32" rx="16"/><text class="bt sm" x="90" y="142" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="254" y="126" width="32" height="32" rx="16"/><text class="bt sm" x="270" y="142" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n k"><rect x="414" y="126" width="32" height="32" rx="16"/><text class="bt sm" x="430" y="142" text-anchor="middle" dominant-baseline="central">7</text></g>
  <g class="n k"><rect x="594" y="126" width="32" height="32" rx="16"/><text class="bt sm" x="610" y="142" text-anchor="middle" dominant-baseline="central">10</text></g>
  <g class="n g"><rect x="114" y="182" width="32" height="32" rx="16"/><text class="bt sm" x="130" y="198" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n g"><rect x="294" y="182" width="32" height="32" rx="16"/><text class="bt sm" x="310" y="198" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n g"><rect x="454" y="182" width="32" height="32" rx="16"/><text class="bt sm" x="470" y="198" text-anchor="middle" dominant-baseline="central">8</text></g>
  <g class="n g"><rect x="634" y="182" width="32" height="32" rx="16"/><text class="bt sm" x="650" y="198" text-anchor="middle" dominant-baseline="central">11</text></g>
  <text class="cap" x="14" y="34">第 1 层：1 个</text>
  <text class="cap" x="14" y="90">第 2 层：2 个</text>
  <text class="cap" x="14" y="118">第 3 层：4 个</text>
  <text class="cap" x="14" y="230">高度 4 = ⌈log₂12⌉　　每个结点的左右子树结点数最多差 1</text>
</svg>
` },

    { t: 'example', id: 'ex-asl-11',
      title: '★ 求 $n=11$ 时折半查找的两个 ASL',
      source: '必考小题',
      level: 3,
      problem: String.raw`
        对含 $11$ 个元素的有序表做折半查找（$mid$ 向下取整），
        求 $\mathrm{ASL}_{\text{成功}}$ 与 $\mathrm{ASL}_{\text{失败}}$，
        并指出查找任一元素所需的最多比较次数。
      `,
      idea: String.raw`
        ==必须画判定树==，不能背近似公式。

        画树的机械做法：写下区间 $[1,11]$，$mid=\lfloor 12/2\rfloor=6$；
        再对 $[1,5]$ 和 $[7,11]$ 重复，==一层一层往下写，不要跳==。

        失败结点（方框）的数量必须是 $n+1=12$ 个 —— ==数不够就是漏画了==。
      `,
      solution: String.raw`
        判定树见[上图](#/ds/search/binary?at=tree-11)，各层结点数为 $1,\,2,\,4,\,4$。

        **成功**

        $$\mathrm{ASL}_{\text{成功}}=\frac{1\times 1+2\times 2+3\times 4+4\times 4}{11}
        =\frac{1+4+12+16}{11}=\frac{33}{11}=\boxed{3}$$

        **失败**：把 $12$ 个方框挂在空指针处。

        - 第 3 层的 $4$ 个结点（下标 $1,4,7,10$）各缺一个左孩子
          → ==$4$ 个方框在第 4 层==；
        - 第 4 层的 $4$ 个结点（下标 $2,5,8,11$）各缺两个孩子
          → ==$8$ 个方框在第 5 层==。

        合计 $4+8=12$ ✓

        $$\mathrm{ASL}_{\text{失败}}=\frac{4\times(4-1)+8\times(5-1)}{12}
        =\frac{12+32}{12}=\frac{44}{12}=\frac{11}{3}\approx 3.67$$

        **最多比较次数** $=$ 树高 $=\lceil\log_2(11+1)\rceil=\boxed{4}$ 次。
      `,
      comment: String.raw`
        **三个自查**：

        1. 结点数 $=n=11$，方框数 $=n+1=12$；
        2. ==失败的层次要减 1==（落到方框那一步不比较）；
        3. $\mathrm{ASL}_{\text{失败}}$ 应当略大于 $\mathrm{ASL}_{\text{成功}}$。

        **和近似公式对照**：$\log_2(11+1)-1=\log_2 12-1\approx 2.58$，
        与精确值 $3$ 有差距 —— ==所以 $n$ 不大时绝不能用近似式作答==。

        **变形**：若 $mid$ 改成向**上**取整，判定树会变成"左子树比右子树多一个"的形状，
        $\mathrm{ASL}$ 可能不同。==题目不说时按向下取整并注明==。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'block', c: '四、分块查找（索引顺序查找）' },

    { t: 'key', id: 'block-def', title: '块间有序、块内无序', c: String.raw`
      把长度为 $n$ 的表分成 $b$ 块，每块 $s$ 个元素，要求：

      - ==**块间有序**==：第 $i$ 块中所有元素都小于第 $i+1$ 块中的任一元素；
      - ==**块内可以无序**==。

      再建一张**索引表**，每项记录该块的==最大关键字==和==起始地址==。

      **查找分两步**：
      1. 在索引表中确定待查元素属于哪一块（可以顺序查找，也可以折半查找）；
      2. 在该块内==顺序查找==（块内无序，只能顺序）。

      $$\mathrm{ASL}=L_I+L_S\quad(\text{索引查找长度}+\text{块内查找长度})$$
    ` },

    { t: 'formulas', id: 'block-asl', title: '分块查找的 ASL', items: [
      { label: '索引表用**顺序**查找', tex: String.raw`\mathrm{ASL}=\frac{b+1}{2}+\frac{s+1}{2}=\frac{s^2+2s+n}{2s}` },
      { label: '取 $s=\sqrt{n}$ 时达到最小', tex: String.raw`\mathrm{ASL}_{\min}=\sqrt{n}+1` },
      { label: '索引表用**折半**查找', tex: String.raw`\mathrm{ASL}=\lceil\log_2(b+1)\rceil+\frac{s+1}{2}` },
    ] },

    { t: 'key', id: 'block-notes', title: '关于分块查找的三个考点', c: String.raw`
      1. ==$s=\sqrt{n}$ 时 ASL 最小==，此时 $\mathrm{ASL}=\sqrt n+1$。
         这是对 $\frac{s^2+2s+n}{2s}$ 求导（或用均值不等式 $\frac{s}{2}+\frac{n}{2s}\ge\sqrt{n}$）得到的。
      2. ==即使索引表用折半查找，块内也只能顺序查找==（块内无序）。
         所以分块查找==永远达不到 $O(\log n)$==。
      3. **优点是插入删除方便**：只要找到对应块，==在块内任意位置插入即可==，
         不需要像折半查找那样移动大量元素。
         这是分块查找存在的理由 —— ==它是"查找效率"和"更新代价"之间的折中==。
    ` },

    { t: 'compare', id: 'three-compare', title: '三种查找方法对照',
      cols: ['', '顺序查找', '折半查找', '分块查找'],
      rows: [
        ['表是否要有序', '不要求', '==必须有序==', '==块间有序=='],
        ['存储结构', '顺序 / 链式都行', '==只能顺序存储==', '顺序 + 索引表'],
        ['$\\mathrm{ASL}_{成功}$', '$\\frac{n+1}{2}$', '$\\approx\\log_2(n+1)-1$', '$\\approx\\sqrt{n}+1$'],
        ['时间复杂度', '$O(n)$', '==$O(\\log n)$==', '$O(\\sqrt n)$'],
        ['插入删除', '✅ 容易', '❌ 要移动元素', '✅ 较容易'],
        ['适用', '表小 / 无序 / 链式', '==有序且很少变动==', '数据量大且常有增删'],
      ] },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **对链表用折半查找** —— ==不行==，必须顺序存储。
      2. **失败 ASL 忘了层次减 1** —— 落到方框那一步不算比较。
      3. **方框数不是 $n+1$** —— 漏画就一定算错。
      4. **用近似公式 $\log_2(n+1)-1$ 当精确答案** —— ==$n$ 小时误差很大==。
      5. **认为分块查找能到 $O(\log n)$** —— ==块内只能顺序查找==。
      6. **$s=\sqrt n$ 记成"块数取 $\sqrt n$"** —— 两者恰好都是 $\sqrt n$（因为 $b=n/s$），
         但推导时要分清 $b$ 和 $s$。
      7. **折半查找的循环条件写成 $\texttt{low < high}$** —— 会漏掉单元素区间。
      8. **区间收缩时没跳过 mid** —— ==死循环==。
      9. **认为折半查找的判定树是完全二叉树** —— ==是"平衡的 BST"，但不一定是完全二叉树==
         （$n=11$ 时第 3 层就没满，第 4 层却有 4 个）。
      10. **有序表顺序查找的成功 ASL 以为会变小** —— ==仍是 $\frac{n+1}{2}$==，
          只有失败的 ASL 变小了。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      三种查找可以看成==同一条轴上的三个刻度==：
      每次能排除多少候选 —— 顺序查找排除 1 个，分块查找排除一整块，折半查找排除一半。
      排除得越狠，对表的要求就越苛刻（无序 → 块间有序 → 完全有序 + 顺序存储）。

      =="效率"和"对结构的要求"永远是一笔交易==，
      这一观点在后面的 [B 树](#/ds/search/btree?at=why)和[散列表](#/ds/search/hash?at=idea)里还会重复出现。
    ` },

  ],
});
