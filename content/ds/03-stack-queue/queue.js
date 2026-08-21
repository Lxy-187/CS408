/* ==========================================================================
   数据结构 / 3 栈、队列与数组 / 队列与循环队列的判空判满
   ========================================================================== */

KM.page({
  path: 'ds/stack-queue/queue',
  title: '队列与循环队列',
  subtitle: '一端进一端出 —— 以及"$front == rear$ 到底是空还是满"这个必须靠约定解决的歧义',
  tags: ['高频', '必考', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'def', c: '一、定义与假溢出' },

    { t: 'key', id: 'basic', title: '队列：先进先出（FIFO）', c: String.raw`
      **队列**是==只允许在一端（队尾）插入、在另一端（队头）删除==的线性表。

      - **队头 front**：删除的那一端；
      - **队尾 rear**：插入的那一端；
      - **特性**：==先进先出（FIFO, First In First Out）==。

      和[栈](#/ds/stack-queue/stack?at=basic)一样，==队列也是"操作受限的线性表"==。
    ` },

    { t: 'key', id: 'false-overflow', title: '★ 假溢出：为什么必须做成"循环"的', c: String.raw`
      用普通数组实现队列时，入队 $\texttt{rear++}$、出队 $\texttt{front++}$，
      ==两个指针都只增不减，一路向右爬==。

      于是会出现这种局面：==$\texttt{rear}$ 已经到了数组末尾（"满"了），
      但前面被出队腾出的格子全空着==。

      $$\text{[已出队][已出队][已出队]}\ \underbrace{\text{[a][b][c]}}_{\text{有效数据}}\ \Big|\ \texttt{rear 到头了}$$

      这叫**假溢出（false overflow）** —— ==数组没满，队列却说自己满了==。

      **解决办法**：把数组==首尾相接看成一个环==，指针走到末尾就绕回 0：

      $$\texttt{rear = (rear + 1) \% MaxSize},\qquad \texttt{front = (front + 1) \% MaxSize}$$

      这就是**循环队列**。==取模运算就是"绕回去"的全部实现==。
    ` },

    { t: 'diagram', id: 'circular-demo', title: '循环队列：数组首尾相接',
      note: 'MaxSize = 8，队中现有 c、d、e 三个元素',
      caption: String.raw`下标 $7$ 的下一个是 $0$ —— ==这就是取模在干的事==。
      图中 $\texttt{front}=2$ 指向队头元素 $c$，$\texttt{rear}=5$ 指向队尾元素的下一个位置。
      ==注意 $\texttt{rear}$ 指的是"下一个要放的位置"，不是最后一个元素==，
      这是 408 的默认约定。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 244" role="img" aria-label="循环队列的环形结构与 front、rear 指针">
  <path class="ar plain" d="M200,50 A80,80 0 0,1 280,130"/>
  <path class="ar plain" d="M280,130 A80,80 0 0,1 200,210"/>
  <path class="ar plain" d="M200,210 A80,80 0 0,1 120,130"/>
  <path class="ar plain" d="M120,130 A80,80 0 0,1 200,50"/>
  <g class="n m"><rect x="184" y="36" width="32" height="28" rx="4"/><text class="bt xs" x="200" y="50" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="240" y="60" width="32" height="28" rx="4"/><text class="bt xs" x="256" y="74" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="264" y="116" width="32" height="28" rx="4"/><text class="bt xs" x="280" y="130" text-anchor="middle" dominant-baseline="central">c</text></g>
  <g class="n g"><rect x="240" y="172" width="32" height="28" rx="4"/><text class="bt xs" x="256" y="186" text-anchor="middle" dominant-baseline="central">d</text></g>
  <g class="n g"><rect x="184" y="196" width="32" height="28" rx="4"/><text class="bt xs" x="200" y="210" text-anchor="middle" dominant-baseline="central">e</text></g>
  <g class="n a"><rect x="128" y="172" width="32" height="28" rx="4"/><text class="bt xs" x="144" y="186" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n m"><rect x="104" y="116" width="32" height="28" rx="4"/><text class="bt xs" x="120" y="130" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n m"><rect x="128" y="60" width="32" height="28" rx="4"/><text class="bt xs" x="144" y="74" text-anchor="middle" dominant-baseline="central">7</text></g>
  <text class="lb em" x="316" y="122">front = 2</text>
  <text class="lb em" x="316" y="140">（指向队头元素 c）</text>
  <text class="lb em" x="14" y="190">rear = 5</text>
  <text class="lb em" x="14" y="208">（下一个放这里）</text>
  <text class="cap" x="200" y="238" text-anchor="middle">7 的下一个是 0</text>
  <g class="n k"><rect x="420" y="40" width="266" height="88" rx="7"/>
    <text class="bt sm" x="553" y="60" text-anchor="middle" dominant-baseline="central">元素个数（三种方案通用）</text>
    <text class="bs" x="553" y="86" text-anchor="middle" dominant-baseline="central">(rear − front + MaxSize) % MaxSize</text>
    <text class="bs" x="553" y="110" text-anchor="middle" dominant-baseline="central">本图 = (5 − 2 + 8) % 8 = 3 ✓</text></g>
  <text class="cap" x="400" y="160">入队：data[rear] = x; rear = (rear+1)%M</text>
  <text class="cap" x="400" y="184">出队：x = data[front]; front = (front+1)%M</text>
  <text class="cap" x="400" y="214">加 MaxSize 防止 rear &lt; front 时算出负数</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'full-empty', c: '二、★ 判空与判满的三种方案' },

    { t: 'key', id: 'the-problem', title: '问题出在哪', c: String.raw`
      入队让 $\texttt{rear}$ 前进，出队让 $\texttt{front}$ 前进。
      ==队空时 $\texttt{front} = \texttt{rear}$；而队满时 $\texttt{rear}$ 追了一圈回来，
      也是 $\texttt{front} = \texttt{rear}$==。

      $$\text{同一个条件，两种含义} \Rightarrow \text{必须额外引入信息来区分}$$

      三种方案分别引入了：==牺牲一个单元==、==一个计数器==、==一个标志位==。
    ` },

    { t: 'compare', id: 'three-schemes', title: '三种方案对照（必背）',
      cols: ['方案', '判空', '判满', '能装几个', '代价'],
      rows: [
        ['**① 牺牲一个单元**', '`Q.front == Q.rear`',
         '`(Q.rear+1)%MaxSize == Q.front`', '==MaxSize − 1==', '浪费一个格子'],
        ['**② 增设 size 计数**', '`Q.size == 0`', '`Q.size == MaxSize`',
         '==MaxSize==', '每次增删都要维护 size'],
        ['**③ 增设 tag 标志**', '`Q.front==Q.rear && tag==0`',
         '`Q.front==Q.rear && tag==1`', '==MaxSize==', '每次增删都要设 tag'],
      ] },

    { t: 'key', id: 'scheme-detail', title: '三种方案的细节', c: String.raw`
      **① 牺牲一个存储单元（408 默认方案）**

      ==队满时故意让 $\texttt{rear}$ 与 $\texttt{front}$ 之间留一个空格==，
      于是 $\texttt{front == rear}$ 就只可能表示"空"。

      $$\text{队满}:\ \texttt{(rear + 1) \% MaxSize == front}$$

      ==代价是数组容量 $\texttt{MaxSize}$ 只能装 $\texttt{MaxSize}-1$ 个元素==。
      这是选择题最爱考的一句话。

      **② 增设元素个数 $\texttt{size}$**

      入队 $\texttt{size++}$，出队 $\texttt{size--}$。
      ==空间用满，但每次操作多一步维护==。

      **③ 增设标志位 $\texttt{tag}$**

      - ==因**删除**导致 $\texttt{front == rear}$ → $\texttt{tag = 0}$（空）==；
      - ==因**插入**导致 $\texttt{front == rear}$ → $\texttt{tag = 1}$（满）==。

      口诀：==删空插满==。方向记反就全错了。
    ` },

    { t: 'code', id: 'queue-code', title: '循环队列（方案 ①）', lang: 'c',
      note: 'front 指向队头元素，rear 指向队尾元素的下一个位置',
      c: String.raw`
        #define MaxSize 50
        typedef struct {
            ElemType data[MaxSize];
            int front, rear;
        } SqQueue;

        void InitQueue(SqQueue *Q)  { Q->front = Q->rear = 0; }
        bool isEmpty(SqQueue Q)     { return Q.front == Q.rear; }
        bool isFull(SqQueue Q)      { return (Q.rear + 1) % MaxSize == Q.front; }

        bool EnQueue(SqQueue *Q, ElemType x) {
            if (isFull(*Q)) return false;
            Q->data[Q->rear] = x;                    // 先放，后移指针
            Q->rear = (Q->rear + 1) % MaxSize;
            return true;
        }

        bool DeQueue(SqQueue *Q, ElemType *x) {
            if (isEmpty(*Q)) return false;
            *x = Q->data[Q->front];                  // 先取，后移指针
            Q->front = (Q->front + 1) % MaxSize;
            return true;
        }
      ` },

    { t: 'warn', id: 'count-formula', title: '元素个数公式里的 $+\\texttt{MaxSize}$ 不能省', c: String.raw`
      $$\text{元素个数}=\big(\texttt{rear}-\texttt{front}+\texttt{MaxSize}\big)\ \bmod\ \texttt{MaxSize}$$

      ==$+\texttt{MaxSize}$ 是为了处理 $\texttt{rear} < \texttt{front}$ 的情况==
      （队尾已经绕回数组前段）。C 语言里负数取模的结果是负数，
      ==不加就会算出负的元素个数==。

      **例**：$\texttt{MaxSize}=8$，$\texttt{front}=6$，$\texttt{rear}=2$。
      $(2-6+8)\%8=4$ ✓（元素占了下标 $6,7,0,1$ 共 4 个）。
      不加的话是 $(2-6)\%8=-4$，错。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'link-queue', c: '三、链式队列与双端队列' },

    { t: 'key', id: 'link-queue-key', title: '链队列：两个指针，一头一尾', c: String.raw`
      用带头结点的单链表实现，==$\texttt{front}$ 指向头结点，$\texttt{rear}$ 指向尾结点==。

      - **入队**：在 $\texttt{rear}$ 之后挂新结点，$\texttt{rear}$ 后移，$O(1)$；
      - **出队**：删除头结点之后的那个结点，$O(1)$；
      - **判空**：==$\texttt{front == rear}$==（带头结点时）。

      **为什么用带头结点**：==出队时如果队里只剩一个元素，
      不带头结点就要同时修改 $\texttt{front}$ 和 $\texttt{rear}$==，得单独写分支；
      带头结点后==只有"队空后 rear 要指回头结点"这一处特判==。

      **链队列的优点**：==不会队满==（除非内存耗尽），也不存在假溢出问题。
      ==适合队列长度变化剧烈的场合==。
    ` },

    { t: 'key', id: 'deque', title: '双端队列及其两种受限形式', c: String.raw`
      **双端队列（deque）**：==两端都能插入、都能删除==的线性表。

      两种受限形式：

      | 名称 | 限制 |
      |---|---|
      | **输入受限的双端队列** | ==只允许一端插入==，两端都可删除 |
      | **输出受限的双端队列** | 两端都可插入，==只允许一端删除== |

      =="受限"限制的是**输入**（插入）还是**输出**（删除），别读反==。

      **常见考法**：给一个输出序列，问用哪种双端队列能得到。
      解法==仍然是模拟==：画两端，逐个元素试。

      **一条有用的性质**：==双端队列能实现的输出序列，包含了栈和队列能实现的所有序列==
      （因为它的操作是两者的超集），所以选项里出现"栈能做的"必然双端队列也能做。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '四、例题' },

    { t: 'example', id: 'ex-count',
      title: '★ 循环队列的元素个数与判满',
      source: '选择题高频',
      level: 2,
      problem: String.raw`
        设循环队列存放在数组 $\texttt{A[0..M-1]}$ 中，$\texttt{front}$ 指向队头元素，
        $\texttt{rear}$ 指向队尾元素的下一个位置。

        (1) 若 $M=50$，$\texttt{front}=45$，$\texttt{rear}=8$，队中有多少个元素？
        (2) 采用"牺牲一个单元"的方案时，该队列最多能存多少个元素？
        (3) 若改成 $\texttt{rear}$ 指向**队尾元素本身**（初始 $\texttt{front}=\texttt{rear}=0$，
        且规定初始时队中已"虚拟"占一格），判空与判满条件应如何写？
      `,
      idea: String.raw`
        (1) 直接套公式，==记得加 $M$==。

        (3) 这一问考的是"约定一变，所有条件都要跟着重推"。
        ==不要背条件，要现推==：画一个小数组（比如 $M=4$），
        手动入队出队几次，看什么时候 $\texttt{front}$ 和 $\texttt{rear}$ 相等。
      `,
      solution: String.raw`
        **(1)**
        $$(\texttt{rear}-\texttt{front}+M)\bmod M=(8-45+50)\bmod 50=13\bmod 50=\boxed{13}$$

        验证：元素占下标 $45,46,47,48,49,0,1,\dots,7$，共 $5+8=13$ 个 ✓

        **(2)** 牺牲一个单元后最多存 $\boxed{M-1=49}$ 个。

        **(3)** 若 $\texttt{rear}$ 指向队尾元素本身：

        - 入队变成 ==先移指针后放数==：$\texttt{rear = (rear+1)\%M; A[rear] = x;}$
        - 出队变成 ==先移指针后取数==：$\texttt{front = (front+1)\%M; x = A[front];}$
        - ==判空：$\texttt{front == rear}$==；
        - ==判满：$\texttt{(rear+1)\%M == front}$==（仍牺牲一个单元）；
        - ==元素个数：$(\texttt{rear}-\texttt{front}+M)\bmod M$==（不变）。

        此时 $\texttt{front}$ 指向的是==队头元素的前一个位置==。
      `,
      comment: String.raw`
        **(3) 揭示了这一节的本质**：
        ==$\texttt{front}$ / $\texttt{rear}$ 指哪、初值是多少，全都是约定==，
        题目怎么说就怎么推。==硬背一套条件，碰上换约定的题必错==。

        **推导的机械方法**：拿 $M=4$ 画四个格子，
        按题目的约定==手动做 4 次入队、2 次出队==，
        把每一步的 $\texttt{front}$、$\texttt{rear}$ 记下来，条件自然就看出来了。
        ==这个笨办法在考场上只要一分钟，比回忆公式可靠得多==。
      `,
    },

    { t: 'example', id: 'ex-deque',
      title: '双端队列的输出序列',
      source: '选择题',
      level: 3,
      problem: String.raw`
        设有一个**输入受限**的双端队列（==只允许从左端插入==，两端都可删除），
        输入序列为 $1,2,3,4$。

        (1) 能否得到输出序列 $4,2,1,3$？
        (2) 能否得到输出序列 $4,1,3,2$？
      `,
      idea: String.raw`
        ==画一条横线代表队列，元素只能从左边进==，出的时候两端都行。

        逐个尝试：每一步要么"从输入序列取下一个数从左端插入"，
        要么"从左端或右端删除一个"。==目标序列的下一个必须是当前两端之一==。
      `,
      solution: String.raw`
        **(1) 不能。**

        推理只有三步：

        1. 输出的第一个是 $4$，而 $4$ 是最后一个输入的，
           所以==在输出任何元素之前，$1,2,3,4$ 必须全部入队==；
        2. 插入只能从左端，所以入队完毕时队列==被完全确定==为
           $$\text{左}\ \underline{4\ \ 3\ \ 2\ \ 1}\ \text{右}$$
        3. 从左端输出 $4$ 后，队列是 $3\,2\,1$，==两端分别是 $3$ 和 $1$==，
           而目标序列要求下一个输出 $2$ —— ==取不到==。

        $$\Rightarrow\ 4,2,1,3\ \text{不可能得到}$$

        **(2) 能。**

        | 步骤 | 操作 | 队列（左 → 右） | 已输出 |
        |---|---|---|---|
        | 1 | 1 从左入 | 1 | |
        | 2 | 2 从左入 | 2 1 | |
        | 3 | 3 从左入 | 3 2 1 | |
        | 4 | 4 从左入 | 4 3 2 1 | |
        | 5 | 左端出 | 3 2 1 | 4 |
        | 6 | ==右端出== | 3 2 | 4 1 |
        | 7 | 左端出 | 2 | 4 1 3 |
        | 8 | 任一端出 | | ==4 1 3 2== ✓ |
      `,
      comment: String.raw`
        **答"不能"时必须说明理由**，直接写一句"不能"是拿不到分的。
        本题的理由链很短：==第一个输出是最后一个输入 $\Rightarrow$ 队列状态被完全确定
        $\Rightarrow$ 之后只能从两端取==，一步就能否掉。

        **这个"锁定状态"的技巧很通用**：
        只要输出序列里出现了"最后输入的元素排在最前面"，
        就说明==此时全部元素都已入队，队列内容是唯一确定的==，
        后面的推理立刻变得简单。

        **注意区分**：输入受限 = 只能一端**插入**；输出受限 = 只能一端**删除**。
        ==这两个词考试里经常换着出，读题时圈出来==。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **元素个数公式漏了 $+\texttt{MaxSize}$** —— $\texttt{rear} < \texttt{front}$ 时会算出负数。
      2. **牺牲一个单元时说容量是 $\texttt{MaxSize}$** —— ==是 $\texttt{MaxSize}-1$==。
      3. **tag 方案的方向记反** —— ==删空插满==：删除导致相等则空，插入导致相等则满。
      4. **换了 $\texttt{rear}$ 的约定还套老条件** —— ==所有条件都要重推==。
      5. **认为链队列也有"假溢出"** —— ==链式存储不存在这个问题==。
      6. **链队列不带头结点却不特判"队列变空"** —— 出队后 $\texttt{rear}$ 会成为野指针。
      7. **"输入受限"理解成"只能一端删除"** —— ==受限的是插入==。
      8. **认为队列不是线性表** —— 是==操作受限的线性表==。
      9. **入队时先移指针后放数（在 rear 指向空位的约定下）** —— ==应该先放后移==。
      10. **求元素个数时用 $\texttt{rear} - \texttt{front}$ 直接减** —— 只在没绕回时才对。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      这一节的所有麻烦都来自同一个根源：
      ==两个指针 + 一个环 = 状态空间比实际需要的少一位==。

      $\texttt{front}$ 和 $\texttt{rear}$ 一共能表示 $\texttt{MaxSize}$ 种"相对位置"，
      但队列的长度有 $\texttt{MaxSize}+1$ 种可能（$0$ 到 $\texttt{MaxSize}$）——
      ==鸽巢原理告诉我们必然有两种状态撞在一起==，撞的就是"空"和"满"。

      于是三种方案分别是：==砍掉一种状态==（牺牲单元）、
      ==额外存一个数==（size）、==额外存一位==（tag）。
      ==想通这一点，三种方案就不用背了，还能自己造出第四种==。
    ` },

  ],
});
