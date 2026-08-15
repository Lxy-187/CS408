/* ==========================================================================
   计算机组成原理 / 5 中央处理器 / 异常与中断机制
   —— CPU 视角：中断是什么、CPU 凭什么被打断、被打断的那一瞬间硬件做了什么。
      「响应之后怎么排队、怎么嵌套、怎么算开销」在 I/O 章：
      #/co/io/interrupt
   ========================================================================== */

KM.page({
  path: 'co/cpu/exception',
  title: '异常与中断机制',
  subtitle: '中断是 CPU 唯一的「被动入口」。这一页只回答两件事：**谁能打断 CPU**，以及**被打断的那一拍硬件替你做了什么**',
  tags: ['高频', '必考', '概念辨析'],
  updated: '2026-08-14',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'why', c: '一、为什么会有中断' },

    { t: 'md', c: String.raw`
      课本上的标准答案是"CPU 和外设速度差得太远"。这个答案没错，但它只解释了
      **中断在 I/O 上的用途**，解释不了缺页、除零、系统调用为什么也叫中断。

      更本质的说法是：==CPU 只会顺着 PC 一条一条往下执行，它没有"注意到某件事发生了"
      的能力==。所有异步的、意外的、需要换一套权限才能做的事情，
      都必须有一个机制把 PC ==强行==拧到别处去 —— 这个机制就是中断。
    ` },

    { t: 'key', id: 'three-uses', title: '中断实际承担的三件事（不只是 I/O）', c: String.raw`
      | 用途 | 谁触发 | 典型例子 |
      |---|---|---|
      | **让慢设备别拖住 CPU** | 外设 | 键盘敲了一下、磁盘读完一块、DMA 传完了 |
      | **处理指令执行不下去的情况** | CPU 自己 | 缺页、除零、非法指令、访存越界 |
      | **让用户程序有办法请求内核服务** | 程序主动 | 系统调用（$\texttt{int 0x80}$ / $\texttt{syscall}$ / 访管指令） |

      ==第三条最容易被忽略==：操作系统的用户态 / 内核态切换，
      唯一的合法通道就是"主动制造一次中断"。
      这也是为什么 408 里中断这个知识点会在组成原理和操作系统两门课里各出现一次。
    ` },

    { t: 'md', c: String.raw`
      **和程序查询方式对比一下就明白代价在哪：**
    ` },

    { t: 'diagram', id: 'poll-vs-int', title: '查询 vs 中断 vs DMA：CPU 的时间去哪了',
      note: '紫 = CPU 在干正事，灰 = 空转，红 = 中断开销，绿/琥珀 = 设备侧',
      caption: String.raw`==三种方式抢的都是"CPU 的时间"，区别只在被占走多少==：查询把整段等待时间都吃掉；中断只吃那一小段服务程序；DMA 连搬运都不吃，只在整块传完时打断一次。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 356" role="img" aria-label="程序查询、中断、DMA 三种方式下 CPU 时间的去向对比">
  <text class="cap" x="0" y="14">① 程序查询：CPU 死等</text>
  <text class="lb" x="0" y="44" dominant-baseline="central">CPU</text>
  <g class="n m"><rect x="20" y="30" width="300" height="28" rx="4"/><text class="bt xs" x="170.0" y="44.0" text-anchor="middle" dominant-baseline="central">反复读状态寄存器（空转）</text></g>
  <g class="n p"><rect x="324" y="30" width="150" height="28" rx="4"/><text class="bt xs" x="399.0" y="44.0" text-anchor="middle" dominant-baseline="central">正事</text></g>
  <text class="lb" x="0" y="76" dominant-baseline="central">设备</text>
  <g class="n g"><rect x="20" y="62" width="304" height="28" rx="4"/><text class="bt xs" x="172.0" y="76.0" text-anchor="middle" dominant-baseline="central">设备在准备数据（很慢）</text></g>
  <text class="lb" x="20" y="110">设备没好就再读一遍，CPU 全程被绑住</text>
  <text class="cap" x="0" y="128">② 中断：CPU 该干嘛干嘛</text>
  <text class="lb" x="0" y="158" dominant-baseline="central">CPU</text>
  <g class="n p"><rect x="20" y="144" width="300" height="28" rx="4"/><text class="bt xs" x="170.0" y="158.0" text-anchor="middle" dominant-baseline="central">正事</text></g>
  <g class="n r"><rect x="324" y="144" width="60" height="28" rx="4"/><text class="bt xs" x="354.0" y="158.0" text-anchor="middle" dominant-baseline="central">中断服务</text></g>
  <g class="n p"><rect x="388" y="144" width="200" height="28" rx="4"/><text class="bt xs" x="488.0" y="158.0" text-anchor="middle" dominant-baseline="central">正事</text></g>
  <text class="lb" x="0" y="190" dominant-baseline="central">设备</text>
  <g class="n g"><rect x="20" y="176" width="304" height="28" rx="4"/><text class="bt xs" x="172.0" y="190.0" text-anchor="middle" dominant-baseline="central">设备在准备数据</text></g>
  <text class="lb" x="20" y="224">设备准备好才打断一次，开销只有那一小段</text>
  <text class="cap" x="0" y="242">③ DMA：CPU 连搬运都不管</text>
  <text class="lb" x="0" y="272" dominant-baseline="central">CPU</text>
  <g class="n p"><rect x="20" y="258" width="470" height="28" rx="4"/><text class="bt xs" x="255.0" y="272.0" text-anchor="middle" dominant-baseline="central">正事</text></g>
  <g class="n r"><rect x="494" y="258" width="76" height="28" rx="4"/><text class="bt xs" x="532.0" y="272.0" text-anchor="middle" dominant-baseline="central">一次中断</text></g>
  <g class="n p"><rect x="576" y="258" width="100" height="28" rx="4"/><text class="bt xs" x="626.0" y="272.0" text-anchor="middle" dominant-baseline="central">正事</text></g>
  <text class="lb" x="0" y="304" dominant-baseline="central">设备</text>
  <g class="n g"><rect x="20" y="290" width="120" height="28" rx="4"/><text class="bt xs" x="80.0" y="304.0" text-anchor="middle" dominant-baseline="central">准备</text></g>
  <g class="n a"><rect x="144" y="290" width="350" height="28" rx="4"/><text class="bt xs" x="319.0" y="304.0" text-anchor="middle" dominant-baseline="central">DMA 控制器直接搬 N 个字节</text></g>
  <text class="lb" x="20" y="338">整块搬完才中断一次</text>
</svg>
` },

    { t: 'md', c: String.raw`
      三种方式的分水岭在**打断 CPU 的次数**：
      查询方式是 CPU 主动问无数次；中断方式是==每传一个字节打断一次==；
      DMA 是==整块传完才打断一次==。
      这条线索会一路管到[开销计算](#/co/io/interrupt?at=cost-calc)那道题。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'taxonomy', c: '二、内中断与外中断：先把树画对' },

    { t: 'diagram', id: 'tree', title: '中断的完整分类（这张图能答一半的选择题）',
      note: '第一刀切"与当前指令有没有关系"，第二刀才切具体类型',
      caption: String.raw`最后一行==「返回哪里」是最常考的一格==：故障返回**本条**（重新执行），自陷返回**下一条**，终止**不返回**。详见[断点到底记哪一条](#/co/cpu/exception?at=return-table)。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 296" role="img" aria-label="中断的完整分类：外中断分可屏蔽与不可屏蔽，内中断分故障、自陷、终止">
  <g class="n p"><rect x="250" y="14" width="200" height="40" rx="8"/><text class="bt sm" x="350.0" y="34.0" text-anchor="middle" dominant-baseline="central">中断（广义 interrupt）</text></g>
  <path class="ar plain" d="M350,54 V70 H170 V88"/>
  <path class="ar plain" d="M350,54 V70 H530 V88"/>
  <g class="n k"><rect x="30" y="88" width="280" height="54" rx="8"/><text class="bt sm" x="170.0" y="105.0" text-anchor="middle" dominant-baseline="central">外中断（狭义中断）</text><text class="bs" x="170.0" y="125.0" text-anchor="middle" dominant-baseline="central">与当前指令无关 · 来自 CPU 外部</text></g>
  <g class="n g"><rect x="390" y="88" width="280" height="54" rx="8"/><text class="bt sm" x="530.0" y="105.0" text-anchor="middle" dominant-baseline="central">内中断（异常 exception）</text><text class="bs" x="530.0" y="125.0" text-anchor="middle" dominant-baseline="central">由当前指令引发 · 来自 CPU 内部</text></g>
  <path class="ar plain" d="M170,142 V158 H90 V174"/>
  <path class="ar plain" d="M170,142 V158 H250 V174"/>
  <g class="n k"><rect x="20" y="176" width="140" height="104" rx="8"/><text class="bt sm" x="90.0" y="194" text-anchor="middle" dominant-baseline="central">可屏蔽</text><text class="bs" x="90.0" y="218" text-anchor="middle" dominant-baseline="central">INTR 引脚</text><text class="bs" x="90.0" y="237" text-anchor="middle" dominant-baseline="central">受 IF 位控制</text><text class="bs" x="90.0" y="256" text-anchor="middle" dominant-baseline="central">键盘 / 时钟</text></g>
  <g class="n k"><rect x="180" y="176" width="140" height="104" rx="8"/><text class="bt sm" x="250.0" y="194" text-anchor="middle" dominant-baseline="central">不可屏蔽</text><text class="bs" x="250.0" y="218" text-anchor="middle" dominant-baseline="central">NMI 引脚</text><text class="bs" x="250.0" y="237" text-anchor="middle" dominant-baseline="central">必须响应</text><text class="bs" x="250.0" y="256" text-anchor="middle" dominant-baseline="central">掉电 / 校验错</text></g>
  <path class="ar plain" d="M530,142 V158 H400 V174"/>
  <path class="ar plain" d="M530,142 V158 H530 V174"/>
  <path class="ar plain" d="M530,142 V158 H645 V174"/>
  <g class="n g"><rect x="340" y="176" width="120" height="104" rx="8"/><text class="bt sm" x="400.0" y="194" text-anchor="middle" dominant-baseline="central">故障 Fault</text><text class="bs" x="400.0" y="218" text-anchor="middle" dominant-baseline="central">缺页 / 除零</text><text class="bs" x="400.0" y="237" text-anchor="middle" dominant-baseline="central">可恢复</text><text class="bs" x="400.0" y="256" text-anchor="middle" dominant-baseline="central">返回本条指令</text></g>
  <g class="n g"><rect x="470" y="176" width="120" height="104" rx="8"/><text class="bt sm" x="530.0" y="194" text-anchor="middle" dominant-baseline="central">自陷 Trap</text><text class="bs" x="530.0" y="218" text-anchor="middle" dominant-baseline="central">系统调用</text><text class="bs" x="530.0" y="237" text-anchor="middle" dominant-baseline="central">主动触发</text><text class="bs" x="530.0" y="256" text-anchor="middle" dominant-baseline="central">返回下一条</text></g>
  <g class="n r"><rect x="600" y="176" width="90" height="104" rx="8"/><text class="bt sm" x="645.0" y="194" text-anchor="middle" dominant-baseline="central">终止 Abort</text><text class="bs" x="645.0" y="218" text-anchor="middle" dominant-baseline="central">校验错</text><text class="bs" x="645.0" y="237" text-anchor="middle" dominant-baseline="central">不可恢复</text><text class="bs" x="645.0" y="256" text-anchor="middle" dominant-baseline="central">不返回</text></g>
</svg>
` },

    { t: 'key', id: 'in-vs-out', title: '内中断与外中断的四条硬差别', c: String.raw`
      | | 外中断（狭义"中断"） | 内中断（异常） |
      |---|---|---|
      | 与当前指令的关系 | ==完全无关==，纯属撞上了 | ==由这条指令直接引发== |
      | 什么时候被发现 | ==每条指令执行结束时统一查询== | 指令执行过程中，==哪一步出事哪一步报== |
      | 能不能屏蔽 | 可屏蔽（INTR）/ 不可屏蔽（NMI） | ==基本不能屏蔽==（关中断对它无效） |
      | 是否可重现 | ==随机，重跑一次未必再发生== | ==确定，同样的输入必然再次发生== |

      **"可重现"这一条最好用**：分不清一个事件属于内还是外，
      就问"把程序原封不动再跑一遍，它还会不会在同一条指令上发生"。
      缺页会（内），键盘不会（外）。
    ` },

    { t: 'warn', id: 'mask-exception', title: '★ 关中断关不掉异常', c: String.raw`
      $\texttt{CLI}$ / 关中断指令清的是**中断允许触发器 EINT**（也就是 PSW 里的 IF 位），
      而这一位==只挡 INTR 引脚上的可屏蔽中断==。

      - **NMI**：不经过 IF 位，==硬件强制响应==；
      - **异常**：根本不走 INTR 这条线，
        它是指令执行部件自己举手说"这条指令我执行不下去了"，
        ==关中断对它毫无意义==。

      反过来想就顺了：如果关中断能屏蔽缺页异常，
      那内核在关中断期间访问一个没调入的页面，CPU 就==彻底卡死==了 ——
      既不能继续执行，又不许报告。所以异常必须不可屏蔽。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'return-addr', c: '三、断点到底指向哪条指令（异常三分类的真正意义）' },

    { t: 'md', c: String.raw`
      故障 / 自陷 / 终止这个三分类，很多人背成了三个名词。
      ==它唯一的实用价值是回答一个问题：处理完之后，PC 该恢复成什么？==
    ` },

    { t: 'compare', id: 'return-table', title: '★ 四类打断的返回地址',
      cols: ['类型', '举例', '断点（返回地址）指向', '为什么'],
      rows: [
        ['**外中断**', '键盘、时钟、打印机就绪', '==下一条指令==', '当前指令已经执行完了，本来就该走下一条'],
        ['**故障 Fault**', '缺页、页保护、非法操作数', '==引发异常的那条指令本身==', '这条指令==根本没做完==；把页调进来之后要重来一次'],
        ['**自陷 Trap**', '系统调用、单步调试断点', '==下一条指令==', '这是程序==故意==执行的一条指令，它已经"成功"了'],
        ['**终止 Abort**', '存储器校验错、总线出错', '==没有意义==', '机器状态已经不可信，程序无法继续，只能杀掉'],
      ] },

    { t: 'key', id: 'fault-restart', title: '缺页为什么必须"重新执行"而不是"接着执行"', c: String.raw`
      考虑 $\texttt{MOV AX, [BX]}$ 这条指令，执行到访存那一步发现页不在内存：

      1. 此时这条指令==只完成了一半==：地址算出来了，数据一个字节都没取到；
      2. OS 把页调进内存；
      3. 如果返回到**下一条**指令 —— $\texttt{AX}$ 里是垃圾，==错得无声无息==；
      4. 所以必须返回到==这条指令本身==，从取指开始整条重来。

      **能这么做的前提**：故障发生时，==这条指令还没有修改任何程序员可见的状态==
      （没写寄存器、没写内存）。硬件必须保证这一点，
      这就是[精确异常](#/co/cpu/exception?at=precise)要解决的问题。

      **反例**：自增寻址 $\texttt{MOV AX, [BX]+}$ 如果先把 $\texttt{BX}$ 加过了才发现缺页，
      重新执行时 $\texttt{BX}$ 就多加了一次 —— 这类指令必须由硬件特殊处理
      （撤销副作用，或者先探测再修改）。
    ` },

    { t: 'warn', id: 'syscall-plus-one', title: '自陷的返回地址是"下一条"，别和故障搞混', c: String.raw`
      系统调用是程序==主动==执行 $\texttt{int}$ / $\texttt{syscall}$ / 访管指令的结果。
      这条指令的"功能"就是陷进内核，它==已经圆满完成了==，
      所以返回时当然走下一条。

      ==如果返回到自陷指令本身，就会立刻又陷进去一次，死循环。==

      这一点在硬件上的体现是：中断隐指令保存断点时，
      对外中断和自陷保存的是==已经加过 1 的 PC==（指向下一条），
      对故障保存的是==当前指令的地址==（PC 要减回去，或者干脆在取指后就备份一份）。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'when', c: '四、CPU 什么时候才肯被打断' },

    { t: 'key', id: 'response-cond', title: '中断响应的三个条件（缺一不可）', c: String.raw`
      1. ==中断源确实有请求==，且该请求==没有被屏蔽字屏蔽==；
      2. ==CPU 允许中断==（中断允许触发器 $\texttt{EINT}=1$，即 PSW 的 IF 位为 1）；
      3. ==一条指令执行结束==（对外中断而言）。

      **第 3 条是关键，也是最爱考的一条。** 外中断的检测不是"随时"，
      而是在每条指令的最后固定安排一次 —— 这一段叫 **中断周期**。
    ` },

    { t: 'diagram', id: 'cpu-cycle', title: 'CPU 的四种工作周期：中断周期挂在最后',
      note: '中断查询固定安排在一条指令执行完之后',
      caption: String.raw`==中断周期挂在最后不是随便安排的==：只有在一条指令彻底做完时，机器状态才是"干净"的，此刻保存断点才有意义。为什么必须等指令结束，见[这一块](#/co/cpu/exception?at=why-instruction-end)。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 246" role="img" aria-label="取指、间址、执行、中断四种工作周期的循环">
  <g class="n k"><rect x="30" y="40" width="140" height="56" rx="8"/><text class="bt sm" x="100.0" y="58.0" text-anchor="middle" dominant-baseline="central">取指周期</text><text class="bs" x="100.0" y="78.0" text-anchor="middle" dominant-baseline="central">FE</text></g>
  <g class="n k"><rect x="210" y="40" width="140" height="56" rx="8"/><text class="bt sm" x="280.0" y="58.0" text-anchor="middle" dominant-baseline="central">间址周期</text><text class="bs" x="280.0" y="78.0" text-anchor="middle" dominant-baseline="central">IND</text></g>
  <path class="ar" d="M174,68.0 H206"/>
  <g class="n k"><rect x="390" y="40" width="140" height="56" rx="8"/><text class="bt sm" x="460.0" y="58.0" text-anchor="middle" dominant-baseline="central">执行周期</text><text class="bs" x="460.0" y="78.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <path class="ar" d="M354,68.0 H386"/>
  <g class="n p"><rect x="570" y="40" width="140" height="56" rx="8"/><text class="bt sm" x="640.0" y="58.0" text-anchor="middle" dominant-baseline="central">中断周期</text><text class="bs" x="640.0" y="78.0" text-anchor="middle" dominant-baseline="central">INT</text></g>
  <path class="ar" d="M534,68.0 H566"/>
  <path class="ar" d="M655,68 V120 H100 V100"/>
  <text class="lb" x="380" y="138" text-anchor="middle">一条指令做完，回到取指</text>
  <text class="lb" x="210" y="116" text-anchor="middle">只有间接寻址才有</text>
  <text class="lb" x="490" y="116" text-anchor="middle">查询有无中断请求</text>
  <text class="cap" x="0" y="176">四个触发器标识当前处在哪个周期：FE / IND / EX / INT</text>
  <g class="n g"><rect x="20" y="188" width="656" height="46" rx="8"/><text class="bt sm" x="348.0" y="201.0" text-anchor="middle" dominant-baseline="central">没有中断请求时，INT 周期直接跳过</text><text class="bs" x="348.0" y="221.0" text-anchor="middle" dominant-baseline="central">从 EX 直接回到 FE —— 所以"每条指令都有中断周期"这句话是错的</text></g>
</svg>
` },

    { t: 'key', id: 'why-instruction-end', title: '★ 为什么必须等指令执行完', c: String.raw`
      三个理由，答简答题按这个顺序写：

      1. **状态的完整性**：指令执行到一半时，中间结果散落在
         $\texttt{MAR}$、$\texttt{MDR}$、$\texttt{Y}$、$\texttt{Z}$ 这些==程序员不可见的暂存器==里，
         中断服务程序无法保存它们，回来也就无法恢复。
         ==只有在指令边界上，机器状态才是可以完整描述的==（就是那组通用寄存器 + PC + PSW）。
      2. **实现代价**：允许在任意微操作处中断，意味着要能保存 / 恢复整个微程序的执行点，
         硬件复杂度暴涨，而收益只是把响应延迟缩短一条指令的时间。
      3. **原子性**：像"读—改—写"这种指令，中途被打断会破坏语义。

      **注意区分**：==异常不受这条约束==。异常本来就是"这条指令做不下去了"，
      当然只能在指令中间报。这也是内中断和外中断的一条硬差别。
    ` },

    { t: 'warn', id: 'dma-vs-int-timing', title: '中断和 DMA 的"插队时机"不一样', c: String.raw`
      经常有人把这两句混着记：

      | | 什么时候能插进来 | 插进来干什么 |
      |---|---|---|
      | **中断请求** | ==一条指令执行结束后== | 要 CPU 的**执行权**（转去跑一段程序） |
      | **DMA 请求** | ==一个总线周期（存取周期）结束后== | 只要**总线使用权**，CPU 照常执行不访存的部分 |

      所以 ==DMA 的响应粒度比中断细得多==，插入时机也更早。
      "DMA 请求的优先级高于中断请求"说的是==总线仲裁==时的优先级，
      理由是==DMA 有时间窗口限制==（外设的数据缓冲区会被下一批数据覆盖，
      不及时搬走就丢数据），而中断请求可以多等一会儿。

      ==别把"DMA 优先级高"写成"CPU 响应中断前要先看有没有 DMA 请求"==，
      这是两套独立的机制。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'hidden', c: '五、中断隐指令：硬件替你做的三件事' },

    { t: 'key', id: 'hidden-def', title: '★ 什么是中断隐指令', c: String.raw`
      **中断隐指令**是 CPU 响应中断后，==由硬件（中断周期的微操作序列）自动完成==的一组操作。

      "隐"字的三层意思，选择题一句一个考点：

      - ==它不是指令系统中的指令==，没有操作码，在指令表里查不到；
      - ==程序员写不出、也调不了它==，汇编里没有对应助记符；
      - ==它不占用指令周期==，就发生在上一条指令的中断周期里。

      它固定做三件事：**关中断 → 保存断点 → 引出中断服务程序**。
    ` },

    { t: 'steps', id: 'hidden-three', title: '三件事，每件都有一问', items: [
      { title: String.raw`关中断（$0\to\texttt{EINT}$）`,
        c: String.raw`
          **为什么**：接下来要保存断点、保护现场，这一段==必须是原子的==。
          如果保存断点保存到一半又来一个中断，第二次保存会==把第一个断点覆盖掉==，
          原程序就永远回不去了。

          这一步是==硬件自动做的==，不需要在中断服务程序里写关中断指令。` },
      { title: '保存断点',
        c: String.raw`
          把 $\texttt{PC}$（以及 $\texttt{PSW}$）的内容存到主存的固定单元或堆栈。

          **为什么必须硬件做**：此刻==还没有任何程序在跑==——
          原程序已经停了，中断服务程序还没进去，PC 里的返回地址正处在
          "下一拍就要被覆盖"的状态。==没有第二个时机能抢救它==。` },
      { title: '引出中断服务程序（形成入口地址送 PC）',
        c: String.raw`
          两种做法：

          - **硬件向量法**（主流）：由中断控制器产生**向量地址**，
            据此从**中断向量表**里取出**中断向量**（= 服务程序入口地址）送 PC；
          - **软件查询法**：PC 先指向一段公共的查询程序，
            由它逐个测试中断源标志再分支。

          详见 [向量中断那三个词](#/co/io/interrupt?at=vector-three-words)。` },
    ] },

    { t: 'diagram', id: 'int-cycle-micro', title: '中断周期的微操作序列（硬布线 / 微程序大题会考）',
      note: '左边是断点存主存固定单元，右边是断点压栈',
      caption: String.raw`两种写法的差别只在**断点存哪儿**，==后四步一模一样==。考试时盯住最后两行：==送向量地址 + 关中断，这两件事一定由硬件做==，通用寄存器的保存则一定是软件做的。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 302" role="img" aria-label="中断周期的六步微操作：存断点、送向量地址、关中断">
  <text class="cap" x="20" y="14">① 存入主存固定单元（经典写法）</text>
  <text class="cap" x="372" y="14">② 压入堆栈（现代写法）</text>
  <g class="n a"><rect x="20" y="26" width="316" height="28" rx="4"/><text class="bt xs" x="178.0" y="40.0" text-anchor="middle" dominant-baseline="central">(1) 0 → MAR</text></g>
  <g class="n a"><rect x="20" y="60" width="316" height="28" rx="4"/><text class="bt xs" x="178.0" y="74.0" text-anchor="middle" dominant-baseline="central">(2) 1 → W</text></g>
  <g class="n a"><rect x="20" y="94" width="316" height="28" rx="4"/><text class="bt xs" x="178.0" y="108.0" text-anchor="middle" dominant-baseline="central">(3) (PC) → MDR</text></g>
  <g class="n a"><rect x="20" y="128" width="316" height="28" rx="4"/><text class="bt xs" x="178.0" y="142.0" text-anchor="middle" dominant-baseline="central">(4) (MDR) → M(MAR)</text></g>
  <g class="n a"><rect x="20" y="162" width="316" height="28" rx="4"/><text class="bt xs" x="178.0" y="176.0" text-anchor="middle" dominant-baseline="central">(5) 向量地址形成部件 → PC</text></g>
  <g class="n a"><rect x="20" y="196" width="316" height="28" rx="4"/><text class="bt xs" x="178.0" y="210.0" text-anchor="middle" dominant-baseline="central">(6) 0 → EINT</text></g>
  <g class="n a"><rect x="360" y="26" width="316" height="28" rx="4"/><text class="bt xs" x="518.0" y="40.0" text-anchor="middle" dominant-baseline="central">(1) (SP)-1 → SP，(SP) → MAR</text></g>
  <g class="n a"><rect x="360" y="60" width="316" height="28" rx="4"/><text class="bt xs" x="518.0" y="74.0" text-anchor="middle" dominant-baseline="central">(2) 1 → W</text></g>
  <g class="n a"><rect x="360" y="94" width="316" height="28" rx="4"/><text class="bt xs" x="518.0" y="108.0" text-anchor="middle" dominant-baseline="central">(3) (PC) → MDR</text></g>
  <g class="n a"><rect x="360" y="128" width="316" height="28" rx="4"/><text class="bt xs" x="518.0" y="142.0" text-anchor="middle" dominant-baseline="central">(4) (MDR) → M(MAR)</text></g>
  <g class="n a"><rect x="360" y="162" width="316" height="28" rx="4"/><text class="bt xs" x="518.0" y="176.0" text-anchor="middle" dominant-baseline="central">(5) 向量地址形成部件 → PC</text></g>
  <g class="n a"><rect x="360" y="196" width="316" height="28" rx="4"/><text class="bt xs" x="518.0" y="210.0" text-anchor="middle" dominant-baseline="central">(6) 0 → EINT</text></g>
  <g class="n g"><rect x="20" y="244" width="320" height="46" rx="8"/><text class="bt sm" x="180.0" y="257.0" text-anchor="middle" dominant-baseline="central">有：写主存 · 改 PC · 清 EINT</text><text class="bs" x="180.0" y="277.0" text-anchor="middle" dominant-baseline="central">存断点、换入口、关中断</text></g>
  <g class="n r"><rect x="360" y="244" width="316" height="46" rx="8"/><text class="bt sm" x="518.0" y="257.0" text-anchor="middle" dominant-baseline="central">没有：任何通用寄存器的保存</text><text class="bs" x="518.0" y="277.0" text-anchor="middle" dominant-baseline="central">那是软件（中断服务程序）的事</text></g>
</svg>
` },

    { t: 'md', c: String.raw`
      把这六步和其他三个机器周期摆在一起看会更清楚：
      ==中断周期是四个周期里唯一一个"写"主存的==，
      见[四个机器周期的数据流](#/co/cpu/datapath?at=int-flow)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'breakpoint-vs-scene', c: '六、断点 vs 现场：这一组必须分得干干净净' },

    { t: 'compare', id: 'bp-scene-table', title: '★ 保存断点与保护现场',
      cols: ['', '保存断点', '保护现场'],
      rows: [
        ['存什么', '$\\texttt{PC}$（返回地址），一般还含 $\\texttt{PSW}$', '通用寄存器 $\\texttt{R0}\\sim\\texttt{Rn}$ 等'],
        ['谁来做', '==硬件==（中断隐指令）', '==软件==（中断服务程序开头的一串 $\\texttt{PUSH}$）'],
        ['什么时候', '中断周期，==进入服务程序之前==', '进入服务程序之后，==第一件事=='],
        ['存到哪', '堆栈或主存固定单元', '堆栈（由程序员/编译器决定）'],
        ['为什么这么分', '此时没有程序在跑，==只能硬件做==', '存哪些寄存器==只有服务程序自己知道==，硬件全存太浪费'],
      ] },

    { t: 'key', id: 'why-split', title: '为什么要这么分工（这才是理解，不是背）', c: String.raw`
      **断点交给硬件**：因为它是==回得去的唯一凭据==，
      而保存它的那个时刻恰好是"两段程序中间的真空"，软件插不进手。

      **现场交给软件**：因为==硬件不知道该存哪些==。
      一个只用到 $\texttt{R0}$、$\texttt{R1}$ 的中断服务程序，
      如果硬件把 32 个通用寄存器全压栈，==每次中断白白多花几十个周期==。
      交给软件，服务程序用到哪个存哪个，开销最小。

      **推论**（判断题常客）：中断服务程序里那几条 $\texttt{PUSH}$ ==是可以省的==
      —— 前提是这段服务程序确实没用到任何通用寄存器。
      而断点的保存==一次都省不掉==。
    ` },

    { t: 'warn', id: 'psw-question', title: 'PSW 到底算断点还是算现场？', c: String.raw`
      教材之间有分歧，考场上这么处理：

      - ==主流（也是 408 参考答案的口径）：$\texttt{PSW}$ 随断点一起由硬件保存。==
        理由很硬 —— 中断隐指令要执行"关中断"，也就是==改写 $\texttt{PSW}$ 里的 IF 位==。
        既然硬件要改它，就必须先把它存下来，否则原程序的中断允许状态就丢了。
        这也是 $\texttt{IRET}$ 能"自动恢复中断允许状态"的原因。
      - 少数教材把 $\texttt{PSW}$ 归入"现场"由软件保存。

      **答题策略**：题目问"哪些由硬件自动完成"，$\texttt{PC}$ ==一定选==，
      $\texttt{PSW}$ ==跟着选==，通用寄存器==一定不选==。
      争议只在中间那项，而 408 至今没有单独拿 $\texttt{PSW}$ 出过刁难题。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'vs-call', c: '七、中断 vs 子程序调用（经典对比题）' },

    { t: 'md', c: String.raw`
      两者都是"跳走再跳回来"，但==除了这个表面动作，几乎处处相反==。
      这张表出过好几次选择题，也是理解"中断为什么要这么麻烦"的最好切口。
    ` },

    { t: 'compare', id: 'call-table', title: '★ 中断与子程序调用的九处不同',
      cols: ['', '子程序调用 CALL', '中断'],
      rows: [
        ['**发生时机**', '程序里写死的，==编译时就确定==', '==随机==，事先不知道会插在哪条指令后'],
        ['**由谁发起**', '程序自己', '中断源（外设）或指令执行本身'],
        ['**入口地址怎么来**', '==CALL 指令里直接给出==', '==硬件产生向量地址==，再查中断向量表'],
        ['**保存断点**', '由 CALL 指令完成（属于指令的功能）', '由==中断隐指令==完成（不是指令）'],
        ['**保存 PSW**', '一般==不保存==', '==保存==（要改 IF 位）'],
        ['**是否关中断**', '不涉及', '==响应时自动关中断=='],
        ['**与原程序的关系**', '同一程序的组成部分，==共享数据、有参数传递==', '==毫不相干的两段程序==，没有参数'],
        ['**返回指令**', '$\\texttt{RET}$，只恢复 PC', '$\\texttt{IRET}$，==还要恢复 PSW、恢复中断允许状态=='],
        ['**特权级**', '不变', '==通常由用户态陷入内核态=='],
      ] },

    { t: 'key', id: 'iret-vs-ret', title: String.raw`$\texttt{IRET}$ 比 $\texttt{RET}$ 多做了什么`, c: String.raw`
      $$\texttt{RET}:\quad \text{栈顶} \to \texttt{PC}$$
      $$\texttt{IRET}:\quad \text{栈顶} \to \texttt{PC},\ \ \text{次栈顶} \to \texttt{PSW}\ (\text{含恢复 IF 位})$$

      ==恢复 $\texttt{PSW}$ 就顺带把中断打开了== —— 因为存进去的那份 PSW 是
      "被打断之前"的，那时候中断是开着的。
      所以流程图最后那步"开中断"往往==不需要单独写一条开中断指令==，
      $\texttt{IRET}$ 自己就带了。

      （王道的流程图里把"开中断"单列一步，是为了讲清楚逻辑，
      不代表一定有一条独立的 $\texttt{STI}$。两种写法答题都算对。）
    ` },

    /* ================================================================== */
    { t: 'h', id: 'precise', c: '八、流水线里的中断：精确异常' },

    { t: 'md', c: String.raw`
      前面说的"等一条指令执行完再响应"，在**单周期 / 多周期 CPU** 上是清楚的。
      到了**流水线**上，==同一时刻有五条指令处在不同阶段==，
      "执行完"这句话就需要重新定义了。这一节是 CPU 章和流水线那一节的接缝，
      也是很多人复习时的盲区。
    ` },

    { t: 'diagram', id: 'pipeline-exception', title: '五级流水线中，第 3 条指令在 MEM 段缺页',
      note: '红格 = 必须作废；异常之前的指令一条都不能丢',
      caption: String.raw`==难点在于"异常被发现时，后面的指令已经跑了好几段"==。硬件必须把时间倒回到 $\texttt{I3}$ 之前的那个干净状态，这就是[精确异常](#/co/cpu/exception?at=precise-def)要付的代价。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 254" role="img" aria-label="五级流水线中第三条指令在 MEM 段缺页时，前后指令的处理">
  <text class="lb" x="0" y="16">时间 →</text>
  <text class="lb" x="133.0" y="16" text-anchor="middle">1</text>
  <text class="lb" x="207.0" y="16" text-anchor="middle">2</text>
  <text class="lb" x="281.0" y="16" text-anchor="middle">3</text>
  <text class="lb" x="355.0" y="16" text-anchor="middle">4</text>
  <text class="lb" x="429.0" y="16" text-anchor="middle">5</text>
  <text class="lb" x="503.0" y="16" text-anchor="middle">6</text>
  <text class="lb" x="577.0" y="16" text-anchor="middle">7</text>
  <text class="lb" x="88" y="39" text-anchor="end" dominant-baseline="central">I1 已提交</text>
  <g class="n k"><rect x="96" y="26" width="71" height="26" rx="4"/><text class="bt xs" x="131.5" y="39.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="170" y="26" width="71" height="26" rx="4"/><text class="bt xs" x="205.5" y="39.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="244" y="26" width="71" height="26" rx="4"/><text class="bt xs" x="279.5" y="39.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="318" y="26" width="71" height="26" rx="4"/><text class="bt xs" x="353.5" y="39.0" text-anchor="middle" dominant-baseline="central">MEM</text></g>
  <g class="n m"><rect x="392" y="26" width="71" height="26" rx="4"/><text class="bt xs" x="427.5" y="39.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="lb" x="88" y="71" text-anchor="end" dominant-baseline="central">I2</text>
  <g class="n k"><rect x="170" y="58" width="71" height="26" rx="4"/><text class="bt xs" x="205.5" y="71.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="244" y="58" width="71" height="26" rx="4"/><text class="bt xs" x="279.5" y="71.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="318" y="58" width="71" height="26" rx="4"/><text class="bt xs" x="353.5" y="71.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n p"><rect x="392" y="58" width="71" height="26" rx="4"/><text class="bt xs" x="427.5" y="71.0" text-anchor="middle" dominant-baseline="central">MEM</text></g>
  <g class="n m"><rect x="466" y="58" width="71" height="26" rx="4"/><text class="bt xs" x="501.5" y="71.0" text-anchor="middle" dominant-baseline="central">WB</text></g>
  <text class="lb" x="546" y="75">必须让它完成</text>
  <text class="lb" x="88" y="103" text-anchor="end" dominant-baseline="central">I3 出异常</text>
  <g class="n k"><rect x="244" y="90" width="71" height="26" rx="4"/><text class="bt xs" x="279.5" y="103.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n g"><rect x="318" y="90" width="71" height="26" rx="4"/><text class="bt xs" x="353.5" y="103.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n a"><rect x="392" y="90" width="71" height="26" rx="4"/><text class="bt xs" x="427.5" y="103.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <g class="n r"><rect x="466" y="90" width="71" height="26" rx="4"/><text class="bt xs" x="501.5" y="103.0" text-anchor="middle" dominant-baseline="central">MEM ✗</text></g>
  <text class="lb" x="546" y="107">缺页在这里发现</text>
  <text class="lb" x="88" y="135" text-anchor="end" dominant-baseline="central">I4</text>
  <g class="n r"><rect x="318" y="122" width="71" height="26" rx="4"/><text class="bt xs" x="353.5" y="135.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n r"><rect x="392" y="122" width="71" height="26" rx="4"/><text class="bt xs" x="427.5" y="135.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <g class="n r"><rect x="466" y="122" width="71" height="26" rx="4"/><text class="bt xs" x="501.5" y="135.0" text-anchor="middle" dominant-baseline="central">EX</text></g>
  <text class="lb" x="546" y="139">必须作废</text>
  <text class="lb" x="88" y="167" text-anchor="end" dominant-baseline="central">I5</text>
  <g class="n r"><rect x="392" y="154" width="71" height="26" rx="4"/><text class="bt xs" x="427.5" y="167.0" text-anchor="middle" dominant-baseline="central">IF</text></g>
  <g class="n r"><rect x="466" y="154" width="71" height="26" rx="4"/><text class="bt xs" x="501.5" y="167.0" text-anchor="middle" dominant-baseline="central">ID</text></g>
  <text class="lb" x="546" y="171">必须作废</text>
  <g class="n g"><rect x="20" y="196" width="656" height="46" rx="8"/><text class="bt sm" x="348.0" y="209.0" text-anchor="middle" dominant-baseline="central">精确异常的三条要求</text><text class="bs" x="348.0" y="229.0" text-anchor="middle" dominant-baseline="central">异常点之前的全部完成 · 出异常那条不留副作用 · 之后的全部作废（flush）</text></g>
</svg>
` },

    { t: 'key', id: 'precise-def', title: '精确异常与不精确异常', c: String.raw`
      **精确异常**：异常发生时，能保证==异常之前的所有指令都已完整执行完毕，
      之后的所有指令都未产生任何影响==，机器状态就像"程序恰好执行到这条指令"一样干净。

      **为什么必须精确**：
      ==缺页处理完之后要重新执行那条指令==（见[上面](#/co/cpu/exception?at=fault-restart)）。
      如果后面几条指令已经把寄存器改了，重新执行的结果就是错的。
      虚拟存储器==只有在精确异常之上才可能实现==。

      **硬件怎么做到**：异常不在发现的那一拍立刻处理，
      而是==把异常标志跟着这条指令在流水段之间一路传下去==，
      直到最后一段（写回 / 提交）才统一处理。这样"谁先谁后"就由流水线顺序天然决定了。

      **不精确异常**：允许状态不干净，硬件简单、速度快，
      但==操作系统无法恢复==，只能用于"反正要终止程序"的场合（浮点异常曾这么处理过）。
      现代通用处理器一律要求精确异常。
    ` },

    { t: 'warn', id: 'pipeline-cost', title: '流水线让中断更贵', c: String.raw`
      非流水线 CPU 响应一次中断的额外代价约等于"保存断点 + 保护现场"。
      流水线 CPU 还要==排空整条流水线==：
      作废后面几条指令、等前面的指令提交完，
      再把中断服务程序的指令==从头灌满流水线==。

      所以 ==中断响应时间在流水线 / 超标量机器上要长得多==，
      这也是为什么现代 CPU 拼命想把中断次数降下来（合并中断、DMA、轮询式驱动）。

      顺带一提，==精确异常这套"作废后续指令"的机制还被投机执行借用了==
      —— 分支预测错了也是用它把结果清干净的，
      见[投机执行与 Spectre](#/co/cpu/pipeline?at=speculation)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '九、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: 'CPU 视角这半边的固定失分点', c: String.raw`
      1. **"保存断点和保护现场都是硬件做的"** —— ==断点硬件，现场软件==，
         见[对比表](#/co/cpu/exception?at=bp-scene-table)。
      2. **"中断隐指令是一条指令"** —— ==它不是指令==，没有操作码，程序员调不了。
      3. **"外中断可以在指令执行中途响应"** —— ==必须在指令边界==；
         能在中途发生的是异常，能在总线周期边界插入的是 DMA。
      4. **"关中断能屏蔽一切"** —— ==NMI 和异常都关不掉==。
      5. **"缺页处理完接着执行下一条"** —— ==故障要重新执行本条==；
         只有自陷和外中断才走下一条，见[返回地址表](#/co/cpu/exception?at=return-table)。
      6. **"中断向量就是向量地址"** —— ==向量地址是"入口地址存在哪"，
         中断向量才是入口地址本身==，见[三个词](#/co/io/interrupt?at=vector-three-words)。
      7. **"$\texttt{RET}$ 和 $\texttt{IRET}$ 一样"** —— ==$\texttt{IRET}$ 还要恢复 PSW==。
      8. **"DMA 请求和中断请求抢的是同一个东西"** —— ==DMA 抢总线，中断抢 CPU==。
      9. **"系统调用属于外中断"** —— ==自陷是内中断==，由指令主动引发。
      10. **把中断周期漏掉** —— CPU 工作周期是==取指 / 间址 / 执行 / 中断==四个。
    ` },

    { t: 'md', c: String.raw`
      ---

      这一页管到"CPU 被打断的那一拍"为止。
      从**中断请求怎么登记、多个请求谁先响应、进去之后能不能再被打断、
      一次中断到底花多少时间**开始，都在
      [中断响应与处理流程](#/co/io/interrupt?at=timeline)。
    ` },

  ],
});
