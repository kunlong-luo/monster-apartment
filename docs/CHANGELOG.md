# 版本更新记录

## V0.9.7 Stage 8 — 2026-10-24 — 首期结算之后继续生活

### Long-term simulation
- 第一阶段八天结束不再自动转换至不可操作的 complete 状态；每八天触发一次阶段纪念奖励，成功 +18 星币、未达标 +6 星币，然后继续日租与串门。
- 第九天起住户每三天轮换休息、灵感、陪伴三类个性化心愿。房型/家具/实际形成的邻居羁绊可以满足心愿（+6 幸福度），未满足为 -4；八天内既有目标和数值不被改变。
- 羁绊成长最多三级；历史事件去重集合保留最近 100 项，防止持续经营使旧存档失效。
- 保留版本 1 和存档键。对旧的 phase=complete 存档读取时仅恢复为 playing，不丢失币、住户、家具或关系；游戏时间与货币校验允许长期增长但仍要求安全整数。

### Presentation and verification
- 日期不再卡在第八天；进度条跟随每个八天周期。住户既有姓名牌显示当前心愿是否满足，选中房间会显示具体增减。
- 保持单屏布局和现有交互，无新按钮。Vitest 增加第一期之后的模拟、旧存档恢复、心愿轮换和百日边界测试；Playwright 负责真实浏览器、自动存档及手机视口。

## V0.9.6 Stage 7 — 2026-10-24 — 居民日常生产与真实邻里收益

### Simulation
- 工坊 +3 星币/天（萤灯 +2），花房 +1 星币/天（盆栽 +2），仅对已入住房间生效；与租金合并到每天清晨的一次实际结算。
- 相邻房间的花房或浴室为住户提供 +1 幸福度；有盆栽的花房、有书的浴室改为 +4。这一结果进入原本幸福度及租金计算。
- 已有串门系统形成的 `bonds` 现在影响当事住户幸福度（每等级 +2，最多 +6），两天以上的相邻羁绊带来 +2 星币/天赠礼。离开邻居位置则暂停收益；回到原来的近邻位置可以恢复。
- 搬迁预览采用完整日进账的差值；新旧存档键和结构不变，既有关系会自然进入新机制。

### UX and tests
- 不添加按钮；日进账总额和手记分项展示具体来源，选中住户可查看邻里与羁绊贡献。
- 增加 Vitest 对空房不产出、每日结算、装修配合、羁绊养成与重搬影响的验证；Playwright 覆盖桌面场景行为与自动保存。
- 依赖及技术栈保持 V0.9.5 固定版本。

## V0.9.5 Stage 6 — 2026-10-24 — 与模拟时钟绑定的居民行走和工作动作

### Resident direction
- 新增确定性居民导演模型，基于身份、房型、时钟与真实访客状态生成四帧动作、站位及朝向；不写入存档。
- 角色 SVG 改为足部、手臂、头部四帧姿态；按照房型呈现浇水壶、浴巾、手槌或羽毛刷等道具，访客携带小杯点心。
- 房间内坐标随模拟时刻平滑变化，并保留家具前景、三层公共楼梯、建筑和点击交互。
- 减少动态效果立即关闭位移过渡；新增 Vitest 与 Playwright 回归。

### Compatibility
- 经济规则、房间系统、旧存档 `monster-apartment:cozy:v1` 和已固定的依赖不变。
- 本次仍是 SVG 四帧动作及 Phaser 灯光的混合架构，未替代为商业级骨骼动画资源。

## V0.9.4 Stage 5 — 2026-10-24 — 旧屋透视场景与生活材质

### Art
- 原先重复的空房灰色网格和“＋” CTA 被六种有差异的待修缮切面替代；窗户木板、墙体磨损、实物家具遗留物与地板木纹用原创 SVG 绘制。
- 四种正式房型增加同透视体系的手绘质感细节：床品缝线、浴室瓷砖及管道、工坊桌面工具、花房藤蔓与吊篮。
- 扩大房间中住户的可读尺寸，调整旧屋操作文字至房间底部，保留已有动作和遮挡。
- 新增 E2E：五间待修缮场景、建造后替换为房型材质、重载存档及 390px 手机可视性和不溢出。

### Compatibility
- 保留 `monster-apartment:cozy:v1` 存档与全部经营数值，不新增按钮或依赖。
- Phaser 氛围层不变；仍使用 SVG+Phaser 的混合舞台。

## V0.9.3 Stage 4 — 2026-10-24 — 贯通三层的楼梯井与真实串门路径

### Added
- 将六个房间改为围绕实体中庭楼梯布局；三段楼梯、平台、窗户和门洞共享一套建筑透视。
- 初始只有有住户的楼层发亮，入住新楼层后楼梯窗光自动点亮。
- 串门沿楼梯井呈现实际路径，Phaser 光迹跟随模拟访问目标；不产生额外操作界面或经营数值。
- 添加手机单屏、公共空间布局和串门路径 E2E 回归。

### Compatibility
- 房间索引、租金、幸福度、邻居关系、装修规则、存档键及格式不变。
- 未引入新依赖；所有改动直接提交 main。

## V0.9.2 Stage 3 — 2026-10-24 — 真实经营操作的房间内演出与天气光照

### Visual direction
- 成功建造房间、欢迎住户以及布置家具均触发独立的室内环境演出。无效操作不播放，重开不继承旧演出。
- 连续的黎明/白天/黄昏/夜晚光照调度；第 3 和第 6 天的细雨属于固定视觉天气，不改变游戏规则或存档。
- 环境动画跟随暂停；交互时的短暂反馈仍可播放。减少动态效果优先关闭新增动效。
- 追加纯函数与 Playwright 验证，保证存档兼容及页面不新增交互按钮。

### Compatibility
- 版本由 0.9.1 更新为 0.9.2；Next.js、React、Phaser 和现有依赖版本不变。
- 美术升级仍采用 Phaser + React/SVG 的混合舞台，未迁移全部场景为 Phaser。

## V0.9.1 Stage 2 — 2026-10-24 — 居民动作、家具遮挡与 Phaser 氛围

### Art & runtime
- 五种可入住灵核共享更具表现力的角色骨架：四肢、表情、睡眠、工作和行走状态分层绘制；移除房内漂浮状态徽记。
- 家具前景与角色共享房间坐标系；浴缸、床沿、工坊工作台与花房种植床正确遮挡角色。
- 首页增加 Phaser 4 透明 Canvas 照明层，粒子、灯光随房间建造与住户行为实时变化，移动端跟随真实容器尺寸。
- 继续保留 React 可访问点击目标、经济数值、存档格式与建造/迁居/装修闭环；无新增依赖。
- 增加桌面/手机真实浏览器检查，覆盖角色叠层与动效层非交互、系统减少动画偏好。

### Limitations
- Phaser 负责新增的动态光影与微粒层；建筑、家具、灵核仍以原有 SVG 为基础，并非全场景 Phaser 替换。

## V0.9.0 Stage 1 — 2026-10-24 — 月光街游戏场景质感升级

### Scene
- 首页加入确定性 SVG 月光街：前中远三层建筑、月亮、街灯、城市窗光和街道植被，不引入外部素材依赖。
- 三层楼板、立柱、屋顶和房间墙面增加厚度、投影与纹理，房间窗光与陈设共享透视空间。
- 四类室内增加适量生动细节；角色根据睡眠、工作与散步状态产生差异化动作。
- 低动态效果偏好关闭新增街景与房内动画；新增端到端测试覆盖对应结构。

### Compatibility
- 新首页仍为 React + SVG，并非完整 Phaser 迁移；这只是美术品质升级的第一阶段。
- 不调整金币、幸福度、住房规则、存档版本和既有房间操作。
- 自动测试与 Pages 发布结果以对应 GitHub Actions 工作流为准。

## V0.4.0 Stage 4 — 2026-10-22 — 怪物动态、入住反馈与五天平衡保护

### Added
- Phaser 4 绘制的怪物由独立 Graphics 轻微上下浮动；史莱姆、火精灵、幽灵、石像鬼具有不同幅度和节奏，房间家具与阴影保持静止。
- 新租客到达和房间搬家/交换产生短暂标记；单纯选房、切换语言及初次读取存档不重播搬家反馈。
- 操作通知加入轻量显现效果，偏好减少动态效果时关闭所有新增动画，不影响功能与对比度。
- Vitest 新增角色状态变化的纯函数测试及五天经营三套路线回归：高收益但满意度低会输、主动关怀可逆转、逐利更赚钱但满意度更低；四名契合租客仍可正常赢得五天游戏。
- Playwright 检验招募/搬家反馈、单个 Phaser 画布、单屏布局及减少动画模式。

### Compatibility
- 本轮不修改金币与满意度的底层计算、终局门槛、存档格式或外部依赖。
- 所有改动直接提交 main；以最后的 Quality 和 GitHub Pages 结果为发布依据。


## V0.4.0 Stage 3 — 2026-10-22 — 每晚事件选项与收租反馈（直接提交 main）

### Added
- 五个剧情各自对应的三种应对方式：顺其自然、金币换满意度、满意度换金币。
- “主动照顾”有租客能力协助奖励；策略收益和事件收益分开计算，在预估经营面板与中英文手记中明确展示。
- 前台结算状态的轻量过渡动画，尊重 reduced-motion；独立角色画布与整页单屏布局不变。
- V1 localStorage 兼容迁移；Vitest 单测和 Playwright 中文/英文、桌面/手机回归。

### Balance
- 未改变原有五夜固定事件、房间偏好、组合收益或 135 金币/55 满意度的终局门槛。
- 不选择新事件抉择时，既有经济计算和日结算保持一致。
- 新增加的选择有明确可预览的取舍，不引入额外随机抽取或云端服务。


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
