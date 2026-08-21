/* ==========================================================================
   数据结构 / 3 栈、队列与数组 / 特殊矩阵与稀疏矩阵的压缩存储
   ========================================================================== */

KM.page({
  path: 'ds/stack-queue/special-matrix',
  title: '特殊矩阵与稀疏矩阵的压缩存储',
  subtitle: '所有下标映射公式都只做一件事：数一数"我前面还有多少个元素" —— 会数就不用背',
  tags: ['必考', '手算', '概念辨析'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'array', c: '一、数组的存储与地址计算' },

    { t: 'key', id: 'row-col-major', title: '行优先与列优先', c: String.raw`
      二维数组 $A[m][n]$（下标从 0 开始，每个元素占 $L$ 个单元）：

      | 存储方式 | 地址公式 | 含义 |
      |---|---|---|
      | **行优先**（C 语言） | $\mathrm{LOC}(a_{ij})=\mathrm{LOC}(a_{00})+(i\cdot n+j)\cdot L$ | ==先把一行放完再放下一行== |
      | **列优先**（Fortran） | $\mathrm{LOC}(a_{ij})=\mathrm{LOC}(a_{00})+(j\cdot m+i)\cdot L$ | ==先把一列放完再放下一列== |

      **怎么记**：==行优先时，$a_{ij}$ 前面有 $i$ 个完整的行（每行 $n$ 个）再加 $j$ 个==，
      所以是 $i\cdot n+j$。列优先把行列角色互换即可。

      ==公式不用背，现数一遍"前面有几个"就出来了== ——
      这个思路是本页所有压缩公式的通法。

      **若下标从 1 开始**（$A[1..m][1..n]$），把 $i,j$ 各减 1 即可：
      $$\mathrm{LOC}(a_{ij})=\mathrm{LOC}(a_{11})+\big[(i-1)n+(j-1)\big]L$$
    ` },

    { t: 'key', id: 'why-compress', title: '什么叫"压缩存储"', c: String.raw`
      **压缩存储**：==为多个值相同的元素只分配一个存储空间，对零元素不分配空间==。

      两类可以压缩的矩阵：

      - **特殊矩阵**：==非零元素的分布有规律==（对称、三角、对角）
        → 用==下标映射公式==把二维压成一维；
      - **稀疏矩阵**：==非零元素很少且分布没有规律==
        → 只存非零元素及其位置（三元组、十字链表）。

      =="有规律"和"没规律"是这两类的分界线==，也决定了用公式还是用表。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'symmetric', c: '二、对称矩阵' },

    { t: 'key', id: 'sym-rule', title: '只存一半：下三角 + 主对角线', c: String.raw`
      $n$ 阶方阵满足 $a_{ij}=a_{ji}$ 时称为**对称矩阵**。
      只需存==下三角（含主对角线）==，共

      $$1+2+\dots+n=\frac{n(n+1)}{2}\ \text{个元素}$$

      设存入一维数组 $B[0..\frac{n(n+1)}{2}-1]$，==矩阵下标 $i,j$ 从 1 开始==，则

      $$k=\begin{cases}
      \dfrac{i(i-1)}{2}+j-1, & i\ge j\ \text{（下三角）}\\[10pt]
      \dfrac{j(j-1)}{2}+i-1, & i<j\ \text{（上三角，换成对称位置）}
      \end{cases}$$

      **推导（不要背，现推）**：$a_{ij}$（下三角）前面有
      - 完整的 $i-1$ 行，第 $1$ 行 1 个、第 $2$ 行 2 个……第 $i-1$ 行 $i-1$ 个，
        共 $\frac{i(i-1)}{2}$ 个；
      - 本行中 $a_{ij}$ 之前还有 $j-1$ 个。

      加起来就是它的"序号 $-1$"，即数组下标 $k$。
    ` },

    { t: 'diagram', id: 'sym-map', title: '$4$ 阶对称矩阵的下标映射',
      note: '格子里的数字是它在一维数组中的下标 k',
      caption: String.raw`==上三角的元素不单独存==，访问 $a_{ij}\ (i<j)$ 时先换成 $a_{ji}$ 再查表。
      验证公式：$a_{32}$ 有 $i=3,j=2$，
      $k=\frac{3\times 2}{2}+2-1=3+1=4$ ✓ 与图中一致。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 250" role="img" aria-label="四阶对称矩阵压缩存储到一维数组的下标映射">
  <text class="cap" x="30" y="34">j=</text>
  <text class="cap" x="76" y="34">1</text><text class="cap" x="120" y="34">2</text><text class="cap" x="164" y="34">3</text><text class="cap" x="208" y="34">4</text>
  <text class="cap" x="30" y="60">1</text>
  <text class="cap" x="30" y="94">2</text>
  <text class="cap" x="30" y="128">3</text>
  <text class="cap" x="30" y="162">4</text>
  <g class="n k"><rect x="60" y="42" width="40" height="30" rx="4"/><text class="bt xs" x="80" y="57" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n m"><rect x="104" y="42" width="40" height="30" rx="4"/><text class="bt xs" x="124" y="57" text-anchor="middle" dominant-baseline="central">·</text></g>
  <g class="n m"><rect x="148" y="42" width="40" height="30" rx="4"/><text class="bt xs" x="168" y="57" text-anchor="middle" dominant-baseline="central">·</text></g>
  <g class="n m"><rect x="192" y="42" width="40" height="30" rx="4"/><text class="bt xs" x="212" y="57" text-anchor="middle" dominant-baseline="central">·</text></g>
  <g class="n k"><rect x="60" y="76" width="40" height="30" rx="4"/><text class="bt xs" x="80" y="91" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="104" y="76" width="40" height="30" rx="4"/><text class="bt xs" x="124" y="91" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n m"><rect x="148" y="76" width="40" height="30" rx="4"/><text class="bt xs" x="168" y="91" text-anchor="middle" dominant-baseline="central">·</text></g>
  <g class="n m"><rect x="192" y="76" width="40" height="30" rx="4"/><text class="bt xs" x="212" y="91" text-anchor="middle" dominant-baseline="central">·</text></g>
  <g class="n k"><rect x="60" y="110" width="40" height="30" rx="4"/><text class="bt xs" x="80" y="125" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n a"><rect x="104" y="110" width="40" height="30" rx="4"/><text class="bt xs" x="124" y="125" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n k"><rect x="148" y="110" width="40" height="30" rx="4"/><text class="bt xs" x="168" y="125" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n m"><rect x="192" y="110" width="40" height="30" rx="4"/><text class="bt xs" x="212" y="125" text-anchor="middle" dominant-baseline="central">·</text></g>
  <g class="n k"><rect x="60" y="144" width="40" height="30" rx="4"/><text class="bt xs" x="80" y="159" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n k"><rect x="104" y="144" width="40" height="30" rx="4"/><text class="bt xs" x="124" y="159" text-anchor="middle" dominant-baseline="central">7</text></g>
  <g class="n k"><rect x="148" y="144" width="40" height="30" rx="4"/><text class="bt xs" x="168" y="159" text-anchor="middle" dominant-baseline="central">8</text></g>
  <g class="n k"><rect x="192" y="144" width="40" height="30" rx="4"/><text class="bt xs" x="212" y="159" text-anchor="middle" dominant-baseline="central">9</text></g>
  <text class="lb" x="252" y="60">灰点 = 上三角，不存</text>
  <text class="lb em" x="252" y="130">琥珀 = a₃₂ → k = 4</text>
  <g class="n g"><rect x="420" y="42" width="266" height="76" rx="7"/>
    <text class="bt sm" x="553" y="62" text-anchor="middle" dominant-baseline="central">k = i(i−1)/2 + j − 1　（i ≥ j）</text>
    <text class="bs" x="553" y="86" text-anchor="middle" dominant-baseline="central">前 i−1 行共 i(i−1)/2 个</text>
    <text class="bs" x="553" y="106" text-anchor="middle" dominant-baseline="central">本行之前还有 j−1 个</text></g>
  <text class="cap" x="420" y="146">共存 n(n+1)/2 = 10 个元素</text>
  <text class="cap" x="14" y="196">一维数组 B</text>
  <g class="n k"><rect x="120" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="146" y="220" text-anchor="middle" dominant-baseline="central">0</text></g>
  <g class="n k"><rect x="174" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="200" y="220" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="n k"><rect x="228" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="254" y="220" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="n k"><rect x="282" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="308" y="220" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="n a"><rect x="336" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="362" y="220" text-anchor="middle" dominant-baseline="central">4</text></g>
  <g class="n k"><rect x="390" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="416" y="220" text-anchor="middle" dominant-baseline="central">5</text></g>
  <g class="n k"><rect x="444" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="470" y="220" text-anchor="middle" dominant-baseline="central">6</text></g>
  <g class="n k"><rect x="498" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="524" y="220" text-anchor="middle" dominant-baseline="central">7</text></g>
  <g class="n k"><rect x="552" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="578" y="220" text-anchor="middle" dominant-baseline="central">8</text></g>
  <g class="n k"><rect x="606" y="204" width="52" height="32" rx="4"/><text class="bt xs" x="632" y="220" text-anchor="middle" dominant-baseline="central">9</text></g>
</svg>
` },

    /* ================================================================== */
    { t: 'h', id: 'triangle', c: '三、三角矩阵' },

    { t: 'key', id: 'tri-rule', title: '下三角矩阵与上三角矩阵', c: String.raw`
      **下三角矩阵**：上三角区==全部是同一个常数 $c$==。
      存下三角的 $\frac{n(n+1)}{2}$ 个，==再用最后一个位置存那个常数 $c$==，
      共 $\frac{n(n+1)}{2}+1$ 个单元。

      $$k=\begin{cases}
      \dfrac{i(i-1)}{2}+j-1, & i\ge j\\[10pt]
      \dfrac{n(n+1)}{2}, & i<j\ \text{（都指向那个常数）}
      \end{cases}$$

      **上三角矩阵**：下三角区全是常数 $c$。存上三角：

      $$k=\begin{cases}
      \dfrac{(i-1)(2n-i+2)}{2}+(j-i), & i\le j\\[10pt]
      \dfrac{n(n+1)}{2}, & i>j
      \end{cases}$$

      **上三角公式的推导**：第 1 行有 $n$ 个、第 2 行 $n-1$ 个……第 $i-1$ 行有 $n-i+2$ 个，
      是首项 $n$、末项 $n-i+2$、共 $i-1$ 项的等差数列，和为
      $\frac{(i-1)(n+n-i+2)}{2}=\frac{(i-1)(2n-i+2)}{2}$；
      本行中 $a_{ij}$ 之前还有 $j-i$ 个。

      ==下三角公式和对称矩阵完全相同==（都是按行存下三角），
      ==只有上三角公式需要单独推==，因为它每行的元素个数是递减的。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'tridiag', c: '四、三对角矩阵（带状矩阵）' },

    { t: 'key', id: 'tri-diag', title: '$|i-j|\\le 1$ 的元素才非零', c: String.raw`
      **三对角矩阵**：只有主对角线及其上下各一条对角线上的元素可能非零，
      即 ==$|i-j|>1$ 时 $a_{ij}=0$==。

      非零元素共 ==$3n-2$== 个（第 1 行和第 $n$ 行各 2 个，中间 $n-2$ 行各 3 个）。

      按行优先存入 $B[0..3n-3]$（$i,j$ 从 1 开始）：

      $$\boxed{k=2i+j-3}$$

      **推导**：$a_{ij}$ 前面有 $i-1$ 个完整的行，共 $2+3(i-2)=3i-4$ 个元素；
      本行的第一个元素是 $a_{i,i-1}$，所以 $a_{ij}$ 是本行第 $j-i+2$ 个。
      $$k=(3i-4)+(j-i+2)-1=2i+j-3$$

      **反过来由 $k$ 求 $i,j$**（这个方向也常考）：

      $$i=\left\lfloor \frac{k+1}{3}\right\rfloor+1,\qquad j=k-2i+3$$

      **验算几个**：$k=0\to i=1,j=1$；$k=4\to i=2,j=3$；$k=5\to i=3,j=2$ ✓
    ` },

    { t: 'method', id: 'derive-any', title: '★ 通法：任何压缩公式都用这三步推', c: String.raw`
      考场上不要回忆公式，==按下面三步现推，30 秒且不会错==：

      1. **数完整的行**：$a_{ij}$ 之前有 $i-1$ 个完整的行，==每行各有几个元素？==
         把这 $i-1$ 个数加起来（通常是等差数列求和）；
      2. **数本行**：在第 $i$ 行里，==$a_{ij}$ 前面还有几个元素？==
         这取决于本行的第一个元素是谁（下三角是 $a_{i1}$，三对角是 $a_{i,i-1}$，
         上三角是 $a_{ii}$）；
      3. **两者相加就是"序号"，减 1 就是数组下标 $k$**（数组从 0 开始时）。

      ==第 2 步是最容易出错的地方==：一定要先确认"本行从哪一列开始有元素"。

      **验算方法**：==代入 $k=0$（第一个元素）和 $k=$ 最大值（最后一个元素）==，
      看结果对不对。两端都对，中间基本不会错。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'sparse', c: '五、稀疏矩阵' },

    { t: 'key', id: 'sparse-rule', title: '三元组表与十字链表', c: String.raw`
      **稀疏矩阵**：非零元素个数 $t$ 远小于 $m\times n$，==且分布没有规律==。

      **① 三元组表（顺序存储）**

      每个非零元素记一条 $(\text{行},\ \text{列},\ \text{值})$，==按行优先排序==：

      ~~~c
      typedef struct { int i, j; ElemType e; } Triple;
      typedef struct {
          Triple data[MAXSIZE];
          int mu, nu, tu;          // 行数、列数、非零元素个数
      } TSMatrix;
      ~~~

      - **优点**：==空间只与非零元素个数有关==；
      - **缺点**：==失去了随机存取能力==（要查 $a_{ij}$ 得在表里找），
        且==插入 / 删除一个非零元素要移动大量三元组==。

      **② 十字链表（链式存储）**

      每个非零元素一个结点，同时==挂在它所在的行链表和列链表上==
      （所以叫"十字"）。

      - **优点**：==插入删除方便==（只改指针），
        适合矩阵运算过程中非零元素个数会变化的场合（如矩阵加法、乘法）；
      - **缺点**：结构复杂，指针开销大。

      ==选择依据：矩阵是否会被修改==。只读用三元组，要改用十字链表。
    ` },

    { t: 'warn', id: 'sparse-trap', title: '压缩之后就不是"随机存取"了', c: String.raw`
      这是稀疏矩阵最重要的一句辨析：

      - ==特殊矩阵（对称 / 三角 / 三对角）压缩后**仍然可以随机存取**==
        —— 因为有下标映射公式，$O(1)$ 就能算出 $k$；
      - ==稀疏矩阵压缩后**不能随机存取**==
        —— 非零元素的位置没有规律，只能==查表==。

      ==判断题经常笼统地问"压缩存储后还能随机存取吗"，答案取决于是哪一类==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '六、例题' },

    { t: 'example', id: 'ex-map',
      title: '★ 三种矩阵的下标映射',
      source: '选择题必考',
      level: 3,
      problem: String.raw`
        以下矩阵的下标 $i,j$ 均从 1 开始，压缩后存入一维数组 $B$（下标从 0 开始）。

        (1) $5$ 阶**对称矩阵**按行优先存下三角，求 $a_{43}$ 在 $B$ 中的下标，
        以及 $a_{25}$ 的下标；
        (2) $n$ 阶**三对角矩阵**，求 $a_{56}$ 的下标（设 $n\ge 6$）；
        以及 $B[10]$ 对应的是哪个元素；
        (3) $6$ 阶**上三角矩阵**（下三角全为常数 $c$），求 $a_{34}$ 的下标。
      `,
      idea: String.raw`
        ==全部用[通法三步](#/ds/stack-queue/special-matrix?at=derive-any)现推==，
        推完再拿公式对一遍。

        (1) 第二问 $a_{25}$ 在上三角，==要先换成 $a_{52}$==。
        (2) 第二问是反向查找，==用 $i=\lfloor (k+1)/3\rfloor+1$==。
        (3) 上三角每行元素个数==递减==，这是和下三角唯一的区别。
      `,
      solution: String.raw`
        **(1) 对称矩阵，$n=5$**

        $a_{43}$：$i=4\ge j=3$，在下三角。
        - 前 3 行共 $1+2+3=6$ 个；
        - 本行 $a_{43}$ 之前有 $a_{41},a_{42}$ 两个。

        $$k=6+2=\boxed{8}$$

        公式验证：$\frac{4\times 3}{2}+3-1=6+2=8$ ✓

        $a_{25}$：$i=2<j=5$，在上三角，==换成 $a_{52}$==：
        $$k=\frac{5\times 4}{2}+2-1=10+1=\boxed{11}$$

        **(2) 三对角矩阵**

        $a_{56}$：$|5-6|=1\le 1$，是存储的元素。
        $$k=2\times 5+6-3=\boxed{13}$$

        $B[10]$ 对应哪个元素：
        $$i=\left\lfloor\frac{10+1}{3}\right\rfloor+1=\lfloor 3.67\rfloor+1=3+1=4$$
        $$j=10-2\times 4+3=10-8+3=5$$
        即 $\boxed{a_{45}}$。验证：$k=2\times 4+5-3=10$ ✓

        **(3) 上三角矩阵，$n=6$**

        $a_{34}$：$i=3\le j=4$，在上三角。
        - 前 2 行：第 1 行 $6$ 个、第 2 行 $5$ 个，共 $11$ 个；
        - 本行从 $a_{33}$ 开始，$a_{34}$ 之前有 $a_{33}$ 一个。

        $$k=11+1=\boxed{12}$$

        公式验证：$\frac{(3-1)(2\times 6-3+2)}{2}+(4-3)=\frac{2\times 11}{2}+1=11+1=12$ ✓
      `,
      comment: String.raw`
        **三处最容易错**：

        1. ==(1) 第二问忘了先把上三角换成下三角==，
           直接代 $i=2,j=5$ 会算出一个毫无意义的数；
        2. ==(2) 反查时先求 $i$ 再求 $j$==，顺序不能反（$j$ 的公式里用到了 $i$）；
        3. ==(3) 把上三角每行元素个数当成递增==。
           上三角是 $n,\ n-1,\ \dots$ 递减，下三角才是 $1,\ 2,\ \dots$ 递增。

        **万能验算**：算完之后==反过来检查"这个 $k$ 是不是落在合法范围内"==。
        (3) 中 $n=6$ 共存 $\frac{6\times 7}{2}=21$ 个，$k$ 应在 $[0,20]$ 内，$12$ ✓。
        算出个 $30$ 就一定错了。
      `,
    },

    { t: 'example', id: 'ex-concept',
      title: '概念辨析五连',
      source: '判断题',
      level: 2,
      problem: String.raw`
        判断对错：

        (1) 数组是一种线性结构；
        (2) 对称矩阵压缩存储后，仍然可以随机存取任一元素；
        (3) 稀疏矩阵用三元组表存储后，仍然可以随机存取任一元素；
        (4) $n$ 阶三对角矩阵的非零元素个数是 $3n$；
        (5) 数组的基本操作只有"存取元素"和"修改元素"，没有插入和删除。
      `,
      idea: String.raw`
        (2)(3) 考的是[有没有下标映射公式](#/ds/stack-queue/special-matrix?at=sparse-trap)。
        (4) 数一数两端的行。
        (5) 想一想数组的定义 —— 它一旦定义好，"结构"就是固定的。
      `,
      solution: String.raw`
        **(1) 对（但要说清楚）。** ==一维数组显然是线性表==；
        多维数组可以看作"元素本身又是数组"的线性表，
        所以数组==是线性结构的推广==。408 里按"是"作答。

        **(2) 对。** ==有下标映射公式，$O(1)$ 算出位置==。

        **(3) 错。** ==三元组表里非零元素的位置没有规律==，
        查 $a_{ij}$ 只能在表中查找，==失去了随机存取能力==。

        **(4) 错。** ==是 $3n-2$ 个==。
        第 1 行只有 $a_{11},a_{12}$ 两个，第 $n$ 行只有 $a_{n,n-1},a_{nn}$ 两个，
        ==这两行各少一个==，所以 $3n-2$。

        **(5) 对。** ==数组一旦被定义，其维数和每维的长度就固定了==，
        不能像线性表那样插入删除元素（那会改变结构）。
        所以数组的基本运算只有==按下标存取和修改==。
      `,
      comment: String.raw`
        **(4) 是最典型的"边界少算"陷阱**。
        同类的还有：$n$ 阶对称矩阵存 $\frac{n(n+1)}{2}$ 个而不是 $\frac{n^2}{2}$，
        ==主对角线上的 $n$ 个元素只算一次==。

        **(5) 的引申**：正因为数组结构固定，
        ==它天然适合作为[顺序表](#/ds/list/seq-list?at=seq-def)、
        [堆](#/ds/sort/select-heap?at=heap-def)、[循环队列](#/ds/stack-queue/queue?at=circular-demo)的底层==
        —— 这些结构都是"在固定容量里做文章"。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '七、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **下标起点搞混** —— ==矩阵 $i,j$ 从 1 起、数组 $k$ 从 0 起==是最常见的约定，
         但题目可能改，==先看清题面==。
      2. **上三角元素不换成对称位置** —— 对称矩阵必须先换成 $a_{ji}$。
      3. **上三角矩阵套用下三角公式** —— ==上三角每行元素个数递减==。
      4. **三对角矩阵非零元素数写成 $3n$** —— ==是 $3n-2$==。
      5. **对称矩阵存储量写成 $\frac{n^2}{2}$** —— ==是 $\frac{n(n+1)}{2}$==。
      6. **三角矩阵忘了那个存常数的位置** —— 共 $\frac{n(n+1)}{2}+1$ 个单元。
      7. **认为稀疏矩阵压缩后还能随机存取** —— ==不能==。
      8. **十字链表 / 三元组的适用场景记反** —— ==要修改用十字链表，只读用三元组==。
      9. **行优先与列优先的公式记混** —— 现数一遍"前面有几个"最稳。
      10. **认为数组支持插入删除** —— ==结构固定，只能存取和修改==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '八、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      这一页看上去有五六个公式，其实==只有一个动作==：

      $$k=\underbrace{(\text{前 }i-1\text{ 行的元素总数})}_{\text{等差数列求和}}
      +\underbrace{(\text{本行中排在它前面的个数})}_{\text{看本行从哪列开始}}$$

      对称 / 下三角的行长是 $1,2,3,\dots$（递增），
      上三角是 $n,n-1,\dots$（递减），
      三对角是 $2,3,3,\dots,3,2$（几乎恒定）。
      ==换的只是那个数列，动作从头到尾没变过==。
    ` },

  ],
});
