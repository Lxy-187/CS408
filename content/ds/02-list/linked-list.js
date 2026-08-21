/* ==========================================================================
   数据结构 / 2 线性表 / 单链表 / 双链表 / 循环链表
   ========================================================================== */

KM.page({
  path: 'ds/list/linked-list',
  title: '单链表 / 双链表 / 循环链表',
  subtitle: '把"关系"从地址里搬进指针里 —— 以及头结点、双向、循环这三个变体各自解决了什么麻烦',
  tags: ['高频', '必考', '代码题'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'basic', c: '一、单链表' },

    { t: 'code', id: 'node-def', title: '结点定义', lang: 'c',
      note: '本页所有代码都用这个定义',
      c: String.raw`
        typedef struct LNode {
            ElemType data;
            struct LNode *next;
        } LNode, *LinkList;
      ` },

    { t: 'key', id: 'why-list', title: '链表解决了什么，又失去了什么', c: String.raw`
      | | 顺序表 | 单链表 |
      |---|---|---|
      | 空间要求 | ==必须是一整块连续空间== | ==可以零散分配== |
      | 按位查找 | ==$O(1)$ 随机存取== | ==$O(n)$ 只能顺序存取== |
      | 插入删除 | $O(n)$（要挪元素） | ==找到位置后 $O(1)$（只改指针）== |
      | 额外开销 | 可能预分配浪费 | ==每个结点多一个指针域== |

      ==注意"插入删除 $O(1)$"有个前提：已经拿到了前驱结点的指针==。
      如果只给你一个位序 $i$，那么"先找到第 $i-1$ 个"这一步就是 $O(n)$，
      ==所以"在第 $i$ 个位置插入"这个完整操作在链表上仍然是 $O(n)$==。
      这是一个非常爱考的辨析点。
    ` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'head-node', c: '二、★ 带不带头结点' },

    { t: 'key', id: 'head-vs-not', title: '头指针、头结点、首元结点', c: String.raw`
      三个名词必须分清：

      - **头指针**：==指向链表第一个结点的指针==，是链表的"名字"，==任何链表都有==；
      - **头结点**：==在首元结点之前附加的一个结点==，==它的 $\texttt{data}$ 域不存放元素==
        （可以空着，也可以存表长）；
      - **首元结点**：==存放第一个数据元素==的那个结点。

      **带头结点的两个好处**（简答题答点）：

      1. ==对第一个位置的操作和其他位置**统一**了==。
         不带头结点时，"在第 1 个位置插入"要修改头指针本身，需要单独写一个分支；
         带头结点后，第 1 个位置的前驱就是头结点，==和别的位置一模一样==。
      2. ==空表和非空表的处理**统一**了==。
         带头结点时头指针 $L$ ==永远非空==，判空条件是 $\texttt{L->next == NULL}$；
         不带头结点时空表的 $L$ 本身就是 $\texttt{NULL}$，==每个函数都要先判一次==。

      **代价**：多占一个结点的空间（可以忽略）。
      ==所以 408 的代码题默认带头结点==，除非题目明说不带。
    ` },

    { t: 'diagram', id: 'head-demo', title: '带头结点 vs 不带头结点',
      note: '上：带头结点　下：不带头结点',
      caption: String.raw`==带头结点时，$L$ 本身永远存在==，
      所以"在表头插入"和"在中间插入"用的是同一段代码；空表也不是特例。
      ==不带头结点时，涉及第一个位置的操作都要单独写一个 $\texttt{if}$==，
      而且函数签名往往要改成二级指针（因为要修改 $L$ 本身）。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 226" role="img" aria-label="带头结点与不带头结点的单链表结构对比">
  <text class="cap" x="14" y="18">带头结点</text>
  <g class="n p"><rect x="14" y="30" width="52" height="34" rx="5"/><text class="bt xs" x="40" y="47" text-anchor="middle" dominant-baseline="central">L</text></g>
  <path class="ar" d="M66,47 H98"/>
  <g class="n m"><rect x="98" y="30" width="76" height="34" rx="5"/><text class="bt xs" x="136" y="47" text-anchor="middle" dominant-baseline="central">头结点</text></g>
  <path class="ar" d="M174,47 H206"/>
  <g class="n k"><rect x="206" y="30" width="76" height="34" rx="5"/><text class="bt xs" x="244" y="47" text-anchor="middle" dominant-baseline="central">a1</text></g>
  <path class="ar" d="M282,47 H314"/>
  <g class="n k"><rect x="314" y="30" width="76" height="34" rx="5"/><text class="bt xs" x="352" y="47" text-anchor="middle" dominant-baseline="central">a2</text></g>
  <path class="ar" d="M390,47 H422"/>
  <g class="n k"><rect x="422" y="30" width="76" height="34" rx="5"/><text class="bt xs" x="460" y="47" text-anchor="middle" dominant-baseline="central">a3</text></g>
  <path class="ar" d="M498,47 H524"/>
  <g class="n m"><rect x="524" y="30" width="40" height="34" rx="5"/><text class="bt xs" x="544" y="47" text-anchor="middle" dominant-baseline="central">∧</text></g>
  <text class="lb em" x="590" y="42">判空：</text>
  <text class="lb em" x="590" y="60">L-&gt;next == NULL</text>
  <text class="cap" x="14" y="96">空表时（带头结点）</text>
  <g class="n p"><rect x="14" y="106" width="52" height="34" rx="5"/><text class="bt xs" x="40" y="123" text-anchor="middle" dominant-baseline="central">L</text></g>
  <path class="ar" d="M66,123 H98"/>
  <g class="n m"><rect x="98" y="106" width="76" height="34" rx="5"/><text class="bt xs" x="136" y="123" text-anchor="middle" dominant-baseline="central">头结点</text></g>
  <path class="ar" d="M174,123 H200"/>
  <g class="n m"><rect x="200" y="106" width="40" height="34" rx="5"/><text class="bt xs" x="220" y="123" text-anchor="middle" dominant-baseline="central">∧</text></g>
  <text class="lb em" x="266" y="127">L 仍然存在 —— 空表不是特例</text>
  <path class="sep" d="M14,158 H686"/>
  <text class="cap" x="14" y="182">不带头结点</text>
  <g class="n p"><rect x="14" y="192" width="52" height="34" rx="5"/><text class="bt xs" x="40" y="209" text-anchor="middle" dominant-baseline="central">L</text></g>
  <path class="ar" d="M66,209 H98"/>
  <g class="n k"><rect x="98" y="192" width="76" height="34" rx="5"/><text class="bt xs" x="136" y="209" text-anchor="middle" dominant-baseline="central">a1</text></g>
  <path class="ar" d="M174,209 H206"/>
  <g class="n k"><rect x="206" y="192" width="76" height="34" rx="5"/><text class="bt xs" x="244" y="209" text-anchor="middle" dominant-baseline="central">a2</text></g>
  <path class="ar" d="M282,209 H308"/>
  <g class="n m"><rect x="308" y="192" width="40" height="34" rx="5"/><text class="bt xs" x="328" y="209" text-anchor="middle" dominant-baseline="central">∧</text></g>
  <text class="lb em" x="376" y="204">空表时 L == NULL，判空条件不同</text>
  <text class="lb em" x="376" y="222">在表头插入要修改 L 本身</text>
</svg>
` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'build', c: '三、建表：头插法与尾插法' },

    { t: 'code', id: 'build-code', title: '两种建表方法', lang: 'c',
      note: '头插法会逆序，尾插法保持原序',
      c: String.raw`
        /* 头插法：每次插在头结点之后 —— 结果与输入次序相反 */
        LinkList List_HeadInsert(LinkList L) {
            L = (LinkList)malloc(sizeof(LNode));
            L->next = NULL;                        // 必须先置空！
            int x;
            scanf("%d", &x);
            while (x != 9999) {
                LNode *s = (LNode *)malloc(sizeof(LNode));
                s->data = x;
                s->next = L->next;                 // ① 先接后面
                L->next = s;                       // ② 再接前面
                scanf("%d", &x);
            }
            return L;
        }

        /* 尾插法：需要一个尾指针 r —— 结果与输入次序相同 */
        LinkList List_TailInsert(LinkList L) {
            L = (LinkList)malloc(sizeof(LNode));
            LNode *r = L;                          // r 始终指向尾结点
            int x;
            scanf("%d", &x);
            while (x != 9999) {
                LNode *s = (LNode *)malloc(sizeof(LNode));
                s->data = x;
                r->next = s;
                r = s;                             // 尾指针后移
                scanf("%d", &x);
            }
            r->next = NULL;                        // 收尾，别忘了
            return L;
        }
      ` },

    { t: 'warn', id: 'build-traps', title: '建表的三个必错点', c: String.raw`
      1. ==头插法开头必须 $\texttt{L->next = NULL}$==。
         否则第一个结点的 $\texttt{next}$ 会接上一个野指针。
      2. ==尾插法结尾必须 $\texttt{r->next = NULL}$==。
         循环里只顾着往后接，最后一个结点的 $\texttt{next}$ 是没赋值的。
      3. ==头插法的两句顺序不能换==：先 $\texttt{s->next = L->next}$，再 $\texttt{L->next = s}$。
         换了顺序，原来的第一个结点就==找不回来了==（链表断成两截）。

      **头插法的一个重要用途**：==它天生就是"逆置"==。
      [把一个链表原地逆置](#/ds/list/list-algo?at=reverse)最简单的写法，
      就是把所有结点摘下来重新头插一遍。
    ` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'ops', c: '四、查找、插入、删除' },

    { t: 'code', id: 'find-code', title: '按序号查找与按值查找', lang: 'c',
      note: '两者都是 O(n)，这是链表的固有代价',
      c: String.raw`
        LNode *GetElem(LinkList L, int i) {         // 返回第 i 个结点
            if (i < 0) return NULL;
            LNode *p = L;                           // p 从头结点开始
            int j = 0;                              // 头结点算第 0 个
            while (p != NULL && j < i) { p = p->next; j++; }
            return p;                               // i 越界时自然返回 NULL
        }

        LNode *LocateElem(LinkList L, ElemType e) { // 按值查找
            LNode *p = L->next;
            while (p != NULL && p->data != e) p = p->next;
            return p;
        }
      ` },

    { t: 'key', id: 'insert-delete', title: '插入与删除：改指针的顺序是唯一考点', c: String.raw`
      **后插**（在结点 $p$ 之后插入 $s$）：

      ~~~c
      s->next = p->next;      // ① 先让 s 接住 p 的后继
      p->next = s;            // ② 再让 p 指向 s
      ~~~

      ==两句顺序绝不能换==。换了之后 $\texttt{p->next}$ 已经是 $s$，
      $\texttt{s->next = p->next}$ 就变成 $\texttt{s->next = s}$，==自己指自己，成环==。

      **删除**（删除 $p$ 的后继 $q$）：

      ~~~c
      LNode *q = p->next;
      p->next = q->next;
      free(q);                // 别忘了释放
      ~~~

      ==必须先用临时指针接住 $q$ 再改 $\texttt{p->next}$==，否则 $q$ 就丢了（内存泄漏）。
    ` },

    { t: 'key', id: 'swap-trick', title: '★ 两个"偷天换日"技巧', c: String.raw`
      单链表只能往后走，所以"在 $p$ **之前**插入"和"删除 $p$ **本身**"
      本来都需要先花 $O(n)$ 找到 $p$ 的前驱。有两个技巧能做到 $O(1)$：

      **① 前插做成 $O(1)$**：==先把 $s$ 后插到 $p$ 之后，再交换两个结点的 data==。

      ~~~c
      s->next = p->next;
      p->next = s;
      ElemType t = p->data;  p->data = s->data;  s->data = t;   // 换数据
      ~~~

      结果：从值的角度看，$s$ 的值确实排在 $p$ 的值前面了。

      **② 删除结点 $p$ 做成 $O(1)$**：==把 $p$ 的后继的数据复制到 $p$，然后删掉后继==。

      ~~~c
      LNode *q = p->next;
      p->data = q->data;
      p->next = q->next;
      free(q);
      ~~~

      **两个技巧的共同前提**：==$p$ 不能是最后一个结点==（没有后继可借）。
      答题时==必须把这个前提写出来==，否则要扣分。

      **另一个副作用**：==指针的身份变了==。
      如果外部还有别的指针指着原来的 $p$ 或 $q$，这两个技巧会让它们指向错误的数据。
    ` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'double', c: '五、双链表' },

    { t: 'code', id: 'dnode-def', title: '双链表结点', lang: 'c',
      c: String.raw`
        typedef struct DNode {
            ElemType data;
            struct DNode *prior, *next;
        } DNode, *DLinklist;
      ` },

    { t: 'key', id: 'double-why', title: '双链表解决的唯一问题：找前驱', c: String.raw`
      单链表求某结点的前驱要==从头扫一遍==，$O(n)$；双链表 ==$O(1)$==。

      代价是每个结点多一个指针域，且==插入删除要改 4 个指针而不是 2 个==。

      **判空**：$\texttt{L->next == NULL}$（带头结点时）。
      **注意**：==头结点的 $\texttt{prior}$ 恒为 $\texttt{NULL}$，
      尾结点的 $\texttt{next}$ 恒为 $\texttt{NULL}$==。
    ` },

    { t: 'diagram', id: 'dinsert', title: '双链表后插：四条指针，前两条不能晚于第四条',
      note: '在 p 之后插入 s，q 是 p 原来的后继',
      caption: String.raw`==编号 ④（$\texttt{p->next = s}$）一旦执行，就再也找不到原来的 $q$ 了==，
      所以所有需要用到 $q$ 的语句（①②）必须排在它前面。
      ③（$\texttt{s->prior = p}$）什么时候做都行。
      考场上按 ==①②③④== 的顺序默写最保险。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 214" role="img" aria-label="双链表在结点 p 之后插入结点 s 时四条指针的修改顺序">
  <g class="n k"><rect x="60" y="40" width="110" height="46" rx="6"/><text class="bt sm" x="115" y="54" text-anchor="middle" dominant-baseline="central">p</text><text class="bs" x="115" y="74" text-anchor="middle" dominant-baseline="central">prior · data · next</text></g>
  <g class="n k"><rect x="440" y="40" width="110" height="46" rx="6"/><text class="bt sm" x="495" y="54" text-anchor="middle" dominant-baseline="central">q（p 原来的后继）</text><text class="bs" x="495" y="74" text-anchor="middle" dominant-baseline="central">prior · data · next</text></g>
  <g class="n a"><rect x="250" y="140" width="110" height="46" rx="6"/><text class="bt sm" x="305" y="154" text-anchor="middle" dominant-baseline="central">s（新结点）</text><text class="bs" x="305" y="174" text-anchor="middle" dominant-baseline="central">prior · data · next</text></g>
  <path class="ar em" d="M348,142 L446,88"/>
  <text class="lb em" x="416" y="126">① s-&gt;next = p-&gt;next</text>
  <path class="ar em" d="M462,90 L360,150"/>
  <text class="lb em" x="404" y="172">② p-&gt;next-&gt;prior = s</text>
  <path class="ar em" d="M264,142 L166,88"/>
  <text class="lb em" x="86" y="126">③ s-&gt;prior = p</text>
  <path class="ar em" d="M150,90 L250,152"/>
  <text class="lb em" x="120" y="172">④ p-&gt;next = s</text>
  <text class="cap" x="14" y="24">四条指针的修改顺序（①② 必须在 ④ 之前）</text>
  <text class="cap" x="576" y="150">删除 q 时对称：</text>
  <text class="cap" x="576" y="172">p-&gt;next = q-&gt;next</text>
  <text class="cap" x="576" y="192">q-&gt;next-&gt;prior = p</text>
</svg>
` },

    { t: 'warn', id: 'ddelete-trap', title: '双链表删除尾结点时要特判', c: String.raw`
      删除结点 $q$ 的标准两句是

      ~~~c
      p->next = q->next;
      q->next->prior = p;      // ← 若 q 是尾结点，q->next 是 NULL，这里崩
      ~~~

      ==$q$ 是尾结点时 $\texttt{q->next == NULL}$，第二句会解引用空指针==。
      正确写法要加判断：

      ~~~c
      p->next = q->next;
      if (q->next != NULL) q->next->prior = p;
      free(q);
      ~~~

      ==而循环双链表没有这个问题==（尾结点的 $\texttt{next}$ 指向头结点，永不为空）
      —— 这正是循环链表的价值之一。
    ` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'circular', c: '六、循环链表与静态链表' },

    { t: 'key', id: 'circ', title: '循环单链表与循环双链表', c: String.raw`
      **循环单链表**：==尾结点的 $\texttt{next}$ 不再是 $\texttt{NULL}$，而是指向头结点==。
      - 判空：==$\texttt{L->next == L}$==；
      - 从任一结点出发==都能访问到整个链表==；
      - ==常用尾指针 $r$ 而不是头指针==：这样
        "在表尾插入"是 $O(1)$（$r$ 就在那儿），
        "在表头插入"也是 $O(1)$（$\texttt{r->next}$ 就是头结点）。
        ==用头指针的话，表尾插入要 $O(n)$==。

      **循环双链表**：==头结点的 $\texttt{prior}$ 指向尾结点，尾结点的 $\texttt{next}$ 指向头结点==。
      - 判空：==$\texttt{L->next == L}$（等价于 $\texttt{L->prior == L}$）==；
      - ==任何指针都不会是 $\texttt{NULL}$==，所以插入删除==不需要边界特判==，代码最干净。

      **一个高频选择题**：
      "在循环双链表的结点 $p$ 之后插入 $s$，需要修改几个指针？" —— ==4 个==，与普通双链表相同。
    ` },

    { t: 'key', id: 'static-list', title: '静态链表：用数组下标当指针', c: String.raw`
      结点是数组元素，"指针"是==数组下标（游标 cursor）==：

      ~~~c
      #define MaxSize 50
      typedef struct {
          ElemType data;
          int next;                  // 下一个元素的数组下标，-1 表示结束
      } SLinkList[MaxSize];
      ~~~

      **特点**：
      - ==逻辑上是链表（插入删除只改游标），物理上是数组（一整块连续空间）==；
      - ==容量固定==，不能像动态链表那样随用随分配；
      - ==不支持随机存取==（虽然物理上是数组，但要按逻辑顺序走还是得沿着游标）。

      **用途**：不支持指针的语言、或者需要==把整个链表整体写入文件 / 共享内存==的场合。
      408 里主要考它的概念辨析，==记住"逻辑是链、物理是数组"这一句==即可。
    ` },

    { t: 'compare', id: 'variants', title: '四种链表变体对照',
      cols: ['', '判空条件', '求前驱', '表尾插入', '边界特判'],
      rows: [
        ['单链表', '`L->next == NULL`', '$O(n)$', '$O(n)$', '多'],
        ['双链表', '`L->next == NULL`', '==$O(1)$==', '$O(n)$', '中（尾结点要特判）'],
        ['循环单链表（尾指针）', '`r->next == r`', '$O(n)$', '==$O(1)$==', '少'],
        ['循环双链表', '`L->next == L`', '==$O(1)$==', '==$O(1)$==', '==几乎没有=='],
      ] },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '七、例题' },

    { t: 'example', id: 'ex-headnode',
      title: '带头结点让代码少了几个分支',
      source: '概念辨析',
      level: 2,
      problem: String.raw`
        分别写出**带头结点**和**不带头结点**的单链表"在第 $i$ 个位置插入元素 $e$"的算法，
        并说明带头结点的好处。
      `,
      idea: String.raw`
        对比时只盯一件事：==$i=1$ 这种情况需不需要单独写一个分支==。

        带头结点时，"第 1 个位置的前驱"就是头结点，==它和别的位置的前驱地位完全相同==；
        不带头结点时，"第 1 个位置"没有前驱，只能去改 $L$ 本身。
      `,
      solution: String.raw`
        **带头结点**

        ~~~c
        bool ListInsert(LinkList L, int i, ElemType e) {
            if (i < 1) return false;
            LNode *p = GetElem(L, i - 1);          // 找第 i-1 个（头结点算第 0 个）
            if (p == NULL) return false;
            LNode *s = (LNode *)malloc(sizeof(LNode));
            s->data = e;
            s->next = p->next;
            p->next = s;
            return true;
        }
        ~~~

        ==全程没有一个 $\texttt{if (i == 1)}$==。

        **不带头结点**

        ~~~c
        bool ListInsert2(LinkList *L, int i, ElemType e) {   // 注意二级指针
            if (i < 1) return false;
            LNode *s = (LNode *)malloc(sizeof(LNode));
            s->data = e;
            if (i == 1) {                          // ← 被迫多出来的分支
                s->next = *L;
                *L = s;                            // 修改头指针本身
                return true;
            }
            LNode *p = *L;
            int j = 1;
            while (p != NULL && j < i - 1) { p = p->next; j++; }
            if (p == NULL) { free(s); return false; }
            s->next = p->next;
            p->next = s;
            return true;
        }
        ~~~

        **好处总结**：
        1. ==消除了"第一个位置"的特殊分支==；
        2. ==函数不必用二级指针==（因为 $L$ 本身永远不变）；
        3. ==空表不是特例==，判空统一为 $\texttt{L->next == NULL}$。
      `,
      comment: String.raw`
        **考场建议**：代码题==一律默认带头结点并在开头写一句"设链表带头结点"==。
        真题的题面通常会说明，==没说明就自己声明==，改卷时不会扣分，
        而且能让代码短一半。

        **常见错误**：不带头结点版本里 ==$\texttt{if (p == NULL)}$ 之后忘了 $\texttt{free(s)}$==，
        造成内存泄漏。这一点在真题的参考答案里是给分点。
      `,
    },

    { t: 'example', id: 'ex-count-pointers',
      title: '数指针：这几种操作各要改几个指针',
      source: '选择题',
      level: 2,
      problem: String.raw`
        (1) 在带头结点的单链表结点 $p$ 之后插入 $s$，需修改几个指针？
        (2) 在双链表结点 $p$ 之后插入 $s$，需修改几个指针？
        (3) 在循环双链表中删除结点 $p$，需修改几个指针？
        (4) 已知单链表中结点 $p$（不是尾结点），要删除 $p$ 本身，最少需要多少时间？
      `,
      idea: String.raw`
        数指针的机械做法：==把"新结点的指针域"和"被影响到的老结点的指针域"分开数==。

        (4) 考的是[偷天换日技巧](#/ds/list/linked-list?at=swap-trick)。
      `,
      solution: String.raw`
        **(1)** ==2 个==：$\texttt{s->next}$ 和 $\texttt{p->next}$。

        **(2)** ==4 个==：$\texttt{s->next}$、$\texttt{s->prior}$、
        $\texttt{p->next}$、$\texttt{p->next->prior}$（即原后继的 $\texttt{prior}$）。

        **(3)** ==2 个==：$\texttt{p->prior->next}$ 和 $\texttt{p->next->prior}$。
        （$p$ 自己的两个指针域随着 $\texttt{free}$ 一起没了，不算修改。）

        **(4)** ==$O(1)$==。把后继的数据复制到 $p$，再删掉后继：

        ~~~c
        LNode *q = p->next;
        p->data = q->data;
        p->next = q->next;
        free(q);
        ~~~

        ==前提是 $p$ 不是尾结点==（题目已经保证了）。
      `,
      comment: String.raw`
        **(3) 的陷阱**：如果换成==非循环==的双链表，答案仍是 2 个，
        但代码里==必须多一个 $\texttt{if (p->next != NULL)}$ 的判断==
        （见[上文的尾结点陷阱](#/ds/list/linked-list?at=ddelete-trap)）。
        ==选择题问"修改几个指针"时不算这个判断，但代码题里漏了就是错==。

        **(4) 的追问**："如果 $p$ 是尾结点呢？"
        答：==只能 $O(n)$ 从头找前驱==，因为借不到后继的数据。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '八、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **头指针 / 头结点 / 首元结点混用** —— ==头指针任何链表都有，头结点是可选的附加结点==。
      2. **认为链表插入删除一定是 $O(1)$** —— =="按位序插入"仍是 $O(n)$==，
         因为找前驱要 $O(n)$。
      3. **后插的两句顺序写反** —— 会自己指自己，成环。
      4. **头插法忘了 $\texttt{L->next = NULL}$ / 尾插法忘了 $\texttt{r->next = NULL}$**。
      5. **删除时不先接住待删结点** —— 内存泄漏。
      6. **双链表删除尾结点不特判** —— ==解引用空指针==。
      7. **"偷天换日"没写"$p$ 不是尾结点"的前提**。
      8. **循环单链表判空写成 $\texttt{L->next == NULL}$** —— ==应该是 $\texttt{L->next == L}$==。
      9. **循环单链表用头指针却说表尾插入是 $O(1)$** —— ==要用尾指针才行==。
      10. **认为静态链表支持随机存取** —— ==不支持==，仍要沿游标走。
      11. **认为链表比顺序表一定省空间** —— 每个结点多一个指针域，
         ==元素本身很小时链表反而更费==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '九、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      三个变体各自解决一个具体的麻烦，可以按"麻烦"来记：

      - ==头结点== 解决"第一个位置是个特例"；
      - ==双向== 解决"找不到前驱"；
      - ==循环== 解决"末尾是个特例（$\texttt{NULL}$ 判断）"。

      所以==循环双链表 + 头结点==的代码最干净 ——
      它把三个特例一次全消掉了，==所有位置、所有情形都长得一模一样==。
    ` },

  ],
});
