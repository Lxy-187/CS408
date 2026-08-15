/* ==========================================================================
   计算机组成原理 / 5 中央处理器 / 流水线：冒险与性能计算
   —— 本章的收口。数据通路提供了"路"，控制器提供了"信号"，
      流水线要做的是让多条指令【同时】走在这条路上，
      而三种冒险就是"同时走"必然撞上的三堵墙。
   ========================================================================== */

KM.page({
  path: 'co/cpu/pipeline',
  title: '流水线：冒险与性能计算',
  subtitle: '流水线==不缩短单条指令的时间==，只提高吞吐率。这一句是本页所有公式和所有冒险的共同前提',
  tags: ['高频', '必考', '综合应用', '手算'],
  updated: '2026-08-16',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'idea', c: '一、从多周期到流水线' },

    { t: 'md', c: String.raw`
      [多周期 CPU](#/co/cpu/datapath?at=cpu-type-table) 已经把一条指令切成了 5 段，
      但它==一次只跑一条指令==：第 1 拍取指部件在忙，另外四个部件全闲着。

      ==既然部件是分开的，为什么不让它们同时干活？==
      第 1 条指令进入 ID 段时，让第 2 条指令进入 IF 段 —— 这就是流水线。
    ` },

    { t: 'diagram', id: 'overlap', title: '同样 5 条指令，串行 vs 流水',
      note: '两张图用同一把尺子，长度差就是加速比',
      caption: String.raw`看第 5 拍那一列：==五个格子颜色各不相同==，
        说明取指、译码、执行、访存、写回==五个部件在同一拍里全都在干活==。
        串行时任何一拍都只有一个部件在动，其余四个在空等。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 352" role="img" aria-label="五条指令串行执行 25 拍与流水执行 9 拍的时空图对比">
  <text class="cap" x="0" y="13">① 串行执行（多周期）：一条跑完 5 拍，下一条才进 —— 共 25 拍</text>
  <text class="cap" x="50" y="35" text-anchor="end" dominant-baseline="central">I1</text>
  <g class="n k"><rect x="58" y="24" width="23" height="22" rx="3"/><text class="bt xs" x="69.5" y="35.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="83" y="24" width="23" height="22" rx="3"/><text class="bt xs" x="94.5" y="35.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="108" y="24" width="23" height="22" rx="3"/><text class="bt xs" x="119.5" y="35.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="133" y="24" width="23" height="22" rx="3"/><text class="bt xs" x="144.5" y="35.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="158" y="24" width="23" height="22" rx="3"/><text class="bt xs" x="169.5" y="35.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="50" y="60" text-anchor="end" dominant-baseline="central">I2</text>
  <g class="n k"><rect x="183" y="49" width="23" height="22" rx="3"/><text class="bt xs" x="194.5" y="60.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="208" y="49" width="23" height="22" rx="3"/><text class="bt xs" x="219.5" y="60.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="233" y="49" width="23" height="22" rx="3"/><text class="bt xs" x="244.5" y="60.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="258" y="49" width="23" height="22" rx="3"/><text class="bt xs" x="269.5" y="60.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="283" y="49" width="23" height="22" rx="3"/><text class="bt xs" x="294.5" y="60.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="50" y="85" text-anchor="end" dominant-baseline="central">I3</text>
  <g class="n k"><rect x="308" y="74" width="23" height="22" rx="3"/><text class="bt xs" x="319.5" y="85.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="333" y="74" width="23" height="22" rx="3"/><text class="bt xs" x="344.5" y="85.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="358" y="74" width="23" height="22" rx="3"/><text class="bt xs" x="369.5" y="85.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="383" y="74" width="23" height="22" rx="3"/><text class="bt xs" x="394.5" y="85.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="408" y="74" width="23" height="22" rx="3"/><text class="bt xs" x="419.5" y="85.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="50" y="110" text-anchor="end" dominant-baseline="central">I4</text>
  <g class="n k"><rect x="433" y="99" width="23" height="22" rx="3"/><text class="bt xs" x="444.5" y="110.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="458" y="99" width="23" height="22" rx="3"/><text class="bt xs" x="469.5" y="110.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="483" y="99" width="23" height="22" rx="3"/><text class="bt xs" x="494.5" y="110.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="508" y="99" width="23" height="22" rx="3"/><text class="bt xs" x="519.5" y="110.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="533" y="99" width="23" height="22" rx="3"/><text class="bt xs" x="544.5" y="110.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="50" y="135" text-anchor="end" dominant-baseline="central">I5</text>
  <g class="n k"><rect x="558" y="124" width="23" height="22" rx="3"/><text class="bt xs" x="569.5" y="135.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="583" y="124" width="23" height="22" rx="3"/><text class="bt xs" x="594.5" y="135.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="608" y="124" width="23" height="22" rx="3"/><text class="bt xs" x="619.5" y="135.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="633" y="124" width="23" height="22" rx="3"/><text class="bt xs" x="644.5" y="135.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="658" y="124" width="23" height="22" rx="3"/><text class="bt xs" x="669.5" y="135.0" text-anchor="middle" dominant-baseline="central">WB</text></g>

  <text class="cap" x="0" y="176">② 流水执行：每拍放一条新指令进来 —— 共 9 拍</text>
  <text class="lb" x="69.5" y="192" text-anchor="middle">1</text>
  <text class="lb" x="94.5" y="192" text-anchor="middle">2</text>
  <text class="lb" x="119.5" y="192" text-anchor="middle">3</text>
  <text class="lb" x="144.5" y="192" text-anchor="middle">4</text>
  <text class="lb" x="169.5" y="192" text-anchor="middle">5</text>
  <text class="lb" x="194.5" y="192" text-anchor="middle">6</text>
  <text class="lb" x="219.5" y="192" text-anchor="middle">7</text>
  <text class="lb" x="244.5" y="192" text-anchor="middle">8</text>
  <text class="lb" x="269.5" y="192" text-anchor="middle">9</text>
  <text class="cap" x="50" y="211" text-anchor="end" dominant-baseline="central">I1</text>
  <g class="n k"><rect x="58" y="200" width="23" height="22" rx="3"/><text class="bt xs" x="69.5" y="211.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="83" y="200" width="23" height="22" rx="3"/><text class="bt xs" x="94.5" y="211.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="108" y="200" width="23" height="22" rx="3"/><text class="bt xs" x="119.5" y="211.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="133" y="200" width="23" height="22" rx="3"/><text class="bt xs" x="144.5" y="211.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="158" y="200" width="23" height="22" rx="3"/><text class="bt xs" x="169.5" y="211.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="50" y="236" text-anchor="end" dominant-baseline="central">I2</text>
  <g class="n k"><rect x="83" y="225" width="23" height="22" rx="3"/><text class="bt xs" x="94.5" y="236.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="108" y="225" width="23" height="22" rx="3"/><text class="bt xs" x="119.5" y="236.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="133" y="225" width="23" height="22" rx="3"/><text class="bt xs" x="144.5" y="236.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="158" y="225" width="23" height="22" rx="3"/><text class="bt xs" x="169.5" y="236.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="183" y="225" width="23" height="22" rx="3"/><text class="bt xs" x="194.5" y="236.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="50" y="261" text-anchor="end" dominant-baseline="central">I3</text>
  <g class="n k"><rect x="108" y="250" width="23" height="22" rx="3"/><text class="bt xs" x="119.5" y="261.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="133" y="250" width="23" height="22" rx="3"/><text class="bt xs" x="144.5" y="261.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="158" y="250" width="23" height="22" rx="3"/><text class="bt xs" x="169.5" y="261.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="183" y="250" width="23" height="22" rx="3"/><text class="bt xs" x="194.5" y="261.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="208" y="250" width="23" height="22" rx="3"/><text class="bt xs" x="219.5" y="261.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="50" y="286" text-anchor="end" dominant-baseline="central">I4</text>
  <g class="n k"><rect x="133" y="275" width="23" height="22" rx="3"/><text class="bt xs" x="144.5" y="286.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="158" y="275" width="23" height="22" rx="3"/><text class="bt xs" x="169.5" y="286.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="183" y="275" width="23" height="22" rx="3"/><text class="bt xs" x="194.5" y="286.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="208" y="275" width="23" height="22" rx="3"/><text class="bt xs" x="219.5" y="286.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="233" y="275" width="23" height="22" rx="3"/><text class="bt xs" x="244.5" y="286.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="50" y="311" text-anchor="end" dominant-baseline="central">I5</text>
  <g class="n k"><rect x="158" y="300" width="23" height="22" rx="3"/><text class="bt xs" x="169.5" y="311.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="183" y="300" width="23" height="22" rx="3"/><text class="bt xs" x="194.5" y="311.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="208" y="300" width="23" height="22" rx="3"/><text class="bt xs" x="219.5" y="311.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="233" y="300" width="23" height="22" rx="3"/><text class="bt xs" x="244.5" y="311.0" text-anchor="middle" dominant-baseline="central">ME</text></g>
  <g class="n m"><rect x="258" y="300" width="23" height="22" rx="3"/><text class="bt xs" x="269.5" y="311.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <path class="gd" d="M170,196 V330"/>
  <text class="lb" x="176" y="344">↑ 第 5 拍：五个段同时在工作（满载）</text>
</svg>` },

    { t: 'key', id: 'not-faster', title: '★★ 流水线没有让任何一条指令变快', c: String.raw`
      这是整节最容易误解、也最容易被出成判断题的一句话。

      看上图：$\texttt{I1}$ 从第 1 拍进去、第 5 拍出来，==用了 5 拍==；
      串行执行时它也是 5 拍。==一条指令的延迟一点没变==（实际上还略有增加，
      因为多了流水寄存器的开销）。

      变的是**吞吐率**：满载之后==每一拍都有一条指令完成==，
      而串行是每 5 拍才完成一条。

      $$\text{流水线优化的是}\ \underbrace{\textbf{吞吐率}}_{\text{单位时间完成几条}},
      \ \text{不是}\ \underbrace{\text{延迟}}_{\text{一条要多久}}$$

      **一个类比**：把工厂的装配线加长，==一辆车的组装时间不会缩短==，
      但每分钟下线的车变多了。

      ==由此可以直接判掉一批叙述题==：
      "流水线技术缩短了每条指令的执行时间" —— ==错==。
      "流水线技术提高了 CPU 的吞吐率" —— ==对==。
    ` },

    { t: 'code', id: 'pipeline-reg', title: '流水寄存器：段与段之间的"隔板"', lang: '',
      note: '没有它，第 2 条指令的取指结果会立刻冲掉第 1 条的',
      c: String.raw`
          IF  ┃  ID  ┃  EX  ┃ MEM  ┃  WB
              ┃      ┃      ┃      ┃
           IF/ID  ID/EX  EX/MEM MEM/WB
              ┃      ┃      ┃      ┃
              └─ 每个隔板都是一组寄存器，在时钟边沿把本段的结果锁存下来

        隔板里存什么：
          ① 数据    —— 指令本身、读出的寄存器值、ALU 结果、访存数据
          ② 控制信号 —— 这条指令后续各段要用的信号，跟着它一起往下流
                        （见 co/cpu/control 的"控制器被拆散了"）
          ③ PC 相关 —— 分支目标地址、返回地址

        ★ 流水寄存器让【每一段只需要关心自己这一拍】，
          段与段之间不再有时序耦合 —— 这正是流水线能成立的物理基础。
      ` },

    { t: 'key', id: 'five-stages', title: '经典五段与它们各自要做的事', c: String.raw`
      | 段 | 全称 | 干什么 | 用到的部件 |
      |---|---|---|---|
      | **IF** | Instruction Fetch | 按 $\texttt{PC}$ 取指令，$\texttt{PC}+4$ | ==指令存储器==、加法器 |
      | **ID** | Instruction Decode | 译码，==读寄存器堆==，扩展立即数 | 控制器、==寄存器堆（读）== |
      | **EX** | Execute | ALU 运算 / ==算访存地址== / 算分支目标 | ==ALU== |
      | **MEM** | Memory | ==访问数据存储器==（只有 load/store 用） | ==数据存储器== |
      | **WB** | Write Back | 把结果==写回寄存器堆== | ==寄存器堆（写）== |

      ==注意 EX 段的三副面孔==：对 R 型指令它做运算，对 load/store 它算有效地址，
      对分支指令它算目标地址并判断条件。==同一个 ALU，三种用法==。

      **哪些段是"空转"的**：R 型指令的 MEM 段什么也不做，
      但==它仍然要占用一拍往下流==。
      ==不能跳过==，否则后面指令的 WB 会撞上它 —— 那就是结构冒险了。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'metrics', c: '二、三个性能指标（公式必须默写得出）' },

    { t: 'key', id: 'formulas', title: '★★ 吞吐率、加速比、效率', c: String.raw`
      设流水线有 $k$ 段，各段时间均为 $\Delta t$，连续处理 $n$ 条指令。

      **总时间**（这是一切的起点）：

      $$T_k = \underbrace{k\,\Delta t}_{\text{第 1 条走完全程}}
      + \underbrace{(n-1)\Delta t}_{\text{其余每条只多花 1 拍}}
      = (k+n-1)\,\Delta t$$

      **① 吞吐率**（单位时间完成的指令数）

      $$TP = \frac{n}{T_k} = \frac{n}{(k+n-1)\Delta t}
      \qquad\Longrightarrow\qquad TP_{\max}=\frac{1}{\Delta t}$$

      **② 加速比**（比不用流水线快多少）

      $$S = \frac{T_0}{T_k} = \frac{nk\,\Delta t}{(k+n-1)\Delta t} = \frac{nk}{k+n-1}
      \qquad\Longrightarrow\qquad S_{\max}=k$$

      **③ 效率**（时空图里"有用面积"占的比例）

      $$E = \frac{nk\,\Delta t}{k(k+n-1)\Delta t} = \frac{n}{k+n-1}
      \qquad\Longrightarrow\qquad E_{\max}=1$$

      **三者的关系（记住这个就不必背三个公式）**：

      $$E = \frac{S}{k} = TP\cdot\Delta t$$

      ==三个指标的分母全是 $k+n-1$==，差别只在分子。
      ==算出一个，另外两个直接换算。==
    ` },

    { t: 'warn', id: 'formula-scope', title: '★★ 上面那组公式的适用条件（不看清会算出自相矛盾的答案）', c: String.raw`
      $S=\dfrac{nk}{k+n-1}$ 和 $E=\dfrac{n}{k+n-1}$ 这两个式子，
      ==只在"各段时间完全相等、且不计流水寄存器开销"时成立==。
      因为它们的推导用了 $T_0=nk\,\Delta t$ 这一步。

      **各段不等时，必须退回定义式**：

      $$S = \frac{T_0}{T_k},\qquad
      E = \frac{\text{有效面积}}{\text{总面积}} = \frac{T_0}{k\cdot T_k} = \frac{S}{k}$$

      其中 $T_0=n\sum\Delta t_i$（见[下面](#/co/cpu/pipeline?at=unequal-stages)）。

      ==$E=S/k$ 永远成立，$E=n/(k+n-1)$ 只是它在等长情形下的特例。==

      **对照一下[例题](#/co/cpu/pipeline?at=ex-metrics)就知道差多少**：
      那题各段不等（$80/60/100/60/80$，另加 $10$ 的寄存器延迟），

      | 算法 | 结果 | 对不对 |
      |---|---|---|
      | $E=S/k=3.32/5$ | $\mathbf{66.4\%}$ | ==✅ 正确== |
      | $E=n/(k+n-1)=100/104$ | $96.2\%$ | ==❌ 错==，前提不成立 |

      ==差了 $30$ 个百分点==。
      考场上的判断动作只有一个：==先看各段时间是不是全都一样==，
      不一样就老老实实用定义式。
    ` },

    { t: 'key', id: 'why-k-n-1', title: '$k+n-1$ 是怎么来的（别背，一秒推出来）', c: String.raw`
      看[时空图](#/co/cpu/pipeline?at=overlap)最后一条指令 $\texttt{I}_n$ 什么时候完成：

      - 它在第 $n$ 拍进入流水线（前面 $n-1$ 条各占一拍）；
      - 进去之后还要走 $k$ 段，所以在第 $n-1+k$ 拍完成。

      $$T_k = (n-1+k)\,\Delta t$$

      **等价的另一种看法**（画时空图时更直观）：

      $$\underbrace{(k-1)\Delta t}_{\text{装入：填满流水线}}
      + \underbrace{n\,\Delta t}_{\text{满载：每拍出一条}}
      = (k+n-1)\Delta t$$

      ==装入时间和排空时间都是 $(k-1)\Delta t$==，这两个量单独也会被问。
    ` },

    { t: 'warn', id: 'unequal-stages', title: '★ 各段时间不相等怎么办', c: String.raw`
      上面所有公式的前提是==各段时间相等==。实际上不可能，于是：

      $$\Delta t = \max\{\Delta t_1,\Delta t_2,\ldots,\Delta t_k\} \ +\ \underbrace{\Delta t_{\text{流水寄存器}}}_{\text{题目给了才加}}$$

      ==时钟周期由最慢的那一段（瓶颈段）决定==，其余段都在等它 —— 这正是
      [关键路径](#/co/cpu/datapath?at=critical-path)那条约束在流水线上的体现。

      **消除瓶颈的两种手段**（可能考简答）：

      | 手段 | 怎么做 | 代价 |
      |---|---|---|
      | **细分瓶颈段** | 把最慢的那段再切成两段 | ==流水线变深==，分支惩罚变大 |
      | **重复设置瓶颈段** | 并联多个相同部件轮流用 | ==硬件量翻倍== |

      **一个必须算清的量**：各段不等时，==不用流水线的总时间是各段之和==

      $$T_0 = n\sum_{i=1}^{k}\Delta t_i \quad\ne\quad nk\,\Delta t$$

      ==这里最容易出错==：算加速比时分子要用$\sum\Delta t_i$，
      而不是"$k\times$时钟周期"。
    ` },

    { t: 'example',
      id: 'ex-metrics',
      title: '吞吐率、加速比、效率的基本计算',
      source: '408 基础必会',
      level: 2,
      problem: String.raw`
        某流水线共 $5$ 段，各段所需时间分别为 $\texttt{80ns}$、$\texttt{60ns}$、
        $\texttt{100ns}$、$\texttt{60ns}$、$\texttt{80ns}$，
        流水寄存器的延迟为 $\texttt{10ns}$。连续输入 $100$ 条指令。

        **(1)** 流水线的时钟周期是多少？
        **(2)** 完成这 $100$ 条指令需要多长时间？
        **(3)** 吞吐率、加速比、效率各是多少？
      `,
      idea: String.raw`
        (1) ==时钟周期取最慢那段，再加流水寄存器延迟==，不是取平均。

        (3) 加速比的分子是"不用流水线的时间"。
        ==这里是本题的第一个坑==：不用流水线时，一条指令的时间是==各段时间之和==
        $80+60+100+60+80=380\ \texttt{ns}$，
        ==而不是 $5\times110=550\ \texttt{ns}$== ——
        不用流水线就不需要流水寄存器，也不需要把每段都凑成 $110$。

        ==第二个坑在效率==：本题各段不等，
        ==不能套 $E=n/(k+n-1)$==，必须用 $E=S/k$，
        见[适用条件](#/co/cpu/pipeline?at=formula-scope)。
      `,
      solution: String.raw`
        **(1) 时钟周期**

        $$\Delta t = \max\{80,60,100,60,80\} + 10 = 100+10 = \boxed{110\ \texttt{ns}}$$

        **(2) 总时间**

        $$T_k = (k+n-1)\Delta t = (5+100-1)\times110 = 104\times110 = \boxed{11440\ \texttt{ns}}$$

        **(3) 三个指标**

        吞吐率：

        $$TP = \frac{n}{T_k} = \frac{100}{11440\ \texttt{ns}} \approx 8.74\times10^{6}\ \text{条/秒} \approx \boxed{8.74\ \text{MIPS}}$$

        加速比（不用流水线时一条指令需 $80+60+100+60+80=380\ \texttt{ns}$）：

        $$T_0 = 100\times380 = 38000\ \texttt{ns}$$
        $$S = \frac{T_0}{T_k} = \frac{38000}{11440} \approx \boxed{3.32}$$

        效率：

        $$E = \frac{S}{k} = \frac{3.32}{5} \approx \boxed{66.4\%}$$
      `,
      comment: String.raw`
        **加速比只有 $3.32$，离理论上限 $5$ 差得远，损失在哪？**

        | 损失来源 | 有多少 |
        |---|---|
        | ==瓶颈段拖累==：四个快段被凑成 $100\ \texttt{ns}$ | 每拍浪费 $(100-80)+(100-60)\times2+(100-80)=120\ \texttt{ns}$ |
        | ==流水寄存器开销==：每段多 $10\ \texttt{ns}$ | 每拍多付 $5\times10=50\ \texttt{ns}$ |
        | ==装入排空==：$n=100$ 还不够大 | $(k-1)/(k+n-1)=4/104\approx3.8\%$ |

        ==前两项是"段划分不均 + 寄存器开销"，这才是大头==，
        而不是很多人第一反应的"装入排空"。

        **如果各段时间相等（都是 $76\ \texttt{ns}$，总和仍是 $380$）会怎样**：

        $$\Delta t = 76+10=86,\quad T_k=104\times86=8944,\quad S=\frac{38000}{8944}\approx4.25$$

        ==加速比从 $3.32$ 提到 $4.25$== —— 这就是为什么
        ==流水线设计的第一要务是把各段切得尽量均匀==。

        **量级自查**：$S$ 必然满足 $1<S<k$，$E=S/k$ 必然在 $0\sim1$ 之间。
        算出 $S>k$ 或 $E>1$，一定是把 $T_0$ 算成 $nk\Delta t$ 了。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'hazards', c: '三、三种冒险：让指令"同时走"必然撞上的三堵墙' },

    { t: 'key', id: 'hazard-overview', title: '★ 三种冒险的本质各不相同', c: String.raw`
      | 冒险 | 别名 | 本质是什么在冲突 | 一句话 |
      |---|---|---|---|
      | **结构冒险** | 资源冲突 | ==硬件部件不够用== | 两条指令同一拍要用同一个部件 |
      | **数据冒险** | 数据相关 | ==数据还没准备好== | 后一条要用的值，前一条还没算完/还没写回 |
      | **控制冒险** | 控制相关 | ==不知道下一条该取谁== | 分支结果没出来，已经取错了后续指令 |

      ==三者的解决思路也各不相同==，别混着记：

      $$\text{结构冒险}\to\textbf{加硬件}\qquad
      \text{数据冒险}\to\textbf{加通路（转发）}\qquad
      \text{控制冒险}\to\textbf{猜（预测）}$$
    ` },

    /* ---------------- 结构冒险 ---------------- */
    { t: 'h', id: 'structural', c: '3.1 结构冒险' },

    { t: 'diagram', id: 'struct-conflict', title: '典型冲突：取指与访存撞在一起',
      note: '红色那一列就是冲突点',
      caption: String.raw`只要==指令和数据放在同一个存储器==里，这一拍就只能满足一个人。
        解法要么把存储器一分为二（哈佛结构 / 分开的指令 Cache 与数据 Cache），要么让后来的那条停一拍。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 148" role="img" aria-label="第 4 拍 I1 访存与 I4 取指撞在同一个存储器上">
  <text class="lb" x="101" y="18" text-anchor="middle">1</text>
  <text class="lb" x="165" y="18" text-anchor="middle">2</text>
  <text class="lb" x="229" y="18" text-anchor="middle">3</text>
  <text class="lb" x="293" y="18" text-anchor="middle">4</text>
  <text class="lb" x="357" y="18" text-anchor="middle">5</text>
  <text class="lb" x="421" y="18" text-anchor="middle">6</text>
  <text class="lb" x="485" y="18" text-anchor="middle">7</text>
  <text class="cap" x="62" y="41" text-anchor="end" dominant-baseline="central">I1</text>
  <g class="n k"><rect x="70" y="28" width="61" height="26" rx="3"/><text class="bt sm" x="100.5" y="41.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="134" y="28" width="61" height="26" rx="3"/><text class="bt sm" x="164.5" y="41.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="198" y="28" width="61" height="26" rx="3"/><text class="bt sm" x="228.5" y="41.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n r"><rect x="262" y="28" width="61" height="26" rx="3"/><text class="bt sm" x="292.5" y="41.0" text-anchor="middle" dominant-baseline="central">MEM</text></g>
  <g class="n m"><rect x="326" y="28" width="61" height="26" rx="3"/><text class="bt sm" x="356.5" y="41.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="62" y="75" text-anchor="end" dominant-baseline="central">I4</text>
  <g class="n r"><rect x="262" y="62" width="61" height="26" rx="3"/><text class="bt sm" x="292.5" y="75.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="326" y="62" width="61" height="26" rx="3"/><text class="bt sm" x="356.5" y="75.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="390" y="62" width="61" height="26" rx="3"/><text class="bt sm" x="420.5" y="75.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="454" y="62" width="61" height="26" rx="3"/><text class="bt sm" x="484.5" y="75.0" text-anchor="middle" dominant-baseline="central">MEM</text></g>
  <path class="gd" d="M293,24 V92"/>
  <text class="lb" x="293" y="108" text-anchor="middle">第 4 拍</text>
  <text class="cap" x="0" y="132">I1 要访问【数据存储器】，I4 要访问【指令存储器】——只有一个存储器就撞车</text>
</svg>` },

    { t: 'key', id: 'struct-fix', title: '三种解决办法', c: String.raw`
      | 办法 | 怎么做 | 代价 |
      |---|---|---|
      | **① 停顿** | 让后面那条指令暂停一拍（插气泡） | ==性能下降== |
      | **② 分离存储器** | ==指令存储器与数据存储器分开==（哈佛结构） | 硬件翻倍 |
      | **③ 寄存器堆前写后读** | ==前半周期写、后半周期读==，一拍内读写互不干扰 | 几乎无代价 |

      **②正是[单周期 CPU 必须分离存储器](#/co/cpu/datapath?at=why-harvard)的同一条理由**，
      只不过在单周期里是"一条指令一拍内要访存两次"，
      在流水线里是"两条不同指令在同一拍各访存一次"。==根子上都是"部件一拍只能用一次"。==

      **③ 值得单独记**：寄存器堆在 ID 段被读、在 WB 段被写，
      当两条指令的 ID 和 WB 撞在同一拍时本该冲突。
      让写发生在时钟前半周期、读发生在后半周期，==就在一拍内错开了==，
      而且顺带解决了[距离为 3 的数据相关](#/co/cpu/pipeline?at=distance-table)。

      ==现代 CPU 里 Cache 分成 I-Cache 和 D-Cache，正是办法 ② 的落地。==
    ` },

    /* ---------------- 数据冒险 ---------------- */
    { t: 'h', id: 'data-hazard', c: '3.2 数据冒险（重点中的重点）' },

    { t: 'compare', id: 'three-deps', title: '三种数据相关（名字别背反）',
      cols: ['类型', '英文', '含义', '顺序流水线里会不会出现'],
      rows: [
        ['**写后读**', '==RAW==（Read After Write）', '前一条要==写==，后一条要==读==同一个寄存器', '==会==，这是唯一真正的相关'],
        ['**读后写**', 'WAR（Write After Read）', '前一条要读，后一条要写', '==不会==，只有乱序执行才有'],
        ['**写后写**', 'WAW（Write After Write）', '两条都要写同一个寄存器', '==不会==，只有乱序执行才有'],
      ] },

    { t: 'warn', id: 'raw-only', title: '★ 为什么顺序流水线只有 RAW', c: String.raw`
      在顺序流水线里，==所有指令都按同一顺序经过同样的段==：
      读寄存器一律在 ID 段，写寄存器一律在 WB 段。

      - **WAR**：前一条在 ID 读（早），后一条在 WB 写（晚），
        ==后一条的 WB 永远晚于前一条的 ID==，天然不冲突；
      - **WAW**：两条都在 WB 写，而 WB 的先后==就是指令的先后==，天然有序；
      - **RAW**：前一条在 WB 写（晚），后一条在 ID 读（早），
        ==后一条读的时候前一条还没写==——==这才是真问题==。

      ==所以 408 讨论数据冒险时，默认就是 RAW。==
      WAR 和 WAW 叫**名相关**（假相关）—— 它们==不是真的要传数据==，
      只是恰好用了同一个寄存器名字，
      [寄存器重命名](#/co/cpu/pipeline?at=ooo)可以直接消掉它们。
    ` },

    { t: 'diagram', id: 'raw-example', title: '一个 RAW 冒险的完整时空图（无转发）',
      note: '$\\texttt{I1}$ 第 5 拍才写回，$\\texttt{I2}$ 第 3 拍就要读',
      caption: String.raw`✱ 是气泡（bubble / stall）。停两拍之后，$\texttt{I2}$ 的译码段正好落在第 5 拍：
        ==寄存器堆前半周期写、后半周期读==，于是刚好读到新值。
        如果没有"前写后读"这个前提，就得停 3 拍。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 226" role="img" aria-label="RAW 冒险：不停顿会读到旧值，停顿两拍后正确">
  <text class="cap" x="0" y="13">① 不停顿：I2 在第 3 拍读 R1，读到的是旧值</text>
  <text class="lb" x="98" y="28" text-anchor="middle">1</text>
  <text class="lb" x="156" y="28" text-anchor="middle">2</text>
  <text class="lb" x="214" y="28" text-anchor="middle">3</text>
  <text class="lb" x="272" y="28" text-anchor="middle">4</text>
  <text class="lb" x="330" y="28" text-anchor="middle">5</text>
  <text class="lb" x="388" y="28" text-anchor="middle">6</text>
  <text class="lb" x="446" y="28" text-anchor="middle">7</text>
  <text class="lb" x="504" y="28" text-anchor="middle">8</text>
  <text class="cap" x="62" y="48" text-anchor="end" dominant-baseline="central">I1</text>
  <g class="n k"><rect x="70" y="36" width="55" height="24" rx="3"/><text class="bt sm" x="97.5" y="48.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="128" y="36" width="55" height="24" rx="3"/><text class="bt sm" x="155.5" y="48.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="186" y="36" width="55" height="24" rx="3"/><text class="bt sm" x="213.5" y="48.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="244" y="36" width="55" height="24" rx="3"/><text class="bt sm" x="271.5" y="48.0" text-anchor="middle" dominant-baseline="central">MEM</text></g>
  <g class="n m"><rect x="302" y="36" width="55" height="24" rx="3"/><text class="bt sm" x="329.5" y="48.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="62" y="78" text-anchor="end" dominant-baseline="central">I2</text>
  <g class="n k"><rect x="128" y="66" width="55" height="24" rx="3"/><text class="bt sm" x="155.5" y="78.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n r"><rect x="186" y="66" width="55" height="24" rx="3"/><text class="bt sm" x="213.5" y="78.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <text class="lb" x="248" y="82">✗ 此刻 R1 还是旧值 —— I1 要到第 5 拍才写回</text>

  <text class="cap" x="0" y="128">② 停顿 2 拍（寄存器堆「前写后读」）</text>
  <text class="cap" x="62" y="160" text-anchor="end" dominant-baseline="central">I1</text>
  <g class="n k"><rect x="70" y="148" width="55" height="24" rx="3"/><text class="bt sm" x="97.5" y="160.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="128" y="148" width="55" height="24" rx="3"/><text class="bt sm" x="155.5" y="160.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="186" y="148" width="55" height="24" rx="3"/><text class="bt sm" x="213.5" y="160.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="244" y="148" width="55" height="24" rx="3"/><text class="bt sm" x="271.5" y="160.0" text-anchor="middle" dominant-baseline="central">MEM</text></g>
  <g class="n m"><rect x="302" y="148" width="55" height="24" rx="3"/><text class="bt sm" x="329.5" y="160.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="cap" x="62" y="190" text-anchor="end" dominant-baseline="central">I2</text>
  <g class="n k"><rect x="128" y="178" width="55" height="24" rx="3"/><text class="bt sm" x="155.5" y="190.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n m"><rect x="186" y="178" width="55" height="24" rx="3"/><text class="bt sm" x="213.5" y="190.0" text-anchor="middle" dominant-baseline="central">✱</text></g>
  <g class="n m"><rect x="244" y="178" width="55" height="24" rx="3"/><text class="bt sm" x="271.5" y="190.0" text-anchor="middle" dominant-baseline="central">✱</text></g>
  <g class="n g"><rect x="302" y="178" width="55" height="24" rx="3"/><text class="bt sm" x="329.5" y="190.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="360" y="178" width="55" height="24" rx="3"/><text class="bt sm" x="387.5" y="190.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="418" y="178" width="55" height="24" rx="3"/><text class="bt sm" x="445.5" y="190.0" text-anchor="middle" dominant-baseline="central">MEM</text></g>
  <g class="n m"><rect x="476" y="178" width="55" height="24" rx="3"/><text class="bt sm" x="503.5" y="190.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <path class="gd" d="M330,144 V206"/>
  <text class="lb" x="330" y="220" text-anchor="middle">第 5 拍：I1 写 / I2 读，✓</text>
</svg>` },

    { t: 'compare', id: 'distance-table', title: '★ 相关距离与停顿拍数（结论要能直接说出来）',
      cols: ['相关距离', '例子', '无转发（前写后读）', '有转发'],
      rows: [
        ['**距离 1**（紧邻）', 'I1 写 R1，I2 读 R1', '==停 2 拍==', '==0 拍==（EX→EX 转发）'],
        ['**距离 2**（隔一条）', 'I1 写 R1，I3 读 R1', '==停 1 拍==', '==0 拍==（MEM→EX 转发）'],
        ['**距离 3**（隔两条）', 'I1 写 R1，I4 读 R1', '==0 拍==（WB 与 ID 同拍，前写后读）', '0 拍'],
        ['**load-use**', 'I1 是 lw 写 R1，I2 读 R1', '停 2 拍', '==停 1 拍==，⚠ 转发也救不全'],
      ] },

    { t: 'key', id: 'forwarding', title: '★★ 转发（旁路）：不等写回，直接把结果送过去', c: String.raw`
      观察 RAW 的时空图会发现一件事：
      ==$\texttt{I1}$ 的结果在第 3 拍（EX 段末）就已经算出来了==，
      只是要等到第 5 拍才写进寄存器。而 $\texttt{I2}$ 的 EX 段在第 4 拍才开始。

      ==结果早就有了，只是"存在错误的地方"（在流水寄存器里，不在寄存器堆里）。==

      于是解法不是等，而是[在数据通路上多接一根线](#/co/cpu/datapath?at=forwarding-preview)：
      把 $\texttt{EX/MEM}$ 流水寄存器的输出==直接接回 ALU 的输入端==。

      ~~~
      拍     1    2    3    4    5
      I1    IF   ID   EX  MEM   WB
                      └────┐
                           ▼ 转发
      I2         IF   ID   EX  MEM   WB
                           ↑ 第 4 拍 ALU 直接用上 I1 的结果，一拍不停
      ~~~

      **两条转发通路**：

      | 通路 | 解决 | 从哪转到哪 |
      |---|---|---|
      | $\texttt{EX/MEM}\to\texttt{EX}$ | 距离 1 | 上一条的 ALU 结果 $\to$ 本条的 ALU 输入 |
      | $\texttt{MEM/WB}\to\texttt{EX}$ | 距离 2 | 上上条的结果（或访存数据）$\to$ 本条的 ALU 输入 |

      ==转发是流水线里性价比最高的优化==：几根线加一个多路选择器，
      就把绝大多数数据冒险的停顿降到 0。
    ` },

    { t: 'warn', id: 'load-use', title: '★★ load-use 冒险：转发也救不回来的那一拍', c: String.raw`
      这是数据冒险里==唯一必考的例外==，几乎每年都以某种形式出现。

      ~~~
      I1:  lw   R1, 0(R2)      ← 数据要到【MEM 段末】才拿到
      I2:  add  R3, R1, R4     ← 【EX 段初】就要用 R1

      拍     1    2    3    4    5
      I1    IF   ID   EX  MEM   WB
                           └─ 第 4 拍末才拿到数据
      I2         IF   ID   EX ←─ 第 4 拍初就要用
                           ↑ 差了【一拍】，转发也来不及
      ~~~

      **根本原因**：==转发能把数据"送到别的地方"，但送不回"过去的时间"。==
      $\texttt{ADD}$ 的结果在 EX 段末产生、下一条 EX 段初要用 —— 刚好接得上；
      $\texttt{LOAD}$ 的结果在 MEM 段末才产生，==比 ADD 晚了整整一段==，接不上。

      **所以必须停 1 拍**：

      ~~~
      拍     1    2    3    4    5    6
      I1    IF   ID   EX  MEM   WB
                            └────┐
      I2         IF   ID    ✱    EX  MEM   WB
                                 ↑ MEM/WB → EX 转发，现在来得及了
      ~~~

      **两种应对**：

      - **硬件**：设置 ==load-use 冒险检测单元==，自动插一拍气泡；
      - **软件**：编译器==把一条无关指令调度到 lw 和 add 之间==，
        把气泡填成有用的工作 —— ==这是编译优化里最经典的一招==。

      ==MIPS 早期甚至规定"lw 后面那条指令不许用它的结果"，
      把责任完全推给编译器（load delay slot）==。
    ` },

    { t: 'key', id: 'data-fix', title: '数据冒险的四种解决办法（简答题按这个答）', c: String.raw`
      | 办法 | 层次 | 说明 |
      |---|---|---|
      | **① 硬件阻塞 stall** | 硬件 | 检测到相关就插气泡，==最简单也最慢== |
      | **② 软件插入 NOP** | 软件 | 编译器在相关指令间填 $\texttt{NOP}$，==硬件可以不做检测== |
      | **③ 数据转发 / 旁路** | 硬件 | ==主力手段==，把绝大多数停顿降到 0 |
      | **④ 编译器指令调度** | 软件 | ==重排指令顺序==，用无关指令填住必须的气泡 |

      ==③ 和 ④ 是配合使用的==：转发解决大部分，
      剩下 load-use 那一拍交给编译器调度去填。
    ` },

    /* ---------------- 控制冒险 ---------------- */
    { t: 'h', id: 'control-hazard', c: '3.3 控制冒险' },

    { t: 'diagram', id: 'branch-penalty', title: '分支惩罚：判断出结果之前，已经取错了几条',
      note: '红格 = 已经进流水线又被作废的指令',
      caption: String.raw`==分支惩罚 = 判出结果所在的段号 $-\;1$==。
        所以优化方向只有一个：**把"转不转"这件事往前挪**——
        提前到 ID 段判断，惩罚立刻从 3 拍降到 1 拍。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 246" role="img" aria-label="分支在 MEM 段判断惩罚三拍，提前到 ID 段判断只惩罚一拍">
  <text class="cap" x="0" y="14">① 分支在 MEM 段（第 4 拍）才判出来 —— 惩罚 3 拍</text>
  <text class="cap" x="62" y="42" text-anchor="end" dominant-baseline="central">I1</text>
  <g class="n k"><rect x="70" y="30" width="61" height="24" rx="3"/><text class="bt sm" x="100.5" y="42.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="134" y="30" width="61" height="24" rx="3"/><text class="bt sm" x="164.5" y="42.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="198" y="30" width="61" height="24" rx="3"/><text class="bt sm" x="228.5" y="42.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="262" y="30" width="61" height="24" rx="3"/><text class="bt sm" x="292.5" y="42.0" text-anchor="middle" dominant-baseline="central">MEM</text></g>
  <text class="cap" x="62" y="70" text-anchor="end" dominant-baseline="central">I2</text>
  <g class="n r"><rect x="134" y="58" width="61" height="24" rx="3"/><text class="bt sm" x="164.5" y="70.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n r"><rect x="198" y="58" width="61" height="24" rx="3"/><text class="bt sm" x="228.5" y="70.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n r"><rect x="262" y="58" width="61" height="24" rx="3"/><text class="bt sm" x="292.5" y="70.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <text class="cap" x="62" y="98" text-anchor="end" dominant-baseline="central">I3</text>
  <g class="n r"><rect x="198" y="86" width="61" height="24" rx="3"/><text class="bt sm" x="228.5" y="98.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n r"><rect x="262" y="86" width="61" height="24" rx="3"/><text class="bt sm" x="292.5" y="98.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <text class="cap" x="62" y="126" text-anchor="end" dominant-baseline="central">I4</text>
  <g class="n r"><rect x="262" y="114" width="61" height="24" rx="3"/><text class="bt sm" x="292.5" y="126.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <text class="lb" x="336" y="150">已经取进来的三条全部作废</text>

  <text class="cap" x="0" y="164">② 把判断提前到 ID 段（第 2 拍）—— 惩罚 1 拍</text>
  <text class="cap" x="62" y="192" text-anchor="end" dominant-baseline="central">I1</text>
  <g class="n k"><rect x="70" y="180" width="61" height="24" rx="3"/><text class="bt sm" x="100.5" y="192.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="134" y="180" width="61" height="24" rx="3"/><text class="bt sm" x="164.5" y="192.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <text class="cap" x="62" y="220" text-anchor="end" dominant-baseline="central">I2</text>
  <g class="n r"><rect x="134" y="208" width="61" height="24" rx="3"/><text class="bt sm" x="164.5" y="220.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <text class="lb" x="208" y="228">只作废一条</text>
</svg>` },

    { t: 'key', id: 'branch-fix', title: '控制冒险的四类解决办法', c: String.raw`
      **① 提前判断、提前生成转移地址** —— ==最直接的一招==

      把"比较两个寄存器是否相等"的逻辑和"算转移目标地址"的加法器
      ==从 EX 段挪到 ID 段==，分支惩罚立刻从 3 拍降到 1 拍。
      代价是 ID 段变长，可能拖慢时钟周期。

      **② 分支预测** —— ==现代 CPU 的主力==

      | 类型 | 做法 | 准确率 |
      |---|---|---|
      | **静态预测** | 总是猜"不转移" / 总是猜"转移" / ==后向转移猜转移==（BTFN） | $60\%\sim80\%$ |
      | **动态预测** | ==根据这条分支的历史行为来猜==（1 位 / 2 位预测器、BHT、BTB） | $>90\%$ |

      **③ 延迟槽（delay slot）** —— MIPS 的特色做法

      ==规定分支指令后面那一条无论如何都要执行==，
      由编译器往里塞一条"跳不跳都得做"的有用指令。
      ==把惩罚变成了免费的一拍==。缺点是把流水线细节暴露给了指令集，
      流水线一改就不兼容，==现代设计已经抛弃==。

      **④ 双路预取** —— 转移成功和不成功两条路的指令==都取进来==，
      判断出来后丢掉一路。硬件代价大，用得少。
    ` },

    { t: 'key', id: 'two-bit', title: '★ 为什么 2 位预测器明显好于 1 位（好题材）', c: String.raw`
      考虑一个循环 $10$ 次的分支：==连续 9 次转移，最后 1 次不转移==。

      **1 位预测器**（记住上次的结果，下次照抄）：

      ~~~
      第 1 次进入循环   预测:不转移  实际:转移    ✗ 错（初始状态）
      第 2~9 次        预测:转移    实际:转移    ✓
      第 10 次         预测:转移    实际:不转移  ✗ 错（循环结束）
      ── 下次再进入这个循环 ──
      第 1 次          预测:不转移  实际:转移    ✗ 又错！
      ~~~

      ==每轮循环错 2 次==：一次在循环出口，一次在下一轮的入口。
      ==循环出口那次错，把预测器"带偏"了，导致下一轮开头再错一次。==

      **2 位预测器**（饱和计数器，要连错两次才改变预测）：

      ~~~
      状态机：  强不转移 ⇄ 弱不转移 ⇄ 弱转移 ⇄ 强转移
                  00        01        10       11
                            └─ 预测不转移 ─┘└─ 预测转移 ─┘

      循环中处于"强转移"状态：
        第 10 次预测错 → 状态退到"弱转移"，【但仍然预测转移】
        下一轮第 1 次   → 预测转移，实际转移  ✓ 对了！
      ~~~

      ==每轮只错 1 次==，错误率直接减半。

      **这背后的思想很通用**：==给预测加一点"惯性"，
      不让单次异常立刻推翻长期规律==。
      同样的滞回思想在 Cache 替换策略、TCP 拥塞控制里都能看到。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'cpi-calc', c: '四、有冒险时的性能计算' },

    { t: 'key', id: 'cpi-formula', title: '实际 CPI 的算法', c: String.raw`
      $$\text{CPI}_{\text{实际}} = \underbrace{1}_{\text{理想}}
      + \underbrace{\sum_i (\text{该类冒险的发生频率}\times\text{每次的停顿拍数})}_{\text{各类冒险带来的额外拍数}}$$

      $$\text{MIPS} = \frac{f}{\text{CPI}\times10^6},\qquad
      \text{程序执行时间} = \frac{\text{指令数}\times\text{CPI}}{f}$$

      **注意**："发生频率"要==逐层相乘==：
      比如 load 指令占 $20\%$、其中 $50\%$ 会引发 load-use，
      那么频率是 $0.20\times0.50=0.10$，==不是 $0.20$==。
    ` },

    { t: 'example',
      id: 'ex-cpi',
      title: '带冒险的流水线 CPI 与 MIPS',
      source: '408 常见计算',
      level: 3,
      problem: String.raw`
        某处理器采用五段流水线，主频 $500\ \text{MHz}$，理想情况下 $\text{CPI}=1$。
        已知：

        - $\texttt{load}$ 指令占 $20\%$，其后紧跟使用其结果的指令的概率为 $50\%$，
          每次引发 $1$ 个时钟周期的停顿；
        - 条件转移指令占 $15\%$，分支预测错误率为 $30\%$，
          每次预测错误损失 $3$ 个时钟周期；
        - 其余冒险已由转发完全消除。

        求 **(1)** 实际 CPI　**(2)** MIPS 值　**(3)** 相对理想流水线的性能损失百分比。
      `,
      idea: String.raw`
        套[公式](#/co/cpu/pipeline?at=cpi-formula)，唯一要小心的是==频率要逐层相乘==：

        - load-use 的频率不是 $20\%$，是 $20\%\times50\%$；
        - 预测错误的频率不是 $15\%$，是 $15\%\times30\%$。

        ==每一层百分比都在"筛掉一部分"==，漏乘一层，答案就偏大一倍左右。
      `,
      solution: String.raw`
        **(1) 实际 CPI**

        load-use 停顿：

        $$0.20\times0.50\times1 = 0.10\ \text{拍/指令}$$

        分支预测错误：

        $$0.15\times0.30\times3 = 0.135\ \text{拍/指令}$$

        $$\text{CPI} = 1 + 0.10 + 0.135 = \boxed{1.235}$$

        **(2) MIPS**

        $$\text{MIPS} = \frac{f}{\text{CPI}\times10^6}
        = \frac{500\times10^{6}}{1.235\times10^{6}} \approx \boxed{404.9\ \text{MIPS}}$$

        **(3) 性能损失**

        理想流水线 $\text{CPI}=1$，即 $500\ \text{MIPS}$：

        $$\frac{1.235-1}{1.235} \approx 19.0\%\quad(\text{相对实际})$$

        或按常见口径（相对理想性能）：

        $$1-\frac{1}{1.235} \approx \boxed{19.0\%}$$
      `,
      comment: String.raw`
        **看清楚谁是大头**：分支预测错误贡献了 $0.135$，
        比 load-use 的 $0.10$ ==还多==，
        尽管分支指令（$15\%$）比 load 指令（$20\%$）还少。

        ==原因是"每次的代价"差了 3 倍==（$3$ 拍 vs $1$ 拍）。

        $$\text{冒险的总代价} = \text{频率}\times\textbf{每次代价}$$

        ==这解释了现代 CPU 为什么在分支预测上砸那么多硬件==：
        流水线越深，分支惩罚越大（要作废的指令越多），
        ==预测准确率每提高 1 个百分点，收益都很可观==。

        **反过来算一笔账**：若把预测准确率从 $70\%$ 提到 $95\%$：

        $$\text{CPI} = 1+0.10+0.15\times0.05\times3 = 1.1225$$

        ==CPI 从 $1.235$ 降到 $1.1225$，性能提升约 $10\%$==，
        而这只需要改进预测器，==不用动流水线的任何其他部分==。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'classify', c: '五、流水线的分类（了解即可，选择题偶尔考）' },

    { t: 'compare', id: 'classify-table', title: '四种分类维度',
      cols: ['分类依据', '类型', '含义'],
      rows: [
        ['**级别**', '部件功能级 / 处理机级 / 处理机间级', '在运算部件内部 / 在指令执行层面 / 在多处理机之间'],
        ['**功能**', '单功能 / 多功能', '只能完成一种运算 / ==同一条流水线可配置成不同功能=='],
        ['**连接方式**', '静态 / 动态', '同一时间只能按一种功能连接 / ==同一时间可有多种功能同时工作=='],
        ['**结构**', '线性 / 非线性', '各段串行连接不反馈 / ==存在反馈回路，某段被多次使用=='],
      ] },

    { t: 'key', id: 'multi-issue', title: '★ 超标量 / 超流水线 / VLIW（对比要清楚）', c: String.raw`
      基本流水线的 $\text{CPI}$ 下限是 $1$。要突破它，只能==一拍发射多条指令==。

      | | **超标量** Superscalar | **超流水线** Superpipeline | **VLIW** 超长指令字 |
      |---|---|---|---|
      | 怎么做 | ==配置多套功能部件==，一拍同时发射多条 | ==把每段再细分==，一个时钟内分时发射多条 | ==编译器把多个操作打包成一条长指令== |
      | 并行方式 | ==空间并行==（部件多） | ==时间并行==（段更细、频率更高） | 空间并行 |
      | 谁负责找并行 | ==硬件==（也可配合编译器） | 硬件 | ==编译器==，硬件不做调度 |
      | 硬件复杂度 | ==高==（要做相关检测与调度） | 中 | ==低==（把复杂度推给编译器） |
      | 典型代表 | 现代 x86 / ARM | 早期 MIPS R4000 | Itanium、部分 DSP |

      **三者都让 $\text{CPI}<1$**，所以性能改用 **IPC**（每周期指令数）衡量：

      $$\text{IPC} = \frac{1}{\text{CPI}}$$

      ==VLIW 的思路很诱人但实践中失败了==：
      编译器在编译期无法知道 Cache 会不会命中、分支会往哪走，
      ==而这些只有运行时才知道==。Itanium 的失利就是这个教训。
      ==硬件动态调度赢在"它能看到运行时的真实情况"。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'advanced', c: '六、略高于考纲' },

    { t: 'key', id: 'depth-limit', title: '① 流水线为什么不能无限加深', c: String.raw`
      加深流水线（增大 $k$）看起来能提高主频、提高吞吐率，但有三堵墙：

      **① 寄存器开销**（[关键路径](#/co/cpu/datapath?at=critical-path)那条约束）

      $$T_{\text{clk}} \ge \frac{T_{\text{总逻辑}}}{k} + \underbrace{t_{\text{clk-to-q}}+t_{\text{setup}}}_{\text{固定开销，不随 }k\text{ 缩小}}$$

      $k$ 越大，==固定开销占的比例越高==，收益递减。

      **② 分支惩罚随深度线性增长**

      流水线越深，分支判断出来时==已经取进来的错误指令越多==。
      $20$ 级流水线的一次预测失败可能损失十几拍。

      **③ 相关检测与转发网络的复杂度爆炸**

      段数翻倍，需要检测的相关组合==大致按平方增长==。

      **历史教训**：Pentium 4 把流水线做到 $31$ 级去冲主频，
      ==结果功耗和分支惩罚双双失控==，性能反而不如级数更少的对手。
      后来的架构（Core 系列）==把级数降回 $14$ 级左右==。
      ==这是"深度不是越大越好"最著名的一次实证。==
    ` },

    { t: 'key', id: 'ooo', title: '② 乱序执行与寄存器重命名', c: String.raw`
      顺序流水线遇到一次停顿，==后面所有指令都得跟着等==，
      哪怕它们和停顿的原因毫无关系。

      **乱序执行（out-of-order）**的思路：
      ==谁的操作数准备好了就让谁先执行==，只在最后"提交"时恢复原顺序。

      ~~~
      I1:  lw   R1, 0(R2)      ← Cache 未命中，要等很久
      I2:  add  R3, R1, R4     ← 依赖 I1，只能等
      I3:  sub  R5, R6, R7     ← 和 I1、I2 毫无关系，【为什么要等？】
      ~~~

      顺序执行时 $\texttt{I3}$ 白等；乱序执行让 $\texttt{I3}$ ==先做==。

      **但这样一来 WAR 和 WAW 就真的会出现了** ——
      这正是[名相关](#/co/cpu/pipeline?at=raw-only)在顺序流水线里不存在、
      在乱序里却必须处理的原因。

      **解决办法：寄存器重命名（register renaming）**

      ~~~
      原始代码                    重命名后
      I1:  add  R1, R2, R3        add  p10, p2, p3
      I2:  sub  R4, R1, R5        sub  p11, p10, p5
      I3:  add  R1, R6, R7        add  p12, p6, p7   ← 换个物理寄存器，WAW 消失
      ~~~

      ==体系结构寄存器（程序员看到的 R1）与物理寄存器（p10、p12）解耦==，
      硬件维护一张映射表。
      ==于是所有假相关全部消失，只剩真正的 RAW 需要处理。==

      **注意这个思想的普遍性**：==用"多准备几份资源 + 一张映射表"消除命名冲突==，
      和虚拟内存里"虚拟地址 → 物理地址"的页表是同一个套路。
    ` },

    { t: 'key', id: 'speculation', title: '③ 投机执行与 Spectre：预测的代价', c: String.raw`
      分支预测不只是"提前取指"，现代 CPU 会==沿着预测的方向真的把指令执行下去==，
      这叫**投机执行（speculative execution）**。
      预测错了就把结果全部作废 —— ==由[精确异常](#/co/cpu/exception?at=precise-def)
      那套机制保证作废得干干净净==。

      **但"干干净净"是有漏洞的**：
      被作废的指令==没有改变寄存器和内存，却改变了 Cache 的状态==。

      ~~~
      if (x < array_size) {           ← 故意训练预测器猜"成立"
          y = array2[array1[x] * 64]; ← 越界访问被投机执行了！
      }                                 结果作废，但【数据已经进了 Cache】
      ~~~

      攻击者再通过==测量访问时间==（命中快、未命中慢）反推出那个本不该读到的字节。
      这就是 **Spectre**（2018）。

      ==它的深刻之处在于：这不是某家厂商的实现 bug，
      而是"投机执行"这个思想本身的副作用==——
      几乎所有高性能 CPU 都中招。

      缓解手段之一正是[微码更新](#/co/cpu/control?at=x86-microcode)，
      ==这也是本章几页内容的一次闭环==：
      流水线为了性能而预测 $\to$ 预测产生可观测的副作用 $\to$ 用微码打补丁。
    ` },

    { t: 'key', id: 'amdahl', title: '④ 用 Amdahl 定律看清流水线的天花板', c: String.raw`
      $$S_{\text{总}} = \frac{1}{(1-p) + \dfrac{p}{S_{\text{局部}}}}$$

      其中 $p$ 是可被加速部分所占的比例。

      把它用在流水线上：==即使把加速比做到无穷大（$S_{\text{局部}}\to\infty$）==，

      $$S_{\text{总}} \le \frac{1}{1-p}$$

      **这解释了两件事**：

      1. ==流水线的 $S_{\max}=k$ 只是理论值==，
         实际还要被冒险、装入排空、段划分不均一层层打折；
      2. ==优化要挑占比大的部分下手==。
         [上面那道题](#/co/cpu/pipeline?at=ex-cpi)里，
         改进分支预测比改进 load-use 收益更大，==就是因为它的 $p$ 更大==。

      =="先看占比，再看能优化多少"，这是所有性能优化的第一原则。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '七、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **"流水线缩短了单条指令的执行时间"** —— ==错，它只提高吞吐率==，
         见[这里](#/co/cpu/pipeline?at=not-faster)。
      2. **算 $T_0$ 时用 $nk\Delta t$** —— 各段时间不等时，
         ==$T_0=n\sum\Delta t_i$==，见[这道题](#/co/cpu/pipeline?at=ex-metrics)。
      3. **时钟周期取平均值** —— ==取最长段（瓶颈段），还要加流水寄存器延迟==。
      4. **各段不等时仍然套 $E=n/(k+n-1)$** ——
         ==那个式子只在各段等长时成立==，一般情形要用 $E=S/k$，
         见[适用条件](#/co/cpu/pipeline?at=formula-scope)。
      4. **$k+n-1$ 记成 $k+n$ 或 $n-k+1$** ——
         推一遍最后一条指令什么时候完成就不会错，见[推导](#/co/cpu/pipeline?at=why-k-n-1)。
      5. **认为顺序流水线里三种相关都会出现** ——
         ==只有 RAW==，WAR/WAW 是乱序才有的名相关。
      6. **认为有了转发就没有数据停顿** ——
         ==load-use 仍要停 1 拍==，见[原因](#/co/cpu/pipeline?at=load-use)。
      7. **算冒险频率时漏乘一层百分比** ——
         "load 占 20%、其中 50% 引发冒险"，频率是 $0.1$ 不是 $0.2$。
      8. **把结构冒险和数据冒险混为一谈** ——
         ==结构是部件不够，数据是值没到==。
      9. **认为效率 $E$ 可以大于 1，或加速比 $S$ 可以大于 $k$** ——
         ==都不可能==，算出来超了一定是 $T_0$ 算错。
      10. **忘了 R 型指令也要占用 MEM 段** ——
          ==空转也要占一拍往下流==，否则会撞上后面指令的 WB。
      11. **认为超标量和超流水线是一回事** ——
          ==超标量是空间并行（多套部件），超流水线是时间并行（段更细）==。
      12. **认为分支惩罚是固定的 3 拍** ——
          ==取决于分支在哪一段判断出来==，提前到 ID 段就只剩 1 拍。
    ` },

    { t: 'md', c: String.raw`
      ---

      本章至此闭环：
      [数据通路](#/co/cpu/datapath?at=def) 提供了路，
      [控制器](#/co/cpu/control?at=the-whole-point) 提供了信号，
      流水线让多条指令同时走在这条路上，
      而 [异常与中断](#/co/cpu/exception?at=precise) 负责在出事时把这一切干净地停下来。
    ` },

  ],
});
