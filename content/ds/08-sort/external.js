/* ==========================================================================
   数据结构 / 8 排序 / 外部排序与败者树
   ========================================================================== */

KM.page({
  path: 'ds/sort/external',
  title: '外部排序与败者树',
  subtitle: '当数据装不进内存，衡量标准就从「比较次数」变成了「读写磁盘多少遍」',
  tags: ['必考', '综合应用', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'why', c: '一、外部排序的代价模型' },

    { t: 'key', id: 'model', title: '瓶颈从 CPU 变成了 I/O', c: String.raw`
      **外部排序**：待排序的记录量太大，==内存一次装不下==，
      必须在内存与外存（磁盘 / 磁带）之间==多次交换数据==。

      **代价模型彻底变了**：一次磁盘 I/O 的时间比一次内存比较慢几个数量级，
      所以

      $$\boxed{\text{外部排序的时间}\approx\text{读写外存的次数}}$$

      内部排序里我们数"比较次数"，外部排序里我们数"==扫了几遍数据=="。
      ==所有优化手段都是为了减少这个遍数==。
    ` },

    { t: 'steps', id: 'two-phases', title: '外部排序的两个阶段', items: [
      { title: '生成初始归并段（run）', c: String.raw`把外存文件分段读入内存，
        ==每次读满内存工作区（能装 $w$ 个记录）就用一种内部排序排好，再写回外存==。
        这样得到 $r=\lceil n/w\rceil$ 个**初始归并段**，每段内部有序。
        这一步==读写各一遍全部数据==。` },
      { title: '多路归并', c: String.raw`把 $k$ 个归并段归并成一个更长的段，反复进行，
        直到只剩一段。==每一趟归并同样读写各一遍全部数据==。
        趟数 $S=\lceil\log_k r\rceil$。` },
    ] },

    { t: 'formulas', id: 'io-formulas', title: '外部排序的三个基本量', items: [
      { label: '初始归并段个数（$w$ 为内存可容纳的记录数）', tex: String.raw`r=\left\lceil \frac{n}{w}\right\rceil` },
      { label: '$k$ 路归并的趟数', tex: String.raw`S=\lceil \log_k r\rceil` },
      { label: '外存读写总次数（以"块"为单位，共 $m$ 块）', tex: String.raw`2m\,(S+1)` },
    ] },

    { t: 'key', id: 'reduce-io', title: '★ 减少 I/O 的三条路（简答题主干）', c: String.raw`
      由 $S=\lceil\log_k r\rceil$ 可见，要减少趟数只有两个变量可动：

      **① 增大归并路数 $k$** —— 趟数按 $\log_k$ 下降，见效最快。
      **代价**：内存里要同时维护 $k$ 个输入缓冲区，$k$ 太大内存放不下；
      而且==每选出一个最小记录，朴素做法要比较 $k-1$ 次==，
      内部比较总量反而随 $k$ 上升。
      ==这个副作用由[败者树](#/ds/sort/external?at=loser-tree)解决==。

      **② 减少初始归并段个数 $r$** —— 让每个初始段更长。
      ==[置换-选择排序](#/ds/sort/external?at=replace-select)可以把平均段长从 $w$ 提到 $2w$==，
      于是 $r$ 减半。

      **③ 优化归并的顺序** —— 段长不等时，
      ==[最佳归并树](#/ds/sort/external?at=best-merge)让长段少参与几趟归并==。

      **一句话总结**：==$k$ 靠败者树撑住，$r$ 靠置换-选择压小，顺序靠哈夫曼树安排==。
      这三条就是外部排序这一节的全部内容。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'loser-tree', c: '二、败者树' },

    { t: 'key', id: 'loser-idea', title: '为什么不用"胜者树"而用"败者树"', c: String.raw`
      $k$ 路归并每次要从 $k$ 个段的当前首元素中选最小的。
      朴素做法要 ==$k-1$ 次比较==；用一棵完全二叉树可以降到 ==$\lceil\log_2 k\rceil$ 次==。

      **败者树的结构**：

      - ==$k$ 个叶结点==存放各归并段当前的首元素；
      - ==$k-1$ 个内部结点==，每个存放它所代表的那场比赛的==败者==（的段号）；
      - 额外的 $ls[0]$ 存放==全局冠军==（最小者所在的段号）。

      **为什么记败者而不是胜者**：
      冠军被取走后，只有那一条从叶子到根的路径需要重新比赛。
      ==记录败者时，新元素沿路只需和"当前结点记的那个败者"比一次==，
      不需要再去访问兄弟子树 —— ==调整过程只访问一条路径上的结点==，实现最简洁。
      记胜者的话，每一层还要回头查兄弟，代码更绕。
    ` },

    { t: 'diagram', id: 'loser-demo', title: '$k=4$ 的败者树',
      note: '内部结点里记的是"败者所在的段号"',
      caption: String.raw`四个段的当前首元素是 $6,\,15,\,9,\,20$。
      $b_0$ 与 $b_1$ 比，$b_1(15)$ 败 → $ls_2=1$；$b_2$ 与 $b_3$ 比，$b_3(20)$ 败 → $ls_3=3$；
      两个胜者 $b_0(6)$ 与 $b_2(9)$ 比，$b_2$ 败 → $ls_1=2$；冠军是 $b_0$，记在 $ls_0$。
      ==取走 $6$ 后，只需让段 0 的新元素沿着这条路径重新比 $\lceil\log_2 4\rceil=2$ 次==，
      不必碰另外半棵树。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 252" role="img" aria-label="四路归并的败者树结构">
  <path class="ar plain" d="M350,42 V66"/>
  <path class="ar plain" d="M350,96 L230,122"/>
  <path class="ar plain" d="M350,96 L470,122"/>
  <path class="ar plain" d="M230,152 L170,186"/>
  <path class="ar plain" d="M230,152 L290,186"/>
  <path class="ar plain" d="M470,152 L410,186"/>
  <path class="ar plain" d="M470,152 L530,186"/>
  <g class="n a"><rect x="306" y="14" width="88" height="28" rx="5"/><text class="bt xs" x="350" y="28" text-anchor="middle" dominant-baseline="central">ls0 = 0（冠军）</text></g>
  <g class="n p"><rect x="306" y="68" width="88" height="28" rx="5"/><text class="bt xs" x="350" y="82" text-anchor="middle" dominant-baseline="central">ls1 = 2（败者）</text></g>
  <g class="n p"><rect x="186" y="124" width="88" height="28" rx="5"/><text class="bt xs" x="230" y="138" text-anchor="middle" dominant-baseline="central">ls2 = 1（败者）</text></g>
  <g class="n p"><rect x="426" y="124" width="88" height="28" rx="5"/><text class="bt xs" x="470" y="138" text-anchor="middle" dominant-baseline="central">ls3 = 3（败者）</text></g>
  <g class="n g"><rect x="132" y="188" width="76" height="34" rx="5"/><text class="bt xs" x="170" y="199" text-anchor="middle" dominant-baseline="central">b0 = 6</text><text class="bs" x="170" y="214" text-anchor="middle" dominant-baseline="central">段 0</text></g>
  <g class="n k"><rect x="252" y="188" width="76" height="34" rx="5"/><text class="bt xs" x="290" y="199" text-anchor="middle" dominant-baseline="central">b1 = 15</text><text class="bs" x="290" y="214" text-anchor="middle" dominant-baseline="central">段 1</text></g>
  <g class="n k"><rect x="372" y="188" width="76" height="34" rx="5"/><text class="bt xs" x="410" y="199" text-anchor="middle" dominant-baseline="central">b2 = 9</text><text class="bs" x="410" y="214" text-anchor="middle" dominant-baseline="central">段 2</text></g>
  <g class="n k"><rect x="492" y="188" width="76" height="34" rx="5"/><text class="bt xs" x="530" y="199" text-anchor="middle" dominant-baseline="central">b3 = 20</text><text class="bs" x="530" y="214" text-anchor="middle" dominant-baseline="central">段 3</text></g>
  <text class="lb em" x="588" y="30">输出 6</text>
  <text class="lb" x="588" y="54">然后从段 0 补一个</text>
  <text class="lb" x="588" y="76">新元素上来，沿</text>
  <text class="lb" x="588" y="98">这条路径比 2 次</text>
  <text class="cap" x="14" y="246">绿 = 当前的最小者　　紫 = 记录败者的内部结点</text>
</svg>
` },

    { t: 'key', id: 'loser-effect', title: '★ 败者树带来的关键结论', c: String.raw`
      用败者树后，==每选出一个记录只需 $\lceil\log_2 k\rceil$ 次比较==。
      于是内部归并的总比较次数约为

      $$(n-1)\times S\times\lceil\log_2 k\rceil
      =(n-1)\times\left\lceil\frac{\log_2 r}{\log_2 k}\right\rceil\times\lceil\log_2 k\rceil
      \approx (n-1)\log_2 r$$

      $$\boxed{\text{引入败者树后，内部归并的比较次数与归并路数 }k\ \text{无关}}$$

      **这才是败者树真正的意义**：
      它==消除了"增大 $k$ 会让内部比较变慢"这个副作用==，
      于是我们可以放心地把 $k$ 开大来减少 I/O 趟数，
      ==唯一的限制就只剩下内存能放下多少个缓冲区了==。

      ==这句话是简答题的标准答点，要能原样写出来==。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'replace-select', c: '三、置换-选择排序：把初始段变长' },

    { t: 'key', id: 'rs-idea', title: '让归并段突破内存容量的限制', c: String.raw`
      朴素做法生成的初始段长度==恰好等于内存容量 $w$==。
      **置换-选择排序**能生成==平均长度为 $2w$== 的初始段。

      **算法**（$\mathrm{WA}$ 表示内存工作区，$\mathrm{MINIMAX}$ 表示当前段已输出的最大值）：

      1. 从输入文件读入 $w$ 个记录填满 $\mathrm{WA}$；
      2. 从 $\mathrm{WA}$ 中==选出关键字 $\ge \mathrm{MINIMAX}$ 的记录里最小的那个==，
         记作 $\mathrm{MIN}$，输出到当前归并段，并令 $\mathrm{MINIMAX}=\mathrm{MIN}$；
      3. 从输入文件==补一个新记录进 $\mathrm{WA}$==（填上刚空出的位置）；
      4. 重复 2~3。==若 $\mathrm{WA}$ 中已没有 $\ge \mathrm{MINIMAX}$ 的记录==，
         说明当前段结束，==令 $\mathrm{MINIMAX}=-\infty$，开始新的一段==；
      5. 直到输入文件读完且 $\mathrm{WA}$ 清空。

      **为什么能变长**：新补进来的记录==如果比 $\mathrm{MINIMAX}$ 大，就还能加入当前段==，
      相当于"边输出边补货"，段长自然超过 $w$。
      ==平均长度是 $2w$（可以用"扫雪机模型"直观解释）==。

      **代价**：选 $\mathrm{MIN}$ 的过程可以用==败者树==加速，但每次输出都要重新调整；
      而且==生成的各个归并段长度不再相等==，
      这就引出了下一节的最佳归并树问题。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'best-merge', c: '四、最佳归并树' },

    { t: 'key', id: 'best-idea', title: '$k$ 叉哈夫曼树：让长段少读几遍', c: String.raw`
      置换-选择之后各归并段长度不等。
      ==一个段每参与一趟归并，就要被读一遍、写一遍==，
      所以"总 I/O 量"正比于

      $$\mathrm{WPL}=\sum_i (\text{第 }i\text{ 段的长度})\times(\text{它参与归并的趟数})$$

      这==正是[带权路径长度](#/ds/tree/huffman?at=wpl-def)==！
      于是问题变成：**以各段长度为叶子权值，构造一棵 $k$ 叉哈夫曼树**。

      **构造方法**：每次取==当前最小的 $k$ 个段==合并，新段长度为它们之和，放回队列。
      ==和二叉哈夫曼树完全一样，只是每次取 $k$ 个而不是 2 个==。
    ` },

    { t: 'key', id: 'virtual-seg', title: '★ 虚段：什么时候要补 0，补几个', c: String.raw`
      $k$ 路归并每合并一次，段数减少 $k-1$。要最终恰好剩 1 段，必须

      $$(r-1)\ \bmod\ (k-1)=0$$

      若不满足，就==补若干个长度为 $0$ 的**虚段**==，令 $r'$ 满足上式。

      $$\text{需补的虚段数}=(k-1)-\big[(r-1)\bmod (k-1)\big]$$

      **虚段必须放在第一轮合并里**（即==放在树的最底层==）——
      因为虚段长度为 0、不贡献 I/O，==把它们放在最深处才不会挤占真实段的位置==。

      **例**：$r=8$ 个归并段做 $3$ 路归并。
      $(8-1)\bmod 2=1\ne 0$，需补 $2-1=1$ 个虚段，按 $r'=9$ 来构造 3 叉哈夫曼树。

      ==这一条和 [$m$ 叉哈夫曼树补虚结点](#/ds/tree/huffman?at=m-ary-rule)是同一件事==。
    ` },

    { t: 'example', id: 'ex-io',
      title: '★ 算 I/O 次数与归并趟数',
      source: '经典计算题',
      level: 3,
      problem: String.raw`
        某文件含 $4500$ 个记录，磁盘每块可存放 $75$ 个记录，
        内存工作区可容纳 $3$ 个块的数据。

        (1) 若用普通方法生成初始归并段，可得多少个初始归并段？
        (2) 若做 $3$ 路归并，需要几趟？总的外存读写次数是多少（以块计）？
        (3) 若改用 $6$ 路归并，趟数变成多少？
      `,
      idea: String.raw`
        ==先把单位统一成"块"==：总块数 $m=4500/75=60$ 块，内存能装 3 块。

        然后三个量依次代入：
        $r=\lceil m/(\text{内存块数})\rceil$、$S=\lceil\log_k r\rceil$、
        读写次数 $=2m(S+1)$。

        ==那个 $+1$ 是生成初始归并段的那一趟==，很多人漏掉。
      `,
      solution: String.raw`
        总块数 $m=\dfrac{4500}{75}=60$ 块，内存工作区 $=3$ 块。

        **(1)** 每次读满内存（3 块）排一段：

        $$r=\left\lceil\frac{60}{3}\right\rceil=\boxed{20}\ \text{个初始归并段}$$

        每段含 $3\times 75=225$ 个记录。

        **(2)** $3$ 路归并的趟数：

        $$S=\lceil\log_3 20\rceil=\lceil 2.73\rceil=\boxed{3}\ \text{趟}$$

        （验证：$20\to\lceil 20/3\rceil=7\to\lceil 7/3\rceil=3\to 1$，共 3 趟 ✓）

        总读写次数（每趟都要把 60 块读一遍、写一遍，再加生成初始段的那一趟）：

        $$2m(S+1)=2\times 60\times(3+1)=\boxed{480}\ \text{次}$$

        **(3)** $6$ 路归并：

        $$S=\lceil\log_6 20\rceil=\lceil 1.67\rceil=\boxed{2}\ \text{趟}$$

        （验证：$20\to\lceil 20/6\rceil=4\to 1$，共 2 趟 ✓）

        总读写次数降为 $2\times 60\times 3=360$ 次，==比 3 路归并省了 25%==。
      `,
      comment: String.raw`
        **两个自查方法**：

        1. ==用"每趟段数除以 $k$ 向上取整"的方式手动数一遍趟数==，
           和对数公式互相验证。$\lceil\log_k r\rceil$ 在 $r$ 恰好是 $k$ 的幂附近容易算错。
        2. ==读写次数一定是偶数==（读一次必配一次写）。

        **最常见的两个错**：
        1. ==漏掉 $S+1$ 里的那个 $+1$==（生成初始归并段的一趟）；
        2. ==把 $r$ 算成 $60$==（忘了内存能装 3 块，一次能排 3 块）。

        **顺带看到了 $k$ 的威力**：$k$ 从 3 提到 6，趟数从 3 降到 2。
        ==但 $k$ 越大，内存里要开的缓冲区越多==，
        而且没有[败者树](#/ds/sort/external?at=loser-effect)的话内部比较会变慢 ——
        这就是败者树存在的理由。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **读写次数漏掉 $+1$** —— ==生成初始归并段也要读写一遍全部数据==。
      2. **初始归并段个数按"块数"算** —— 要除以==内存能容纳的块数==。
      3. **趟数公式底数写成 2** —— ==$k$ 路归并是 $\lceil\log_k r\rceil$==。
      4. **说败者树能减少 I/O** —— ==败者树减少的是**内部比较次数**，不是 I/O==；
         它是通过"允许把 $k$ 开大"来间接减少 I/O 的。
      5. **说败者树的内部结点存最小值** —— ==存的是**败者**的段号==，
         冠军单独放在 $ls[0]$。
      6. **置换-选择排序生成的段长恒为 $2w$** —— ==是**平均** $2w$==，不是恒定。
      7. **最佳归并树忘了补虚段** —— 最后一轮凑不齐 $k$ 个。
      8. **虚段放在树的上层** —— ==必须放在最底层==。
      9. **认为外部排序的内部排序方法很关键** —— ==不关键==，
         瓶颈在 I/O，生成初始段用哪种内部排序对总时间影响很小。
      10. **把归并路数 $k$ 和内存工作区容量 $w$ 混为一谈** —— 是两个独立的量。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      这一节的三个技术其实各自针对公式 $S=\lceil\log_k r\rceil$ 里的一个位置：

      - ==败者树管分母 $\log_2 k$== —— 让 $k$ 可以放心开大；
      - ==置换-选择管分子里的 $r$== —— 让段数减半；
      - ==最佳归并树管"每段各走几趟"== —— 让长段走得少。

      ==把公式写在草稿最上面，再看这三个技术分别动了哪一项==，
      这一节就不用背了。
    ` },

  ],
});
