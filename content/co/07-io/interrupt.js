/* ==========================================================================
   计算机组成原理 / 7 输入输出系统 / 中断响应与处理流程
   —— 「中断是什么、CPU 被打断的那一拍硬件做了什么」在 CPU 章：
      #/co/cpu/exception
      这一页从"请求怎么登记"开始，一路到"一次中断花多少钱"。
   ========================================================================== */

KM.page({
  path: 'co/io/interrupt',
  title: '中断响应与处理流程',
  subtitle: '请求 → 判优 → 响应 → 处理 → 返回。**屏蔽字**和**两种优先级**是这一节全部难点的来源',
  tags: ['高频', '必考', '综合应用', '手算'],
  updated: '2026-08-16',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'timeline', c: '一、一次完整的程序中断方式 I/O' },

    { t: 'diagram', id: 'full-timeline', title: '从启动设备到数据到手，时间轴上发生了什么',
      note: '琥珀 = CPU 在跑用户程序，绿 = 设备侧，蓝 = 硬件，紫 = 软件',
      caption: String.raw`==这张图的分界线在③和④之间==：③ 及以前全是硬件自动做的（中断隐指令），④ 及以后全是中断服务程序（软件）做的。考试问"这一步由硬件还是软件完成"，看的就是这条线。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 352" role="img" aria-label="从启动设备到数据到手：CPU 侧、设备侧、硬件与软件各做了什么">
  <text class="cap" x="0" y="14">CPU 侧</text>
  <g class="n a"><rect x="20" y="24" width="210" height="44" rx="8"/><text class="bt sm" x="125.0" y="46.0" text-anchor="middle" dominant-baseline="central">执行用户程序</text></g>
  <g class="n a"><rect x="243" y="24" width="210" height="44" rx="8"/><text class="bt sm" x="348.0" y="46.0" text-anchor="middle" dominant-baseline="central">执行 I/O 指令启动设备</text></g>
  <path class="ar" d="M234,46.0 H239"/>
  <g class="n a"><rect x="466" y="24" width="210" height="44" rx="8"/><text class="bt sm" x="571.0" y="46.0" text-anchor="middle" dominant-baseline="central">继续执行用户程序</text></g>
  <path class="ar" d="M457,46.0 H462"/>
  <text class="cap" x="0" y="96">设备侧</text>
  <g class="n g"><rect x="243" y="106" width="210" height="40" rx="8"/><text class="bt sm" x="348.0" y="126.0" text-anchor="middle" dominant-baseline="central">设备开始工作（很慢）</text></g>
  <g class="n g"><rect x="466" y="106" width="210" height="40" rx="8"/><text class="bt sm" x="571.0" y="126.0" text-anchor="middle" dominant-baseline="central">数据好了，发中断请求</text></g>
  <path class="ar" d="M348,68 V102"/>
  <path class="ar" d="M571,146 V180"/>
  <text class="cap" x="0" y="176">硬件</text>
  <g class="n k"><rect x="20" y="184" width="210" height="44" rx="8"/><text class="bt sm" x="125.0" y="206.0" text-anchor="middle" dominant-baseline="central">① 当前指令执行完</text></g>
  <g class="n k"><rect x="243" y="184" width="210" height="44" rx="8"/><text class="bt sm" x="348.0" y="206.0" text-anchor="middle" dominant-baseline="central">② 判优</text></g>
  <path class="ar" d="M234,206.0 H239"/>
  <g class="n k"><rect x="466" y="184" width="210" height="44" rx="8"/><text class="bt sm" x="571.0" y="206.0" text-anchor="middle" dominant-baseline="central">③ 中断隐指令</text></g>
  <path class="ar" d="M457,206.0 H462"/>
  <text class="lb" x="466" y="244">关中断 / 存断点 / 送入口地址</text>
  <text class="cap" x="0" y="268">软件</text>
  <g class="n p"><rect x="20" y="276" width="102" height="40" rx="4"/><text class="bt xs" x="71.0" y="296.0" text-anchor="middle" dominant-baseline="central">④ 保护现场</text></g>
  <g class="n p"><rect x="130" y="276" width="102" height="40" rx="4"/><text class="bt xs" x="181.0" y="296.0" text-anchor="middle" dominant-baseline="central">⑤ 开中断</text></g>
  <path class="ar" d="M122,296 H127"/>
  <g class="n p"><rect x="240" y="276" width="102" height="40" rx="4"/><text class="bt xs" x="291.0" y="296.0" text-anchor="middle" dominant-baseline="central">⑥ 设备服务</text></g>
  <path class="ar" d="M232,296 H237"/>
  <g class="n p"><rect x="350" y="276" width="102" height="40" rx="4"/><text class="bt xs" x="401.0" y="296.0" text-anchor="middle" dominant-baseline="central">⑦ 关中断</text></g>
  <path class="ar" d="M342,296 H347"/>
  <g class="n p"><rect x="460" y="276" width="102" height="40" rx="4"/><text class="bt xs" x="511.0" y="296.0" text-anchor="middle" dominant-baseline="central">⑧ 恢复现场</text></g>
  <path class="ar" d="M452,296 H457"/>
  <g class="n p"><rect x="570" y="276" width="102" height="40" rx="4"/><text class="bt xs" x="621.0" y="296.0" text-anchor="middle" dominant-baseline="central">⑨ IRET</text></g>
  <path class="ar" d="M562,296 H567"/>
  <text class="cap" x="0" y="340">⑨ 之后回到用户程序的断点处继续 —— 中间这一段用户程序完全不知道发生过什么</text>
</svg>
` },

    { t: 'key', id: 'four-stages', title: '四个阶段与它们的分界线', c: String.raw`
      | 阶段 | 干什么 | ==由谁完成== |
      |---|---|---|
      | **中断请求** | 中断源举手，把标志记进中断请求触发器 | 接口电路（硬件） |
      | **中断判优** | 多个请求同时在，选一个 | 排队器（硬件）或查询程序（软件） |
      | **中断响应** | 关中断 / 保存断点 / 引出服务程序 | ==硬件==（中断隐指令） |
      | **中断处理** | 保护现场 / 设备服务 / 恢复现场 | ==软件==（中断服务程序） |
      | **中断返回** | 恢复断点与 PSW | $\texttt{IRET}$ 指令 |

      =="响应"和"处理"之间那条线，就是硬件与软件的分界线==，
      也是[断点与现场之争](#/co/cpu/exception?at=bp-scene-table)的由来。
      考试问"下列哪些属于中断响应阶段完成的工作"，答案永远只在硬件那三件里挑。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'request', c: '二、中断请求怎么登记：三个触发器' },

    { t: 'key', id: 'three-ff', title: '每个中断源身上挂着三个触发器', c: String.raw`
      | 触发器 | 记号 | 作用 |
      |---|---|---|
      | **中断请求触发器** | $\texttt{INTR}$ | 该中断源==是否提出了请求==。设备就绪时置 1 |
      | **中断屏蔽触发器** | $\texttt{MASK}$ | 该中断源==是否被屏蔽==。为 1 表示屏蔽，请求不往外送 |
      | **中断允许触发器** | $\texttt{EINT}$ | ==全局==开关，CPU 内部只有一个，即 PSW 的 IF 位 |

      三者是==串联==关系，一个请求要真正送到 CPU：

      $$\text{有效请求}_i = \texttt{INTR}_i \cdot \overline{\texttt{MASK}_i} \cdot \texttt{EINT}$$

      **注意 $\texttt{MASK}$ 和 $\texttt{EINT}$ 的区别，这一组很爱考：**

      - $\texttt{MASK}$ 是==每个中断源一个==，是**局部**开关，
        全体 $\texttt{MASK}$ 位拼起来就是**中断屏蔽字**；
      - $\texttt{EINT}$ 是==整个 CPU 一个==，是**总**开关，
        关中断 / 开中断指令动的就是它。

      ==被 $\texttt{MASK}$ 屏蔽的请求不会丢==，$\texttt{INTR}$ 里的 1 还在，
      等屏蔽字改回来它就会被响应 —— 这是画时间图时最容易漏的一点。
    ` },

    { t: 'warn', id: 'not-lost', title: '★ "屏蔽"不等于"取消"', c: String.raw`
      屏蔽只是==挡住请求不让它送到判优电路==，
      中断请求触发器里那个 1 一直保持着。

      所以在[屏蔽字大题](#/co/io/interrupt?at=ex-mask)里，
      被屏蔽期间到达的请求==会一直排着队==，
      一旦当前服务程序结束、屏蔽字被恢复，它们==立刻涌上来==。

      画时间图时的固定动作：==每次一段服务程序结束，都要回头看一眼有没有攒着的请求==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'arbitration', c: '三、判优：谁先被响应' },

    { t: 'insight', id: 'my-wiring-question', title: '★ 我卡住的地方：这些东西到底怎么连的', c: String.raw`
      这里的部件有哪些中断？==有自己的仲裁器吗==？然后连线是怎么样的？

      我知道不同的外设需要有请求和响应线，那 $\texttt{INTR}$ 和 $\texttt{IF}$ 呢，
      ==这属于中断仲裁器中的寄存器吗==？然后直接连接到 CU 上吗，还是怎样？

      ==我希望有一个清晰的连线认知。==
    ` },

    { t: 'key', id: 'wiring-answer', title: '★ 答案：仲裁在外面，IF 在里面，中间隔着一次总线级握手', c: String.raw`
      这里最容易混的一点是：==「仲裁器」和「$\texttt{INTR}$ / $\texttt{IF}$」根本不在同一层==。

      - **$\texttt{INTR}$ 不是仲裁器里的寄存器**，它是==仲裁器的输出线==——
        把所有未被屏蔽的请求"或"在一起，得到==一根信号线==，
        接到 CPU 的一个引脚上，含义是"外面至少有一个请求在等"；
      - **$\texttt{IF}$ 更不属于仲裁器**，它物理上就在==标志寄存器==里，
        逻辑上被 CU 的中断查询逻辑直接读取，$\texttt{STI}$ / $\texttt{CLI}$ 动的就是它。

      ==仲裁器决定"外面谁该被选中"，$\texttt{IF}$ 决定"CPU 这一刻愿不愿意搭理外面任何请求"。==
      两件事完全独立，靠下面这两根线握手。

      **别把"寄存器"的直觉安错地方**：
      你觉得这里应该有寄存器，==这个直觉是对的==——
      中断请求寄存器、中断屏蔽寄存器确实存在，
      但它们是==外部的、按中断源编号的==，不是 $\texttt{INTR}$，更不是 $\texttt{IF}$。
    ` },

    { t: 'diagram', id: 'int-boundary', title: '★ 判优这件事，到底发生在 CPU 里还是 CPU 外',
      note: '一条中断请求线的两端，各站着什么部件',
      caption: String.raw`==横在中间的三根线才是主机与外设的真正分界==：$\texttt{INTR}$ 和 $\texttt{INTA}$ 是**控制线**，中断类型号走的是**数据线**。左边那一块可以整个做成一片独立芯片（中断控制器），它是[一台自己会判优的控制器](#/co/cpu/multi-ctrl?at=named-controller)，不归 CU 逐拍指挥。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 200" role="img" aria-label="接口一侧的请求触发器与排队器，CPU 一侧的中断允许触发器与响应逻辑，中间由三根线连接">
  <g class="n g"><rect x="14" y="16" width="250" height="170" rx="8"/></g>
  <text class="cap" x="26" y="36">接口 / 中断控制器一侧</text>
  <g class="n a"><rect x="26" y="44" width="226" height="44" rx="6"/><text class="bt xs" x="139" y="60" text-anchor="middle" dominant-baseline="central">中断请求触发器 INTR</text><text class="bs" x="139" y="77" text-anchor="middle" dominant-baseline="central">每个中断源一位</text></g>
  <g class="n p"><rect x="26" y="100" width="226" height="44" rx="6"/><text class="bt xs" x="139" y="116" text-anchor="middle" dominant-baseline="central">屏蔽 MASK + 排队器</text><text class="bs" x="139" y="133" text-anchor="middle" dominant-baseline="central">先与屏蔽位相与，再判优</text></g>
  <text class="lb" x="26" y="168">排队器也可以集中做在 CPU 内部</text>
  <text class="lb" x="348" y="62" text-anchor="middle">INTR 请求线（专用控制线）</text>
  <path class="ar" d="M264,74 H428"/>
  <text class="lb" x="348" y="102" text-anchor="middle">INTA 应答（控制线）</text>
  <path class="ar" d="M432,114 H268"/>
  <text class="lb em" x="348" y="142" text-anchor="middle">中断类型号（走数据总线）</text>
  <path class="ar em" d="M264,154 H428"/>
  <g class="n k"><rect x="436" y="16" width="250" height="170" rx="8"/></g>
  <text class="cap" x="448" y="36">CPU 内部（CU 管辖）</text>
  <g class="n a"><rect x="448" y="44" width="226" height="44" rx="6"/><text class="bt xs" x="561" y="60" text-anchor="middle" dominant-baseline="central">中断允许触发器 IF</text><text class="bs" x="561" y="77" text-anchor="middle" dominant-baseline="central">PSW 里的一位，全机只有一个</text></g>
  <g class="n p"><rect x="448" y="100" width="226" height="44" rx="6"/><text class="bt xs" x="561" y="116" text-anchor="middle" dominant-baseline="central">CU 的中断响应逻辑</text><text class="bs" x="561" y="133" text-anchor="middle" dominant-baseline="central">末拍采样，发起中断周期</text></g>
</svg>
` },

    { t: 'key', id: 'where-lives', title: '★ 哪个部件在哪一侧（选择题就问这个）', c: String.raw`
      | 部件 | 在哪 | 一句话 |
      |---|---|---|
      | 中断请求触发器 $\texttt{INTR}$ | ==接口里==，每个中断源一个 | 设备就绪时置 1 |
      | 中断屏蔽触发器 $\texttt{MASK}$ | ==接口里==，每个中断源一个 | 拼起来就是[屏蔽字](#/co/io/interrupt?at=mask-rule) |
      | 排队器（判优电路） | ==两种做法都有== | 集中在 CPU 内，或分散在各接口（[链式](#/co/io/interrupt?at=daisy-chain)） |
      | 中断允许触发器 $\texttt{IF}$ | ==只在 CPU 内==，全机唯一 | 开中断 / 关中断动的就是它 |
      | 中断响应的时序控制 | ==只在 CPU 内==（CU） | 决定[什么时候看一眼请求线](#/co/cpu/exception?at=sample-timing) |

      **两个容易记反的点：**

      1. ==屏蔽是"每个源一个"，允许是"整机一个"== ——
         所以"关中断"关掉的是全体，改屏蔽字改的是个别；
      2. ==排队器的位置不固定==，教材两种画法都出现过。
         题目没给电路图时==别断言"排队器一定在 CPU 里"==；
         但只要出现"链式排队器 / 菊花链"，那就一定是==分散在各接口上==的那种。
    ` },

    { t: 'compare', id: 'arb-compare', title: '硬件排队 vs 软件查询',
      cols: ['', '硬件排队器', '软件查询程序'],
      rows: [
        ['怎么实现', '专门的优先级编码 / 链式排队电路', '一段查询程序，按顺序测试各中断源标志'],
        ['优先级由什么决定', '==电路接法（链式排队器里就是物理连接顺序）==', '==查询程序里的测试顺序=='],
        ['能不能改', '==基本不能==，接线定死了', '改程序就能改，==灵活=='],
        ['速度', '==快==，一拍出结果', '==慢==，中断源越多越慢'],
        ['硬件成本', '高', '低'],
      ] },

    { t: 'diagram', id: 'daisy-chain', title: '链式排队器（菊花链）：优先级就是"离 CPU 多远"',
      note: '上游一旦截住信号，下游就永远收不到批准',
      caption: String.raw`==这和[总线的链式查询](#/co/bus/bus-timing?at=chain)是同一个手法==，只是信号换了名字（BG → INTA）。硬件排队器改不了优先级，所以才需要==屏蔽字==这个软件手段。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 274" role="img" aria-label="链式排队器：中断批准信号沿链传递，上游设备优先">
  <g class="n p"><rect x="20" y="56" width="130" height="48" rx="8"/><text class="bt sm" x="85.0" y="80.0" text-anchor="middle" dominant-baseline="central">CPU</text></g>
  <g class="n k"><rect x="250" y="56" width="110" height="48" rx="8"/><text class="bt sm" x="305.0" y="80.0" text-anchor="middle" dominant-baseline="central">设备 1</text></g>
  <g class="n k"><rect x="390" y="56" width="110" height="48" rx="8"/><text class="bt sm" x="445.0" y="80.0" text-anchor="middle" dominant-baseline="central">设备 2</text></g>
  <g class="n k"><rect x="530" y="56" width="110" height="48" rx="8"/><text class="bt sm" x="585.0" y="80.0" text-anchor="middle" dominant-baseline="central">设备 3</text></g>
  <path class="ar" d="M150,70 H246"/>
  <path class="ar" d="M360,70 H386"/>
  <path class="ar" d="M500,70 H526"/>
  <text class="cap" x="250" y="40">INTA 中断批准信号，沿链条一个一个往下传</text>
  <path class="ar plain" d="M85,104 V142 H660 V104"/>
  <text class="lb" x="375" y="158" text-anchor="middle">INTR 中断请求（公共线）</text>
  <g class="n g"><rect x="20" y="176" width="320" height="62" rx="8"/><text class="bt sm" x="180.0" y="197.0" text-anchor="middle" dominant-baseline="central">设备 1 有请求</text><text class="bs" x="180.0" y="217.0" text-anchor="middle" dominant-baseline="central">截住 INTA 自己用，设备 2、3 收不到</text></g>
  <g class="n k"><rect x="356" y="176" width="320" height="62" rx="8"/><text class="bt sm" x="516.0" y="197.0" text-anchor="middle" dominant-baseline="central">设备 1 无请求</text><text class="bs" x="516.0" y="217.0" text-anchor="middle" dominant-baseline="central">把 INTA 原样传给设备 2</text></g>
  <text class="cap" x="0" y="262">优先级 = 物理位置，1 &gt; 2 &gt; 3；要改优先级只能重新接线</text>
</svg>
` },

    { t: 'key', id: 'two-priorities', title: '★★ 响应优先级 vs 处理优先级（整节最重要的一组）', c: String.raw`
      | | **响应优先级** | **处理优先级** |
      |---|---|---|
      | 回答什么问题 | 多个请求同时来，==CPU 先进哪个门== | 已经在处理某个中断，==谁能把它踢出来== |
      | 由什么决定 | ==硬件排队器（接线）== | ==中断屏蔽字（软件）== |
      | 能不能改 | ==不能==（除非改硬件） | ==能，随时改== |
      | 起作用的时刻 | ==响应之前==，判优那一拍 | ==响应之后==，服务程序执行期间 |

      **一句话抓住区别**：
      ==响应优先级管"排队进门的顺序"，处理优先级管"进门之后谁能被赶出来"。==

      **它们可以不一致**，而这正是屏蔽字技术存在的全部意义 ——
      硬件优先级焊死了改不了，就用软件的屏蔽字==在响应之后重新洗一次牌==。
      [下面那道大题](#/co/io/interrupt?at=ex-mask)里，
      $L_2$ 明明响应优先级第二，却因为屏蔽字设置，成了处理优先级最低的一个。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'vector', c: '四、找入口：向量中断' },

    { t: 'key', id: 'vector-three-words', title: '★ 三个长得很像的词，必须分清', c: String.raw`
      | 词 | 是什么 | 类比 |
      |---|---|---|
      | **中断向量** | ==中断服务程序的入口地址==（有的机器还含 PSW） | 房子的门牌号 |
      | **中断向量地址** | ==存放"中断向量"的那个存储单元的地址== | 记着门牌号的==那张纸==放在哪 |
      | **中断向量表** | 把所有中断向量按中断类型号排好的一张表 | 整本==通讯录== |

      硬件产生的是**向量地址**，==要再访存一次==才拿到**中断向量**，
      然后才送进 PC：

      $$\text{中断类型号} \xrightarrow{\ \text{硬件}\ } \text{向量地址}
      \xrightarrow{\ \text{访存}\ } \text{中断向量} \longrightarrow \texttt{PC}$$

      ==说"CPU 把向量地址送入 PC"是错的==，中间那次访存不能省。
      这是选择题里换汤不换药出过好几次的坑。
    ` },

    { t: 'insight', id: 'my-timeline-method', title: '★ 我自己换的一个提问方式（这招很好用）', c: String.raw`
      我感觉我还是没有理解中断的整个发生过程。可以==这样提问==：
      我想确定==几个事件发生的时间==。

      第一个事件是==外设什么时候开始搬运数据==（这里指外设的控制器）。
      第二个事件是==中断的类型，什么时候通过数据线传到了什么地方==？
    ` },

    { t: 'warn', id: 'not-on-data-bus', title: '★ 上面那个提问里藏着一个错误预设', c: String.raw`
      "==中断的类型什么时候**通过数据线**传过去=="——
      这句话把两件事合并了：**中断请求本身根本不走数据线。**

      | | 走哪 | 为什么 |
      |---|---|---|
      | **中断请求** | ==一根独立的专用控制线== $\texttt{INTR}$ | 它只需要表达"有 / 没有"，==一位就够==，不必占用数据总线 |
      | **中断类型号** | ==数据总线== | 它是一个数（如 $\texttt{08H}$），要占好几位，==而且只在 $\texttt{INTA}$ 之后那一小段时间才上线== |

      ==把这两件事拆开，整个流程立刻就清楚了==：
      $\texttt{INTR}$ 是"举手"，$\texttt{INTA}$ 是"点你"，
      类型号是"报出你的编号"，==数据要等到 ISR 里才真正开始搬==。

      **另外那个"外设什么时候开始搬"的答案**：
      ==完全与 CPU 异步==，不受指令周期支配。
      主动型（键盘）由物理动作触发；命令型（磁盘）由 CPU 之前写[控制寄存器](#/co/io/io-mode?at=interface-struct)下的命令触发，
      但一旦开始，==控制器就按自己的毫秒级节奏干活，CPU 不再参与==。
    ` },

    { t: 'diagram', id: 'bus-three-things', title: '★★ 一次中断里，总线上先后跑过四样不同的东西',
      note: '把"请求"、"应答"、"类型号"、"数据"分到不同的线上',
      caption: String.raw`==最容易错的是第 ③ 条==：$\texttt{INTA}$ 之后数据线上跑的是**中断类型号**（一个很小的整数），==不是外设那个数据字节==。真正的数据要等到第 ④ 步，由中断服务程序里一条普通的 $\texttt{IN}$ 指令去读——那时候已经是**软件**在搬了。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 214" role="img" aria-label="中断请求走控制线，类型号走数据线，真正的数据字节由中断服务程序读取">
  <g class="n g"><rect x="20" y="40" width="160" height="120" rx="8"/><text class="bt sm" x="100" y="88" text-anchor="middle" dominant-baseline="central">接口 / 中断源</text><text class="bs" x="100" y="112" text-anchor="middle" dominant-baseline="central">设备侧硬件</text></g>
  <g class="n p"><rect x="520" y="40" width="160" height="120" rx="8"/><text class="bt sm" x="600" y="88" text-anchor="middle" dominant-baseline="central">CPU</text><text class="bs" x="600" y="112" text-anchor="middle" dominant-baseline="central">CU + 寄存器</text></g>
  <text class="lb" x="350" y="52" text-anchor="middle">① 中断请求：专用控制线 INTR</text>
  <path class="ar" d="M184,64 H516"/>
  <text class="lb" x="350" y="84" text-anchor="middle">② 中断应答：控制线 INTA</text>
  <path class="ar" d="M516,96 H184"/>
  <text class="lb em" x="350" y="116" text-anchor="middle">③ 中断类型号：数据总线（不是数据！）</text>
  <path class="ar em" d="M184,128 H516"/>
  <text class="cap" x="350" y="180" text-anchor="middle">—— 以上全是硬件；下面这条已经进了中断服务程序 ——</text>
  <text class="lb em" x="350" y="200" text-anchor="middle">④ 数据字节：还是数据总线，但由 ISR 的一条 IN 指令搬</text>
  <path class="ar em" d="M184,208 H516"/>
</svg>
` },

    { t: 'key', id: 'who-moves-data', title: '★★ 中断机制本身，一个字节的数据都没传', c: String.raw`
      这是整章最值得记住的一句话。把四步摊开看：

      | 步 | 走哪根线 | 线上是什么 | 谁在做 |
      |---|---|---|---|
      | ① 请求 | ==专用控制线== $\texttt{INTR}$ | 一个电平 / 脉冲，==一位信息== | 接口（硬件） |
      | ② 应答 | ==控制线== $\texttt{INTA}$ | 一个电平，==一位信息== | CPU（硬件） |
      | ③ 送类型号 | ==数据总线== | ==中断类型号==（如 $\texttt{08H}$） | 接口（硬件） |
      | ④ 传数据 | ==数据总线== | ==真正的数据字节== | ==中断服务程序（软件）== |

      前三步加起来传的信息量==连一个字节都不到==，
      它们的全部作用是==把 CPU 叫过来==；
      数据是第 ④ 步 CPU==自己动手==搬的。

      **两条推论，都是考点：**

      1. ==所以"程序中断方式下 CPU 不参与数据传送"是错的==——
         CPU 不但参与，==每个字节都是它亲手搬的==，
         中断省掉的只是"等"，没省掉"搬"；
      2. ==所以 DMA 才有存在的必要==——
         [DMA 动的是第 ④ 步](#/co/io/dma?at=why)：让数据不再经过 CPU，
         而 ①②③ 这套"叫人"的机制，==DMA 一样要用==（整块传完时还得中断一次）。
    ` },

    { t: 'diagram', id: 'vector-table', title: '中断向量表长什么样（设每项 4 字节，表基址 0）',
      note: '三列一定要分清：类型号 → 向量地址 → 中断向量',
      caption: String.raw`==「向量地址」和「中断向量」是两回事==，这是本节最高频的偷换概念：向量地址是**表项的地址**，中断向量是**表项里装的入口地址**。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 278" role="img" aria-label="中断向量表：类型号乘以表项长度得到向量地址，单元内容才是入口地址">
  <text class="cap" x="40" y="16">中断类型号 n</text>
  <text class="cap" x="260" y="16">向量地址 = 4n</text>
  <text class="cap" x="480" y="16">该单元的内容 = 中断向量</text>
  <g class="n k"><rect x="40" y="26" width="120" height="30" rx="4"/><text class="bt xs" x="100.0" y="41.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n g"><rect x="260" y="26" width="120" height="30" rx="4"/><text class="bt xs" x="320.0" y="41.0" text-anchor="middle" dominant-baseline="central">0000H</text></g>
  <g class="n a"><rect x="480" y="26" width="130" height="30" rx="4"/><text class="bt xs" x="545.0" y="41.0" text-anchor="middle" dominant-baseline="central">0000 8100H</text></g>
  <path class="ar" d="M160,41 H256"/>
  <path class="ar" d="M380,41 H476"/>
  <text class="lb" x="618" y="46">除法出错</text>
  <g class="n k"><rect x="40" y="62" width="120" height="30" rx="4"/><text class="bt xs" x="100.0" y="77.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="260" y="62" width="120" height="30" rx="4"/><text class="bt xs" x="320.0" y="77.0" text-anchor="middle" dominant-baseline="central">0004H</text></g>
  <g class="n a"><rect x="480" y="62" width="130" height="30" rx="4"/><text class="bt xs" x="545.0" y="77.0" text-anchor="middle" dominant-baseline="central">0000 8200H</text></g>
  <path class="ar" d="M160,77 H256"/>
  <path class="ar" d="M380,77 H476"/>
  <text class="lb" x="618" y="82">单步调试</text>
  <g class="n k"><rect x="40" y="98" width="120" height="30" rx="4"/><text class="bt xs" x="100.0" y="113.0" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n g"><rect x="260" y="98" width="120" height="30" rx="4"/><text class="bt xs" x="320.0" y="113.0" text-anchor="middle" dominant-baseline="central">0008H</text></g>
  <g class="n a"><rect x="480" y="98" width="130" height="30" rx="4"/><text class="bt xs" x="545.0" y="113.0" text-anchor="middle" dominant-baseline="central">0000 8300H</text></g>
  <path class="ar" d="M160,113 H256"/>
  <path class="ar" d="M380,113 H476"/>
  <text class="lb" x="618" y="118">NMI</text>
  <g class="n k"><rect x="40" y="134" width="120" height="30" rx="4"/><text class="bt xs" x="100.0" y="149.0" text-anchor="middle" dominant-baseline="central">…</text></g>
  <g class="n g"><rect x="260" y="134" width="120" height="30" rx="4"/><text class="bt xs" x="320.0" y="149.0" text-anchor="middle" dominant-baseline="central">…</text></g>
  <g class="n a"><rect x="480" y="134" width="130" height="30" rx="4"/><text class="bt xs" x="545.0" y="149.0" text-anchor="middle" dominant-baseline="central">…</text></g>
  <path class="ar" d="M160,149 H256"/>
  <path class="ar" d="M380,149 H476"/>
  <g class="n k"><rect x="40" y="170" width="120" height="30" rx="4"/><text class="bt xs" x="100.0" y="185.0" text-anchor="middle" dominant-baseline="central">9</text></g>
  <g class="n g"><rect x="260" y="170" width="120" height="30" rx="4"/><text class="bt xs" x="320.0" y="185.0" text-anchor="middle" dominant-baseline="central">0024H</text></g>
  <g class="n a"><rect x="480" y="170" width="130" height="30" rx="4"/><text class="bt xs" x="545.0" y="185.0" text-anchor="middle" dominant-baseline="central">0000 9700H</text></g>
  <path class="ar" d="M160,185 H256"/>
  <path class="ar" d="M380,185 H476"/>
  <text class="lb" x="618" y="190">键盘中断</text>
  <g class="n g"><rect x="20" y="216" width="656" height="50" rx="8"/><text class="bt sm" x="348.0" y="231.0" text-anchor="middle" dominant-baseline="central">典型考法：类型号 9、表项 4 字节、表基址 0，问向量地址</text><text class="bs" x="348.0" y="251.0" text-anchor="middle" dominant-baseline="central">答 4×9 = 36 = 0024H —— 问的是「地址」，不是那个单元里装的「入口」</text></g>
</svg>
` },

    { t: 'compare', id: 'vector-vs-poll', title: '向量中断 vs 软件查询：找入口的两条路',
      cols: ['', '向量中断（硬件）', '软件查询'],
      rows: [
        ['入口地址怎么来', '硬件给出向量地址，==查表得到==', '统一进一段程序，==逐个测试标志再分支=='],
        ['速度', '==快，与中断源数量无关==', '慢，最坏要测完所有中断源'],
        ['优先级', '由排队器硬件决定', '==由查询顺序决定，改程序即可改优先级=='],
        ['硬件', '需要向量地址形成部件 + 向量表', '几乎不需要额外硬件'],
        ['现在用哪个', '==主流==', '早期机器 / 简单系统'],
      ] },

    /* ================================================================== */
    { t: 'h', id: 'service', c: '五、中断服务程序的结构（顺序错一步就丢分）' },

    { t: 'diagram', id: 'single-vs-multi', title: '★ 单重中断与多重中断，差别只在几条指令',
      note: '琥珀 = 多重中断特有的三步',
      caption: String.raw`==记这张图只要记两句话==：开中断放在保护现场**之后**（否则现场可能被新中断冲掉），关中断放在恢复现场**之前**（否则恢复到一半被打断）。屏蔽字的保存与恢复跟着现场走。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 400" role="img" aria-label="单重中断与多重中断的步骤对照，差别只在三条">
  <g class="n k"><rect x="20" y="16" width="656" height="62" rx="8"/><text class="bt sm" x="348.0" y="37.0" text-anchor="middle" dominant-baseline="central">中断隐指令（硬件做，两种情况完全一样）</text><text class="bs" x="348.0" y="57.0" text-anchor="middle" dominant-baseline="central">① 关中断　② 保存断点 PC / PSW　③ 引出中断服务程序（向量地址 → PC）</text></g>
  <path class="ar" d="M180,78 V100"/>
  <path class="ar" d="M520,78 V100"/>
  <text class="cap" x="20" y="118">单重中断</text>
  <text class="cap" x="360" y="118">多重中断（可嵌套）</text>
  <g class="n p"><rect x="20" y="128" width="300" height="30" rx="4"/><text class="bt xs" x="170.0" y="143.0" text-anchor="middle" dominant-baseline="central">④ 保护现场</text></g>
  <g class="n p"><rect x="20" y="164" width="300" height="30" rx="4"/><text class="bt xs" x="170.0" y="179.0" text-anchor="middle" dominant-baseline="central">⑤ 设备服务</text></g>
  <g class="n p"><rect x="20" y="200" width="300" height="30" rx="4"/><text class="bt xs" x="170.0" y="215.0" text-anchor="middle" dominant-baseline="central">⑥ 恢复现场</text></g>
  <g class="n p"><rect x="20" y="236" width="300" height="30" rx="4"/><text class="bt xs" x="170.0" y="251.0" text-anchor="middle" dominant-baseline="central">⑦ 中断返回 IRET</text></g>
  <g class="n p"><rect x="360" y="128" width="316" height="30" rx="4"/><text class="bt xs" x="518.0" y="143.0" text-anchor="middle" dominant-baseline="central">④ 保护现场 + 保存旧屏蔽字</text></g>
  <g class="n a"><rect x="360" y="164" width="316" height="30" rx="4"/><text class="bt xs" x="518.0" y="179.0" text-anchor="middle" dominant-baseline="central">⑤ 置新屏蔽字</text></g>
  <g class="n a"><rect x="360" y="200" width="316" height="30" rx="4"/><text class="bt xs" x="518.0" y="215.0" text-anchor="middle" dominant-baseline="central">⑥ 开中断</text></g>
  <g class="n p"><rect x="360" y="236" width="316" height="30" rx="4"/><text class="bt xs" x="518.0" y="251.0" text-anchor="middle" dominant-baseline="central">⑦ 设备服务</text></g>
  <g class="n a"><rect x="360" y="272" width="316" height="30" rx="4"/><text class="bt xs" x="518.0" y="287.0" text-anchor="middle" dominant-baseline="central">⑧ 关中断</text></g>
  <g class="n p"><rect x="360" y="308" width="316" height="30" rx="4"/><text class="bt xs" x="518.0" y="323.0" text-anchor="middle" dominant-baseline="central">⑨ 恢复现场 + 恢复旧屏蔽字</text></g>
  <g class="n p"><rect x="360" y="344" width="316" height="30" rx="4"/><text class="bt xs" x="518.0" y="359.0" text-anchor="middle" dominant-baseline="central">⑩ 中断返回 IRET</text></g>
  <text class="lb" x="20" y="300">琥珀色那三条就是全部差别</text>
  <text class="cap" x="0" y="388">开中断必须在【保护现场之后】，关中断必须在【恢复现场之前】</text>
</svg>
` },

    { t: 'warn', id: 'open-after-save', title: '★★ 开中断为什么一定要放在保护现场之后', c: String.raw`
      这是最常见的一处顺序错误，很多资料里的"口诀"都把它写反了。

      假设顺序是 ==开中断 → 保护现场==：

      1. 刚开中断，一个更高优先级的中断 $B$ 立刻进来；
      2. $B$ 的服务程序也要用通用寄存器，它把 $\texttt{R0}$ 改了；
      3. $B$ 结束返回，$A$ 才开始保护现场 —— ==存下来的 $\texttt{R0}$ 已经是被 $B$ 污染过的值==；
      4. $A$ 结束后恢复现场，把这个错值还给原程序。==原程序静悄悄地算错了。==

      同理，==关中断必须在恢复现场之前==：
      现场恢复到一半被打断，新中断又会覆盖寄存器。

      **一句话记住**：==现场没存好之前不许开门，现场没还完之前不许开门。==
      开中断和关中断这一对，==夹在"保护现场"和"恢复现场"的内侧==。
    ` },

    { t: 'example',
      id: 'ex-2012-order',
      title: '单级中断系统中，中断服务程序的执行顺序',
      source: '2012 真题',
      level: 3,
      problem: String.raw`
        单级中断系统中，中断服务程序执行顺序是（　）。

        Ⅰ. 保护现场　　Ⅱ. 开中断　　Ⅲ. 关中断　　Ⅳ. 保存断点
        Ⅴ. 中断事件处理　　Ⅵ. 恢复现场　　Ⅶ. 中断返回

        **A.** Ⅰ→Ⅴ→Ⅵ→Ⅶ　　**B.** Ⅲ→Ⅰ→Ⅴ→Ⅵ→Ⅱ→Ⅶ

        **C.** Ⅲ→Ⅳ→Ⅴ→Ⅵ→Ⅱ→Ⅶ　　**D.** Ⅳ→Ⅰ→Ⅴ→Ⅵ→Ⅶ
      `,
      idea: String.raw`
        题面里藏了两个限定词，==每一个都能删掉一半选项==：

        1. **"中断服务程序"** —— 问的是==程序==里有什么，
           那么凡是[中断隐指令](#/co/cpu/exception?at=hidden-def)干的活
           （关中断 Ⅲ、保存断点 Ⅳ）==都不属于它==，因为那是硬件在进程序之前做完的。
        2. **"单级中断"** —— 不允许嵌套，
           那就==根本不需要开中断 Ⅱ==（开了反而违背单级的定义）。

        划掉 Ⅱ、Ⅲ、Ⅳ 之后，剩下的顺序几乎是唯一的。
      `,
      solution: String.raw`
        **① 排除 Ⅲ（关中断）和 Ⅳ（保存断点）**

        这两件事由==中断隐指令在响应阶段由硬件完成==，
        发生在中断服务程序的第一条指令==之前==，不属于服务程序的内容。

        $\Rightarrow$ 含 Ⅲ 的 B、C 出局，含 Ⅳ 的 C、D 出局。

        **② 排除 Ⅱ（开中断）**

        ==单级中断 = 单重中断 = 不允许嵌套==。
        开中断是为了让更高优先级的中断进来，单级系统里不需要，也不能开。

        $\Rightarrow$ 含 Ⅱ 的 B、C 出局。

        **③ 剩下的四步排序**

        $$\text{保护现场} \to \text{中断事件处理} \to \text{恢复现场} \to \text{中断返回}$$

        $$\boxed{\text{Ⅰ}\to\text{Ⅴ}\to\text{Ⅵ}\to\text{Ⅶ}\quad\text{选 A}}$$
      `,
      comment: String.raw`
        **四个选项分别是什么错误的产物**：

        | 选项 | 错在哪 |
        |---|---|
        | **A** ✅ | 正确 |
        | B. Ⅲ→Ⅰ→Ⅴ→Ⅵ→Ⅱ→Ⅶ | ==把隐指令的"关中断"塞进了服务程序==，还多了一次开中断 |
        | C. Ⅲ→Ⅳ→Ⅴ→Ⅵ→Ⅱ→Ⅶ | ==把隐指令的两件事都算成服务程序的==，而且漏了保护现场 |
        | D. Ⅳ→Ⅰ→Ⅴ→Ⅵ→Ⅶ | 顺序对，但=="保存断点"是硬件做的，不该出现在这里== |

        ==B、C 是"分不清隐指令与服务程序"的产物，
        D 是"分不清断点与现场"的产物。==

        **换成多重中断这题怎么答**：
        $$\text{Ⅰ 保护现场} \to \text{Ⅱ 开中断} \to \text{Ⅴ 处理} \to \text{Ⅲ 关中断} \to \text{Ⅵ 恢复现场} \to \text{Ⅶ 返回}$$
        注意 ==开中断在 Ⅰ 之后、关中断在 Ⅵ 之前==，
        理由见[上面](#/co/io/interrupt?at=open-after-save)。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'mask', c: '六、多重中断与中断屏蔽字' },

    { t: 'key', id: 'multi-cond', title: '实现多重中断的三个必要条件', c: String.raw`
      1. ==中断服务程序中要提前设置开中断指令==（放在保护现场之后）；
      2. ==优先级高的中断源有权中断优先级低的中断源==
         —— 靠屏蔽字保证：低级中断的屏蔽字里，高级那几位必须是 0；
      3. ==正在处理低级中断时，出现高级中断请求，CPU 要能立即响应==
         —— 也就是不能等低级的跑完。

      **反过来说**：题目说"该系统不支持中断嵌套"，
      你就该知道==服务程序里没有开中断指令==，
      于是整个服务期间任何请求都只能干等着。
    ` },

    { t: 'key', id: 'mask-rule', title: '★ 屏蔽字的写法：一条规则搞定所有题', c: String.raw`
      屏蔽字是一个位串，==第 $i$ 位对应第 $i$ 个中断源==，
      **1 = 屏蔽（不许它打断我），0 = 开放（允许它打断我）**。

      **给定处理优先级顺序，反推屏蔽字：**

      > 把中断源按==处理优先级从高到低==排成一行，
      > 某一级的屏蔽字 = ==它自己，以及排在它后面（比它低）的所有级，全部置 1==，
      > 排在它前面（比它高）的全部置 0。

      两条推论可以当自查用：

      - ==最高级的屏蔽字全是 1==（谁也不能打断它）；
      - ==每一级都要屏蔽自己==（第 $i$ 级的屏蔽字第 $i$ 位必为 1），
        否则同一个中断源会==反复打断自己，无限嵌套直到栈溢出==；
      - 屏蔽字里 ==1 的个数 = 该级在处理优先级序列中从后往前数的位次==，
        所以 $n$ 级系统的 $n$ 个屏蔽字，1 的个数分别是 $n, n-1, \ldots, 1$，
        ==个数不对就是写错了==。
    ` },

    { t: 'example',
      id: 'ex-mask',
      title: '屏蔽字设置 + 中断处理时间图（大题标准模板）',
      source: '408 经典题型',
      level: 4,
      problem: String.raw`
        某机有 4 个中断源 $L_1,L_2,L_3,L_4$，硬件排队器决定的**响应优先级**为
        $$L_1 > L_2 > L_3 > L_4$$
        现要求实际的**处理优先级**为
        $$L_1 > L_4 > L_3 > L_2$$

        **(1)** 写出每个中断源的屏蔽字（4 位，从左到右依次对应 $L_1\sim L_4$，1 表示屏蔽）。

        **(2)** 设每个中断服务程序的执行时间均为 $20\ \mu s$，忽略中断响应与保护现场的时间。
        在 $t=0,5,10,15\ \mu s$ 时刻分别有 $L_4,L_2,L_3,L_1$ 提出请求，
        画出 CPU 的执行轨迹，并求全部处理完毕的时刻。
      `,
      idea: String.raw`
        **(1) 别去想"谁该屏蔽谁"，直接套那条规则。**
        把处理优先级顺序 $L_1,L_4,L_3,L_2$ 写成一行，
        然后==从这一行的每个位置往右扫，扫到的（含自己）全置 1==。

        **(2) 这题的信息量全在两个瞬间：**

        - $t=15$：$L_1$ 来了，$L_4$ 会不会被打断？==看 $L_4$ 的屏蔽字第 1 位==。
        - $t=40$：$L_4$ 结束，$L_2$ 和 $L_3$ 都攒着 —— 先响应谁？
          ==这一问考的是"响应优先级"，不是处理优先级==，
          因为此刻没有任何服务程序在跑，是从零开始判优。

        ==而 $t=40$ 之后紧接着还有一个反转==，这是整题的胜负手，先别急着写答案。
      `,
      solution: String.raw`
        **(1) 屏蔽字**

        处理优先级从高到低排成一行：$\quad L_1\ \ L_4\ \ L_3\ \ L_2$

        对每一级，把"它自己 + 它右边的"全部置 1（位序仍按 $L_1L_2L_3L_4$ 排列）：

        | 中断源 | 该屏蔽哪些（自己 + 处理优先级更低的） | 屏蔽字 $L_1L_2L_3L_4$ | 1 的个数 |
        |---|---|---|---|
        | $L_1$ | $L_1,L_4,L_3,L_2$（全部） | $\mathbf{1111}$ | 4 |
        | $L_2$ | 只有 $L_2$ 自己 | $\mathbf{0100}$ | 1 |
        | $L_3$ | $L_3,L_2$ | $\mathbf{0110}$ | 2 |
        | $L_4$ | $L_4,L_3,L_2$ | $\mathbf{0111}$ | 3 |

        **验算**：1 的个数是 $4,3,2,1$（按处理优先级 $L_1,L_4,L_3,L_2$ 排）✓；
        每一级都屏蔽了自己（对角线上全是 1）✓。

        **(2) 逐个时刻推演**

        | 时刻 | 事件 | 判据 | CPU 转去执行 |
        |---|---|---|---|
        | $0$ | $L_4$ 请求，无人竞争 | —— | $L_4$（需 20，可跑到 20） |
        | $5$ | $L_2$ 请求 | $L_4$ 屏蔽字 $0\mathbf{1}11$，==第 2 位为 1，屏蔽== | 仍是 $L_4$，$L_2$ 挂起 |
        | $10$ | $L_3$ 请求 | $L_4$ 屏蔽字 $01\mathbf{1}1$，==第 3 位为 1，屏蔽== | 仍是 $L_4$，$L_3$ 挂起 |
        | $15$ | $L_1$ 请求 | $L_4$ 屏蔽字 $\mathbf{0}111$，==第 1 位为 0，不屏蔽== | ==转 $L_1$==（$L_4$ 已跑 15，还剩 5） |
        | $35$ | $L_1$ 跑完 20，$\texttt{IRET}$ | 回到断点 | 回 $L_4$，跑完剩下的 5 |
        | $40$ | $L_4$ 结束，恢复旧屏蔽字。$L_2,L_3$ 都在排队 | ==此刻按响应优先级判优：$L_2>L_3$== | 先响应 $L_2$ |
        | $40^{+}$ | $L_2$ 保护完现场、置屏蔽字 $0100$、开中断 | $L_2$ 的屏蔽字第 3 位为 ==0==，==不屏蔽 $L_3$==，而 $L_3$ 的请求还挂着 | ==$L_3$ 立刻把 $L_2$ 顶掉== |
        | $60$ | $L_3$ 跑完 20 | 回到 $L_2$ | $L_2$ 从头跑它的 20 |
        | $80$ | $L_2$ 结束 | 全部完成 | —— |

        **执行轨迹**

        ~~~
        请求  L4●         L2●    L3●    L1●
        时刻   0           5     10     15         35    40         60         80
               │           │      │      │          │     │          │          │
        CPU  ├──── L4 ────┤├───────── L1 ─────────┤├L4┤├──── L3 ────┤├──── L2 ────┤
               0          15                      35 40             60           80
                                                     ↑
                                            L2 刚被响应就被 L3 顶掉
        ~~~

        **各中断源的累计执行时间**：$L_4$ 用了 $15+5=20$，$L_1$ 用了 $20$，
        $L_3$ 用了 $20$，$L_2$ 用了 $20$，合计 $80\ \mu s$，CPU 全程无空闲 ✓。

        $$\boxed{\text{全部处理完毕的时刻为 } t = 80\ \mu s}$$
      `,
      comment: String.raw`
        **这道题真正的考点是 $t=40$ 前后那两拍**，它把两种优先级的分工演示得很干净：

        - $t=40$ 判优时==没有任何服务程序在跑==，用的是==硬件排队器==
          $\Rightarrow$ 按**响应优先级** $L_2>L_3$，==先进门的是 $L_2$==；
        - $L_2$ 一进门就置上自己的屏蔽字 $0100$，==它不屏蔽 $L_3$==
          $\Rightarrow$ 按**处理优先级**，==$L_3$ 立刻把它踢出去==。

        于是出现一个很反直觉但完全正确的现象：
        ==$L_2$ 是第一个被响应的，却是最后一个被处理完的。==
        题目问"最先响应哪个"和"最先执行完哪个"，==答案可以不一样==。

        **写这类题的固定动作（照做就不会漏）**：

        1. 先把屏蔽字表画出来，按"1 的个数 $n,n-1,\ldots,1$"验一遍；
        2. 时间轴上==每出现一个新请求，就查一次当前服务程序的屏蔽字对应位==；
        3. ==每当一段服务程序结束，回头扫一遍有没有挂起的请求==
           （[请求不会丢](#/co/io/interrupt?at=not-lost)），
           有多个就用**响应优先级**判优；
        4. 新的服务程序一开中断，==再查一次它的屏蔽字==，
           挂起的请求里没被屏蔽的会==立刻==打断它。

        **第 3、4 步是同一个时刻的两件事，很多人只做了第 3 步就往下画，
        于是漏掉 $L_3$ 抢占 $L_2$ 这一下。**
      `,
    },

    { t: 'warn', id: 'mask-restore', title: '别忘了旧屏蔽字也要存', c: String.raw`
      多重中断的服务程序里，==保护现场时要连旧屏蔽字一起存，恢复现场时一起恢复==。

      原因：$A$ 被 $B$ 打断，$B$ 会把屏蔽字改成自己的那一套。
      $B$ 返回时如果不把 $A$ 的屏蔽字还回去，
      ==$A$ 剩下的那半段就在用 $B$ 的屏蔽规则运行==，嵌套关系立刻乱套。

      这也是为什么[结构图](#/co/io/interrupt?at=single-vs-multi)里
      多重中断那一列写的是"保护现场 **+ 保存旧屏蔽字**"。
      ==单重中断没有这个问题==，因为它压根不会被打断。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'time', c: '七、中断响应时间与 CPU 开销（计算题）' },

    { t: 'key', id: 'time-def', title: '两个"时间"是不同的东西', c: String.raw`
      | | 定义 | 由什么决定 |
      |---|---|---|
      | **中断响应时间** | 从==发出中断请求==到==开始执行中断服务程序第一条指令==的时间 | 当前指令的剩余执行时间 + 判优时间 + 中断隐指令时间 |
      | **中断处理时间** | ==中断服务程序本身==的执行时间 | 服务程序的长度 |

      ==响应时间里包含"等当前指令执行完"这一段==，
      所以==指令越长（比如串操作、浮点除法），最坏响应时间越长==。
      这就是为什么有些机器允许长指令在执行中途被中断（可中断指令），
      代价是要保存额外的中间状态。

      **实时系统关心的是响应时间的==上界==**，
      而关中断的临界区会直接把这个上界拉长 —— 所以内核里的关中断段要尽量短。
    ` },

    { t: 'example',
      id: 'cost-calc',
      title: '中断方式的 CPU 开销：算到什么程度就非上 DMA 不可',
      source: '408 常见计算',
      level: 3,
      problem: String.raw`
        某计算机主频为 $500\ \text{MHz}$，采用**程序中断方式**与外设交换数据。
        某外设每传送 1 个字节请求一次中断，CPU 响应并处理一次中断共需 $500$ 个时钟周期。

        **(1)** 若该外设的数据传输率为 $50\ \text{KB/s}$，
        求 CPU 用于该外设 I/O 的时间占整个 CPU 时间的百分比。

        **(2)** 若要求 CPU 用于该外设的时间不超过 $10\%$，该外设的最高数据传输率是多少？

        **(3)** 若外设传输率提高到 $5\ \text{MB/s}$，还能用中断方式吗？

        （$1\ \text{KB}=10^3\ \text{B}$，$1\ \text{MB}=10^6\ \text{B}$）
      `,
      idea: String.raw`
        三问其实是==同一个等式的三种解法==，先把等式立起来：

        $$\text{每秒消耗的时钟周期} = \text{每秒中断次数} \times \text{每次中断的周期数}$$

        而==每秒中断次数 = 数据传输率（字节/秒）==，因为"每传 1 字节中断一次"。
        分母永远是 $\text{主频} = 5\times10^8$ 周期/秒。

        (1) 正着算，(2) 把占比当已知反着解传输率，(3) 算出来大于 100% 就说明做不到。

        ==第 (3) 问不是在考计算，是在考"你知不知道 DMA 为什么存在"==。
      `,
      solution: String.raw`
        **(1)**

        每秒中断次数：$50\ \text{KB/s} = 5\times10^{4}$ 次/秒

        每秒消耗的时钟周期：
        $$5\times10^{4} \times 500 = 2.5\times10^{7}\ \text{周期/秒}$$

        CPU 每秒可提供 $500\ \text{MHz} = 5\times10^{8}$ 个周期，故

        $$\frac{2.5\times10^{7}}{5\times10^{8}} = 0.05 = \boxed{5\%}$$

        **(2)**

        允许用于 I/O 的周期数：$5\times10^{8}\times10\% = 5\times10^{7}$ 周期/秒

        每字节要花 500 个周期，故每秒最多传送

        $$\frac{5\times10^{7}}{500} = 10^{5}\ \text{字节/秒} = \boxed{100\ \text{KB/s}}$$

        **(3)**

        $5\ \text{MB/s}$ 意味着每秒中断 $5\times10^{6}$ 次：

        $$5\times10^{6}\times500 = 2.5\times10^{9}\ \text{周期/秒}$$

        而 CPU 每秒只有 $5\times10^{8}$ 个周期：

        $$\frac{2.5\times10^{9}}{5\times10^{8}} = 5 = 500\% \gg 100\%$$

        ==CPU 把全部时间都拿去处理中断也不够用，还差 4 倍==。
        结论：**不能用程序中断方式，必须改用 DMA。**

        改用 DMA 后，==每传送一个数据块（而不是每个字节）才中断一次==，
        中断次数下降几个数量级，CPU 开销可以忽略。
      `,
      comment: String.raw`
        **这类题的三个固定陷阱**：

        1. ==单位==。$\text{KB}$ 在存储容量里是 $2^{10}$，在**传输率**里通常按 $10^3$ 算，
           题目一般会注明，==没注明就按 $10^3$ 并写清假设==。
        2. =="每次中断多少周期"给的是什么==。有时题目给的是
           "中断服务程序有 $18$ 条指令，CPI $=4$"，
           这时每次中断的周期数 $=18\times4=72$，==还要加上响应（隐指令）的周期==（题目会给）。
        3. ==把"次数"和"字节数"搞混==。只有"每传 1 字节中断一次"时两者才相等；
           若题目说"每传送 4 个字节中断一次"，==中断次数要除以 4==。

        **这道题真正想让你记住的结论**：

        > ==中断方式的开销与传输的数据量成正比==（每个字节都要付一次中断的钱），
        > ==DMA 的开销与数据块的个数成正比==（一整块只付一次）。
        > 所以**低速、随机、少量**的数据用中断；**高速、成块**的数据用 DMA。

        键盘（每秒几十字节）用中断绰绰有余，
        磁盘（每秒几十 MB）用中断连门都进不去。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'vs-dma', c: '八、中断 vs DMA' },

    { t: 'compare', id: 'dma-table', title: '★ 程序查询 / 程序中断 / DMA 三方对比',
      cols: ['', '程序查询', '程序中断', 'DMA'],
      rows: [
        ['**数据谁搬**', 'CPU 执行指令搬', 'CPU 执行指令搬', '==DMA 控制器直接搬，不经过 CPU=='],
        ['**数据经过 CPU 寄存器吗**', '经过', '经过', '==不经过，内存↔设备直连=='],
        ['**CPU 与外设并行吗**', '==不并行==（CPU 死等）', '并行', '并行'],
        ['**打断 CPU 的时机**', '不打断（本来就是 CPU 在问）', '==一条指令执行结束后==', '==一个总线周期结束后=='],
        ['**打断的粒度**', '——', '==每传 1 个字（字节）一次==', '==每传 1 个数据块一次=='],
        ['**打断时抢走什么**', '——', '==CPU 的执行权==（要跑一段程序）', '==总线使用权==（CPU 照常执行不访存的部分）'],
        ['**响应后要不要保存现场**', '——', '==要==（有软件开销）', '==不要==（纯硬件）'],
        ['**优先级（对总线）**', '——', '低', '==高==（有时间窗口限制，晚了就丢数据）'],
        ['**适用场合**', '低速设备、CPU 空闲', '==中低速、随机事件==', '==高速、成批数据=='],
      ] },

    { t: 'key', id: 'dma-still-needs-int', title: 'DMA 并没有消灭中断，只是把它变稀了', c: String.raw`
      一次 DMA 传送的完整过程里，==中断仍然出现了一次==：

      $$\text{CPU 初始化 DMA 控制器}\ \to\ \text{DMA 自行搬完整块}\ \to\
      \boxed{\text{DMA 发中断}}\ \to\ \text{CPU 做后处理}$$

      所以说"DMA 方式不需要中断"是==错的==。
      正确说法是：==DMA 把"每个字节一次中断"降成了"每个数据块一次中断"==，
      中断次数下降了几个数量级，CPU 开销才变得可以忽略。

      **周期挪用（周期窃取）**：DMA 抢总线的三种情形 ——
      ① CPU 此刻不访存 $\Rightarrow$ ==毫无冲突，白赚==；
      ② CPU 正在访存 $\Rightarrow$ ==等这个存取周期结束再让出==；
      ③ 同时请求 $\Rightarrow$ ==DMA 优先==，CPU 暂缓一个存取周期。

      完整的 DMA 机制（控制器组成、三个阶段、三种访存方式、Cache 一致性）
      见 [DMA 传送过程与周期挪用](#/co/io/dma?at=three-phases)；
      三种方式在同一条轴上的位置见
      [五种 I/O 方式的全景](#/co/io/io-mode?at=the-axis)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '九、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: 'I/O 视角这半边的固定失分点', c: String.raw`
      1. **响应优先级 = 处理优先级** —— ==响应优先级管进门顺序（硬件），
         处理优先级管进门后谁能被踢出（屏蔽字）==，见[对比](#/co/io/interrupt?at=two-priorities)。
      2. **屏蔽字里忘了屏蔽自己** —— ==对角线上必须全是 1==，否则同一中断源无限嵌套。
      3. **以为被屏蔽的请求丢了** —— ==请求触发器里的 1 一直保持着==，
         屏蔽解除后立刻涌上来，见[这里](#/co/io/interrupt?at=not-lost)。
      4. **把开中断写在保护现场之前** —— ==现场会被新中断污染==，
         见[为什么](#/co/io/interrupt?at=open-after-save)。
      5. **把"关中断 / 保存断点"算进中断服务程序** —— ==那是中断隐指令==，
         见[2012 真题](#/co/io/interrupt?at=ex-2012-order)。
      6. **单重中断的服务程序里写了开中断** —— ==单级中断不开中断==。
      7. **向量地址当成入口地址** —— ==中间还要访存一次查表==，
         见[三个词](#/co/io/interrupt?at=vector-three-words)。
      8. **多重中断忘了保存 / 恢复旧屏蔽字** —— 见[这里](#/co/io/interrupt?at=mask-restore)。
      9. **认为 DMA 方式不需要中断** —— ==传送结束时仍要中断一次==。
      10. **开销计算里把中断次数等同于字节数** —— ==只有"每字节一次中断"时才相等==。
      11. **一段服务程序结束后忘了回头扫挂起的请求** ——
          画时间图漏步最常见的原因，见[大题的四个固定动作](#/co/io/interrupt?at=ex-mask)。
    ` },

    { t: 'md', c: String.raw`
      ---

      往回看概念那一半：[中断与异常的分类、中断隐指令、精确异常](#/co/cpu/exception?at=taxonomy)。
    ` },

  ],
});
