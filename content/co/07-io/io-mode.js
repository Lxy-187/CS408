/* ==========================================================================
   计算机组成原理 / 7 输入输出系统 / 程序查询 · 中断 · DMA 三种方式
   —— 这一页是 I/O 章的总纲：接口是什么、五种方式排成一条什么线。
      中断的细节在 co/io/interrupt，DMA 的细节在 co/io/dma。
   ========================================================================== */

KM.page({
  path: 'co/io/io-mode',
  title: '程序查询 / 中断 / DMA 三种方式',
  subtitle: '五种 I/O 方式其实是**同一条轴上的五个刻度**：CPU 每传多少数据才被打扰一次',
  tags: ['高频', '必考', '概念辨析', '手算'],
  updated: '2026-08-14',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'why-interface', c: '一、为什么 CPU 不能直接连外设' },

    { t: 'key', id: 'four-mismatch', title: '四个对不上，所以必须有接口', c: String.raw`
      | 对不上什么 | 具体差在哪 |
      |---|---|
      | **速度** | CPU 是 $\text{ns}$ 级，键盘是 $\text{ms}$ 级，==差 $10^6$ 倍== |
      | **信号格式** | 主机内部是并行的字，很多外设是==串行的位流== |
      | **信号电平** | CPU 是 $3.3\ \text{V}$ 数字信号，外设可能是模拟量、机械触点 |
      | **时序** | 主机有统一时钟，外设==各按各的节奏== |

      **I/O 接口（设备控制器）就是这四条鸿沟上的桥。**
      它对主机一侧是"一组标准的寄存器"，对设备一侧是"这个设备特有的信号"，
      ==把设备的千奇百怪，翻译成 CPU 能理解的统一格式==。

      这正是[总线标准](#/co/bus/bus-basic?at=features)那四条特性想达到的效果 ——
      ==只要接口守规矩，CPU 就不必知道对面挂的是什么设备==。
    ` },

    { t: 'diagram', id: 'interface-struct', title: 'I/O 接口的内部结构（三类寄存器是核心）',
      note: '主机侧只看得见端口，看不见设备',
      caption: String.raw`==接口存在的意义就是"把千奇百怪的设备统一成三个寄存器"==。端口怎么编址（统一编址 / 独立编址），见[下一节](#/co/io/io-mode?at=addressing-table)。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 324" role="img" aria-label="I/O 接口内部的数据、状态、控制三类寄存器">
  <text class="cap" x="20" y="14">◀── 主机侧</text>
  <text class="cap" x="676" y="14" text-anchor="end">设备侧 ──▶</text>
  <g class="n m"><rect x="20" y="24" width="130" height="24" rx="6"/><text class="bt xs" x="85.0" y="36.0" text-anchor="middle" dominant-baseline="central">数据总线</text></g>
  <g class="n m"><rect x="20" y="56" width="130" height="24" rx="6"/><text class="bt xs" x="85.0" y="68.0" text-anchor="middle" dominant-baseline="central">地址线</text></g>
  <g class="n m"><rect x="20" y="88" width="130" height="24" rx="6"/><text class="bt xs" x="85.0" y="100.0" text-anchor="middle" dominant-baseline="central">控制线</text></g>
  <g class="n m"><rect x="180" y="20" width="330" height="250" rx="8"/><text class="bt sm" x="345.0" y="145.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <text class="cap" x="200" y="42">I/O 接口</text>
  <g class="n k"><rect x="200" y="56" width="290" height="60" rx="8"/><text class="bt sm" x="345.0" y="76.0" text-anchor="middle" dominant-baseline="central">数据缓冲寄存器 DBR</text><text class="bs" x="345.0" y="96.0" text-anchor="middle" dominant-baseline="central">放正在传的那个字节</text></g>
  <g class="n g"><rect x="200" y="126" width="290" height="60" rx="8"/><text class="bt sm" x="345.0" y="146.0" text-anchor="middle" dominant-baseline="central">状态寄存器</text><text class="bs" x="345.0" y="166.0" text-anchor="middle" dominant-baseline="central">忙 / 完成 / 出错</text></g>
  <g class="n a"><rect x="200" y="196" width="290" height="60" rx="8"/><text class="bt sm" x="345.0" y="216.0" text-anchor="middle" dominant-baseline="central">控制寄存器</text><text class="bs" x="345.0" y="236.0" text-anchor="middle" dominant-baseline="central">启动 / 停止 / 读 / 写</text></g>
  <path class="ar" d="M150,36 H196"/>
  <path class="ar plain" d="M150,68 H196 V120"/>
  <path class="ar plain" d="M150,100 H196 V190"/>
  <g class="n k"><rect x="546" y="56" width="130" height="60" rx="8"/><text class="bt sm" x="611.0" y="86.0" text-anchor="middle" dominant-baseline="central">设备的数据</text></g>
  <g class="n g"><rect x="546" y="126" width="130" height="60" rx="8"/><text class="bt sm" x="611.0" y="156.0" text-anchor="middle" dominant-baseline="central">设备状态</text></g>
  <g class="n a"><rect x="546" y="196" width="130" height="60" rx="8"/><text class="bt sm" x="611.0" y="226.0" text-anchor="middle" dominant-baseline="central">启停命令</text></g>
  <path class="ar" d="M490,86 H542"/>
  <path class="ar" d="M542,156 H494"/>
  <path class="ar" d="M490,226 H542"/>
  <text class="cap" x="0" y="292">这三类寄存器（数据 / 状态 / 控制）就是所谓的 I/O 端口</text>
  <text class="lb" x="0" y="312">CPU 对外设的全部操作，归根结底都是「读写这几个端口」</text>
</svg>
` },

    { t: 'key', id: 'interface-func', title: 'I/O 接口的五项功能（简答题）', c: String.raw`
      1. **数据缓冲** —— ==用 DBR 弥补速度差==，这是最主要的功能；
      2. **状态监测** —— 用状态寄存器报告"忙 / 完成 / 出错"；
      3. **控制与定时** —— 接收 CPU 的命令，按设备的节奏去执行；
      4. **数据格式转换** —— ==串并转换==、电平转换、编码转换；
      5. **设备选择（地址译码）** —— 判断总线上的地址是不是在叫自己。

      ==第 1 和第 5 最常考==：
      没有缓冲，快慢两端就无法衔接；
      没有译码，一条总线上挂几十个设备就无法区分。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'port-addressing', c: '二、I/O 端口的两种编址方式' },

    { t: 'compare', id: 'addressing-table', title: '★★ 统一编址 vs 独立编址',
      cols: ['', '统一编址（存储器映射 / MMIO）', '独立编址（I/O 映射）'],
      rows: [
        ['地址空间', '==I/O 端口占用主存地址空间的一部分==', '==I/O 有自己独立的地址空间=='],
        ['用什么指令访问', '==普通的访存指令==（$\\texttt{LOAD}$/$\\texttt{STORE}$）', '==专门的 I/O 指令==（$\\texttt{IN}$/$\\texttt{OUT}$）'],
        ['靠什么区分是访存还是访 I/O', '==靠地址落在哪个区间==', '==靠控制线==（如 $\\texttt{M/IO\\#}$）'],
        ['优点', '==指令丰富==（所有访存指令都能用于 I/O）；端口数量不受限', '==不占用主存空间==；程序一眼看出是 I/O'],
        ['缺点', '==占用主存地址空间==；程序可读性差', '==需要专门的指令和控制线==，CPU 结构复杂'],
        ['典型', 'ARM、RISC-V、大多数现代架构', '$\\texttt{x86}$（同时也支持 MMIO）'],
      ] },

    { t: 'key', id: 'mmio-wins', title: '略高一点：为什么现代架构几乎全用统一编址', c: String.raw`
      教材把两者讲成平等的两种选择，实际上==统一编址已经赢了==。三个原因：

      **① 地址空间不再稀缺。**
      独立编址的最大卖点是"不占主存空间"。
      在 $16$ 位地址（$64\ \text{KB}$）的年代这至关重要，
      ==而 $64$ 位地址空间下，划几 GB 给设备毫无压力==。

      **② RISC 的指令集哲学容不下专用 I/O 指令。**
      RISC 追求指令少而规整，==凭空多一对 $\texttt{IN}/\texttt{OUT}$ 是不可接受的==。
      而统一编址==一条指令都不用加==。

      **③ 统一编址天然支持虚拟内存与权限保护。**
      ==既然端口就是内存地址，页表和权限位就自动适用==：
      OS 可以把某个设备的寄存器映射进某个进程的地址空间，
      让用户态程序直接操作设备而无需系统调用（现代高性能网卡、GPU 就这么干）。
      ==独立编址下的 $\texttt{IN}/\texttt{OUT}$ 只能靠特权级一刀切。==

      **注意一个副作用**：MMIO 的地址==必须标记为不可缓存==，
      否则 CPU 会把"读设备状态寄存器"这件事优化成读 Cache，
      ==永远读到同一个旧值==。这和 [DMA 的 Cache 一致性问题](#/co/io/dma?at=coherency)
      是同一类麻烦的两个方向。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'spectrum', c: '三、五种 I/O 方式：同一条轴上的五个刻度' },

    { t: 'diagram', id: 'the-axis', title: '★★ 把五种方式排成一条线（这张图是本章的骨架）',
      note: '从左到右：CPU 越来越闲，硬件越来越贵',
      caption: String.raw`==这条轴上真正的分水岭在 DMA 那一格==：从这里开始数据不再经过 CPU。左边两种是"CPU 亲自搬"，右边三种是"别人替 CPU 搬"。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 304" role="img" aria-label="程序查询、程序中断、DMA、通道、IO 处理机五种方式排成的谱系">
  <text class="cap" x="0" y="14">CPU 每传【多少数据】才被打扰一次 ──────────────▶ 越来越少</text>
  <g class="n r"><rect x="112" y="28" width="108" height="40" rx="8"/><text class="bt xs" x="166.0" y="48.0" text-anchor="middle" dominant-baseline="central">程序查询</text></g>
  <g class="n a"><rect x="226" y="28" width="108" height="40" rx="8"/><text class="bt xs" x="280.0" y="48.0" text-anchor="middle" dominant-baseline="central">程序中断</text></g>
  <g class="n g"><rect x="340" y="28" width="108" height="40" rx="8"/><text class="bt xs" x="394.0" y="48.0" text-anchor="middle" dominant-baseline="central">DMA</text></g>
  <g class="n g"><rect x="454" y="28" width="108" height="40" rx="8"/><text class="bt xs" x="508.0" y="48.0" text-anchor="middle" dominant-baseline="central">通道</text></g>
  <g class="n k"><rect x="568" y="28" width="108" height="40" rx="8"/><text class="bt xs" x="622.0" y="48.0" text-anchor="middle" dominant-baseline="central">I/O 处理机</text></g>
  <g class="n m"><rect x="112" y="80" width="564" height="16" rx="6"/><text class="bt xs" x="394.0" y="88.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <text class="lb" x="104" y="126" text-anchor="end" dominant-baseline="central">打扰频率</text>
  <g class="n m"><rect x="112" y="112" width="108" height="28" rx="4"/><text class="bt xs" x="166.0" y="126.0" text-anchor="middle" dominant-baseline="central">全程死等</text></g>
  <g class="n m"><rect x="226" y="112" width="108" height="28" rx="4"/><text class="bt xs" x="280.0" y="126.0" text-anchor="middle" dominant-baseline="central">每 1 字节</text></g>
  <g class="n m"><rect x="340" y="112" width="108" height="28" rx="4"/><text class="bt xs" x="394.0" y="126.0" text-anchor="middle" dominant-baseline="central">每 1 数据块</text></g>
  <g class="n m"><rect x="454" y="112" width="108" height="28" rx="4"/><text class="bt xs" x="508.0" y="126.0" text-anchor="middle" dominant-baseline="central">每一组块</text></g>
  <g class="n m"><rect x="568" y="112" width="108" height="28" rx="4"/><text class="bt xs" x="622.0" y="126.0" text-anchor="middle" dominant-baseline="central">几乎不打扰</text></g>
  <text class="lb" x="104" y="160" text-anchor="end" dominant-baseline="central">数据经过 CPU</text>
  <g class="n m"><rect x="112" y="146" width="108" height="28" rx="4"/><text class="bt xs" x="166.0" y="160.0" text-anchor="middle" dominant-baseline="central">是</text></g>
  <g class="n m"><rect x="226" y="146" width="108" height="28" rx="4"/><text class="bt xs" x="280.0" y="160.0" text-anchor="middle" dominant-baseline="central">是</text></g>
  <g class="n m"><rect x="340" y="146" width="108" height="28" rx="4"/><text class="bt xs" x="394.0" y="160.0" text-anchor="middle" dominant-baseline="central">否</text></g>
  <g class="n m"><rect x="454" y="146" width="108" height="28" rx="4"/><text class="bt xs" x="508.0" y="160.0" text-anchor="middle" dominant-baseline="central">否</text></g>
  <g class="n m"><rect x="568" y="146" width="108" height="28" rx="4"/><text class="bt xs" x="622.0" y="160.0" text-anchor="middle" dominant-baseline="central">否</text></g>
  <text class="lb" x="104" y="194" text-anchor="end" dominant-baseline="central">并行程度</text>
  <g class="n m"><rect x="112" y="180" width="108" height="28" rx="4"/><text class="bt xs" x="166.0" y="194.0" text-anchor="middle" dominant-baseline="central">无</text></g>
  <g class="n m"><rect x="226" y="180" width="108" height="28" rx="4"/><text class="bt xs" x="280.0" y="194.0" text-anchor="middle" dominant-baseline="central">较低</text></g>
  <g class="n m"><rect x="340" y="180" width="108" height="28" rx="4"/><text class="bt xs" x="394.0" y="194.0" text-anchor="middle" dominant-baseline="central">高</text></g>
  <g class="n m"><rect x="454" y="180" width="108" height="28" rx="4"/><text class="bt xs" x="508.0" y="194.0" text-anchor="middle" dominant-baseline="central">更高</text></g>
  <g class="n m"><rect x="568" y="180" width="108" height="28" rx="4"/><text class="bt xs" x="622.0" y="194.0" text-anchor="middle" dominant-baseline="central">最高</text></g>
  <text class="lb" x="104" y="228" text-anchor="end" dominant-baseline="central">硬件成本</text>
  <g class="n m"><rect x="112" y="214" width="108" height="28" rx="4"/><text class="bt xs" x="166.0" y="228.0" text-anchor="middle" dominant-baseline="central">最低</text></g>
  <g class="n m"><rect x="226" y="214" width="108" height="28" rx="4"/><text class="bt xs" x="280.0" y="228.0" text-anchor="middle" dominant-baseline="central">低</text></g>
  <g class="n m"><rect x="340" y="214" width="108" height="28" rx="4"/><text class="bt xs" x="394.0" y="228.0" text-anchor="middle" dominant-baseline="central">中</text></g>
  <g class="n m"><rect x="454" y="214" width="108" height="28" rx="4"/><text class="bt xs" x="508.0" y="228.0" text-anchor="middle" dominant-baseline="central">高</text></g>
  <g class="n m"><rect x="568" y="214" width="108" height="28" rx="4"/><text class="bt xs" x="622.0" y="228.0" text-anchor="middle" dominant-baseline="central">最高</text></g>
  <text class="cap" x="0" y="272">整章只有一条主线：把 CPU 从数据搬运里一步步解放出来</text>
  <text class="lb" x="0" y="292">每往右一格，CPU 被打扰的频率就降一个数量级，硬件就复杂一层</text>
</svg>
` },

    { t: 'key', id: 'two-jumps', title: '★ 这条轴上有两次质变，别把五格看成均匀的', c: String.raw`
      **第一次质变：查询 $\to$ 中断 —— 从"CPU 主动问"到"设备主动报"。**

      查询方式下 ==CPU 必须一直问==，哪怕设备一百年不响应；
      中断方式下 ==CPU 可以去干别的==，设备好了会来叫它。
      ==这一步买到的是"CPU 与外设并行"。==

      **第二次质变：中断 $\to$ DMA —— 数据不再经过 CPU。**

      中断方式虽然不用死等，但==每一个字节仍然是 CPU 亲手搬的==
      （$\texttt{MDR}\to$ 寄存器 $\to$ 主存）。
      DMA 让数据==从设备直接进主存==，CPU 连搬运工都不当了。
      ==这一步买到的是"数据通路上没有 CPU"。==

      **后面两格（通道、I/O 处理机）不是质变，只是程度加深**：
      通道是"能执行通道程序的 DMA"，I/O 处理机是"更像 CPU 的通道"。

      ==答"三种方式有何本质区别"时，抓住这两次质变就够了==：
      ==一次解决"要不要等"，一次解决"要不要亲手搬"。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'polling', c: '四、程序查询方式' },

    { t: 'diagram', id: 'polling-flow', title: '程序查询的流程：一个死循环',
      note: '左边那条回边就是 CPU 的时间被吃掉的地方',
      caption: String.raw`==两条回边要分清==：左边是"设备还没好"的空转，右边是"这个字节传完了，去取下一个"。查询开销正比于设备速率的推导，见[这一块](#/co/io/io-mode?at=polling-types)。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 460" role="img" aria-label="程序查询方式的流程：读状态、判完成、取数、存主存，未传完就回到读状态">
  <g class="n k"><rect x="230" y="16" width="240" height="40" rx="8"/><text class="bt sm" x="350.0" y="36.0" text-anchor="middle" dominant-baseline="central">CPU 发启动命令</text></g>
  <path class="ar" d="M350,56 V78"/>
  <g class="n a"><rect x="230" y="82" width="240" height="40" rx="8"/><text class="bt sm" x="350.0" y="102.0" text-anchor="middle" dominant-baseline="central">读取状态寄存器</text></g>
  <path class="ar" d="M350,122 V144"/>
  <g class="n a"><rect x="230" y="148" width="240" height="40" rx="8"/><text class="bt sm" x="350.0" y="168.0" text-anchor="middle" dominant-baseline="central">完成标志 = 1 ?</text></g>
  <path class="ar" d="M230,168 H120 V102 H226"/>
  <text class="lb" x="126" y="96">否：就在这里空转</text>
  <path class="ar" d="M350,188 V210"/>
  <text class="lb" x="360" y="204">是</text>
  <g class="n g"><rect x="230" y="214" width="240" height="40" rx="8"/><text class="bt sm" x="350.0" y="234.0" text-anchor="middle" dominant-baseline="central">取数据 → CPU 寄存器</text></g>
  <path class="ar" d="M350,254 V276"/>
  <g class="n g"><rect x="230" y="280" width="240" height="40" rx="8"/><text class="bt sm" x="350.0" y="300.0" text-anchor="middle" dominant-baseline="central">存入主存，计数 -1</text></g>
  <path class="ar" d="M350,320 V342"/>
  <g class="n k"><rect x="230" y="346" width="240" height="40" rx="8"/><text class="bt sm" x="350.0" y="366.0" text-anchor="middle" dominant-baseline="central">传完了吗？</text></g>
  <path class="ar" d="M470,366 H580 V102 H474"/>
  <text class="lb" x="486" y="96">否：回到读状态</text>
  <path class="ar" d="M350,386 V408"/>
  <g class="n m"><rect x="280" y="412" width="140" height="36" rx="8"/><text class="bt sm" x="350.0" y="430.0" text-anchor="middle" dominant-baseline="central">结束</text></g>
</svg>
` },

    { t: 'key', id: 'polling-types', title: '独占查询与定时查询', c: String.raw`
      | | 独占查询 | 定时查询（周期性查询） |
      |---|---|---|
      | 做法 | ==CPU 一直循环查询==，直到传完 | ==每隔一段时间查一次==，其余时间干别的 |
      | CPU 占用 | ==$100\%$==，完全被这一个设备霸占 | 只占查询那几拍 |
      | 风险 | 无（不会丢数据） | ==查询间隔必须小于设备产生数据的间隔==，否则丢数据 |

      ==定时查询是查询方式里唯一能用的形式==，
      但它有个致命约束：

      $$\text{查询间隔} \le \frac{1}{\text{设备的数据产生速率}}$$

      ==设备越快，就必须查得越勤，CPU 开销就越大==——
      而且==哪怕设备一个数据都没产生，这些查询也一次不能少==。
      这是查询方式与中断方式最本质的差别：

      $$\underbrace{\text{查询开销}\propto\textbf{设备速率}}_{\text{按"最坏情况"付钱}}
      \qquad
      \underbrace{\text{中断开销}\propto\textbf{实际数据量}}_{\text{按"实际用量"付钱}}$$

      ==对一个很少有数据、但要求及时响应的设备（比如键盘），
      查询方式的浪费大得离谱==——这正是中断被发明出来的直接原因。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'compare', c: '五、三种方式的全面对比' },

    { t: 'compare', id: 'three-way', title: '★★ 程序查询 / 程序中断 / DMA',
      cols: ['', '程序查询', '程序中断', 'DMA'],
      rows: [
        ['**谁发起传输**', '==CPU 主动问==', '==设备主动报==', '设备主动报（向 DMA 控制器）'],
        ['**数据经过 CPU 吗**', '==经过==（寄存器中转）', '==经过==（寄存器中转）', '==不经过==，设备↔主存直连'],
        ['**用什么搬数据**', '程序（软件）', '程序（软件）', '==DMA 控制器（硬件）=='],
        ['**CPU 与外设并行**', '==不并行==', '==并行==', '==并行=='],
        ['**打断 CPU 的时机**', '不打断（CPU 本就在问）', '==一条指令执行结束后==', '==一个总线周期结束后=='],
        ['**打断的粒度**', '——', '==每传 1 个字/字节==', '==每传 1 个数据块=='],
        ['**打断时抢走什么**', '——', '==CPU 的执行权==', '==总线使用权=='],
        ['**要不要保存现场**', '不需要', '==需要==（有软件开销）', '==不需要=='],
        ['**优先级（对总线）**', '——', '低', '==高=='],
        ['**适用设备**', '==极低速==、或 CPU 无事可做', '==中低速、随机事件==', '==高速、成批数据=='],
      ] },

    { t: 'example',
      id: 'ex-three-cost',
      title: '同一个外设，三种方式各占用多少 CPU',
      source: '408 综合计算',
      level: 4,
      problem: String.raw`
        某计算机主频为 $500\ \text{MHz}$。某外设的数据传输率为 $4\ \text{MB/s}$，
        每次传送 $4$ 个字节。分别采用以下三种方式：

        - **(1) 程序中断方式**：每传送 $4$ 字节请求一次中断，
          CPU 响应并处理一次中断需 $500$ 个时钟周期；
        - **(2) DMA 方式**：每传送 $4\ \text{KB}$ 请求一次 DMA，
          一次 DMA 的预处理与后处理共需 $1000$ 个时钟周期；
        - **(3)** 若改用 DMA 且数据块增大到 $64\ \text{KB}$。

        分别求 CPU 用于该外设 I/O 的时间百分比。（$1\ \text{KB}=2^{10}\ \text{B}$，
        $1\ \text{MB}=2^{20}\ \text{B}$；为便于计算，取 $4\ \text{MB/s}=4\times10^{6}\ \text{B/s}$）
      `,
      idea: String.raw`
        三问是同一个式子的三次代入：

        $$\text{占比} = \frac{\text{每秒被打扰的次数}\times\text{每次的周期数}}{\text{主频}}$$

        ==全部的差别只在"每秒被打扰多少次"==，而这个次数是

        $$\text{每秒被打扰次数} = \frac{\text{数据传输率}}{\textbf{每次打扰所传的数据量}}$$

        - 中断方式：每次打扰传 $4\ \text{B}$；
        - DMA 方式：每次打扰传 $4\ \text{KB}$ 或 $64\ \text{KB}$。

        ==分母从 $4$ 变成 $4096$，次数就降 $1024$ 倍==——
        这一句就是本题想让你看见的全部。
      `,
      solution: String.raw`
        CPU 每秒可提供 $500\times10^{6} = 5\times10^{8}$ 个时钟周期。

        **(1) 程序中断方式**

        每秒中断次数：

        $$\frac{4\times10^{6}\ \text{B/s}}{4\ \text{B}} = 10^{6}\ \text{次/秒}$$

        消耗周期：

        $$10^{6}\times500 = 5\times10^{8}\ \text{周期/秒}$$

        $$\text{占比} = \frac{5\times10^{8}}{5\times10^{8}} = \boxed{100\%}$$

        ==CPU 把全部时间都用来处理中断，一条用户程序的指令都执行不了。==

        **(2) DMA 方式（块大小 $4\ \text{KB}$）**

        每秒 DMA 次数：

        $$\frac{4\times10^{6}}{4\times2^{10}} = \frac{4\times10^{6}}{4096} \approx 977\ \text{次/秒}$$

        消耗周期：

        $$977\times1000 \approx 9.77\times10^{5}\ \text{周期/秒}$$

        $$\text{占比} = \frac{9.77\times10^{5}}{5\times10^{8}} \approx \boxed{0.20\%}$$

        **(3) DMA 方式（块大小 $64\ \text{KB}$）**

        $$\frac{4\times10^{6}}{64\times2^{10}} = \frac{4\times10^{6}}{65536}\approx 61\ \text{次/秒}$$

        $$\text{占比} = \frac{61\times1000}{5\times10^{8}} \approx \boxed{0.012\%}$$
      `,
      comment: String.raw`
        **把三个数字并排看**：

        | 方式 | 每秒打扰次数 | CPU 占比 |
        |---|---|---|
        | 程序中断（$4\ \text{B}$/次） | $10^{6}$ | ==$100\%$== |
        | DMA（$4\ \text{KB}$/次） | $\approx977$ | $0.20\%$ |
        | DMA（$64\ \text{KB}$/次） | $\approx61$ | $0.012\%$ |

        **第 (1) 问那个 $100\%$ 才是重点**：
        它不是"性能下降了一点"，而是==这台机器已经无法工作==——
        中断方式在这个传输率上==根本不可行==。
        这就是 DMA 存在的全部理由。

        **注意"块越大越省"不是没有代价的**：

        | 块变大 | 好处 | 坏处 |
        |---|---|---|
        | $4\ \text{KB}\to64\ \text{KB}$ | ==CPU 开销降到 $1/16$== | ==需要 $64\ \text{KB}$ 连续的缓冲区==；单次传输延迟变长；出错时要重传的数据更多 |

        ==所以实际系统里块大小是个权衡==，不是越大越好。

        **注意单位的坑**：本题 $\text{KB}$ 按 $2^{10}$、传输率按 $10^{6}$，
        ==这是题目明确规定的混用==。
        考场上==题目怎么规定就怎么算==，没规定就统一按 $2^{10}$ 并写明假设。
        （容量一般按 $2^{10}$，[传输率一般按 $10^{3}$](#/co/bus/bus-basic?at=metrics)。）
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'channel', c: '六、通道方式（考纲要求，但只考概念）' },

    { t: 'key', id: 'channel-def', title: '通道 = 能执行程序的 DMA', c: String.raw`
      DMA 控制器只会做一件事：==把一块连续的数据从 A 搬到 B==。
      要传第二块、或者要在传完后做判断，==还得 CPU 出面==。

      **通道（Channel）是一个专用的 I/O 处理器**，它有：

      - 自己的==指令系统==（通道指令 / 通道命令字 CCW）；
      - 自己的==程序==（通道程序，存放在==主存==里）；
      - 因此能==自主完成一整串复杂的 I/O 操作==，包括多个数据块、条件判断。

      **于是 CPU 的工作变成了**：

      ~~~
      CPU: 在主存里编好一段【通道程序】
           → 执行一条【启动 I/O 指令】，把通道程序的地址告诉通道
           → 转去执行别的程序，【彻底不管了】
      通道: 自己取通道指令、自己执行、自己搬数据
           → 全部完成后【发一次中断】通知 CPU
      ~~~

      ==注意通道程序放在主存里，所以通道要访存取自己的指令==——
      它和 CPU 共享主存，这是通道与 DMA 在结构上的关键区别。
    ` },

    { t: 'compare', id: 'channel-types', title: '三种通道',
      cols: ['类型', '怎么服务', '适合什么设备', '一次为一个设备传多少'],
      rows: [
        ['**字节多路通道**', '==分时轮流==为多个设备服务', '==大量低速设备==（键盘、终端）', '==1 个字节=='],
        ['**选择通道**', '==独占==，一段时间只为一个设备服务', '==少量高速设备==（磁盘）', '==一整块数据=='],
        ['**数组多路通道**', '前两者结合：为一个设备传完==一个数据块==再换下一个', '==多台高速设备==', '==1 个数据块=='],
      ] },

    { t: 'key', id: 'channel-memory', title: '一个好记的类比', c: String.raw`
      ==三种通道的差别，和进程调度里的三种策略完全同构==：

      | 通道 | 对应的调度思想 |
      |---|---|
      | 字节多路通道 | ==时间片轮转==（每人一小口，轮流来） |
      | 选择通道 | ==独占 / 非抢占==（一个人做完再换） |
      | 数组多路通道 | ==按块轮转==（每人一大口，轮流来） |

      =="共享一个服务者，如何在多个请求间分配"==——
      这个模型在 408 里出现过很多次：
      [总线仲裁](#/co/bus/bus-timing?at=arb-compare)、
      [中断判优](#/co/io/interrupt?at=two-priorities)、通道调度、进程调度。
      ==认出模型，比记住名字有用得多。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'modern', c: '七、略高于考纲：轮询的回归' },

    { t: 'key', id: 'polling-returns', title: '当设备快到一定程度，中断反而成了累赘', c: String.raw`
      这一章的主线是"从查询走向中断再走向 DMA"，
      ==但在最高速的场合，这条线又拐了回去==。

      **问题**：$100\ \text{Gbps}$ 的网卡，小包情况下==每秒可能产生上千万个中断==。
      每次中断都要[保存现场、切换上下文、刷流水线](#/co/cpu/exception?at=pipeline-cost)，
      ==CPU 会被中断活活淹死==（这个现象有个名字：**interrupt livelock**，中断活锁）。

      **于是出现了三级应对**：

      | 手段 | 做法 |
      |---|---|
      | **中断合并** | 硬件攒够 $N$ 个包或等够 $T$ 微秒==才发一次中断== |
      | **NAPI**（Linux） | ==第一个包用中断唤醒，然后关中断转为轮询==，把队列一次性收干净再开中断 |
      | **纯轮询**（DPDK） | ==彻底关掉中断==，专门拿一个 CPU 核死循环轮询网卡队列 |

      ==最后一格就是"程序查询方式"本身==——
      绕了一大圈，在极高速的场合它又成了最优解。

      **为什么会这样**：查询方式的开销是==固定的==（与数据量无关），
      中断方式的开销==正比于数据量==。
      当数据量大到一定程度，==正比的那个必然超过固定的那个==。

      $$\text{查询开销}=\text{常数}\qquad\text{中断开销}\propto\text{数据量}$$

      ==所以"中断优于查询"是有前提的：设备不能太快。==
      教材不讲这个前提，但它才是这两种方式真正的分界线。
    ` },

    { t: 'key', id: 'msi', title: '顺带一提：MSI —— 中断也不用专门的线了', c: String.raw`
      传统中断靠==专门的中断请求线==（$\texttt{INTR}$ 引脚），
      这在[点对点的 PCIe](#/co/bus/bus-basic?at=modern-bus)上无处安放。

      **MSI（Message Signaled Interrupts）的做法**：
      ==把中断变成一次普通的内存写操作==——
      设备往一个特定的地址写一个特定的值，中断控制器看到就产生中断。

      好处很直接：

      - ==不需要专用中断线==，走的就是数据通路；
      - ==一个设备可以有很多个中断向量==（MSI-X 支持 $2048$ 个），
        多队列网卡可以让==每个队列的中断直接送到不同的 CPU 核==；
      - ==没有共享中断线的判优问题==，[链式排队器](#/co/io/interrupt?at=daisy-chain)可以退休了。

      ==这是"总线仲裁消失"那件事在中断上的同款演化==：
      共享的专用信号线，被点对点的消息传递取代了。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '八、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **说 DMA 方式下数据要经过 CPU** —— ==不经过==，
         这正是它和中断方式的本质区别，见[对比表](#/co/io/io-mode?at=three-way)。
      2. **说程序中断方式下 CPU 不参与数据传送** ——
         ==参与==！每个字节都是中断服务程序搬的，
         中断只是免去了"等"，没免去"搬"。
      3. **统一编址与独立编址的优缺点记反** ——
         ==统一编址不需要专门 I/O 指令但占主存空间==，独立编址反过来。
      4. **认为统一编址就是"I/O 端口和主存单元用同一个地址"** ——
         是==共用一个地址空间、各占一段==，不是同一个地址。
      5. **把中断的响应时机和 DMA 的搞混** ——
         ==中断在指令结束后，DMA 在总线周期结束后==。
      6. **认为 DMA 优先级高是因为 DMA 更重要** ——
         是因为==外设的数据缓冲区会被覆盖，有时间窗口限制==。
      7. **算开销时用错"每次打扰传多少数据"** ——
         中断按字节、DMA 按块，==这个分母是全部差别的来源==，
         见[这道综合题](#/co/io/io-mode?at=ex-three-cost)。
      8. **认为通道就是 DMA 控制器** ——
         ==通道有自己的指令系统和通道程序==，能自主完成一串操作。
      9. **认为通道程序存在通道内部** —— ==存在主存里==，通道要访存去取。
      10. **认为查询方式一定比中断方式差** ——
          ==设备极快时查询反而更优==，见[轮询的回归](#/co/io/io-mode?at=polling-returns)。
      11. **把字节多路通道和数组多路通道搞反** ——
          ==字节多路一次传 1 个字节，数组多路一次传 1 个数据块==。
    ` },

    { t: 'md', c: String.raw`
      ---

      往下看细节：
      [中断响应与处理流程](#/co/io/interrupt?at=timeline)（第二格）、
      [DMA 传送过程与周期挪用](#/co/io/dma?at=three-phases)（第三格）。
    ` },

  ],
});
