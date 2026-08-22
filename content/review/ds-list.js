/* ==========================================================================
   错题本 / 数据结构 · 线性表
   ========================================================================== */

KM.page({
  path: 'review/ds/list',
  title: '错题卡 · 线性表',
  subtitle: '卡面原文。要一张一张翻着练，去[卡片练习](#/review/index/deck?at=deck)',
  tags: ['错题', '数据结构'],
  updated: '2026-08-22',

  blocks: [

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'linked', c: '链表算法' },

    { t: 'card',
      id: 'c-lastk-two-pass',
      date: '2026-08-22',
      where: '链表 · 倒数第 k 个',
      q: String.raw`
        带头结点的单链表，只给出头指针 $\texttt{list}$。
        在**不改变链表**的前提下，设计一个**尽可能高效**的算法，
        查找倒数第 $k$ 个位置上的结点。
        查找成功则**输出**该结点的 $\texttt{data}$ 并**返回 1**，否则只返回 0。
      `,
      wrong: String.raw`
        用了==两趟遍历==：第一趟求出链表长度，算出倒数第 $k$ 个的正向位序，第二趟再走过去。

        代码里还有两处：==直接 $\texttt{return ptr->data}$==（没有 $\texttt{printf}$、返回值语义也错了）；
        ==指针从 $\texttt{list}$（头结点）开始计数==，长度把头结点也算进去了。
      `,
      right: String.raw`
        ==双指针一趟遍历==：$p$、$q$ 都从**首元结点** $\texttt{list->link}$ 出发，
        让 $p$ 先独走 $k$ 步，之后两者同步前进；$p$ 到 $\texttt{NULL}$ 时 $q$ 即为答案。

        ~~~c
        int Search_k(LinkList list, int k) {
            LNode *p = list->link, *q = list->link;
            int count = 0;
            while (p != NULL) {
                if (count < k) count++;      // 先拉开 k 的间距
                else q = q->link;            // 之后同步走
                p = p->link;
            }
            if (count < k) return 0;         // 表长不足 k
            printf("%d", q->data);           // ← 题目要求"输出"
            return 1;                        // ← 题目要求返回 1
        }
        ~~~
      `,
      why: String.raw`
        **根因**：两趟法的复杂度也是 $O(n)$，==所以"看起来没错"==，
        但题面写的是"**尽可能高效**"——==这五个字就是在暗示存在一趟解法==。

        **三条可执行的自查**：
        1. ==看到"尽可能高效"，先问"能不能一趟"==；
        2. ==返回值严格照抄题面的措辞==（"输出 data 并返回 1"是两件事）；
        3. ==带头结点的题，指针一律从 $\texttt{list->link}$ 起步==，别把头结点数进长度。

        **通法**：把"倒数第 $k$ 个"转成"两个指针相距 $k$"，
        前面那个到头时后面那个就位 —— ==这是所有"倒数"类链表题的统一手法==。
      `,
      link: 'ds/list/list-algo?at=ex-kth' },

    { t: 'card',
      id: 'c-common-suffix-ptr',
      date: '2026-08-22',
      where: '链表 · 公共后缀',
      q: String.raw`
        两个带头结点的单链表共享公共后缀（呈 Y 字形），
        求公共后缀的起始结点。**比较时该比什么？**
      `,
      options: [
        { k: 'A', c: String.raw`比较 $\texttt{p->data == q->data}$` },
        { k: 'B', c: String.raw`比较指针本身 $\texttt{p == q}$` },
      ],
      answer: 'B',
      right: String.raw`
        ==必须比较**指针**，不能比 $\texttt{data}$。==

        题目说的是"==共享相同的后缀**存储空间**=="，
        即两条链走到了**同一个结点**上。
        两个恰好值相同但地址不同的结点会被 $\texttt{data}$ 比较==误判成交点==。

        标准解法（表长差值法）：求出两表长度 → 长的先走 $|len_1-len_2|$ 步
        → 同步后移，第一次 $\texttt{p == q}$ 即为答案。时间 $O(m+n)$，空间 $O(1)$。
      `,
      why: String.raw`
        **根因**：把"共享存储空间"读成了"内容相同"。

        **一句话自查**：==题面出现"共享""同一个结点""存储映像"，一律比指针==。

        **顺带一个坑**：若用更巧的"[轨迹切换法](#/ds/list/list-algo?at=swap-track)"，
        必须==让指针先走到 $\texttt{NULL}$ 再切换==，
        跳过 $\texttt{NULL}$ 直接切会在"无公共后缀"时==死循环==；
        而且 $\texttt{return}$ 要写在循环**外面**。
      `,
      link: 'ds/list/list-algo?at=ex-common-suffix' },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'seq', c: '顺序表' },

    { t: 'card',
      id: 'c-rotate-three-reverse',
      date: '2026-08-22',
      where: '顺序表 · 循环左移',
      q: String.raw`
        把长度为 $n$ 的数组 $R$ 循环左移 $p$ 位（$0<p<n$），
        要求时间和空间都尽可能高效。写出基本设计思想与复杂度。
      `,
      right: String.raw`
        ==三次逆置==，时间 $O(n)$、空间 $O(1)$。两种等价写法：

        | | 第 1 步 | 第 2 步 | 第 3 步 |
        |---|---|---|---|
        | **先分段** | $\mathrm{Rev}(0,p-1)$ | $\mathrm{Rev}(p,n-1)$ | $\mathrm{Rev}(0,n-1)$ |
        | **先整体** | $\mathrm{Rev}(0,n-1)$ | $\mathrm{Rev}(0,n-p-1)$ | $\mathrm{Rev}(n-p,n-1)$ |

        依据是 $(A^{\mathrm{R}}B^{\mathrm{R}})^{\mathrm{R}}=BA$。
      `,
      why: String.raw`
        **这题做对了，记的是它的陷阱**：

        ==两种写法的分界点不一样== —— 先分段的切在 $p$，先整体的切在 ==$n-p$==。
        ==记混了顺序却没改下标，就会移错位数==，这是这道题唯一真正的坑。

        **另外两点**：
        - $\mathrm{Rev}$ 的循环上界是 $\dfrac{to-from+1}{2}$，==写成 $to-from$ 会翻回去==；
        - 题目若没限定 $0<p<n$，==入口要先做 $p\ \%{=}\ n$==。

        **答题格式**：真题按"设计思想 / 代码 / 复杂度"三段给分，==只写代码丢一半==。
      `,
      link: 'ds/list/seq-list?at=ex-rotate' },

  ],
});
