# 《月光工坊》纯 React 原生化重构方案

彻底移除工坊场景对 `v2/index.html` 外部 HTML 字符串与非受控 DOM 注入的依赖，将侧边栏委托、生产报告、控制台及状态面板重构为现代化、强类型的 Next.js / React 原生组件，同时完整保留 PixiJS WebGL 舞台与既有存档兼容性。

## User Review & Critical Decisions

> [!IMPORTANT]
> 用户已在前期沟通中确认以下两大核心方向：
> 1. **优先级确认**：优先彻底完成工坊的纯 React 原生化，消除混合注入与独立运行时残留代码。
> 2. **渲染架构方案**：保留高性能 PixiJS 8 WebGL 画布作为工坊主视觉与瓦片点击层，将所有外部 HUD、侧边栏、委托面板、生产控制台重构为原生 React 组件。

- **Confirmed Decision 1**: 废弃 `app/workshop/page.tsx` 中 `readFileSync('v2/index.html')` 动态字符串切割与 `dangerouslySetInnerHTML` 渲染模式，改为声明式 Next.js React 页面结构。
- **Confirmed Decision 2**: 保持单一业务引擎 `v2/src/workshop-engine.ts` 与既有 localStorage 键（`monster-apartment:workshop-v2-lab`）完全一致，确保所有已有存档无缝读取。
- **Confirmed Decision 3**: PixiJS 舞台仅负责 15 格地块、机器光效、工人位图动画及魔女立绘渲染，所有按钮、数字、进度条、委托卡片由 React 状态树驱动。

---

## 1. Overview & Core Concept

- **What It Does**: 提供一套代码整洁、响应式完善、完全由 React 状态驱动的《月光工坊》主界面。彻底消灭旧版静态 HTML 切割代码，消除由于 DOM 查找与 Portal 嵌套带来的边缘状态不一致。
- **Target Audience**: 喜爱奇幻模拟经营、注重流畅操作与沉浸氛围的玩家。
- **Key Value**: 提升页面加载速度与组件生命周期安全性，消除潜在内存泄漏，使后续产线配方扩充与小镇剧情扩展能够直接在标准 React 组件树中迭代。

---

## 2. User Experience & Visual Design

### Key User Flows
1. **主舞台巡视与操作**：玩家点击 PixiJS 画布上的地块（15 格），React 选区组件立即响应并高亮当前工位信息、机器等级与升级报价。
2. **派工与建造**：点击底部 React 工匠卡（布鲁克、芬恩、辛德）或设备卡（水泵、温室、熔炉），直接为选定地块分配工人或建造新设备。
3. **委托推进与生产结算**：点击“开始一天生产”，触发确定性生产步进，侧边栏生产流水线与诊断建议即时更新；满足条件时呈现月纱特别委托卡片与采购选项。
4. **全端响应式适配**：大屏呈现经典三栏比例（世界画布 + 右侧委托面板 + 底部操作台）；390px 移动端竖屏自动切换为精简折叠布局，保证触控区域 $\ge 44\text{px}$ 且无滚动条溢出。

### Visual Identity & Theme
- **Color Palette & Mood (Midnight Cozy Gothic)**:
  - Neutral Canvas: `#100f20`（深邃午夜黑）、`#181629`（暗夜紫底）
  - Structural Panels: `#24223b`（微透毛玻璃）、`#50445f`（黄铜暗线）
  - Primary Accents: `#f0c588`（流光暖金）、`#b68c61`（古典黄铜）、`#ffe1a8`（月光浅金）
  - Semantics & State: `#66c4a6`（高产薄荷绿）、`#ffaaa7`（缺料警告粉红）
- **Typography & Hierarchy**:
  - 核心数值与天数采用 `tabular-nums font-mono`，避免数字跳动；
  - 标题使用宋体/衬线字族（Georgia / Noto Serif CJK SC），呈现炼金工坊羊皮纸质感。
- **Zero-Pill Discipline**:
  - 所有资源计数、天数、状态提示采用轻量文字与 `·` / `/` 分隔符，严禁多重药丸胶囊堆叠。

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: React 状态树与 PixiJS 通信机制**
  - *Chosen Approach*: 采用双向事件桥接（React 订阅 `window` 级别的 `moonwork:v2-update` 驱动视图重渲染；点击 React 控件通过标准自定义事件通知 Pixi 引擎更新舞台高亮与镜头反馈）。
  - *Why*: 彻底摆脱对底层 DOM ID 的直接强耦合（如 `$('day').textContent = ...`），使状态流向单一清晰，同时保证原有 WebGL 渲染性能不受损。
  - *Alternatives Considered*: 纯 Canvas 重绘全部 UI（文字排版与无障碍访问较差）或全盘使用 React DOM 替换 Canvas（丢失 60FPS 粒子与工作帧动画）。

- **Decision 2: 渐进式兼容与旧版解耦**
  - *Chosen Approach*: 在 Next.js 项目中建立独立的 `WorkshopGameView` 原生组件，`v2/` 目录仅保留共享规则引擎与独立静态演示；移除 `app/workshop/page.tsx` 对 `fs.readFileSync` 的服务端开销。
  - *Why*: 提升 Next.js App Router 静态预渲染与 SSR 效率，避免构建期读取文件引起的异常。

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    app/workshop/page.tsx                      │
│            (Next.js App Router Page - Pure React)             │
└───────────────────────────────┬───────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│   WorkshopNavbar & HUD (React)│       │  GothicDock & Navigation      │
│  (Day, Coins, Cores, World)   │       │   (Town, Orders, Warehouse)   │
└───────────────────────────────┘       └───────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     WorkshopStageViewport     │       │     WorkshopSidebar (React)   │
│ ┌───────────────────────────┐ │       │ ┌───────────────────────────┐ │
│ │  PixiJS 8 WebGL Canvas    │ │       │ │ Today's Contract Panel    │ │
│ │ (15 Plots, Lights, Anims) │ │       │ │ (Target, Meter, Deadline) │ │
│ └─────────────┬─────────────┘ │       │ ├───────────────────────────┤ │
│               ▼               │       │ │ Moonveil Patron Card      │ │
│ ┌───────────────────────────┐ │       │ │ (Dialogue, Accept, Import)│ │
│ │  Selection & Upgrade Bar  │ │       │ ├───────────────────────────┤ │
│ │  (Status, Level, Cost)    │ │       │ │ Last Shift Report Panel   │ │
│ └───────────────────────────┘ │       │ │ (Water, Fiber, Output)    │ │
└───────────────────────────────┘       │ └───────────────────────────┘ │
                                │       └───────────────────────────────┘
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────────────────────────────────────┐
│                 WorkshopConsole (React Controls)              │
│ ┌──────────────────────────┐ ┌──────────────────────────────┐ │
│ │ Worker Assignment Bar    │ │ Machine Building Catalog     │ │
│ │ (Brook, Fern, Cinder)    │ │ (Well, Garden, Kiln)         │ │
│ └──────────────────────────┘ └──────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Production Controls (Move Machine ↗, Start Shift ▶)       │ │
│ └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Data State Flow
1. **持久化层**: `localStorage['monster-apartment:workshop-v2-lab']` 作为唯一权威数据，包含 `tiles`, `coins`, `day`, `order`, `warehouse`, `patron`, `last`。
2. **纯逻辑引擎**: `v2/src/workshop-engine.ts` 提供无副作用的动作函数（`assignWorker`, `placeMachine`, `runShift`, `upgradeMachine`, `acceptPatronCommission`）。
3. **React 驱动**: `useWorkshopWorld` Hook 监听存档更新事件并分发至各子面板，实现毫秒级 UI 响应。

---

## 5. Implementation Steps (Plan)

1. **Step 1: 创建工坊原生 React 子组件**
   - 新建 `src/components/moonwork/workshop-contract-panel.tsx`：实现每日委托进度条、截止倒计时及月纱访客卡片。
   - 新建 `src/components/moonwork/workshop-shift-panel.tsx`：实现上轮班次水汽/孢子/晶核产出流水线与诊断状态。
   - 新建 `src/components/moonwork/workshop-stage-container.tsx`：轻量封装 PixiJS 画布挂载容器与底部选区升级条。
2. **Step 2: 重构 `WorkshopClient` 与页面入口**
   - 重构 `src/components/moonwork/workshop-client.tsx`，使用原生 React 组件排版替代 `dangerouslySetInnerHTML={{__html:markup}}`。
   - 简化 `app/workshop/page.tsx`，移除 `readFileSync`，转为干净的 React 页面导出。
3. **Step 3: 优化双向事件桥接与测试验证**
   - 保持所有按钮的 `data-testid`（如 `v2-shift`, `v2-move`, `v2-upgrade`, `v2-worker-*`, `v2-build-*`）不变。
   - 运行单元测试（`npm test`）与 Playwright 端到端测试（`npm run e2e`），确保全绿通过。
