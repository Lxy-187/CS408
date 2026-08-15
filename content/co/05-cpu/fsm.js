/* ==========================================================================
   计算机组成原理 / 5 中央处理器 / 时序视角：CU 是一台状态机
   —— 这一页回答的是「每一拍到底谁在变」，
      以及把 CPU 拆到最底层之后，只剩下哪两种元件。
      控制器的两种实现方式在 control.js，这里只讲时序与拓扑。
   ========================================================================== */

KM.page({
  path: 'co/cpu/fsm',
  title: '时序视角：CU 是一台状态机',
  subtitle: '换一个角度看数据通路：**每个时钟周期，到底哪些寄存器发生了改变**。顺着这个问题往下问，会摸到整台机器的时序骨架',
  tags: ['概念辨析', '综合应用'],
  updated: '2026-08-16',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'the-question', c: '一、一个提问方式：每一拍谁在变' },

    { t: 'insight', id: 'my-observation', title: '★ 我的观察：只有一个寄存器每拍都在动', c: String.raw`
      要理解 CPU 和总线，==首先得理解寄存器，以及寄存器如何在时钟周期内按一定顺序被不断更新==。

      有一个很有意思的考察角度：==去看每个时钟周期上，有哪些寄存器发生了改变==。

      在简单的内部单总线结构里会发现，==微程序计数器（或者说 CU 的控制寄存器），
      似乎是唯一一个在每一个时钟周期都发生变化的==；
      而且如果考察某一个状态，==CU 的输出信号始终是"下一个时钟周期其他寄存器会不会改变"的依据==。
    ` },

    { t: 'key', id: 'unconditional', title: '这个观察成立，但要把"变化"换成"被加载"', c: String.raw`
      数据通路里的寄存器（$\texttt{PC}$、$\texttt{MAR}$、$\texttt{MDR}$、$\texttt{IR}$、通用寄存器、$\texttt{ACC}$）
      ==只有在"这一拍需要它参与传送"时才会被打入新值==——是**有条件的、稀疏的**更新。

      CU 的状态寄存器（硬布线里是节拍计数器或状态编码，微程序里是 $\mu\texttt{PC}$ / $\texttt{CMAR}$）
      ==必须无条件地每拍被加载一次==——因为控制流程本身要往前推进，不推进整台机器就卡死。

      **但"每拍都变"和"每拍都被加载"不等价。** 遇到访存等待时，
      CU 会在同一个状态上停留很多拍，直到等到"数据就绪"才跳走。
      这时状态寄存器的值没变，但==它依然每拍都被重新求值、重新加载==，只是装进去的恰好是同一个值。

      所以更精确的说法是：
      ==CU 的状态寄存器是唯一一个每拍都被**无条件求值 / 加载**的寄存器==，
      值变不变，取决于转移条件满不满足。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'when', c: '二、控制信号活在哪一段时间' },

    { t: 'insight', id: 'my-timing', title: '★ 我的推论：控制信号存在于两个上升沿之间', c: String.raw`
      考察上升沿到来之后的一小段时间：==这里正好体现了为什么需要寄存器把值锁住==。
      因为上升沿一到，CU 被更新了，此时的控制信号其实已经改变了。

      我想强调的重点是：==CU 的控制信号发挥作用是在时钟的上升沿==。
      所以可以理解为，==控制信号存在于"上升沿到来前"，而它的起点是上一个上升沿之后（加一段短暂的传输时延）==。
    ` },

    { t: 'diagram', id: 'timing-chart', title: '三条时间轴对齐：状态、控制信号、被锁存的数据',
      note: '控制信号那一行是"缩进"的，这段缩进就是传输时延',
      caption: String.raw`看第三行：控制信号方块**没有紧贴边沿开始**，而是往右缩了一段（$t_{CO}+t_{PD}$）。
        它稳定之后一直待命到下一个边沿前的建立时间窗口，==在那个边沿才被"消费"掉==——
        它决定的是第四行**下一格**的内容，而不是同一时刻正在生成的那个新方块。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 720 344" role="img" aria-label="时钟、CU 状态、控制信号、数据寄存器四条时间轴的对齐关系">
  <text class="cap" x="175" y="24" text-anchor="middle">边沿 n-1</text>
  <text class="cap" x="400" y="24" text-anchor="middle">边沿 n</text>
  <text class="cap" x="625" y="24" text-anchor="middle">边沿 n+1</text>

  <text class="cap" x="86" y="60" text-anchor="end">CLK</text>
  <path class="wv" d="M95,76 H175 V46 H287 V76 H400 V46 H512 V76 H625 V46 H700"/>

  <text class="cap" x="86" y="126" text-anchor="end">CU 状态</text>
  <rect class="bx k" x="175" y="102" width="222" height="48" rx="8"/>
  <text class="bt" x="286" y="126" text-anchor="middle" dominant-baseline="central">S(n-1)</text>
  <rect class="bx k" x="402" y="102" width="222" height="48" rx="8"/>
  <text class="bt" x="513" y="126" text-anchor="middle" dominant-baseline="central">S(n)</text>

  <text class="cap" x="86" y="196" text-anchor="end">控制信号</text>
  <rect class="bx a" x="205" y="172" width="192" height="48" rx="8"/>
  <text class="bt sm" x="301" y="196" text-anchor="middle" dominant-baseline="central">对应 S(n-1) 的信号</text>
  <rect class="bx a" x="430" y="172" width="192" height="48" rx="8"/>
  <text class="bt sm" x="526" y="196" text-anchor="middle" dominant-baseline="central">对应 S(n) 的信号</text>

  <text class="cap" x="86" y="266" text-anchor="end">数据寄存器</text>
  <rect class="bx g" x="175" y="242" width="222" height="48" rx="8"/>
  <text class="bt" x="286" y="266" text-anchor="middle" dominant-baseline="central">V(n-1)</text>
  <rect class="bx g" x="402" y="242" width="222" height="48" rx="8"/>
  <text class="bt" x="513" y="266" text-anchor="middle" dominant-baseline="central">V(n)</text>

  <path class="ar" d="M175,308 H201"/>
  <text class="lb" x="188" y="332" text-anchor="middle">t_CO + t_PD</text>
  <path class="ar" d="M400,308 H426"/>
  <text class="lb" x="413" y="332" text-anchor="middle">t_CO + t_PD</text>
  <text class="lb" x="575" y="332" text-anchor="middle">这段稳定期供边沿 n+1 采样（t_su）</text>
</svg>` },

    { t: 'warn', id: 'same-edge', title: '★ 澄清：CU 和数据寄存器是"同一个边沿"一起锁存的', c: String.raw`
      很容易误解成"CU 先更新，然后数据寄存器再反应"——**没有这个先后关系**。

      它们==共用同一个时钟、都是边沿触发的触发器==，在同一个上升沿同时被打入新值。
      真正的因果链是**跨周期**的：

      1. 边沿 $n$ 到来：CU 状态寄存器锁存成 $S_n$；
         **与此同时**，数据寄存器锁存的是由**上一个状态** $S_{n-1}$ 产生的控制信号所决定的值。
      2. 边沿过去之后，经过触发器的输出延迟 $t_{CO}$、再经过译码逻辑的传播延迟 $t_{PD}$，
         对应 $S_n$ 的新控制信号才稳定下来。
      3. 这组信号一直待命到边沿 $n+1$ 前的建立时间 $t_{su}$ 窗口，在那一刻才被"消费"。

      ==所以"这一拍谁变"，问的其实是"上一拍 CU 处在什么状态"。==
    ` },

    { t: 'key', id: 'clock-bound', title: '这条链条直接给出时钟周期的下界', c: String.raw`
      $$t_{CO}(\text{状态寄存器}) + t_{PD}(\text{译码逻辑}) \;<\; T_{clk} - t_{su}(\text{数据寄存器})$$

      一个时钟周期==必须留够时间，让"状态更新 → 控制信号生成 → 稳定到能被安全采样"这条链走完==。
      时钟频率提不上去，卡住它的就是这条最长路径。

      这和[数据通路那一页讲的关键路径](#/co/cpu/datapath?at=critical-path)是同一件事的两种说法：
      那边算的是数据路径（寄存器 → ALU → 寄存器），==这里算的是控制路径（状态寄存器 → 译码 → 使能端）==，
      真实的时钟周期取两者中更长的那条。
    ` },

    { t: 'key', id: 'why-latch', title: '★ 顺带回答了"为什么非要有寄存器"', c: String.raw`
      如果没有寄存器来锁存，整条数据通路就是一张纯组合逻辑网：
      CU 状态一变，控制信号跟着变，通路上的值也跟着**漂移**，
      ==找不到任何一个时刻可以说"此刻的值就是这一步的正确结果"==。

      寄存器==只在边沿采样、其余时间对输入的变化充耳不闻==，
      这才把连续漂移的组合网络，切成了一串**离散、可预测的状态快照**。
      这就是同步时序电路和纯组合逻辑最本质的区别。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'two-elements', c: '三、拆到最底层，只有两种元件' },

    { t: 'insight', id: 'my-classify', title: '我原来的分类', c: String.raw`
      我本来想的是：==整个计算机系统的大部件，可以按"时序状态机 / 寄存器 / 组合电路"分成三类。==
    ` },

    { t: 'warn', id: 'not-three', title: '这里要改一处：状态机不是第三种基本元件', c: String.raw`
      往电路实现再看一层就会发现，==时序状态机不是和"寄存器""组合逻辑"并列的第三种元件==，
      而是==由这两者按一种特定拓扑（反馈环）组合出来的结构==。

      所以正确的说法要分两层。**第一层——真正的基本元件，只有两种**：

      | 元件 | 有没有记忆 | 例子 |
      |---|---|---|
      | 组合逻辑 | 无。输出只是当前输入的函数，不含时钟 | 门电路、译码器、MUX、加法器、ALU 核心 |
      | 寄存器（触发器） | 有。只在时钟边沿采样并保持 | $\texttt{PC}$、$\texttt{IR}$、状态寄存器、流水线寄存器 |

      ==寄存器是系统里唯一"跨时间"存住状态的元件==，别的什么都存不住。

      **第二层——由这两者搭出来的功能抽象**，种类可以很多，状态机只是其中一种。
    ` },

    { t: 'diagram', id: 'fsm-topology', title: '时序状态机的拓扑：两种元件 + 一条反馈边',
      note: '把这个环切断，切口处的信号就是"状态变量"',
      caption: String.raw`这正是数字逻辑课上分析时序电路的经典手法：==先在电路图里找反馈环，把环切开，切口处就是状态==。
        Mealy / Moore 机的形式化定义，落到电路上就是这张图。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 720 282" role="img" aria-label="组合逻辑与寄存器通过反馈环构成时序状态机">
  <text class="cap" x="30" y="28">时序状态机（复合结构，不是基本元件）</text>

  <rect class="bx g" x="60" y="62" width="250" height="86" rx="10"/>
  <text class="bt" x="185" y="94" text-anchor="middle" dominant-baseline="central">组合逻辑</text>
  <text class="bs" x="185" y="120" text-anchor="middle" dominant-baseline="central">算出次态与输出</text>

  <rect class="bx k" x="410" y="62" width="250" height="86" rx="10"/>
  <text class="bt" x="535" y="94" text-anchor="middle" dominant-baseline="central">寄存器</text>
  <text class="bs" x="535" y="120" text-anchor="middle" dominant-baseline="central">在时钟边沿锁存现态</text>

  <path class="ar" d="M310,105 H402"/>
  <text class="lb" x="356" y="94" text-anchor="middle">次态</text>

  <path class="ar" d="M535,148 V198 H185 V156"/>
  <text class="cap" x="360" y="222" text-anchor="middle">反馈：现态回到组合逻辑的输入</text>

  <text class="lb" x="185" y="258" text-anchor="middle">例：CU 的次态译码逻辑</text>
  <text class="lb" x="535" y="258" text-anchor="middle">例：CU 的状态寄存器 / μPC</text>
</svg>` },

    { t: 'compare', id: 'four-kinds', title: '★ 按这两层看，系统里的部件分成四类',
      cols: ['类别', '有没有寄存器', '有没有反馈环', '典型例子'],
      rows: [
        ['时序状态机', '有（存"现态"）', '**有**，且用来算自己的次态', 'CU、总线仲裁器、Cache 控制器、DMA 控制器'],
        ['数据通路寄存器', '有（存"数据"）', '不一定', '`PC`、`MAR`、`IR`、流水线寄存器'],
        ['纯组合部件', '没有', '没有', 'ALU、译码器、MUX、三态门'],
        ['存储阵列', '有（规整排列）', '没有', '主存、Cache 数据阵列、寄存器堆'],
      ] },

    { t: 'md', c: String.raw`
      存储阵列本质上也是"大号寄存器堆"：它不参与反馈计算次态，
      只是==被地址译码之后读写==，所以谈不上状态机。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'ring-not-enough', c: '四、环是必要条件，但"有没有环"分不出 CU' },

    { t: 'insight', id: 'my-question', title: '我接着问的问题', c: String.raw`
      ==什么样的组合可以构成一个时序状态机？是否一定需要一个环形结构？
      而普通的数据通路寄存器是否一定不具备这样的结构？==
    ` },

    { t: 'diagram', id: 'three-topologies', title: '★ 三种拓扑：没有环 / 有局部环 / 有环还往外广播',
      note: '中间那个是关键——普通数据通路寄存器也可能有环',
      caption: String.raw`==环形拓扑是状态机的必要条件，这点没有例外==；但**有没有环不能用来区分 CU 和普通寄存器**。
        $\texttt{PC}$ 自增、$\texttt{ACC}$ 累加，任何"读—改—写"的寄存器都天然带反馈环，都是极简状态机。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 720 320" role="img" aria-label="前馈链、局部反馈环与带广播的反馈环三种拓扑对比">
  <text class="cap" x="110" y="26" text-anchor="middle">① 前馈链（无环）</text>
  <text class="cap" x="350" y="26" text-anchor="middle">② 局部反馈环（ACC）</text>
  <text class="cap" x="590" y="26" text-anchor="middle">③ 反馈环 + 向外广播（CU）</text>

  <rect class="bx k" x="20" y="50" width="180" height="56" rx="8"/>
  <text class="bt" x="110" y="78" text-anchor="middle" dominant-baseline="central">Reg1</text>
  <path class="ar" d="M110,106 V136"/>
  <rect class="bx a" x="20" y="140" width="180" height="56" rx="8"/>
  <text class="bt" x="110" y="168" text-anchor="middle" dominant-baseline="central">组合逻辑</text>
  <path class="ar" d="M110,196 V226"/>
  <rect class="bx k" x="20" y="230" width="180" height="56" rx="8"/>
  <text class="bt" x="110" y="258" text-anchor="middle" dominant-baseline="central">Reg2</text>
  <text class="lb" x="110" y="306" text-anchor="middle">继续流向下一级</text>

  <rect class="bx k" x="260" y="50" width="180" height="56" rx="8"/>
  <text class="bt" x="350" y="78" text-anchor="middle" dominant-baseline="central">ACC</text>
  <path class="ar" d="M350,106 V136"/>
  <rect class="bx a" x="260" y="140" width="180" height="56" rx="8"/>
  <text class="bt" x="350" y="168" text-anchor="middle" dominant-baseline="central">组合逻辑（+）</text>
  <path class="ar" d="M440,168 C476,168 476,78 444,78"/>
  <text class="lb" x="350" y="306" text-anchor="middle">环只服务自己</text>

  <rect class="bx k" x="500" y="50" width="180" height="56" rx="8"/>
  <text class="bt" x="590" y="78" text-anchor="middle" dominant-baseline="central">状态寄存器</text>
  <path class="ar" d="M590,106 V136"/>
  <rect class="bx a" x="500" y="140" width="180" height="56" rx="8"/>
  <text class="bt" x="590" y="168" text-anchor="middle" dominant-baseline="central">组合逻辑（次态）</text>
  <path class="ar" d="M680,168 C714,168 714,78 684,78"/>
  <path class="ar em" d="M590,196 V246"/>
  <text class="lb em" x="590" y="268" text-anchor="middle">控制信号 → 全系统</text>
</svg>` },

    { t: 'key', id: 'broadcast-is-the-line', title: '★★ 真正的分水岭：那一条向外广播的边', c: String.raw`
      三张图的差别：

      - **① 前馈链**：$\texttt{Reg1}\to$ 组合逻辑 $\to\texttt{Reg2}$，一路往下，没有任何路径绕回自己。
        ==$\texttt{IF/ID}$、$\texttt{ID/EX}$ 这些流水线寄存器就是这种拓扑==，
        它们存的是"上一级流过来的历史数据"，不是"由自身推导自身的状态"。
      - **② 局部环**：$\texttt{ACC}$ 的值经加法器算出新值又写回自己。**这是环**，
        所以计数器、累加器==本身就是最简单的状态机==：状态是计数值，转移函数是 $+1$。
      - **③ CU**：环的拓扑和 ② 一模一样，==多的是那一条橙色的边==——
        组合逻辑除了算自己的次态，还把现态译码成控制信号**广播给全系统**。

      用状态机的语言说：
      ==CU 是一台**输出耦合到其他子系统输入端**的主状态机；
      $\texttt{ACC}$ 是一台输出只服务于自身数据演化的从属状态机。==
    ` },

    { t: 'warn', id: 'exam-note', title: '考试里怎么用这条区分', c: String.raw`
      辨析题问"$\texttt{PC}$ 算不算控制部件"时，==别用"有没有反馈"去答==，
      判据是**它的输出有没有去控制别的部件**：

      - $\texttt{PC}$ 自增有环，但它的输出只送地址，==不决定别人这一拍动不动==，所以它是数据通路寄存器；
      - CU 的输出直接接在别人的使能端上，==它决定别人动不动==，所以它是控制部件。

      一句话：==看它是"自己往前走"，还是"让别人往前走"。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'cash-in', c: '五、这个视角能兑现成什么' },

    { t: 'md', c: String.raw`
      建立起"CPU 控制器 = 一台时序状态机"之后，几件事会同时变清楚：

      1. **状态数**：微程序控制里就是微指令条数（$\texttt{CM}$ 的深度），
         硬布线里就是独立时序状态的个数。
      2. **状态转移函数**：「现态 + 输入条件（操作码、标志位、就绪信号）→ 次态」。
         ==访存等待就是转移条件不满足时的自跳转==。
      3. **输出函数**：Moore 型只看现态，所以==一个周期内控制信号保持稳定==；
         Mealy 型还看瞬时输入，信号可能在周期内抖动。
         教材里的微程序控制器为了时序干净，行为上都偏 Moore 型。

      这三条正好对应[控制器那一页的状态机视角](#/co/cpu/control?at=fsm-view)：
      ==两种控制器的差别，只在于"次态函数"和"输出函数"是用逻辑门算出来的，还是用 ROM 查出来的。==
    ` },

    { t: 'key', id: 'not-the-only-one', title: 'CU 不是系统里唯一的状态机', c: String.raw`
      在冯·诺依曼的教学模型里，CU 处在最顶层、控制一切，其他部件看着像"被动执行"，
      所以容易觉得只有它算状态机。==但只要往真实系统走一步，状态机到处都是==：

      | 部件 | 它的"状态"是什么 |
      |---|---|
      | 总线仲裁器 | 空闲 / 收到请求 / 已授权 / 释放 |
      | DMA 控制器 | 等参数 / 申请总线 / 传输 / 计数归零 / 完成 |
      | Cache 控制器 | 空闲 / 判命中 / 写回旧行 / 填充新行 / 就绪 |
      | Cache 一致性协议 | 每个 Cache 行各跑一台 MESI 状态机 |
      | I/O 控制器（UART 等） | 空闲 / 起始位 / 逐位接收 / 校验 / 停止位 |

      ==CU 特殊的地方在于它是粒度最细的那台==（管到每一个微操作），
      而不在于它是唯一的那台。这些状态机之间怎么协同，见
      [多控制器怎么互相咬合](#/co/cpu/multi-ctrl?at=three-relations)。
    ` },

  ],
});
