/* ==========================================================================
   数据结构 / 8 排序 / 归并排序与基数排序
   ========================================================================== */

KM.page({
  path: 'ds/sort/merge-radix',
  title: '归并排序与基数排序',
  subtitle: '两个「不靠比较取胜」的算法 —— 归并靠分治与稳定的合并，基数靠按位分配收集',
  tags: ['高频', '必考', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'merge', c: '一、二路归并排序' },

    { t: 'key', id: 'merge-idea', title: '思想：先分到不能再分，再一路合上来', c: String.raw`
      **归并**：把==两个已经有序==的子表合成一个有序表。
      **归并排序**：把长度为 $n$ 的表看成 $n$ 个长度为 1 的有序表，
      两两归并，得到 $\lceil n/2\rceil$ 个长度为 2 的有序表；
      ==重复直到只剩一个表==。

      **两种等价的组织方式**：

      - **自顶向下（递归）**：先递归排左半、再递归排右半，最后 $\texttt{Merge}$；
      - **自底向上（迭代）**：从子表长度 1 开始，每轮长度翻倍。

      **趟数**：==$\lceil\log_2 n\rceil$==（每趟有序子表长度翻倍）。
      这个数字是选择题的常客。
    ` },

    { t: 'code', id: 'merge-code', title: '归并排序', lang: 'c',
      note: 'B 是全局辅助数组，这是 O(n) 空间的来源',
      c: String.raw`
        ElemType *B;                       // 辅助数组，长度 n+1

        void Merge(ElemType A[], int low, int mid, int high) {
            int i, j, k;
            for (k = low; k <= high; k++) B[k] = A[k];      // 先整段拷进 B

            for (i = low, j = mid + 1, k = i; i <= mid && j <= high; k++) {
                if (B[i] <= B[j]) A[k] = B[i++];   // ← 相等时取左边，保证稳定
                else              A[k] = B[j++];
            }
            while (i <= mid)  A[k++] = B[i++];     // 左边有剩，直接搬
            while (j <= high) A[k++] = B[j++];     // 右边有剩，直接搬
        }

        void MergeSort(ElemType A[], int low, int high) {
            if (low < high) {
                int mid = (low + high) / 2;
                MergeSort(A, low, mid);
                MergeSort(A, mid + 1, high);
                Merge(A, low, mid, high);
            }
        }
      ` },

    { t: 'warn', id: 'merge-stable', title: '稳定性系于一个等号', c: String.raw`
      $\texttt{Merge}$ 里那句 $\texttt{if (B[i] <= B[j])}$ 中的 ==等号是稳定性的全部保障==：

      当左右两段出现相等元素时，==必须优先取左段的==
      （左段在原序列中位置靠前）。写成 $\texttt{<}$ 就会先取右段，==归并排序立刻变得不稳定==。

      **另外两个细节**：
      1. ==两个 $\texttt{while}$ 收尾循环缺一不可==，
         但实际上==只会执行其中一个==（另一个的条件必然已不成立）；
      2. ==$\texttt{Merge}$ 的前提是左右两段各自有序==，
         递归时必须先排完两半再合并，顺序不能颠倒。
    ` },

    { t: 'diagram', id: 'merge-demo', title: '自底向上看归并的趟数',
      note: '序列 49 38 65 97 76 13 27，共 3 趟',
      caption: String.raw`==每趟之后，有序子表的长度翻倍==：$1\to 2\to 4\to 8$。
      所以趟数是 $\lceil\log_2 7\rceil=3$。
      注意最后一个子表可能==凑不齐==（第 1 趟末尾的 $27$ 单独一组），
      这不影响趟数，==它会在下一趟里和左边的合并==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 214" role="img" aria-label="二路归并排序自底向上的三趟过程">
  <text class="cap" x="14" y="50">初始</text>
  <g class="n k"><rect x="90" y="34" width="58" height="30" rx="5"/><text class="bt xs" x="119" y="49" text-anchor="middle" dominant-baseline="central">49</text></g>
  <g class="n g"><rect x="152" y="34" width="58" height="30" rx="5"/><text class="bt xs" x="181" y="49" text-anchor="middle" dominant-baseline="central">38</text></g>
  <g class="n k"><rect x="214" y="34" width="58" height="30" rx="5"/><text class="bt xs" x="243" y="49" text-anchor="middle" dominant-baseline="central">65</text></g>
  <g class="n g"><rect x="276" y="34" width="58" height="30" rx="5"/><text class="bt xs" x="305" y="49" text-anchor="middle" dominant-baseline="central">97</text></g>
  <g class="n k"><rect x="338" y="34" width="58" height="30" rx="5"/><text class="bt xs" x="367" y="49" text-anchor="middle" dominant-baseline="central">76</text></g>
  <g class="n g"><rect x="400" y="34" width="58" height="30" rx="5"/><text class="bt xs" x="429" y="49" text-anchor="middle" dominant-baseline="central">13</text></g>
  <g class="n k"><rect x="462" y="34" width="58" height="30" rx="5"/><text class="bt xs" x="491" y="49" text-anchor="middle" dominant-baseline="central">27</text></g>
  <text class="cap" x="14" y="92">第 1 趟</text>
  <g class="n k"><rect x="90" y="76" width="58" height="30" rx="5"/><text class="bt xs" x="119" y="91" text-anchor="middle" dominant-baseline="central">38</text></g>
  <g class="n k"><rect x="152" y="76" width="58" height="30" rx="5"/><text class="bt xs" x="181" y="91" text-anchor="middle" dominant-baseline="central">49</text></g>
  <g class="n g"><rect x="214" y="76" width="58" height="30" rx="5"/><text class="bt xs" x="243" y="91" text-anchor="middle" dominant-baseline="central">65</text></g>
  <g class="n g"><rect x="276" y="76" width="58" height="30" rx="5"/><text class="bt xs" x="305" y="91" text-anchor="middle" dominant-baseline="central">97</text></g>
  <g class="n k"><rect x="338" y="76" width="58" height="30" rx="5"/><text class="bt xs" x="367" y="91" text-anchor="middle" dominant-baseline="central">13</text></g>
  <g class="n k"><rect x="400" y="76" width="58" height="30" rx="5"/><text class="bt xs" x="429" y="91" text-anchor="middle" dominant-baseline="central">76</text></g>
  <g class="n m"><rect x="462" y="76" width="58" height="30" rx="5"/><text class="bt xs" x="491" y="91" text-anchor="middle" dominant-baseline="central">27</text></g>
  <text class="cap" x="14" y="134">第 2 趟</text>
  <g class="n k"><rect x="90" y="118" width="58" height="30" rx="5"/><text class="bt xs" x="119" y="133" text-anchor="middle" dominant-baseline="central">38</text></g>
  <g class="n k"><rect x="152" y="118" width="58" height="30" rx="5"/><text class="bt xs" x="181" y="133" text-anchor="middle" dominant-baseline="central">49</text></g>
  <g class="n k"><rect x="214" y="118" width="58" height="30" rx="5"/><text class="bt xs" x="243" y="133" text-anchor="middle" dominant-baseline="central">65</text></g>
  <g class="n k"><rect x="276" y="118" width="58" height="30" rx="5"/><text class="bt xs" x="305" y="133" text-anchor="middle" dominant-baseline="central">97</text></g>
  <g class="n g"><rect x="338" y="118" width="58" height="30" rx="5"/><text class="bt xs" x="367" y="133" text-anchor="middle" dominant-baseline="central">13</text></g>
  <g class="n g"><rect x="400" y="118" width="58" height="30" rx="5"/><text class="bt xs" x="429" y="133" text-anchor="middle" dominant-baseline="central">27</text></g>
  <g class="n g"><rect x="462" y="118" width="58" height="30" rx="5"/><text class="bt xs" x="491" y="133" text-anchor="middle" dominant-baseline="central">76</text></g>
  <text class="cap" x="14" y="176">第 3 趟</text>
  <g class="n a"><rect x="90" y="160" width="58" height="30" rx="5"/><text class="bt xs" x="119" y="175" text-anchor="middle" dominant-baseline="central">13</text></g>
  <g class="n a"><rect x="152" y="160" width="58" height="30" rx="5"/><text class="bt xs" x="181" y="175" text-anchor="middle" dominant-baseline="central">27</text></g>
  <g class="n a"><rect x="214" y="160" width="58" height="30" rx="5"/><text class="bt xs" x="243" y="175" text-anchor="middle" dominant-baseline="central">38</text></g>
  <g class="n a"><rect x="276" y="160" width="58" height="30" rx="5"/><text class="bt xs" x="305" y="175" text-anchor="middle" dominant-baseline="central">49</text></g>
  <g class="n a"><rect x="338" y="160" width="58" height="30" rx="5"/><text class="bt xs" x="367" y="175" text-anchor="middle" dominant-baseline="central">65</text></g>
  <g class="n a"><rect x="400" y="160" width="58" height="30" rx="5"/><text class="bt xs" x="429" y="175" text-anchor="middle" dominant-baseline="central">76</text></g>
  <g class="n a"><rect x="462" y="160" width="58" height="30" rx="5"/><text class="bt xs" x="491" y="175" text-anchor="middle" dominant-baseline="central">97</text></g>
  <text class="cap" x="540" y="50">有序段长 1</text>
  <text class="cap" x="540" y="92">长 2（末尾余 1 个）</text>
  <text class="cap" x="540" y="134">长 4 和 长 3</text>
  <text class="cap" x="540" y="176">长 7，完成</text>
  <text class="cap" x="14" y="208">趟数 = ⌈log₂ 7⌉ = 3　　同色 = 同一个有序子表</text>
</svg>
` },

    { t: 'key', id: 'merge-complexity', title: '归并排序的复杂度', c: String.raw`
      | | 值 |
      |---|---|
      | 每趟归并的代价 | $O(n)$（每个元素被搬一次） |
      | 趟数 | $\lceil\log_2 n\rceil$ |
      | **时间** | ==最好、最坏、平均都是 $O(n\log n)$== |
      | **空间** | ==$O(n)$==（辅助数组 $B$；递归栈 $O(\log n)$ 被 $O(n)$ 吸收） |
      | **稳定性** | ==稳定== |

      **三个高频对比点**：

      1. ==归并排序是唯一一个"$O(n\log n)$ 且稳定"的常见内部排序==；
      2. ==它的时间复杂度与初始序列完全无关==（不像快排会退化）；
      3. ==它是唯一一个空间复杂度为 $O(n)$ 的常见排序==，这是它最大的代价。

      **$k$ 路归并**：每趟把 $k$ 个子表合成一个，趟数降为 ==$\lceil\log_k n\rceil$==。
      这在[外部排序](#/ds/sort/external?at=io-formulas)里至关重要 —— 趟数就是读写磁盘的遍数。

      **链表上的归并排序**：==可以做到 $O(1)$ 空间==（只改指针不用辅助数组），
      所以==归并排序是链表排序的首选==。这一点常被拿来和"快排/堆排不适合链表"对比。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'radix', c: '二、基数排序' },

    { t: 'key', id: 'radix-idea', title: '不比较大小，只按位分配和收集', c: String.raw`
      基数排序==不做任何两个关键字之间的比较==。
      它把关键字看成由 $d$ 位组成、每位取值范围为 $r$（**基数**）的数，
      然后做 $d$ 趟"分配 + 收集"：

      - **分配**：按当前位的值，把每个记录放进对应的队列（共 $r$ 个队列，编号 $0\sim r-1$）；
      - **收集**：==按队列编号从小到大==，把各队列首尾相接串起来。

      **最低位优先（LSD）**：==从最低位开始，做到最高位==。408 默认这一种。
      **最高位优先（MSD）**：从最高位开始，需要递归地对每个桶再排序，实现复杂。

      **LSD 为什么正确**：靠==每一趟的稳定性==。
      第 $k$ 趟按第 $k$ 位排序时，==前 $k-1$ 位的相对顺序被完整保留==，
      于是做完第 $d$ 趟，整体就按 $d$ 位字典序排好了。
      ==所以"分配收集必须稳定"是 LSD 的命根子==，
      收集时必须==保持队列内部的先后次序（先进先出）==。
    ` },

    { t: 'diagram', id: 'radix-pass1', title: '基数排序第 1 趟：按个位分配与收集',
      note: 'r = 10 个队列，队内先进先出',
      caption: String.raw`==收集时按队列编号 $0,1,2,\dots,9$ 依次串起来，队内保持入队顺序==。
      例如队列 8 里先入队的是 $278$、后入队的是 $8$，收集时 $278$ 就排在 $8$ 前面 ——
      ==这个"先来后到"就是稳定性，也是 LSD 能工作的唯一理由==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 214" role="img" aria-label="基数排序第一趟按个位分配到十个队列并收集">
  <g class="n p"><rect x="14" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="44" y="37" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n p"><rect x="82" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="112" y="37" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n p"><rect x="150" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="180" y="37" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n p"><rect x="218" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="248" y="37" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n p"><rect x="286" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="316" y="37" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n p"><rect x="354" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="384" y="37" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n p"><rect x="422" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="452" y="37" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n p"><rect x="490" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="520" y="37" text-anchor="middle" dominant-baseline="central">7</text></g>
  <g class="n p"><rect x="558" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="588" y="37" text-anchor="middle" dominant-baseline="central">8</text></g>
  <g class="n p"><rect x="626" y="24" width="60" height="26" rx="5"/><text class="bt xs" x="656" y="37" text-anchor="middle" dominant-baseline="central">9</text></g>
  <g class="n k"><rect x="14" y="56" width="60" height="26" rx="5"/><text class="bt xs" x="44" y="69" text-anchor="middle" dominant-baseline="central">930</text></g>
  <g class="n k"><rect x="218" y="56" width="60" height="26" rx="5"/><text class="bt xs" x="248" y="69" text-anchor="middle" dominant-baseline="central">63</text></g>
  <g class="n k"><rect x="218" y="86" width="60" height="26" rx="5"/><text class="bt xs" x="248" y="99" text-anchor="middle" dominant-baseline="central">83</text></g>
  <g class="n k"><rect x="286" y="56" width="60" height="26" rx="5"/><text class="bt xs" x="316" y="69" text-anchor="middle" dominant-baseline="central">184</text></g>
  <g class="n k"><rect x="354" y="56" width="60" height="26" rx="5"/><text class="bt xs" x="384" y="69" text-anchor="middle" dominant-baseline="central">505</text></g>
  <g class="n a"><rect x="558" y="56" width="60" height="26" rx="5"/><text class="bt xs" x="588" y="69" text-anchor="middle" dominant-baseline="central">278</text></g>
  <g class="n a"><rect x="558" y="86" width="60" height="26" rx="5"/><text class="bt xs" x="588" y="99" text-anchor="middle" dominant-baseline="central">8</text></g>
  <g class="n k"><rect x="626" y="56" width="60" height="26" rx="5"/><text class="bt xs" x="656" y="69" text-anchor="middle" dominant-baseline="central">109</text></g>
  <g class="n k"><rect x="626" y="86" width="60" height="26" rx="5"/><text class="bt xs" x="656" y="99" text-anchor="middle" dominant-baseline="central">589</text></g>
  <g class="n k"><rect x="626" y="116" width="60" height="26" rx="5"/><text class="bt xs" x="656" y="129" text-anchor="middle" dominant-baseline="central">269</text></g>
  <text class="lb em" x="588" y="128" text-anchor="middle">278 先入队</text>
  <text class="cap" x="14" y="164">紫 = 队列编号（个位的值）　　队列内自上而下 = 入队先后</text>
  <g class="n g"><rect x="14" y="176" width="672" height="30" rx="6"/><text class="bt sm" x="350" y="191" text-anchor="middle" dominant-baseline="central">收集结果：930  63  83  184  505  278  8  109  589  269</text></g>
</svg>
` },

    { t: 'key', id: 'radix-complexity', title: '基数排序的复杂度与适用条件', c: String.raw`
      | | 值 |
      |---|---|
      | **时间** | ==$O\big(d(n+r)\big)$== —— $d$ 趟，每趟分配 $O(n)$、收集 $O(r)$ |
      | **空间** | ==$O(r)$==（$r$ 个队列的头尾指针） |
      | **稳定性** | ==稳定==（而且必须稳定才正确） |
      | 与初始序列的关系 | ==完全无关==，恒定 $d$ 趟 |

      **三个适用条件**（简答题按这三条写）：

      1. ==关键字可以方便地拆分成 $d$ 个部分==，且 $d$ 较小；
      2. ==每一位的取值范围 $r$ 较小==（否则队列太多，空间和收集代价上升）；
      3. ==记录个数 $n$ 较大==（这样 $O(d(n+r))$ 才划算）。

      典型场景：==按日期（年/月/日）排序、按学号排序、字符串排序==。

      **注意 $O(d(n+r))$ 不是 $O(n)$**：当关键字互不相同时 $d\ge\log_r n$，
      所以基数排序==并没有突破"基于比较的排序至少 $O(n\log n)$"这个下界==
      —— 它只是==根本不做比较，因而不受这个下界约束==。
    ` },

    { t: 'example', id: 'ex-radix',
      title: '★ 基数排序三趟全过程',
      source: '经典手算题',
      level: 3,
      problem: String.raw`
        用**最低位优先**的基数排序对序列
        $\{278,\ 109,\ 63,\ 930,\ 589,\ 184,\ 505,\ 269,\ 8,\ 83\}$ 排序，
        写出每一趟分配收集之后的序列。
      `,
      idea: String.raw`
        ==位数不足的要在前面补 0==：$63\to 063$，$8\to 008$。
        不补 0 的话第 2、3 趟很容易把它们放错桶。

        每趟只做两件事：==按当前位把数依次放进 10 个桶==（**按原序列的顺序放**），
        ==再按桶号 0→9 顺序倒出来==。

        ==桶内的顺序绝不能动==，这是全部正确性的来源。
      `,
      solution: String.raw`
        补齐三位：$278,\ 109,\ 063,\ 930,\ 589,\ 184,\ 505,\ 269,\ 008,\ 083$

        **第 1 趟（按个位）**

        | 桶 | 0 | 3 | 4 | 5 | 8 | 9 |
        |---|---|---|---|---|---|---|
        | 内容 | 930 | 63, 83 | 184 | 505 | 278, 8 | 109, 589, 269 |

        $$\Rightarrow\ 930,\ 63,\ 83,\ 184,\ 505,\ 278,\ 8,\ 109,\ 589,\ 269$$

        **第 2 趟（按十位）**

        | 桶 | 0 | 3 | 6 | 7 | 8 |
        |---|---|---|---|---|---|
        | 内容 | 505, 8, 109 | 930 | 63, 269 | 278 | 83, 184, 589 |

        $$\Rightarrow\ 505,\ 8,\ 109,\ 930,\ 63,\ 269,\ 278,\ 83,\ 184,\ 589$$

        **第 3 趟（按百位）**

        | 桶 | 0 | 1 | 2 | 5 | 9 |
        |---|---|---|---|---|---|
        | 内容 | 8, 63, 83 | 109, 184 | 269, 278 | 505, 589 | 930 |

        $$\Rightarrow\ 8,\ 63,\ 83,\ 109,\ 184,\ 269,\ 278,\ 505,\ 589,\ 930$$

        排序完成。共 $d=3$ 趟，$r=10$ 个队列。
      `,
      comment: String.raw`
        **看第 3 趟的桶 0**：里面是 $8,\,63,\,83$，==它们已经是有序的==。
        这不是巧合 —— 它们的百位都是 0，而前两趟已经把十位和个位排好了，
        ==稳定的收集把这个顺序原封不动地带了过来==。
        ==这就是 LSD 正确性的直观证据==。

        **三个高频错误**：
        1. ==位数不足不补 0==，导致 $8$ 在第 2 趟被当成十位是 8；
        2. ==收集时把桶内的顺序倒过来==（写成后进先出），整个算法立刻失效；
        3. ==从最高位开始做却按 LSD 的方式收集==。MSD 必须递归处理每个桶，
           不能简单地一趟接一趟。

        **一个常考的变形**：若关键字是 $5$ 位十进制数、$n=10^6$，
        则 $d=5$、$r=10$，时间约 $5\times(10^6+10)$ —— ==比 $n\log_2 n\approx 2\times 10^7$ 还快==。
        这就是基数排序在特定场合的价值。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '三、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **归并排序的空间答成 $O(1)$** —— ==顺序表上是 $O(n)$==（链表上才能 $O(1)$）。
      2. **归并的趟数答成 $\log_2 n$** —— ==要向上取整 $\lceil\log_2 n\rceil$==。
      3. **$\texttt{Merge}$ 里比较不带等号** —— ==归并排序会变得不稳定==。
      4. **说归并排序在有序时更快** —— ==时间与初始序列无关，恒 $O(n\log n)$==。
      5. **说基数排序是 $O(n)$** —— ==是 $O(d(n+r))$==。
      6. **基数排序位数不补齐**。
      7. **收集时不保持队内先后次序** —— LSD 会直接算错。
      8. **认为基数排序不稳定** —— ==它必须稳定，也确实稳定==。
      9. **认为基数排序打破了 $\Omega(n\log n)$ 下界** —— ==那个下界只约束"基于比较"的排序==。
      10. **$k$ 路归并的趟数写成 $\lceil\log_2 n\rceil$** —— ==是 $\lceil\log_k n\rceil$==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '四、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      这两个算法有一个共同点值得记住：==它们的运行时间和数据长什么样完全无关==。

      归并每趟必扫全表、基数每趟必分配收集，==没有"提前结束"的可能==。
      好处是==最坏情况有保证==（不像快排会退化到 $O(n^2)$），
      坏处是==已经有序的数据也占不到便宜==（不像插入和冒泡有 $O(n)$ 的最好情况）。

      =="要不要利用初始有序性"是排序算法选型的一条重要分界线==。
    ` },

  ],
});
