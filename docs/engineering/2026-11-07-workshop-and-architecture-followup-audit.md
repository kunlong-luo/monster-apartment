# 《怪物公寓》2026-11-07 延续审查：场景架构、移动体验与可控重构

审查基线：`a15fb83cd7ce1f69d8067e2a294905903035a05b`（截至审查时 main），质量、桌面视觉、GitHub Pages 同一 SHA 已通过。
- Quality：https://github.com/kunlong-luo/monster-apartment/actions/runs/42364343170
- Desktop Visual Review：https://github.com/kunlong-luo/monster-apartment/actions/runs/42364343110
- Pages：https://github.com/kunlong-luo/monster-apartment/actions/runs/42364403291
- 实机截图来源：Desktop Visual Review artifact 13570757631，尤其是 `visual-evidence/workshop/{desktop-workshop-scene-1440,desktop-machine-art-review-1440,desktop-workshop-build-grid-1440,mobile-machine-art-review-390}.png`。
- 方法：读取 repo 当前源代码、质量配置、资产 manifest，并目视核对上述真实浏览器截图。**没有运行全量设备性能剖析或多标签竞态复现**，因此以下每条标注“实证”或“待验证”。

## 全局判定

不建议推倒 Next.js 16/React 19/TS/Tailwind v4/PixiJS 8 的稳定基础、七条正式路由、现有经济规则和存档；值得重构的是**工坊可视化所有权、布局 CSS 的职责、移动舞台呈现和跨标签事务边界**。避免在已有 1473 行工坊 CSS 之上继续累积覆盖修补。

## P1 · 下轮必须优先解决

### R01｜PC 全景仍是“后台信息框包围舞台”（实证：PC 截图）
- 1440×900 的实机截图：上部主舞台以外，底部三栏设备、工匠、生产日志加双条操作按钮约占四分之一个视口；左右卡片盖在大场景两侧。虽然机器体积增加，仍未达到所选哥特场景草图的主体占画面七成的视觉目标。
- 根源：`workshop-cinematic.css` 在 `.middle` 内全屏绘景，却没有把“Operate 调度界面”从“Experience 观赏场景”分层；`workshop-controls.tsx`、`workshop-contract-panel.tsx`、`workshop-shift-panel.tsx` 全常驻。
- 方案：PC 默认只保留角落 HUD、三设备互动和极小状态；选择机器后打开 **统一设备情境抽屉**（设备/产线/工匠/操作），详细日志和委托按需展开。删除重复的“全景→标签→卡片→网格”中间态，保留可一键进入 15 格建造模式。
- 验收：1440×900、1648×928、1280×800 中心绘景主体完整，操作入口不重复，任一设备 2 次操作内到达升级/移动/派工；低于/等于 390px 无遮挡。人工与参考图并排核对。

### R02｜390×844 手机 15 格棋盘极小、有效面积严重浪费（实证：移动截图）
- 当前 `v2/src/workshop-lab-stage.ts` 对移动选择 `W=830,H=820,CELL=146`；`resize()` 用 `min(stageWidth/W,stageHeight/H)` 同比缩小全部格子。手机截图网格集中于舞台中部很窄一块，余下大面积空地，图标和地块号难辨识。底栏业务交互反而相互堆叠。
- 方案：保留 15 格的模型，但移动舞台用可平移缩放/分区巡视的镜头方案，优先按 **可读可点的地块尺寸**选缩放，不再以整张固定高画布挤入小区域；考虑聚焦选中设备、跟随工匠，或 3 工位纵向列表触发精确建造蒙层。折叠非当前任务面板。
- 验收：390×844、360×800、横竖屏实际截图；地块可见目标与命中不小于 44px、无整页横向滚动、主要操作无需从 150px 小棋盘找机器。

### R03｜双场景隐形 Pixi 仍运转（实证：代码逻辑，未实测 GPU 数字）
- `workshop-stage-container.tsx` 在场景优先时仍保留 `#stage`；`workshop-cinematic.css` 仅把 canvas 设为 `opacity:0;pointer-events:none`；`v2/src/workshop-lab-stage.ts:updateMotion()` 在 document 可见时仍 `app.ticker.start()`，对不可见的 15 格底盘重复 Pixi 更新和 WebGL 工作。
- 方案：新增显式 `setPresentationMode('cinematic'|'grid')` 或 `setVisible` 的类型安全控制器；全景时停止/挂起 Pixi ticker 与离屏粒子，回棋盘继续同步世界状态；更进阶可延迟加载精密棋盘 Pixi 模块，优先显示 React 全景，避免首次入场等待无关贴图和字体。
- 验收：在全景模式验证 `ticker.started=false` 或离屏 draw call=0，切回原棋盘保持之前选择、库存、工匠状态且无需重启场景；测试 1440×900 首次加载和 CPU/内存差值。

### R04｜全景只映射每类**最高等级一台**（实证：代码）
- `workshop-cinematic-stage.tsx` 以 `candidates.reduce` 仅选择一台最高等级同类机器，按钮只能选它。若 15 格内存在多台同工种，玩家从“生产全景”无法定位其他台；“共 N 台”标签只提示数目，没有浏览/选中入口。
- 方案：共享一个 `WorkshopStationPresenter`，返回每类汇总、全部设备及当前选中索引；全景按钮打开同类列表或按最近操作台高亮，避免新增第二套经济状态。数据分布、生产状态与建造棋盘一致。
- 验收：至少每种同工种两台、等级混合、部分缺料与不同工匠的真实存档；从全景选中任何一台，并定位正确的选区，操作后刷新不跳错。

### R05｜同键存档的多写入路径缺少统一并发事务边界（待验证高风险）
- `workshop-auto-runtime.tsx` 使用 Web Locks + 读取原始字符串比对保护自动结算；但 `v2/src/main.ts:apply()` 与 `src/lib/moonwork/world-store.ts:commitWorldAction()` 直接写 localStorage，没有使用统一 Web Lock。另有恢复与其他交互写入同键。
- 风险不是已证实丢档；理论上两个标签在同一刻执行市场交易、机器移动与自动出货，未统一串行可能产生 lost update。此前 A07 文档也明确“多标签所有手动写入的严格事务协调”未完成。
- 方案：统一 `commitWorkshopTransaction(action, source)`，在同一锁中**读取最新状态 → domain reducer → 验证版本 → 持久化 → 统一发布**；旧存档键/结构保持；IndexedDB 备份与失败恢复照旧。不要误以为仅锁住自动线程就锁住其它写者。
- 验收：双标签同步竞争、手动建造/升级/市集购买与自动结算交错、QuotaExceededError、旧版本回滚；资源总数守恒，无重复奖励与掉单。先写测试后重构。

## P2 · 紧接 P1 的中期重构

### R06｜多份 CSS 拥有同一页面的布局（实证：源码量与重复覆盖）
- 工坊基础 `src/components/game/gothic-workshop.css` 1473 行、226 行超长 `#root.lab.gothic-workshop` 选择器；全景另有 `workshop-cinematic.css` 258 行；`gothic-desktop-ui.css` 441 行含 118 个 `!important`；`gothic-red-gold.css` 274 行含 99 个 `!important`；抽卡 `summon-screen.css` 也含 124 个 `!important`。
- 设计文档已要求一套材质 token，但新全景 CSS 本身仍含大量颜色常量，所谓“单一色板”实际未贯穿业务 CSS。
- 方案：分离工坊 shell/全景/精密棋盘/设备抽屉/审核面板的**独立样式所有权**，抽出布局尺寸与材质 token。分步骤删掉重复覆盖并保存截图基线，禁止整包“删旧代码”导致视觉退化。
- 验收：样式改动无非必要 `!important` 新增；同一个 PC 位置由唯一 CSS 模块控制；1280、1440、1648、390 回归无布局漂移。

### R07｜Pixi 主文件处理过多职责且全局重建场景（实证：源码）
- `v2/src/workshop-lab-stage.ts` 673 行同时负责资源加载、背景、机体绘制、状态提示、工匠动画、粒子、触摸与舞台生命周期；世界快照对象改变时 `stage.removeChildren().forEach(destroy)` 重建节点。已对“只改选区”设捷径，这是正确方向，但对生产周期变化可能仍有不必要的资源开销。
- 方案：保持一个 `WorkshopLabAdapter` 控制器，拆开静态场景/地块命中/设备 Sprite/工匠 Sprite/特效/状态同步；按格子 diff 更新，固定 Texture 缓存与显示对象，不重新创建全部绘景。不要改变 `runShift`、`projectMachineProduction` 和 15 格经济模型。
- 验收：真实自动生产 10 次更新下 Pixi 精灵和显存占用不持续增加；设备/工匠姿态更新正确；选择、移动、升级无需重挂整场景。

### R08｜当前美术资产仍以“候选/占位”主导（实证：manifest）
- 工坊 manifest：9 张静态机体 `review`、3 台 Lv.2 工作帧 `pending`、NPC 美术/动画 5 项 `pending`，`releaseReady=false`。四个私人房间均为 `concept`；五张人物卡面 CG 均标记 `portrait` 而非最终全身。
- 方案：人物/工坊/房间按同一“美术验收合同”逐项进入 `ready`；优先 1 个核心人物完整身体姿态、3 个机械最终透视和工作循环，再推进其它皮肤/场景。重点解决浮空机体、光源与地面投影，不以新的色彩 CSS 冒充原画。
- 验收：真实图片自然尺寸、构图与参考目标、透视一致、逐帧贴图锚点、背景透明边缘、移动首帧全部检查；每次晋级保留来源/哈希/许可证。

### R09｜测试绿灯不等于视觉和性能验收（实证：工作流）
- Quality 验证类型、单测、构建、图片/素材索引；Desktop Visual Review 检查特定导航和页面 smoke。现有 `check-game-design.mjs` 仅对 TSX 禁用图标、关键 token 存在及共享 HUD 的硬编码颜色做局部检查，**不会审计业务 CSS 中是否有一百处硬编码颜色/同一布局重复 owner**。
- 方案：保持快速 CI，不把完整 E2E 放回每次提交；在重大视觉里程碑增加**截图对照＋关键交互尺寸/可点击性＋基本图像解码＋性能采样**的独立验收。移动网格可读性应成为显式断言，而不只检查 WebGL canvas `visible`。
- 验收：必须能展示 1440×900、1280×800、390×844 的 before/after，验证操作区不遮挡，约束资源首次加载与实际图片解码。

### R10｜三套安装方式与过时文档仍未收敛（实证：工程配置）
- 根 `packageManager: pnpm@12.13.0` 却用 `bun.lock`、CI `bun install`，而 `v2/` 使用 `npm install`+`package-lock.json`；当前仍可复现通过，但开发和排错有三种解析/锁文件语义。
- `docs/CURRENT_ARCHITECTURE.md` 仍写“无 Zustand”“七份 CSS”，实际仓库 `src/lib/moonwork/world-state.ts` 使用 Zustand、游戏 CSS 超过十份。版本标记 V3.77、V3.90 等历史词汇也与当下已实施内容混在一起。
- 方案：本阶段先更新唯一真实架构图和当下模块负责人；再评估 workspace 一体化安装是否真的收益大于迁移风险。不要为统一包管理器单独破坏可复现 Pages。
- 验收：新开发者从空目录按一份 README 可以安装/构建/审查；依赖锁定可复现，工程文档与正式运行路径一致。

## 推荐执行顺序（每轮只改一条职责）

1. **R03 + R04**：先建立共享设备 presenter 与 Pixi 显隐控制器；不碰美术贴图，验证同工种多机选择和 GPU 静止。
2. **R01 + R02**：根据当前截图分别做 PC 场景模式与手机场景版式；小型动作抽屉复用共享 presenter，不增加额外菜单。
3. **R05**：设计统一读写事务，先做多标签/异常写入测试，再替换三套直接写入路径，保留存档结构。
4. **R06 + R07**：按模块边界逐步移除重复 CSS 和 Pixi 大函数，变化对应真实截图与性能数据。
5. **R08 + R09 + R10**：通过美术审核实现真正品质提升，完善轻量验收，修复文档与安装流程漂移。

## 特别声明

这是一份**分析性审查登记**，不是代码重构已完成、性能故障已复现或最终 CG 已批准。保持 7 条正式路由、不使用 Sparkles/WandSparkles、不改经济和抽卡概率、不删已有存档/备份。当前项目已有可通过的 Quality/Pages 基线，禁止无必要地推倒重来。
