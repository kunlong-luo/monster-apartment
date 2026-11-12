# R11.3 · 发布收口、全量回归与计划校准

日期：2026-11-12。记录类型：阶段状态矩阵与验收台账，不是“全量通过”声明。

## 1. 冻结前的事实基线

- 当前已核实的 `main`：[`246f6c87ca1f`](https://github.com/kunlong-luo/monster-apartment/commit/246f6c87ca1fec6548afd8b83535702e6343a568)，补丁：设备布局改变后持久化 `auto.layout` 指纹，避免反复推迟下一次设备周期。
- 该 SHA 已有成功的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/43185784401)、[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/43185784376)、[GitHub Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/43185890463)。**不包含当前 SHA 的 Gameplay Browser Review full 证明**。
- [Issue #7](https://github.com/kunlong-luo/monster-apartment/issues/7) 未完成 390×844 对话可见性与像素验收。历史截图仅能说明桌面裁切问题未再次复现，不能替代当前回归。
- `main` 基线未受保护、required checks 为空。仅修改工作流本身不能开启规则集；管理员必须在 GitHub Settings 中设置并复核。
- R09.5 覆盖三次真实进入/离开、48 次设备变化与 WebGL API 对象/调用观测；不是 GPU 显存采样，更不是“完全无 GPU 泄漏”证明。本阶段不启动 R09.6。

## 2. 当前状态矩阵：用「代码实现」与「发布验收」两列避免同词冲突

| 范围 | 代码与资产状态 | R11.3 门禁状态 | 证据与约束 |
| --- | --- | --- | --- |
| R09.5 生命周期观测 | 已实现、已发布 | 已有专项成功运行；非显存泄漏结论 | [阶段记录](2026-11-08-workshop-r09-fixed-save-performance.md) |
| R10.1–R10.10 工坊迭代 | 已实现与发布过的功能迭代 | 不等于正式美术交付 | 历史 Quality / visual / Pages；候选 CG 仍 review |
| R11/R11.1 显式自动履约及 PC/手机操作 | 已实现、已发布 | 本里程碑组合回归待核 | 旧档 opt-out、点击不即时结算、唯一操作入口 |
| R11.2 独立合同日历/布局指纹 | 已实现，基线为 246f6c87 | **完整 browser full 未验收** | 布局变化不得刷新截止时间，下一轮真实生产仅一次 |
| R11.3 计划、视觉、CI 收口 | 本分支执行中 | **未完成** | 本文档、手机对话强制断言、PR CI 触发 |
| V3 全站自主调度/权威 Dexie V3 存档 | 仅部分 V2 工坊规则落地；完整 V3 未实现 | 不可标记 Released | 跨七页统一账本、迁移与真实试玩未完成 |
| Issue #7 月纱对话 | 历史桌面修复已存在；手机显示原先被隐藏 | **待新截图与计算几何/命中人工审核** | PC 1440×900，手机 390×844，reduced-motion |
| 正式美术 | 9 张设备静态图 review；3 人工匠全身 CG、三组四帧机器工作动画、月纱正式资源 pending | **阻塞** | `v2/art/asset-pack.v1.json`: paintingDelivered / browserVisualReviewPassed / releaseReady 均 false |
| 玩家验证 P016/P021/P041 | 尚无 10 名真实玩家记录 | **待外部试玩** | 完成率、无提示启动自动生产/履约、卡点、重玩意愿 |

### 已实现但不等于已完成整个 P0

当前 V2 代码允许玩家分别启用机器自动生产和安全自动履约，遵守独立设备周期/合同日历、有限补算、旧档默认关闭履约；保留手动班次与旧存档键。这不代表 V3 PRD 全部 P0 工作包（Dexie V3 原子迁移、统一跨七页账本、完整预留/离线模型）已交付。正式技术/经营目标仍在 `docs/v3`，当前发布事实以 `main` 源码与同 SHA 工作流为准。

历史 `management/TASKS.csv` 以 V0.4 及更早版本为主，其 DONE/DOING 是**历史快照**，不自动推定 R11/V3 现在的完成状态。R11.3 增补 R113 系列唯一 ID；移除重复 V040-04 与 V040-05 的旧 TODO 行，保留较新的 DOING 行供追溯。

## 2026-11-13 · full E2E 最终两项回归收口

- [PR head `ab66bd2c` 的完整浏览器回归](https://github.com/kunlong-luo/monster-apartment/actions/runs/43288202634)：**156 passed、2 failed、2 R09 专项 skipped**。两项失败都经真实 CI 日志和错误 DOM 快照确认；必须修复并在**新的同一 SHA** 复测。
- 390×550 月纱私室的本地美术候选会在 `candidatePreview` 时**主动隐藏未经校准的物件热点**，这是防止旧坐标污染新背景的正确行为；折叠 QA 面板并没有退出候选预览。Playwright 现在先断言未审稿背景**没有**旧热点，然后通过真实「恢复原概念背景」按钮退出预览，再验证茶杯热点/可访问菜单以及调查反馈。**没有绕开人工美术审核门禁**。
- 召唤页五张卡的图片来源已有 5 个不同 URL。月纱两种稀有形态可用两张原创肖像；仍要求至少四个唯一来源、每张都实际解码，而不是强制两种稀有形态共用同一张图。
- README 与 V3 路线图的安装命令已统一为 `bun install --frozen-lockfile`（跟踪 `bun.lock`），避免已证实的 frozen pnpm 锁文件错误。
- 此记录只是修复记录，**不代表新提交 full 已通过**，R11.3 完成定义与 Issue #7 保持不变。

## 3. 里程碑测试矩阵（全量通过前保持待验）

| 必测场景 | 覆盖 / 验收方式 |
| --- | --- |
| 开启自动设备生产 + 显式开启自动合同履约 | 同屏操作真实触达；动作只影响一次状态 |
| 搬迁、升级、拆除重建或重新派工 | 设备 `auto.layout` 更新并持久化，`nextContractAt` 不后移 |
| 新布局一次唤醒和下个设备周期 | 首次唤醒允许重新排产，第二次实际到账且只生产一次 |
| 刷新恢复和同一 `now` 重复处理 | 日期、库存、币、合同状态及 `auto.produced` 不重复记账 |
| 旧存档不自动履约 | 缺失 `autoDeliver` 时必须保留 opt-out |
| 双标签并发结算 | Web Locks / 本地事务串行，最多一个写入者 |
| 月纱 1440×900 对话所有状态 | 框体宽高、overflow、z-index、`elementFromPoint`、长文本、点击与截图 |
| 月纱 390×844 对话 + reduced-motion | **强制**可见；不允许 `if(isVisible())` 跳过；不遮挡机器舞台和主操作、截图审查 |
| 多页与最终上线 | 7 个路由 E2E、Quality、Desktop Visual Review、Gameplay Browser Review full、Pages **同一 SHA** 均成功 |

### 发布判定

1. 将本 PR 合并到 `main` 前必须看清本 PR 的 Quality、Desktop Visual Review 结果；本 PR 添加视觉 `pull_request` 触发，以便 Required Check 可以配置。对于 R11.3 触及的工坊 CSS/E2E/里程碑工作流，`Gameplay Browser Review` 会在 PR 和 `main` push **自动运行 full**，其它场景仍可手动 dispatch；CI 尚未真正成功前保持待验。
2. 对同一 `main` SHA 验证自动触发的 **Gameplay Browser Review full**（若对应更改未触发，则通过 Run workflow → suite: full 手动运行；默认是 smoke）。核对 `head_sha`、全部 job 结论和产生的截图。**实际运行成功前不得伪称完成**。
3. 复核该 SHA 的 Quality、Desktop Visual Review、Pages；如 Desktop Visual Review 因路径过滤没触发，需针对该 SHA 手动运行（工作流有 workflow_dispatch），不能把缺席当绿灯。
4. 下载新视觉工件，分别人工查看 `desktop-workshop-true-dialogue-r107-1440.png` 与 `mobile-workshop-true-dialogue-r113-390.png` 的真实像素，以及其它主要工坊状态。确认可点击、完整、不卡文字、不挡机器/主要控制；再关闭 Issue #7。
5. GitHub Settings → Branches/Rulesets：为 `main` 开启禁止直接推送 / 仅 PR 合入，并要求 Quality 的 `checks`、`pixi-v2-scaffold`、`static-export` 及 Desktop Visual Review 的 `desktop-review`（按 GitHub 实际上报的 Check Context 名称核实）。**本连接器没有分支保护写接口；规则必须由仓库管理员操作并读取确认。**
6. 里程碑全绿后招募至少 10 名作者以外玩家；记录第一单完成率、自动生产/履约发现率、主要卡点和愿不愿再次游玩，作为 R12/美术量产的实际决策依据。

### 完成定义

**R11.3 未完成，直至**主分支的同一 SHA 全量浏览器 + Quality + Desktop Visual Review + Pages 证据齐备、Issue #7 截图/交互验收关闭、主分支 ruleset/required checks 实际生效，并且上述状态表同步更新。不因 PR 合入或 CI 中三个局部工作流变绿而提前完结。
