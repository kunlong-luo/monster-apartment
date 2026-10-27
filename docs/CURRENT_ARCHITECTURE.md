# 最新架构

Next.js App Router + React + TypeScript + Tailwind CSS v4 + Motion + PixiJS 8。

只有七个场景：大厅、公寓、工坊、月光街、委托、角色、仓库。

`app/` 负责路由；`src/components/game/gothic-*.tsx` 和 `src/components/moonwork/` 是唯一 UI 实现；`src/core/cozy-engine.ts`、`v2/src/workshop-engine.ts` 是当前规则。

PixiJS 运行时代码由 `v2/scripts/build.mjs` 打包为 `workshop-runtime.js`、`gothic-atmosphere.js`，连同美术贴图复制至 `out/workshop/assets/`。本地端口 3901 只服务这些资源。

正式站没有 `/classic`、`/legacy`、`/survival` 或独立工坊实验室，也不再依赖 Phaser、Zustand 或旧 UI 组件库。

存档键依旧为 `monster-apartment:cozy:v1` 与 `monster-apartment:workshop-v2-lab`。两条经营线目前独立。

少量 `gothic-*.css` 和 `world.css` 仍提供当前场景的绘景层及特殊效果；UI 布局与业务组件优先写 Tailwind。

## 单一 UI 所有权与样式边界（2026-10）

- React + TypeScript：控制按钮、工匠清单、设备目录、委托面板、仓库数据、资源 HUD。工坊按钮与列表收敛在 `src/components/moonwork/workshop-controls.tsx`。
- PixiJS：独立打包的 2D 场景、机器绘景、角色动画、格子命中和视觉反馈。运行时 `v2/src/main.ts` 只负责挂载、派发指令、暂态选择及本地存档；不得用 `innerHTML` 或逐个更新 React 控件。
- 正式工坊仅挂载在 Next 的 `/workshop/`；`v2/src/runtime.ts`、`v2/scripts/build.mjs` 是必需的 Pixi 资源入口及编译工具，不是旧 UI。
- CSS：共七份，`app/globals.css` 负责 Tailwind 主题；其他文件目前仍包含复杂哥特式绘景、响应式布局与特殊视觉效果。继续将普通控件样式迁移至 Tailwind，但不机械删除已在场景中使用的规则。
- JavaScript：无 `.js`/`.jsx` 正式源文件。六个 `.mjs` 仅用于 lint/PostCSS、构建、资源审核与本地静态服务；这些属于现代 Node 工具链，不需要强制改成 TS。
- 技术债：`src/core/cozy-engine.ts`、`v2/src/workshop-engine.ts`、`v2/src/workshop-lab-stage.ts` 是需逐步拆分的大型规则/绘制文件；React 与 Pixi 之间目前仍通过 DOM dataset/custom events 交换暂态输入，后续考虑收敛为显式类型化适配器，保持已有存档键及行为。

## 工坊领域模块（第二轮拆分）

- `v2/src/workshop-model.ts`：序列化数据类型、设备/工匠静态配置、经济常数与棋盘拓扑。
- `v2/src/workshop-guidance.ts`：纯函数新手引导、下一步目标；不引用任何 UI。
- `v2/src/workshop-town.ts`：街区交易、每日交易次数、居民委托与材料库存变化。
- `v2/src/workshop-production.ts`：单日产出流水线、原料转移、订单和月纱的结算规则。
- `v2/src/workshop-engine.ts`：设备升级与派工、委托选择、预测逻辑、存档校验；同时重导出原有公共接口，旧模块引用不需要修改。

以上模块不引用 React、DOM 或 PixiJS，且与原 V2 存档 JSON 结构兼容。新领域功能应优先进入职责明确的模块，不继续增加巨型单文件。

## Pixi 场景与 Tailwind 组件边界（第三轮）

- `v2/src/workshop-painted-art.ts`：容错加载绘制 AVIF 贴图；失败时沿用现有 GPU 精灵的安全降级路径。
- `v2/src/workshop-floating-feedback.ts`：临时数字贴图的数量上限、逐帧位移、透明度、生命周期；始终不截获地块点击。
- `v2/src/workshop-shift-effects.ts`：依据已结算的真实班次结果生成产量、缺料、交付提示，不重复触发存档重载时的动画。
- `v2/src/workshop-lab-stage.ts`：仍管理 Pixi 容器层级、场景交互、贴图合成与屏幕自适应；不再重复管理以上三个子模块。
- 库存数字行、快捷链接布局以及行为结果提示改用 React 组件及 Tailwind v4 类；删除 `world.css` 中无引用的 `.mw-stock`、`.mw-message`、`.mw-context-links` 等历史选择器。复杂绘景 CSS 暂时保留。
