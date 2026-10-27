# 怪物公寓 · Monster Apartment

**唯一正式版本**：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Motion + PixiJS 8。

[打开游戏](https://kunlong-luo.github.io/monster-apartment/)

## 游戏入口

| 场景 | 网址 | 功能 |
| --- | --- | --- |
| 哥特大厅 | `/` | 月纱互动、主线任务、资源概览 |
| 公寓 | `/apartment/` | 建房、入住、装修、住客照顾与突发事件 |
| 月光工坊 | `/workshop/` | PixiJS 设备建设、派工、搬迁、升级、生产 |
| 月光街 | `/town/` | 商店采购、居民委托 |
| 委托大厅 | `/orders/` | 普通订单与月纱特别委托 |
| 角色 | `/characters/` | 工匠和岗位 |
| 仓库 | `/warehouse/` | 真实库存及采购 |

不再包含旧版 `/classic`、`/legacy`、`/survival` 和独立 `/workshop-lab` 实验室。

## 开发

需要 Node.js 24、pnpm 12，开发模式下 PixiJS 资源由独立静态服务器提供。

```bash
pnpm install --frozen-lockfile
npm --prefix v2 ci
# 终端一
pnpm dev
# 终端二：只提供 PixiJS 资源，不再托管第二套游戏 UI
npm --prefix v2 run dev
```

本地检查：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm e2e
NEXT_STATIC_EXPORT=1 pnpm build
```

## 架构

- `app/`：七个最新页面及 Tailwind v4 全局入口
- `src/components/game/gothic-*.tsx`：大厅、公寓与共享 HUD
- `src/components/moonwork/`：工坊、街区、委托、仓库与经营交互
- `src/core/cozy-engine.ts`：公寓规则
- `v2/src/workshop-engine.ts`：工坊、订单、市集规则
- `v2/src/workshop-lab-stage.ts`：PixiJS 2D 游戏舞台
- `v2/src/runtime.ts`、`v2/src/gothic-atmosphere.ts`：按需加载的 WebGL 资源
- `v2/art/`：当前角色及建筑素材

TypeScript 负责业务和 React UI，Tailwind 管布局与视觉，Motion 负责 UI 过渡，PixiJS 负责 2D 场景。

## 存档说明

当前公寓与工坊保留各自既有存档键：

- `monster-apartment:cozy:v1`
- `monster-apartment:workshop-v2-lab`

删除仓库中的旧代码**不会清空浏览器本地存储**。但公寓与工坊当前仍是两套独立经营状态；不要将两者星币视为共享余额。

推送 `main` 后须先通过 GitHub Actions `Quality`，再由 `Deploy GitHub Pages` 发布。新站只部署 Next.js 页面和工坊 PixiJS 静态资源。
