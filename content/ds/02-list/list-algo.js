/* ==========================================================================
   数据结构 / 2 线性表 / 链表经典算法
   ========================================================================== */

KM.page({
  path: 'ds/list/list-algo',
  title: '链表经典算法',
  subtitle: '逆置、归并、找环、找交点、找倒数第 $k$ 个 —— 五个套路覆盖了绝大多数链表代码题',
  tags: ['高频', '真题', '代码题'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'toolbox', c: '一、先把工具箱摆出来' },

    { t: 'key', id: 'four-tools', title: '链表题只有四种武器', c: String.raw`
      | 武器 | 干什么用 | 典型题 |
      |---|---|---|
      | **头插法** | ==逆序== | 原地逆置、升序表归并成降序 |
      | **尾插法 + 尾指针** | ==保序拼接== | 归并两个有序表、拆分链表 |
      | **快慢指针** | ==找中点、判环、找环入口== | Floyd 判圈 |
      | **前后双指针（差 $k$ 步）** | ==定位倒数第 $k$ 个、找交点== | 2009、2012 真题 |

      **一个通用前提**：==本页所有代码都假设链表带头结点==
      （见[带不带头结点的对比](#/ds/list/linked-list?at=head-vs-not)）。
      答题时先写一句"设链表带头结点"，能省掉大量边界分支。

      **另一个通用习惯**：==凡是要改 $\texttt{p->next}$，先用临时指针接住原来的后继==。
      链表题里 90% 的"链断了"都是漏了这一步。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'reverse', c: '二、逆置' },

    { t: 'code', id: 'reverse-head', title: '写法一：头插法（推荐）', lang: 'c',
      note: '把所有结点摘下来重新头插一遍，天然逆序',
      c: String.raw`
        LinkList Reverse_1(LinkList L) {          // 带头结点
            LNode *p = L->next, *r;
            L->next = NULL;                       // 先把链摘空，当成空表
            while (p != NULL) {
                r = p->next;                      // ① 记住后继（关键！）
                p->next = L->next;                // ② 头插
                L->next = p;
                p = r;                            // ③ 继续处理下一个
            }
            return L;
        }
      ` },

    { t: 'code', id: 'reverse-three', title: '写法二：三指针原地翻转', lang: 'c',
      note: '不带头结点时用这个，返回新的头指针',
      c: String.raw`
        LNode *Reverse_2(LNode *head) {
            LNode *prev = NULL, *cur = head, *next;
            while (cur != NULL) {
                next = cur->next;                 // 记住后继
                cur->next = prev;                 // 掉头
                prev = cur;                       // 两个指针一起前进
                cur  = next;
            }
            return prev;                          // prev 就是新的头
        }
      ` },

    { t: 'warn', id: 'reverse-trap', title: '逆置的两个必错点', c: String.raw`
      1. ==头插法开头必须先 $\texttt{L->next = NULL}$==。
         不清空的话，==原来的第一个结点的 $\texttt{next}$ 还指着第二个==，
         最后会形成一个环。
      2. ==三指针版最后返回的是 $\texttt{prev}$ 不是 $\texttt{cur}$==。
         循环结束时 $\texttt{cur == NULL}$，$\texttt{prev}$ 才指着原来的尾结点。

      **复杂度**：两种写法都是==时间 $O(n)$、空间 $O(1)$==，一趟扫描。
      ==如果你的写法需要辅助数组，那就丢分了==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'merge', c: '三、归并两个有序链表' },

    { t: 'code', id: 'merge-asc', title: '两个升序表归并成一个升序表（尾插）', lang: 'c',
      note: '结果放在 La 中，Lb 的头结点被释放',
      c: String.raw`
        void Merge_Asc(LinkList La, LinkList Lb) {
            LNode *pa = La->next, *pb = Lb->next;
            LNode *r  = La;                       // r 始终指向结果表的尾
            while (pa != NULL && pb != NULL) {
                if (pa->data <= pb->data) {       // ← 等号保证稳定
                    r->next = pa;  r = pa;  pa = pa->next;
                } else {
                    r->next = pb;  r = pb;  pb = pb->next;
                }
            }
            r->next = (pa != NULL) ? pa : pb;     // 把剩下的整段接上
            free(Lb);                             // 只释放 Lb 的头结点
        }
      ` },

    { t: 'code', id: 'merge-desc', title: '两个升序表归并成一个降序表（头插）', lang: 'c',
      note: '只把尾插换成头插，其余完全一样',
      c: String.raw`
        void Merge_Desc(LinkList La, LinkList Lb) {
            LNode *pa = La->next, *pb = Lb->next, *r;
            La->next = NULL;                      // 清空，准备头插
            while (pa != NULL && pb != NULL) {
                if (pa->data <= pb->data) {
                    r = pa->next;  pa->next = La->next;  La->next = pa;  pa = r;
                } else {
                    r = pb->next;  pb->next = La->next;  La->next = pb;  pb = r;
                }
            }
            while (pa != NULL) { r = pa->next; pa->next = La->next; La->next = pa; pa = r; }
            while (pb != NULL) { r = pb->next; pb->next = La->next; La->next = pb; pb = r; }
            free(Lb);
        }
      ` },

    { t: 'key', id: 'merge-notes', title: '归并类题目的三个要点', c: String.raw`
      1. =="升序归并成升序"用尾插，"升序归并成降序"用头插==。
         看清题目要的是哪一种，这是最容易审错的地方。
      2. ==尾插版最后那句 $\texttt{r->next = pa ? pa : pb}$ 是"整段接上"==，
         不需要循环 —— 剩下的那一段本来就是有序的。
         ==头插版则必须逐个头插==（因为要逆序），所以有两个收尾 $\texttt{while}$。
      3. **求交集 / 差集**是同一套骨架：
         - 求==交集==：$\texttt{pa->data == pb->data}$ 时才保留，其余两边分别推进；
         - 求==差集==（$La-Lb$）：只保留 $La$ 中不在 $Lb$ 里的。
         ==注意释放被丢弃的结点==，真题会给这个分。

      **复杂度**：时间 $O(m+n)$，空间 $O(1)$（==原地利用了原有结点，没有 malloc 新结点==）。
      =="不新建结点"是这类题的隐含要求==，新建了虽然结果对，但可能被扣分。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'cycle', c: '四、快慢指针：判环与找环入口' },

    { t: 'key', id: 'floyd', title: 'Floyd 判圈法', c: String.raw`
      **判断有没有环**：$\texttt{slow}$ 每次走 1 步，$\texttt{fast}$ 每次走 2 步。

      - 若 $\texttt{fast}$ 走到了 $\texttt{NULL}$ → ==无环==；
      - 若两者==相遇==（$\texttt{slow == fast}$）→ ==有环==。

      **为什么一定会相遇**：进入环之后，$\texttt{fast}$ 每一步都比 $\texttt{slow}$ 多前进 1 个位置，
      ==相当于以每步 1 的速度追赶==，环是有限长的，所以必定追上，不会"跳过"。

      **找环的入口**：相遇之后，==让一个指针回到表头，另一个留在相遇点，
      两者都改成每次走 1 步，==再次相遇的位置就是环的入口。
    ` },

    { t: 'diagram', id: 'floyd-proof', title: '环入口为什么是这样找出来的',
      note: 'a = 头到入口，b = 入口到相遇点，r = 环长',
      caption: String.raw`相遇时 $\texttt{slow}$ 走了 $a+b$ 步，$\texttt{fast}$ 走了 $a+b+nr$ 步（多绕了 $n$ 圈）。
      由 $\text{fast}=2\times\text{slow}$ 得 $a+b+nr=2(a+b)$，即 ==$a+b=nr$==，于是
      $$a=nr-b=(n-1)r+(r-b)$$
      ==右边正好是"从相遇点再走到入口"的距离，外加若干整圈==。
      所以两个指针以相同速度分别从头和从相遇点出发，==必然同时到达入口==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 232" role="img" aria-label="Floyd 判圈法中头部长度、环长与相遇点的关系">
  <g class="n p"><rect x="16" y="106" width="48" height="28" rx="5"/><text class="bt xs" x="40" y="120" text-anchor="middle" dominant-baseline="central">head</text></g>
  <path class="ar" d="M64,120 H216"/>
  <text class="lb em" x="140" y="110" text-anchor="middle">a</text>
  <path class="ar plain" d="M230,120 A70,70 0 0,1 370,120"/>
  <path class="ar plain" d="M370,120 A70,70 0 0,1 230,120"/>
  <g class="n a"><rect x="218" y="108" width="24" height="24" rx="12"/></g>
  <text class="lb em" x="206" y="150" text-anchor="end">入口</text>
  <g class="n r"><rect x="338" y="58" width="24" height="24" rx="12"/></g>
  <text class="lb em" x="376" y="56">相遇点</text>
  <text class="lb em" x="284" y="44" text-anchor="middle">b</text>
  <text class="lb" x="300" y="212" text-anchor="middle">r − b</text>
  <text class="cap" x="420" y="52">slow 走了　a + b</text>
  <text class="cap" x="420" y="76">fast 走了　a + b + n·r</text>
  <text class="cap" x="420" y="106">fast = 2 × slow</text>
  <g class="n g"><rect x="420" y="120" width="266" height="66" rx="7"/>
    <text class="bt sm" x="553" y="140" text-anchor="middle" dominant-baseline="central">a + b = n·r</text>
    <text class="bs" x="553" y="162" text-anchor="middle" dominant-baseline="central">a = (n−1)·r + (r − b)</text>
    <text class="bs" x="553" y="180" text-anchor="middle" dominant-baseline="central">头到入口 = 相遇点到入口（+ 整圈）</text></g>
</svg>
` },

    { t: 'code', id: 'cycle-code', title: '判环 + 求入口', lang: 'c',
      note: '返回环的入口结点，无环返回 NULL',
      c: String.raw`
        LNode *FindLoopStart(LinkList L) {
            LNode *slow = L->next, *fast = L->next;
            while (fast != NULL && fast->next != NULL) {
                slow = slow->next;                // 走一步
                fast = fast->next->next;          // 走两步
                if (slow == fast) break;          // 相遇 → 有环
            }
            if (fast == NULL || fast->next == NULL) return NULL;   // 无环

            LNode *p = L->next, *q = slow;        // p 回到表头，q 留在相遇点
            while (p != q) { p = p->next; q = q->next; }   // 同速前进
            return p;                             // 相遇处即入口
        }
      ` },

    { t: 'warn', id: 'floyd-traps', title: '快慢指针的三个坑', c: String.raw`
      1. ==循环条件必须同时判 $\texttt{fast}$ 和 $\texttt{fast->next}$==。
         只判 $\texttt{fast != NULL}$ 的话，$\texttt{fast->next->next}$ 会解引用空指针。
      2. ==退出循环后要重新确认是"相遇退出"还是"走到头退出"==。
         直接接着找入口的话，无环时会出错。
      3. ==求中点时的"取哪一个"==：
         若 $\texttt{slow}$ 与 $\texttt{fast}$ 都从头结点出发，
         $n$ 为偶数时 $\texttt{slow}$ 停在==后半段的第一个==；
         从首元结点出发则停在==前半段的最后一个==。
         ==题目要"中间结点"时先问清楚是哪一个==。

      **求中点的用途**：==[链表的归并排序](#/ds/sort/merge-radix?at=merge-complexity)==
      需要把链表对半分，靠的就是快慢指针，$O(n)$ 且 $O(1)$ 空间。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'exams', c: '五、三道真题' },

    { t: 'example', id: 'ex-kth',
      title: '★ 查找倒数第 $k$ 个结点（2009 真题）',
      source: '2009 统考真题',
      level: 3,
      problem: String.raw`
        已知一个带表头结点的单链表，结点结构为 $\texttt{(data, link)}$。
        假设该链表==只给出了头指针 $\texttt{list}$==。
        在不改变链表的前提下，请设计一个==尽可能高效==的算法，
        查找链表中==倒数第 $k$ 个位置上的结点==（$k$ 为正整数）。
        若查找成功，算法输出该结点的 $\texttt{data}$ 值并返回 1，否则只返回 0。
      `,
      idea: String.raw`
        朴素做法是==先扫一遍求长度 $n$，再从头走 $n-k$ 步==，
        需要==两趟==扫描。题目说"尽可能高效"，暗示要==一趟==解决。

        一趟的关键洞察：==倒数第 $k$ 个==这件事，等价于
        =="有两个指针相距 $k$，当前面那个走到表尾时，后面那个就在答案处"==。

        所以：让 $p$ 先独自走 $k$ 步，然后 $p$ 和 $q$ ==同步前进==；
        $p$ 走到 $\texttt{NULL}$ 时，$q$ 恰好落在倒数第 $k$ 个。
        =="用两个指针的固定间距把'倒数'转成'正数'"是这类题的通法。==
      `,
      solution: String.raw`
        **算法的基本设计思想**

        1. 设两个指针 $p$、$q$ 都指向首元结点，计数器 $\texttt{count}$ 初值为 0；
        2. 反复让 $p$ 后移：==若 $\texttt{count} < k$ 则只让 count 加 1，否则同时让 $q$ 后移一位==；
        3. $p$ 到达 $\texttt{NULL}$ 时循环结束：
           - 若 $\texttt{count} < k$，说明表长不足 $k$，返回 0；
           - 否则 $q$ 指向的就是倒数第 $k$ 个结点，输出并返回 1。

        **C 语言描述**

        ~~~c
        typedef struct LNode {
            int data;
            struct LNode *link;
        } LNode, *LinkList;

        int Search_k(LinkList list, int k) {
            LNode *p = list->link, *q = list->link;   // 都指向首元结点
            int count = 0;
            while (p != NULL) {
                if (count < k) count++;               // 先拉开 k 的间距
                else q = q->link;                     // 之后同步前进
                p = p->link;
            }
            if (count < k) return 0;                  // 表长不足 k
            printf("%d", q->data);
            return 1;
        }
        ~~~

        **复杂度**：==时间 $O(n)$，只扫描一趟；空间 $O(1)$==。
      `,
      comment: String.raw`
        **为什么把 $\texttt{count}$ 的判断写在循环里而不是先走 $k$ 步**：
        两种写法都对，但这种写法==顺便处理了"表长不足 $k$"的情况==，
        不用额外加分支 —— 循环结束时 $\texttt{count} < k$ 就说明不够长。

        **验证间距**：设表长 $n\ge k$。$p$ 一共走了 $n$ 步；
        其中前 $k$ 步 $q$ 不动，后 $n-k$ 步 $q$ 跟着走，
        所以 $q$ 从首元结点前进了 $n-k$ 步，==正是第 $n-k+1$ 个结点，即倒数第 $k$ 个== ✓

        **常见错误**：
        1. ==$p$、$q$ 从头结点（而不是首元结点）出发==，答案会差 1；
        2. ==忘了"不改变链表"这个限制==，去做逆置再取第 $k$ 个 —— 直接违规；
        3. ==只写代码不写"基本设计思想"==，真题按三段给分，会丢一半。
      `,
    },

    { t: 'example', id: 'ex-common-suffix',
      title: '★ 求两个链表的公共后缀（2012 真题）',
      source: '2012 统考真题',
      level: 4,
      problem: String.raw`
        假定采用带头结点的单链表保存单词，当两个单词有相同的后缀时，
        可共享相同的后缀存储空间。
        设 $\texttt{str1}$ 和 $\texttt{str2}$ 分别指向两个单词所在单链表的头结点，
        请设计一个==时间上尽可能高效==的算法，
        找出由 $\texttt{str1}$ 和 $\texttt{str2}$ 所指向两个链表==共同后缀的起始位置==。
      `,
      idea: String.raw`
        "共享后缀"意味着两条链==从某个结点开始就是同一串结点==（==指针相同，不是值相同==），
        形状像一个 **Y**。

        直接两两比较是 $O(mn)$。关键洞察：
        ==既然公共部分是后缀，那么从**尾部**对齐之后，两条链就会同步走到交点==。

        而链表不能倒着走，所以换个说法：==让长的那条先走掉长度差==，
        之后两条链剩余长度相同，==同步前进，第一次指针相等处就是交点==。

        =="求长度差 + 对齐 + 同步走"是这道题的全部==，时间 $O(m+n)$。
      `,
      solution: String.raw`
        **算法的基本设计思想**

        1. 分别遍历两条链，求出长度 $m$ 和 $n$；
        2. ==让较长的那条链的指针先前进 $|m-n|$ 步==，使两个指针到表尾的距离相等；
        3. 两个指针==同步后移==，==第一次出现 $p == q$ 时，该结点即为公共后缀的起始位置==；
        4. 若一直走到 $\texttt{NULL}$ 都没相等，说明没有公共后缀。

        **C 语言描述**

        ~~~c
        int Length(LinkList L) {
            int len = 0;
            for (LNode *p = L->next; p != NULL; p = p->next) len++;
            return len;
        }

        LNode *FindAddr(LinkList str1, LinkList str2) {
            int m = Length(str1), n = Length(str2);
            LNode *p = str1->next, *q = str2->next;
            while (m > n) { p = p->next; m--; }       // 长的先走
            while (n > m) { q = q->next; n--; }
            while (p != NULL && p != q) {             // ← 比的是指针，不是 data
                p = p->next;
                q = q->next;
            }
            return p;                                 // 无公共后缀时自然返回 NULL
        }
        ~~~

        **复杂度**：求长度 $O(m+n)$，对齐 $O(|m-n|)$，同步走 $O(\min(m,n))$，
        ==总时间 $O(m+n)$，空间 $O(1)$==。
      `,
      comment: String.raw`
        **最关键的一句话是 $\texttt{p != q}$ 而不是 $\texttt{p->data != q->data}$**。
        题目说的是==共享存储空间==，即两条链走到了==同一个结点==上。
        比 $\texttt{data}$ 的话，两个恰好值相同但地址不同的结点会被误判。
        ==这是本题最主要的失分点==。

        **一个更巧的等价写法**（不用求长度）：
        让 $p$ 走完 $\texttt{str1}$ 后接着走 $\texttt{str2}$，$q$ 走完 $\texttt{str2}$ 后接着走 $\texttt{str1}$，
        ==两者都走了 $m+n$ 步，必在交点相遇==（无交点则同时到 $\texttt{NULL}$）。
        考场上写标准解法即可，这个当趣味了解。

        **同类问题**：判断两条链表是否相交 —— ==比较各自最后一个结点的地址是否相同==即可，
        $O(m+n)$，更省事。
      `,
    },

    { t: 'example', id: 'ex-split',
      title: '把一个链表拆成两个',
      source: '常见变形',
      level: 3,
      problem: String.raw`
        设带头结点的单链表 $A$ 中数据元素按序号递增有序排列。
        设计算法将 $A$ 拆分成两个带头结点的链表 $A$ 和 $B$：
        ==$A$ 中保留原链表中序号为**奇数**的元素，$B$ 中保留序号为**偶数**的元素==，
        且要求==$B$ 中元素的顺序与原来相反==，同时保持相对稳定性（$A$ 保持原序）。
      `,
      idea: String.raw`
        一趟扫描，==边走边拆==：
        - 序号为奇数的结点 → ==尾插==到 $A$（保持原序，需要一个尾指针 $r_a$）；
        - 序号为偶数的结点 → ==头插==到 $B$（自动逆序，不需要尾指针）。

        =="要原序用尾插，要逆序用头插"== —— 这就是[两种建表方法](#/ds/list/linked-list?at=build-code)
        在拆分题里的直接应用。

        唯一要小心的是：==摘下一个结点之前必须先记住它的后继==，否则链就断了。
      `,
      solution: String.raw`
        ~~~c
        LinkList Split(LinkList A) {
            LinkList B = (LinkList)malloc(sizeof(LNode));
            B->next = NULL;                        // B 用头插，先置空
            LNode *ra = A;                         // A 的尾指针
            LNode *p  = A->next, *r;
            int i = 1;                             // 序号
            A->next = NULL;                        // A 也重建
            while (p != NULL) {
                r = p->next;                       // ← 先记住后继
                if (i % 2 == 1) {                  // 奇数：尾插到 A
                    ra->next = p;  ra = p;
                } else {                           // 偶数：头插到 B
                    p->next = B->next;  B->next = p;
                }
                p = r;
                i++;
            }
            ra->next = NULL;                       // A 收尾
            return B;
        }
        ~~~

        **复杂度**：一趟扫描，==时间 $O(n)$；只用了常数个指针，空间 $O(1)$==
        （只新建了 $B$ 的头结点）。
      `,
      comment: String.raw`
        **三处必须写对**：
        1. ==$\texttt{r = p->next}$ 必须在任何指针修改之前==；
        2. ==$B$ 头插前要 $\texttt{B->next = NULL}$，$A$ 尾插完要 $\texttt{ra->next = NULL}$==；
        3. ==$A$ 也要先 $\texttt{A->next = NULL}$ 重建==，
           否则原来的链还挂着，最后 $A$ 里会混进偶数号结点。

        **常见变形**：
        - "$B$ 也要保持原序" → 把头插换成尾插，再加一个 $r_b$ 尾指针；
        - "按值的奇偶拆分" → 把 $\texttt{i \% 2}$ 换成 $\texttt{p->data \% 2}$，其余不变。
        ==骨架完全一样，只换判断条件==。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '六、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **摘结点前不记后继** —— 链直接断掉，这是最高频的错误。
      2. **头插法忘了先清空** —— 会成环。
      3. **尾插法忘了最后置 $\texttt{NULL}$** —— 尾结点的 $\texttt{next}$ 是野指针。
      4. **快慢指针只判 $\texttt{fast != NULL}$** —— 要同时判 $\texttt{fast->next}$。
      5. **求交点时比较 $\texttt{data}$ 而不是指针** —— ==2012 真题的核心失分点==。
      6. **倒数第 $k$ 个从头结点出发** —— 答案差 1。
      7. **归并时新建结点** —— 题目一般要求==利用原有结点==。
      8. **归并后忘记 $\texttt{free}$ 多余的头结点 / 被丢弃的结点**。
      9. **只写代码不写"基本设计思想"** —— 真题分三段给分。
      10. **说链表逆置需要 $O(n)$ 空间** —— ==$O(1)$ 就够==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '七、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      链表代码题的评分点其实很固定，可以当成清单来对：

      1. ==说清楚"基本设计思想"==（往往占一半分，很多人直接跳过）；
      2. ==边界：空表、只有一个结点、$k$ 超过表长==；
      3. ==该 $\texttt{free}$ 的有没有 $\texttt{free}$==；
      4. ==最后写一句时间和空间复杂度==。

      ==代码写得再漂亮，漏了 1 和 4 也拿不到满分==。
    ` },

  ],
});
