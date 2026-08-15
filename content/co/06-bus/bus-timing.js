/* ==========================================================================
   计算机组成原理 / 6 总线 / 总线仲裁与定时
   —— 总线是共享资源，于是有两个必须回答的问题：
      「谁能用」（仲裁）和「用的时候怎么对时」（定时）。
      总线本身的结构与带宽在 co/bus/bus-basic。
   ========================================================================== */

KM.page({
  path: 'co/bus/bus-timing',
  title: '总线仲裁与定时',
  subtitle: '共享资源必然要回答两件事：**谁能用**（仲裁）、**用的时候怎么对时**（定时）',
  tags: ['高频', '必考', '概念辨析', '手算'],
  updated: '2026-08-16',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'master-slave', c: '一、主设备与从设备' },

    { t: 'key', id: 'roles', title: '先把两个角色分清（后面所有描述都基于它）', c: String.raw`
      | 角色 | 定义 | 例子 |
      |---|---|---|
      | **主设备**（主模块） | ==能够发起并控制一次总线传输==的设备 | CPU、DMA 控制器、有总线主控能力的网卡 |
      | **从设备**（从模块） | ==只能被动响应==总线请求的设备 | 主存、大多数 I/O 接口 |

      ==只有主设备才需要仲裁==，因为只有它们会去"抢"总线。
      主存永远是从设备，它==从来不会主动申请总线==，所以不参与仲裁。

      **一个常考的推论**：
      $\text{DMA}$ 控制器==是主设备==（它要自己去访问主存），
      这正是 [DMA 请求要和 CPU 抢总线](#/co/cpu/exception?at=dma-vs-int-timing)的原因。
      而普通的中断源==不是主设备==，它抢的是 CPU 的执行权，不是总线。
    ` },

    { t: 'diagram', id: 'four-phases', title: '★ 一次总线传输的四个阶段',
      note: '这一章的两个主题，正好各管一个阶段',
      caption: String.raw`把这四段记牢，本章的结构就清楚了：==① 归仲裁管，③ 归定时管==，②④ 是固定动作。实际带宽为什么达不到理论值，也在这张图里——[见带宽计算](#/co/bus/bus-basic?at=ex-burst)。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 222" role="img" aria-label="一次总线传输的四个阶段：申请、寻址、传数、结束">
  <g class="n a"><rect x="20" y="24" width="148" height="62" rx="8"/><text class="bt sm" x="94.0" y="45.0" text-anchor="middle" dominant-baseline="central">① 申请分配</text><text class="bs" x="94.0" y="65.0" text-anchor="middle" dominant-baseline="central">仲裁授予使用权</text></g>
  <g class="n k"><rect x="190" y="24" width="148" height="62" rx="8"/><text class="bt sm" x="264.0" y="45.0" text-anchor="middle" dominant-baseline="central">② 寻址</text><text class="bs" x="264.0" y="65.0" text-anchor="middle" dominant-baseline="central">送地址+命令选中从设备</text></g>
  <path class="ar" d="M172,55.0 H186"/>
  <g class="n g"><rect x="360" y="24" width="148" height="62" rx="8"/><text class="bt sm" x="434.0" y="45.0" text-anchor="middle" dominant-baseline="central">③ 传数</text><text class="bs" x="434.0" y="65.0" text-anchor="middle" dominant-baseline="central">真正交换数据</text></g>
  <path class="ar" d="M342,55.0 H356"/>
  <g class="n a"><rect x="530" y="24" width="148" height="62" rx="8"/><text class="bt sm" x="604.0" y="45.0" text-anchor="middle" dominant-baseline="central">④ 结束</text><text class="bs" x="604.0" y="65.0" text-anchor="middle" dominant-baseline="central">撤信号，让出总线</text></g>
  <path class="ar" d="M512,55.0 H526"/>
  <g class="n a"><rect x="20" y="116" width="320" height="46" rx="8"/><text class="bt sm" x="180.0" y="129.0" text-anchor="middle" dominant-baseline="central">①④ 是开销</text><text class="bs" x="180.0" y="149.0" text-anchor="middle" dominant-baseline="central">申请、仲裁、撤销，不传任何有效数据</text></g>
  <g class="n g"><rect x="356" y="116" width="320" height="46" rx="8"/><text class="bt sm" x="516.0" y="129.0" text-anchor="middle" dominant-baseline="central">只有 ③ 在传有效数据</text><text class="bs" x="516.0" y="149.0" text-anchor="middle" dominant-baseline="central">一次传得越多，摊到的开销越小</text></g>
  <text class="cap" x="0" y="188">这就是突发传输值钱的原因：一次 ①②④，摊给连续多个 ③</text>
  <text class="lb" x="0" y="210">① 阶段要解决的是「谁能用」= 仲裁；③ 阶段要解决的是「什么时候算收到」= 定时</text>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'arbitration', c: '二、总线仲裁：谁能用总线' },

    { t: 'md', c: String.raw`
      仲裁方式按"判优逻辑放在哪"分成两大类：
      ==集中式==（有一个专门的总线控制器统一裁决）和
      ==分布式==（各设备自己比较，没有中心）。
      408 的重点是集中式的三种。

      开始之前先摆正一件事：==仲裁器不是 CU 的一部分，是一台和 CU 对等的独立状态机==
      （空闲 → 收到请求 → 判优 → 授权 → 等释放），两者只靠 request / grant 两根线对话。
      CU 拿不到授权时，就==停在需要用总线的那个状态上自跳转==——
      [三台状态机怎么接力](#/co/cpu/multi-ctrl?at=relay-1)。
    ` },

    /* ---------------- 链式查询 ---------------- */
    { t: 'diagram', id: 'chain', title: '① 链式查询方式',
      note: '三根线走天下，代价是优先级被物理接线钉死',
      caption: String.raw`==这条链就是中断判优里的菊花链==，同一个手法在两章里各出现一次。它的致命伤是：链上任何一个设备坏了，后面全部拿不到总线。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 294" role="img" aria-label="链式查询：BG 信号沿设备链串行传递，谁有请求谁截住">
  <g class="n p"><rect x="20" y="60" width="140" height="52" rx="8"/><text class="bt sm" x="90.0" y="86.0" text-anchor="middle" dominant-baseline="central">总线控制器</text></g>
  <g class="n k"><rect x="250" y="60" width="110" height="52" rx="8"/><text class="bt sm" x="305.0" y="86.0" text-anchor="middle" dominant-baseline="central">设备 1</text></g>
  <g class="n k"><rect x="390" y="60" width="110" height="52" rx="8"/><text class="bt sm" x="445.0" y="86.0" text-anchor="middle" dominant-baseline="central">设备 2</text></g>
  <g class="n k"><rect x="530" y="60" width="110" height="52" rx="8"/><text class="bt sm" x="585.0" y="86.0" text-anchor="middle" dominant-baseline="central">设备 3</text></g>
  <path class="ar" d="M160,74 H246"/>
  <path class="ar" d="M360,74 H386"/>
  <path class="ar" d="M500,74 H526"/>
  <text class="lb" x="200" y="64" text-anchor="middle">BG</text>
  <text class="lb" x="373" y="64" text-anchor="middle">BG</text>
  <text class="lb" x="513" y="64" text-anchor="middle">BG</text>
  <text class="cap" x="250" y="46">BG 总线同意信号，沿着链条一个一个往下传</text>
  <path class="ar plain" d="M90,112 V150 H660 V112"/>
  <text class="lb" x="375" y="166" text-anchor="middle">BR 总线请求（公共线）</text>
  <path class="ar plain" d="M90,112 V186 H660 V112"/>
  <text class="lb" x="375" y="202" text-anchor="middle">BS 总线忙（公共线）</text>
  <g class="n g"><rect x="20" y="220" width="320" height="62" rx="8"/><text class="bt sm" x="180.0" y="241.0" text-anchor="middle" dominant-baseline="central">有请求就截住 BG 自己用</text><text class="bs" x="180.0" y="261.0" text-anchor="middle" dominant-baseline="central">没请求就把 BG 原样传给下一个</text></g>
  <g class="n a"><rect x="356" y="220" width="320" height="62" rx="8"/><text class="bt sm" x="516.0" y="241.0" text-anchor="middle" dominant-baseline="central">优先级 = 物理位置</text><text class="bs" x="516.0" y="261.0" text-anchor="middle" dominant-baseline="central">离控制器越近越高；只要 3 根线，与设备数无关</text></g>
</svg>
` },

    { t: 'warn', id: 'chain-note', title: '链式查询就是中断判优里的那条菊花链', c: String.raw`
      这个电路和[中断判优的链式排队器](#/co/io/interrupt?at=daisy-chain)==是同一个东西==，
      只是这里争的是总线，那里争的是中断响应权。

      ==同一个电路在 408 里出现两次，值得一起记==：
      优先级由接线顺序定死、上游截住信号下游就收不到、
      改优先级只能重新接线。

      **链式查询独有的一个致命缺点**：
      ==对电路故障极其敏感==。
      链条中间某个设备的 BG 传递电路坏了，==它后面所有设备都永远得不到总线==，
      而且故障现象是"某几个设备莫名其妙不工作"，很难定位。
    ` },

    /* ---------------- 计数器定时查询 ---------------- */
    { t: 'diagram', id: 'counter', title: '② 计数器定时查询方式',
      note: '优先级由计数器的起始值决定 —— 这是它最灵活的地方',
      caption: String.raw`三种起始值对应三种优先级策略，==这一条是选择题最爱考的==。和链式相比，它多了 $\lceil\log_2 n\rceil$ 根地址线，换来了"优先级可编程"。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 314" role="img" aria-label="计数器定时查询：计数值广播给所有设备，地址相符者得到总线">
  <g class="n p"><rect x="250" y="20" width="200" height="60" rx="8"/><text class="bt sm" x="350.0" y="40.0" text-anchor="middle" dominant-baseline="central">总线控制器</text><text class="bs" x="350.0" y="60.0" text-anchor="middle" dominant-baseline="central">内含一个计数器</text></g>
  <path class="ar" d="M350,80 V108"/>
  <text class="lb" x="360" y="98">设备地址线（⌈log₂n⌉ 根），把计数值广播给所有设备</text>
  <g class="n m"><rect x="20" y="112" width="656" height="20" rx="6"/><text class="bt sm" x="348.0" y="122.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <path class="ar plain" d="M165,132 V158"/>
  <g class="n k"><rect x="90" y="158" width="150" height="44" rx="8"/><text class="bt sm" x="165.0" y="180.0" text-anchor="middle" dominant-baseline="central">设备 0</text></g>
  <path class="ar plain" d="M355,132 V158"/>
  <g class="n k"><rect x="280" y="158" width="150" height="44" rx="8"/><text class="bt sm" x="355.0" y="180.0" text-anchor="middle" dominant-baseline="central">设备 1</text></g>
  <path class="ar plain" d="M545,132 V158"/>
  <g class="n k"><rect x="470" y="158" width="150" height="44" rx="8"/><text class="bt sm" x="545.0" y="180.0" text-anchor="middle" dominant-baseline="central">设备 2</text></g>
  <text class="cap" x="0" y="232">某设备发现「计数值 == 自己的地址」且自己有请求 → 获得总线，置 BS=1</text>
  <g class="n g"><rect x="20" y="246" width="214" height="56" rx="8"/><text class="bt xs" x="127.0" y="264.0" text-anchor="middle" dominant-baseline="central">每次从 0 开始</text><text class="bs" x="127.0" y="284.0" text-anchor="middle" dominant-baseline="central">固定优先级，设备 0 最高</text></g>
  <g class="n g"><rect x="242" y="246" width="214" height="56" rx="8"/><text class="bt xs" x="349.0" y="264.0" text-anchor="middle" dominant-baseline="central">从上次终止点开始</text><text class="bs" x="349.0" y="284.0" text-anchor="middle" dominant-baseline="central">循环优先级，机会均等</text></g>
  <g class="n g"><rect x="464" y="246" width="214" height="56" rx="8"/><text class="bt xs" x="571.0" y="264.0" text-anchor="middle" dominant-baseline="central">初值由程序设定</text><text class="bs" x="571.0" y="284.0" text-anchor="middle" dominant-baseline="central">优先级可由软件随时改</text></g>
</svg>
` },

    /* ---------------- 独立请求 ---------------- */
    { t: 'diagram', id: 'independent', title: '③ 独立请求方式',
      note: '每个设备独占一对 BRi / BGi',
      caption: String.raw`==三种方式是一条"用线数换速度与灵活性"的连续谱==：链式 3 根线最慢最死板，独立请求 $2n$ 根线最快最灵活，计数器居中。[三者对比表](#/co/bus/bus-timing?at=arb-compare)`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 322" role="img" aria-label="独立请求方式：每个设备独占一对请求线与同意线">
  <g class="n p"><rect x="230" y="20" width="240" height="60" rx="8"/><text class="bt sm" x="350.0" y="40.0" text-anchor="middle" dominant-baseline="central">总线控制器</text><text class="bs" x="350.0" y="60.0" text-anchor="middle" dominant-baseline="central">内含排队器（判优）</text></g>
  <g class="n k"><rect x="60" y="190" width="180" height="46" rx="8"/><text class="bt sm" x="150.0" y="213.0" text-anchor="middle" dominant-baseline="central">设备 1</text></g>
  <path class="ar plain" d="M120,190 V96"/>
  <path class="ar plain" d="M180,96 V186"/>
  <text class="lb mono" x="94" y="130">BR1</text>
  <text class="lb mono" x="184" y="130">BG1</text>
  <g class="n k"><rect x="270" y="190" width="180" height="46" rx="8"/><text class="bt sm" x="360.0" y="213.0" text-anchor="middle" dominant-baseline="central">设备 2</text></g>
  <path class="ar plain" d="M330,190 V96"/>
  <path class="ar plain" d="M390,96 V186"/>
  <text class="lb mono" x="304" y="130">BR2</text>
  <text class="lb mono" x="394" y="130">BG2</text>
  <g class="n k"><rect x="480" y="190" width="180" height="46" rx="8"/><text class="bt sm" x="570.0" y="213.0" text-anchor="middle" dominant-baseline="central">设备 3</text></g>
  <path class="ar plain" d="M540,190 V96"/>
  <path class="ar plain" d="M600,96 V186"/>
  <text class="lb mono" x="514" y="130">BR3</text>
  <text class="lb mono" x="604" y="130">BG3</text>
  <g class="n g"><rect x="20" y="254" width="320" height="56" rx="8"/><text class="bt sm" x="180.0" y="272.0" text-anchor="middle" dominant-baseline="central">一次判优即可选中</text><text class="bs" x="180.0" y="292.0" text-anchor="middle" dominant-baseline="central">控制器一眼看到所有请求 —— 速度最快</text></g>
  <g class="n r"><rect x="356" y="254" width="320" height="56" rx="8"/><text class="bt sm" x="516.0" y="272.0" text-anchor="middle" dominant-baseline="central">代价是 2n 根线</text><text class="bs" x="516.0" y="292.0" text-anchor="middle" dominant-baseline="central">设备一多就撑不住</text></g>
</svg>
` },

    { t: 'compare', id: 'arb-compare', title: '★★ 三种集中仲裁方式对比（这张表必背）',
      cols: ['', '链式查询', '计数器定时查询', '独立请求'],
      rows: [
        ['**控制线数**', '==$3$ 根==（与 $n$ 无关）', '$\\lceil\\log_2 n\\rceil+2$ 根', '==$2n$ 根=='],
        ['**判优速度**', '==最慢==（BG 要一级级传）', '中等', '==最快=='],
        ['**优先级怎么定**', '==物理接线顺序，固定==', '==计数器初值，可变==', '==排队器，可编程=='],
        ['**能否做到机会均等**', '==不能==', '==能==（循环优先级）', '能'],
        ['**对电路故障**', '==最敏感==（断一处，下游全瘫）', '较不敏感', '==最不敏感=='],
        ['**扩充设备**', '==最容易==（挂上去即可）', '较容易', '==最难==（要加两根线）'],
        ['**硬件成本**', '==最低==', '中', '==最高=='],
      ] },

    { t: 'example',
      id: 'ex-arb-lines',
      title: '三种仲裁方式各需多少根控制线',
      source: '408 常见计算',
      level: 2,
      problem: String.raw`
        某总线上连接了 $16$ 个主设备。分别采用链式查询、计数器定时查询、
        独立请求三种集中仲裁方式时，各需要多少根仲裁控制线？

        若主设备数增加到 $64$ 个，三者又各需多少根？
      `,
      idea: String.raw`
        三个公式记住就行，但==要理解每一项是干什么的==，才不会记混：

        - **链式**：$\texttt{BR}+\texttt{BG}+\texttt{BS}=3$，
          ==BG 是串行传递的，不需要每个设备一根==，所以与 $n$ 无关；
        - **计数器**：$\texttt{BR}+\texttt{BS}+$ ==设备地址线==，
          地址线要能编码 $n$ 个设备，故 $\lceil\log_2 n\rceil+2$；
        - **独立请求**：==每个设备一对 $\texttt{BR}_i/\texttt{BG}_i$==，故 $2n$。

        ==第二问的意义在于看清三者的增长速度==：
        常数 / 对数 / 线性，这才是这道题真正想让你记住的东西。
      `,
      solution: String.raw`
        **$n=16$ 时**

        | 方式 | 计算 | 线数 |
        |---|---|---|
        | 链式查询 | $3$ | $\boxed{3}$ |
        | 计数器定时查询 | $\lceil\log_2 16\rceil+2 = 4+2$ | $\boxed{6}$ |
        | 独立请求 | $2\times16$ | $\boxed{32}$ |

        **$n=64$ 时**

        | 方式 | 计算 | 线数 |
        |---|---|---|
        | 链式查询 | $3$ | $\boxed{3}$（==不变==） |
        | 计数器定时查询 | $\lceil\log_2 64\rceil+2 = 6+2$ | $\boxed{8}$ |
        | 独立请求 | $2\times64$ | $\boxed{128}$ |
      `,
      comment: String.raw`
        **把两组数字并排看，三种方式的本质差别就出来了**：

        | 方式 | 线数随 $n$ | $n:16\to64$ | 判优速度随 $n$ |
        |---|---|---|---|
        | 链式查询 | ==$O(1)$ 常数== | $3\to3$ | ==$O(n)$ 线性变慢== |
        | 计数器 | ==$O(\log n)$== | $6\to8$ | $O(n)$ |
        | 独立请求 | ==$O(n)$ 线性== | $32\to128$ | ==$O(1)$ 恒定== |

        ==注意链式查询和独立请求正好是一对镜像==：
        一个==线最少但最慢==，一个==最快但线最多==，
        计数器方式在两者之间。

        =="用硬件换时间"这个权衡，在这里表现得特别干净==——
        和[单总线 vs 多总线数据通路](#/co/cpu/datapath?at=struct-table)、
        [单总线的 Y/Z vs 多端口寄存器堆](#/co/cpu/datapath?at=regfile-ports)
        是完全相同的取舍结构。

        **一个容易忽略的细节**：
        独立请求方式的 $2n$ 根线，==有的教材还要加一根 $\texttt{BS}$ 变成 $2n+1$==。
        408 按 $2n$ 答即可；若题目明确提到总线忙信号，再加 $1$ 并注明。
      `,
    },

    { t: 'key', id: 'distributed', title: '分布式仲裁：没有中心的裁决', c: String.raw`
      不设中央仲裁器，==每个设备都有自己的仲裁号和仲裁器==。

      **工作方式**：申请总线时，各设备==把自己的仲裁号送到共享的仲裁总线上==，
      然后每个设备把总线上出现的号==与自己的比较==：

      - 若总线上的号==比自己大==，则==撤销自己的号==（认输）；
      - 最后==留在总线上的那个号，就是优先级最高的申请者==。

      ~~~
      设备A 仲裁号 0110 ┐
      设备B 仲裁号 1010 ├──▶ 仲裁总线（线或）──▶ 1110
      设备C 仲裁号 1100 ┘                          ↑
                                    各设备逐位比较，输了就撤号
                                    最终 B(1010) 与 C(1100) 比较…
                                    ★ 号大者胜，无需中心裁决
      ~~~

      **优点**：==没有单点故障==，响应快，易于扩展。
      **缺点**：==每个设备都要一套仲裁逻辑==，硬件重复。

      ==现代高速互连基本都是分布式或点对点的==，
      中央仲裁器那种"总线控制器"已经很少见了（见[最后一节](#/co/bus/bus-timing?at=modern)）。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'timing', c: '三、总线定时：怎么知道对方收到了' },

    { t: 'key', id: 'why-timing', title: '定时要解决的问题', c: String.raw`
      主设备把数据送上总线之后，==它怎么知道从设备已经取走了？==
      从设备把数据送上总线，==主设备怎么知道数据已经稳定可读了？==

      这就是**总线定时**：==规定信号在什么时刻有效、双方如何确认==。

      两条根本不同的思路：

      $$\underbrace{\textbf{同步}}_{\text{看表：说好第 3 拍取，那就第 3 拍取}}
      \qquad\text{vs}\qquad
      \underbrace{\textbf{异步}}_{\text{对话：我好了告诉你，你收到了回我一声}}$$
    ` },

    { t: 'compare', id: 'sync-async', title: '★★ 同步定时 vs 异步定时',
      cols: ['', '同步定时', '异步定时'],
      rows: [
        ['靠什么协调', '==统一的时钟信号==', '==请求—回答（握手）信号=='],
        ['总线周期长度', '==固定==', '==可变==，随实际速度伸缩'],
        ['速度', '==快==（无握手开销）', '==慢==（每次都要往返确认）'],
        ['按谁的速度设计', '==必须迁就最慢的模块==', '==各按各的速度=='],
        ['控制逻辑', '==简单==', '==复杂=='],
        ['适用场合', '==总线短、各模块速度接近==', '==速度差异大、总线较长=='],
        ['典型', 'CPU 与主存之间', 'CPU 与低速外设之间'],
      ] },

    { t: 'warn', id: 'sync-waste', title: '★ 同步定时的浪费在哪（这是异步存在的理由）', c: String.raw`
      同步总线的时钟周期==必须按最慢的模块来定==。
      于是一个快模块明明 $10\ \text{ns}$ 就做完了，也得==干等到 $100\ \text{ns}$ 的周期结束==。

      ~~~
      同步：   ├────── 100ns ──────┤├────── 100ns ──────┤
      快模块    ██ 10ns  ░░░░░ 白等 ░░░░░
      慢模块    ████████████ 100ns ███████

      异步：   ├─ 20ns ─┤├──────── 110ns ────────┤
      快模块    ██ 完了就说一声，立刻进下一个
      慢模块              ████████ 慢就慢，不催
      ~~~

      ==这和[流水线的瓶颈段](#/co/cpu/pipeline?at=unequal-stages)是同一种浪费==：
      统一节拍必然迁就最慢的那个。
      异步的思路是==取消统一节拍==，代价是每次都要付握手的往返开销。

      ==所以"异步一定比同步慢"这句话是错的==：
      当各模块速度==差异很大==时，异步反而更快（不必人人迁就最慢的）；
      当各模块速度==接近==时，同步更快（省掉握手开销）。
      ==这才是"适用场合"那一行的真正含义。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'handshake', c: '四、异步定时的三种握手' },

    { t: 'diagram', id: 'three-handshake', title: '★★ 不互锁 / 半互锁 / 全互锁',
      note: '看「撤销信号时要不要等对方」，立刻能判断是哪一种',
      caption: String.raw`==判据只有一条：撤销的时机由谁决定。==
        自己定时撤 = 不互锁；等对方的信号才撤 = 互锁。
        两条线各判一次，就得到"不 / 半 / 全"三种组合。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 340" role="img" aria-label="不互锁、半互锁、全互锁三种异步握手的请求与回答波形">
  <text class="cap" x="0" y="14">① 不互锁：双方都不等对方</text>
  <text class="lb" x="88" y="42" text-anchor="end" dominant-baseline="central">请求</text>
  <path class="wv" d="M96,53 H140 V31 H300 V53 H560"/>
  <text class="lb" x="88" y="76" text-anchor="end" dominant-baseline="central">回答</text>
  <path class="wv" d="M96,87 H210 V65 H270 V87 H560"/>
  <text class="lb" x="96" y="102">请求过一段时间自己撤，回答也是自己撤　→　最快，最不可靠</text>

  <text class="cap" x="0" y="124">② 半互锁：主等从，从不等主</text>
  <text class="lb" x="88" y="152" text-anchor="end" dominant-baseline="central">请求</text>
  <path class="wv" d="M96,163 H140 V141 H380 V163 H560"/>
  <text class="lb" x="88" y="186" text-anchor="end" dominant-baseline="central">回答</text>
  <path class="wv" d="M96,197 H250 V175 H330 V197 H560"/>
  <text class="lb" x="96" y="212">请求必须等到回答有效才撤；回答仍是自己撤　→　折中</text>
  <path class="ar dash" d="M250,175 L380,163"/>
  <text class="lb" x="315" y="165" text-anchor="middle">等到回答才撤请求</text>

  <text class="cap" x="0" y="234">③ 全互锁：互相等</text>
  <text class="lb" x="88" y="262" text-anchor="end" dominant-baseline="central">请求</text>
  <path class="wv" d="M96,273 H140 V251 H380 V273 H560"/>
  <text class="lb" x="88" y="296" text-anchor="end" dominant-baseline="central">回答</text>
  <path class="wv" d="M96,307 H250 V285 H450 V307 H560"/>
  <text class="lb" x="96" y="322">请求等回答有效、回答等请求撤销　→　最可靠，最慢</text>
  <path class="ar dash" d="M250,285 L380,273"/>
  <text class="lb" x="315" y="275" text-anchor="middle">等回答</text>
  <path class="ar dash" d="M380,273 L450,285"/>
  <text class="lb" x="415" y="275" text-anchor="middle">等请求撤</text>
</svg>` },

    { t: 'key', id: 'handshake-rule', title: '一句话判断是哪一种', c: String.raw`
      ==只看"撤销信号的时候，要不要等对方"==：

      | | 主设备撤请求，要等回答吗 | 从设备撤回答，要等请求撤销吗 |
      |---|---|---|
      | **不互锁** | ==不等== | ==不等== |
      | **半互锁** | ==要等== | ==不等== |
      | **全互锁** | ==要等== | ==要等== |

      **可靠性**：全互锁 $>$ 半互锁 $>$ 不互锁
      **速度**：不互锁 $>$ 半互锁 $>$ 全互锁

      ==两个排序正好相反==，这就是可靠性与速度的直接交换。

      **记忆锚点**：=="互锁"的意思就是"锁住等对方"==。
      锁的次数越多越可靠也越慢：$0$ 次、$1$ 次、$2$ 次，
      对应不互锁、半互锁、全互锁。

      ==注意"半互锁"锁的一定是主设备那一侧==
      （主等从），==不会反过来==。
      因为总线传输总是主设备发起的，从设备无从判断"该不该等"。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'hybrid', c: '五、半同步与分离式事务' },

    { t: 'key', id: 'semi-sync', title: '半同步：同步的骨架 + 一根等待线', c: String.raw`
      **做法**：==保留统一时钟==（所有信号仍在时钟边沿采样），
      但增加一条 ==$\texttt{WAIT}$（等待响应）信号线==。

      ~~~
      时钟    ┌┐┌┐┌┐┌┐┌┐┌┐┌┐
              └┘└┘└┘└┘└┘└┘└┘
      WAIT    ─────┐     ┌──────    从模块来不及 → 拉低 WAIT
                   └─────┘
      总线周期  T1  T2 Tw Tw  T3     主模块检测到 WAIT 有效
                       └──┬──┘       → 【插入等待周期 Tw】，原地踏步
                       插入的等待周期
      ~~~

      ==等待周期必须是时钟周期的整数倍==，这一点很关键 ——
      它保证了整个系统仍然是同步的，只是==周期数可变==。

      **它拿到了什么**：
      ==同步的简单性== + ==对慢模块的容忍==。
      $\text{ISA}$、早期 $\text{PCI}$ 用的就是这种方式。
    ` },

    { t: 'diagram', id: 'split-transaction', title: '★ 分离式事务：把等待的时间还给总线',
      note: '中间那段灰色的空转，被换成了别人可用的时间',
      caption: String.raw`==这就是总线上的流水线==：把一次事务拆成两个子周期，空出来的那段时间让别的设备插进来用。代价是每个子周期都要重新仲裁一次，[单次延迟反而变长](#/co/bus/bus-timing?at=split-why)。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 264" role="img" aria-label="普通方式全程占用总线，分离式事务把等待时间还给总线">
  <text class="cap" x="0" y="14">① 普通方式：总线被全程占用</text>
  <g class="n k"><rect x="96" y="24" width="130" height="26" rx="4"/><text class="bt xs" x="161.0" y="37.0" text-anchor="middle" dominant-baseline="central">发地址 / 命令</text></g>
  <g class="n m"><rect x="230" y="24" width="300" height="26" rx="4"/><text class="bt xs" x="380.0" y="37.0" text-anchor="middle" dominant-baseline="central">等从模块准备数据（总线空转）</text></g>
  <g class="n k"><rect x="534" y="24" width="142" height="26" rx="4"/><text class="bt xs" x="605.0" y="37.0" text-anchor="middle" dominant-baseline="central">收数据</text></g>
  <text class="lb" x="0" y="42" dominant-baseline="central">总线</text>
  <g class="n r"><rect x="96" y="56" width="580" height="18" rx="4"/><text class="bt xs" x="386.0" y="65.0" text-anchor="middle" dominant-baseline="central">一直被占着，别人用不了</text></g>
  <text class="cap" x="0" y="110">② 分离式事务：拆成两个独立的子周期</text>
  <text class="lb" x="0" y="138" dominant-baseline="central">总线</text>
  <g class="n k"><rect x="96" y="124" width="130" height="26" rx="4"/><text class="bt xs" x="161.0" y="137.0" text-anchor="middle" dominant-baseline="central">子周期 1：发地址+命令</text></g>
  <g class="n g"><rect x="230" y="124" width="300" height="26" rx="4"/><text class="bt xs" x="380.0" y="137.0" text-anchor="middle" dominant-baseline="central">让出来了！别的设备正常使用</text></g>
  <g class="n k"><rect x="534" y="124" width="142" height="26" rx="4"/><text class="bt xs" x="605.0" y="137.0" text-anchor="middle" dominant-baseline="central">子周期 2：送数据</text></g>
  <text class="lb" x="0" y="170" dominant-baseline="central">从模块</text>
  <g class="n a"><rect x="230" y="156" width="300" height="26" rx="4"/><text class="bt xs" x="380.0" y="169.0" text-anchor="middle" dominant-baseline="central">自己去准备数据，不占总线</text></g>
  <g class="n g"><rect x="20" y="202" width="656" height="50" rx="8"/><text class="bt sm" x="348.0" y="217.0" text-anchor="middle" dominant-baseline="central">关键：从模块从"被动应答"变成了"主动发起"</text><text class="bs" x="348.0" y="237.0" text-anchor="middle" dominant-baseline="central">所以它在送数据那一刻也成了主设备，同样要参与仲裁</text></g>
</svg>
` },

    { t: 'key', id: 'split-why', title: '分离式事务的本质：这就是总线上的流水线', c: String.raw`
      普通传输里，==总线的利用率被"等待"拖垮了==：
      主模块发完地址就一直占着总线干等，而这段时间总线==什么也没传==。

      分离式事务的思路和[流水线](#/co/cpu/pipeline?at=not-faster)一模一样：

      $$\text{把一件事拆成两段}\ \Rightarrow\ \text{中间的空隙让别人填}\ \Rightarrow\ \textbf{吞吐率上升}$$

      ==注意它同样不缩短单次传输的延迟==（一次读取该等多久还是多久），
      ==只提高总线的利用率和总吞吐率==。
      这和"流水线不缩短单条指令时间"是同一句话。

      **代价**：

      - 从模块必须具备==主设备能力==（要能申请总线）；
      - 必须有办法把返回的数据==和当初的请求对上号==
        （现代协议用 ==tag / transaction ID== 标记，==允许多个请求同时在飞==）；
      - 控制逻辑复杂得多。

      ==这正是现代高速总线的标配==：PCIe 的 split transaction、
      内存控制器的请求/响应分离，都是它的直系后代。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'calc', c: '六、定时方式的性能计算' },

    { t: 'example',
      id: 'ex-sync-async',
      title: '同步与异步传输同样的数据，各要多久',
      source: '408 常见计算',
      level: 3,
      problem: String.raw`
        某总线宽度为 $32$ 位，需要传输 $1\ \text{KB}$ 的数据块（$1\ \text{KB}=1024\ \text{B}$）。

        **(1) 同步方式**：总线时钟频率 $50\ \text{MHz}$，
        ==每个总线周期传送一个 $32$ 位数据，一个总线周期占 $2$ 个时钟周期==。
        求传完该数据块所需时间与实际传输率。

        **(2) 异步方式**：采用全互锁握手，==每传送一个 $32$ 位数据需要 $4$ 次信号跳变，
        每次跳变间隔 $30\ \text{ns}$==。求所需时间与实际传输率。

        **(3)** 两者相差多少倍？
      `,
      idea: String.raw`
        两问的结构完全一样，都是

        $$\text{总时间} = \text{传送次数}\times\text{每次的时间}$$

        ==第一步永远是先算"要传多少次"==：
        $1\ \text{KB}$ 按 $32$ 位（$4\ \text{B}$）一次，
        $1024\div4=256$ 次。这一步两问共用。

        剩下就是分别算"每次多久"：
        同步看时钟周期数，异步看跳变次数。
      `,
      solution: String.raw`
        **传送次数**（两问共用）

        $$\frac{1024\ \text{B}}{32\ \text{位}\div8} = \frac{1024}{4} = 256\ \text{次}$$

        **(1) 同步方式**

        时钟周期 $=\dfrac{1}{50\ \text{MHz}}=20\ \text{ns}$

        一个总线周期 $=2\times20=40\ \text{ns}$

        $$T_{\text{同步}} = 256\times40 = \boxed{10240\ \text{ns}\approx10.24\ \mu\text{s}}$$

        $$\text{传输率} = \frac{1024\ \text{B}}{10240\ \text{ns}} = 0.1\times10^{9} = \boxed{100\ \text{MB/s}}$$

        **(2) 异步方式**

        一次传送 $=4\times30=120\ \text{ns}$

        $$T_{\text{异步}} = 256\times120 = \boxed{30720\ \text{ns}\approx30.72\ \mu\text{s}}$$

        $$\text{传输率} = \frac{1024\ \text{B}}{30720\ \text{ns}} = 0.0333\times10^{9} \approx \boxed{33.3\ \text{MB/s}}$$

        **(3) 倍数**

        $$\frac{30720}{10240} = \boxed{3\ \text{倍}}$$

        ==同步方式的传输率是异步方式的 $3$ 倍。==
      `,
      comment: String.raw`
        **这道题印证了那条对比**：同步快、异步慢，
        差距全在==握手的往返开销==上（$4$ 次跳变，每次 $30\ \text{ns}$）。

        **但别把结论记死了**。把题目改一个条件就会反过来：

        > 若从设备的实际响应时间只有 $30\ \text{ns}$，
        > 而同步总线为了迁就系统里最慢的那个模块，把周期定成了 $200\ \text{ns}$ ——

        | 方式 | 每次 | $256$ 次 |
        |---|---|---|
        | 同步（周期 $200\ \text{ns}$） | $200\ \text{ns}$ | $51.2\ \mu\text{s}$ |
        | 异步（实际只需 $120\ \text{ns}$） | $120\ \text{ns}$ | $30.72\ \mu\text{s}$ |

        ==这次异步快了==。

        **所以正确的结论是**：
        ==同步省掉了握手开销，异步省掉了迁就最慢模块的浪费==，
        谁快取决于==这两项开销哪个更大==，
        也就是[上面那张浪费示意图](#/co/bus/bus-timing?at=sync-waste)说的事。

        **考场上怎么答**：题目给了具体数字就老实算；
        问"哪种更适合"就答==速度接近用同步、差异大用异步==。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'modern', c: '七、略高于考纲：仲裁是怎么消失的' },

    { t: 'key', id: 'no-more-arb', title: '点对点连接让"仲裁"这个问题不复存在', c: String.raw`
      这一章讲的三种仲裁方式，==前提是"多个设备挂在同一组线上"==。
      而现代高速互连==从根上取消了这个前提==：

      ~~~
      共享总线（旧）                     点对点交换（新）
      ─────────────────────             ─────────────────────
      A ──┬──┬──┬── B                        A     B
          │  │  │                             \   /
          C  D  E                              \ /
                                          ┌────╳────┐
      同一时刻只有一对能通信                 │  Switch │
      → 必须仲裁                            └─┬─────┬─┘
                                            C       D

                                        每条链路只有两端 → 【不需要仲裁】
                                        多对可以【同时】通信
      ~~~

      **于是问题被"搬家"了，而不是被消灭了**：

      | 旧问题（共享总线） | 新形态（交换结构） |
      |---|---|
      | 总线仲裁：谁能用总线 | ==交换芯片内部的调度与缓冲管理== |
      | 总线忙 $\texttt{BS}$ | ==链路层的流量控制（credit）== |
      | 一次只能一对通信 | ==多对并发，但交换芯片可能成为新瓶颈== |

      ==这是体系结构里很常见的一幕==：
      一个问题不是被解决的，而是==被换了个地方==。
      理解旧方案，才知道新方案到底买到了什么、又付出了什么。
    ` },

    { t: 'key', id: 'why-still-learn', title: '那为什么还要学共享总线', c: String.raw`
      三条实在的理由：

      **① 芯片内部仍然到处是共享总线。**
      片上的低速外设（$\text{I}^2\text{C}$、$\text{SPI}$、$\text{APB}$）
      ==依然是共享的、需要仲裁的==。
      共享总线只是==从机箱里退到了芯片里==。

      **② "共享资源如何分配"这个模型到处都是。**
      ==总线仲裁的三种方式，和这些问题是同构的==：

      | 总线仲裁 | 同构的问题 |
      |---|---|
      | 链式查询 | [中断的链式排队器](#/co/io/interrupt?at=daisy-chain) |
      | 计数器循环优先级 | 进程调度的时间片轮转 |
      | 独立请求 + 排队器 | [中断的向量判优](#/co/io/interrupt?at=two-priorities) |

      ==学的其实不是"总线"，是"仲裁"这个思想模型。==

      **③ 它是理解带宽瓶颈的基础。**
      内存总线至今仍是共享的 ——
      多核 CPU 争抢同一个内存控制器，==本质上还是总线争用==，
      只是仲裁逻辑藏在了内存控制器里。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '八、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **链式查询的线数写成与 $n$ 有关** ——
         ==恒为 $3$ 根==，因为 BG 是串行传递的，见[对比表](#/co/bus/bus-timing?at=arb-compare)。
      2. **计数器方式忘了 $+2$** —— ==$\lceil\log_2 n\rceil+2$==，
         那 $2$ 根是 $\texttt{BR}$ 和 $\texttt{BS}$。
      3. **独立请求写成 $n$ 根** —— ==是 $2n$==，每个设备要一对（请求 + 同意）。
      4. **把"判优速度"和"线数"的优劣记反** ——
         ==链式线最少但最慢，独立请求线最多但最快==，正好是镜像。
      5. **认为链式查询不能扩充设备** ——
         恰恰相反，==链式最容易扩充==；它的缺点是==优先级固定 + 怕故障==。
      6. **半互锁记成"从等主"** —— ==是主等从==（主设备撤请求前要等到回答）。
      7. **背死"异步一定比同步慢"** ——
         ==速度差异大时异步反而更快==，见[这道题的讨论](#/co/bus/bus-timing?at=ex-sync-async)。
      8. **认为半同步就是异步** ——
         ==半同步仍有统一时钟==，等待周期必须是时钟周期的整数倍。
      9. **认为分离式事务缩短了单次传输的延迟** ——
         ==只提高总线利用率和吞吐率==，和流水线一样。
      10. **认为主存也要参与总线仲裁** ——
          ==主存是从设备，从不主动申请总线==；
          $\text{DMA}$ 控制器才是主设备。
      11. **算传输时间时忘了先求"传送次数"** ——
          ==先用数据总量 $\div$ 每次的字节数==，这一步两种定时方式共用。
    ` },

    { t: 'md', c: String.raw`
      ---

      总线本身的结构、分类与带宽计算在
      [总线结构与性能指标](#/co/bus/bus-basic?at=tradeoff)。
    ` },

  ],
});
