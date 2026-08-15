/* ==========================================================================
   数据结构 / 4 串 / KMP 与 next 数组
   —— 这个文件同时也是「内容页格式示范」，新页面照抄结构即可。
   ========================================================================== */

KM.page({
  path: 'ds/string/kmp',
  title: 'KMP 与 next 数组',
  subtitle: '主串指针永不回溯 —— 以及 next 数组为什么只跟模式串自己有关',
  tags: ['高频', '必考', '手算'],
  updated: '2026-08-10',

  blocks: [

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'why', c: '一、朴素算法浪费在哪' },

    { t: 'key', id: 'naive-waste', title: '失配之后，主串指针退回去了', c: String.raw`
      朴素模式匹配在失配时把主串指针 $i$ 退回到本轮起点的下一位、模式串指针 $j$ 退回 $1$：

      $$i\ \leftarrow\ i-j+2,\qquad j\ \leftarrow\ 1$$

      最坏时间复杂度 ==$O(mn)$==（$n$ 为主串长、$m$ 为模式串长），
      典型的坏例子是 $S=\texttt{aaaaaaab}$、$T=\texttt{aaab}$：
      每一轮都要比到最后一个字符才失配。

      **浪费在哪**：失配发生时，我们==已经知道了主串上那一段的内容==
      （它和模式串前 $j-1$ 个字符完全相同），
      但朴素算法把这个信息丢掉、退回去重新比一遍。
    ` },

    { t: 'diagram', id: 'naive-illustration', title: '失配瞬间，我们其实知道很多',
      note: '绿 = 已匹配段，红 = 失配的那一对',
      caption: String.raw`==KMP 的全部出发点就是这张图==：失配时，已匹配的那段内容是已知的，而它恰好是模式串的一个前缀 —— 于是滑动距离可以==只由模式串预先算出来==，与主串无关。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 268" role="img" aria-label="朴素匹配失配的瞬间：已匹配段既在主串里也是模式串前缀">
  <text class="cap" x="0" y="14">主串 S</text>
  <g class="n m"><rect x="60" y="24" width="40" height="36" rx="4"/><text class="bt sm" x="80.0" y="42.0" text-anchor="middle" dominant-baseline="central">…</text></g>
  <g class="n g"><rect x="104" y="24" width="40" height="36" rx="4"/><text class="bt sm" x="124.0" y="42.0" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="148" y="24" width="40" height="36" rx="4"/><text class="bt sm" x="168.0" y="42.0" text-anchor="middle" dominant-baseline="central">b</text></g>
  <g class="n g"><rect x="192" y="24" width="40" height="36" rx="4"/><text class="bt sm" x="212.0" y="42.0" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="236" y="24" width="40" height="36" rx="4"/><text class="bt sm" x="256.0" y="42.0" text-anchor="middle" dominant-baseline="central">b</text></g>
  <g class="n g"><rect x="280" y="24" width="40" height="36" rx="4"/><text class="bt sm" x="300.0" y="42.0" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n r"><rect x="324" y="24" width="40" height="36" rx="4"/><text class="bt sm" x="344.0" y="42.0" text-anchor="middle" dominant-baseline="central">X</text></g>
  <g class="n m"><rect x="368" y="24" width="40" height="36" rx="4"/><text class="bt sm" x="388.0" y="42.0" text-anchor="middle" dominant-baseline="central">…</text></g>
  <text class="lb" x="412" y="78" text-anchor="middle">在这里失配（i）</text>
  <path class="ar" d="M324,74 V64"/>
  <text class="cap" x="0" y="116">模式 T</text>
  <g class="n g"><rect x="104" y="126" width="40" height="36" rx="4"/><text class="bt sm" x="124.0" y="144.0" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="148" y="126" width="40" height="36" rx="4"/><text class="bt sm" x="168.0" y="144.0" text-anchor="middle" dominant-baseline="central">b</text></g>
  <g class="n g"><rect x="192" y="126" width="40" height="36" rx="4"/><text class="bt sm" x="212.0" y="144.0" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="236" y="126" width="40" height="36" rx="4"/><text class="bt sm" x="256.0" y="144.0" text-anchor="middle" dominant-baseline="central">b</text></g>
  <g class="n g"><rect x="280" y="126" width="40" height="36" rx="4"/><text class="bt sm" x="300.0" y="144.0" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n r"><rect x="324" y="126" width="40" height="36" rx="4"/><text class="bt sm" x="344.0" y="144.0" text-anchor="middle" dominant-baseline="central">a</text></g>
  <path class="ar" d="M324,176 V166"/>
  <text class="lb" x="330" y="186">j</text>
  <g class="n g"><rect x="20" y="210" width="656" height="46" rx="8"/><text class="bt sm" x="348.0" y="223.0" text-anchor="middle" dominant-baseline="central">绿色这段 “ababa” 既属于主串、也属于模式串的前缀</text><text class="bs" x="348.0" y="243.0" text-anchor="middle" dominant-baseline="central">所以"下一步该往右滑多远"这件事，信息全在模式串自己身上</text></g>
</svg>
` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'core', c: '二、核心洞察：$i$ 永不回溯' },

    { t: 'key', id: 'no-backtrack', title: 'KMP 只动 $j$，不动 $i$', c: String.raw`
      失配时，已匹配的那一段就是模式串的前缀 $T[1..j-1]$。
      要让模式串右移之后还能对上，==新的对齐位置必须让"模式串的某个前缀"
      正好落在"刚才那段的某个后缀"上==。

      能右移得最少（即不漏解）的位置，对应
      ==$T[1..j-1]$ 的**最长相等前后缀**==。于是：

      $$\boxed{\ j\ \leftarrow\ next[j],\qquad i\ \text{保持不动}\ }$$

      **两个关键推论**：

      1. ==$next$ 只跟模式串自己有关，与主串无关== —— 所以可以预处理；
      2. $i$ 不回溯 $\Rightarrow$ 主串每个字符最多被"前进"一次，
         总时间 ==$O(n+m)$==。
    ` },

    { t: 'key', id: 'definition', title: '$next$ 的定义（严蔚敏 / 408 约定，下标从 1 开始）', c: String.raw`
      $$next[j]=\begin{cases}
      0, & j=1\\[4pt]
      k, & \text{使得 }T[1..k-1]=T[j-k+1..j-1]\text{ 的最大 }k\ (1<k<j)\\[4pt]
      1, & \text{其他情况}
      \end{cases}$$

      口语版：==$next[j]$ = "$T[1..j-1]$ 的最长相等前后缀长度" $+\,1$==。

      **注意两处最容易搞混的地方**：

      - 拿去求前后缀的是 ==$T[1..j-1]$（不含第 $j$ 位）==，不是 $T[1..j]$；
      - "相等前后缀"必须是==真前缀 / 真后缀==（不能取整个串自身）。

      408 里还有另一套"下标从 0 开始、$next[0]=-1$"的写法，
      两者差 $1$。==答题时按你教材那一套，全程别混==。
    ` },

    { t: 'method', id: 'by-hand', title: '手算 $next$ 的三步（考场做法）', c: String.raw`
      1. **写出模式串，标上下标 $1,2,\dots,m$**；
      2. **$next[1]=0$，$next[2]=1$** 固定（$T[1..1]$ 没有真前后缀）；
      3. **从 $j=3$ 起逐位算**：盖住第 $j$ 位，看前面那段 $T[1..j-1]$
         的最长相等前后缀有多长，==长度加 1== 就是 $next[j]$。

      **加速技巧**：$next[j+1]\le next[j]+1$，而且相邻两位往往只差 $1$ ——
      先猜 $next[j]+1$，验证不成立再往下降。
    ` },

    { t: 'code', id: 'get-next', title: '求 next 数组', lang: 'c', note: '双指针，本质是模式串和自己做匹配',
      c: String.raw`
        void get_next(SString T, int next[]) {
            int i = 1, j = 0;
            next[1] = 0;
            while (i < T.length) {
                if (j == 0 || T.ch[i] == T.ch[j]) {
                    ++i; ++j;
                    next[i] = j;          // 前后缀又长了一位
                } else {
                    j = next[j];          // 退而求其次，找更短的相等前后缀
                }
            }
        }
      ` },

    { t: 'key', id: 'self-match', title: '为什么求 next 的代码和 KMP 主过程长得一样', c: String.raw`
      对照下面的主过程会发现两段代码==骨架完全相同==。这不是巧合：

      ==求 $next$ 的过程，就是"模式串和它自己做一次 KMP 匹配"== ——
      用 $i$ 扫后缀、用 $j$ 扫前缀，匹配上就同时前进，失配就让 $j$ 退回 $next[j]$。

      认出这一点之后，两段代码只需要记一段。
    ` },

    { t: 'code', id: 'kmp-main', title: 'KMP 主过程', lang: 'c', note: '注意 i 从头到尾只增不减',
      c: String.raw`
        int Index_KMP(SString S, SString T, int next[]) {
            int i = 1, j = 1;
            while (i <= S.length && j <= T.length) {
                if (j == 0 || S.ch[i] == T.ch[j]) {
                    ++i; ++j;             // 匹配成功，双双前进
                } else {
                    j = next[j];          // 失配，只回退 j
                }
            }
            if (j > T.length) return i - T.length;   // 匹配成功，返回起始位置
            return 0;
        }
      ` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'nextval', c: '三、$nextval$：再省一次无用比较' },

    { t: 'key', id: 'nextval-def', title: '优化的动机与公式', c: String.raw`
      若 $T[j]=T[next[j]]$，那么退到 $next[j]$ 之后==必然还会在同一个字符上失配==，
      这一次比较是白做的。于是直接跳得更远：

      $$nextval[j]=\begin{cases}
      nextval\!\left[\,next[j]\,\right], & T[j]=T\!\left[\,next[j]\,\right]\\[4pt]
      next[j], & \text{否则}
      \end{cases}\qquad nextval[1]=0$$

      ==注意等号成立那一支引用的是 $nextval$，不是 $next$==（递归引用），
      这是手算时最常写错的一步。
    ` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'examples', c: '四、例题' },

    { t: 'example',
      id: 'ex-hand-compute',
      title: '手算 next 与 nextval',
      source: '必考题型',
      level: 2,
      problem: String.raw`
        已知模式串 $T=\texttt{ababaa}$，求它的 $next$ 数组与 $nextval$ 数组。
      `,
      idea: String.raw`
        逐位盖住第 $j$ 位，看前面那段的最长相等前后缀。
        ==只要记住"算 $next[j]$ 时第 $j$ 位不参与"==，这题不会错。

        算完 $next$ 再算 $nextval$：逐位比较 $T[j]$ 与 $T[next[j]]$，
        相等就继承 $nextval[next[j]]$，不等就照抄 $next[j]$。
      `,
      solution: String.raw`
        **求 $next$**（下标从 1 开始）

        | $j$ | 1 | 2 | 3 | 4 | 5 | 6 |
        |---|---|---|---|---|---|---|
        | $T[j]$ | a | b | a | b | a | a |
        | $T[1..j-1]$ | — | a | ab | aba | abab | ababa |
        | 最长相等前后缀 | — | 无(0) | 无(0) | a(1) | ab(2) | aba(3) |
        | $next[j]$ | **0** | **1** | **1** | **2** | **3** | **4** |

        **求 $nextval$**

        | $j$ | $T[j]$ | $next[j]$ | $T[next[j]]$ | 是否相等 | $nextval[j]$ |
        |---|---|---|---|---|---|
        | 1 | a | 0 | — | — | **0** |
        | 2 | b | 1 | a | 否 | $next[2]=$ **1** |
        | 3 | a | 1 | a | 是 | $nextval[1]=$ **0** |
        | 4 | b | 2 | b | 是 | $nextval[2]=$ **1** |
        | 5 | a | 3 | a | 是 | $nextval[3]=$ **0** |
        | 6 | a | 4 | b | 否 | $next[6]=$ **4** |

        $$next=(0,1,1,2,3,4),\qquad nextval=(0,1,0,1,0,4)$$
      `,
      comment: String.raw`
        **自查方法**：$next[j+1]\le next[j]+1$ 必须成立，
        且 $next$ 数组==只会一步一步涨、但可以断崖式跌==。
        本题 $0,1,1,2,3,4$ 符合；若算出 $0,1,1,2,4,\dots$ 就一定错了。

        **$nextval$ 的自查**：$nextval[j]\le next[j]$ 恒成立。
      `,
    },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'pitfalls', c: '五、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **两套下标约定混用**：$next[1]=0$（从 1 开始）与 $next[0]=-1$（从 0 开始）
         差一个 $1$，==全程只能用一套==。
      2. **求 $next[j]$ 时把第 $j$ 位算进去了**：拿去求前后缀的是 $T[1..j-1]$。
      3. **前后缀取到了整个串**：必须是==真==前缀 / 真后缀。
      4. **$nextval$ 写成引用 $next$**：相等那一支引用的是 ==$nextval[next[j]]$==。
      5. **以为 KMP 一定比朴素快**：模式串很短、或几乎没有重复前缀时，
         朴素算法常数更小反而更快。==KMP 的优势在于最坏情况的保证==。
      6. **返回值忘了减长度**：匹配成功时起始位置是 $i-m$，不是 $i$。
    ` },

    /* ------------------------------------------------------------------ */
    { t: 'h', id: 'notes', c: '六、我的思路记录' },

    { t: 'insight', id: 'note-demo', title: '示范块 —— 这里放你自己的话', c: String.raw`
      这个绿色块是留给==你自己的思考==的：为什么当时没想到、你是怎么绕过来的、
      你总结的私人口诀、和 AI 讨论后想通的那一下。

      跟 Claude 说「把这段对话整理进 KMP」，它就会把你的原话提炼成这样的块，
      放在对应例题下面或者本节里。与客观知识（蓝色 / 紫色块）分开，复习时一眼能认出
      ==哪些是书上的、哪些是你自己的==。
    ` },

  ],
});
