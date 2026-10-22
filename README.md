# Monster Apartment · V0.3.0 Midnight Cozy

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
pnpm e2e                # Playwright，共12条（CI 使用系统 Chrome；本机需安装浏览器）
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
| `tests/` | Node 规则测试 6 项 + Vitest 6 项（含存档与国际化校验） |
| `e2e/` | Playwright：六项基础流程、三项搬家回归、三项 V0.2.2 存档/英文/教学流程，共14项（含 V0.3 桌面与移动端视觉检查） |
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
- 已加入浏览器本地存档与英文界面；仍无音效、云端账号同步与 Electron 打包。

## 7. V0.2.1 修复与 Web 部署准备

- 恢复“移动 / 交换租客”按钮，并在未选中已入住的房间、游戏结束或已进入搬家模式时禁用；取消搬家仍可使用。
- 新增 `e2e/move-swap.spec.ts`，覆盖空房搬入、两间已入住房间交换、取消操作与终局禁用。
- 删除无效的 `BonusList` 重复组件，组合详情仍由 `ManagementPanel` 显示。
- GitHub Pages 使用可选静态导出构建（`NEXT_STATIC_EXPORT=1 pnpm build`）；常规开发模式无需修改。部署说明见 [DEPLOYMENT_NEXTJS.md](./docs/DEPLOYMENT_NEXTJS.md)。
- **验证：PR #1 已通过常规构建、9/9 Playwright 测试和静态导出 CI；正式 Pages 链接仍须合并并配置 Pages 后人工验收。**

## 8. V0.2.2 新功能

- 四步非阻断式新手引导，支持自动推进、跳过与重新查看。
- 本地自动存档：招募、搬家、经营结算后自动保存，页面刷新恢复进度。
- 顶部选择中文或 English；租客、管理面板、Phaser 房间画面、事件和日志可切换语言。
- 存档只属于当前浏览器和站点；清理浏览器存储或禁用 localStorage 会使进度无法恢复。
- PR #2 已合并到 `main`，合并后的 CI 全部通过；本功能现属于项目主分支。

## 9. 后续计划

V0.3 完成视觉体验改版后，以真实玩家试玩、数值调优、移动端可读性反馈为下一轮重点。

## V0.3.0 Midnight Cozy 视觉重构（PR #3）

- 主舞台：Phaser Graphics 绘制月亮、屋顶、家具、暖光、六间房以及史莱姆/火精灵/幽灵/石像鬼角色图形；不依赖外部美术资源。
- 全局 UI：深夜紫/暖金/奶油白设计系统、游戏 HUD、招募卡片、经营明细和夜间日志。
- 响应式：桌面三栏（招募/公寓/经营）；平板主舞台置顶 + 两辅助栏；手机主舞台优先显示，其他操作仍可滚动到达。
- 可访问性：保留六个可键盘操作的房间按钮、按钮标签与 aria-pressed；纯视觉变化不修改租客价格、租金、相邻组合与五天事件。
- GitHub Actions 附加 `v030-ui-review` 截图 ZIP，其中有 1440×900 桌面和 390×844 手机的完整页面截图。
- **版本状态：** V0.2.2 PR #2 已合并，V0.3.0 PR #3 已改为面向 `main`；最终合并后，GitHub Pages 将通过主分支 CI 自动尝试发布。
- 视觉改动应额外进行人眼截图审查：角色辨识、室内层次、金币与主按钮对比度、手机上的房间触控可达性。CI 的截图生成不是艺术质量评分。

## V0.4.0 第一轮：单屏游戏布局（PR #4，尚未发布）

- 桌面 ≥ 1200px：页面整体固定在一屏内；公寓画布占用剩余空间，左右栏分别内部滚动，不再强迫玩家滚动整页才能结束一天。
- 手机／平板 < 1200px：游戏主舞台固定可见，底部四标签导航「招募／房间／经营／手记」切换操作，当前游戏进度、语言、本地存档不受影响。
- 教程变成紧凑提示条，帮助说明是舞台上方可滚动的浮层；手机顶部将帮助、重开与重看教学收进「更多」菜单，经营结算按钮放到切换后的面板顶部。
- 移动端操作顺序：招募租客 → 房间调整 → 经营结算 → 夜间手记，仍可点击 Phaser 场景选择房间。
- 新的 `e2e/compact-shell.spec.ts` 验证 1440×900 与 390×844 不发生整页滚动，并走通手机全部标签的招募/结算流程。
- **范围说明：** 本 PR 只完成 V0.4 一屏化交互，尚未加入房间属性、住户偏好、每日经营选择与新增动画。上述玩法改动将另开 PR 单独测试，确保 V0.3 存档不被破坏。

## V0.4.0 第二阶段：住户偏好与每日经营策略（PR #5）

- 六间房拥有**固定特质**：1/5 潮湿（适合史莱姆），2 向阳（火精灵），3/6 安静（幽灵），4 石墙（石像鬼）。相符每天 **+3 金币、+2 满意度**；不符每天 **-1 金币、-1 满意度**。移动和交换房间会改变下一晚结果。
- 每天可选择一次经营策略：**稳健（0/0）**、**办派对（-5 金币、+8 满意度）**、**省开支（+6 金币、-6 满意度）**。策略在夜间结算时生效，结算后回到稳健，事件仍依五天固定顺序发生。
- 经营面板新增偏好与策略收益；房间列表显示契合信息，公寓画面显示永久房间特征。支持完整中英文翻译及夜间日志明细。
- 继续沿用 `monster-apartment:save:v1` 存档键。旧版 V1 存档中没有策略字段的记录会自动补齐 `steady`，不会重置玩家进度。新存档对策略与记录字段进行严格校验。
- 目标仍为五天金币至少 135 和满意度至少 55；新增规则可能改变达成难度，正式发布前需由真人试玩并做数值平衡。
- 功能仍在独立 PR 分支；此阶段不修改桌面单屏或手机 Tab 的整体布局，不自动合并至 main。
