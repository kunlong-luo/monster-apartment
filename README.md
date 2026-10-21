# Monster Apartment · V0.1.2 Pagevela 风格技术栈

**游戏玩法：** 六间房、四类租客、招募/移动/交换、邻接加成、五日经营与重开。首版为可行性原型，并非商业发行游戏。

**技术改造：** 参考 [Pagevela](https://github.com/kunlong-luo/pagevela) 的 React 19、Vite 8、TypeScript 6、Tailwind 4、Zustand 5、Node 24、pnpm 12 和测试/CI 体系；独立游戏渲染使用 Phaser 4.2.1。

## 1. 先试玩旧版（不需要安装）

`playable.html` 双击即可打开，是 **V0.1 的免依赖试玩版**。它不使用新版 Phaser 4/React，保留它是为了保证你可以直接体验之前交付的游戏规则。`preview/` 也是独立的免依赖预览。

## 2. 在 Pop!_OS 上安装新版

```bash
# 安装或切换至 Node 24 LTS（请用自己熟悉的 Node 版本管理器）
node -v                 # 应显示 v24.x
npm install -g pnpm@12.13.0
pnpm -v                 # 应显示 12.13.0
pnpm install            # 第一次成功后会生成 pnpm-lock.yaml
pnpm dev
```

打开终端显示的本地地址；默认 `http://127.0.0.1:5173/`。

## 3. 在提交代码或发版前执行

```bash
pnpm check:stable-deps
pnpm typecheck
pnpm lint
pnpm test:rules
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm e2e
```

项目的 CI 使用 `pnpm install --frozen-lockfile`。**必须先在本机运行 `pnpm install` 并提交真实的 `pnpm-lock.yaml`**，否则 CI 不能通过；此版本没有伪造锁文件。

## 4. 架构和管理文件

| 位置 | 功能 |
|---|---|
| `src/core/engine.js` | 纯游戏规则；两个试玩实现共享 |
| `src/store/useGameStore.ts` | Zustand 游戏状态、租客与回合命令 |
| `src/game/ApartmentScene.ts` | Phaser 4 的六房画面与点击交互 |
| `src/components/GameBoard.tsx` | React/Phaser 桥接 |
| `src/App.tsx` | React 经营管理界面 |
| `src/style.css` | Tailwind 入口及既有样式 |
| `docs/DEVELOPMENT_PLAN.md` | 产品计划及商业验证 |
| `docs/TECH_STACK_PAGEVELA.md` | 版本、迁移清单及风险 |
| `management/TASKS.csv` | 任务状态和验收标准 |
| `docs/CHANGELOG.md` | 版本记录 |

## 5. 验收状态

**已完成（2026-10-21，本机 Node v24.20.0 / pnpm 12.13.0 实测）**

| 检查 | 结果 |
|---|---|
| `pnpm install --frozen-lockfile` | 通过，`pnpm-lock.yaml` 已提交 |
| `pnpm check:stable-deps` | 通过 |
| `pnpm typecheck` | 通过（TypeScript 6.0.3 strict） |
| `pnpm lint` | 通过（0 warning） |
| `pnpm test:rules` | 6/6 通过 |
| `pnpm test` | 3/3 通过 |
| `pnpm build` | 通过 |
| `pnpm e2e` | 6/6 通过 |

E2E 覆盖：页面与 Phaser canvas 渲染；招募租客→扣费→结束一天；最优布局连续经营五天胜利；单租客空楼五天失败；390×844 视口无横向溢出；纯键盘完成选房与招募。胜利/失败结局与终局操作锁定均在真实浏览器中验证。

**已知技术限制**

- TypeScript 固定为 6.0.3：`typescript-eslint` 当前不支持 TypeScript 7 的编译器 API，降级后类型检查与 lint 同时可用。
- Phaser 与游戏画面为懒加载独立 chunk（约 359 kB gzip，初始 chunk 约 74 kB gzip）；进入画面时会短暂显示“正在加载公寓地图…”。
- 数值平衡：最优布局五天可达 232 金币 / 满意度 63（目标 135 / 55），空置房会亏损，难度可接受。

## 6. 下一阶段

V0.2 优先处理引导、英文、本地存档、数值调优和玩家测试。Electron/Steam 打包仅在核心玩法验证成功后再安排。
