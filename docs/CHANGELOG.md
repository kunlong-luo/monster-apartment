# 版本更新记录

## V0.4.0 Stage 2 — 2026-10-22 — 房间特征、偏好与夜间决策（PR #5）

### Added
- 固定房间特征与怪物偏好：对应房间每夜 +3 金币/+2 满意度，不匹配每夜 -1/-1。
- 三种有明确经济与满意度取舍的夜间经营政策；每天选定、结算后重置为稳健。
- 预估面板、房间标签、夜间详细日志和英文说明同步更新。
- 继续兼容旧 V1 localStorage 自动存档；加入规则、迁移、策略保存及手机浏览器端到端测试。

### Notes
- 游戏框架仍为一屏主场景、五日终局。不改已有招募价格、基础租金和邻居组合。
- 新玩法影响整体难度，首次公开发布前需平衡测评。
- 尚处 PR 开发/验证中，不视为线上已部署。


## V0.4.0 — 2026-10-22 — 单屏游戏布局（第一阶段，PR #4）

### Changed
- 1440×900 桌面版固定一屏展示主要游戏流程；左右工具面板独立滚动，公寓始终可见。
- 390×844 手机端显示固定公寓舞台和底部四操作标签，不再通过整页纵向滚动寻找招募、选房与结算。
- 说明变成可滚动的舞台浮层，新手引导压缩为小提示条；调整桌面卡片密度与版面空间。

### Verification
- 新增 Playwright 单屏尺寸与四标签操作流程检查；现有六房布局、五日事件、双语和自动存档不变。
- 此阶段仍为 PR，新的房间属性/租客偏好/运营决策等玩法将在后续独立 PR 进行，不声称 V0.4 已完整发布。


## V0.3.0 — 2026-10-22 — Midnight Cozy 视觉改版（PR #3）

### Changed
- 从深蓝后台面板转换为怪物公寓主题：午夜紫、暖金、奶油白、星空纹理、装饰性标题和新 HUD。
- Phaser 4 直接绘制公寓切面：斜屋顶、月亮、六间有窗/地板/家具/灯光的房间，以及四种不同的怪物轮廓与面部表情。
- 招募卡片、进度条、经营指标、按钮、组合效果和夜间手记统一视觉规范。
- 响应式布局：大屏为三栏，中屏主舞台置顶+双辅助栏，窄屏公寓主舞台置顶。
- 为追踪视觉回归新增桌面和移动端 Playwright 检查，并在 GitHub Actions 上传屏幕截图供人工审查。

### Compatibility
- 经营规则和数值未修改；Next.js 16、Phaser 4、React 19、Zustand、Tailwind 4 和静态导出保持不变。
- V0.2.2 PR #2 已合并，V0.3.0 PR #3 现以 main 为目标分支。
- CI 不会自动证明 UI 达到商用品质；上线前应检查画面截图和真人操作体验。


## V0.2.2 — 2026-10-22 — 核心功能补全（开发分支）

### Added
- 浏览器本地自动存档：保存与恢复六房进度、金币、结算、语言、教程状态；读取时校验版本与所有字段。
- 四步交互式新手引导：选房、招募、移动/交换、每日结算；可以跳过和重新查看。
- 中英文界面：主要操作、租客卡、经营面板、Phaser 房间文字、每日事件与日志。
- Vitest 存档校验与英文事件测试；Playwright 刷新恢复、双语与引导回归。

### Limitations
- 存档只保存在当前浏览器和站点，不提供账号、跨设备同步或云备份。
- 游戏核心数值和五日固定事件顺序不变，旧版 playable.html 不共享存档。
- PR #2 当前提交已通过 TypeScript、ESLint、规则测试、Vitest、Next 构建、静态导出及 Playwright 12/12。尚须用户审核合并，合并前正式网页仍为 V0.2.1。


## V0.2.1 — 2026-10-21 — 搬家交互回归与 Web 部署准备

### Fixed
- Next.js 组件化后丢失的“移动 / 交换租客”入口恢复，未入住的房间与终局状态不可启动搬家。
- React 经营面板内移除固定为空的重复 `BonusList`；组合收益展示继续使用 `ManagementPanel`。

### Added
- Playwright 端到端回归：搬入空房、已入住房间交换、取消操作、终局禁用。
- `NEXT_STATIC_EXPORT=1` 可选 Next.js 静态构建，GitHub Pages 使用 `/monster-apartment` 子路径；默认 `pnpm dev/build/start` 保留 Next 常规模式。
- PR 质量门禁新增静态导出构建，新增 Pages 部署 workflow 与 `docs/DEPLOYMENT_NEXTJS.md`。
- `management/TASKS.csv` 更新了已在 V0.2.0 CI 确认的构建/测试状态。

### Verification
- PR #1 首轮 Actions 验证已通过：类型检查、lint、规则测试、Vitest、常规 Next.js 构建、静态导出，以及 Playwright 9/9。后续文档提交仍需等待当前最新 SHA 的 CI；正式 Pages 部署与网页可访问性尚待合并后验收。
- 不包含游戏盈利或 Web 分发平台审核验证。


## V0.2.0 — 2026-10-21 — Next.js 16 迁移与全量组件化

### Changed
- 构建从 Vite 8 SPA 换为 Next.js 16.4.2 App Router + Turbopack：`app/layout.tsx` + `app/page.tsx`，开发/生产端口 5173 → 3000。
- 规则层 `src/core/engine.js` → `src/core/engine.ts`：纯 TypeScript、零框架依赖，23 个导出，node:test / vitest / 浏览器共用。
- 全量组件化：`src/components/ui/*` 9 个无依赖 primitive、`src/components/game/*` 11 个面板、`src/components/apartment/*` 3 个 Phaser 桥接组件。
- Phaser 改为 `next/dynamic({ ssr:false })` 客户端独占加载；`next.config.ts` 设 `serverExternalPackages: ['phaser']` 与 `typedRoutes`。
- Tailwind 4 主题迁到 `app/globals.css` 的 `@theme`，不再有 `tailwind.config.js`。
- 测试拆分保持不变：`tests/engine.test.mjs` 走 Node 类型剥离（6 条），`tests/engine.vitest.test.ts` 走 Vitest（3 条）。

### Removed
- Vite 入口与产物：`index.html`、`src/main.tsx`、`src/App.tsx`、`src/components/GameBoard.tsx`、`vite.config.ts`、`preview/`、`dist/`、`scripts/build_standalone.py`、`src/vite-env.d.ts`。
- 三个无引用遗留：`src/style.css`、`src/store/useGameStore.ts`、`src/game/ApartmentScene.ts`（git 历史仍可恢复）。
- 依赖 `vite`、`@vitejs/plugin-react`、`@tailwindcss/vite`、`lucide-react`。

### Fixed
- `playwright.config.ts` 在 ESM（`"type": "module"`）下使用 `__dirname` 抛 `ReferenceError`，改用 `import.meta.dirname`，`pnpm e2e` 恢复。

### Added
- `AGENTS.md`：项目知识库（96 行，含规则/组件/测试契约）。
- `next.config.ts`、`postcss.config.mjs`、`eslint.config.mjs`（flat config + Next + react-hooks）。
- `.github/workflows/quality.yml`：`checks`（类型/lint/单测/构建）与 `e2e` 双 job。

### Verified
- 2026-10-21，Node v24.20.0 / pnpm 12.13.0 实测全绿：`check:stable-deps`、`typecheck`、`lint`（0 warning）、`test:rules` 6/6、`test` 3/3、`build`（Next 16.4.2 Turbopack，`/` 静态预渲染）、`e2e` 6/6（7.1s）。

## V0.1.2 — 2026-10-21 — 首次本地构建与修复

### Fixed
- 补 `src/vite-env.d.ts`，修复 `TS2882: Cannot find module './style.css'`。
- 重写 `tests/engine.vitest.test.ts`：原用例把“空楼可推进天数”当作期望，与引擎规则相反；现覆盖六房初始化、空楼拒绝推进、招募后推进不改原 state。
- 主界面维护费显示 `-0`，现为 `0`。

### Changed
- TypeScript 7.0.2 → 6.0.3：`typescript-eslint` 尚不支持 TS 7 编译器 API，降级后 `typecheck` 与 `lint` 可同时通过。
- Phaser 游戏画面改为 `React.lazy` 懒加载，初始 chunk 431 kB → 74 kB gzip，画面 chunk 359 kB gzip。
- `chunkSizeWarningLimit` 设为 1500，与懒加载后的体积目标一致。

### Added
- 房间选择器（六个按钮，含 `aria-pressed`/`aria-label`、终局禁用），键盘用户不再依赖 canvas 点击。
- canvas 容器补充 `role="img"` 与描述性 `aria-label`。
- E2E 扩充到 6 条：页面渲染、招募结算、五天胜利、五天失败、390×844 视口布局、纯键盘操作。

### Verified
- `check:stable-deps`、`typecheck`、`lint`、`test:rules`(6)、`test`(3)、`build`、`e2e`(6) 全部通过；Node v24.20.0 / pnpm 12.13.0。

## V0.1.1 — 2026-10-20 — Pagevela Stack Refresh

### Changed
- 固定 Node 24、pnpm 12.13.0、React 19.3.1、Vite 8.3.4、TypeScript 7.0.2 等版本；增加 `.node-version` 和稳定性检查。
- Phaser 3 → Phaser 4.2.1（ESM import 改造，运行兼容待验证）。
- Zustand 5 集中管理经营 UI 状态；导入 Tailwind CSS 4。
- 增加 Vitest、Playwright、ESLint 与 GitHub Actions 质量门禁模板。
- 保留 V0.1 可双击试玩的独立 HTML，并不误称为最新栈构建产物。

### Known limits
- 当前环境无法访问 npm，未生成 lockfile，未执行新版 `pnpm typecheck/build/e2e`；本机验证任务保持 BLOCKED。
- 完整正式工程只有通过质量门禁后才能用于外部发行。

## V0.1.0 — 2026-10-20

### Added
- 三层六间房、四种租客与招募价格。
- 租客移动、交换、相邻收益与相邻冲突。
- 每日结算、维护费、五种固定事件、经营日志、五天胜负判定和重开。
- React + Phaser + TypeScript 项目源码，以及免 npm 的浏览器试玩方案。
- 测试文件、项目计划书、管理任务 CSV、首轮迭代计划。

### Known limits
- 未加入存档、英文、美术素材、音效、账号、支付/广告、Electron。
- 规则测试可在 Node 中验证；正式工程因当前环境无法访问 npm registry，未在此处完成依赖安装与构建验证。
- Web UI 的真实设备和浏览器适配仍需持续测试。

### Next
- V0.1.1：本地安装 npm、修正实际打包或运行中发现的错误、增加适配测试。
- V0.2.0：教学关卡、英文、本地存档和数值表外置。
