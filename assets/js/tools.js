/* ==========================================================================
   tools.js —— 交互工具注册表
   408 里有一批东西「说三段不如自己拨一下」：浮点数的位、补码的溢出、
   Cache 地址的三段划分、子网掩码。这些做成小工具，比文字省事得多。

   一个工具 = tools/ 下的一个文件，文件里做两件事：
     1) KM.tool({ id, title, subtitle, path, mount(el) })   注册工具本体
     2) KM.page({ path: 'tools/<章>/<id>', blocks: [...] })  它自己的说明页

   注册之后，任何内容页都能用 { t:'tool', use:'<工具id>' } 把它嵌进去。
   加载方式和内容页一样：manifest.js 里那条 topic 的 file 指向工具文件即可，
   不用改 index.html。
   ========================================================================== */

(function (KM) {

  const tools = new Map();

  /* ------------------------------ 注册 ------------------------------ */
  function tool(def) {
    if (!def || !def.id) { console.error('[KM] 工具缺少 id 字段', def); return; }
    if (tools.has(def.id)) console.warn('[KM] 重复注册的工具：' + def.id);
    tools.set(def.id, def);
  }

  const getTool  = id => tools.get(id) || null;
  const allTools = () => [...tools.values()];

  /* ------------------------------ 挂载 ------------------------------
     页面渲染出的是一个空壳 <div class="tool-mount" data-tool="xxx">，
     DOM 插进文档之后才调 mount()（工具里常要量尺寸、绑事件）。
     每次路由切换都是全新的 DOM，所以工具状态天然随页面重置。 */
  function mountTools(root) {
    (root || document).querySelectorAll('.tool-mount').forEach(el => {
      if (el.dataset.mounted) return;
      const def = tools.get(el.dataset.tool);
      if (!def || typeof def.mount !== 'function') {
        el.innerHTML = '<div class="tool-fail">工具「' + KM.esc(el.dataset.tool || '') +
                       '」没有注册，检查 manifest 里有没有加载它的文件</div>';
        return;
      }
      el.dataset.mounted = '1';
      try {
        def.mount(el);
      } catch (e) {
        console.error('[KM] 工具运行出错：' + def.id, e);
        el.innerHTML = '<div class="tool-fail">工具运行出错，详情见浏览器控制台</div>';
      }
    });
  }

  KM.tool = tool;
  KM.getTool = getTool;
  KM.allTools = allTools;
  KM.mountTools = mountTools;

})(window.KM);
