# Monster Apartment — Next.js 技术栈

基线日期：2026-10-21；迁移版本：V0.2.0；技术参照：Pagevela 的版本纪律 + Next.js 16 官方文档（App Router、`next/dynamic`、`serverExternalPackages`）。

## 1. 迁移结论

V0.1.x 使用 Vite 8 + React 19 + 手写 CSS。V0.2.0 把整个项目搬到 **Next.js 16 App Router**，并按组件化重构：UI 拆成 `components/ui` primitives 与 `components/game` 业务组件，样式从 `style.css` 的整体类名改为 Tailwind utility + `@theme` 设计令牌。

**保留不变**：六房五日玩法、数值平衡、Phaser 画面、Zustand 状态边界、全部 E2E 行为契约。

## 2. 技术版本及决策

| 层面 | 最终采用 | 为什么 | 原型状况 |
|---|---|---|---|
| 运行时 | Node 24 LTS | 与 Pagevela 一致；`node --test` 依赖其类型剥离能力 | v24.20.0 实测 |
| 包管理 | pnpm 12.13.0 | 统一依赖与 lockfile；精确版本门禁 | 已提交 lockfile |
| 框架/构建 | **Next.js 16.4.2**（App Router + Turbopack） | 一个引擎同时提供开发服务器、构建、路由与代码分包，移除 Vite 双工具链 | dev/build 实测通过 |
| UI | React 19.3.1 | Server/Client 边界配合 `next/dynamic` 懒加载 Phaser | 浏览器实测通过 |
| TS | TypeScript **6.0.3** | `typescript-eslint` 尚不支持 TS 7 编译器 API | typecheck/lint 通过 |
| 样式 | Tailwind 4.3.3 + `@tailwindcss/postcss` | 组件化后样式随组件走，不再维护全局类名 | 构建通过 |
| 组件库 | 自建 `src/components/ui`（Button/Panel/Badge/StatTile/ProgressBar/MeterRow/SectionHeading/LogList） | 不引入 shadcn/clsx/cva，保持零新增依赖，语义与 a11y 自己掌控 | 全部 E2E 覆盖 |
| 状态 | Zustand 5.0.15 | 招募、选房、搬家、结算、重开 | 被 E2E 覆盖 |
| 游戏渲染 | Phaser 4.2.1，`'use client'` + `next/dynamic({ ssr: false })` | 独立游戏引擎；永不进入服务端与首屏包 | 六房渲染与点击实测正常 |
| 规则 | **TypeScript 单一真源** `src/core/engine.ts` | 删除 `engine.js` + `engine.d.ts` 双份声明，类型与实现不再漂移 | 6 条 node:test + 3 条 Vitest 通过 |
| 测试 | Vitest 5.0.4 + `node:test` + Playwright 1.64.1 | 规则层可在无浏览器环境下验证 | 3 单测 + 6 E2E |
| Lint | ESLint 10.12.0 + typescript-eslint 8.71.2 + `@next/next` + `react-hooks` | 覆盖 App Router 与 Hooks 规则 | 0 warning |

**不照搬的 Pagevela 依赖**：`pdfjs-dist`、`jspdf`、`html2canvas-pro`、`react-markdown`、`libphonenumber-js`、`react-to-print`、`fflate` 等属于简历编辑器领域，本项目无使用场景。UI 层同样不引入第三方组件库。

## 3. 模块职责

```text
app/
  layout.tsx            # <html lang="zh-CN">、metadata、viewport、globals.css
  page.tsx              # 仅渲染 <GameScreen />
  globals.css           # @import "tailwindcss" + @theme 设计令牌 + canvas 宽度规则
src/
  core/engine.ts        # 纯规则：招募、相邻加成/冲突、结算、终局。不依赖 DOM/React/Phaser
  store/game-store.ts   # Zustand：命令 -> 引擎 -> 新 state；派生值留在组件内
  game/apartment-scene.ts # Phaser 场景，只负责把 state 画出来
  game/events.ts        # 类型化事件总线（room-picked / scene-ready）
  components/
    ui/                 # 无状态 primitives，可被任意 feature 组合
    apartment/          # Phaser 宿主：canvas 适配器、dynamic 包装、加载骨架
    game/               # 业务组件：screen/header/economy/management/tenant/room/result/log
tests/                  # node:test + Vitest，直接导入 engine.ts
e2e/                    # Playwright，端口 3000
public/playable.html    # V0.1 免安装试玩版（冻结，不再从源码生成）
```

**分层约束**

- `core/` 不 import React、Zustand、Phaser；因此规则可在 Node 下直接测试。
- `game/` 只做渲染与事件，不持有经营数值；React 始终是数据真源。
- `components/game/*` 不直接写带样式的裸 `<button>`/`<section>`，一律组合 `components/ui/*`。
- Phaser 每帧变化不进入 Zustand；只有玩家命令与关键经营数值跨边界。

## 4. 关键决策（ADR 摘要）

| 决策 | 理由 | 放弃的方案 |
|---|---|---|
| 移除 Vite，改用 Next 自带引擎 | 双工具链意味着两套配置、两套 CSS 管线、两份分包策略 | Vite 8 + `@vitejs/plugin-react` + `@tailwindcss/vite` |
| 不用 `next/font/google` | 构建期需要联网拉字体，离线或被墙环境直接失败 | `Inter` webfont；改为系统字体栈 |
| `playable.html` 冻结进 `public/` | 保持单一真源，避免引擎出现第二份实现 | 继续用脚本从 `engine.js` 生成（TS 化后已无输入） |
| 删除 `preview/` 与 `scripts/build_standalone.py` | 它们的输入是 `engine.js` + `style.css` 文本，迁移后无法再生，留着只会腐烂 | 维护两套渲染实现 |
| 自建 UI primitives | 需要的只是按钮、面板、徽标、进度条；第三方库会带来样式覆盖与依赖升级成本 | shadcn/ui + cva + clsx |
| `typedRoutes` 放顶层 | Next 16 已稳定，`experimental.typedRoutes` 标记为 deprecated | 保留 experimental 配置 |

## 5. 质量门禁

```bash
pnpm check:stable-deps   # 依赖必须精确版本 + packageManager pnpm@12.13.0
pnpm typecheck           # tsc --noEmit（strict、noUnusedLocals）
pnpm lint                # ESLint flat config，0 warning
pnpm test:rules          # node --test tests/engine.test.mjs（导入 engine.ts）
pnpm test                # Vitest
pnpm build               # next build
pnpm e2e                 # Playwright，baseURL http://127.0.0.1:3000
```

CI（`.github/workflows/quality.yml`）分 `checks` 与 `e2e` 两个 job，均设置 `NEXT_TELEMETRY_DISABLED=1`，并缓存 `.next/cache`。

## 6. 已知风险

- **Next 16 / Turbopack 首次编译**：dev 冷启动比 Vite 慢，Playwright `webServer.timeout` 已放宽到 120s。
- **Phaser 只能在客户端**：`ssr: false` 的 `next/dynamic` 必须从 Client Component 调用；从 Server Component 直接使用会在构建期报错。
- **Node 类型剥离是实验特性**：`node --test` 能直接跑 `engine.ts` 依赖 Node 24 的 `--experimental-strip-types` 默认开启；升级 Node 前需复跑 `pnpm test:rules`。
- **Tailwind 4 无 `tailwind.config.js`**：主题写在 `app/globals.css` 的 `@theme`，新增令牌必须同时更新设计文档，否则组件里会出现魔法色值。
- **`playable.html` 与主线存在版本差**：它是 V0.1 免安装试玩版，不随新玩法更新。
- **Firefox / Safari 与真机触屏未验证**：E2E 仅 Chromium 桌面 + 390×844 视口仿真。

## 7. 版本管理

- V0.1.0：免安装试玩 + 核心规则。
- V0.1.1：Pagevela 技术栈对齐（Vite 8、TS、Tailwind、Phaser 4）。
- V0.1.2：首次本地构建通过，修复 CSS 类型、单测与 `-0` 显示；TS 降至 6.0.3；Phaser 懒加载。
- **V0.2.0：Vite → Next.js 16 迁移，JS → TypeScript，整体组件化，样式改 Tailwind utility。**

**开发基线**：V0.1.1 Pagevela Stack（`main`，commit `cafc32e`）冻结为对比基线与回退点——不再修改，后续版本均以它为效果/性能参照。

版本查询日期：2026-10-21。
