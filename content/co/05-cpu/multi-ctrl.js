/* ==========================================================================
   计算机组成原理 / 5 中央处理器 / 多控制器的协同
   —— 一台机器里不止 CU 一个状态机。这一页讲它们怎么互相咬合：
      握手信号、管辖边界，以及"同一时刻谁在动"这条判据。
      每个控制器自己的细节在各自的专题页里，这里只管边界与协同。
   ========================================================================== */

KM.page({
  path: 'co/cpu/multi-ctrl',
  title: '多控制器的协同：握手、管辖与并行',
  subtitle: '一条指令要惊动仲裁器、Cache 控制器、DMA 控制器时，看着像一团乱麻。理清的办法只有一个：**盯住这一刻谁在主动跑、谁在原地等**',
  tags: ['概念辨析', '综合应用'],
  updated: '2026-08-16',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'peers', c: '一、它们不是 CU 的子状态，是对等的状态机' },

    { t: 'md', c: String.raw`
      [上一页](#/co/cpu/fsm?at=not-the-only-one)已经说过，CU 只是粒度最细的那台状态机，不是唯一的一台。
      接下来最容易想错的一步是：==把总线仲裁器、Cache 控制器、DMA 控制器
      当成"CU 这台状态机内部的某几个状态"==。

      不是。它们==各自独立运行、各有自己的状态转移表==，
      和 CU 之间只通过几根**握手信号**在边界上对话。
    ` },

    { t: 'diagram', id: 'peer-map', title: '★ 三台外围状态机与 CU 的接口',
      note: '每条边上就那么两根线，内部实现互相看不见',
      caption: String.raw`从 CU 的视角看，这些信号==只是它状态转移函数里的外部输入条件==：
        满足了就往下走，不满足就原地自跳转。至于对方内部怎么算出这个信号，==CU 不关心也不需要知道==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 284" role="img" aria-label="总线仲裁器、Cache 控制器、DMA 控制器通过握手信号与 CU 耦合">
  <g class="n g"><rect x="30" y="20" width="196" height="52" rx="8"/>
    <text class="bt" x="128" y="40" text-anchor="middle" dominant-baseline="central">总线仲裁器</text>
    <text class="bs" x="128" y="59" text-anchor="middle" dominant-baseline="central">独立状态机</text></g>

  <g class="n g"><rect x="474" y="20" width="196" height="52" rx="8"/>
    <text class="bt" x="572" y="40" text-anchor="middle" dominant-baseline="central">Cache 控制器</text>
    <text class="bs" x="572" y="59" text-anchor="middle" dominant-baseline="central">独立状态机</text></g>

  <g class="n g"><rect x="252" y="228" width="196" height="52" rx="8"/>
    <text class="bt" x="350" y="248" text-anchor="middle" dominant-baseline="central">DMA 控制器</text>
    <text class="bs" x="350" y="267" text-anchor="middle" dominant-baseline="central">独立状态机</text></g>

  <g class="n p"><rect x="262" y="130" width="176" height="56" rx="8"/>
    <text class="bt" x="350" y="151" text-anchor="middle" dominant-baseline="central">CU</text>
    <text class="bs" x="350" y="170" text-anchor="middle" dominant-baseline="central">指令周期状态机</text></g>

  <path class="ar plain" d="M180,72 L266,126"/>
  <text class="lb" x="178" y="100" text-anchor="end">总线请求 ↓</text>
  <text class="lb" x="178" y="116" text-anchor="end">总线授权 ↑</text>

  <path class="ar plain" d="M520,72 L434,126"/>
  <text class="lb" x="522" y="100">访存请求 ↓</text>
  <text class="lb" x="522" y="116">ready / wait ↑</text>

  <path class="ar plain" d="M350,228 V190"/>
  <text class="lb" x="364" y="204">启动参数 ↓　完成中断 ↑</text>
</svg>` },

    { t: 'key', id: 'handshake-only', title: '★ 耦合方式只有一种：标准化的握手线', c: String.raw`
      | 边界 | 信号对 | CU 那一侧的行为 |
      |---|---|---|
      | CU ↔ 总线仲裁器 | request / grant | 没拿到授权就==停在需要用总线的那个状态自跳转== |
      | CU ↔ Cache 控制器 | ready / wait（或 busy / done） | 命中就下一拍走，缺失就==停几十拍== |
      | CU ↔ DMA 控制器 | 启动参数（普通 I/O 写指令）+ 完成中断 | 写完参数就==撒手不管==，中断来了才回头 |

      ==这三对信号就是全部的接口==。三台状态机从不共享 CU 的状态转移表，
      内部实现可以随便改，不会牵一发动全身——这正是数字系统管理复杂度的核心手段。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'relay', c: '二、跟着一次 LOAD 缺失走一遍' },

    { t: 'insight', id: 'my-confusion', title: '我卡住的地方', c: String.raw`
      ==我很难想象一条指令如果同时涉及这几个操作，整个流程会是怎么样的==，
      因为这里实际涉及的部件太多了：数据通路上的各种寄存器，以及这几个控制器。
    ` },

    { t: 'md', c: String.raw`
      难点不在每一步，而在==主动权在不断易手==。
      拿一个最能说明问题的场景走一遍：**执行 $\texttt{LOAD}$ 指令，恰好 Cache 缺失，必须真的去访问主存。**
    ` },

    { t: 'diagram', id: 'relay-1', title: '前半段：CU 交出主动权',
      note: '三步走完，跑的人已经从 CU 换成了 Cache 控制器',
      caption: String.raw`到这一步接力棒已经交出去了：==CU 的状态机原地停住==（就是"驻留在同一状态"那种情形），
        真正在往前走的只剩 Cache 控制器一台。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 208" role="img" aria-label="LOAD 缺失前半段：CU 发出访存请求后由 Cache 控制器接手">
  <g class="n p"><rect x="140" y="8" width="420" height="52" rx="8"/>
    <text class="bt sm" x="350" y="28" text-anchor="middle" dominant-baseline="central">① CU：执行到访存微操作</text>
    <text class="bs" x="350" y="47" text-anchor="middle" dominant-baseline="central">地址送 MAR，发出读请求</text></g>
  <path class="ar" d="M350,60 V74"/>

  <g class="n g"><rect x="140" y="78" width="420" height="52" rx="8"/>
    <text class="bt sm" x="350" y="98" text-anchor="middle" dominant-baseline="central">② Cache 控制器：比较 tag 判命中</text>
    <text class="bs" x="350" y="117" text-anchor="middle" dominant-baseline="central">这里假设未命中（miss）</text></g>
  <path class="ar" d="M350,130 V144"/>

  <g class="n g"><rect x="140" y="148" width="420" height="52" rx="8"/>
    <text class="bt sm" x="350" y="168" text-anchor="middle" dominant-baseline="central">③ Cache 控制器：向仲裁器申请总线</text>
    <text class="bs" x="350" y="187" text-anchor="middle" dominant-baseline="central">替 CU 去访问主存</text></g>
</svg>` },

    { t: 'diagram', id: 'relay-2', title: '后半段：主动权再传两手，最后还给 CU',
      note: '仲裁器 → Cache 控制器 → CU',
      caption: String.raw`整条链一共 7 次状态转移，跨了**三台**状态机：
        CU → Cache 控制器 → 总线仲裁器 → Cache 控制器 → CU。
        ==每一次传递靠的都只是一根握手信号==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 278" role="img" aria-label="LOAD 缺失后半段：仲裁授权、突发读整行、置 ready、CU 恢复执行">
  <g class="n a"><rect x="140" y="8" width="420" height="52" rx="8"/>
    <text class="bt sm" x="350" y="28" text-anchor="middle" dominant-baseline="central">④ 总线仲裁器：判优并授权</text>
    <text class="bs" x="350" y="47" text-anchor="middle" dominant-baseline="central">总线此刻空闲，直接给 grant</text></g>
  <path class="ar" d="M350,60 V74"/>

  <g class="n g"><rect x="140" y="78" width="420" height="52" rx="8"/>
    <text class="bt sm" x="350" y="98" text-anchor="middle" dominant-baseline="central">⑤ Cache 控制器：突发读回整行</text>
    <text class="bs" x="350" y="117" text-anchor="middle" dominant-baseline="central">连续占用总线多个周期</text></g>
  <path class="ar" d="M350,130 V144"/>

  <g class="n g"><rect x="140" y="148" width="420" height="52" rx="8"/>
    <text class="bt sm" x="350" y="168" text-anchor="middle" dominant-baseline="central">⑥ Cache 控制器：填充完成，置 ready</text>
    <text class="bs" x="350" y="187" text-anchor="middle" dominant-baseline="central">更新 tag 与有效位，释放总线</text></g>
  <path class="ar" d="M350,200 V214"/>

  <g class="n p"><rect x="140" y="218" width="420" height="52" rx="8"/>
    <text class="bt sm" x="350" y="238" text-anchor="middle" dominant-baseline="central">⑦ CU：等到 ready，转移条件满足</text>
    <text class="bs" x="350" y="257" text-anchor="middle" dominant-baseline="central">把数据锁进目标寄存器，继续往下走</text></g>
</svg>` },

    { t: 'key', id: 'baton', title: '★★ 记住这一句：不是并行推进，是接力', c: String.raw`
      真正让人觉得乱的不是步骤多，而是=="谁在主动跑、谁在被动等"这件事一直在切换==：

      1. CU 发出请求后，==它自己从主动变被动==，把主动权交给 Cache 控制器；
      2. Cache 控制器判出缺失后，==又把主动权交给仲裁器==，自己短暂等待；
      3. 授权下来，主动权回到 Cache 控制器，它去跑真正的多周期突发读；
      4. 填充完成，$\texttt{ready}$ 一置，==主动权还给 CU==。

      ==只要盯住"这一刻谁是主动的"，这团线就不会乱。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'scope', c: '三、管辖范围与工作能力，怎么判断' },

    { t: 'insight', id: 'my-question-scope', title: '我想问清楚的两件事', c: String.raw`
      ==怎样去理解一个控制器它的管辖范围以及它的工作能力呢？==
    ` },

    { t: 'key', id: 'scope-is-wiring', title: '★★ 管辖范围严格由接线决定，不由"逻辑上该管什么"决定', c: String.raw`
      判断方法只有两条：

      - **看输出**：它的输出信号接到了哪些部件的**使能端 / 选择线 / 操作码输入**——
        ==这些部件就是它的管辖范围，一个不多一个不少==。
      - **看输入**：输入决定它"能感知"什么（操作码、标志位、别人的 $\texttt{ready}$），
        ==感知不等于管辖==，只是它做决策时的依据。

      拿刚才那条链验一下：==CU 管不到 Cache 的填充过程==。
      CU 没有任何一根线接到 Cache 控制器内部的状态寄存器或计数逻辑上，
      它只能被动地通过一根 $\texttt{ready}$ 知道"完成没有"。
      直觉上会觉得"CU 应该管着 Cache 填充"，==但接线图不支持这个直觉==。
    ` },

    { t: 'key', id: 'capability', title: '工作能力 = 状态数 × 每步能同时发出的信号组合', c: String.raw`
      微程序控制器上这两个量是==可以直接数出来==的：

      | 指标 | 微程序控制器里对应什么 | 决定了什么 |
      |---|---|---|
      | 状态数 | 控制存储器 $\texttt{CM}$ 的**深度**（微指令条数） | 能表达多少种不同的执行步骤 |
      | 每状态的信号组合 | $\texttt{CM}$ 的**宽度**（控制字段位数） | 一步能同时协调多少个部件 |

      硬布线没有 ROM 可数，等价的衡量是「可达状态总数 × 输出译码能产生的信号组合数」。
      这两个数乘起来，基本就是这台控制器==能做的事的上限==。

      $\texttt{CM}$ 容量到底怎么算，见[控制存储器的容量与字长](#/co/cpu/control?at=formulas)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'wires', c: '四、控制线：为什么有的一根，有的成对' },

    { t: 'insight', id: 'my-question-wires', title: '我的第二个问题', c: String.raw`
      ==控制线是怎么连接的呢？以及这些控制线一般都是一个请求、一个响应吗？==
    ` },

    { t: 'diagram', id: 'wire-kinds', title: '★ 两种控制线，判据只有一条',
      note: '对方的响应时间在设计阶段是否已经锁定',
      caption: String.raw`左边这种在数据通路里占**绝大多数**：寄存器 load 使能、ALU 操作码、MUX 选择端，
        全是单向、无需应答。右边这种只出现在==跨越"独立状态机边界"==的地方。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 218" role="img" aria-label="单向控制线与请求响应握手对的对比">
  <text class="cap" x="160" y="16" text-anchor="middle">延迟确定：一根单向控制线</text>
  <text class="cap" x="540" y="16" text-anchor="middle">延迟不定：请求 / 响应成对</text>

  <g class="n p"><rect x="50" y="34" width="220" height="44" rx="7"/>
    <text class="bt" x="160" y="56" text-anchor="middle" dominant-baseline="central">CU</text></g>
  <path class="ar" d="M160,78 V126"/>
  <g class="n k"><rect x="50" y="130" width="220" height="44" rx="7"/>
    <text class="bt" x="160" y="152" text-anchor="middle" dominant-baseline="central">寄存器的使能端</text></g>
  <text class="lb" x="160" y="200" text-anchor="middle">一根线就够：下一拍必然锁存成功</text>

  <g class="n p"><rect x="430" y="34" width="220" height="44" rx="7"/>
    <text class="bt" x="540" y="56" text-anchor="middle" dominant-baseline="central">CU</text></g>
  <path class="ar" d="M496,78 V126"/>
  <text class="lb" x="488" y="106" text-anchor="end">请求</text>
  <path class="ar em" d="M584,130 V82"/>
  <text class="lb em" x="592" y="106">ready</text>
  <g class="n g"><rect x="430" y="130" width="220" height="44" rx="7"/>
    <text class="bt" x="540" y="152" text-anchor="middle" dominant-baseline="central">Cache 控制器</text></g>
  <text class="lb" x="540" y="200" text-anchor="middle">延迟未知：必须等对方主动告知完成</text>
</svg>` },

    { t: 'key', id: 'wire-rule', title: '★ 判据：响应延迟在设计阶段能不能锁定', c: String.raw`
      **能锁定 → 单向广播一根线。**
      CU 发出寄存器使能时，下一个边沿会发生什么是完全确定的——
      这是设计阶段用时序分析
      $t_{CO}+t_{PD}<T_{clk}-t_{su}$（[就是上一页那条不等式](#/co/cpu/fsm?at=clock-bound)）
      保证好的。既然结果确定，==根本不需要对方回话==。

      **锁定不了 → 必须成对握手。**
      CU 发起访存时，不知道要 1 拍还是几十拍：命中与缺失差着数量级，
      缺失还要看总线忙不忙、主存多快。==延迟不可预知，就必须有一根线由对方主动告知"我完成了"。==

      常见命名（叫法随教材和协议变，逻辑是同一套）：

      | 场景 | 信号对 |
      |---|---|
      | 总线仲裁 | request / grant |
      | 访存等待 | ready / wait（或 busy / done） |
      | 异步总线的全互锁握手 | 请求 / 回答，[见总线定时](#/co/bus/bus-timing?at=three-handshake) |
      | 现代 SoC 总线（AXI 等） | valid / ready，==两边都为高的那一拍才真正传输== |
    ` },

    /* ================================================================== */
    { t: 'h', id: 'each', c: '五、逐个看：各自连什么、干什么、怎么干' },

    { t: 'steps', id: 'controller-list', title: '五个控制器，按「连接对象 → 功能 → 状态机怎么走」拆', items: [
      { title: '① CU（控制单元）',
        c: String.raw`
          **连接对象**：几乎覆盖整条数据通路——$\texttt{PC}$、$\texttt{MAR}$、$\texttt{MDR}$、$\texttt{IR}$、
          寄存器堆的写使能与地址选择、ALU 操作码、条件码（读入，用于判分支）、
          内部总线上各三态门与 MUX 的选通，以及对外的读写命令线。

          **功能**：把一条指令翻译成一串按时间排列的微操作。

          **怎么走**：微程序控制靠 $\mu\texttt{PC}$ 顺序取微指令、遇分支字段按标志位改微地址；
          硬布线靠节拍触发器 + 一大块组合逻辑直接算出信号与下一节拍。
          [两种实现的细节](#/co/cpu/control?at=the-whole-point)` },

      { title: '② 总线仲裁器',
        c: String.raw`
          **连接对象**：==不接数据通路寄存器==，只接各主设备的 request / grant 线，
          有时再维护一根"总线忙"。

          **功能**：多个主设备同时想用总线时裁定谁先用。

          **怎么走**：内部有一个"当前持有者"寄存器；收到多路请求后用优先级编码器（固定优先级）
          或轮转计数器（round-robin）选出赢家，拉高对应 grant；
          ==直到该主设备主动释放，才重新判优==。
          [三种集中仲裁方式](#/co/bus/bus-timing?at=arb-compare)` },

      { title: '③ DMA 控制器',
        c: String.raw`
          **连接对象**：自带地址寄存器、字计数器、控制/状态寄存器——==这三个由 CU 用普通 I/O 写指令初始化==；
          传输开始后它==自己驱动系统地址总线和数据总线==（它本身就是主设备，不经过 CPU 内部任何寄存器），
          另有一根中断请求线回 CU。

          **功能**：在 CPU 不参与的情况下完成外设与主存之间的成批搬运。

          **怎么走**：空闲等参数 → 申请总线 → 传一次（地址 $+1$、计数 $-1$）→
          计数没归零就继续（让出几拍即周期挪用，连续占用即块传送）→ 归零后置完成、发中断、回空闲。
          [完整三阶段](#/co/io/dma?at=phases)` },

      { title: '④ Cache 控制器',
        c: String.raw`
          **连接对象**：接收 CPU 送来的访存地址与读写类型；内部管 tag 阵列、有效位、脏位、
          数据阵列的读写控制线；对外作为主设备连系统总线；对内一根 ready / wait 回 CU。

          **功能**：判命中；命中就地完成，缺失则取回整行并处理替换。

          **怎么走**：空闲 → 比较 tag → 命中就读写数据阵列、置 ready；
          缺失则==先看待替换行脏不脏==（脏就先写回主存）→ 申请总线 → 逐字填入整行、更新 tag 与有效位 →
          置 ready 通知 CU。[写策略与脏位](#/co/memory/cache-write?at=write-back)` },

      { title: '⑤ I/O 控制器（接口）',
        c: String.raw`
          **连接对象**：设备侧接外设的数据 / 状态 / 控制寄存器；CPU 侧接数据总线和一根中断请求线。

          **功能**：把外设那种慢速、异步的物理事件，==转成 CPU 能理解的标准数字信号==（就绪标志或中断）。

          **怎么走**：状态机盯着物理线路的电平变化（如 UART 检到起始位下降沿），
          按固定采样节拍逐位读入，拼成一个字节后存进数据缓冲寄存器，
          随即置"数据就绪"或直接发中断，等 CPU 或 DMA 来取。
          [三种 I/O 方式的分工](#/co/io/io-mode?at=three-way)` },
    ] },

    { t: 'key', id: 'same-skeleton', title: '五个例子共用同一副骨架', c: String.raw`
      - ==「连接对象」清单 = 它的管辖范围==；
      - ==状态数 × 每步的信号种类 = 它的工作能力==；
      - 「怎么走」这一列说到底都是同一句话：
        **空闲态等触发 → 按固定顺序推进若干中间态 → 完成后置标志或发中断，交还主动权。**

      只是各自管的资源不同、步骤不同而已。
    ` },

    { t: 'key', id: 'named-controller', title: '★ 凡是叫"控制器"的，几乎必然是状态机', c: String.raw`
      这几乎是定义性的：一个部件之所以叫控制器，==就是因为它要按顺序协调一个跨越多个时钟周期的操作==。
      而"记住现在做到第几步"需要寄存器，"根据当前步骤和外部条件决定下一步"需要组合逻辑——
      两者一组合，天然就是状态机。

      所以 UART、键盘扫描、中断控制器（PIC / APIC，尤其处理中断嵌套时）、
      磁盘控制器（寻道 → 旋转等待 → 传输 → 校验）、USB / PCIe 链路训练，
      内部都藏着至少一台状态机。

      ==唯一的例外==：如果一个部件的行为完全不依赖历史，纯粹"当前输入直接算出当前输出"，
      那它是纯组合逻辑，严格说==算不上控制器，只能叫译码器或选择逻辑==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'three-relations', c: '六、用「能不能同时工作」把关系分成三类' },

    { t: 'insight', id: 'my-angle', title: '★ 我想到的切入点', c: String.raw`
      ==我们可以用"同一个时刻，不同的控制器能否同时工作"来考察这些控制器的关系吗？==
    ` },

    { t: 'md', c: String.raw`
      这条线索很好使——它恰好能把三种完全不同的关系彻底分开。
      场景：**CPU 执行 $\texttt{LOAD}$ 时 Cache 缺失，与此同时 DMA 也想用总线。**
    ` },

    { t: 'diagram', id: 'concurrency-timeline', title: '★★ 四条泳道，看每一段谁在真的往前走',
      note: '彩色 = 主动工作并占着自己的资源；灰色 = 空闲或被动等待',
      caption: String.raw`读法：==横着看一行，是这台状态机的一生；竖着看一列，是这一刻的全局快照==。
        「总线」那一行任何时刻==只可能有一种颜色==，这就是仲裁器存在的全部意义。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 236" role="img" aria-label="CU、DMA 控制器、Cache 控制器与总线在四个阶段的忙闲时间线">
  <text class="cap" x="186" y="16" text-anchor="middle">正常执行</text>
  <text class="cap" x="332" y="16" text-anchor="middle">LOAD 缺失</text>
  <text class="cap" x="478" y="16" text-anchor="middle">总线争用</text>
  <text class="cap" x="624" y="16" text-anchor="middle">并行完成</text>

  <text class="cap" x="104" y="48" text-anchor="end" dominant-baseline="central">CU</text>
  <g class="n p"><rect x="116" y="26" width="140" height="44" rx="6"/>
    <text class="bt sm" x="186" y="48" text-anchor="middle" dominant-baseline="central">工作中</text></g>
  <g class="n m"><rect x="262" y="26" width="140" height="44" rx="6"/>
    <text class="bt sm" x="332" y="48" text-anchor="middle" dominant-baseline="central">等待</text></g>
  <g class="n m"><rect x="408" y="26" width="140" height="44" rx="6"/>
    <text class="bt sm" x="478" y="48" text-anchor="middle" dominant-baseline="central">等待</text></g>
  <g class="n p"><rect x="554" y="26" width="140" height="44" rx="6"/>
    <text class="bt sm" x="624" y="48" text-anchor="middle" dominant-baseline="central">工作中</text></g>

  <text class="cap" x="104" y="100" text-anchor="end" dominant-baseline="central">DMA 控制器</text>
  <g class="n m"><rect x="116" y="78" width="140" height="44" rx="6"/>
    <text class="bt sm" x="186" y="100" text-anchor="middle" dominant-baseline="central">空闲</text></g>
  <g class="n m"><rect x="262" y="78" width="140" height="44" rx="6"/>
    <text class="bt sm" x="332" y="100" text-anchor="middle" dominant-baseline="central">空闲</text></g>
  <g class="n m"><rect x="408" y="78" width="140" height="44" rx="6"/>
    <text class="bt sm" x="478" y="100" text-anchor="middle" dominant-baseline="central">申请中</text></g>
  <g class="n a"><rect x="554" y="78" width="140" height="44" rx="6"/>
    <text class="bt sm" x="624" y="100" text-anchor="middle" dominant-baseline="central">传输中</text></g>

  <text class="cap" x="104" y="152" text-anchor="end" dominant-baseline="central">Cache 控制器</text>
  <g class="n m"><rect x="116" y="130" width="140" height="44" rx="6"/>
    <text class="bt sm" x="186" y="152" text-anchor="middle" dominant-baseline="central">空闲</text></g>
  <g class="n g"><rect x="262" y="130" width="140" height="44" rx="6"/>
    <text class="bt sm" x="332" y="152" text-anchor="middle" dominant-baseline="central">miss 处理</text></g>
  <g class="n g"><rect x="408" y="130" width="140" height="44" rx="6"/>
    <text class="bt sm" x="478" y="152" text-anchor="middle" dominant-baseline="central">填充中</text></g>
  <g class="n m"><rect x="554" y="130" width="140" height="44" rx="6"/>
    <text class="bt sm" x="624" y="152" text-anchor="middle" dominant-baseline="central">空闲</text></g>

  <text class="cap" x="104" y="204" text-anchor="end" dominant-baseline="central">总线</text>
  <g class="n p"><rect x="116" y="182" width="140" height="44" rx="6"/>
    <text class="bt sm" x="186" y="204" text-anchor="middle" dominant-baseline="central">CU 占用</text></g>
  <g class="n m"><rect x="262" y="182" width="140" height="44" rx="6"/>
    <text class="bt sm" x="332" y="204" text-anchor="middle" dominant-baseline="central">空闲</text></g>
  <g class="n g"><rect x="408" y="182" width="140" height="44" rx="6"/>
    <text class="bt sm" x="478" y="204" text-anchor="middle" dominant-baseline="central">Cache 占用</text></g>
  <g class="n a"><rect x="554" y="182" width="140" height="44" rx="6"/>
    <text class="bt sm" x="624" y="204" text-anchor="middle" dominant-baseline="central">DMA 占用</text></g>
</svg>` },

    { t: 'key', id: 'three-kinds', title: '★★ 从这张图能读出三种截然不同的关系', c: String.raw`
      **① 依赖串行（伪并行）—— CU 与 Cache 控制器**

      中间两列里 CU 一直是灰的、Cache 控制器一直是彩的。
      表面上两台状态机"同时存在"，但==CU 没有任何有效推进==：
      它的状态寄存器虽然仍每拍被采样（[无条件加载](#/co/cpu/fsm?at=unconditional)），
      输出的值却不变，本质是原地打转。==这不叫并行，叫串行依赖==。

      **② 资源互斥 —— 总线那一行**

      任一时刻只有一种颜色。哪怕 Cache 控制器和 DMA 控制器都想要总线，
      也只有一方真正驱动信号线。==这里不是谁依赖谁，是谁抢到谁先用==，仲裁器负责裁。

      **③ 真并行 —— 最后一列的 CU 与 DMA**

      CU 在执行不访存的指令（只用内部寄存器和 ALU），DMA 在独立驱动总线搬数据，
      ==两者用的是不相交的资源==，各自推进、互不阻塞。
      唯一的接触点只有一开始 CU 写入的启动参数，和将来传完的那个中断。
    ` },

    { t: 'compare', id: 'judge-table', title: '★ 判断标准（做辨析题时按这三行套）',
      cols: ['如果…', '那么关系是', '对应的机制'],
      rows: [
        ['两台操作的资源**完全不相交**', '真并行，谁也不用等谁', '各自独立的状态机'],
        ['一台的下一步**依赖另一台给出的信号**', '串行，等待方不产生有效推进', 'ready / grant / 中断，握手驻留'],
        ['两台都要**同一份物理资源**', '互斥，任意时刻只归一方', '总线仲裁器的判优逻辑'],
      ] },

    /* ================================================================== */
    { t: 'h', id: 'traps', c: '七、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. ==说"CU 在等 Cache 时是空闲的，可以去执行别的指令"==——
         经典多周期 CPU 里**不行**，CU 就卡在那个状态上。
         能这么干的是[乱序 / 多发射](#/co/cpu/pipeline?at=hazard-overview)那一层的机制，别混进来。
      2. ==把 DMA 说成"不需要 CPU 参与，所以也不需要中断"==——
         预处理和后处理都要 CPU，[这条年年考](#/co/io/dma?at=dma-needs-int)。
      3. ==把"总线空闲"和"CPU 空闲"混为一谈==——
         上图第二列总线是空闲的，但 CU 在等、Cache 控制器在忙。
      4. ==认为仲裁器管得着 Cache 控制器内部==——
         仲裁器只有 request / grant 两根线，[管辖范围看接线](#/co/cpu/multi-ctrl?at=scope-is-wiring)。
      5. 周期挪用时说"DMA 和 CPU 同时访问主存"——
         ==同一时刻主存只能被一方访问==，挪用的意思是把 CPU 让出来的那一拍拿去用。
    ` },

    { t: 'md', c: String.raw`
      ---

      往回看：[CU 为什么是状态机](#/co/cpu/fsm?at=broadcast-is-the-line)　·
      [控制器的两种实现](#/co/cpu/control?at=the-whole-point)　·
      [总线仲裁与定时](#/co/bus/bus-timing?at=arbitration)　·
      [DMA 的三个阶段](#/co/io/dma?at=phases)
    ` },

  ],
});
