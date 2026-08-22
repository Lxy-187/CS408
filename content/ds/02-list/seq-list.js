/* ==========================================================================
   数据结构 / 2 线性表 / 顺序表：插入删除与扩容
   ========================================================================== */

KM.page({
  path: 'ds/list/seq-list',
  title: '顺序表',
  subtitle: '用"物理相邻"表达"逻辑相邻" —— 换来 $O(1)$ 的随机存取，代价是每次增删都要挪一堆元素',
  tags: ['必考', '手算', '代码题'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'linear-list', c: '一、线性表的定义' },

    { t: 'key', id: 'def', title: '定义与五个特性', c: String.raw`
      **线性表**是具有==相同数据类型==的 $n\ (n\ge 0)$ 个数据元素的==有限序列==：

      $$L=(a_1,\ a_2,\ \dots,\ a_n)$$

      五个特性：

      1. ==有限==（元素个数有限）；
      2. ==有序==（这里的"序"指位置次序，==不是值的大小顺序==）；
      3. 元素==数据类型相同==，每个元素占同样大小的空间；
      4. ==抽象==（只讨论元素间的逻辑关系，不管元素具体是什么）；
      5. 除第一个元素外每个元素==有且仅有一个直接前驱==，
         除最后一个元素外每个元素==有且仅有一个直接后继==。

      **两个约定**（考试里出现频率极高）：
      - ==位序从 1 开始==（第 1 个元素、第 $i$ 个元素）；
      - ==数组下标从 0 开始==。
      所以"第 $i$ 个元素"存在 $\texttt{data[i-1]}$ 里，==这个差 1 是本页所有代码的错误来源==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'seq', c: '二、顺序表的定义与两种分配方式' },

    { t: 'code', id: 'seq-def', title: '静态分配与动态分配', lang: 'c',
      note: '两者的差别只在"能不能扩容"',
      c: String.raw`
        /* 静态分配：数组大小编译期定死 */
        #define MaxSize 50
        typedef struct {
            ElemType data[MaxSize];
            int length;                       // 当前长度
        } SqList;

        /* 动态分配：运行期 malloc，可以换更大的一块 */
        #define InitSize 10
        typedef struct {
            ElemType *data;                   // 指向动态数组的指针
            int MaxSize;                      // 当前容量
            int length;                       // 当前长度
        } SeqList;

        void InitList(SeqList *L) {
            L->data = (ElemType *)malloc(InitSize * sizeof(ElemType));
            L->length  = 0;
            L->MaxSize = InitSize;
        }
      ` },

    { t: 'warn', id: 'dynamic-not-linked', title: '"动态分配"不等于"链式存储"', c: String.raw`
      这是一个几乎每年都考的辨析：

      ==动态分配的顺序表仍然是**顺序存储**==。
      它只是把"一整块连续空间"从静态数组换成了 $\texttt{malloc}$ 出来的一块，
      ==元素之间依然物理相邻、依然可以随机存取==。

      "动态"指的是==容量可以在运行时改变==，
      ==不是=="元素可以分散存放"。真正分散存放的是[链表](#/ds/list/linked-list?at=node-def)。
    ` },

    { t: 'key', id: 'random-access', title: '随机存取：地址可以直接算出来', c: String.raw`
      设每个元素占 $L$ 个存储单元，第 1 个元素的地址为 $\mathrm{LOC}(a_1)$，则

      $$\mathrm{LOC}(a_i)=\mathrm{LOC}(a_1)+(i-1)\times L$$

      因为地址==一步算得==，所以按位查找是 ==$O(1)$==，这叫**随机存取**。

      **按值查找**则必须一个个比，==$O(n)$==（平均比较 $\frac{n+1}{2}$ 次）。

      =="随机存取"说的是"按位置取"，不是"按值找"== —— 这两件事经常被混为一谈。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'insert-delete', c: '三、插入与删除：代价全在"挪"上' },

    { t: 'diagram', id: 'insert-demo', title: '在第 4 个位置插入 40',
      note: '从后往前挪，绝不能从前往后',
      caption: String.raw`==必须从最后一个元素开始往后挪==：先把 $62$ 挪到空位，再挪 $58$，最后挪 $47$。
      如果从前往后挪（先挪 $47$），$47$ 会==直接覆盖掉 $58$==，数据就丢了。
      这是顺序表插入代码里唯一真正会写错的地方。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 208" role="img" aria-label="顺序表在第四个位置插入元素时的后移过程">
  <text class="cap" x="14" y="30">插入前</text>
  <g class="n k"><rect x="90" y="16" width="58" height="34" rx="5"/><text class="bt xs" x="119" y="33" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n k"><rect x="152" y="16" width="58" height="34" rx="5"/><text class="bt xs" x="181" y="33" text-anchor="middle" dominant-baseline="central">25</text></g>
  <g class="n k"><rect x="214" y="16" width="58" height="34" rx="5"/><text class="bt xs" x="243" y="33" text-anchor="middle" dominant-baseline="central">33</text></g>
  <g class="n g"><rect x="276" y="16" width="58" height="34" rx="5"/><text class="bt xs" x="305" y="33" text-anchor="middle" dominant-baseline="central">47</text></g>
  <g class="n g"><rect x="338" y="16" width="58" height="34" rx="5"/><text class="bt xs" x="367" y="33" text-anchor="middle" dominant-baseline="central">58</text></g>
  <g class="n g"><rect x="400" y="16" width="58" height="34" rx="5"/><text class="bt xs" x="429" y="33" text-anchor="middle" dominant-baseline="central">62</text></g>
  <g class="n m"><rect x="462" y="16" width="58" height="34" rx="5"/><text class="bt xs" x="491" y="33" text-anchor="middle" dominant-baseline="central">　</text></g>
  <g class="n m"><rect x="524" y="16" width="58" height="34" rx="5"/><text class="bt xs" x="553" y="33" text-anchor="middle" dominant-baseline="central">　</text></g>
  <path class="ar em" d="M429,58 Q460,84 491,60"/>
  <path class="ar em" d="M367,58 Q398,84 429,60"/>
  <path class="ar em" d="M305,58 Q336,84 367,60"/>
  <text class="lb em" x="398" y="100" text-anchor="middle">① 62 先挪　② 再挪 58　③ 最后挪 47</text>
  <text class="cap" x="14" y="146">插入后</text>
  <g class="n k"><rect x="90" y="132" width="58" height="34" rx="5"/><text class="bt xs" x="119" y="149" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n k"><rect x="152" y="132" width="58" height="34" rx="5"/><text class="bt xs" x="181" y="149" text-anchor="middle" dominant-baseline="central">25</text></g>
  <g class="n k"><rect x="214" y="132" width="58" height="34" rx="5"/><text class="bt xs" x="243" y="149" text-anchor="middle" dominant-baseline="central">33</text></g>
  <g class="n a"><rect x="276" y="132" width="58" height="34" rx="5"/><text class="bt xs" x="305" y="149" text-anchor="middle" dominant-baseline="central">40</text></g>
  <g class="n g"><rect x="338" y="132" width="58" height="34" rx="5"/><text class="bt xs" x="367" y="149" text-anchor="middle" dominant-baseline="central">47</text></g>
  <g class="n g"><rect x="400" y="132" width="58" height="34" rx="5"/><text class="bt xs" x="429" y="149" text-anchor="middle" dominant-baseline="central">58</text></g>
  <g class="n g"><rect x="462" y="132" width="58" height="34" rx="5"/><text class="bt xs" x="491" y="149" text-anchor="middle" dominant-baseline="central">62</text></g>
  <g class="n m"><rect x="524" y="132" width="58" height="34" rx="5"/><text class="bt xs" x="553" y="149" text-anchor="middle" dominant-baseline="central">　</text></g>
  <text class="lb" x="119" y="190">位序 1</text>
  <text class="lb" x="295" y="190">4</text>
  <text class="cap" x="596" y="34">length 6 → 7</text>
  <text class="cap" x="596" y="150">共移动 3 个元素</text>
</svg>
` },

    { t: 'code', id: 'insert-code', title: '插入与删除', lang: 'c',
      note: '注意 i 是位序（从 1 起），data 下标从 0 起',
      c: String.raw`
        bool ListInsert(SqList *L, int i, ElemType e) {
            if (i < 1 || i > L->length + 1) return false;   // 位序合法性
            if (L->length >= MaxSize) return false;         // 表满
            for (int j = L->length; j >= i; j--)            // ← 从后往前挪
                L->data[j] = L->data[j-1];
            L->data[i-1] = e;
            L->length++;
            return true;
        }

        bool ListDelete(SqList *L, int i, ElemType *e) {
            if (i < 1 || i > L->length) return false;       // 注意上界与插入不同
            *e = L->data[i-1];
            for (int j = i; j < L->length; j++)             // ← 从前往后挪
                L->data[j-1] = L->data[j];
            L->length--;
            return true;
        }
      ` },

    { t: 'warn', id: 'boundary', title: '★ 插入和删除的合法位序上界不一样', c: String.raw`
      $$\text{插入：}1\le i\le n+1,\qquad \text{删除：}1\le i\le n$$

      ==插入允许 $i=n+1$==（在表尾追加是合法的），==删除不允许==（第 $n+1$ 个元素不存在）。

      **另外两个方向也要记牢**：
      - ==插入从后往前挪==（否则前面的会覆盖后面的）；
      - ==删除从前往后挪==（否则后面的会覆盖前面的）。

      口诀：=="插入倒着来，删除正着来"==。
    ` },

    { t: 'key', id: 'avg-move', title: '平均移动次数的推导（要会现推）', c: String.raw`
      **插入**：可插入的位置有 $n+1$ 个，等概率 $p=\frac{1}{n+1}$；
      在第 $i$ 个位置插入需移动 $n-i+1$ 个元素：

      $$E_{\text{插入}}=\sum_{i=1}^{n+1}\frac{1}{n+1}(n-i+1)
      =\frac{1}{n+1}\cdot\frac{n(n+1)}{2}=\boxed{\frac{n}{2}}$$

      **删除**：可删除的位置有 $n$ 个，等概率 $p=\frac{1}{n}$；
      删除第 $i$ 个需移动 $n-i$ 个元素：

      $$E_{\text{删除}}=\sum_{i=1}^{n}\frac{1}{n}(n-i)
      =\frac{1}{n}\cdot\frac{n(n-1)}{2}=\boxed{\frac{n-1}{2}}$$

      ==两个答案不一样，别记混==：插入是 $\frac{n}{2}$，删除是 $\frac{n-1}{2}$。
      时间复杂度都是 $O(n)$。

      **最好情况**：插入 / 删除==表尾==，移动 0 次，$O(1)$；
      **最坏情况**：插入 / 删除==表头==，移动 $n$（或 $n-1$）次，$O(n)$。
    ` },

    { t: 'key', id: 'expand', title: '动态扩容：为什么按"倍增"而不是"加固定值"', c: String.raw`
      扩容的动作是：==申请一块更大的空间 → 把原数据全部拷过去 → 释放原空间==。
      单次扩容的代价是 $O(n)$。

      **如果每次只加固定的 $c$ 个**：插入 $n$ 个元素要扩容 $n/c$ 次，
      总拷贝量 $\approx c+2c+\dots+n=O(n^2)$，==平均每次插入 $O(n)$==。

      **如果每次容量翻倍**：扩容发生在容量为 $1,2,4,\dots,n$ 时，
      总拷贝量 $1+2+4+\dots+n<2n=O(n)$，
      ==平均每次插入只有 $O(1)$==（这叫**摊还（amortized）$O(1)$**）。

      ==注意"摊还 $O(1)$"不等于"最坏 $O(1)$"== ——
      碰上扩容的那一次仍然是 $O(n)$，只是这种情况很少。
    ` },

    { t: 'code', id: 'expand-code', title: '扩容', lang: 'c',
      c: String.raw`
        void IncreaseSize(SeqList *L, int len) {
            ElemType *p = L->data;
            L->data = (ElemType *)malloc((L->MaxSize + len) * sizeof(ElemType));
            for (int i = 0; i < L->length; i++)
                L->data[i] = p[i];                // 逐个搬过去，O(n)
            L->MaxSize += len;
            free(p);                              // 别忘了释放旧空间
        }
      ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '四、例题' },

    { t: 'example', id: 'ex-del-x',
      title: '★ 删除顺序表中所有值为 $x$ 的元素（$O(n)$ 时间、$O(1)$ 空间）',
      source: '真题高频',
      level: 3,
      problem: String.raw`
        设计一个算法，从顺序表 $L$ 中删除所有值等于 $x$ 的元素，
        要求时间复杂度 $O(n)$、空间复杂度 $O(1)$。
      `,
      idea: String.raw`
        最直觉的写法是"找到一个 $x$ 就把后面的整体前移一位"，
        但那样==最坏是 $O(n^2)$==（$n$ 个元素全是 $x$ 时）。

        正确的思路是==把"删除"翻译成"重建"==：
        ==用一个计数器 $k$ 记录"到目前为止有几个该保留的元素"，
        遇到该保留的就写到下标 $k$ 处再让 $k{+}{+}$==。

        这样==每个元素只被读一次、最多被写一次==，天然 $O(n)$。
        这个"双指针原地压缩"的套路在数组题里通用，值得记死。
      `,
      solution: String.raw`
        ~~~c
        void del_x(SqList *L, ElemType x) {
            int k = 0;                                  // k = 已保留的元素个数
            for (int i = 0; i < L->length; i++)
                if (L->data[i] != x)
                    L->data[k++] = L->data[i];          // 保留它，写到前面去
            L->length = k;
        }
        ~~~

        **正确性**：循环不变式是"==$\texttt{data[0..k-1]}$ 恰好是 $\texttt{data[0..i-1]}$
        中所有不等于 $x$ 的元素，且保持原有相对次序=="。
        循环结束时 $i=n$，于是 $\texttt{data[0..k-1]}$ 就是答案。

        **复杂度**：一趟循环，时间 $O(n)$；只用了 $i,k$ 两个变量，空间 $O(1)$ ✓

        **另一种等价写法**（计数被删的个数，元素前移 $k$ 位）：

        ~~~c
        void del_x2(SqList *L, ElemType x) {
            int k = 0;                                  // k = 已遇到的 x 的个数
            for (int i = 0; i < L->length; i++) {
                if (L->data[i] == x) k++;
                else L->data[i - k] = L->data[i];       // 前移 k 位
            }
            L->length -= k;
        }
        ~~~
      `,
      comment: String.raw`
        **两种写法的对比**：
        第一种"$k$ 数保留的"更通用（改一下条件就能做"删除所有偶数""去重"等）；
        第二种"$k$ 数删除的"更贴近"移动"的直觉。==会一种即可，但要写对边界==。

        **常见错误**：
        1. ==写成 $\texttt{k++}$ 在 if 外面==，导致该保留的元素被跳过；
        2. ==忘记最后更新 $\texttt{L->length}$==，表长不对，后面的操作全乱；
        3. 边遍历边调用 $\texttt{ListDelete}$，==复杂度退化成 $O(n^2)$==。

        **同一套路的变形题**：
        "删除有序表中所有重复元素"（比较 $\texttt{data[k-1]}$ 与 $\texttt{data[i]}$）、
        "删除值在 $[s,t]$ 之间的元素"（把条件换成区间判断）。
      `,
    },

    { t: 'example', id: 'ex-rotate',
      title: '★ 循环左移 $p$ 位（2010 真题）',
      source: '2010 统考真题',
      level: 4,
      problem: String.raw`
        设将 $n\ (n>1)$ 个整数存放到一维数组 $R$ 中。
        设计一个在时间和空间两方面都尽可能高效的算法，
        将 $R$ 中保存的序列==循环左移 $p\ (0<p<n)$ 个位置==，
        即把 $R$ 中的数据由 $(X_0,X_1,\dots,X_{n-1})$ 变换为
        $(X_p,X_{p+1},\dots,X_{n-1},X_0,X_1,\dots,X_{p-1})$。
      `,
      idea: String.raw`
        最朴素的做法是"每次左移一位，做 $p$ 次"，时间 $O(np)$，太慢；
        或者"借一个长度为 $p$ 的辅助数组"，空间 $O(p)$，不够省。

        ==关键的观察是：把数组看成两段 $A=(X_0..X_{p-1})$ 和 $B=(X_p..X_{n-1})$，
        要的结果就是 $BA$==。而线性代数里有个恒等式：

        $$(A^{\mathrm{R}}B^{\mathrm{R}})^{\mathrm{R}}=BA$$

        （$X^{\mathrm{R}}$ 表示逆置。）于是==三次逆置==就够了，
        每次逆置都是原地的 $O(1)$ 空间。

        ==这个"三次逆置"是数组题里最漂亮的技巧之一==，
        字符串旋转、单词翻转用的都是它。
      `,
      solution: String.raw`
        ~~~c
        void Reverse(int R[], int from, int to) {
            for (int i = 0; i < (to - from + 1) / 2; i++) {
                int t = R[from + i];
                R[from + i] = R[to - i];
                R[to - i]   = t;
            }
        }

        void Converse(int R[], int n, int p) {
            Reverse(R, 0,   p - 1);        // 逆置前 p 个
            Reverse(R, p,   n - 1);        // 逆置后 n-p 个
            Reverse(R, 0,   n - 1);        // 整体逆置
        }
        ~~~

        **演示**（$n=10,\ p=3$）：

        | 步骤 | 数组 |
        |---|---|
        | 初始 | 1 2 3 ｜ 4 5 6 7 8 9 10 |
        | $\mathrm{Reverse}(0,2)$ | **3 2 1** ｜ 4 5 6 7 8 9 10 |
        | $\mathrm{Reverse}(3,9)$ | 3 2 1 ｜ **10 9 8 7 6 5 4** |
        | $\mathrm{Reverse}(0,9)$ | ==4 5 6 7 8 9 10 1 2 3== ✓ |

        **复杂度**：三次逆置各扫一遍，总共约 $\frac{p}{2}+\frac{n-p}{2}+\frac{n}{2}=n$ 次交换，
        ==时间 $O(n)$==；只用了常数个临时变量，==空间 $O(1)$== ✓
      `,
      comment: String.raw`
        **答题时要写清三件事**（真题按这三点给分）：
        1. **算法的基本设计思想**（就是上面那个 $(A^RB^R)^R=BA$）；
        2. **C 语言描述**；
        3. **时间与空间复杂度**。
        ==只写代码不写思想会丢一半分==。

        **常见错误**：
        1. ==$\mathrm{Reverse}$ 的循环上界写成 $\texttt{to-from}$== —— 应该是它的一半，
           写多了会把数组再翻回去；
        2. ==三次逆置的顺序颠倒==（先整体再局部也能成，但两段的边界要跟着换，容易乱）；
        3. 忘了 $p$ 可能大于 $n$ —— 本题限定 $0<p<n$，
           但如果题目没限定，==要先做 $p\ \%{=}\ n$==。

        **同类题**：循环**右**移 $p$ 位，等价于循环左移 $n-p$ 位。

        **另一种等价的三次逆置**（顺序反过来，一样对）：

        ~~~c
        void leftshift(int R[], int n, int p) {
            Reverse(R, 0,     n - 1);      // ① 先整体逆置
            Reverse(R, 0,     n - p - 1);  // ② 再逆置前 n−p 个
            Reverse(R, n - p, n - 1);      // ③ 最后逆置后 p 个
        }
        ~~~

        **演示**（$n=10,\ p=3$）：

        | 步骤 | 数组 |
        |---|---|
        | 初始 | 1 2 3 4 5 6 7 8 9 10 |
        | ① 整体逆置 | 10 9 8 7 6 5 4 ｜ 3 2 1 |
        | ② 逆置前 7 个 | **4 5 6 7 8 9 10** ｜ 3 2 1 |
        | ③ 逆置后 3 个 | 4 5 6 7 8 9 10 ｜ **1 2 3** ✓ |

        ==两种策略在数学上完全等价==：一个是 $(A^{\mathrm{R}}B^{\mathrm{R}})^{\mathrm{R}}$，
        另一个是 $\big((AB)^{\mathrm{R}}\big)$ 再分段逆置，
        操作次数、时间空间复杂度==一模一样==。
        ==会哪一种都行，但下标一定要跟着换==：
        先整体逆置的版本，分界点在 ==$n-p$== 而不是 $p$。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **位序与下标差 1 没处理** —— 第 $i$ 个元素是 $\texttt{data[i-1]}$。
      2. **插入和删除的合法上界记混** —— ==插入 $i\le n+1$，删除 $i\le n$==。
      3. **插入时从前往后挪** —— 会覆盖数据，==必须从后往前==。
      4. **平均移动次数记混** —— ==插入 $\frac{n}{2}$，删除 $\frac{n-1}{2}$==。
      5. **认为"动态分配"就是链式存储** —— ==仍是顺序存储==。
      6. **认为顺序表的插入一定是 $O(n)$** —— ==表尾插入是 $O(1)$==。
      7. **"随机存取"理解成"按值查找快"** —— 是==按位置存取快==。
      8. **删除元素时逐个调用 $\texttt{ListDelete}$** —— 退化成 $O(n^2)$。
      9. **扩容后忘了 $\texttt{free}$ 旧空间**，或忘了更新 $\texttt{MaxSize}$。
      10. **认为线性表的"有序"指值递增** —— 指的是==位置次序==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-rotate', title: '循环左移我用的是"先整体、后分段"', c: String.raw`
      我当时的基本设计思想是：

      > ==将整个数组反转，然后将前 $n-p$ 个元素反转，再将后 $p$ 个元素反转。==

      和教材上"先分段、后整体"的版本==顺序正好相反，但结果一样==。

      ==要注意的是分界点会跟着变==：
      教材版切在 $p$，我这版切在 ==$n-p$==。
      如果记混了顺序却没改下标，就会移错位数 —— ==这是这道题唯一真正的坑==。

      写完之后可以拿 $n=10,\ p=3$ 代一遍，==三步之内就能验完==。
    ` },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      顺序表所有性能特征都来自同一句话：==逻辑相邻 = 物理相邻==。

      - 因为物理相邻，所以地址能算出来 → ==随机存取 $O(1)$==；
      - 也因为物理相邻，插入删除必须==维持这个约束== → 要挪一堆元素。

      ==这是一笔一体两面的交易，不存在"两全"的顺序表==。
      想两全就得换结构（比如[链表](#/ds/list/list-compare?at=choose)）。
    ` },

  ],
});
