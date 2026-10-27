# 最新架构

Next.js App Router + React + TypeScript + Tailwind CSS v4 + Motion + PixiJS 8。

只有七个场景：大厅、公寓、工坊、月光街、委托、角色、仓库。

`app/` 负责路由；`src/components/game/gothic-*.tsx` 和 `src/components/moonwork/` 是唯一 UI 实现；`src/core/cozy-engine.ts`、`v2/src/workshop-engine.ts` 是当前规则。

PixiJS 运行时代码由 `v2/scripts/build.mjs` 打包为 `workshop-runtime.js`、`gothic-atmosphere.js`，连同美术贴图复制至 `out/workshop/assets/`。本地端口 3901 只服务这些资源。

正式站没有 `/classic`、`/legacy`、`/survival` 或独立工坊实验室，也不再依赖 Phaser、Zustand 或旧 UI 组件库。

存档键依旧为 `monster-apartment:cozy:v1` 与 `monster-apartment:workshop-v2-lab`。两条经营线目前独立。

少量 `gothic-*.css` 和 `world.css` 仍提供当前场景的绘景层及特殊效果；UI 布局与业务组件优先写 Tailwind。
