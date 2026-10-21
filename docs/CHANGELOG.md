# 版本更新记录

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
