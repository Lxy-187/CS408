/* ==========================================================================
   随笔 / 关于计算机科学 / 为什么 AI 还没有大规模取代工作
   —— 上一篇（notes/essays/ai-boundary）问的是「哪些任务适合交给 AI」，
      这一篇往外推一层：为什么整体上取代还没有发生。
      三块能力短板（适应性 / 具身 / 感知）＋ 一块常被漏掉的非技术原因。
   ========================================================================== */

KM.page({
  path: 'notes/essays/ai-and-jobs',
  title: '为什么 AI 还没有大规模取代工作',
  subtitle: '三块能力短板，加上被技术视角漏掉的另一半原因',
  tags: ['方法论'],
  updated: '2026-08-15',

  blocks: [

    /* ================================================================== */
    { t: 'h', id: 'claim', c: '一、先把结论摆出来' },

    { t: 'insight', id: 'my-three', title: '我的三点判断', c: String.raw`
      **① 适应性。** 遇到一个新问题，人可以仅凭简单的示例举一反三，理解并掌握它；
      而 AI 的学习是通过大量重复语料和足够多的正确答案形成的。
      工作中人正是需要不断调整自己的看法，==通过一两个明显的错误就能重新理解问题、调整方向==，
      这相当于改变了神经网络的参数甚至结构。人的神经网络适应性远高于 AI。

      **② 效率。** 人学完一套动作后能在一瞬间调度各种肌肉协调完成；
      面对图像的错误、前端页面的不合理，人一眼就能识别判断。
      ==AI 在运动控制和图像理解上效率低，没有足够的量变产生质变。==

      **③ 感知维度。** AI 的学习都是比特流的。人接受的信息也可以说是比特流，
      但 AI 并没有把人会接受的信息都输入进去 —— 比如触觉、嗅觉；
      听觉和视觉虽然被编码输入了，效果和效率也远不如人感受到的那么饱满。

      **用短板效应来说**：AI 即使在纯逻辑推理、文字理解、表达上效果很好，
      它的短板也注定了它没办法胜任绝大多数人类工作。
      但 ==AI 很大程度补足了人类的短板，我们都应该尽可能从 AI 上获得帮助。==
    ` },

    { t: 'md', c: String.raw`
      这三条都站得住。下面三节分别做一点**校准** —— 有两处我认为需要说得更准，
      不是推翻，而是把刀口磨得更锋利。第五节补一块完全没被提到的原因：
      ==即使上面三块短板明天全部补齐，大规模取代也不会立刻发生。==
    ` },

    { t: 'compare', id: 'name-table', title: '这三条各自都有正式的名字', cols: ['我的说法', '学界的名字', '一句话'],
      rows: [
        ['举一反三 vs 大量语料', '样本效率 / 分布外泛化', '训练分布之内表现极好，之外迅速退化'],
        ['一两个错误就能调整方向', '持续学习 / 灾难性遗忘', '模型学新的容易把旧的冲掉，所以干脆冻结权重'],
        ['运动控制和图像理解效率低', '莫拉维克悖论', '高阶逻辑容易，低阶感知运动难'],
        ['缺触觉嗅觉、视听不够饱满', '符号接地问题', '概念没有物理经验作为锚点'],
        ['短板效应', 'Amdahl 定律的一般形式', '不能被加速的那部分决定了天花板'],
      ] },

    { t: 'md', c: String.raw`
      最后一行不是比喻。==你说的"短板效应"在这个站里已经有一个精确的定量形式==：
      [Amdahl 定律](#/co/cpu/pipeline?at=amdahl) 说，若可加速部分占比 $p$，
      那么无论把这部分优化到多快，总加速比也不会超过 $\frac{1}{1-p}$。
      把"可加速部分"换成"AI 能接管的工时占比"，这条式子就直接给出了
      "自动化能省下多少"的上界 —— **它由剩下那部分说了算，跟 AI 多强无关。**
    ` },

    /* ================================================================== */
    { t: 'h', id: 'adapt', c: '二、适应性：把"人学得快"说得更准一点' },

    { t: 'warn', id: 'the-one-is-not-one', title: '校准①：「举一反三」里的那个「一」，其实不是一', c: String.raw`
      人看一个例子就懂，==不是因为大脑能从单个样本里榨出更多信息，
      而是因为看这个样本的时候，人带着二十年的生活先验、几百万年进化下来的物理直觉==。
      所谓"一个示例"，真实的输入是"这个示例 **＋ 你的全部人生**"。

      这一点很重要，因为它说明：**人和 AI 的差别不在"学习机制根本不同"**
      （预训练干的正是"积累先验"这件事），==而在于先验还在不在更新==。

      你已经摸到这一点了 —— 你说人的调整"相当于改变了神经网络的参数甚至结构"。
      这句话可以说得更狠一点：**AI 不是不能改，是被设计成不改。**
      训练结束后权重就冻结了，因为一旦允许在线更新，
      新知识会把旧知识冲掉（灾难性遗忘），可靠性反而崩掉。
      ==这是一个工程上的取舍，不是数学上的不可能。==
    ` },

    { t: 'warn', id: 'it-does-generalize', title: '校准②：AI 其实会举一反三，它只是记不住', c: String.raw`
      给模型两三个例子，它当场就能跟着做对第四个 —— 这叫**上下文学习**，
      是相当强的少样本适应能力。你在工作中"用一两个错误纠正它方向"，
      ==在一次对话内部通常是奏效的==。

      真正的失效点在**边界之外**：关掉这个窗口，刚才那次纠正就消失了。
      下次它照旧犯同一个错，你得再教一遍。

      所以这块短板更准确的表述不是"AI 学不会"，而是：

      > ==AI 能在一次对话里适应，但没有能力把这次适应沉淀下来。==
      > 它有工作记忆，没有长期记忆。

      这个区分是有实际后果的 —— 它直接决定了正确的用法：
      **你要主动去当它的长期记忆。** 把每次纠正沉淀成文档、规范、提示词，
      让下一次对话在更高的起点上开始。
      这正是上一篇里[人工反哺语料](#/notes/essays/ai-boundary?at=edge-strategy)那条策略的底层理由。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'moravec', c: '三、莫拉维克悖论：难的容易，容易的难' },

    { t: 'key', id: 'moravec-def', title: '你的第二点，四十年前就被独立发现过', c: String.raw`
      让计算机在智力测验或下棋上达到成人水平相对容易，
      ==让它具备一岁小孩的感知和运动能力却极其困难。==

      原因是**进化打磨的时长差了好几个数量级**：
      逻辑推理、下棋、写文章是人类最近几千年才有的能力，
      大脑跑起来其实很吃力（所以做数学题会累）；
      而认脸、抓杯子、走路是几亿年打磨出来的，
      已经被硬编码进神经系统，跑起来毫不费力 ——
      ==正因为毫不费力，人会误以为它简单。==
    ` },

    { t: 'compare', id: 'evolution-scale', title: '一张时间尺度对照：越往下，越是人「不觉得是本事」的本事',
      cols: ['人类能力', '进化打磨的时长', 'AI 追赶到哪了'],
      rows: [
        ['心算 / 下棋', '几千年', '早已远超'],
        ['写文章 / 写代码', '几千年', '大部分场景已追平'],
        ['听懂一句话', '几十万年', '基本追平'],
        ['认出一张脸', '约 5 亿年（视觉）', '特定基准上已追平'],
        ['伸手稳稳抓起一个杯子', '约 5 亿年（运动）', '远未追平'],
        ['在陌生房间里走一圈不撞到东西', '约 5 亿年', '远未追平'],
      ] },

    { t: 'md', c: String.raw`
      ==这张表的排序方向是反直觉的==：上面几行是人类觉得"聪明"的事，
      下面几行是连小孩都会、没人觉得是本事的事 —— **而恰恰是下面几行 AI 追不上。**
      因为下面几行的算法已经被进化压缩进了神经系统，跑起来不占意识带宽，
      ==人对自己毫不费力的能力，天然会低估它的复杂度。==
    ` },

    { t: 'warn', id: 'not-vision', title: '校准③：前端页面那个例子，不是视觉问题', c: String.raw`
      "一眼看出前端页面不合理"这件事，我想把它从"图像理解"里摘出来。

      ==纯识别任务上 AI 早就不弱了== —— 在特定图像分类基准上，
      机器的错误率已经低于人类标注者。所以它不是"看不清"。

      你一眼看出别扭，用的其实是**另外两样东西**：

      1. **对"人看到这个会怎么想"的建模** —— 你在预测一个陌生用户的反应，
         这是心智理论，不是视觉；
      2. ==**一个立场**== —— 你知道这个页面是给谁用的、要达成什么、
         哪些难看是可以忍的。AI 没有立场，除非你告诉它。

      **所以这条短板真正的名字是"判断"，不是"感知"。**
      这个校准是有用的：它意味着==你把标准写清楚，AI 的表现会明显变好==
      （因为你补上了它缺的立场）；而运动控制那条不管你怎么写都补不上
      —— 那才是真正的物理短板。
    ` },

    /* ================================================================== */
    { t: 'h', id: 'grounding', c: '四、感知：AI 读的是实验报告，人是做实验的那个' },

    { t: 'key', id: 'symbol-grounding', title: '符号接地问题', c: String.raw`
      当人说"沉重""烫手""摇摇欲坠"时，背后垫着大量真实的肌肉反馈、痛觉、平衡感。
      AI 只通过词元之间的共现概率来"理解"沉重 ——
      ==它知道"沉重"和哪些词一起出现，不知道沉重是什么感觉。==

      你说的"视听虽然编码进去了但不够饱满"，说的正是这件事。
    ` },

    { t: 'insight', id: 'my-modality', title: '我的原话', c: String.raw`
      AI 的学习都是通过比特流的。人接受信息也可以说是比特流的信息，
      但是 AI 的学习并没有将人会接受的信息都输入进去。比如触觉、嗅觉；
      而听觉和视觉虽然被编码输入了，但其效果和效率似乎也远不如人类感受到的那么饱满。
    ` },

    { t: 'warn', id: 'active-perception', title: '校准④：关键不是模态少了几种，是感知没有闭环', c: String.raw`
      我想在你这条上加一层：==就算把触觉、嗅觉的传感器数据全都塞给 AI，
      差距也不会消失。== 因为人的感知有一个 AI 没有的性质 —— **它是主动的。**

      你判断一个杯子重不重，不是被动接收数据，而是==伸手掂一下==；
      不确定是什么材质，就==敲一敲听声音、翻过来看底部==。
      人是通过**做动作去主动索取那个最能消除疑惑的数据**。

      | | 人 | AI |
      |---|---|---|
      | 数据从哪来 | 自己动手取，取什么由当下的疑惑决定 | 别人采好的数据集，取什么早就定死了 |
      | 能不能追问 | 能，不懂就再摸一次 | 不能，只能在给定的数据里找 |
      | 因果从哪来 | 干预出来的（我一动，它变了） | 相关性里推出来的 |

      一句话：==人是做实验的那个，AI 读的是实验报告。==
      这也是为什么它在因果推断上先天吃亏 ——
      **因果最可靠的来源是干预，而干预需要一个身体。**
    ` },

    /* ================================================================== */
    { t: 'h', id: 'non-tech', c: '五、被技术视角漏掉的另一半原因' },

    { t: 'md', c: String.raw`
      到这里为止，所有讨论都在回答"AI 能力够不够"。但这只是一半。
      ==即使上面三块短板明天全部补齐，大规模取代仍然不会立刻发生。==
      下面四条与模型强弱无关，属于**工作本身的结构**。
      我认为这一块被技术讨论严重低估了。
    ` },

    { t: 'key', id: 'reliability-mult', title: '① 可靠性是乘出来的，不是平均出来的', c: String.raw`
      评测报告给的是**单步平均分**，而真实工作是**一条链**：
      任何一步错，整条链的产出就作废（或者需要人回来收拾）。
      这两者之间差着一个指数。
    ` },

    { t: 'formulas', id: 'reliability-math', title: '一条 20 步流程的一次成功率', items: [
      { label: '整条流程一次做对', tex: 'P=p^{\\,n}' },
      { label: '单步 90%（听起来很不错）', tex: '0.9^{20}\\approx 12\\%' },
      { label: '单步 95%（相当强了）', tex: '0.95^{20}\\approx 36\\%' },
      { label: '单步 99%（几乎挑不出错）', tex: '0.99^{20}\\approx 82\\%' },
      { label: '要让整条链有 95%，单步需要', tex: 'p\\ge 0.95^{1/20}\\approx 99.7\\%' },
    ] },

    { t: 'md', c: String.raw`
      ==这就是"演示很惊艳、上线就崩"的全部数学==。
      从 90% 提到 99% 在体感上只是"好了一点"，在流程上却是从 12% 到 82%。
      **而这最后几个百分点，恰恰是最难的那部分。**
      工作要的不是平均质量高，是==闭环可靠==。
    ` },

    { t: 'key', id: 'accountability', title: '② 责任无法转移 —— 这条最硬', c: String.raw`
      很多岗位的本质，不是"完成任务"，而是==**有一个能被追责的主体**==。
      医生签字、审计师签字、工程师对线上事故负责、律师对意见书负责。

      **AI 无法承担责任。** 它没有财产、没有执照可以吊销、
      不会因为搞砸而失去什么。所以只要一件事需要有人负责，
      回路里就必须站着一个人 —— ==哪怕 AI 干得比他好。==

      这一条和前面所有条都不同：
      **它不是能力问题，是制度问题。模型再强也不会让它消失。**
      这也是为什么"AI 辅助 + 人签字"会是很多行业的长期稳态，
      而不是过渡形态。
    ` },

    { t: 'key', id: 'task-vs-job', title: '③ 任务 ≠ 岗位：能拆走的和拆不走的', c: String.raw`
      一个岗位是一**捆**任务，不是一项任务。
      AI 接管其中一部分，剩下的部分不会自动消失 ——
      ==而且剩下的往往恰好是最难外包的那部分。==
    ` },

    { t: 'diagram', id: 'job-bundle', title: '把一个岗位拆开看',
      note: '实心格 = AI 目前能接管的比例',
      caption: String.raw`==越往下越接管不了，而越往下越是这个岗位真正的内核。==`,
      svg: String.raw`
<svg class="dg" viewBox="0 0 700 302" role="img" aria-label="把一个岗位的任务拆开，AI 能接管的比例逐条不同">
  <text class="cap" x="0" y="14">「前端工程师」这一捆任务</text>
  <text class="lb" x="200" y="41" text-anchor="end" dominant-baseline="central">写组件代码</text>
  <g class="n a"><rect x="212" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="224.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="238" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="250.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="264" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="276.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="290" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="302.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="316" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="328.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="342" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="354.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="368" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="380.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="394" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="406.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="420" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="432.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="446" y="26" width="24" height="26" rx="4"/><text class="bt xs" x="458.0" y="39.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <text class="lb" x="200" y="75" text-anchor="end" dominant-baseline="central">调样式与兼容性</text>
  <g class="n a"><rect x="212" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="224.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="238" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="250.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="264" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="276.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="290" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="302.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="316" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="328.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n a"><rect x="342" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="354.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="368" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="380.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="394" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="406.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="420" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="432.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="446" y="60" width="24" height="26" rx="4"/><text class="bt xs" x="458.0" y="73.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <text class="lb" x="200" y="109" text-anchor="end" dominant-baseline="central">判断这个交互别扭</text>
  <g class="n a"><rect x="212" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="224.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="238" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="250.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="264" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="276.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="290" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="302.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="316" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="328.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="342" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="354.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="368" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="380.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="394" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="406.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="420" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="432.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="446" y="94" width="24" height="26" rx="4"/><text class="bt xs" x="458.0" y="107.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <text class="lb" x="484" y="111">← 要立场</text>
  <text class="lb" x="200" y="143" text-anchor="end" dominant-baseline="central">跟产品掰扯需求边界</text>
  <g class="n a"><rect x="212" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="224.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="238" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="250.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="264" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="276.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="290" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="302.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="316" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="328.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="342" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="354.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="368" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="380.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="394" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="406.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="420" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="432.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="446" y="128" width="24" height="26" rx="4"/><text class="bt xs" x="458.0" y="141.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <text class="lb" x="484" y="145">← 要人际与权衡</text>
  <text class="lb" x="200" y="177" text-anchor="end" dominant-baseline="central">决定这版能不能发</text>
  <g class="n m"><rect x="212" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="224.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="238" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="250.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="264" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="276.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="290" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="302.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="316" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="328.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="342" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="354.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="368" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="380.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="394" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="406.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="420" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="432.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="446" y="162" width="24" height="26" rx="4"/><text class="bt xs" x="458.0" y="175.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <text class="lb" x="484" y="179">← 要担责</text>
  <text class="lb" x="200" y="211" text-anchor="end" dominant-baseline="central">出事了半夜爬起来查</text>
  <g class="n m"><rect x="212" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="224.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="238" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="250.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="264" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="276.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="290" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="302.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="316" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="328.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="342" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="354.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="368" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="380.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="394" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="406.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="420" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="432.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <g class="n m"><rect x="446" y="196" width="24" height="26" rx="4"/><text class="bt xs" x="458.0" y="209.0" text-anchor="middle" dominant-baseline="central"></text></g>
  <text class="lb" x="484" y="213">← 要担责</text>
  <g class="n k"><rect x="20" y="240" width="656" height="50" rx="8"/><text class="bt sm" x="348.0" y="255.0" text-anchor="middle" dominant-baseline="central">省掉 60% 的工时　≠　省掉 60% 的岗位</text><text class="bs" x="348.0" y="275.0" text-anchor="middle" dominant-baseline="central">因为剩下的 40% 无法被单独切出来卖给任何人</text></g>
</svg>
` },

    { t: 'md', c: String.raw`
      更反直觉的是：==当一捆任务里某几项变便宜，剩下几项的相对价值反而上升==。
      代码写得越快，"判断该写什么"就越值钱。
      历史上 ATM 普及后柜员数量反而增加过一段时间，就是这个机制 ——
      单店成本降低 → 银行多开网点 → 柜员总数不降反升。
      **效率提升会刺激需求，而不只是削减用工**（杰文斯悖论）。
    ` },

    { t: 'key', id: 'diffusion-lag', title: '④ 扩散是几十年尺度的事', c: String.raw`
      即使技术就绪，组织流程、责任划分、法规、培训、数据管道全都要重建，
      这些的时间常数是**年到十年**，不是月。

      1987 年索洛有过一句被反复引用的话 ——
      ==计算机时代随处可见，唯独在生产率统计中看不见==（索洛，1987）。
      个人计算机 1980 年代初就普及了，而它在美国生产率数据上明确显形，
      要到 1990 年代中后期，==中间隔了十几年==。

      我们现在很可能正处在同一段"看得见东西、看不见数字"的滞后期里。
      ==这不构成"AI 没用"的证据，也不构成"取代马上就来"的证据。==
    ` },

    /* ================================================================== */
    { t: 'h', id: 'falsify', c: '六、这篇文章哪几句最容易被推翻' },

    { t: 'md', c: String.raw`
      对着一个正在快速变化的东西下判断，==最该做的事是先标好自己的保质期==。
      按我的估计，上面这些论点的稳固程度差别很大：
    ` },

    { t: 'compare', id: 'fragility', title: '按「多久会被推翻」排个序', cols: ['论点', '稳固程度', '盯着什么信号'],
      rows: [
        ['权重冻结、学不会新东西', '最脆弱', '这是工程取舍不是原理限制；长期记忆与持续学习是当前明确的攻坚方向'],
        ['运动控制远未追平', '较脆弱', '机器人基础模型进展很快，莫拉维克悖论正在被侵蚀，但真实环境的可靠性仍是难关'],
        ['判断力／立场缺失', '中等', '一部分可以靠把标准写清楚补上，另一部分要求价值判断，短期难'],
        ['感知缺乏主动闭环', '较稳固', '要求身体和真实世界干预，绕不过物理'],
        ['可靠性的乘法效应', '很稳固', '这是数学，不是能力；只能靠单步逼近 100% 或缩短链条'],
        ['责任无法转移', '最稳固', '制度问题。模型强到什么程度都不会自动消失'],
      ] },

    { t: 'md', c: String.raw`
      ==注意这个排序的方向==：越靠近"纯能力"的论点越脆弱，
      越靠近"结构与制度"的论点越稳固。
      所以如果要赌一件事十年后还成立，**别赌 AI 做不到什么，赌它不被允许独自做什么。**
    ` },

    /* ================================================================== */
    { t: 'h', id: 'use', c: '七、回到自己该怎么用' },

    { t: 'md', c: String.raw`
      你那句"AI 很大程度补足了人类的短板"，把整件事翻到了正面 ——
      ==短板效应有两块木桶==：AI 的桶漏在具身、责任、持续学习上；
      人的桶漏在检索带宽、记忆容量、耐心和一致性上。**这两处漏点几乎不重叠。**

      所以真正该问的不是"AI 能不能取代我"，而是：
      ==**我的哪块短板，恰好落在 AI 的长板上？**==

      顺着前面几节，可以直接读出三条：

      | 你的短板 | 配置 AI 的方式 | 依据 |
      |---|---|---|
      | 记不住、翻不动、整理慢 | 让它做检索、归纳、排版这类力气活 | 它的长板；且错了你一眼能看出来 |
      | 一次对话里教会的东西下次又要重教 | 你来当它的长期记忆：把纠正沉淀成文档和规范 | [第二节](#/notes/essays/ai-and-jobs?at=it-does-generalize) |
      | 边缘领域没有语料可依 | 手工喂文档，把它的边界框死在你给的材料里 | [上一篇的策略](#/notes/essays/ai-boundary?at=edge-strategy) |

      而有三样东西==必须留在自己手里==，因为它们正好压在 AI 的三块短板上：
      **决定做什么**（立场）、**判断对不对**（校验）、**为结果负责**（签字）。

      这个复习站就是照这个分工搭的：
      我判断归属、核对正确性、承担"这页写错了会害了自己"的后果；
      AI 负责把聊天记录变成结构化的页面。
      为什么这套分工在 408 上成立、在单片机项目上不成立，
      见[上一篇](#/notes/essays/ai-boundary?at=root-cause)。
    ` },

  ],
});
