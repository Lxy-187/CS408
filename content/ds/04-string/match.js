/* ==========================================================================
   数据结构 / 4 串 / 朴素模式匹配
   ========================================================================== */

KM.page({
  path: 'ds/string/match',
  title: '串与朴素模式匹配',
  subtitle: '串的基本概念、三种存储，以及那个"失配就退回去重来"的暴力算法 —— 它是 KMP 的起点',
  tags: ['必考', '概念辨析', '手算'],
  updated: '2026-08-21',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'concepts', c: '一、串的基本概念' },

    { t: 'key', id: 'terms', title: '八个定义（判断题的全部素材）', c: String.raw`
      **串（字符串）**：由零个或多个字符组成的==有限序列==，记作 $S=\texttt{'}a_1a_2\dots a_n\texttt{'}$。

      | 术语 | 定义 | 陷阱 |
      |---|---|---|
      | **串长** | 串中字符的个数 $n$ | 不含结束标志 |
      | **空串** | ==长度为 $0$== 的串 | 记作 $\texttt{''}$ |
      | **空格串** | ==由一个或多个空格组成==的串 | ==长度不为 0==！与空串完全不同 |
      | **子串** | 串中==任意个**连续**字符==组成的子序列 | ==必须连续== |
      | **主串** | 包含子串的那个串 | |
      | **位置** | 字符在串中的序号，==从 1 开始== | |
      | **串相等** | ==长度相等**且**对应位置字符都相同== | 两个条件缺一不可 |
      | **模式匹配** | 在主串中定位子串的操作 | 子串又叫**模式串** |

      ==空串和空格串的区别是这一节最高频的判断题==：
      $\texttt{''}$ 长度为 $0$，$\texttt{'\ \ '}$ 长度为 $2$，两者==不相等==。

      **另一个易错点**：==串是特殊的线性表==（元素限定为字符），
      但它的基本操作与线性表很不一样 ——
      ==线性表关注单个元素，串关注的是"子串"这个整体==。
    ` },

    { t: 'key', id: 'substr-count', title: '子串计数：为什么是 $\\frac{n(n+1)}{2}$', c: String.raw`
      长度为 $n$ 的串，==按位置计==：

      - 长度为 $1$ 的子串有 $n$ 个；
      - 长度为 $2$ 的有 $n-1$ 个；
      - ……
      - 长度为 $n$ 的有 $1$ 个。

      $$\text{非空子串个数}=n+(n-1)+\dots+1=\frac{n(n+1)}{2}$$
      $$\text{子串总数（含空串）}=\frac{n(n+1)}{2}+1$$

      ==注意"按位置计"和"按内容计"是两回事==：
      串 $\texttt{aaa}$ 按位置有 $\frac{3\times 4}{2}=6$ 个非空子串，
      但==互不相同的子串只有 $\texttt{a}$、$\texttt{aa}$、$\texttt{aaa}$ 三个==。
      题目问哪一个要看清 —— ==默认问"子串个数"时按位置计==。
    ` },

    { t: 'key', id: 'storage', title: '串的三种存储结构', c: String.raw`
      | 结构 | 做法 | 特点 |
      |---|---|---|
      | **定长顺序存储** | 固定大小的字符数组，==$\texttt{ch[0]}$ 存串长==（或用 $\texttt{'\\0'}$ 结尾） | 简单；==会截断超长的串== |
      | **堆分配存储** | 用 $\texttt{malloc}$ 动态分配一整块连续空间 | ==长度不受限==，仍然连续，是最常用的 |
      | **块链存储** | 链表，==每个结点存若干个字符==（如 4 个） | 存储密度可调；==插入删除方便但实现复杂== |

      **块链的存储密度**：
      $$\text{存储密度}=\frac{\text{串值所占的空间}}{\text{实际分配的空间}}$$
      每个结点存 1 个字符时密度最低（指针比数据还大），
      ==每个结点存的字符越多，密度越高，但插入删除越不灵活==。

      408 的算法题里==默认用定长顺序存储且 $\texttt{ch[0]}$ 不用、下标从 1 开始==
      —— 这样"位置"和"下标"就一致了，正是[本页匹配算法](#/ds/string/match?at=bf-code)
      和 [KMP](#/ds/string/kmp?at=definition) 的约定。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'bf', c: '二、朴素模式匹配（BF 算法）' },

    { t: 'key', id: 'bf-idea', title: '思想：一个一个位置试过去', c: String.raw`
      主串 $S$（长 $n$）、模式串 $T$（长 $m$）。

      从 $S$ 的第 $1$ 个位置开始，==逐个字符与 $T$ 比较==：

      - 全部匹配 → 成功，返回本轮的起始位置；
      - 中途失配 → ==主串指针 $i$ 退回本轮起点的下一位，模式串指针 $j$ 退回 1==，重新开始。

      $$\text{失配时：}\quad i\ \leftarrow\ i-j+2,\qquad j\ \leftarrow\ 1$$

      ==$i-j+2$ 这个式子要能现推==：本轮起点是 $i-j+1$（因为已经匹配了 $j-1$ 个字符），
      下一轮起点就是它 $+1$。
    ` },

    { t: 'diagram', id: 'bf-demo', title: 'BF 的最坏情况：每轮都比到最后才失配',
      note: 'S = aaaaaaab，T = aaab',
      caption: String.raw`==每一轮都匹配了 $3$ 个字符才在第 $4$ 个上失配==，
      然后模式串只往右滑一格，前面比过的信息==全部作废==。
      这样的轮次要走 $n-m+1$ 次，每次比较约 $m$ 次，总共 ==$O(nm)$==。
      [KMP 的全部改进](#/ds/string/kmp?at=no-backtrack)就是"别把已经比出来的信息扔掉"。`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 226" role="img" aria-label="朴素模式匹配在最坏情况下反复回溯的过程">
  <text class="cap" x="14" y="46">主串 S</text>
  <g class="n m"><rect x="80" y="30" width="44" height="32" rx="4"/><text class="bt xs" x="102" y="46" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n m"><rect x="126" y="30" width="44" height="32" rx="4"/><text class="bt xs" x="148" y="46" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n m"><rect x="172" y="30" width="44" height="32" rx="4"/><text class="bt xs" x="194" y="46" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n m"><rect x="218" y="30" width="44" height="32" rx="4"/><text class="bt xs" x="240" y="46" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n m"><rect x="264" y="30" width="44" height="32" rx="4"/><text class="bt xs" x="286" y="46" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n m"><rect x="310" y="30" width="44" height="32" rx="4"/><text class="bt xs" x="332" y="46" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n m"><rect x="356" y="30" width="44" height="32" rx="4"/><text class="bt xs" x="378" y="46" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n m"><rect x="402" y="30" width="44" height="32" rx="4"/><text class="bt xs" x="424" y="46" text-anchor="middle" dominant-baseline="central">b</text></g>
  <text class="cap" x="14" y="98">第 1 趟</text>
  <g class="n g"><rect x="80" y="82" width="44" height="32" rx="4"/><text class="bt xs" x="102" y="98" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="126" y="82" width="44" height="32" rx="4"/><text class="bt xs" x="148" y="98" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="172" y="82" width="44" height="32" rx="4"/><text class="bt xs" x="194" y="98" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n r"><rect x="218" y="82" width="44" height="32" rx="4"/><text class="bt xs" x="240" y="98" text-anchor="middle" dominant-baseline="central">b</text></g>
  <text class="lb em" x="278" y="102">比 4 次，失配</text>
  <text class="cap" x="14" y="150">第 2 趟</text>
  <g class="n g"><rect x="126" y="134" width="44" height="32" rx="4"/><text class="bt xs" x="148" y="150" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="172" y="134" width="44" height="32" rx="4"/><text class="bt xs" x="194" y="150" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="218" y="134" width="44" height="32" rx="4"/><text class="bt xs" x="240" y="150" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n r"><rect x="264" y="134" width="44" height="32" rx="4"/><text class="bt xs" x="286" y="150" text-anchor="middle" dominant-baseline="central">b</text></g>
  <text class="lb em" x="324" y="154">又比 4 次，又失配</text>
  <text class="cap" x="14" y="202">第 3 趟</text>
  <g class="n g"><rect x="172" y="186" width="44" height="32" rx="4"/><text class="bt xs" x="194" y="202" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="218" y="186" width="44" height="32" rx="4"/><text class="bt xs" x="240" y="202" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n g"><rect x="264" y="186" width="44" height="32" rx="4"/><text class="bt xs" x="286" y="202" text-anchor="middle" dominant-baseline="central">a</text></g>
  <g class="n r"><rect x="310" y="186" width="44" height="32" rx="4"/><text class="bt xs" x="332" y="202" text-anchor="middle" dominant-baseline="central">b</text></g>
  <text class="lb em" x="370" y="206">模式串每次只右滑一格</text>
  <text class="cap" x="470" y="46">绿 = 匹配上的</text>
  <text class="cap" x="470" y="68">红 = 失配的那一对</text>
  <text class="cap" x="470" y="98">主串指针 i 每轮都要退回去</text>
  <text class="cap" x="470" y="120">这就是 O(nm) 的来源</text>
</svg>
` },

    { t: 'code', id: 'bf-code', title: '朴素模式匹配', lang: 'c',
      note: '下标从 1 开始，ch[0] 不用',
      c: String.raw`
        typedef struct {
            char ch[MAXLEN + 1];        // ch[0] 闲置，位置与下标一致
            int  length;
        } SString;

        int Index(SString S, SString T) {
            int i = 1, j = 1;
            while (i <= S.length && j <= T.length) {
                if (S.ch[i] == T.ch[j]) {
                    ++i;  ++j;                  // 都匹配，继续往后比
                } else {
                    i = i - j + 2;              // ← 主串指针退回本轮起点的下一位
                    j = 1;                      // ← 模式串指针归位
                }
            }
            if (j > T.length) return i - T.length;   // 匹配成功，返回起始位置
            return 0;                                // 失败
        }
      ` },

    { t: 'key', id: 'bf-complexity', title: '复杂度：好的时候很好，坏的时候很坏', c: String.raw`
      | 情形 | 说明 | 时间 |
      |---|---|---|
      | **最好** | 每轮==第一个字符就失配==，或第一轮就匹配成功 | ==$O(n+m)$== |
      | **最坏** | 每轮都==比到最后一个字符才失配==（如 $S=\texttt{aaaaaab}$，$T=\texttt{aab}$） | ==$O(nm)$== |
      | **平均** | 实际文本中失配通常发生得很早 | 接近 $O(n+m)$ |

      **最坏情况的比较次数**：共 $n-m+1$ 轮，每轮最多比 $m$ 次：
      $$(n-m+1)\times m\ \approx\ O(nm)$$

      **空间**：==$O(1)$==，只用了两个指针 —— ==这是 BF 唯一胜过 KMP 的地方==
      （KMP 要额外 $O(m)$ 存 $next$ 数组）。

      ==所以不要一概而论"KMP 一定比 BF 好"==：
      模式串很短、或者字符集很大（失配来得早）时，==BF 的常数更小，实际更快==。
    ` },

    { t: 'key', id: 'to-kmp', title: '浪费在哪：通往 KMP 的那一步', c: String.raw`
      失配发生时，==我们其实已经知道主串上那一段的内容==
      —— 它和模式串的前 $j-1$ 个字符完全相同。
      但 BF 把这个信息==直接扔掉==，让 $i$ 退回去重新比一遍。

      $$\boxed{\text{KMP 的全部出发点：}i\ \text{永不回溯，只调整}\ j}$$

      因为"该往右滑多远"这件事==只跟模式串自己有关==，
      可以事先算成一个 $next$ 数组。

      详见 [KMP 与 $next$ 数组](#/ds/string/kmp?at=core)。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'examples', c: '三、例题' },

    { t: 'example', id: 'ex-count',
      title: '数子串与串的基本概念',
      source: '选择/填空',
      level: 2,
      problem: String.raw`
        (1) 串 $\texttt{'abcde'}$ 共有多少个子串（含空串）？多少个非空真子串？
        (2) 串 $\texttt{'aaaa'}$ 按位置计有多少个非空子串？互不相同的非空子串有多少个？
        (3) 判断：空串是任意串的子串；空格串的长度为 0；
        两个串相等当且仅当它们的长度相等。
      `,
      idea: String.raw`
        (1) ==注意"真子串"要排除串本身==（有的教材还排除空串，看清题目）。
        (2) ==按位置计和按内容计是两个不同的问题==，见上文。
        (3) 三句都是经典陷阱，逐条对定义。
      `,
      solution: String.raw`
        **(1)** $n=5$。

        - 子串总数（含空串）$=\dfrac{5\times 6}{2}+1=\boxed{16}$；
        - 非空子串 $=15$；
        - ==非空真子串==（非空、且不等于原串本身）$=15-1=\boxed{14}$。

        **(2)** $\texttt{'aaaa'}$，$n=4$。

        - 按位置计的非空子串 $=\dfrac{4\times 5}{2}=\boxed{10}$；
        - 互不相同的非空子串只有 $\texttt{a}$、$\texttt{aa}$、$\texttt{aaa}$、$\texttt{aaaa}$
          共 $\boxed{4}$ 个。

        **(3)**
        - "空串是任意串的子串" —— ==对==（长度为 0 的连续片段，任何串里都有）；
        - "空格串的长度为 0" —— ==错==，==空格也是字符==，$\texttt{'\ \ '}$ 长度为 2；
        - "两个串相等当且仅当长度相等" —— ==错==，
          还必须==对应位置的字符都相同==。
      `,
      comment: String.raw`
        **"真子串"的定义要当心**：
        多数教材里"真子串"= 不等于原串本身的子串（==空串算真子串==），
        少数教材里还要求非空。==答题时把口径写出来==，例如
        "本题按'真子串不含原串本身'计算"。

        **(2) 的启示**：==只要串里有重复字符，"按位置"就会多算==。
        题目如果写的是"不同的子串"，就必须去重。
      `,
    },

    { t: 'example', id: 'ex-bf-count',
      title: '★ 数一数 BF 的比较次数',
      source: '选择题高频',
      level: 3,
      problem: String.raw`
        设主串 $S=\texttt{'ababcabcacbab'}$，模式串 $T=\texttt{'abcac'}$，
        采用朴素模式匹配算法。

        (1) 匹配成功时返回的位置是多少？
        (2) 一共进行了多少次字符比较？
      `,
      idea: String.raw`
        ==把主串写成一行并标上位置 1~13，然后一轮一轮对齐==。

        每一轮记两件事：==从哪个位置开始对齐==、==比了几次就失配==。
        最后把各轮的比较次数加起来。

        ==失配那一次也算一次比较==，这是最容易漏的。
      `,
      solution: String.raw`
        主串（位置 1~13）：

        | 位 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
        |---|---|---|---|---|---|---|---|---|---|---|---|---|---|
        | 字符 | a | b | a | b | c | a | b | c | a | c | b | a | b |

        模式串 $T=\texttt{abcac}$。

        | 轮 | 对齐起点 | 比较过程 | 本轮比较次数 |
        |---|---|---|---|
        | 1 | 1 | $\texttt{a}$✓ $\texttt{b}$✓ $\texttt{a}$ vs $\texttt{c}$✗ | 3 |
        | 2 | 2 | $\texttt{b}$ vs $\texttt{a}$✗ | 1 |
        | 3 | 3 | $\texttt{a}$✓ $\texttt{b}$✓ $\texttt{c}$✓ $\texttt{a}$✓ $\texttt{b}$ vs $\texttt{c}$✗ | 5 |
        | 4 | 4 | $\texttt{b}$ vs $\texttt{a}$✗ | 1 |
        | 5 | 5 | $\texttt{c}$ vs $\texttt{a}$✗ | 1 |
        | 6 | 6 | $\texttt{a}$✓ $\texttt{b}$✓ $\texttt{c}$✓ $\texttt{a}$✓ $\texttt{c}$✓ ==全部匹配== | 5 |

        **(1)** 匹配成功，返回位置 $\boxed{6}$。

        **(2)** 总比较次数 $=3+1+5+1+1+5=\boxed{16}$ 次。
      `,
      comment: String.raw`
        **两个常见错误**：

        1. ==失配的那一次不算进去==，会把第 1 轮记成 2 次；
           =="比较"包括"比出来不相等"这一次==。
        2. ==漏掉第 2、4、5 轮==。这三轮只比了一次就失配，
           很容易在"滑动"时直接跳过去。==每一个起始位置都必须试==。

        **对照 KMP**：同样这组串，[KMP](#/ds/string/kmp?at=by-hand) 的
        $next=(0,1,1,1,2)$，主串指针一次都不回退，
        ==总比较次数明显少于 16==。这道题常和 KMP 配对出现，用来体现改进的效果。
      `,
    },

    /* ================================================================== */
    { t: 'h', id: 'pitfalls', c: '四、易错清单' },

    { t: 'warn', id: 'pitfall-list', title: '这一节的固定失分点', c: String.raw`
      1. **空串与空格串混为一谈** —— ==空格串长度不为 0==。
      2. **子串不要求连续** —— ==必须连续==；不连续的叫"子序列"。
      3. **串相等只看长度** —— ==还要对应字符全相同==。
      4. **子串个数忘了加空串 / 忘了减本身** —— 看清问的是"子串""非空子串"还是"真子串"。
      5. **有重复字符时按位置计当成互不相同** —— 两个口径要分清。
      6. **失配时 $i$ 的回退写成 $i-j+1$** —— ==是 $i-j+2$==（本轮起点的**下一位**）。
      7. **比较次数漏掉失配的那一次**。
      8. **认为 BF 一定比 KMP 慢** —— ==BF 空间 $O(1)$，模式串短时常数更小==。
      9. **认为 BF 的平均复杂度是 $O(nm)$** —— ==$O(nm)$ 是最坏==，平均接近 $O(n+m)$。
      10. **块链存储里"存储密度"算反** —— ==是"串值空间 ÷ 实际分配空间"==，越大越好。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'notes', c: '五、我的思路记录' },

    { t: 'insight', id: 'note-slot', title: '这里放你自己的话', c: String.raw`
      朴素匹配值得单独学一遍，==不是因为它有用，而是因为它把"浪费"暴露得很清楚==：

      失配的那一刻，我们手上其实有两份信息 ——
      ==主串那一段的内容==（等于模式串的前缀）和==模式串自身的结构==。
      BF 把第一份扔了、第二份根本没用。

      [KMP](#/ds/string/kmp?at=no-backtrack) 做的事就是==把第二份信息预先算出来==，
      于是第一份也不用重新获取了。
      ==先把浪费看清楚，再看优化，KMP 就不像是凭空变出来的了==。
    ` },

  ],
});
