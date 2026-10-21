# Monster Apartment — Pagevela 技术栈对齐方案

基线日期：2026-10-20；迁移版本：V0.1.1；技术参照：<https://github.com/kunlong-luo/pagevela> 的 `package.json`、`.node-version`、`vite.config.ts`、`tsconfig.json`、`.github/workflows/ci.yml`。

## 技术版本及决策

| 层面 | 最终采用 | 为什么 | 原型状况 |
|---|---|---|---|
| Node | 24 LTS | 与 Pagevela 保持一致 | v24.20.0 实测通过 |
| 包管理 | pnpm 12.13.0 | 统一依赖安装和 lockfile | 已安装并提交 lockfile |
| UI | React 19.3.1 | 复用 React 技能 | 构建与浏览器实测通过 |
| TS | TypeScript **6.0.3** | typescript-eslint 不支持 TS 7 编译器 API，降级以同时保留类型检查与 lint | typecheck/lint 通过 |
| 打包 | Vite 8.3.4 + plugin-react 6.1.2 | 与 Pagevela 体系一致 | 构建通过；Phaser 懒加载分包 |
| 样式 | Tailwind 4.3.3 + @tailwindcss/vite | 管理界面和后期组件化 | 保留旧 CSS 并导入 Tailwind |
| 状态 | Zustand 5.0.15 | 管理金币、回合、操作状态 | 已接入并被 E2E 覆盖 |
| 游戏 | Phaser 4.2.1 | 独立游戏引擎；Pagevela 没有此层 | 六房渲染与点击实测正常 |
| 规则 | 原生 JS + `.d.ts` 类型声明 | 离线预览与 React 工程共享业务规则 | 原有 Node 测试 6/6 通过 |
| 存档 | 后续 Dexie/IndexedDB | 当前首版无存档，暂时不引入 | V0.2 评估 |
| PWA | 后续选择性采用 | 游戏需要检查资源大小与移动端缓存 | V0.2 评估 |
| 桌面 | Electron（以后） | Web 成功后再封装桌面 | 本阶段不引入 |
| 测试 | Vitest 5.0.4 + Playwright 1.64.1 | 与 Pagevela 的测试方式一致 | 3 个单测 + 6 个 E2E 全部通过 |
| Lint | ESLint 10.12.0 + typescript-eslint | 一致的代码质量检查 | 0 warning 通过 |

**不照搬的 Pagevela 依赖：** `pdfjs-dist`、`jspdf`、`html2canvas-pro`、`react-markdown`、`libphonenumber-js`、`react-to-print`、`fflate` 等属于简历编辑器领域；游戏 V0.1 没有使用场景，不应增加打包体积。

## 功能模块职责

```text
src/
  core/                  # 纯规则 / 数据，不依赖浏览器或渲染引擎
  store/useGameStore.ts  # Zustand：招募、房间选择、换房、结算、重开
  game/ApartmentScene.ts # Phaser：六间房、交互、动画/渲染
  components/GameBoard.tsx # React 与 Phaser 事件桥接
  App.tsx                # React 管理界面
  style.css              # Tailwind 引入 + 项目既有 CSS
```

**约束：** Phaser 每帧变化不进入 React/Zustand；只同步玩家命令、经营数值和关键 UI 状态。游戏规则应保持可在 Node 下独立测试。

## 迁移验收门禁

1. ✅ Node 24 + pnpm 12.13.0 已安装，`pnpm install` 成功，`pnpm-lock.yaml` 已提交。
2. ✅ `pnpm typecheck`、`pnpm lint`、`pnpm test:rules`、`pnpm test`、`pnpm build` 全部通过。
3. ✅ Phaser 4 渲染正常：六房点击、选择、招募、相邻收益、每日结算、五天终局（E2E 覆盖胜负两种结局）。
4. ✅ Playwright Chromium E2E 6/6 通过（含 390×844 视口与纯键盘操作）；Firefox/Safari 与真机触屏尚未验证。
5. ✅ 浏览器控制台无 pageerror；页面加载稳定。
6. ⚠️ 体积：初始 chunk 74 kB gzip、画面 chunk 359 kB gzip；未压缩传输前需按发行平台预算复核。
7. ✅ 技术版本结论：Node 24 / Phaser 4 兼容；TS 7 不可用（typescript-eslint），回退至 TS 6.0.3 并记录原因。

## 已知迁移风险

- **Phaser 4 ESM**：`import Phaser from 'phaser'` 改为 `import * as Phaser from 'phaser'`；标准 Text、Rectangle、Scene API 大多兼容，但渲染行为仍要实测。
- **TypeScript 7**：和旧 TS 5.9 的编译/配置行为可能不完全一致；必须在 Node 24 的真机执行 `typecheck`。
- **Vite 8**：插件及 Node 兼容要求发生变化；默认仅支持 Node 24 环境进行验收。
- **Zustand**：新版集中状态管理可能改变点击行为，务必测试招募失败、搬家及终局重开。
- **TypeScript 7 不可用（已处置）**：`typescript-eslint` 使用 TS 编译器 API，尚不支持 TS 7；降级至 6.0.3，待上游支持后再评估升级。
- **锁文件已提交**：`pnpm-lock.yaml` 随仓库提供，CI 使用 `--frozen-lockfile`。

## 关于版本管理

- V0.1.0：免安装试玩+原规则。
- V0.1.1：技术栈与质量工具迁移，玩法未改变。
- V0.1.2：首次本地构建通过，修复 CSS 类型、单测与 `-0` 显示；TS 降至 6.0.3；Phaser 懒加载。
- V0.2.0：英文、本地存档、新手引导与玩法迭代。

引用官方资料：Pagevela repo / npm packages React, Vite, TypeScript, Tailwind, Zustand, Phaser；对应版本查询日期为 2026-10-20。
