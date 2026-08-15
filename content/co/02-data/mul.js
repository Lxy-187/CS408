/* ==========================================================================
   计算机组成原理 / 2 数据的表示和运算 / 整数乘法的实现与优化
   —— 考的不是怎么算乘法，而是「用什么电路算、要几个时钟周期、编译器怎么绕开它」。
   ========================================================================== */

KM.page({
  path: 'co/data/mul',
  title: '整数乘法的实现与优化',
  subtitle: '乘法的底子就是**移位 + 加法**，剩下的全是"用多少硬件换多少时间"',
  tags: ['真题', '概念辨析'],
  updated: '2026-08-11',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'essence', c: '一、乘法的本质：移位 + 加法' },

    { t: 'key', id: 'mul-essence', title: '二进制竖式里没有"乘"这个动作', c: String.raw`
      十进制竖式要背九九表，==二进制竖式不用==：每一位只可能是 0 或 1，
      所以每一步只有两种情况：

      - 乘数该位是 **1** $\Rightarrow$ 把被乘数移到对应位置，==加上去==；
      - 乘数该位是 **0** $\Rightarrow$ ==加 0==，即什么都不做。

      于是 $n$ 位乘法 $=$ ==$n$ 次"判位 → 移位 → 加法"==，
      结果需要 $2n$ 位来放。

      ==这句话是本节所有结论的根==：硬件怎么造、编译器怎么优化，
      都是在问"这 $n$ 次加法是一次做完还是一次做一点"。
    ` },

    { t: 'diagram', id: 'mul-by-hand', title: '13 × 11 的二进制竖式',
      note: '绿 = 加被乘数，灰 = 加 0；每往下一行左移一位',
      caption: String.raw`==二进制竖式里没有"乘法"==：乘数的每一位不是 0 就是 1，所以每个部分积要么是被乘数本身、要么是 0。硬件要做的只有**移位**和**加法**。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 354" role="img" aria-label="13 乘 11 的二进制竖式：四个部分积逐位左移相加">
  <text class="cap" x="0" y="14">13 × 11 的二进制竖式</text>
  <g class="n k"><rect x="266" y="24" width="28" height="30" rx="3"/><text class="bt xs" x="280.0" y="39.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="295" y="24" width="28" height="30" rx="3"/><text class="bt xs" x="309.0" y="39.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="324" y="24" width="28" height="30" rx="3"/><text class="bt xs" x="338.0" y="39.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="353" y="24" width="28" height="30" rx="3"/><text class="bt xs" x="367.0" y="39.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="430" y="44">被乘数 13</text>
  <g class="n k"><rect x="266" y="58" width="28" height="30" rx="3"/><text class="bt xs" x="280.0" y="73.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="295" y="58" width="28" height="30" rx="3"/><text class="bt xs" x="309.0" y="73.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="324" y="58" width="28" height="30" rx="3"/><text class="bt xs" x="338.0" y="73.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="353" y="58" width="28" height="30" rx="3"/><text class="bt xs" x="367.0" y="73.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="430" y="78">乘数 11</text>
  <path class="ar plain" d="M140,96 H382"/>
  <g class="n g"><rect x="266" y="104" width="28" height="30" rx="3"/><text class="bt xs" x="280.0" y="119.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="295" y="104" width="28" height="30" rx="3"/><text class="bt xs" x="309.0" y="119.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="324" y="104" width="28" height="30" rx="3"/><text class="bt xs" x="338.0" y="119.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n g"><rect x="353" y="104" width="28" height="30" rx="3"/><text class="bt xs" x="367.0" y="119.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="430" y="124">乘数第 0 位 = 1 → 加被乘数</text>
  <g class="n g"><rect x="237" y="138" width="28" height="30" rx="3"/><text class="bt xs" x="251.0" y="153.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="266" y="138" width="28" height="30" rx="3"/><text class="bt xs" x="280.0" y="153.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="295" y="138" width="28" height="30" rx="3"/><text class="bt xs" x="309.0" y="153.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n g"><rect x="324" y="138" width="28" height="30" rx="3"/><text class="bt xs" x="338.0" y="153.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="430" y="158">第 1 位 = 1 → 左移 1 位再加</text>
  <g class="n m"><rect x="208" y="172" width="28" height="30" rx="3"/><text class="bt xs" x="222.0" y="187.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="237" y="172" width="28" height="30" rx="3"/><text class="bt xs" x="251.0" y="187.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="266" y="172" width="28" height="30" rx="3"/><text class="bt xs" x="280.0" y="187.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="295" y="172" width="28" height="30" rx="3"/><text class="bt xs" x="309.0" y="187.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <text class="lb" x="430" y="192">第 2 位 = 0 → 加 0</text>
  <g class="n g"><rect x="179" y="206" width="28" height="30" rx="3"/><text class="bt xs" x="193.0" y="221.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="208" y="206" width="28" height="30" rx="3"/><text class="bt xs" x="222.0" y="221.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n g"><rect x="237" y="206" width="28" height="30" rx="3"/><text class="bt xs" x="251.0" y="221.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n g"><rect x="266" y="206" width="28" height="30" rx="3"/><text class="bt xs" x="280.0" y="221.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="430" y="226">第 3 位 = 1 → 左移 3 位再加</text>
  <path class="ar plain" d="M140,244 H382"/>
  <g class="n a"><rect x="150" y="250" width="28" height="30" rx="3"/><text class="bt xs" x="164.0" y="265.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n a"><rect x="179" y="250" width="28" height="30" rx="3"/><text class="bt xs" x="193.0" y="265.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n a"><rect x="208" y="250" width="28" height="30" rx="3"/><text class="bt xs" x="222.0" y="265.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n a"><rect x="237" y="250" width="28" height="30" rx="3"/><text class="bt xs" x="251.0" y="265.0" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n a"><rect x="266" y="250" width="28" height="30" rx="3"/><text class="bt xs" x="280.0" y="265.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n a"><rect x="295" y="250" width="28" height="30" rx="3"/><text class="bt xs" x="309.0" y="265.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n a"><rect x="324" y="250" width="28" height="30" rx="3"/><text class="bt xs" x="338.0" y="265.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n a"><rect x="353" y="250" width="28" height="30" rx="3"/><text class="bt xs" x="367.0" y="265.0" text-anchor="middle" dominant-baseline="central">1</text></g>
  <text class="lb" x="430" y="270">= 143 = 13 × 11  ✓</text>
  <g class="n g"><rect x="20" y="296" width="656" height="46" rx="8"/><text class="bt sm" x="348.0" y="309.0" text-anchor="middle" dominant-baseline="central">四个部分积：13 + 26 + 0 + 104 = 143</text><text class="bs" x="348.0" y="329.0" text-anchor="middle" dominant-baseline="central">n 位 × n 位 → 最多 2n 位，所以硬件里结果寄存器是双倍宽的</text></g>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'hardware', c: '二、两种硬件实现：拿面积换时间' },

    { t: 'compare', id: 'two-impl', title: '★ 这张表直接决定"几个时钟周期"',
      cols: ['', 'ALU + 移位器', '阵列乘法器'],
      rows: [
        ['电路性质', '==时序逻辑==（带寄存器、靠时钟推进）', '==组合逻辑==（一片与门 + 全加器阵列）'],
        ['怎么工作', '循环 $n$ 轮：判位 → 加 → 移位', '所有部分积==同时==产生并层层相加'],
        ['需要几个时钟周期', '**$n$ 个左右，必然多周期**', '**可以一个周期完成**'],
        ['硬件开销', '小（复用现成的 ALU）', '大（面积随 $n^2$ 增长）'],
        ['典型场合', '早期机器、低成本单片机', '现代 CPU 的乘法部件'],
      ] },

    { t: 'key', id: 'comb-vs-seq', title: '判断"能不能一个周期完成"，只看一件事', c: String.raw`
      $$\boxed{\text{组合逻辑} \Rightarrow \text{可以一个周期}\qquad
      \text{时序逻辑} \Rightarrow \text{必然多周期}}$$

      - **组合逻辑**没有状态：输入接进去，信号沿着门电路一路传播，
        延迟一到输出就稳定了。只要把时钟周期设得比这个传播延迟长，
        ==一个周期就能出结果==（代价是这个周期得拉长，或者把它切成流水段）。
      - **时序逻辑**有状态：每一轮的结果要先锁进寄存器，
        ==下一轮才能在它基础上继续==，而锁存必须靠时钟边沿触发。
        要 $n$ 轮就得 $n$ 个时钟。

      所以"用 ALU 和移位器实现的乘法无法在一个时钟周期内完成"==是对的==：
      ALU 一次只做一个加法、移位器一次只移一次，
      $n$ 位乘法要的 $n$ 次加法==排不进一个周期里==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'compiler', c: '三、编译器怎么躲开乘法指令' },

    { t: 'key', id: 'const-mul', title: '变量 × 常数：编译期就拆成移位和加减', c: String.raw`
      乘法指令通常比移位、加减慢好几倍，所以遇到常数乘法，
      ==编译器会直接把它拆掉==（这个优化叫**强度削弱**，strength reduction）：

      | 源码 | 编译后 | 道理 |
      |---|---|---|
      | $x\times 2$ | $x\ll 1$ | 乘 2 的幂 = 左移 |
      | $x\times 5$ | $(x\ll 2)+x$ | $5=4+1$ |
      | $x\times 7$ | $(x\ll 3)-x$ | ==$7=8-1$，用减法比用三次加法省== |
      | $x\times 15$ | $(x\ll 4)-x$ | 同理 |

      ==注意第三、四行的减法==：拆常数时不是只能用加法，
      把常数凑成"$2^k$ 减一点"往往指令更少 —— 这也是选择题爱考的细节
      （题干里写"移位及**加/减**运算指令"，那个"减"不是随便写的）。
    ` },

    { t: 'key', id: 'var-mul-loop', title: '★ 变量 × 变量：一样能用移位加法做，只是要循环', c: String.raw`
      常数乘法能在==编译期==拆开，是因为常数的每一位编译器都看得见。
      变量乘变量看不见，但==并不意味着做不了==——
      把"判位 → 移位 → 加"写成一段**循环**就行了：

      $$\text{while (乘数}\neq 0)\ \{\ \text{末位为 1 就累加；被乘数左移；乘数右移}\ \}$$

      这正是[第一节那个竖式](#/co/data/mul?at=mul-by-hand)的代码化，
      也正是==早期没有硬件乘法器的 CPU 上，编译器实际生成的东西==。

      **区别只在什么时候展开**：

      | | 常数乘法 | 变量乘法 |
      |---|---|---|
      | 谁来拆 | 编译器，==编译期==拆成固定几条指令 | 运行期，==靠循环==一轮轮做 |
      | 指令条数 | 固定且很少 | 与字长有关（循环 $n$ 次） |
      | 能不能做 | 能 | ==也能== |

      所以"两个变量的乘运算**无法**编译为移位及加法等指令的循环实现"
      是==错的==，而且错得很彻底：这句话等于否认了乘法的定义。
    ` },

    { t: 'code', id: 'mul-loop-code', title: '不用乘法指令实现乘法', lang: 'c',
      note: '这段就是硬件里那个循环的软件版',
      c: String.raw`
        int mul(int a, int b) {
            int p = 0;
            while (b != 0) {
                if (b & 1) p += a;    /* 乘数末位是 1，累加当前的被乘数 */
                a <<= 1;              /* 被乘数左移，相当于竖式里错一位 */
                b >>= 1;              /* 乘数右移，检查下一位 */
            }
            return p;
        }
      ` },

    { t: 'key', id: 'booth', title: '补充：带符号数的乘法（了解即可）', c: String.raw`
      上面的做法直接用在补码负数上会出错（符号位被当成了数值位）。
      实际硬件用**布斯（Booth）算法**：==把乘数相邻两位一起看==，
      按 $00/01/10/11$ 决定这一轮是加、是减还是只移位，
      从而让补码的正负数走同一套流程。

      408 大纲对 Booth 的要求很浅，==知道"它是为了统一处理补码正负数"就够了==，
      不用背递推表。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '四、例题' },

    { t: 'example',
      id: 'ex-mul-statements',
      title: '关于整数乘法的四句叙述，哪句错',
      source: '真题 / 错题',
      level: 3,
      problem: String.raw`
        下列关于整数乘法运算的叙述中，**错误**的是（　）。

        **A.** 用阵列乘法器实现乘运算可以在一个时钟周期完成

        **B.** 用 ALU 和移位器实现的乘运算无法在一个时钟周期内完成

        **C.** 变量与常数的乘运算可编译优化为若干条移位及加/减运算指令

        **D.** 两个变量的乘运算无法编译为移位及加法等指令的循环实现
      `,
      idea: String.raw`
        四句话正好分成两组，==一组问硬件、一组问编译==：

        - A、B 在问"几个时钟周期" $\Rightarrow$ 判据只有一个：
          [组合逻辑还是时序逻辑](#/co/data/mul?at=comb-vs-seq)；
        - C、D 在问"能不能用移位加法代替乘法" $\Rightarrow$ 回到
          [乘法的定义](#/co/data/mul?at=mul-essence)。

        ==看到"无法""不能""一定"这种绝对词就要多看一眼==，
        本题的错误项正是其中之一。
      `,
      solution: String.raw`
        **A. 正确。** 阵列乘法器是==纯组合逻辑==（与门阵列 + 全加器阵列），
        所有部分积同时生成、层层相加，信号传播完就出结果，可以在一个周期内完成。

        **B. 正确。** ALU + 移位器是==时序逻辑==：
        每轮只能做一次加法和一次移位，中间结果要锁进寄存器，
        $n$ 位乘法要 $n$ 轮 $\Rightarrow$ ==必然跨多个时钟周期==。

        **C. 正确。** 常数在编译期可见，编译器会做强度削弱：
        $x\times5\to(x\ll2)+x$，$x\times7\to(x\ll3)-x$。

        **D. 错误。** ==变量乘变量完全可以用"移位 + 加法"的循环实现==——
        这就是乘法的本源算法，也是没有硬件乘法器的机器上编译器的实际做法。

        $$\boxed{\text{选 D}}$$
      `,
      comment: String.raw`
        **A 和 B 不矛盾**，这是本题最容易绕晕的地方：
        它们说的是==两种不同的电路==。
        同一件事（乘法），用组合逻辑堆硬件就能一个周期干完，
        用时序逻辑省硬件就得慢慢磨 —— ==这正是"面积换时间"==。

        **顺带记住这条通用判据**（整个组成原理都在用）：

        | 电路 | 例子 | 周期数 |
        |---|---|---|
        | 组合逻辑 | 加法器、阵列乘法器、译码器、多路选择器 | 可以 1 个周期 |
        | 时序逻辑 | 移位迭代乘法、除法、串行进位的迭代结构 | 必然多周期 |
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **把 ALU + 移位器当成能一个周期完成**：它是==时序逻辑==，要 $n$ 轮。
      2. **以为阵列乘法器"太复杂所以更慢"**：它是==组合逻辑==，
         快是用面积换来的（$n^2$ 量级的门）。
      3. **以为变量乘变量只能靠硬件乘法器**：==循环的移位加法一样能做==，
         只是慢。
      4. **忘了常数拆分可以用减法**：$x\times7=(x\ll3)-x$ 比三次加法更省。
      5. **结果位数算错**：$n$ 位 $\times$ $n$ 位最多 ==$2n$ 位==，
         所以乘法结果要用双倍宽的寄存器接。
    ` },

  ],
});
