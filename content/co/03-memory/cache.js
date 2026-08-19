/* ==========================================================================
   计算机组成原理 / 3 存储系统 / Cache：映射方式与替换算法
   —— Cache 的全部问题只有三句：
      【一个主存块能放到哪】（映射）
      【放不下了换谁】（替换）
      【怎么知道放的是谁、有没有效】（标记项）
      写策略与命中率计算在隔壁那一页。
   ========================================================================== */

KM.page({
  path: 'co/memory/cache',
  title: 'Cache：块的组成与三种映射',
  subtitle: 'Cache 里没有地址 —— 它只有一堆「不知道装的是谁」的格子，**所有机制都是为了回答「装的是谁」和「该装谁」**',
  tags: ['高频', '必考', '手算', '综合应用'],
  updated: '2026-08-19',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'frame', c: '一、先把整块知识的骨架定下来' },

    { t: 'insight', id: 'my-frame', title: '★ 我自己的归纳：核心就是两部分', c: String.raw`
      我觉得 Cache 其实核心就是两个部分：

      1. **块的组成** —— 就是标志位 Tag，以及数据本身；
      2. **映射方式** —— 无非就是直接相联映射、全相联映射和组相联映射。

      （下面几节是在这个骨架上往里填的东西。）
    ` },

    { t: 'key', id: 'frame-extend', title: '这个骨架抓的是「静态结构」，还缺一半「动态机制」', c: String.raw`
      "块的组成 + 映射方式"抓住的是==Cache 长什么样、一个主存块该往哪儿放==，
      这确实是全部计算题的地基。但 Cache 是个==会随时间变化的东西==，
      骨架上至少还要挂两条动态的线，以及一条把它们串起来的算术线：

      | 维度 | 回答的问题 | 在哪一节 |
      |---|---|---|
      | ① 块的组成 | Cache 一行里到底存了什么 | [第二节](#/co/memory/cache?at=line) |
      | ② 映射方式 | 主存块 $\to$ 能放进哪几个位置 | [第三节](#/co/memory/cache?at=map) |
      | ③ **地址划分** | 一个主存地址怎么切成三段 | [第四节](#/co/memory/cache?at=addr) |
      | ④ **总容量** | 这些标志位要额外花多少硬件 | [第五节](#/co/memory/cache?at=capacity) |
      | ⑤ **替换算法** | 位置被占满了换谁出去 | [第六节](#/co/memory/cache?at=replace) |
      | ⑥ **写策略** | 改完之后主存什么时候跟上 | [隔壁那一页](#/co/memory/cache-write?at=read-vs-write) |

      再往外，还有三块==每年真题都在考、但不写在"Cache 定义"里==的东西：
      [缺失的三种成因与命中率的影响因素](#/co/memory/cache?at=three-c)、
      [多级与分离 Cache](#/co/memory/cache?at=multi-level)、
      [Cache 与 TLB 的联动](#/co/memory/cache?at=vipt)。
    ` },

    { t: 'key', id: 'transparent', title: '一句必须先立住的前提：Cache 对程序员完全透明', c: String.raw`
      ==Cache 的查找、调块、替换、写回，全部由硬件自动完成==，
      指令系统里==没有任何一条指令叫"把某块调进 Cache"==（操作系统也管不着它）。

      对比着记这三个"透明"，选择题很爱考：

      | 机制 | 谁来管 | 对谁透明 |
      |---|---|---|
      | **Cache** | ==纯硬件== | ==对程序员、对操作系统都透明== |
      | **虚拟存储器（页表）** | ==硬件 + 操作系统== | 对应用程序员透明，==对 OS 不透明== |
      | **通用寄存器** | ==程序员/编译器自己安排== | ==完全不透明==（要显式写指令） |

      所以"程序员==只能间接==影响命中率"——
      靠的是==按什么顺序访问内存==，见[最后那节的 C 代码题](#/co/memory/cache?at=locality)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'line', c: '二、一个 Cache 行里到底存了什么' },

    { t: 'key', id: 'line-fields', title: '数据 + Tag 只是"能用"，还差三类标志位才"能对"', c: String.raw`
      一个 **Cache 行（Cache Line，也叫 Cache 块）** 的完整构成：

      | 字段 | 位数 | 什么时候存在 | 作用 |
      |---|---|---|---|
      | **数据块 Data** | 与主存块等长（常见 $32/64\text{B}$） | 永远有 | 真正的数据副本 |
      | **标记 Tag** | 见[地址划分](#/co/memory/cache?at=addr) | 永远有 | 记住==这一行现在装的是哪个主存块== |
      | **有效位 V** | $1$ | ==永远有== | 这一行==是不是垃圾== |
      | **脏位 D** | $1$ | ==只有写回法才有== | 改过没有，换出时要不要写回主存 |
      | **替换控制位** | 取决于算法 | ==只有需要选择时才有== | 支撑 LRU / FIFO 的"谁最老" |

      **后三行合起来叫"标记项"（Tag Array）**，
      ==它们不存数据，却要占真金白银的 SRAM==——[算总容量](#/co/memory/cache?at=capacity)时漏一位就全错。
    ` },

    { t: 'diagram', id: 'line-layout', title: '一行的位段排布', note: '左边一整块都是"元数据"',
      caption: String.raw`==只有最右边那一段是数据==，左边四段是为了让硬件能回答"这行装的是谁、能不能用、脏没脏、该不该换它"。题目问 **Cache 容量** 通常只算右边；问 **总容量 / 需要多少 SRAM** 就要连左边一起算。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 132" role="img" aria-label="一个 Cache 行由有效位、脏位、替换控制位、标记和数据块五段组成">
  <text class="cap" x="14" y="14">标记项 Tag Array（不存数据，但要占存储位）</text>
  <text class="cap" x="380" y="14">数据区 Data Array</text>
  <path class="sep" d="M14,22 H368"/>
  <path class="sep" d="M372,22 H686"/>
  <g class="n a"><rect x="14" y="34" width="62" height="52" rx="6"/><text class="bt xs" x="45" y="52" text-anchor="middle" dominant-baseline="central">有效位 V</text><text class="bs" x="45" y="72" text-anchor="middle" dominant-baseline="central">1 位</text></g>
  <g class="n r"><rect x="80" y="34" width="62" height="52" rx="6"/><text class="bt xs" x="111" y="52" text-anchor="middle" dominant-baseline="central">脏位 D</text><text class="bs" x="111" y="72" text-anchor="middle" dominant-baseline="central">写回才有</text></g>
  <g class="n p"><rect x="146" y="34" width="78" height="52" rx="6"/><text class="bt xs" x="185" y="52" text-anchor="middle" dominant-baseline="central">替换控制位</text><text class="bs" x="185" y="72" text-anchor="middle" dominant-baseline="central">LRU 才有</text></g>
  <g class="n k"><rect x="228" y="34" width="140" height="52" rx="6"/><text class="bt sm" x="298" y="52" text-anchor="middle" dominant-baseline="central">标记 Tag</text><text class="bs" x="298" y="72" text-anchor="middle" dominant-baseline="central">装的是哪个主存块</text></g>
  <g class="n g"><rect x="372" y="34" width="314" height="52" rx="6"/><text class="bt sm" x="529" y="52" text-anchor="middle" dominant-baseline="central">数据块 Data Block</text><text class="bs" x="529" y="72" text-anchor="middle" dominant-baseline="central">与主存块等长，如 64B = 512 位</text></g>
  <text class="lb" x="14" y="106">每一行都长这样，Cache 行数 × 这一整条 = 总存储位数</text>
  <text class="lb em" x="380" y="106">题目说「Cache 容量 32KB」时，指的通常只是这一段</text>
</svg>
` },

    { t: 'warn', id: 'valid-bit', title: '有效位为什么是必需的（不是"锦上添花"）', c: String.raw`
      ==开机上电那一刻，Cache 里的 Tag 和数据全是随机值。==
      如果没有有效位，硬件拿地址里的 Tag 去比，==总有可能"碰巧比中"==，
      于是把一片随机数当成数据交给 CPU —— 这是致命错误。

      所以：

      - 上电 / 清空 Cache 时，==把所有行的 $V$ 置 $0$ 即可==，
        ==不需要清数据==（这也是"清 Cache"很快的原因）；
      - 命中的判定是==两个条件同时成立==：
        $$\text{命中} \iff V=1 \ \textbf{且}\ \text{Tag 相符}$$
      - 进程切换、[DMA 改写了主存](#/co/io/dma?at=coherency)之后，
        都可能要把相关行的 $V$ 置 $0$（作废）。

      ==只写"比较 Tag 相等就命中"是不完整的答案。==
    ` },

    { t: 'key', id: 'why-tag-high', title: '为什么 Tag 只需要存"高位"，而不是整个块号', c: String.raw`
      一个很容易含糊过去、但一想通整节就顺了的点：

      **直接映射 / 组相联下，行号（组号）本身就写在地址里。**
      硬件是==先用地址中间那几位选中行（组）==，再去比 Tag 的。
      既然只有"块号低位 = 行号"的那些块才会来到这一行，
      ==它们的低位必然相同，存了也是废话==——只需要存能区分它们的==高位==。

      $$\text{Tag} = \text{主存块号的高位} = \text{主存块号} - \text{行号(组号)那几位}$$

      推论（选择题常考）：

      - ==相联度越高，组数越少，组号位数越少，Tag 就越长==；
      - **全相联**没有行号可用，==Tag 必须存下整个主存块号==，所以它的 Tag 最长、
        标记项开销最大；
      - **直接映射**的 Tag 最短。

      =="全相联最灵活"是有代价的，代价就写在 Tag 的位数上。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'map', c: '三、三种映射：一个主存块能落在哪' },

    { t: 'key', id: 'map-essence', title: '映射方式回答的只有一个问题：候选位置有几个', c: String.raw`
      主存有几百万个块，Cache 只有几百行，==多对一是必然的==。
      映射方式就是在规定：==第 $j$ 号主存块，允许落在哪些行上==。

      | 映射 | 候选位置 | 定位公式 |
      |---|---|---|
      | **直接映射** | ==恰好 1 个== | 行号 $=j \bmod C$（$C$ = Cache 总行数） |
      | **全相联** | ==全部 $C$ 个== | 无公式，==任意空行== |
      | **$n$ 路组相联** | ==同一组内的 $n$ 个== | 组号 $=j \bmod Q$（$Q$ = ==组数== $=C/n$） |

      三者是==同一条连续谱的两端和中间==：

      $$n=1 \Rightarrow \text{直接映射} \qquad n=C \Rightarrow \text{全相联}$$

      所以只要记住组相联，两端==令 $n=1$ 或 $n=C$ 就退化出来了==，不用分别背。
    ` },

    { t: 'diagram', id: 'map-3', title: '主存第 12 块能放到哪（Cache 共 8 行）', note: '绿 = 允许落点，灰 = 不允许',
      caption: String.raw`同一个主存块，三种映射下的**候选位置个数分别是 $1$、$2$、$8$**。==候选越多，冲突越少，但要同时比较的 Tag 也越多==——比较器数量正好等于候选位置数。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 246" role="img" aria-label="主存第12块在直接映射、二路组相联、全相联三种方式下的候选位置">
  <text class="cap" x="0" y="12">Cache 的 8 行 →</text>
  <text class="lb mono" x="210" y="12" text-anchor="middle">0</text>
  <text class="lb mono" x="270" y="12" text-anchor="middle">1</text>
  <text class="lb mono" x="330" y="12" text-anchor="middle">2</text>
  <text class="lb mono" x="390" y="12" text-anchor="middle">3</text>
  <text class="lb mono" x="450" y="12" text-anchor="middle">4</text>
  <text class="lb mono" x="510" y="12" text-anchor="middle">5</text>
  <text class="lb mono" x="570" y="12" text-anchor="middle">6</text>
  <text class="lb mono" x="630" y="12" text-anchor="middle">7</text>

  <text class="lb" x="172" y="38" text-anchor="end" dominant-baseline="central">直接映射</text>
  <g class="n m"><rect x="182" y="22" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="242" y="22" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="302" y="22" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="362" y="22" width="56" height="32" rx="4"/></g>
  <g class="n g on"><rect x="422" y="22" width="56" height="32" rx="4"/><text class="bt xs" x="450" y="38" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n m"><rect x="482" y="22" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="542" y="22" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="602" y="22" width="56" height="32" rx="4"/></g>
  <text class="lb" x="0" y="70">12 mod 8 = 4 → 位置唯一：不需要替换算法，只要 1 个比较器；但另一个 mod 8 = 4 的块一来就挤掉它</text>

  <text class="lb" x="210" y="98" text-anchor="middle">组 0</text>
  <text class="lb" x="330" y="98" text-anchor="middle">组 1</text>
  <text class="lb" x="450" y="98" text-anchor="middle">组 2</text>
  <text class="lb" x="570" y="98" text-anchor="middle">组 3</text>
  <text class="lb" x="172" y="124" text-anchor="end" dominant-baseline="central">2 路组相联</text>
  <g class="n g on"><rect x="182" y="108" width="56" height="32" rx="4"/><text class="bt xs" x="210" y="124" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n g on"><rect x="242" y="108" width="56" height="32" rx="4"/><text class="bt xs" x="270" y="124" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n m"><rect x="302" y="108" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="362" y="108" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="422" y="108" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="482" y="108" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="542" y="108" width="56" height="32" rx="4"/></g>
  <g class="n m"><rect x="602" y="108" width="56" height="32" rx="4"/></g>
  <path class="sep" d="M300,104 V144"/>
  <path class="sep" d="M420,104 V144"/>
  <path class="sep" d="M540,104 V144"/>
  <text class="lb" x="0" y="156">组数 = 8 / 2 = 4，12 mod 4 = 0 → 落在第 0 组，组内两个位置随便挑（组间直接映射、组内全相联）</text>

  <text class="lb" x="172" y="196" text-anchor="end" dominant-baseline="central">全相联</text>
  <g class="n g"><rect x="182" y="180" width="56" height="32" rx="4"/><text class="bt xs" x="210" y="196" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n g"><rect x="242" y="180" width="56" height="32" rx="4"/><text class="bt xs" x="270" y="196" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n g"><rect x="302" y="180" width="56" height="32" rx="4"/><text class="bt xs" x="330" y="196" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n g"><rect x="362" y="180" width="56" height="32" rx="4"/><text class="bt xs" x="390" y="196" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n g"><rect x="422" y="180" width="56" height="32" rx="4"/><text class="bt xs" x="450" y="196" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n g"><rect x="482" y="180" width="56" height="32" rx="4"/><text class="bt xs" x="510" y="196" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n g"><rect x="542" y="180" width="56" height="32" rx="4"/><text class="bt xs" x="570" y="196" text-anchor="middle" dominant-baseline="central">12</text></g>
  <g class="n g"><rect x="602" y="180" width="56" height="32" rx="4"/><text class="bt xs" x="630" y="196" text-anchor="middle" dominant-baseline="central">12</text></g>
  <text class="lb" x="0" y="228">哪儿空放哪儿 → 冲突缺失为 0，但要 8 个比较器同时比 8 个 Tag，还要存最长的 Tag</text>
</svg>
` },

    { t: 'compare', id: 'map-table', title: '三种映射的全部差别（这张表能默写就够用）',
      cols: ['', '直接映射', '全相联', 'n 路组相联'],
      rows: [
        ['候选位置数',     '**1**',                  '**全部 C 行**',        '**n**'],
        ['定位方式',       '块号 mod 行数',          '无（任意行）',          '块号 mod **组数**'],
        ['比较器个数',     '**1 个**',               '**C 个**（全部并行比）', '**n 个**'],
        ['Tag 长度',       '**最短**',               '**最长**',              '居中'],
        ['需要替换算法吗', '**不需要**（位置唯一）', '需要',                  '需要（==只在组内选==）'],
        ['冲突缺失',       '**最严重**',             '**没有**',              '较少'],
        ['硬件成本 / 速度','便宜、快',               '贵、慢（相联存储器）',  '折中'],
        ['典型用途',       '早期 Cache、简单场合',   '**TLB**、小容量表',     '**现代 Cache 的默认做法**'],
      ] },

    { t: 'warn', id: 'map-traps', title: '映射这一节最容易翻车的三处', c: String.raw`
      1. **组相联取模的是"组数"，不是"块数"、更不是"路数"**。
         ==组数 $Q=$ Cache 总行数 $\div n$==。
         例如 512 行的 4 路组相联，==组数是 128 而不是 512 也不是 4==。
      2. **"$n$ 路"数的是"每组几行"，不是"分几组"**。
         "4 路组相联"= ==每组 4 行==，路数越大越接近全相联。
      3. **别把"全相联不需要 Tag"当结论**。恰恰相反，==全相联的 Tag 最长==——
         没有行号可以省，[整个块号都要存](#/co/memory/cache?at=why-tag-high)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'addr', c: '四、主存地址怎么切（全部计算题的入口）' },

    { t: 'diagram', id: 'addr-split', title: '同一个地址，三种切法', note: '块内地址永远在最低位、永远一样宽',
      caption: String.raw`==三种映射切的是同一根地址，动的只有中间那一段==。所以做题时**先算最右边的块内地址位数 $b$（由块大小定死），再算中间那一段（由行数 / 组数定），剩下全归 Tag**——顺序反过来就容易乱。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 214" role="img" aria-label="直接映射、组相联、全相联三种方式下主存地址的字段划分对比">
  <text class="lb" x="14" y="26">① 直接映射</text>
  <g class="n k"><rect x="14" y="34" width="372" height="40" rx="6"/><text class="bt sm" x="200" y="54" text-anchor="middle" dominant-baseline="central">标记 Tag</text></g>
  <g class="n p"><rect x="390" y="34" width="146" height="40" rx="6"/><text class="bt sm" x="463" y="54" text-anchor="middle" dominant-baseline="central">行号 c 位</text></g>
  <g class="n m"><rect x="540" y="34" width="146" height="40" rx="6"/><text class="bt sm" x="613" y="54" text-anchor="middle" dominant-baseline="central">块内地址 b 位</text></g>

  <text class="lb" x="14" y="100">② n 路组相联</text>
  <g class="n k"><rect x="14" y="108" width="412" height="40" rx="6"/><text class="bt sm" x="220" y="128" text-anchor="middle" dominant-baseline="central">标记 Tag（变长了）</text></g>
  <g class="n p"><rect x="430" y="108" width="106" height="40" rx="6"/><text class="bt sm" x="483" y="128" text-anchor="middle" dominant-baseline="central">组号 q 位</text></g>
  <g class="n m"><rect x="540" y="108" width="146" height="40" rx="6"/><text class="bt sm" x="613" y="128" text-anchor="middle" dominant-baseline="central">块内地址 b 位</text></g>

  <text class="lb" x="14" y="174">③ 全相联</text>
  <g class="n k"><rect x="14" y="182" width="522" height="40" rx="6"/><text class="bt sm" x="275" y="202" text-anchor="middle" dominant-baseline="central">标记 Tag = 整个主存块号</text></g>
  <g class="n m"><rect x="540" y="182" width="146" height="40" rx="6"/><text class="bt sm" x="613" y="202" text-anchor="middle" dominant-baseline="central">块内地址 b 位</text></g>
</svg>
` },

    { t: 'formulas', id: 'addr-formulas', title: '四个位数（$A$ = 主存地址总位数）', items: [
      { label: '块内地址',       tex: String.raw`b=\log_2(\text{块大小})` },
      { label: '直接映射 行号',  tex: String.raw`c=\log_2(\text{Cache 行数})` },
      { label: '组相联 组号',    tex: String.raw`q=\log_2\!\left(\dfrac{\text{行数}}{n}\right)` },
      { label: '直接映射 Tag',   tex: String.raw`A-c-b` },
      { label: '组相联 Tag',     tex: String.raw`A-q-b` },
      { label: '全相联 Tag',     tex: String.raw`A-b` },
    ] },

    { t: 'method', id: 'addr-steps', title: '拿到题目，按这个顺序算（别跳）', c: String.raw`
      1. **先定 $A$**：主存地址位数 $=\log_2(\text{主存容量})$，
         ==注意编址单位==（按字节 / 按字编址，结果差好几位）。
      2. **再定 $b$**：$b=\log_2(\text{块大小})$。
         块大小若给的是"$16$ 个字、每字 $32$ 位"，==先换算成字节==。
      3. **再定中间那段**：
         直接映射用行数，组相联==先算组数 $=$ 行数 $/\,n$== 再取对数。
      4. **Tag 用减法收尾**：$\text{Tag}=A-(\text{中间那段})-b$。

      **自检**：三段位数加起来==必须正好等于 $A$==，
      对不上就是某处的对数算错了。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'capacity', c: '五、★ Cache 总容量：标志位是要花钱的' },

    { t: 'key', id: 'capacity-formula', title: '「Cache 容量」和「Cache 总容量」是两个数', c: String.raw`
      $$\text{总位数}=\text{行数}\times\big(\underbrace{\text{数据块位数}}_{\text{数据区}}
      +\underbrace{\text{Tag}+1_{(V)}+1_{(D)}+\text{替换位}}_{\text{标记项}}\big)$$

      逐项确认==这四个附加项在不在==：

      | 附加项 | 在不在 | 判据 |
      |---|---|---|
      | Tag | ==一定在== | 位数看[地址划分](#/co/memory/cache?at=addr) |
      | 有效位 $V$ | ==一定在==，$1$ 位 | 无条件 |
      | 脏位 $D$ | ==写回法才有==，$1$ 位 | 题面说"写回 / 回写"就加，说"全写 / 直写"就不加 |
      | 替换位 | ==要选才有== | 直接映射 $0$ 位；$n$ 路 LRU 每行 $\log_2 n$ 位 |

      **两个说法要分清**：

      - "该 Cache 的容量为 $32\text{KB}$" —— 习惯上==只指数据区==；
      - "实现该 Cache 至少需要多少位 / 多大的 SRAM" —— ==必须连标记项一起算==。

      ==题干里出现"总容量""共需多少位""标记阵列"这些词，就是在考附加位。==
    ` },

    { t: 'example', id: 'ex-capacity', level: 3,
      title: '组相联 Cache 的地址划分与总容量',
      problem: String.raw`
        某机器按字节编址，主存地址 $32$ 位。Cache 数据区容量 $32\text{KB}$，
        主存块大小 $64\text{B}$，采用 ==$4$ 路组相联==映射、
        ==LRU 替换算法==、==回写（Write Back）==策略。

        求：(1) 主存地址的字段划分；(2) 该 Cache 的总容量（位）。
      `,
      idea: String.raw`
        第 (1) 问==只有一处需要动脑==：中间那一段是**组号**，
        所以必须==先把"行数"换算成"组数"==，别拿 512 直接取对数。

        第 (2) 问的关键是==把题面的每个形容词都翻译成"多少位"==：

        | 题面写了什么 | 翻译成位 |
        |---|---|
        | 4 路组相联 + ==LRU== | 每行 $\log_2 4=2$ 位替换位 |
        | ==回写== | 每行 $1$ 位脏位 |
        | （没说，但永远有） | 每行 $1$ 位有效位 |

        ==题面里每一个修饰词都是给你加位数用的==，一个都不能当背景板读过去。
      `,
      solution: String.raw`
        **(1) 地址划分**

        - 块内地址：$b=\log_2 64=\mathbf{6}$ 位；
        - 总行数：$32\text{KB}/64\text{B}=512$ 行；
        - ==组数==：$512/4=128$ 组 $\Rightarrow q=\log_2 128=\mathbf{7}$ 位；
        - Tag：$32-7-6=\mathbf{19}$ 位。

        校验：$19+7+6=32$ ✔

        $$\underbrace{\texttt{Tag }19}_{\text{高位}}\ \big|\ \underbrace{\texttt{组号 }7}_{\text{中间}}\ \big|\ \underbrace{\texttt{块内 }6}_{\text{低位}}$$

        **(2) 总容量**

        每行的标记项：

        $$19_{(\text{Tag})}+1_{(V)}+1_{(D)}+2_{(\text{LRU})}=23\ \text{位}$$

        每行的数据：$64\text{B}=512$ 位。于是

        $$512\times(512+23)=512\times535=\mathbf{273\,920}\ \text{位}=34\,240\ \text{B}$$

        其中==纯开销 $=512\times23=11\,776$ 位 $=1472\text{B}$==，
        约占数据区的 $4.5\%$ —— 这就是"标记项要花的钱"。
      `,
      comment: String.raw`
        **换几个条件，看哪一位会动**：

        | 条件改成 | 变的是 | 新的每行附加位 |
        |---|---|---|
        | 改成==全写法== | 脏位没了 | $19+1+2=22$ |
        | 改成==直接映射== | 组号变行号 $9$ 位，Tag 变 $17$ 位，替换位没了 | $17+1+1=19$ |
        | 改成==全相联== | 无组号，Tag $=32-6=26$ 位，LRU 每行 $\log_2 512=9$ 位 | $26+1+1+9=37$ |
        | 改成==随机替换== | LRU 位可以省掉 | $19+1+1=21$ |

        ==注意全相联那一行：为什么它"贵得离谱"，这张表算出来了==——
        每行 $37$ 位对 $512$ 位数据，接近 $7\%$，而且还要 $512$ 个比较器。
        这就是现代 Cache ==一律用组相联==、只有 TLB 那种小表才敢用全相联的原因。
      ` },

    /* ================================================================== */
    { t: 'h', id: 'replace', c: '六、替换算法：位置满了换谁' },

    { t: 'key', id: 'replace-scope', title: '先划清适用范围：换的永远是"候选位置"里的一个', c: String.raw`
      - **直接映射==没有替换算法==**：位置唯一，==新块来了就直接盖掉==，没得选；
      - **全相联**：在==整个 Cache== 里选一个换出；
      - **组相联**：==只在它被映射到的那一组内==选，==和别的组完全无关==。

      ==做 LRU 手算题时，"只在组内比较"这一条能省掉一大半功夫==，
      也是最容易忘、一忘就全盘错的一条。

      还有一个前提常被跳过：==只有该组已经装满（全部 $V=1$）才需要替换==。
      有空行时==优先填空行==，不动任何人。
    ` },

    { t: 'compare', id: 'replace-table', title: '四种算法',
      cols: ['算法', '换出谁', '实现代价', '要害'],
      rows: [
        ['**RAND** 随机',    '随机挑一个',             '最低，几乎不用硬件',        '==完全不看局部性==；但命中率下降没想象中大，且不会周期性抖动'],
        ['**FIFO** 先进先出','**最早调入**的那一块',   '低（一个指针 / 队列）',      '==调入早 ≠ 不常用==；有 **Belady 异常**（增大容量反而命中率下降）'],
        ['**LRU** 最近最少用','**最久没被访问**的那块','每行 $\\log_2 n$ 位计数器',  '==最贴合时间局部性==，408 默认考它；相联度高时硬件贵'],
        ['**LFU** 最不经常用','**访问次数最少**的那块','每行一个计数器',            '==早期高频的老块赖着不走==（计数值不随时间衰减）'],
      ] },

    { t: 'method', id: 'lru-impl', title: 'LRU 的计数器实现（考"某一步之后各计数器的值"）', c: String.raw`
      每一行配一个 $\log_2 n$ 位的计数器，==值越大表示越久没被用==。

      | 情形 | 动作 |
      |---|---|
      | **命中某行** | ==该行清 $0$==；==原来比它小的那些行 $+1$==；比它大的不动 |
      | **未命中、组内有空行** | 新行置 $0$，==组内其余所有行 $+1$== |
      | **未命中、组已满** | ==换出计数器最大的那行==，新行置 $0$，其余 $+1$ |

      三条规则里==只有第一条容易记错==：命中时**不是"其余全 +1"**，
      而是==只有原本比它"更新"（计数值更小）的那些才 $+1$==，
      否则计数值会溢出、也不再反映真实的先后关系。

      **$n$ 路组相联的 LRU 位数**：每行 $\log_2 n$ 位 $\Rightarrow$ 每组 $n\log_2 n$ 位。
      $2$ 路只要 $1$ 位/行（记谁是最近用的），$4$ 路 $2$ 位/行，
      ==路数再大硬件就吃不消，实际 CPU 改用"伪 LRU"（树形近似）==。
    ` },

    { t: 'warn', id: 'lru-thrash', title: '★ LRU 会被"循环访问"打穿：命中率可以是 0', c: String.raw`
      LRU 的假设是"最近用过的还会再用"。==但循环访问恰好把这个假设反过来==：
      当循环体涉及的块数==比候选位置数多 1== 时，
      ==每次要用的那一块，正好是刚刚被换出去的那一块==。

      **$2$ 路组相联，反复访问映射到同一组的 $3$ 个块 $A,B,C$：**

      | 访问 | 组内（左 = 较新） | 结果 |
      |---|---|---|
      | $A$ | $A$ | 缺失 |
      | $B$ | $B,A$ | 缺失 |
      | $C$ | $C,B$（换出 $A$） | 缺失 |
      | $A$ | $A,C$（换出 $B$） | ==缺失== |
      | $B$ | $B,A$（换出 $C$） | ==缺失== |
      | $C$ | …… | ==缺失== |

      ==命中率 $=0$，一次都没中。== 换成 $4$ 路：前 $3$ 次冷启动缺失之后
      ==全部命中==，访问 $12$ 次的命中率就是 $9/12=75\%$。

      **这告诉你两件事**：

      1. ==命中率不是算法单方面决定的，是"算法 + 访问模式 + 相联度"三者的合谋==；
      2. 出现"命中率为 $0$"这种极端答案时==别慌，先去数循环体涉及几个块、
         它们是不是都映射到同一组==——[那道 2010 真题](#/co/memory/cache?at=ex-2010)
         正是这种结构。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'three-c', c: '七、缺失从哪来：3C 模型与命中率的三个旋钮' },

    { t: 'key', id: 'three-c-types', title: '三种缺失（3C），对应三种不同的解法', c: String.raw`
      | 缺失类型 | 什么时候发生 | 怎么减少 |
      |---|---|---|
      | **强制缺失** Compulsory<br>（冷启动 / 首次访问） | ==这块从来没被调进来过==，第一次访问必然缺失 | ==增大块大小==（一次带回更多）、预取 |
      | **冲突缺失** Conflict | Cache 还有空位，==但这块只能去那个已被占的位置== | ==提高相联度==（直接映射最严重，==全相联为 $0$==） |
      | **容量缺失** Capacity | ==程序的工作集本身就装不下== | ==增大 Cache 容量== |

      **判据（选择题）**：
      ==把同样的访问序列拿到"同容量的全相联 Cache"上跑一遍==——
      仍然缺失的是强制或容量缺失，==只在原 Cache 缺失的那部分就是冲突缺失==。

      ==全相联没有冲突缺失，但照样有容量缺失==，这两个不要混。
    ` },

    { t: 'key', id: 'hit-knobs', title: '三个旋钮：容量、相联度、块大小（只有第三个不是单调的）', c: String.raw`
      - **增大容量** $\Rightarrow$ 命中率上升，==但代价是成本与访问时间==（大了就慢）；
      - **提高相联度** $\Rightarrow$ 冲突缺失下降，==但比较器变多、命中判定变慢==，
        而且==收益递减==（$1$ 路到 $2$ 路提升最明显，$8$ 路以后几乎持平）；
      - **增大块大小** $\Rightarrow$ ==命中率先升后降==，是一条 U 形曲线：

      | 块变大带来的 | 方向 |
      |---|---|
      | 一次带回更多相邻数据，==空间局部性用得更足== | 命中率 ↑ |
      | 总行数变少（容量不变），==冲突加剧== | 命中率 ↓ |
      | 带回的很多字==根本用不上（Cache 污染）== | 命中率 ↓ |
      | ==缺失代价变大==（一次要搬更多字节） | 平均时间 ↑ |

      所以==存在一个最优块大小==（常见 $32\sim128\text{B}$），
      =="块越大越好"和"块越小越好"都是错的==。
    ` },

    { t: 'diagram', id: 'block-size-curve', title: '块大小与缺失率：U 形曲线', note: '两股方向相反的力',
      caption: String.raw`左半段==空间局部性占上风==，右半段==行数减少与污染占上风==。答"增大块大小对命中率的影响"时，==必须把"先降后升"和"缺失代价一直在涨"两句都说到==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 200" role="img" aria-label="缺失率随块大小先下降后上升的U形曲线">
  <path class="gd" d="M70,30 H660"/>
  <path class="gd" d="M70,90 H660"/>
  <path class="sep" d="M70,150 H660"/>
  <path class="sep" d="M70,20 V150"/>
  <text class="lb" x="62" y="30" text-anchor="end" dominant-baseline="central">高</text>
  <text class="lb" x="62" y="150" text-anchor="end" dominant-baseline="central">低</text>
  <text class="cap" x="8" y="14">缺失率</text>
  <path class="wv" d="M100,44 C170,110 230,132 300,134 C400,136 470,108 620,52"/>
  <g class="n g on"><rect x="252" y="146" width="96" height="26" rx="5"/><text class="bt xs" x="300" y="159" text-anchor="middle" dominant-baseline="central">最优块大小</text></g>
  <text class="lb k" x="100" y="176">块太小：空间局部性没用上</text>
  <text class="lb em" x="660" y="176" text-anchor="end">块太大：行数变少 + 污染 + 缺失代价高</text>
  <text class="lb" x="660" y="196" text-anchor="end">块大小 →</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'multi-level', c: '八、多级 Cache 与分离 Cache' },

    { t: 'key', id: 'split-cache', title: '★ L1 为什么要拆成指令 Cache 和数据 Cache', c: String.raw`
      现代结构里 ==L1 分离（i-Cache / d-Cache），L2、L3 统一（Unified）==。
      拆开的**首要理由是流水线**：

      ==取指段（IF）和访存段（MEM）会在同一个时钟周期里同时要访问 Cache==，
      如果只有一个统一 Cache（单端口），这就是一次
      [结构冒险](#/co/cpu/pipeline?at=struct-conflict)，必须停顿一拍。
      ==拆成两个 Cache，等于把一个部件复制成两份，冲突自然消失。==

      顺带的好处：

      - 指令流==只读、不会脏==，i-Cache ==不需要脏位、不需要写电路==，可以做得更快；
      - 两者的访问模式差别很大，==可以各自选不同的块大小与相联度==；
      - 指令与数据==互不挤占==（大数组不会把指令冲光）。

      代价：==两边的容量写死了，不能互相调剂==（统一 Cache 的唯一优势就是这个灵活性）。

      =="分离 Cache 是为了提高命中率"是个不准确的答法，
      标准答法是"避免取指与访存的结构冲突，支持流水线"。==
    ` },

    { t: 'key', id: 'multi-metrics', title: '多级 Cache：局部缺失率 vs 全局缺失率', c: String.raw`
      多级的设计原则是==分工不同==：
      ==L1 追求"快"==（小、低相联度、可用全写法），
      ==L2/L3 追求"命中率"==（大、高相联度、几乎一定是写回法）。

      两个缺失率必须分清：

      $$\text{L2 局部缺失率}=\frac{\text{L2 缺失次数}}{\textbf{到达 L2 的}\text{访问次数}},\qquad
      \text{L2 全局缺失率}=\frac{\text{L2 缺失次数}}{\textbf{CPU 总}\text{访问次数}}$$

      $$\text{全局缺失率} = (1-h_1)\times\text{局部缺失率}$$

      ==L2 的局部缺失率通常很难看（容易命中的都被 L1 挡掉了），但全局缺失率很低==，
      看到"L2 缺失率 $40\%$"不要以为算错了。

      两级的平均访问时间（串行）：

      $$t_a=t_{L1}+(1-h_1)\big[t_{L2}+(1-h_2)\,t_m\big]$$

      ==这就是[单级那两套公式](#/co/memory/cache-write?at=amat-formulas)往下再套一层==，
      不是新公式。

      另外，多级之间还有==包含关系==的选择：
      **包含式**（L1 的内容一定也在 L2，便于一致性检查，浪费容量）与
      **互斥式**（互不重复，等效容量更大，但换出更麻烦）。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'vipt', c: '九、★ Cache 与 TLB 的联动（大题的交叉地带）' },

    { t: 'steps', id: 'access-order', title: '一次访存，按这个顺序问', items: [
      { title: 'CPU 给出虚拟地址', c: String.raw`拆成==虚页号 + 页内偏移==。` },
      { title: '查 TLB', c: String.raw`==命中==：立刻拿到物理页号；
        ==缺失==：去主存查页表（==这一次是实打实的访存==），
        页表项==无效==还要触发缺页异常，由 OS 从磁盘调入。` },
      { title: '拼出物理地址', c: String.raw`物理页号 + 页内偏移。
        ==页内偏移不参与翻译，虚实完全相同==——这是下面 VIPT 的全部基础。` },
      { title: '查 Cache', c: String.raw`用物理地址切出组号与 Tag。
        ==命中==：直接给数据；==缺失==：去主存把整块调进来。` },
    ] },

    { t: 'key', id: 'vipt-rule', title: 'VIPT：为什么"每路容量不能超过一页"', c: String.raw`
      按上面的顺序老老实实走，==TLB 和 Cache 是串行的==，太慢。
      于是有了 **VIPT（Virtually Indexed, Physically Tagged，虚拟索引、物理标记）**：

      ==把虚地址的低位（组号 + 块内地址）直接送给 Cache 去选组，
      同时把高位送给 TLB 去翻译==，两件事==并行==；
      等 TLB 吐出物理页号时，Cache 也刚好把那一组的 Tag 读出来了，==直接比==。

      能这么干的前提是：==用来索引的那几位，虚地址和物理地址必须相同==，
      也就是它们必须全部落在==页内偏移==里：

      $$q+b\ \le\ \log_2(\text{页大小})
      \quad\Longleftrightarrow\quad
      \boxed{\ \text{每一路的容量}=2^{q}\times 2^{b}\ \le\ \text{页大小}\ }$$

      **这条约束直接决定了真实 CPU 的 Cache 参数**：
      页大小 $4\text{KB}$ 时，一路最多 $4\text{KB}$，
      想要 $32\text{KB}$ 的 L1 就==只能做成 $8$ 路组相联==
      （$32\text{KB}/8=4\text{KB}$ ✔）。
      =="L1 普遍是 8 路"不是巧合，是被这条不等式逼出来的。==

      如果超了，同一个物理块可能被两个不同虚地址索引到两个不同的组，
      叫==别名（aliasing）问题==，要靠硬件额外查重或 OS 页面着色来解决。
    ` },

    { t: 'diagram', id: 'vipt-parallel', title: 'TLB 与 Cache 并行', note: '低位不用翻译，可以先跑起来',
      caption: String.raw`==左右两条路同时开跑==，省掉的正是"等 TLB"的那一段。约束只有一条：**紫色 + 灰色两段加起来不能超过页内偏移的宽度**，也就是[每路容量 $\le$ 页大小](#/co/memory/cache?at=vipt-rule)。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 250" role="img" aria-label="虚拟地址的高位送TLB翻译、低位并行索引Cache，最后用物理页号与读出的Tag比较">
  <text class="lb" x="197" y="18" text-anchor="middle">需要翻译</text>
  <text class="lb em" x="535" y="18" text-anchor="middle">页内偏移：虚实地址完全相同，不用翻译</text>
  <g class="n k"><rect x="14" y="26" width="366" height="40" rx="6"/><text class="bt sm" x="197" y="46" text-anchor="middle" dominant-baseline="central">虚页号 VPN</text></g>
  <g class="n p"><rect x="384" y="26" width="152" height="40" rx="6"/><text class="bt sm" x="460" y="46" text-anchor="middle" dominant-baseline="central">组号 q 位</text></g>
  <g class="n m"><rect x="540" y="26" width="146" height="40" rx="6"/><text class="bt sm" x="613" y="46" text-anchor="middle" dominant-baseline="central">块内 b 位</text></g>
  <path class="ar" d="M197,66 V104"/>
  <path class="ar em" d="M460,66 V104"/>
  <g class="n g"><rect x="60" y="108" width="274" height="46" rx="8"/><text class="bt sm" x="197" y="121" text-anchor="middle" dominant-baseline="central">TLB 翻译 → 物理页号</text><text class="bs" x="197" y="141" text-anchor="middle" dominant-baseline="central">缺失才去查页表（一次访存）</text></g>
  <g class="n g"><rect x="366" y="108" width="288" height="46" rx="8"/><text class="bt sm" x="510" y="121" text-anchor="middle" dominant-baseline="central">用组号选中一组，读出 n 个 Tag</text><text class="bs" x="510" y="141" text-anchor="middle" dominant-baseline="central">不用等 TLB，同时进行</text></g>
  <path class="ar" d="M197,154 V172 H300 V186"/>
  <path class="ar" d="M510,154 V172 H400 V186"/>
  <g class="n p"><rect x="180" y="190" width="340" height="46" rx="8"/><text class="bt sm" x="350" y="203" text-anchor="middle" dominant-baseline="central">比较：物理页号高位 ↔ 读出的 Tag</text><text class="bs" x="350" y="223" text-anchor="middle" dominant-baseline="central">相等且有效位为 1 → 命中</text></g>
</svg>
` },

    { t: 'warn', id: 'vipt-traps', title: '这一节的两个高频扣分点', c: String.raw`
      1. **TLB 缺失也要访存**。问"最多访问几次主存"时，
         ==TLB 缺失去查页表那一次必须算上==；页表还可能是多级的，
         ==$k$ 级页表就是 $k$ 次访存==。详见
         [数访存次数的方法](#/co/memory/cache-write?at=count-method)。
      2. **TLB 本身也是个 Cache，别把两者的参数搞混**。
         TLB ==缓存的是页表项，不是数据==；它很小，所以==多用全相联或高路数组相联==。
         "TLB 命中"只意味着==地址翻译成功==，==数据仍可能在 Cache 里缺失==——
         $\text{TLB 命中} + \text{Cache 缺失}$ 是完全正常的组合。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'locality', c: '十、★ 局部性的软件面：一段 C 代码就能把命中率打到 0' },

    { t: 'key', id: 'locality-basic', title: '两种局部性，各自被谁利用', c: String.raw`
      | 局部性 | 含义 | Cache 用什么机制利用它 |
      |---|---|---|
      | **时间局部性** | ==刚访问过的，很可能马上再访问== | ==把它留在 Cache 里==（LRU 就是在赌这个） |
      | **空间局部性** | ==访问了某地址，附近的很快也会被访问== | ==一次调入一整块==（块大小 > 1 个字就是为了这个） |

      典型来源：==循环体、栈上的局部变量、循环计数器==（时间局部性强）；
      ==数组的顺序遍历、指令的顺序执行==（空间局部性强）。

      ==链表、树、随机跳转的空间局部性差==——
      这也是"数组常比链表快"在硬件层面的理由。
    ` },

    { t: 'code', id: 'row-vs-col', title: '同一个求和，两种写法', lang: 'c',
      note: '功能完全一样，命中率可以差出几十倍',
      c: String.raw`
        int a[256][256];          /* C 语言按【行优先】存放 */

        /* 程序 A：按行遍历 —— 内层循环走的是相邻地址 */
        for (i = 0; i < 256; i++)
            for (j = 0; j < 256; j++)
                sum += a[i][j];

        /* 程序 B：按列遍历 —— 内层循环每走一步就跨过一整行 */
        for (j = 0; j < 256; j++)
            for (i = 0; i < 256; i++)
                sum += a[i][j];
      ` },

    { t: 'diagram', id: 'row-col-walk', title: '两种遍历踩在内存上的样子', note: '每 4 格是一个 Cache 块（示意）',
      caption: String.raw`==按行走==：一次缺失把整块带回来，后面几个直接命中；==按列走==：每一步都跨到另一个块，==带回来的其余数据一个都没用上就被换掉了==。这就是"Cache 污染"最直观的形态。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 214" role="img" aria-label="按行遍历与按列遍历在按行优先存放的二维数组上的访问轨迹对比">
  <text class="cap" x="0" y="14">主存中的存放顺序（行优先）：每 4 个元素装进同一个 Cache 块</text>
  <text class="lb" x="92" y="46" text-anchor="end" dominant-baseline="central">a[0][ ]</text>
  <text class="lb" x="92" y="86" text-anchor="end" dominant-baseline="central">a[1][ ]</text>
  <text class="lb" x="92" y="126" text-anchor="end" dominant-baseline="central">a[2][ ]</text>
  <text class="lb" x="92" y="166" text-anchor="end" dominant-baseline="central">a[3][ ]</text>
  <g class="n m"><rect x="100" y="30" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="172" y="30" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="244" y="30" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="316" y="30" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="396" y="30" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="468" y="30" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="540" y="30" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="612" y="30" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="100" y="70" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="172" y="70" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="244" y="70" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="316" y="70" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="396" y="70" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="468" y="70" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="540" y="70" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="612" y="70" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="100" y="110" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="172" y="110" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="244" y="110" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="316" y="110" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="396" y="110" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="468" y="110" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="540" y="110" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="612" y="110" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="100" y="150" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="172" y="150" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="244" y="150" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="316" y="150" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="396" y="150" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="468" y="150" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="540" y="150" width="68" height="32" rx="4"/></g>
  <g class="n m"><rect x="612" y="150" width="68" height="32" rx="4"/></g>
  <path class="sep" d="M390,24 V188"/>
  <path class="ar" d="M104,46 H676"/>
  <path class="ar em" d="M134,34 V178"/>
  <text class="lb" x="0" y="204">程序 A 按行走：沿存放顺序前进，1 次缺失 + 3 次命中</text>
  <text class="lb em" x="676" y="204" text-anchor="end">程序 B 按列走：每步都跳到下一行，块内其余 3 个白白带回</text>
</svg>
` },

    { t: 'example', id: 'ex-2010', level: 4,
      title: '按行 / 按列遍历的命中率（Cache 综合大题的标准形态）',
      source: '2010 真题',
      problem: String.raw`
        某计算机的主存地址空间大小为 $256\text{MB}$，==按字节编址==。
        ==指令 Cache 与数据 Cache 分离==，均有 $8$ 个 Cache 行，
        每行大小 $64\text{B}$，==数据 Cache 采用直接映射==方式。
        $\texttt{int}$ 类型数据用 $32$ 位补码表示。
        数组 $\texttt{a}$ 按行优先方式存放，==其首地址为 $320$==。
        程序 A、B 如[上面的代码](#/co/memory/cache?at=row-vs-col)所示。请回答：

        (1) $\texttt{a[0][31]}$ 的地址是多少？

        (2) $\texttt{a[0][31]}$ 与 $\texttt{a[1][1]}$ 会不会被映射到同一个 Cache 行？为什么？

        (3) 程序 A 和程序 B 的数据访问命中率各是多少？哪个执行时间更短？
      `,
      idea: String.raw`
        这题看着有三问，其实==只有一条链子要搭：地址 $\to$ 块号 $\to$ 行号==。
        链子搭好，三问都是它的不同问法。

        $$\text{块号}=\left\lfloor\frac{\text{地址}}{64}\right\rfloor,\qquad
        \text{行号}=\text{块号}\bmod 8$$

        第 (3) 问最值得先想清楚的是=="内层循环每走一步，地址跳多远"==：

        - 程序 A 内层是 $j$：地址每次 $+4\text{B}$，==$64\text{B}$ 的块能装 $16$ 个 $\texttt{int}$==
          $\Rightarrow$ ==每 $16$ 次访问只缺失 $1$ 次==；
        - 程序 B 内层是 $i$：地址每次 $+256\times4=1024\text{B}$，
          $1024/64=16$ ==个块==，而 $16\bmod 8=0$ ——
          ==它们全都落在同一个 Cache 行上！==

        看到这里就该警觉：这不是"命中率低"，这是
        [LRU 抖动的直接映射版本](#/co/memory/cache?at=lru-thrash)，
        ==答案很可能是干脆的 $0$==。

        （题目特意给"首地址 $320$"，是因为 $320=5\times64$ ==正好块对齐==，
        不用担心某一行数组横跨半块。==这种"友好"的数字是出题人给的暗示==。）
      `,
      solution: String.raw`
        **(1)** 每个 $\texttt{int}$ 占 $4\text{B}$，$\texttt{a[0][31]}$ 是第 $31$ 个元素：

        $$320+31\times4=320+124=\mathbf{444}$$

        **(2)** 分别算行号：

        | 元素 | 地址 | 块号 $=\lfloor\text{地址}/64\rfloor$ | 行号 $=$ 块号 $\bmod 8$ |
        |---|---|---|---|
        | $\texttt{a[0][31]}$ | $444$ | $\lfloor 444/64\rfloor=6$ | $6\bmod 8=\mathbf{6}$ |
        | $\texttt{a[1][1]}$ | $320+(1\times256+1)\times4=1348$ | $\lfloor 1348/64\rfloor=21$ | $21\bmod 8=\mathbf{5}$ |

        行号 $6\ne 5$，==所以不会被映射到同一个 Cache 行==。

        **(3)** 一个块 $64\text{B}$ 装 $64/4=16$ 个 $\texttt{int}$。

        - **程序 A**（按行）：内层沿存放顺序前进，
          ==每进入一个新块缺失 $1$ 次，随后 $15$ 次全部命中==：
          $$h_A=\frac{15}{16}=\mathbf{93.75\%}$$
        - **程序 B**（按列）：内层每步跨 $1024\text{B}=16$ 个块，
          而 $16\bmod 8=0$ $\Rightarrow$ ==对固定的 $j$，$256$ 次访问全部映射到同一行==，
          ==每一次都把上一次刚调入的块换掉==；等外层 $j$ 加一、回到 $\texttt{a[0][j+1]}$ 时，
          那个块早已被换出。故==没有任何一次命中==：
          $$h_B=\mathbf{0\%}$$

        ==程序 A 的执行时间明显更短==（同样 $65536$ 次数据访问，
        A 只需访问主存 $4096$ 次，B 要访问 $65536$ 次）。
      `,
      comment: String.raw`
        **这题真正在考什么**：==Cache 的效果不取决于你算什么，只取决于你按什么顺序访问==。
        程序 A、B ==指令条数几乎一样、算出的结果完全一样==，差距全在访存顺序上。

        **三个容易失分的地方**：

        1. ==忽略"指令 Cache 与数据 Cache 分离"这句话==——
           它保证==取指不会挤占数据 Cache 的那 8 行==，否则命中率还要另算。
           这句话不是背景描述，正是[分离 Cache](#/co/memory/cache?at=split-cache)的考点。
        2. ==把程序 B 答成"命中率很低"而不敢写 $0$==。
           $0$ 是算出来的：$16\bmod 8=0$ 这一步==决定了全部答案==。
           如果 Cache 有 $16$ 行，$16\bmod 16=0$ 依然是 $0$；
           但若行数是 $32$，就不再全撞在一起了。
        3. ==把 $\texttt{sum}$、$\texttt{i}$、$\texttt{j}$ 也算进命中率==。
           它们是==局部变量，通常分配在寄存器里==，题目问的是"数组的数据访问命中率"。

        **一句可执行的经验**：写循环时==让最内层的循环变量对应数组的最后一维==
        （C 语言行优先），==这是唯一不用改算法就能提命中率的办法==。
        （矩阵乘法的循环交换、分块算法，都是这一条的延伸。）
      ` },

    /* ================================================================== */
    { t: 'h', id: 'next', c: '十一、写策略与命中率计算（在隔壁那一页）' },

    { t: 'md', id: 'to-write-page', c: String.raw`
      读只是取一份副本，==写却在制造两个版本==。所以写策略单独占一页：

      | 问题 | 去哪看 |
      |---|---|
      | 写命中：写直达 vs 写回，脏位怎么用 | [写命中的两种策略](#/co/memory/cache-write?at=write-back) |
      | 写不命中：写分配 vs 非写分配，固定搭配 | [要不要为写调块](#/co/memory/cache-write?at=allocate) |
      | 一条指令到底访问几次主存 | [数访存次数的方法](#/co/memory/cache-write?at=count-method) |
      | 命中率、平均访问时间、访问效率 | [两套公式](#/co/memory/cache-write?at=amat-formulas) |
      | 写回法与 DMA 的一致性问题 | [DMA 读到过时数据](#/co/io/dma?at=coherency) |
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '十二、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一页的固定失分点', c: String.raw`
      1. **组相联取模取错**——==除的是组数（行数 $/\,n$）==，不是行数、不是路数。
      2. **算总容量漏标志位**——==有效位永远有==；写回法多一位脏位；
         LRU 每行 $\log_2 n$ 位。见[那道容量题](#/co/memory/cache?at=ex-capacity)。
      3. **以为全相联的 Tag 更短**——==恰恰最长==，它要存整个块号。
      4. **给直接映射配替换算法**——==位置唯一，没得选==，也不需要替换位。
      5. **命中判据只写"Tag 相等"**——==必须再加 $V=1$==。
      6. **忘了编址单位**——"按字编址、每字 $32$ 位"时，
         ==块大小和地址位数都要重算==。
      7. **认为块越大命中率越高**——==U 形曲线，先升后降==，
         而且缺失代价一直在涨。
      8. **把 TLB 缺失当成不访存**——==查页表是实打实的主存访问==。
      9. **认为"分离 Cache 是为了提高命中率"**——
         ==标准答法是避免取指与访存的结构冲突==。
      10. **看到"命中率 0%"就以为算错**——
          [循环访问撞在同一组 / 同一行时，$0$ 就是正确答案](#/co/memory/cache?at=lru-thrash)。
    ` },

    { t: 'md', c: String.raw`
      ---

      往下一格：[Cache 写策略与命中率计算](#/co/memory/cache-write?at=read-vs-write)。
    ` },

  ],
});
