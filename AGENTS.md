# 怪物公寓当前工程约束

## 唯一正式路由
`/`、`/apartment/`、`/workshop/`、`/town/`、`/orders/`、`/characters/`、`/warehouse/`。

禁止重建 `/classic`、`/legacy`、`/survival`、`/workshop-lab` 和独立 V2 HTML 游戏。

## 技术分工
- Next.js 16、React 19、TypeScript（strict）及 Tailwind CSS v4 负责 UI。
- Motion for React 管临时交互动效；PixiJS 8 管 2D 场景和环境粒子。
- `src/core/cozy-engine.ts` 管公寓；`v2/src/workshop-engine.ts` 管工坊/市集/委托。
- `v2/src/runtime.ts`、`v2/src/workshop-lab-stage.ts` 是当前工坊 Pixi 资源，不是旧页面。
- 公寓存档键及工坊存档键不得擅自清除或更换。
- 保持满屏绘景与小型 HUD；不增加重复菜单、无意义按钮或整页长滚动后台。
- 只为七个当前路由维护 Vitest 与 Playwright 测试。
- 只有质量检查与 Pages 部署均成功后才声称已上线。
