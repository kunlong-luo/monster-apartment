# R11.3 · 发布收口、全量回归与计划校准

初建日期：2026-11-12；最新验收记录：2026-11-14。本记录区分**历史冻结前基线**、**已经证明的正式发布技术回归**和**仍需管理员/真人完成的治理及产品验证**。

## 0. 2026-11-14 · 已核验的 R11.3 正式技术发布（PR #22 后）

> **本节仅冻结实际已经验收的功能代码和部署证据，不声称 GitHub 管理员设置或真人试玩已完成。** 随后的纯文档提交会使 `main` HEAD 不同于下面的功能 SHA；不能把此前测试“挪用”为文档提交本身的 full 结果。

- **正式功能发布 SHA**：[ `6d997e4d0b2a8229d989f5643bcd4bc19f311e08` ](https://github.com/kunlong-luo/monster-apartment/commit/6d997e4d0b2a8229d989f5643bcd4bc19f311e08)，已合并 [PR #22](https://github.com/kunlong-luo/monster-apartment/pull/22)。它在原先 [PR #19](https://github.com/kunlong-luo/monster-apartment/pull/19) / [PR #21](https://github.com/kunlong-luo/monster-apartment/pull/21) 的存档事务化基线之上加入独立的匿名试玩记录页面、CSV 校验及本地导出，以及非游戏路由隐藏场景导航。
- **四工作流同 SHA 验收**：[Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/43551717561) `checks` / `pixi-v2-scaffold` / `static-export` 均成功；[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/43551717522) `desktop-review` 成功；[Gameplay Browser Review full](https://github.com/kunlong-luo/monster-apartment/actions/runs/43551717531) `browser-review` 成功（完成日志 **166 passed / 2 skipped / 0 failed**）；[GitHub Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/43551776453) `deploy` 成功。全部 `head_sha` 均为上述正式 SHA。
- **研究辅助工具**：正式 Pages 已构建并发布 `/research/first-session/` 静态路由，自动化包括 390×844 页面不横向溢出、匿名单人 CSV、选择设备及下载、刷新无记录持久化。它**不自动采集观察或保存姓名**；主持人须自行归档已取得同意的匿名观察记录。
- **尚未满足的治理门禁**：GitHub 实时 `branches/main` 返回 `protected:false`，`/rulesets` 返回空数组；[Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9) 仍须管理员实际设置 PR-only、required checks、禁止强推，并重新读取 API 核验。工作流自身成功不是保护规则。
- **尚未满足的真人产品验收**：[Issue #10](https://github.com/kunlong-luo/monster-apartment/issues/10) 尚无 10 位独立首次玩家的经过验证的观察数据；不能把 166 个浏览器断言当成真人样本或使用未观察字段推导失败率。[首次试玩协议](../research/2026-11-13-r113-first-session-protocol.md) 明确 15–20 分钟、PC/手机覆盖和 CSV 模板。
- **独立美术待办**：[Issue #16](https://github.com/kunlong-luo/monster-apartment/issues/16) 的公寓/委托/仓库三处独立高清绘景及候选人物/机器美术仍未人工审核完成，不能标记 `ready`。
- **阶段判定**：R11.3 **技术发布、同 SHA 完整回归与正式部署完成**；**发布治理、真人验证仍 IN PROGRESS**。下一步优先解除 #9 并开展 #10；缺真实玩家反馈前不擅自启动大批量 R12 CG 或声称留存达标。

## 0A. 2026-11-14 · PR #19 / #21 后的历史功能基线（已被 #22 后续发布替代）

> 最新已确认的正式游戏代码 `main` 为 [`fdcaae05`](https://github.com/kunlong-luo/monster-apartment/commit/fdcaae058263ab500262488cd8f1950942f9ab5f)。此状态由 GitHub 实时检查及 Actions 结果支持，不代表 GitHub 主分支规则、真人试玩或 R12 正式美术已经完成。

- [PR #19](https://github.com/kunlong-luo/monster-apartment/pull/19) 已完成公寓损坏存档的旧弹窗并发保护；[PR #21](https://github.com/kunlong-luo/monster-apartment/pull/21) 已将公寓日常房间操作、计时和显式重置统一到 Web Locks 事务，保留 `monster-apartment:cozy:v1` 存档键及旧结构兼容。对应 [Issue #20](https://github.com/kunlong-luo/monster-apartment/issues/20) 已按合并及 CI 验收关闭。
- 正式 `fdcaae05` SHA 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/43431196724)、[Gameplay Browser Review full](https://github.com/kunlong-luo/monster-apartment/actions/runs/43431196734) 和 [GitHub Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/43431323323) 均 `completed/success`；三个工作流 `head_sha` 一致。
- [PR #21 最终 head `6a0aad48`](https://github.com/kunlong-luo/monster-apartment/commit/6a0aad48e08ea7c7be1a9426bbc3f4c12d08ee0d) 的 [Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/43428176678) 已通过。它**不是** `fdcaae05` 的 main 同 SHA 视觉审核，不得与三项主分支工作流拼成虚构的四工作流同 SHA 全绿。
- 2026-11-14 最新检查：默认分支依然 `protected:false`，`rulesets=[]`；[Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9) 未解决。尚无 10 名真实独立玩家试玩；[Issue #10](https://github.com/kunlong-luo/monster-apartment/issues/10) 未完成。公寓、委托及仓库独立高清环境仍由 [Issue #16](https://github.com/kunlong-luo/monster-apartment/issues/16) 跟进，未交付批准素材。
- **本轮结论**：功能技术发布基线已推进，R11.3 治理与真实玩家验证仍为 **IN PROGRESS**。研究表单只帮助匿名记录，不会自动获得真实样本或解除管理员 Rulesets 门槛。

## 0B. 2026-11-13 · 先前功能发布基线（PR #14 / #15 后，历史 SHA）

> 本节记录**最近一次经四工作流同 SHA 完整验收的游戏代码**，不等同于“GitHub 保护规则已配置”或“真人试玩已完成”。后续纯文档提交可能改变 main HEAD；不能据此冒认该文档提交本身已经执行完整浏览器回归。

- 经检查的功能发布 SHA：[`b88f97a5684`](https://github.com/kunlong-luo/monster-apartment/commit/b88f97a5684b6416eb32c1aff671705ca5e23612)，[PR #14](https://github.com/kunlong-luo/monster-apartment/pull/14) 于 `2dec503d` 合入损坏工坊存档的原数据导出、已校验 IndexedDB 备份恢复和无备份时手动重置；[PR #15](https://github.com/kunlong-luo/monster-apartment/pull/15) 于 `b88f97a` 合入跨标签页覆盖保护。
- [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/43375154838)：`checks`、`pixi-v2-scaffold`、`static-export` 均通过；[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/43375154812)：`desktop-review` 通过；[Gameplay Browser Review full](https://github.com/kunlong-luo/monster-apartment/actions/runs/43375154923)：`browser-review` 通过，日志为 **161 passed / 2 skipped / 0 failed**；[GitHub Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/43375237214)：部署成功。四项工作流 `head_sha` 都是 `b88f97a5684b6416eb32c1aff671705ca5e23612`。
- PR #15 新增回归模拟：错误弹窗出现后，另一标签页恢复到有效“第 2 天”存档；旧标签页点击“确认重新开始”和“恢复备份”均不得覆盖有效存档，刷新后仍为第 2 天。静态审查确认两项操作在现有 Web Lock 下比对最初损坏内容；**没有调整存档格式、生产和订单结算**。
- **证据边界**：最新 `b88f97a` 的视觉工作流为成功，但未在本次记录中宣称已逐张人工审看最新 artifact；[Issue #7](https://github.com/kunlong-luo/monster-apartment/issues/7) 的 PC/手机人工像素审查来自此前 `68dc7550` 的正式截图。自动化全绿不等于全部美术资产可标记 ready。
- 2026-11-13 再查 GitHub：`branches/main` 为 `protected:false`、required checks 为空、`/rulesets` 返回空数组。仓库管理员仍须完成 [Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9)；[Issue #10](https://github.com/kunlong-luo/monster-apartment/issues/10) 暂无 10 人真实试玩数据；[Issue #16](https://github.com/kunlong-luo/monster-apartment/issues/16) 是独立场景美术后续任务，尚未交付。
- **发布判定**：此 SHA 的自动化技术发布证据齐备；R11.3 整体依旧 **IN PROGRESS**（治理 + 真人产品验收未完成），不得将 Issue #9/#10/#16 标记完成。

## 0C. 2026-11-13 · 初次里程碑功能基线（历史 SHA `68dc7550`）

- 正式分支提交：[`68dc7550`](https://github.com/kunlong-luo/monster-apartment/commit/68dc7550a7d5a088f199e43a448959cfe59d9b3d)，合并自 [PR #8](https://github.com/kunlong-luo/monster-apartment/pull/8)。
- [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/43353689351)：`checks` / `pixi-v2-scaffold` / `static-export` 全部成功；[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/43353689353)：`desktop-review` 成功；[Gameplay Browser Review full](https://github.com/kunlong-luo/monster-apartment/actions/runs/43353689400)：`browser-review` 成功，**158 passed / 2 skipped**；[GitHub Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/43353772800)：成功。四条工作流均为此 `head_sha`。
- [Workshop Performance Baseline](https://github.com/kunlong-luo/monster-apartment/actions/runs/43353689407) 与 [WebGL Lifecycle](https://github.com/kunlong-luo/monster-apartment/actions/runs/43353689415) 同 SHA 成功；API 观测不等于 GPU 显存泄漏的绝对证明。
- 人工下载并检查正式分支 [Desktop Visual artifact 14005620855](https://github.com/kunlong-luo/monster-apartment/actions/runs/43353689353/artifacts/14005620855) 的 `desktop-workshop-true-dialogue-r107-1440.png`、`mobile-workshop-true-dialogue-r113-390.png` 和 `mobile-workshop-reduced-motion-r107-390.png`；PC 角色完整、对话可读、手机对话独立显示在 15 格舞台上方。[Issue #7](https://github.com/kunlong-luo/monster-apartment/issues/7) 已按真实像素和浏览器断言关闭。
- **未完成**：[Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9) 主分支保护，API 复查仍为 `protected:false`；[Issue #10](https://github.com/kunlong-luo/monster-apartment/issues/10) 10 名真实非作者玩家试玩尚无结果。试玩协议及空白结果模板见 [研究文档](../research/2026-11-13-r113-first-session-protocol.md)。
- **判定**：R113-01/02/03 的资料、技术与视觉验收已满足；R113-04/05/06 保持待完成。R11.3 **整体不得标记完全结束**，更不意味着 V3 或正式美术已交付。

## 1. 冻结前的事实基线（历史记录）

- 2026-11-12 当时已核实的 `main`：[`246f6c87ca1f`](https://github.com/kunlong-luo/monster-apartment/commit/246f6c87ca1fec6548afd8b83535702e6343a568)，补丁：设备布局改变后持久化 `auto.layout` 指纹，避免反复推迟下一次设备周期。
- 该 SHA 已有成功的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/43185784401)、[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/43185784376)、[GitHub Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/43185890463)。**当时不包含该旧 SHA 的 Gameplay Browser Review full 证明**，现有正式 SHA 验收见第 0 节。
- 当时 [Issue #7](https://github.com/kunlong-luo/monster-apartment/issues/7) 尚未完成 390×844 对话像素验收；**已于 2026-11-13 按第 0 节证据关闭**。
- `main` 基线未受保护、required checks 为空。仅修改工作流本身不能开启规则集；管理员必须在 GitHub Settings 中设置并复核。
- R09.5 覆盖三次真实进入/离开、48 次设备变化与 WebGL API 对象/调用观测；不是 GPU 显存采样，更不是“完全无 GPU 泄漏”证明。本阶段不启动 R09.6。

## 2. 当前状态矩阵：用「代码实现」与「发布验收」两列避免同词冲突

| 范围 | 代码与资产状态 | R11.3 门禁状态 | 证据与约束 |
| --- | --- | --- | --- |
| R09.5 生命周期观测 | 已实现、已发布 | 已有专项成功运行；非显存泄漏结论 | [阶段记录](2026-11-08-workshop-r09-fixed-save-performance.md) |
| R10.1–R10.10 工坊迭代 | 已实现与发布过的功能迭代 | 不等于正式美术交付 | 历史 Quality / visual / Pages；候选 CG 仍 review |
| R11/R11.1 显式自动履约及 PC/手机操作 | 已实现、已发布 | 正式 main full 已通过（非真人试玩） | 旧档 opt-out、点击不即时结算、唯一操作入口 |
| R11.2 独立合同日历/布局指纹 | 已实现，起始基线为 246f6c87 | **正式 main browser full 已通过** | 布局变化不得刷新截止时间，下一轮真实生产仅一次 |
| R11.3 计划、视觉、CI 收口 | PR #22 已合并，正式功能发布 SHA 为 6d997e4d | **同 SHA Quality / desktop / browser full / Pages 全部成功；治理与真人未完成** | 本台账第 0 节；#9 未实施、#10 待真人试玩 |
| V3 全站自主调度/权威 Dexie V3 存档 | 仅部分 V2 工坊规则落地；完整 V3 未实现 | 不可标记 Released | 跨七页统一账本、迁移与真实试玩未完成 |
| Issue #7 月纱对话 | PC/手机修复已合并 | **已按主分支截图和断言关闭** | PC 1440×900，手机 390×844，reduced-motion；见第 0 节 |
| 正式美术 | 9 张设备静态图 review；3 人工匠全身 CG、三组四帧机器工作动画、月纱正式资源 pending | **阻塞** | `v2/art/asset-pack.v1.json`: paintingDelivered / browserVisualReviewPassed / releaseReady 均 false |
| 玩家验证 P016/P021/P041 | 尚无 10 名真实玩家记录 | **待外部试玩** | 完成率、无提示启动自动生产/履约、卡点、重玩意愿 |

### 已实现但不等于已完成整个 P0

当前 V2 代码允许玩家分别启用机器自动生产和安全自动履约，遵守独立设备周期/合同日历、有限补算、旧档默认关闭履约；保留手动班次与旧存档键。这不代表 V3 PRD 全部 P0 工作包（Dexie V3 原子迁移、统一跨七页账本、完整预留/离线模型）已交付。正式技术/经营目标仍在 `docs/v3`，当前发布事实以 `main` 源码与同 SHA 工作流为准。

历史 `management/TASKS.csv` 以 V0.4 及更早版本为主，其 DONE/DOING 是**历史快照**，不自动推定 R11/V3 现在的完成状态。R11.3 增补 R113 系列唯一 ID；移除重复 V040-04 与 V040-05 的旧 TODO 行，保留较新的 DOING 行供追溯。

## 2026-11-13 · PR #8 失败用例修复历史（非最终状态）

- [PR head `ab66bd2c` 的完整浏览器回归](https://github.com/kunlong-luo/monster-apartment/actions/runs/43288202634)：**156 passed、2 failed、2 R09 专项 skipped**。两项失败都经真实 CI 日志和错误 DOM 快照确认；必须修复并在**新的同一 SHA** 复测。
- 390×550 月纱私室的本地美术候选会在 `candidatePreview` 时**主动隐藏未经校准的物件热点**，这是防止旧坐标污染新背景的正确行为；折叠 QA 面板并没有退出候选预览。Playwright 现在先断言未审稿背景**没有**旧热点，然后通过真实「恢复原概念背景」按钮退出预览，再验证茶杯热点/可访问菜单以及调查反馈。**没有绕开人工美术审核门禁**。
- 召唤页五张卡的图片来源已有 5 个不同 URL。月纱两种稀有形态可用两张原创肖像；仍要求至少四个唯一来源、每张都实际解码，而不是强制两种稀有形态共用同一张图。
- README 与 V3 路线图的安装命令已统一为 `bun install --frozen-lockfile`（跟踪 `bun.lock`），避免已证实的 frozen pnpm 锁文件错误。
- 以上是 PR #8 中途的历史修复记录。**后续新 SHA 已通过正式完整回归**，最终数据见第 0 节；Issue #7 现已关闭。

## 3. 里程碑测试矩阵（同 SHA 自动化已通过，治理门禁待验）

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

### 发布判定（执行结果与剩余任务）

1. **已完成**：[PR #8](https://github.com/kunlong-luo/monster-apartment/pull/8) 合并前 Quality、Desktop Visual Review 与 Gameplay Browser Review full 均验证成功，PR 对所有页面设计审查有明确触发规则。
2. **已完成**：首次冻结 `68dc7550` 的 full 为 158 passed / 2 skipped；后续最新功能版本 `b88f97a` 的 full 为 **161 passed / 2 skipped / 0 failed**。不能把 `smoke`、其它 SHA 或仅质量任务当作完整回归。
3. **已完成**：`b88f97a` 的 Quality、Desktop Visual Review、Gameplay Browser Review full、GitHub Pages 均同 SHA 通过。性能与 WebGL 专项仍仅引用历史 `68dc7550` 的合格运行，不冒称在新 SHA 运行过。
4. **已完成**：从正式 `main` workflow 下载截图，人工检查月纱 1440×900 与 390×844 的对话、减少动态效果模式与生产布局后，附证据关闭 Issue #7。
5. **未完成，须仓库管理员执行**：GitHub Settings → Rulesets/Branches 对 `main` 启用 PR-only、禁直推/force push，并要求 `checks`、`pixi-v2-scaffold`、`static-export`、`desktop-review` 通过且 up to date。通过读取 `branches/main` 的 `protected:true` 与实际 required checks 核验后才可关闭 [Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9)。本连接器无管理员写接口，不可假报已配置。
6. **未完成，需真实玩家参与**：发布治理收口后按 [首次试玩协议](../research/2026-11-13-r113-first-session-protocol.md) 招募至少 10 名首次玩家，观察自动生产、显式履约、首单和重玩意愿；记录真实卡点后才决定 R12 与正式美术量产，不要用 E2E 代替真人数据。

### 完成定义

**R11.3 正式游戏代码发布基线更新至 `6d997e4d`，但整体仍未完成**：正式 main 同一 SHA 的 Gameplay Browser Review full + Quality + Desktop Visual Review + Pages 全部成功；Issue #7 已关闭（人工截图验收属较早里程碑）；**主分支 ruleset/required checks 尚未实际生效（Issue #9）**。必须由管理员配置并读取确认后才能标记完整 R11.3 发布治理 DONE。独立十人试玩与正式美术分别按 Issue #10 / 资产审核另行验收，不得从 CI 结果推定完成。
