/* ==========================================================================
   计算机组成原理 / 3 存储系统 / Cache 写策略与命中率计算
   —— 读只是"取副本"，写是"造分歧"。写策略回答的唯一问题是：
      Cache 被改了之后，【主存什么时候跟上】。
      访存次数题（取指 / 取数 / 写数各走一遍两级）也归在这一页。
   ========================================================================== */

KM.page({
  path: 'co/memory/cache-write',
  title: 'Cache 写策略与命中率计算',
  subtitle: '读只是取一份副本，写却在**制造两个版本** —— 写策略要定的是「主存什么时候跟上」',
  tags: ['高频', '必考', '易错', '手算'],
  updated: '2026-08-15',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'why', c: '一、读和写为什么不对称' },

    { t: 'key', id: 'read-vs-write', title: '读命中什么也没改变，写命中立刻制造不一致', c: String.raw`
      Cache 里放的是主存的**副本**。这个词是理解全部写策略的起点：

      - **读命中**：从副本上读一份出来，==主存和 Cache 仍然一模一样==，
        没有任何后续动作要做；
      - **写命中**：改的只是副本。==改完的那一瞬间，同一个地址有了两个不同的值==
        —— Cache 里是新的，主存里是旧的。

      所以读策略几乎不用讨论，==写策略是必须做的一个选择==：
      **要么立刻让主存跟上（写直达），要么记下"这块脏了"、等它被换出去时再说（写回）。**

      注意这不是"哪个更好"的问题，而是==拿访存带宽换一致性==的取舍。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'hit', c: '二、写命中：写直达 与 写回' },

    { t: 'key', id: 'write-through', title: '写直达（Write Through / 全写法）', c: String.raw`
      ==每次写命中，同时写 Cache 和主存。==

      - Cache 行==不需要脏位==，因为它永远和主存一致；
      - 被替换出去时==直接丢弃即可==，不用写回；
      - 代价：==每一条写指令都实打实地访问一次主存==，写操作完全没被 Cache 加速。

      **写缓冲（Write Buffer）** 是给它打的补丁：
      CPU 把要写的数据丢进一个小 FIFO 就继续走，由缓冲慢慢往主存写。
      ==它让 CPU 不必"等"这次访存，但那一次主存访问依然会发生。==

      ==考试里问"访问主存多少次"时，写缓冲不减少次数==——
      除非题目明说要算的是"CPU 停顿时间"。
    ` },

    { t: 'key', id: 'write-back', title: '写回（Write Back / 回写法）', c: String.raw`
      ==写命中时只改 Cache，把该行的**脏位（dirty bit）** 置 1，主存暂时不动。==

      - 主存只在这一行==被替换出去==时才被写一次；
      - 替换时先看脏位：==脏才写回，不脏直接覆盖==；
      - 一行里连续写十次，主存也只被写一次 —— ==写操作真正享受到了局部性==；
      - 代价：主存在一段时间内==持有过时数据==。这在单处理器里没问题，
        但一旦有别的主设备也读主存，就出事了 ——
        [DMA 读到过时数据](#/co/io/dma?at=coherency)正是这个后果。

      每行多出的那 1 位脏位，是==算 Cache 总容量（含标记项）时容易漏掉的一位==。
    ` },

    { t: 'diagram', id: 'wt-wb-timeline', title: '同一串写操作，两种策略下主存被访问几次',
      note: '琥珀格 = 一次真正的主存访问',
      caption: String.raw`==写回省下的是"中间那几次"==，不是"每一次"。所以题目里给的写次数、以及"是否同一行"，才是决定答案的关键。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 350" role="img" aria-label="同一串写操作在写直达与写回两种策略下访问主存的次数对比">
  <text class="cap" x="0" y="14">对同一个 Cache 行里的 4 个字连写 4 次，之后该行被替换</text>
  <text class="lb" x="198" y="36" text-anchor="middle">写 1</text>
  <text class="lb" x="304" y="36" text-anchor="middle">写 2</text>
  <text class="lb" x="410" y="36" text-anchor="middle">写 3</text>
  <text class="lb" x="516" y="36" text-anchor="middle">写 4</text>
  <text class="lb" x="622" y="36" text-anchor="middle">替换</text>
  <text class="cap" x="0" y="62">① 写直达：每次写都下到主存</text>
  <text class="lb" x="142" y="86" text-anchor="end" dominant-baseline="central">Cache</text>
  <g class="n g"><rect x="150" y="72" width="96" height="28" rx="4"/><text class="bt xs" x="198.0" y="86.0" text-anchor="middle" dominant-baseline="central">✔</text></g>
  <g class="n g"><rect x="256" y="72" width="96" height="28" rx="4"/><text class="bt xs" x="304.0" y="86.0" text-anchor="middle" dominant-baseline="central">✔</text></g>
  <g class="n g"><rect x="362" y="72" width="96" height="28" rx="4"/><text class="bt xs" x="410.0" y="86.0" text-anchor="middle" dominant-baseline="central">✔</text></g>
  <g class="n g"><rect x="468" y="72" width="96" height="28" rx="4"/><text class="bt xs" x="516.0" y="86.0" text-anchor="middle" dominant-baseline="central">✔</text></g>
  <g class="n m"><rect x="574" y="72" width="96" height="28" rx="4"/><text class="bt xs" x="622.0" y="86.0" text-anchor="middle" dominant-baseline="central">丢弃</text></g>
  <text class="lb" x="142" y="118" text-anchor="end" dominant-baseline="central">主存</text>
  <g class="n a"><rect x="150" y="104" width="96" height="28" rx="4"/><text class="bt xs" x="198.0" y="118.0" text-anchor="middle" dominant-baseline="central">✔ 访存</text></g>
  <g class="n a"><rect x="256" y="104" width="96" height="28" rx="4"/><text class="bt xs" x="304.0" y="118.0" text-anchor="middle" dominant-baseline="central">✔ 访存</text></g>
  <g class="n a"><rect x="362" y="104" width="96" height="28" rx="4"/><text class="bt xs" x="410.0" y="118.0" text-anchor="middle" dominant-baseline="central">✔ 访存</text></g>
  <g class="n a"><rect x="468" y="104" width="96" height="28" rx="4"/><text class="bt xs" x="516.0" y="118.0" text-anchor="middle" dominant-baseline="central">✔ 访存</text></g>
  <g class="n m"><rect x="574" y="104" width="96" height="28" rx="4"/><text class="bt xs" x="622.0" y="118.0" text-anchor="middle" dominant-baseline="central">——</text></g>
  <text class="lb" x="150" y="154">共访问主存 4 次</text>
  <text class="cap" x="0" y="186">② 写回：只在换出时写一次</text>
  <text class="lb" x="142" y="210" text-anchor="end" dominant-baseline="central">Cache</text>
  <g class="n g"><rect x="150" y="196" width="96" height="28" rx="4"/><text class="bt xs" x="198.0" y="210.0" text-anchor="middle" dominant-baseline="central">✔ 脏位=1</text></g>
  <g class="n g"><rect x="256" y="196" width="96" height="28" rx="4"/><text class="bt xs" x="304.0" y="210.0" text-anchor="middle" dominant-baseline="central">✔ 脏位=1</text></g>
  <g class="n g"><rect x="362" y="196" width="96" height="28" rx="4"/><text class="bt xs" x="410.0" y="210.0" text-anchor="middle" dominant-baseline="central">✔ 脏位=1</text></g>
  <g class="n g"><rect x="468" y="196" width="96" height="28" rx="4"/><text class="bt xs" x="516.0" y="210.0" text-anchor="middle" dominant-baseline="central">✔ 脏位=1</text></g>
  <g class="n a"><rect x="574" y="196" width="96" height="28" rx="4"/><text class="bt xs" x="622.0" y="210.0" text-anchor="middle" dominant-baseline="central">脏 → 写回</text></g>
  <text class="lb" x="142" y="242" text-anchor="end" dominant-baseline="central">主存</text>
  <g class="n m"><rect x="150" y="228" width="96" height="28" rx="4"/><text class="bt xs" x="198.0" y="242.0" text-anchor="middle" dominant-baseline="central">不动</text></g>
  <g class="n m"><rect x="256" y="228" width="96" height="28" rx="4"/><text class="bt xs" x="304.0" y="242.0" text-anchor="middle" dominant-baseline="central">不动</text></g>
  <g class="n m"><rect x="362" y="228" width="96" height="28" rx="4"/><text class="bt xs" x="410.0" y="242.0" text-anchor="middle" dominant-baseline="central">不动</text></g>
  <g class="n m"><rect x="468" y="228" width="96" height="28" rx="4"/><text class="bt xs" x="516.0" y="242.0" text-anchor="middle" dominant-baseline="central">不动</text></g>
  <g class="n a"><rect x="574" y="228" width="96" height="28" rx="4"/><text class="bt xs" x="622.0" y="242.0" text-anchor="middle" dominant-baseline="central">✔ 访存</text></g>
  <text class="lb" x="150" y="278">共访问主存 1 次</text>
  <g class="n k"><rect x="20" y="292" width="656" height="46" rx="8"/><text class="bt sm" x="348.0" y="305.0" text-anchor="middle" dominant-baseline="central">反过来：只写一次就被换出时，两者都是 1 次</text><text class="bs" x="348.0" y="325.0" text-anchor="middle" dominant-baseline="central">写回赢在「同一行被反复写」，靠的还是局部性</text></g>
</svg>
` },

    { t: 'compare', id: 'wt-wb-table', title: '两种写命中策略的全部差别',
      cols: ['', '写直达 Write Through', '写回 Write Back'],
      rows: [
        ['写命中时',       '同时写 Cache 和主存',            '只写 Cache，置脏位'],
        ['需要脏位吗',     '**不需要**',                     '**需要**（每行 1 位）'],
        ['行被替换时',     '直接丢弃',                       '脏则写回，不脏则丢弃'],
        ['主存一致性',     '**始终一致**',                   '**允许暂时不一致**'],
        ['写操作的访存量', '**每次写都访存一次**',           '被换出时才访存，通常少得多'],
        ['控制复杂度',     '简单',                           '较复杂（要管脏位）'],
        ['多核 / DMA 场合','天然友好',                       '必须额外做一致性维护'],
        ['典型用在',       '一级 Cache、对一致性敏感的场合',  '现代多级 Cache 的主流做法'],
      ] },

    /* ================================================================== */
    { t: 'h', id: 'miss', c: '三、写不命中：写分配 与 非写分配' },

    { t: 'key', id: 'allocate', title: '要不要为"写"把整块调进 Cache', c: String.raw`
      写不命中时多出一个问题：==这个块要不要先读进 Cache 再写==？

      | 策略 | 做法 | 想法 |
      |---|---|---|
      | **写分配 Write Allocate** | 先把块从主存调入 Cache，再在 Cache 里写 | 赌==接下来还会访问这一块==（局部性） |
      | **非写分配 Not Write Allocate** | ==直接写主存，不调块进 Cache== | 赌==写完就不再碰它了==（比如初始化一大片内存） |

      **固定搭配（记这两组就够）**：

      - ==写回法 + 写分配==：既然要靠反复写来摊薄成本，就得先把块弄进来；
      - ==写直达法 + 非写分配==：反正每次写都要下主存，调块进来也省不了什么。

      **这两组是默认约定**，题目不特别说明时就按它们判断。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'count', c: '四、★ 一条指令到底访问几次主存' },

    { t: 'method', id: 'count-method', title: '数访存次数：先拆成"几段"，再逐段问"能不能挡下来"', c: String.raw`
      这类题看着像 Cache 题，其实考的是==把一条指令拆成几次存储访问，
      再让每一次都过一遍存储层次==。三步：

      1. **拆段**。一条指令最多产生三类访存：
         ==取指令==、==取操作数==、==写结果==。
         看清指令的寻址方式，间接寻址还要多一次取地址。
      2. **每段都要先翻译地址**。页式虚存下，虚地址→物理地址要查页表。
         ==TLB 命中就不访存；TLB 缺失才去主存查页表==（这是很多人漏掉的一次）。
      3. **每段再过一遍 Cache**。==读：命中就不访存==；
         ==写：看写策略== —— 写直达==必然访存一次==，写回则不访存（只置脏位）。

      ==把三段的结果加起来，就是这条指令的访存次数。==
    ` },

    { t: 'diagram', id: 'access-chain', title: '每一段访存都要闯两道关',
      note: '两关分别是地址翻译（TLB）和数据（Cache）',
      caption: String.raw`==这张图是"至少访存几次"这类题的模板==：先数有几段访存（取指、取数、写数），每段各过两关，再按题目问的是最少还是最多取值。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 498" role="img" aria-label="一段访存要先过 TLB 再过 Cache，各种命中与缺失组合下的主存访问次数">
  <text class="cap" x="0" y="14">一段访存（取指 / 取数 / 写数 各走一遍）</text>
  <g class="n k"><rect x="270" y="26" width="160" height="40" rx="8"/><text class="bt sm" x="350.0" y="46.0" text-anchor="middle" dominant-baseline="central">虚拟地址</text></g>
  <path class="ar" d="M350,66 V88"/>
  <g class="n g"><rect x="270" y="92" width="160" height="46" rx="8"/><text class="bt sm" x="350.0" y="115.0" text-anchor="middle" dominant-baseline="central">第一关：TLB</text></g>
  <path class="ar plain" d="M270,115 H150 V115"/>
  <text class="lb" x="20" y="110">命中 → 不访存</text>
  <path class="ar" d="M430,115 H560"/>
  <text class="lb" x="448" y="108">缺失 → 查页表 ★访存</text>
  <path class="ar" d="M350,138 V162"/>
  <g class="n k"><rect x="270" y="166" width="160" height="40" rx="8"/><text class="bt sm" x="350.0" y="186.0" text-anchor="middle" dominant-baseline="central">物理地址</text></g>
  <path class="ar" d="M350,206 V230"/>
  <g class="n g"><rect x="270" y="234" width="160" height="46" rx="8"/><text class="bt sm" x="350.0" y="257.0" text-anchor="middle" dominant-baseline="central">第二关：Cache</text></g>
  <g class="n g"><rect x="20" y="300" width="214" height="48" rx="8"/><text class="bt xs" x="127.0" y="314.0" text-anchor="middle" dominant-baseline="central">读命中</text><text class="bs" x="127.0" y="334.0" text-anchor="middle" dominant-baseline="central">不访存</text></g>
  <g class="n a"><rect x="242" y="300" width="214" height="48" rx="8"/><text class="bt xs" x="349.0" y="314.0" text-anchor="middle" dominant-baseline="central">读缺失</text><text class="bs" x="349.0" y="334.0" text-anchor="middle" dominant-baseline="central">★访存（调块）</text></g>
  <g class="n a"><rect x="464" y="300" width="214" height="48" rx="8"/><text class="bt xs" x="571.0" y="314.0" text-anchor="middle" dominant-baseline="central">写命中 · 写直达</text><text class="bs" x="571.0" y="334.0" text-anchor="middle" dominant-baseline="central">★访存</text></g>
  <g class="n g"><rect x="20" y="356" width="214" height="48" rx="8"/><text class="bt xs" x="127.0" y="370.0" text-anchor="middle" dominant-baseline="central">写命中 · 写回</text><text class="bs" x="127.0" y="390.0" text-anchor="middle" dominant-baseline="central">不访存</text></g>
  <g class="n a"><rect x="242" y="356" width="214" height="48" rx="8"/><text class="bt xs" x="349.0" y="370.0" text-anchor="middle" dominant-baseline="central">写缺失</text><text class="bs" x="349.0" y="390.0" text-anchor="middle" dominant-baseline="central">★访存</text></g>
  <text class="cap" x="0" y="428">★ = 一次真正的主存访问</text>
  <g class="n k"><rect x="20" y="440" width="320" height="46" rx="8"/><text class="bt sm" x="180.0" y="453.0" text-anchor="middle" dominant-baseline="central">问【至少】</text><text class="bs" x="180.0" y="473.0" text-anchor="middle" dominant-baseline="central">每一关都当成命中，只留机制上省不掉的 ★</text></g>
  <g class="n r"><rect x="356" y="440" width="320" height="46" rx="8"/><text class="bt sm" x="516.0" y="453.0" text-anchor="middle" dominant-baseline="central">问【最多】</text><text class="bs" x="516.0" y="473.0" text-anchor="middle" dominant-baseline="central">每一关都当成缺失，一个一个加起来</text></g>
</svg>
` },

    { t: 'warn', id: 'at-least', title: '「至少」两个字是这类题的题眼', c: String.raw`
      问==至少==，就是问==最理想的情况下还剩几次躲不掉的访存==。所以：

      - TLB ==一律按命中算==（不访存）；
      - 取指、取数 ==一律按 Cache 命中算==（不访存）；
      - 只剩下==写策略强制要求的那些次数==躲不掉。

      于是结论极其干脆：

      - ==写直达 $\Rightarrow$ 至少 $1$ 次==（写必须同步到主存）；
      - ==写回 $\Rightarrow$ 至少 $0$ 次==（写命中只置脏位，一次主存都不碰）。

      ==看到"至少"就先去题面里找写策略==，那一行字直接决定答案。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'ex', c: '五、例题' },

    { t: 'example', id: 'ex-add-xaddr',
      title: '一条 add 指令最少访问几次主存',
      level: 3,
      problem: String.raw`
        假定编译器将赋值语句 $\texttt{x=x+3;}$ 转换为指令
        $\texttt{add xaddr, 3}$，其中 $\texttt{xaddr}$ 是 $\texttt{x}$ 对应的存储单元地址。
        若执行该指令的计算机采用==页式虚拟存储管理方式==，并配有相应的 ==TLB==，
        且 Cache 使用==直写（Write Through）==方式，
        则完成该指令功能需要访问主存的次数至少是（　　）。

        **A.** $0$　　**B.** $1$　　**C.** $2$　　**D.** $3$
      `,
      idea: String.raw`
        题面把三样东西一起摆出来 —— ==页式虚存 + TLB + 写直达== ——
        它们分别负责挡掉一类访存，==只有最后一样挡不住写==：

        | 题面给的条件 | 它挡掉了什么 |
        |---|---|
        | 配有 TLB | 地址翻译==可以不访存== |
        | 有 Cache（隐含） | 取指和取数==可以不访存== |
        | 写直达 | ==挡不住写==，每次写都得下主存 |

        再看"==至少=="：这两个字是在说"==允许你假设一切能命中的都命中=="。
        于是==前两行全部归零，答案完全由第三行决定==。

        换句话说，这题真正问的只有一句：
        ==写直达方式下，一次写操作躲得掉主存吗？躲不掉。==
      `,
      solution: String.raw`
        $\texttt{add xaddr, 3}$ 的功能是==读出 $\texttt{x}$、加 3、再写回 $\texttt{x}$==，
        拆成三段访存逐段看：

        | 段 | 地址翻译 | 数据访问 | 访存次数 |
        |---|---|---|---|
        | ① 取指令 | TLB 命中 $\Rightarrow$ 不访存 | 指令在 Cache 中命中 $\Rightarrow$ 不访存 | $0$ |
        | ② 取操作数 $\texttt{x}$ | TLB 命中 $\Rightarrow$ 不访存 | ==Cache 读命中 $\Rightarrow$ 不访存== | $0$ |
        | ③ 写回 $\texttt{x}$ | TLB 命中 $\Rightarrow$ 不访存 | Cache 写命中，==但写直达要求同时写主存== | $\mathbf{1}$ |

        加法在 CPU 内部完成，不产生访存。

        $$\text{总计} = 0 + 0 + 1 = 1 \quad\Rightarrow\quad \text{选 B}$$

        ==唯一躲不掉的那一次，是写直达强加的。==
      `,
      comment: String.raw`
        **把四个选项都反推一遍**：

        | 选项 | 它是哪种想法的产物 |
        |---|---|
        | **A. 0** | ==把写策略看成了写回==（或者忘了写直达要同步主存）。如果题面改成"写回"，==答案就真的是 0== |
        | **B. 1** | ✅ 三段里只有"写"躲不掉 |
        | **C. 2** | ==算上了"取操作数"那一次==——以为读 $\texttt{x}$ 一定要去主存，忘了 Cache 读命中 |
        | **D. 3** | 取指、取数、写数三次全按访存算，==等于当 Cache 和 TLB 不存在== |

        **改一个条件，答案就变**（这题最好的用法是当模板）：

        | 题面改成 | 答案 | 理由 |
        |---|---|---|
        | Cache 用==写回==方式 | $0$ | 写命中只置脏位，主存一次都不碰 |
        | ==没有 TLB== | $\ge 3$ | 取指、取数、写数各要先去主存查一次页表 |
        | 指令改成==间接寻址== | 再多一段 | 多一次"取有效地址" |
        | 问"==最多==访问几次" | 每一关都按缺失算 | TLB 缺失查页表、取指缺失调块、取数缺失调块…… |

        同一台机器上，[DMA 也在读写主存](#/co/io/dma?at=coherency)，
        那里写回法带来的不一致就不再是"暂时"的小事了 ——
        ==写直达在多主设备场合的价值，正是这道题没说出口的另一半==。
      ` },

    /* ================================================================== */
    { t: 'h', id: 'amat', c: '六、命中率与平均访问时间' },

    { t: 'formulas', id: 'amat-formulas', title: '两套公式，取决于"是否先查 Cache 再访存"', items: [
      { label: '命中率',           tex: String.raw`h=\dfrac{N_c}{N_c+N_m}` },
      { label: '缺失率',           tex: String.raw`1-h` },
      { label: '同时访问（并行）', tex: String.raw`t_a=h\,t_c+(1-h)\,t_m` },
      { label: '先后访问（串行）', tex: String.raw`t_a=t_c+(1-h)\,t_m` },
      { label: '访问效率',         tex: String.raw`e=\dfrac{t_c}{t_a}` },
      { label: '加速比',           tex: String.raw`S=\dfrac{t_m}{t_a}` },
    ] },

    { t: 'warn', id: 'amat-trap', title: '两套公式选错就全错', c: String.raw`
      $t_m$ 是==访问一次主存的时间==，不是"缺失损失"。两套公式的差别在于
      ==缺失时那次 Cache 访问的时间算不算重复付==：

      - **同时访问**：CPU 同时向 Cache 和主存发请求，缺失时==主存访问已经在路上了==，
        所以缺失分支只算 $t_m$；
      - **先后访问**：先查 Cache，==确认缺失后才去主存==，
        缺失分支要付 $t_c+t_m$，合并后就是 $t_c+(1-h)\,t_m$。

      ==题目不说明时，"先访问 Cache，未命中再访问主存"这种表述就是串行==。

      **写策略会插进来**：写直达下，==每条写指令都强制访问一次主存==，
      算平均访问时间时要按读写比例分开算，==不能只用一个命中率一笔带过==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '七、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **问"至少"时把读也算成访存** —— ==读命中不访存==，
         见[那道 add 指令题](#/co/memory/cache-write?at=ex-add-xaddr)。
      2. **忘了写直达每次写都要访存** —— 这是==写直达唯一的代价==，也常常就是答案本身。
      3. **以为写缓冲能减少访存次数** —— ==它减少的是 CPU 等待时间，不是访存次数==。
      4. **写回法忘了脏位** —— 算 Cache 总容量时==每行要多 1 位==；
         替换时==不脏的行不用写回==。
      5. **搭配记反** —— ==写回配写分配，写直达配非写分配==。
      6. **忘了 TLB 缺失也要访存** —— TLB 缺失时==要去主存查页表==，
         题目问"最多"时这一次必须算上。
      7. **把 $t_m$ 当成"缺失损失"** —— 见[两套公式的区别](#/co/memory/cache-write?at=amat-trap)。
      8. **认为写回法在单核里也有一致性问题** —— 单核没问题，
         ==出事的是有第二个主设备读主存的时候==（DMA、多核）。
    ` },

    { t: 'md', c: String.raw`
      ---

      这道题的错点已经记进错题本：[读命中不访存](#/review/co/memory?at=c-write-through-min)。
      往下一格：[DMA 与 Cache 的一致性](#/co/io/dma?at=coherency)。
    ` },

  ],
});
