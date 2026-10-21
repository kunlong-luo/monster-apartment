# Monster Apartment · V0.2.1 Next.js 技术栈

**游戏玩法：** 六间房、四类租客、招募 / 移动 / 交换、邻接加成、五日经营与重开。首版为可行性原型，并非商业发行游戏。

**技术栈：** Next.js 16.4.2（App Router + Turbopack）、React 19.3.1、TypeScript 6.0.3、Tailwind CSS 4.3.3、Zustand 5.0.15、Phaser 4.2.1、Node 24 / pnpm 12.13.0。项目知识库见 [`AGENTS.md`](./AGENTS.md)。

## 1. 先试玩旧版（不需要安装）

`public/playable.html` 双击即可打开，是 **V0.1 的免依赖试玩版**，与当前技术栈无关，仅用于对比玩法。

## 2. 安装与启动

```bash
node -v                 # 应为 v24.x
npm install -g pnpm@12.13.0
pnpm -v                 # 应为 12.13.0
pnpm install
pnpm dev                # http://127.0.0.1:3000/
```

生产构建：`pnpm build && pnpm start`（同样监听 127.0.0.1:3000）。

## 3. 提交前门禁（2026-10-21 实测全绿）

```bash
pnpm check:stable-deps  # 依赖必须为精确 semver
pnpm typecheck          # tsc --noEmit
pnpm lint               # ESLint flat config，0 warning
pnpm test:rules         # node --test，6 条
pnpm test               # vitest，3 条
pnpm build              # Next 16 Turbopack
pnpm e2e                # Playwright，原有6条 + 新增3条搬家交换测试（需 pnpm exec playwright install chromium）
```

CI（`.github/workflows/quality.yml`）使用 `pnpm install --frozen-lockfile`，分 `checks` 与 `e2e` 两个 job。

## 4. 架构

| 位置 | 功能 |
|---|---|
| `app/layout.tsx` / `app/page.tsx` | App Router 入口，唯一路由 `/` |
| `app/globals.css` | Tailwind 4 入口与 `@theme` 设计令牌 |
| `src/core/engine.ts` | 全部游戏规则；纯 TS，零框架依赖，唯一真源 |
| `src/store/game-store.ts` | Zustand 状态与 7 个动作，包装引擎返回值 |
| `src/game/apartment-scene.ts` | Phaser 4 六房平面图与点击映射 |
| `src/game/events.ts` | React ⇄ Phaser 的类型化事件总线 |
| `src/components/apartment/*` | 客户端专有边界（`next/dynamic({ ssr:false })`） |
| `src/components/game/*` | 顶栏、租客面板、房间选择器、结算等 11 个面板 |
| `src/components/ui/*` | 9 个自建 primitive（Button/Panel/Badge/…），不依赖第三方 UI 库 |
| `tests/` | 引擎单测：Node 类型剥离 6 条 + Vitest 3 条 |
| `e2e/` | Playwright：原有6项流程 + 3项搬家/交换/终局回归（PR CI 9/9 通过） |
| `docs/` | 产品计划、技术栈矩阵、变更记录 |
| `management/TASKS.csv` | 任务状态与验收标准 |

## 5. 迁移变更（V0.1.2 → V0.2.0）

- Vite 8 SPA → Next.js 16 App Router；删除 `index.html`、`src/main.tsx`、`src/App.tsx`、`vite.config.ts`、`preview/`。
- 规则层 JS → TS 单文件，`public/playable.html` 保持冻结、不再共享规则实现。
- 全量组件化：UI primitive 与业务面板分层，业务组件不再直接写裸样式的 `<button>` / `<section>`。
- 清掉三个已无引用的遗留文件（`src/style.css`、`src/store/useGameStore.ts`、`src/game/ApartmentScene.ts`），避免同名 store / 场景双份实现。
- 端口 5173 → 3000；变量与 API 未变。

## 6. 已知限制

- TypeScript 固定 6.0.3：`typescript-eslint` 尚不支持 TypeScript 7 的编译器 API。
- Phaser 通过 `next/dynamic` 独立分包，进入画面时会短暂显示“正在加载公寓地图…”。
- 数值平衡：最优布局五天可达 232 金币 / 满意度 63（目标 135 / 55）；空置房会亏损。
- 尚无存档、英文、音效、账号与 Electron 打包。

## 7. V0.2.1 修复与 Web 部署准备

- 恢复“移动 / 交换租客”按钮，并在未选中已入住的房间、游戏结束或已进入搬家模式时禁用；取消搬家仍可使用。
- 新增 `e2e/move-swap.spec.ts`，覆盖空房搬入、两间已入住房间交换、取消操作与终局禁用。
- 删除无效的 `BonusList` 重复组件，组合详情仍由 `ManagementPanel` 显示。
- GitHub Pages 使用可选静态导出构建（`NEXT_STATIC_EXPORT=1 pnpm build`）；常规开发模式无需修改。部署说明见 [DEPLOYMENT_NEXTJS.md](./docs/DEPLOYMENT_NEXTJS.md)。
- **验证：PR #1 已通过常规构建、9/9 Playwright 测试和静态导出 CI；正式 Pages 链接仍须合并并配置 Pages 后人工验收。**

## 8. 下一阶段

V0.3 优先：新手引导、英文、本地存档、数值调优与外部玩家测试。
