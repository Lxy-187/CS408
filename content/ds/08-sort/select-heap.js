/* ==========================================================================
   数据结构 / 8 排序 / 选择类排序与堆
   ========================================================================== */

KM.page({
  path: 'ds/sort/select-heap',
  title: '选择类排序与堆',
  subtitle: '简单选择排序为什么慢，以及堆如何把「每次找最大」从 $O(n)$ 降到 $O(\\log n)$',
  tags: ['高频', '必考', '手算', '代码题'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'simple', c: '一、简单选择排序' },

    { t: 'key', id: 'select-idea', title: '思想与它的三个固定数字', c: String.raw`
      第 $i$ 趟：==在剩下的 $n-i+1$ 个元素中选出最小的==，和第 $i$ 个位置交换。
      $n-1$ 趟之后完成。

      **不变式**：第 $i$ 趟结束后，==前 $i$ 个元素已经是全局最小的 $i$ 个，且已到达最终位置==。
      （对照[插入类](#/ds/sort/insert-swap?at=insert-idea)：那里的前 $i$ 个只是"局部有序"，还会被挤走。）

      | | 值 |
      |---|---|
      | **比较次数** | ==恒为 $\dfrac{n(n-1)}{2}$==，与初始序列**无关** |
      | **移动（交换）次数** | 最好 $0$，最坏 $3(n-1)$ |
      | **时间** | ==最好、最坏、平均都是 $O(n^2)$== |
      | **空间** | $O(1)$ |
      | **稳定性** | ==不稳定== |

      =="比较次数与初始序列无关"是简单选择排序的标志性特征==，
      在"哪个算法的比较次数与初始状态无关"这类题里，
      答案是==简单选择排序==和==折半插入排序==（后者只有比较次数无关，移动次数仍与初始状态有关）。
    ` },

    { t: 'code', id: 'select-code', title: '简单选择排序', lang: 'c',
      c: String.raw`
        void SelectSort(ElemType A[], int n) {
            for (int i = 0; i < n - 1; i++) {
                int min = i;
                for (int j = i + 1; j < n; j++)
                    if (A[j] < A[min]) min = j;       // 只记下标，不交换
                if (min != i) swap(A[i], A[min]);     // 一趟只交换一次
            }
        }
      ` },

    { t: 'warn', id: 'select-unstable', title: '简单选择排序为什么不稳定', c: String.raw`
      反例只要三个元素：$\{2,\ 2^*,\ 1\}$。

      第一趟找到最小的 $1$（下标 2），与下标 0 的 $2$ ==交换==：

      $$\{2,\ 2^*,\ 1\}\ \longrightarrow\ \{1,\ 2^*,\ 2\}$$

      原来 $2$ 在 $2^*$ 前面，现在 ==$2^*$ 跑到了 $2$ 前面==。

      根本原因：==交换是"远距离"的，会把某个元素直接扔过一堆与它相等的元素==。
      ==凡是含远距离交换的排序（选择、希尔、快排、堆排）都不稳定==，
      这是一条很好用的记忆线索。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'heap', c: '二、堆' },

    { t: 'key', id: 'heap-def', title: '堆的定义：用数组表示的完全二叉树', c: String.raw`
      **大根堆**：满足 $A[i]\ge A[2i]$ 且 $A[i]\ge A[2i+1]$（下标从 1 开始）；
      **小根堆**：把 $\ge$ 换成 $\le$。

      堆用[完全二叉树的顺序存储](#/ds/tree/properties?at=index-rule)实现，
      于是父子关系退化成算术：==父 $\lfloor i/2\rfloor$、左 $2i$、右 $2i+1$==。

      **三条必须分清的性质**：

      1. ==堆只保证"父 $\ge$ 子"，不保证兄弟之间、也不保证任意两个结点之间的大小关系==。
         所以==堆不是二叉排序树==，它的中序遍历==没有任何有序性==。
      2. ==大根堆的堆顶是全局最大值==；但"第二大"只可能是堆顶的两个孩子之一，
         "第三大"就说不准了。
      3. ==大根堆从根到任一叶子的路径上是递减的==；
         **推论**：大根堆的==最小值一定是某个叶子==，
         而叶子是编号 $>\lfloor n/2\rfloor$ 的那些，==只需在后一半里找==。
    ` },

    { t: 'code', id: 'adjust-down', title: '向下调整（筛选 / 下沉）', lang: 'c',
      note: '堆排序的核心操作，必须能默写',
      c: String.raw`
        // 把以 k 为根的子树调整成大根堆（假定它的左右子树已经是堆）
        void AdjustDown(ElemType A[], int k, int len) {
            A[0] = A[k];                              // A[0] 暂存
            for (int i = 2 * k; i <= len; i *= 2) {   // 沿关键字较大的孩子往下
                if (i < len && A[i] < A[i+1]) i++;    // 取较大的那个孩子
                if (A[0] >= A[i]) break;              // 已经满足堆性质
                A[k] = A[i];                          // 孩子上移
                k = i;                                // 继续往下筛
            }
            A[k] = A[0];                              // 落位
        }

        void BuildMaxHeap(ElemType A[], int len) {
            for (int i = len / 2; i > 0; i--)         // 从最后一个分支结点开始
                AdjustDown(A, i, len);
        }
      ` },

    { t: 'key', id: 'build-heap', title: '★ 建堆：为什么从 $\\lfloor n/2\\rfloor$ 开始，为什么是 $O(n)$', c: String.raw`
      **为什么从 $\lfloor n/2\rfloor$ 开始**：
      [完全二叉树中编号 $>\lfloor n/2\rfloor$ 的结点全是叶子](#/ds/tree/properties?at=complete-counts)，
      ==单个叶子天然就是一个合法的堆==，不需要调整。
      所以只需处理编号 $1\sim\lfloor n/2\rfloor$ 的分支结点。

      **为什么必须倒着来（从后往前）**：
      $\texttt{AdjustDown}$ 的前提是==左右子树已经是堆==。
      从后往前处理，轮到结点 $i$ 时它的两棵子树（编号更大）都已处理完毕。
      ==正着来是错的==。

      **为什么是 $O(n)$ 而不是 $O(n\log n)$**：
      调整一个结点的代价是==它的高度==，而不是树高。
      高度为 $h$ 的结点至多有 $\lceil n/2^{h+1}\rceil$ 个，总代价

      $$\sum_{h=0}^{\lfloor\log_2 n\rfloor} \frac{n}{2^{h+1}}\cdot h \;\le\; n\sum_{h=0}^{\infty}\frac{h}{2^{h+1}}=n$$

      直觉版：==绝大多数结点都在底层，而底层结点几乎不用调整==；
      需要下沉很多层的结点只有寥寥几个。
    ` },

    { t: 'diagram', id: 'build-demo', title: '建大根堆：从最后一个分支结点开始往前调',
      note: '序列 53 17 78 9 45 65 87 23',
      caption: String.raw`调整顺序是 ==$i=4,\,3,\,2,\,1$==（$\lfloor 8/2\rfloor=4$）。
      结点 $5\sim 8$ 是叶子，==本身就是合法的堆，跳过==。
      注意结点 $1$（$53$）一路下沉了两层：$53$ 先被 $87$ 顶掉，到位置 3 后又被 $78$ 顶掉，
      最终落在位置 7 —— ==$\texttt{AdjustDown}$ 是"一路筛到底"，不是只换一层==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 232" role="img" aria-label="从初始序列建成大根堆的前后对比">
  <text class="cap" x="14" y="16">初始（完全二叉树，还不是堆）</text>
  <path class="ar plain" d="M165,30 L85,86"/><path class="ar plain" d="M165,30 L245,86"/>
  <path class="ar plain" d="M85,86 L45,142"/><path class="ar plain" d="M85,86 L125,142"/>
  <path class="ar plain" d="M245,86 L205,142"/><path class="ar plain" d="M245,86 L285,142"/>
  <path class="ar plain" d="M45,142 L25,198"/>
  <g class="n r"><rect x="150" y="15" width="30" height="30" rx="15"/><text class="bt xs" x="165" y="30" text-anchor="middle" dominant-baseline="central">53</text></g>
  <g class="n k"><rect x="70" y="71" width="30" height="30" rx="15"/><text class="bt xs" x="85" y="86" text-anchor="middle" dominant-baseline="central">17</text></g>
  <g class="n k"><rect x="230" y="71" width="30" height="30" rx="15"/><text class="bt xs" x="245" y="86" text-anchor="middle" dominant-baseline="central">78</text></g>
  <g class="n k"><rect x="30" y="127" width="30" height="30" rx="15"/><text class="bt xs" x="45" y="142" text-anchor="middle" dominant-baseline="central">9</text></g>
  <g class="n m"><rect x="110" y="127" width="30" height="30" rx="15"/><text class="bt xs" x="125" y="142" text-anchor="middle" dominant-baseline="central">45</text></g>
  <g class="n m"><rect x="190" y="127" width="30" height="30" rx="15"/><text class="bt xs" x="205" y="142" text-anchor="middle" dominant-baseline="central">65</text></g>
  <g class="n m"><rect x="270" y="127" width="30" height="30" rx="15"/><text class="bt xs" x="285" y="142" text-anchor="middle" dominant-baseline="central">87</text></g>
  <g class="n m"><rect x="10" y="183" width="30" height="30" rx="15"/><text class="bt xs" x="25" y="198" text-anchor="middle" dominant-baseline="central">23</text></g>
  <text class="lb" x="150" y="210">灰 = 叶子，不用调整</text>
  <path class="sep" d="M345,20 V212"/>
  <text class="cap" x="384" y="16">建堆后（大根堆）</text>
  <path class="ar plain" d="M535,30 L455,86"/><path class="ar plain" d="M535,30 L615,86"/>
  <path class="ar plain" d="M455,86 L415,142"/><path class="ar plain" d="M455,86 L495,142"/>
  <path class="ar plain" d="M615,86 L575,142"/><path class="ar plain" d="M615,86 L655,142"/>
  <path class="ar plain" d="M415,142 L395,198"/>
  <g class="n a"><rect x="520" y="15" width="30" height="30" rx="15"/><text class="bt xs" x="535" y="30" text-anchor="middle" dominant-baseline="central">87</text></g>
  <g class="n g"><rect x="440" y="71" width="30" height="30" rx="15"/><text class="bt xs" x="455" y="86" text-anchor="middle" dominant-baseline="central">45</text></g>
  <g class="n g"><rect x="600" y="71" width="30" height="30" rx="15"/><text class="bt xs" x="615" y="86" text-anchor="middle" dominant-baseline="central">78</text></g>
  <g class="n g"><rect x="400" y="127" width="30" height="30" rx="15"/><text class="bt xs" x="415" y="142" text-anchor="middle" dominant-baseline="central">23</text></g>
  <g class="n g"><rect x="480" y="127" width="30" height="30" rx="15"/><text class="bt xs" x="495" y="142" text-anchor="middle" dominant-baseline="central">17</text></g>
  <g class="n g"><rect x="560" y="127" width="30" height="30" rx="15"/><text class="bt xs" x="575" y="142" text-anchor="middle" dominant-baseline="central">65</text></g>
  <g class="n r"><rect x="640" y="127" width="30" height="30" rx="15"/><text class="bt xs" x="655" y="142" text-anchor="middle" dominant-baseline="central">53</text></g>
  <g class="n g"><rect x="380" y="183" width="30" height="30" rx="15"/><text class="bt xs" x="395" y="198" text-anchor="middle" dominant-baseline="central">9</text></g>
  <text class="lb em" x="530" y="210">53 从根一路下沉到了位置 7</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'heapsort', c: '三、堆排序' },

    { t: 'steps', id: 'heapsort-steps', title: '堆排序的两个阶段', items: [
      { title: '建初始大根堆', c: String.raw`从 $\lfloor n/2\rfloor$ 到 $1$ 依次 $\texttt{AdjustDown}$，代价 ==$O(n)$==。` },
      { title: '反复"摘堆顶"', c: String.raw`把==堆顶（当前最大值）与当前堆的最后一个元素交换==，
        堆的长度减 1（被换下去的最大值就此固定在数组末尾），
        再对新堆顶做一次 $\texttt{AdjustDown}$。重复 $n-1$ 次。` },
      { title: '结果', c: String.raw`==用大根堆排出来的是递增序列==（最大的先被放到最后）。
        要递减序列就用小根堆。==这一点极易记反==。` },
    ] },

    { t: 'code', id: 'heapsort-code', title: '堆排序', lang: 'c',
      c: String.raw`
        void HeapSort(ElemType A[], int len) {
            BuildMaxHeap(A, len);
            for (int i = len; i > 1; i--) {
                swap(A[i], A[1]);          // 堆顶换到当前末尾
                AdjustDown(A, 1, i - 1);   // 对剩下的 i-1 个重新调整
            }
        }
      ` },

    { t: 'key', id: 'heapsort-complexity', title: '堆排序的复杂度与特点', c: String.raw`
      | | 值 |
      |---|---|
      | 建堆 | $O(n)$ |
      | $n-1$ 次调整 | $(n-1)\times O(\log n)=O(n\log n)$ |
      | **总时间** | ==最好、最坏、平均都是 $O(n\log n)$== |
      | **空间** | ==$O(1)$== |
      | **稳定性** | ==不稳定== |

      **三个爱考的对比点**：

      1. ==堆排序是唯一一个"时间 $O(n\log n)$ 且空间 $O(1)$"的算法==。
         快排空间 $O(\log n)$，归并空间 $O(n)$。
      2. ==堆排序的最坏情况也是 $O(n\log n)$==，比快排稳健；
         但常数因子大，==实际平均速度不如快排==。
      3. **特别适合 Top-$k$ 问题**：从 $n$ 个数里找最大的 $k$ 个，
         用小根堆维护 $k$ 个元素，时间 $O(n\log k)$；
         或者建大根堆后摘 $k$ 次，时间 ==$O(n+k\log n)$==。
         ==$k$ 很小时远优于完整排序==。

      **堆的其他用途**：优先级队列（操作系统的进程调度）、
      [哈夫曼树构造时每次取两个最小值](#/ds/tree/huffman?at=build-steps)。
    ` },

    { t: 'key', id: 'insert-delete', title: '堆的插入与删除', c: String.raw`
      **插入**：新元素放在数组末尾（完全二叉树的最后一个位置），
      然后==向上调整（$\texttt{AdjustUp}$，"上浮"）==：
      不断与父结点比较，比父大就交换，直到不再大于父或到达根。代价 ==$O(\log n)$==。

      **删除（只能删堆顶）**：==用最后一个元素填到堆顶==，堆长度减 1，
      然后对堆顶做一次==向下调整==。代价 ==$O(\log n)$==。

      ~~~c
      void AdjustUp(ElemType A[], int k) {
          A[0] = A[k];
          int i = k / 2;                    // 父结点
          while (i > 0 && A[i] < A[0]) {
              A[k] = A[i];
              k = i;
              i = k / 2;
          }
          A[k] = A[0];
      }
      ~~~

      ==注意"删除任意元素"也是可以的==：用最后一个元素覆盖它，
      然后==根据它比原值大还是小，决定上浮还是下沉==。
    ` },

    { t: 'example', id: 'ex-heapsort',
      title: '★ 建堆 + 堆排序前两趟',
      source: '经典手算题',
      level: 3,
      problem: String.raw`
        对序列 $\{53,\ 17,\ 78,\ 9,\ 45,\ 65,\ 87,\ 23\}$：

        (1) 建立初始**大根堆**，写出调整顺序与结果；
        (2) 写出堆排序前两趟之后的数组状态。
      `,
      idea: String.raw`
        ==建堆一定要在纸上画成树==，光看数组很容易把父子关系搞错。

        调整时记住两步：==先在两个孩子里挑大的==，==再和父比==。
        很多人漏了第一步，直接拿左孩子和父比，结果就错了。

        (2) 每一趟只做两件事：==交换堆顶和当前末尾==、==对堆顶下沉一次==。
        被换到末尾的元素==从此不再参与==，记得把它划出堆的范围。
      `,
      solution: String.raw`
        下标从 1 开始，$n=8$，$\lfloor n/2\rfloor=4$，故调整顺序为 $i=4,3,2,1$。

        **(1) 建堆**

        | $i$ | 该结点 | 较大的孩子 | 动作 | 调整后数组 |
        |---|---|---|---|---|
        | 初始 | — | — | — | 53 17 78 9 45 65 87 23 |
        | 4 | 9 | 23（下标 8） | $9<23$，交换 | 53 17 78 **23** 45 65 87 **9** |
        | 3 | 78 | 87（下标 7） | $78<87$，交换 | 53 17 **87** 23 45 65 **78** 9 |
        | 2 | 17 | 45（下标 5） | $17<45$，交换 | 53 **45** 87 23 **17** 65 78 9 |
        | 1 | 53 | 87（下标 3） | $53<87$ → 87 上移，53 下沉到位置 3；<br>位置 3 的孩子中 78 较大且 $53<78$ → 78 上移，53 落到位置 7 | **87** 45 **78** 23 17 65 **53** 9 |

        $$\text{初始大根堆}=\{87,\ 45,\ 78,\ 23,\ 17,\ 65,\ 53,\ 9\}$$

        校验：$87\ge 45,78$；$45\ge 23,17$；$78\ge 65,53$；$23\ge 9$ ✓

        **(2) 堆排序**

        **第 1 趟**：交换 $A[1]=87$ 与 $A[8]=9$ →
        $\{9,45,78,23,17,65,53\ \mid\ 87\}$，对前 7 个 $\texttt{AdjustDown}$：

        - 根 $9$ 的孩子是 $45,78$，较大的是 $78$ → $78$ 上移，$9$ 到位置 3；
        - 位置 3 的孩子是 $65,53$，较大的是 $65$ → $65$ 上移，$9$ 落到位置 6。

        $$\{78,\ 45,\ 65,\ 23,\ 17,\ 9,\ 53\ \mid\ 87\}$$

        **第 2 趟**：交换 $A[1]=78$ 与 $A[7]=53$ →
        $\{53,45,65,23,17,9\ \mid\ 78,87\}$，对前 6 个调整：

        - 根 $53$ 的孩子是 $45,65$，较大的是 $65$ → $65$ 上移，$53$ 到位置 3；
        - 位置 3 只有左孩子 $9$，$53\ge 9$ → 停止。

        $$\{65,\ 45,\ 53,\ 23,\ 17,\ 9\ \mid\ 78,\ 87\}$$
      `,
      comment: String.raw`
        **三个自查**：

        1. ==每趟之后，竖线右边的部分必须是递增的==（$78,87$ ✓）；
        2. ==竖线左边必须仍是一个合法的大根堆==；
        3. ==右边元素的个数 = 已完成的趟数==。

        **最常见的三个错**：
        1. ==调整时只和左孩子比==。必须先在两个孩子中选大的。
        2. ==只交换一层就停==。$\texttt{AdjustDown}$ 要一路筛到底
           （本题建堆的 $i=1$ 那步就下沉了两层）。
        3. ==忘了缩小堆的范围==。第 1 趟之后 $87$ 已经出堆，
           后续调整的 $len$ 必须是 $7$ 而不是 $8$。

        **顺带一提**：本题中 $9$ 在建堆后位于下标 8（叶子），
        符合[大根堆的最小值一定在叶子上](#/ds/sort/select-heap?at=heap-def)这条性质。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '四、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **说简单选择排序稳定** —— ==不稳定==，反例 $\{2,2^*,1\}$。
      2. **说简单选择排序在有序时更快** —— ==比较次数恒为 $\frac{n(n-1)}{2}$，与初始序列无关==。
      3. **把堆当成二叉排序树** —— ==堆的中序遍历没有任何有序性==。
      4. **建堆从下标 1 开始正着调** —— ==必须从 $\lfloor n/2\rfloor$ 倒着调==。
      5. **说建堆是 $O(n\log n)$** —— ==建堆是 $O(n)$==，堆排序整体才是 $O(n\log n)$。
      6. **大根堆排出降序** —— ==大根堆排出的是**升序**==。
      7. **调整时只和左孩子比较** —— 要先在两个孩子里选大的。
      8. **$\texttt{AdjustDown}$ 只换一层** —— 要一路筛到叶子或满足堆性质为止。
      9. **堆排序每趟后忘了缩小堆的长度**。
      10. **说堆排序空间是 $O(\log n)$** —— ==是 $O(1)$==（迭代实现，不递归）。
      11. **认为大根堆的第二大元素是 $A[2]$** —— ==只能说它在 $A[2]$ 或 $A[3]$ 中==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '五、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      堆排序其实就是==给简单选择排序装了个"记忆"==：

      简单选择排序每趟都==重新扫一遍找最大值==，前一趟比较得到的信息全丢了，
      所以 $n$ 趟共 $O(n^2)$ 次比较。

      堆把"谁比谁大"的部分结果==保存在树形结构里==，
      摘掉堆顶之后==只需要 $O(\log n)$ 就能恢复==，于是总代价降到 $O(n\log n)$。

      ==这是"用结构换时间"最典型的一个例子==。
    ` },

  ],
});
