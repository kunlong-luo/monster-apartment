# 怪物公寓当前工程约束

## 唯一正式路由
`/`、`/apartment/`、`/workshop/`、`/town/`、`/orders/`、`/characters/`、`/warehouse/`。

禁止重建 `/classic`、`/legacy`、`/survival`、`/workshop-lab` 和独立 V2 HTML 游戏。

## 技术分工
- Next.js 16、React 19、TypeScript（strict）及 Tailwind CSS v4 负责 UI。
- Motion for React 管临时交互动效；PixiJS 8 管 2D 场景和环境粒子。
- `src/core/cozy-engine.ts` 管公寓；`v2/src/workshop-engine.ts` 管工坊/市集/委托。
- `v2/src/runtime.ts`、`v2/src/workshop-lab-stage.ts` 是当前工坊 Pixi 资源，不是旧页面。
- 公寓存档键及工坊存档键不得擅自清除或更换。
- 保持满屏绘景与小型 HUD；不增加重复菜单、无意义按钮或整页长滚动后台。
- 只为七个当前路由维护 Vitest 与 Playwright 测试。
- 只有质量检查与 Pages 部署均成功后才声称已上线。


## 默认研发原则：成熟依赖优先、快速迭代（长期有效）
- **优先复用成熟方案，不重复造轮子**：每次设计新功能，先确认现有 Next.js / React / Tailwind / Motion / PixiJS / Zustand / Dexie / Lucide 是否已有可靠实现；若没有，再选择维护活跃、社区广泛验证的稳定库或官方插件。不要为了少量简单逻辑随意增加依赖。
- **可以直接采用符合条件的稳定库**：重点核对维护情况、许可证、安全公告、TypeScript 支持、包体积、移动端性能、Next.js 静态导出及 GitHub Pages 子路径兼容性；锁定可复现版本并记录选择理由。不追逐尚不稳定的新版本，不为换库而破坏存档、交互或视觉基线。
- **优先集成而非自研复杂基础设施**：动画、图标、状态管理、缓存与持久化、图片加载、绘图、路由、表单等领域优先选择既有成熟能力；自研代码只保留游戏独有的领域规则、创意玩法和必要胶水。
- **前期测试精简、风险分层**：普通提交只要求 TypeScript、Lint、核心 Vitest、必要的依赖与美术检查、Next 静态构建、资源路径审计、Pixi 类型与构建；不再把全量 Playwright E2E 设为每次提交/Pages 自动部署的硬门槛。
- **关键改动做定向验证**：修改抽卡概率/资源扣除、存档迁移、支付性质操作、路由、图片兼容性或核心玩法时，补最小相关单测；需要浏览器行为的改动可单独跑少量 Playwright 冒烟，避免“完全不测”。
- **阶段/里程碑再做完整 E2E**：在准备正式版本、重大玩法变更、发布基线或 UI 人工视觉审核时，使用 GitHub Actions 手动触发 `Gameplay Browser Review` 的 `full` 选项；日常可手动选择 `smoke`。完整 E2E 失败不忽视，但日常研发不等待它。
- **只保留有价值的测试**：优先测试真实输出/行为和数据不变量，不为满足脆弱的源码字符串断言而限制重构；禁止通过删除真正的安全/存档检查来提速。
- **交付必须玩家可见**：视觉改动给出确切页面入口与版号；涉及截图的阶段审核输出真实浏览器截图；区分“代码已提交”“CI 已通过”“Pages 已部署”，不可混称。
- **用户体验基线不变**：按既定黑紫酒红/细金原图布局，保持中央绘景、精致人物、角落 HUD、七条正式路由和原存档；优先解决真实错误，不堆无意义的按钮。
- **每次新对话参与本仓库工作前，先阅读本文件**。这份仓库规则用于跨会话延续研发约定；不要仅依赖聊天记忆。

## 设计工作流与 Impeccable（项目常驻）

- 开始任何 PC 或移动端 UI 修改前先读 `PRODUCT.md` 和 `DESIGN.md`。已批准的酒红、紫黑、细金、全屏绘景与中央人物构图不能被通用 SaaS 风格覆盖。
- 仓库已固定 `vendor/impeccable` 官方 Git 子模块和 `.agents/skills/impeccable` 链接；首次 clone 执行 `git submodule update --init --recursive` 后由支持的编码代理读取官方 `SKILL.md`。完整流程与 Hook 安全限制见 `docs/IMPECCABLE.md`。
- 默认依次 `critique → polish → audit`；不要为局部美化改动抽卡概率、存档或路由。禁止 Sparkles / WandSparkles 等闪光星 icon；请使用 Diamond、MoonStar、Crown、Gem 等语义图标。
- 新版卡面不展示「CG 制作中」等开发者话语；要在代码与文档中诚实保留“肖像过渡，尚无正式全身 CG”的资源事实。
- 改动后执行 `pnpm check:design`；涉及布局须用真实 1440×900 与 390×844 浏览器截图验收，不等同于自动 Hooks 已启用。

## V3.77 · 单一设计系统
唯一 UI 色板由 `app/layout.tsx` 引入 `gothic-premium-tokens.css` 的 `:root`；`--moon-ui-*`、Tailwind `--color-gothic-*` 不允许另起颜色定义。通用导航、按钮、资源胶囊、弹窗、面板请复用 `gothic-hud.tsx` 和全站材质变量；各页面允许独立的绘景、角色和稀有度语义色。禁止 Sparkles/WandSparkles。每次提交跑 `pnpm check:design` 与质量检查，跨页面修改运行至少一个真实 PC 视觉浏览器检查。
