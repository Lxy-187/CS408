/* ==========================================================================
   manifest.js —— 知识树（全站唯一的结构定义）
   ==========================================================================
   层级：学科 subject → 章 chapter → 专题 topic
   路由：#/<subject.id>/<chapter.id>/<topic.id>

   topic 带 file 字段  = 已有内容，启动时自动加载该文件
   topic 不带 file     = 占位，侧栏显示为灰色「待补充」

   新增一个专题：
     1. 在下面对应章节的 topics 里加一条，写上 file 路径
     2. 新建那个内容文件（格式见 CLAUDE.md）
   顺序即侧栏顺序，也是「上一篇 / 下一篇」的顺序。

   408 分值分布：数据结构 45 · 组成原理 45 · 操作系统 35 · 计算机网络 25
   ========================================================================== */

KM.tree([

  /* ======================================================================
     数据结构（45 分）
     ====================================================================== */
  {
    id: 'ds',
    title: '数据结构',
    chapters: [
      {
        id: 'intro', no: '1', title: '绪论与算法分析',
        topics: [
          { id: 'complexity',   title: '时间 / 空间复杂度分析' },
          { id: 'recurrence',   title: '递归式求解与主定理' },
          { id: 'adt',          title: '抽象数据类型与存储结构' },
        ],
      },
      {
        id: 'list', no: '2', title: '线性表',
        topics: [
          { id: 'seq-list',     title: '顺序表：插入删除与扩容' },
          { id: 'linked-list',  title: '单链表 / 双链表 / 循环链表' },
          { id: 'list-algo',    title: '链表经典算法（逆置 / 归并 / 找环 / 交点）' },
          { id: 'list-compare', title: '顺序存储与链式存储的选择' },
        ],
      },
      {
        id: 'stack-queue', no: '3', title: '栈、队列与数组',
        topics: [
          { id: 'stack',        title: '栈的应用（括号匹配 / 表达式求值 / 递归转非递归）' },
          { id: 'queue',        title: '队列与循环队列的判空判满' },
          { id: 'special-matrix', title: '特殊矩阵与稀疏矩阵的压缩存储' },
        ],
      },
      {
        id: 'string', no: '4', title: '串',
        topics: [
          { id: 'match',        title: '朴素模式匹配' },
          { id: 'kmp',          title: 'KMP 与 next 数组',
            file: 'content/ds/04-string/kmp.js' },
        ],
      },
      {
        id: 'tree', no: '5', title: '树与二叉树',
        topics: [
          { id: 'traversal',    title: '遍历（递归 / 非递归 / 层序）' },
          { id: 'properties',   title: '二叉树的性质与计数' },
          { id: 'thread-tree',  title: '线索二叉树' },
          { id: 'bst',          title: '二叉排序树与平衡二叉树' },
          { id: 'huffman',      title: '哈夫曼树与哈夫曼编码' },
          { id: 'forest',       title: '树、森林与二叉树的转换' },
          { id: 'union-find',   title: '并查集' },
        ],
      },
      {
        id: 'graph', no: '6', title: '图',
        topics: [
          { id: 'storage',      title: '存储结构与遍历（DFS / BFS）' },
          { id: 'mst',          title: '最小生成树（Prim / Kruskal）' },
          { id: 'shortest',     title: '最短路径（Dijkstra / Floyd / BFS）' },
          { id: 'topo',         title: '拓扑排序与关键路径' },
        ],
      },
      {
        id: 'search', no: '7', title: '查找',
        topics: [
          { id: 'binary',       title: '折半查找与判定树' },
          { id: 'btree',        title: 'B 树与 B+ 树' },
          { id: 'hash',         title: '散列表：冲突处理与查找效率' },
        ],
      },
      {
        id: 'sort', no: '8', title: '排序',
        topics: [
          { id: 'insert-swap',  title: '插入类与交换类排序' },
          { id: 'select-heap',  title: '选择类排序与堆' },
          { id: 'merge-radix',  title: '归并排序与基数排序' },
          { id: 'sort-compare', title: '八大排序对比与选择' },
          { id: 'external',     title: '外部排序与败者树' },
        ],
      },
    ],
  },

  /* ======================================================================
     计算机组成原理（45 分）
     ====================================================================== */
  {
    id: 'co',
    title: '计算机组成原理',
    chapters: [
      {
        id: 'overview', no: '1', title: '计算机系统概述',
        topics: [
          { id: 'hierarchy',    title: '层次结构与工作原理' },
          { id: 'performance',  title: '性能指标（CPI / MIPS / 加速比）' },
        ],
      },
      {
        id: 'data', no: '2', title: '数据的表示和运算',
        topics: [
          { id: 'number-sys',   title: '进制转换与真值机器数' },
          { id: 'complement',   title: '原码 / 反码 / 补码与溢出判断' },
          { id: 'cast',         title: 'C 语言的整数类型与类型转换',
            file: 'content/co/02-data/cast.js' },
          { id: 'float',        title: '浮点数表示（IEEE 754）',
            file: 'content/co/02-data/float.js' },
          { id: 'alu',          title: '定点运算与 ALU' },
          { id: 'mul',          title: '整数乘法的实现与优化',
            file: 'content/co/02-data/mul.js' },
          { id: 'float-op',     title: '浮点运算与规格化',
            file: 'content/co/02-data/float-op.js' },
        ],
      },
      {
        id: 'memory', no: '3', title: '存储系统',
        topics: [
          { id: 'hierarchy',    title: '存储层次与局部性原理' },
          { id: 'main-memory',  title: '主存与 CPU 的连接、多体交叉' },
          { id: 'cache',        title: 'Cache：映射方式与替换算法' },
          { id: 'cache-write',  title: 'Cache 写策略与命中率计算' },
          { id: 'virtual',      title: '虚拟存储器与 TLB' },
        ],
      },
      {
        id: 'instruction', no: '4', title: '指令系统',
        topics: [
          { id: 'format',       title: '指令格式与操作码扩展' },
          { id: 'addressing',   title: '寻址方式' },
          { id: 'cisc-risc',    title: 'CISC 与 RISC' },
        ],
      },
      {
        id: 'cpu', no: '5', title: '中央处理器',
        topics: [
          { id: 'datapath',     title: '数据通路与单指令执行过程' },
          { id: 'control',      title: '控制器（硬布线 / 微程序）' },
          { id: 'pipeline',     title: '流水线：冒险与性能计算' },
          { id: 'exception',    title: '异常与中断机制',
            file: 'content/co/05-cpu/exception.js' },
        ],
      },
      {
        id: 'bus', no: '6', title: '总线',
        topics: [
          { id: 'bus-basic',    title: '总线结构与性能指标' },
          { id: 'bus-timing',   title: '总线仲裁与定时' },
        ],
      },
      {
        id: 'io', no: '7', title: '输入输出系统',
        topics: [
          { id: 'io-mode',      title: '程序查询 / 中断 / DMA 三种方式' },
          { id: 'interrupt',    title: '中断响应与处理流程',
            file: 'content/co/07-io/interrupt.js' },
          { id: 'dma',          title: 'DMA 传送过程与周期挪用' },
        ],
      },
    ],
  },

  /* ======================================================================
     操作系统（35 分）
     ====================================================================== */
  {
    id: 'os',
    title: '操作系统',
    chapters: [
      {
        id: 'intro', no: '1', title: '操作系统概述',
        topics: [
          { id: 'features',     title: '并发 / 共享 / 虚拟 / 异步' },
          { id: 'kernel',       title: '内核态用户态与系统调用' },
        ],
      },
      {
        id: 'process', no: '2', title: '进程与线程',
        topics: [
          { id: 'pcb',          title: '进程状态转换与 PCB' },
          { id: 'thread',       title: '线程模型与实现方式' },
          { id: 'schedule',     title: '调度算法与周转时间计算' },
          { id: 'sync',         title: '同步互斥与信号量' },
          { id: 'classic',      title: '经典同步问题（生产者消费者 / 读者写者 / 哲学家）' },
          { id: 'deadlock',     title: '死锁：四条件 / 银行家算法 / 检测' },
        ],
      },
      {
        id: 'memory', no: '3', title: '内存管理',
        topics: [
          { id: 'allocation',   title: '连续分配与动态分区' },
          { id: 'paging',       title: '分页、分段与段页式' },
          { id: 'address',      title: '地址变换与快表' },
          { id: 'virtual',      title: '虚拟内存与请求分页' },
          { id: 'replace',      title: '页面置换算法与抖动' },
        ],
      },
      {
        id: 'file', no: '4', title: '文件管理',
        topics: [
          { id: 'file-struct',  title: '文件的逻辑结构与物理结构' },
          { id: 'directory',    title: '目录结构与文件共享' },
          { id: 'free-space',   title: '空闲空间管理' },
          { id: 'disk',         title: '磁盘调度算法与磁盘结构' },
        ],
      },
      {
        id: 'io', no: '5', title: '输入输出管理',
        topics: [
          { id: 'io-software',  title: 'I/O 软件层次与设备驱动' },
          { id: 'buffer',       title: '缓冲区管理与 SPOOLing' },
        ],
      },
    ],
  },

  /* ======================================================================
     计算机网络（25 分）
     ====================================================================== */
  {
    id: 'net',
    title: '计算机网络',
    chapters: [
      {
        id: 'arch', no: '1', title: '体系结构',
        topics: [
          { id: 'layers',       title: 'OSI 与 TCP/IP 分层模型' },
          { id: 'performance',  title: '时延、带宽与吞吐量计算' },
        ],
      },
      {
        id: 'physical', no: '2', title: '物理层',
        topics: [
          { id: 'transmission', title: '传输介质与编码方式' },
          { id: 'channel',      title: '信道极限（奈奎斯特 / 香农）' },
        ],
      },
      {
        id: 'link', no: '3', title: '数据链路层',
        topics: [
          { id: 'framing',      title: '组帧与差错控制（CRC / 海明码）' },
          { id: 'flow',         title: '流量控制与可靠传输（停等 / 后退 N / 选择重传）' },
          { id: 'mac',          title: '介质访问控制（CSMA/CD、CSMA/CA）' },
          { id: 'lan',          title: '局域网、以太网与交换机' },
        ],
      },
      {
        id: 'network', no: '4', title: '网络层',
        topics: [
          { id: 'ipv4',         title: 'IPv4 地址与子网划分' },
          { id: 'cidr',         title: 'CIDR 与路由聚合' },
          { id: 'protocols',    title: 'ARP / DHCP / ICMP' },
          { id: 'routing',      title: '路由算法与协议（RIP / OSPF / BGP）' },
          { id: 'nat-ipv6',     title: 'NAT 与 IPv6' },
        ],
      },
      {
        id: 'transport', no: '5', title: '传输层',
        topics: [
          { id: 'udp',          title: 'UDP 与端口' },
          { id: 'tcp-conn',     title: 'TCP 连接管理（三次握手 / 四次挥手）' },
          { id: 'tcp-reliable', title: 'TCP 可靠传输与滑动窗口' },
          { id: 'congestion',   title: '拥塞控制（慢开始 / 拥塞避免 / 快重传快恢复）' },
        ],
      },
      {
        id: 'application', no: '6', title: '应用层',
        topics: [
          { id: 'dns',          title: 'DNS 域名解析' },
          { id: 'http',         title: 'HTTP 与 Web' },
          { id: 'ftp-mail',     title: 'FTP 与电子邮件' },
        ],
      },
    ],
  },

  /* ======================================================================
     跨科手法主线
     —— 另一条轴。上面四门课按「对象」组织（数据结构 / 硬件 / 系统 / 协议），
        这里按「反复出现的核心思想」组织：同一个思想在四门课里各自的化身。
        全部待补充，想到了就跟 Claude 说。
     ====================================================================== */
  {
    id: 'threads',
    title: '跨科手法主线',
    chapters: [
      {
        id: 'map', title: '总纲',
        topics: [
          { id: 'overview',   title: '按思想重组：另一张地图' },
        ],
      },
      {
        id: 'lines', title: '核心思想',
        topics: [
          { id: 'locality',   title: '局部性原理：Cache / 页面置换 / 预读 / B+ 树' },
          { id: 'layering',   title: '分层与抽象：网络分层 / 存储层次 / OS 抽象' },
          { id: 'space-time', title: '空间换时间：索引 / 散列 / 缓存 / 位图' },
          { id: 'redundancy', title: '冗余与校验：CRC / 海明码 / RAID / 重传' },
          { id: 'concurrency',title: '并发控制：临界区 / 锁 / 信号量 / 流水线冒险' },
          { id: 'lookup',     title: '查找结构的演化：顺序 → 折半 → 树 → B 树 → 散列' },
        ],
      },
    ],
  },

  /* ======================================================================
     错题本
     —— 一张卡 = 一个丢过分的点（不是一整道题）。
        卡片按科目写在 content/review/ 下，「全部错点」页会用 { t:'cards' }
        自动按时间收集，方便按"多久没看了"复习。
        新增卡片：在对应科目页里加一个 card 块，写清 date / q / wrong / right / why / link。
     ====================================================================== */
  {
    id: 'review',
    title: '错题本',
    chapters: [
      {
        id: 'index', title: '总览',
        topics: [
          { id: 'deck', title: '卡片练习（翻面自测）',
            file: 'tools/deck.js' },
          { id: 'all',  title: '全部错点 · 按时间',
            file: 'content/review/all.js' },
        ],
      },
      {
        id: 'co', title: '组成原理',
        topics: [
          { id: 'data', title: '数据的表示和运算',
            file: 'content/review/co-data.js' },
        ],
      },
    ],
  },

  /* ======================================================================
     工具箱
     —— 交互小工具。有些东西（浮点的位、补码的溢出、Cache 的地址划分）
        自己拨一下比读三段话快得多。
        每个工具一个文件，放在 tools/ 下，文件里同时写工具本体和它的说明页，
        格式见 tools/ieee754.js 与 assets/js/tools.js。
        注册之后任何知识页都能用 { t:'tool', use:'<id>' } 就地嵌进去。
     ====================================================================== */
  {
    id: 'tools',
    title: '工具箱',
    chapters: [
      {
        id: 'co', title: '组成原理',
        topics: [
          { id: 'ieee754',    title: 'IEEE 754 位模式',
            file: 'tools/ieee754.js' },
          { id: 'complement', title: '原码 / 反码 / 补码互转' },
          { id: 'cache-addr', title: 'Cache 地址划分（组号 / 块号 / 块内偏移）' },
        ],
      },
      {
        id: 'net', title: '计算机网络',
        topics: [
          { id: 'subnet',     title: '子网划分与 CIDR 计算器' },
        ],
      },
      {
        id: 'ds', title: '数据结构',
        topics: [
          { id: 'sort-anim',  title: '排序过程逐趟演示' },
          { id: 'bplus',      title: 'B+ 树插入删除演示' },
        ],
      },
    ],
  },

  /* ======================================================================
     随笔
     ====================================================================== */
  {
    id: 'notes',
    title: '随笔',
    chapters: [
      {
        id: 'essays', title: '关于计算机科学',
        topics: [
          { id: 'placeholder', title: '（待补充）' },
        ],
      },
    ],
  },

]);
