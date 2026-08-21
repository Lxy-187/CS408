/* ==========================================================================
   数据结构 / 1 绪论与算法分析 / 递归式求解与主定理
   ========================================================================== */

KM.page({
  path: 'ds/intro/recurrence',
  title: '递归式求解与主定理',
  subtitle: '递归算法的复杂度都藏在一个递归式里 —— 展开法、递归树、主定理，三选一',
  tags: ['手算', '综合应用'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'where', c: '一、递归式是怎么来的' },

    { t: 'key', id: 'from-code', title: '看代码写递归式：只需要问三个问题', c: String.raw`
      对一个递归函数，问：

      1. **递归调用了几次？** → 系数 $a$；
      2. **每次调用的规模是多少？** → $n-1$（减法型）还是 $n/b$（除法型）；
      3. **除递归外，这一层还花了多少时间？** → $f(n)$。

      拼起来就是
      $$T(n)=a\,T\!\left(\frac{n}{b}\right)+f(n)\qquad\text{或}\qquad T(n)=a\,T(n-c)+f(n)$$

      **别忘了写边界条件** $T(1)=O(1)$ —— ==解出来的常数项全靠它==。

      **例**：[归并排序](#/ds/sort/merge-radix?at=merge-code)递归排左右两半（$a=2$，规模 $n/2$），
      再花 $O(n)$ 做合并，于是 $T(n)=2T(n/2)+O(n)$。
    ` },

    { t: 'compare', id: 'quick-table', title: '★ 常见递归式速查（背这张表比会推更快）',
      cols: ['递归式', '解', '典型来源'],
      rows: [
        ['$T(n)=T(n/2)+O(1)$', '$O(\\log n)$', '[折半查找](#/ds/search/binary?at=binary-code)'],
        ['$T(n)=T(n/2)+O(n)$', '$O(n)$', '快速选择（平均）'],
        ['$T(n)=2T(n/2)+O(1)$', '$O(n)$', '递归遍历二叉树'],
        ['$T(n)=2T(n/2)+O(n)$', '==$O(n\\log n)$==', '归并排序、快排（平均）'],
        ['$T(n)=2T(n/2)+O(n^2)$', '$O(n^2)$', '——'],
        ['$T(n)=T(n-1)+O(1)$', '$O(n)$', '单链表的递归遍历'],
        ['$T(n)=T(n-1)+O(n)$', '==$O(n^2)$==', '快排最坏、冒泡'],
        ['$T(n)=2T(n-1)+O(1)$', '==$O(2^n)$==', '汉诺塔'],
        ['$T(n)=T(n-1)+T(n-2)+O(1)$', '$O(2^n)$', '朴素斐波那契'],
      ] },

    { t: 'warn', id: 'sub-vs-div', title: '减法型和除法型差别巨大，别看混', c: String.raw`
      ==$T(n/2)$ 和 $T(n-1)$ 只差一个符号，量级差了指数级==：

      - $T(n)=T(n/2)+O(1)\ \Rightarrow\ O(\log n)$ —— 规模==每次减半==，$\log_2 n$ 步到底；
      - $T(n)=T(n-1)+O(1)\ \Rightarrow\ O(n)$ —— 规模==每次减 1==，$n$ 步到底。

      同理 $2T(n/2)$ 是 $O(n)$ 而 $2T(n-1)$ 是 $O(2^n)$。

      ==读代码时一定要确认递归调用传的是 $n/2$ 还是 $n-1$==，
      这是这一节最容易一眼看错的地方。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'three-ways', c: '二、三种解法' },

    { t: 'method', id: 'expand', title: '解法一：展开法（迭代代入）', c: String.raw`
      ==把递归式反复代入自己，直到出现 $T(1)$，然后把这一串加起来==。

      **例**：$T(n)=T(n-1)+n$，$T(1)=1$。

      $$T(n)=T(n-1)+n=T(n-2)+(n-1)+n=\dots=T(1)+2+3+\dots+n$$
      $$=\frac{n(n+1)}{2}=O(n^2)$$

      **例（汉诺塔）**：$T(n)=2T(n-1)+1$，$T(1)=1$。

      技巧是==两边同时加 1==，让它变成纯粹的等比：
      $$T(n)+1=2\big(T(n-1)+1\big)\ \Rightarrow\ T(n)+1=2^{\,n-1}\big(T(1)+1\big)=2^n$$
      $$\boxed{T(n)=2^n-1}$$

      **适用**：==减法型递归式==，或者只调用一次自己的除法型。
      展开两三步之后==看出通项规律==是关键。
    ` },

    { t: 'method', id: 'tree', title: '解法二：递归树（最直观，也最不容易错）', c: String.raw`
      把递归展开画成一棵树：

      - ==每个结点标上"这一层除递归外花的时间"==；
      - ==按层求和==，得到每层的总代价；
      - ==所有层加起来==就是答案。

      要确定三件事：
      1. **树有多高**？规模从 $n$ 缩到 $1$ 要几步；
      2. **每层有多少个结点**？（第 $i$ 层有 $a^i$ 个）；
      3. **每层的总代价**是多少？

      ==递归树最大的好处是能一眼看出"代价集中在顶层、底层、还是均匀分布"==，
      而这恰好对应主定理的三种情况。
    ` },

    { t: 'diagram', id: 'tree-demo', title: '递归树：$T(n)=2T(n/2)+n$',
      note: '每层总代价都是 n，共 log₂n + 1 层',
      caption: String.raw`==每往下一层，结点数翻倍、每个结点的代价减半，两者恰好抵消==，
      所以每一层的总代价都是 $n$。
      树高是 $\log_2 n$（规模从 $n$ 减半到 $1$），共 $\log_2 n+1$ 层，于是
      $$T(n)=n\times(\log_2 n+1)=O(n\log n)$$
      ==这正是[归并排序](#/ds/sort/merge-radix?at=merge-complexity)的复杂度==。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 246" role="img" aria-label="T(n)=2T(n/2)+n 的递归树，每层总代价均为 n">
  <path class="ar plain" d="M200,44 L140,86"/>
  <path class="ar plain" d="M200,44 L260,86"/>
  <path class="ar plain" d="M140,100 L110,142"/>
  <path class="ar plain" d="M140,100 L170,142"/>
  <path class="ar plain" d="M260,100 L230,142"/>
  <path class="ar plain" d="M260,100 L290,142"/>
  <g class="n p"><rect x="170" y="16" width="60" height="28" rx="5"/><text class="bt xs" x="200" y="30" text-anchor="middle" dominant-baseline="central">n</text></g>
  <g class="n k"><rect x="110" y="72" width="60" height="28" rx="5"/><text class="bt xs" x="140" y="86" text-anchor="middle" dominant-baseline="central">n/2</text></g>
  <g class="n k"><rect x="230" y="72" width="60" height="28" rx="5"/><text class="bt xs" x="260" y="86" text-anchor="middle" dominant-baseline="central">n/2</text></g>
  <g class="n k"><rect x="84" y="128" width="52" height="28" rx="5"/><text class="bt xs" x="110" y="142" text-anchor="middle" dominant-baseline="central">n/4</text></g>
  <g class="n k"><rect x="144" y="128" width="52" height="28" rx="5"/><text class="bt xs" x="170" y="142" text-anchor="middle" dominant-baseline="central">n/4</text></g>
  <g class="n k"><rect x="204" y="128" width="52" height="28" rx="5"/><text class="bt xs" x="230" y="142" text-anchor="middle" dominant-baseline="central">n/4</text></g>
  <g class="n k"><rect x="264" y="128" width="52" height="28" rx="5"/><text class="bt xs" x="290" y="142" text-anchor="middle" dominant-baseline="central">n/4</text></g>
  <text class="cap" x="200" y="180" text-anchor="middle">⋮</text>
  <g class="n g"><rect x="84" y="192" width="232" height="28" rx="5"/><text class="bt xs" x="200" y="206" text-anchor="middle" dominant-baseline="central">n 个规模为 1 的叶子</text></g>
  <path class="sep" d="M340,16 V226"/>
  <text class="cap" x="360" y="34">第 0 层：1 × n = n</text>
  <text class="cap" x="360" y="90">第 1 层：2 × n/2 = n</text>
  <text class="cap" x="360" y="146">第 2 层：4 × n/4 = n</text>
  <text class="cap" x="360" y="210">最底层：n × 1 = n</text>
  <g class="n a"><rect x="530" y="60" width="156" height="72" rx="7"/>
    <text class="bt sm" x="608" y="80" text-anchor="middle" dominant-baseline="central">每层都是 n</text>
    <text class="bs" x="608" y="102" text-anchor="middle" dominant-baseline="central">共 log₂n + 1 层</text>
    <text class="bs" x="608" y="122" text-anchor="middle" dominant-baseline="central">合计 O(n log n)</text></g>
</svg>
` },

    { t: 'key', id: 'master', title: '解法三：主定理（除法型专用）', c: String.raw`
      对形如
      $$T(n)=a\,T\!\left(\frac{n}{b}\right)+f(n),\qquad a\ge 1,\ b>1$$
      的递归式，令==临界指数==
      $$c=\log_b a$$
      则比较 $f(n)$ 与 $n^{c}$ 的大小：

      | 情况 | 条件 | 结论 | 直观含义 |
      |---|---|---|---|
      | **①** | $f(n)$ ==比 $n^c$ 低阶==（存在 $\varepsilon>0$ 使 $f(n)=O(n^{c-\varepsilon})$） | $T(n)=\Theta(n^{c})$ | ==代价集中在叶子层== |
      | **②** | $f(n)=\Theta(n^{c})$ | ==$T(n)=\Theta(n^{c}\log n)$== | ==每层代价相同== |
      | **③** | $f(n)$ ==比 $n^c$ 高阶==，且满足正则条件 $a\,f(n/b)\le k\,f(n)$（某个 $k<1$） | $T(n)=\Theta(f(n))$ | ==代价集中在根== |

      **怎么用**（三步）：
      1. 从递归式读出 $a,\ b,\ f(n)$；
      2. 算 $c=\log_b a$，写出 $n^c$；
      3. ==把 $f(n)$ 和 $n^c$ 比一比==，落进哪一档就用哪一档的结论。

      > **关于考纲**：408 大纲==没有明确要求主定理==，
      > 递归式一般靠展开法或递归树解决。
      > 但主定理==算得快、还能用来验算==，值得当成工具留着。
    ` },

    { t: 'example', id: 'ex-master',
      title: '★ 用三种方法各解一个',
      source: '综合练习',
      level: 3,
      problem: String.raw`
        求下列递归式的解（均设 $T(1)=O(1)$）：

        (1) $T(n)=2T(n/2)+n$
        (2) $T(n)=4T(n/2)+n$
        (3) $T(n)=T(n/2)+1$
        (4) $T(n)=2T(n-1)+1,\ T(1)=1$
      `,
      idea: String.raw`
        (1)(2)(3) 都是除法型，==直接上主定理==：先算 $c=\log_b a$，再和 $f(n)$ 比。

        (4) 是减法型，==主定理管不了==，用展开法。
        看到 $2T(n-1)$ 就该想到"每层翻倍、共 $n$ 层" → 指数。
      `,
      solution: String.raw`
        **(1)** $a=2,\ b=2,\ f(n)=n$。$c=\log_2 2=1$，$n^c=n$。
        $f(n)=\Theta(n)=\Theta(n^c)$ → **情况 ②**：
        $$T(n)=\Theta(n\log n)$$

        **(2)** $a=4,\ b=2,\ f(n)=n$。$c=\log_2 4=2$，$n^c=n^2$。
        $f(n)=n$ 比 $n^2$ 低阶（取 $\varepsilon=1$）→ **情况 ①**：
        $$T(n)=\Theta(n^2)$$

        **(3)** $a=1,\ b=2,\ f(n)=1$。$c=\log_2 1=0$，$n^c=n^0=1$。
        $f(n)=\Theta(1)=\Theta(n^c)$ → **情况 ②**：
        $$T(n)=\Theta(\log n)$$

        **(4)** 展开：
        $$T(n)=2T(n-1)+1$$
        两边加 1：$T(n)+1=2\big(T(n-1)+1\big)$，故 $\{T(n)+1\}$ 是公比为 2 的等比数列：
        $$T(n)+1=2^{\,n-1}\big(T(1)+1\big)=2^{\,n-1}\times 2=2^{\,n}$$
        $$T(n)=2^n-1=\Theta(2^n)$$
      `,
      comment: String.raw`
        **(3) 值得多看一眼**：$a=1$ 时 $c=0$，$n^c=1$，
        于是 $f(n)=O(1)$ 恰好落在情况 ②，答案带一个 $\log$。
        ==这就是折半查找为什么是 $O(\log n)$ 的形式化解释==。

        **(2) 的直觉**：$a=4$ 而规模只减半，==分支增长得比规模缩小快得多==，
        所以代价堆在叶子层，答案由 $n^{\log_2 4}=n^2$ 决定，
        与合并时花的 $O(n)$ 无关。

        **(4) 的直觉**：汉诺塔移动 $n$ 个盘子要 $2^n-1$ 步 ——
        ==这个精确解（不是渐进解）本身也是考点==。
      `,
    },

    { t: 'example', id: 'ex-read-code',
      title: '从代码写出递归式',
      source: '代码题的前置步骤',
      level: 2,
      problem: String.raw`
        写出下面两段代码的递归式并求解。

        **(1)**
        ~~~c
        void f(int n) {
            if (n <= 1) return;
            for (int i = 0; i < n; i++) printf("*");
            f(n / 2);
            f(n / 2);
        }
        ~~~

        **(2)**
        ~~~c
        int g(int n) {
            if (n <= 1) return 1;
            int s = 0;
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++) s++;
            return g(n - 1) + s;
        }
        ~~~
      `,
      idea: String.raw`
        ==先把"递归调用"和"非递归部分"分开看==：
        - 数一数递归调用了几次、每次规模多大；
        - 剩下的循环花了多少时间。

        (1) 调用了两次 $f(n/2)$，循环 $O(n)$ → 除法型；
        (2) 调用一次 $g(n-1)$，双重循环 $O(n^2)$ → 减法型。
      `,
      solution: String.raw`
        **(1)** $T(n)=2T(n/2)+O(n)$。

        主定理：$a=2,b=2,c=1$，$f(n)=\Theta(n)=\Theta(n^c)$ → 情况 ②：
        $$T(n)=\boxed{O(n\log n)}$$

        **(2)** $T(n)=T(n-1)+O(n^2)$。

        展开：
        $$T(n)=n^2+(n-1)^2+\dots+1^2=\frac{n(n+1)(2n+1)}{6}=\boxed{O(n^3)}$$
      `,
      comment: String.raw`
        **(2) 用到的求和公式**：$\sum_{i=1}^{n} i^2=\frac{n(n+1)(2n+1)}{6}$。
        ==记不住也没关系==：$n$ 项，每项最大 $n^2$，所以 $T(n)=O(n^3)$；
        而最大的 $n/2$ 项每项都不小于 $(n/2)^2$，所以也是 $\Omega(n^3)$。
        =="上下夹一夹"能绕开所有求和公式==，这个技巧比背公式有用。

        **常见错误**：(1) 里看到两个 $f(n/2)$ 就写 $T(n)=T(n/2)+O(n)$，
        ==漏掉了系数 2==，结果算成 $O(n)$。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '三、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **$T(n-1)$ 与 $T(n/2)$ 看混** —— 量级差指数级。
      2. **漏掉递归调用的次数 $a$** —— 两次调用要写 $2T(\cdot)$。
      3. **对减法型用主定理** —— ==主定理只管 $T(n)=aT(n/b)+f(n)$==。
      4. **$c=\log_b a$ 算成 $\log_a b$** —— ==底数是 $b$（规模的缩小倍数）==。
      5. **情况 ② 忘了乘 $\log n$**。
      6. **忘记写边界条件** —— 精确解（如汉诺塔的 $2^n-1$）全靠 $T(1)$。
      7. **递归树数错层数** —— 除法型是 $\log_b n$ 层，减法型是 $n/c$ 层。
      8. **把递归的时间复杂度当成空间复杂度** —— [空间只看最大深度](#/ds/intro/complexity?at=space-traps)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '四、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      主定理的三种情况其实就是递归树的三种形状：

      - ==情况 ①==：往下每层总代价越来越大 → ==叶子层说了算==；
      - ==情况 ②==：每层一样多 → ==层数说了算，所以带 $\log$==；
      - ==情况 ③==：往下每层越来越小 → ==根说了算==。

      ==画一次递归树，三种情况就都不用背了==。
    ` },

  ],
});
