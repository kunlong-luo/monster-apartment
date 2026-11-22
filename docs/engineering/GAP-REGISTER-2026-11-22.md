# 2026-11-22 缺口与风险台账（R12 / 迭代治理）

> 取证时点：`main` = [`770ed3c25cb3`](https://github.com/kunlong-luo/monster-apartment/commit/770ed3c25cb3a32f60273f458aa3a0ee27418f9f)。本表根据仓库文件、`branches/main` 和所列 Issue 的当时状态整理；**不把历史报告或自动测试写成今天已完成的人工验收**。每轮修复后应重核并更新，不要仅因完成文档治理就勾选产品任务。

## P0：最先解决

| ID | 缺口 / 事实依据 | 建议最小行动与关闭条件 | 状态 |
| --- | --- | --- | --- |
| GOV-01 | [Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9)：`branches/main` 于本轮查询仍为 `protected:false`；仓库 CI 文件不能替代保护规则 | 管理员配置实际 PR/required checks，并读回验证 `protected:true` 与具体 job；在此之前禁止宣称主分支治理完成 | **未完成，需管理员** |
| VIS-01 | [Issue #24](https://github.com/kunlong-luo/monster-apartment/issues/24)：全屏图仍有模糊反馈；仅凭 WebP 扩展名/分辨率不能判定清晰度 | 四种视口记录图片真实解码、DPR、裁切、回退和前后截图；修掉可复现的 P0 模糊 | **待实机复核与修复** |
| VIS-02 | [Issue #16](https://github.com/kunlong-luo/monster-apartment/issues/16)：独立场景与人物分层交付尚未有全量正式美术验收证据 | 优先补有独立设计的首页/公寓/委托/仓库场景；按 R12 审稿清单真实晋级而非复用背景换色 | **待美术交付/人审** |
| ART-01 | `public/art/beauty-beasts/characters/cg-manifest.json` 五张卡截至本轮读取**均为 `portrait`**（月纱两卡、泉泡/青枝/炽角各一） | 每卡核对独立原生图、身份和武器人体、许可、三视口；有真实签署再晋级，不能更改卡池概率或玩家存档 | **0/5 正式 CG（按清单）** |
| DOC-01 | `docs/DEVELOPMENT_PLAN.md`、`docs/TECH_STACK_PAGEVELA.md`、`docs/DECISIONS.md` 与 `management/ISSUES.md` 混有 Vite/Phaser/V0.1 记录 | 本轮标记历史版本，建立 [文档入口](../README.md)、现行 [工作手册](ITERATION-PLAYBOOK.md) 和 ADR 被替代关系；后续文档审核继续更新 | **文档入口已建立；历史资料不删除** |

## P1：紧随其后

| ID | 缺口 / 风险 | 下一行动 / 验收条件 | 状态 |
| --- | --- | --- | --- |
| UX-01 | [Issue #10](https://github.com/kunlong-luo/monster-apartment/issues/10)：尚无经验证的 10 名独立首次玩家记录 | 按 [首次玩家协议](../research/2026-11-13-r113-first-session-protocol.md) 观察真实 15–20 分钟流程，定量记录 3 个主要卡点；不可用 E2E 替代 | 待真实玩家 |
| UI-01 | [R12 导航](../design/R12-01-LOBBY-NAVIGATION-REDESIGN.md) 中一些“待实施”措辞与 [R12 总计划](../design/R12-00-VISUAL-REBUILD-PLAN.md) 的“已合并部分代码”可能不同步 | 以现行路由与截图复核：七路由两步可达、PC 中央人物不被遮挡、手机不重复导航；只更新已证实的状态 | 待复核 |
| ENG-01 | `bun.lock` 和 `pnpm-lock.yaml` 均在 Git Tree；CI 文案声称未跟踪 pnpm lock，可能已有时效差异 | 核对哪些文件被实际安装器读取、是否误导；不经复现不要删除 lockfile 或更换构建工具 | 待诊断 |
| ENG-02 | `docs/CURRENT_ARCHITECTURE.md` 仍有按轮次叠加的长期说明，难以一眼判断“当前/曾经” | 后续把运行时架构简图与历史升级日志分开；不得因为拆文档误删 `v2` Pixi sidecar | 待整理 |
| QA-01 | 已有 Quality、Desktop Visual、Gameplay Browser 与 Pages，但文档/审核容易把单一绿灯写成全量验收 | 每轮按 [分层门禁](ITERATION-PLAYBOOK.md) 记录同 SHA 和必要截图/人审；阶段发布才执行 `full` | 常驻检查 |

## 固定执行顺序与停机条件

1. **本轮（文档治理）**：规范入口、ADR、历史提示、工作手册、真实缺口与统一回执；不变更玩法、美术清单、玩家存档、依赖或 CI。
2. **下一轮（优先视觉可见）**：VIS-01 真实像素诊断和最严重的首页/委托/仓库模糊点；同批只处理一类可验证根因。
3. **再下一轮（原画验收）**：VIS-02 / ART-01 独立场景和五卡候选逐张身份与尺寸复核；先审批后正式接入。
4. **并行治理与验证**：GOV-01 需要仓库管理员真实配置；UX-01 需要真实玩家，不能由自动化或文档更新代办。

**结束条件**：每轮至少关闭一个可观察缺口，有路径 + SHA + 审核证据；遇到“没有源图/没有真人审稿/没有 admin 权限”，明确标记 `BLOCKED`，不通过改状态冒充完成。

## 2026-11-22 功能切片补充：首单一键布置

- **已实现代码**：严格限制于未经修改的第 1 天默认布局，`prepare-starter-line` 在工坊运行时锁内一次完成温室搬迁、熔炉购买和三人派工；源头规则及用途见 [专项说明](2026-11-22-starter-line-onboarding.md)。
- **质量与发布状态**：以引入此功能的提交 SHA 对应 GitHub Actions 为准；没有截图和人工审查之前，不代表 UX 已获玩家验证。
- **剩余挑战**：开自动生产/开自动履约仍需玩家主动选择；首次玩家是否理解这两步由 UX-01 的真实观察决定。

## 2026-11-22 角色经营联动纵向切片

- **实现范围**：工坊真实完成 1/3 单委托 + 私室正确调查物件 + 已有第一次交谈选择 → 各收录 1/2 幕专属剧情；三位工匠最多 6 幕，独立且可持久读取；见 [专项说明](2026-11-22-worker-bond-stories.md)。
- **未假定完成**：高清场景、人物 CG、外观大改与新经济增益仍须另行验收；CI、Pages 和 PC/手机浏览器证据以该功能的提交 SHA 为准。
- **待解答的玩家问题**：这些支线是否足够让玩家主动往返工坊与人物房间，归入 UX-01 的 10 名首次体验者观察。

## 2026-11-22 Pages 发布竞态防护

- 2026-11-22 的人物支线代码（`e09e01e`）Quality 已通过，但两次 `Deploy GitHub Pages` 在 `actions/upload-pages-artifact` 成功后立即查询时得到 0 个可见产物，失败来自 `actions/deploy-pages@v4` 的 artifact metadata 查询，而非 Next 编译或资源生成。
- 已在 `.github/workflows/deploy-pages.yml` 增加最多 15 次、每次间隔 5 秒的 GitHub Actions API 可见性轮询；看到本次 `github-pages-<run_attempt>` 后才继续部署，未索引则明确失败，绝不误称成功。
- **完成状态**：以包含该修复的 SHA 对应 Quality 和 Pages 工作流验收结果为准；GitHub Pages 必须核实实际部署成功后才标成上线。

### 发布流程根因修正（后续修订）

对 `4af3a9c` 的部署日志确认：`gh api`（REST）已能读到 `github-pages-1`，但 `actions/deploy-pages@v4` 使用的内部 Actions Artifacts API 仍返回 0；仅轮询 REST 不足以保证部署动作成功。与 [actions/deploy-pages#451](https://github.com/actions/deploy-pages/issues/451) 报告的同作业上传与立即查询竞态一致。

因此将发布工作流拆成**同一工作流运行内**的 `build` 和 `deploy` 两个串行作业。仅当 Quality 为 main push 的成功结果才开始 build，build 完成才启用带 Pages 写权限的 deploy；artifact 名为 `github-pages-<run_id>`，重试仅失败的部署作业时沿用同名且不会再次上传。部署作业再次执行带上限的 REST 检查，并为内部 artifact service 留出额外 5 秒。最终结果必须核对新 SHA 的 Pages 运行结果，不可宣称已上线。

## 2026-11-22 A05 人物画作高清显示约束

- 五张契约卡均已选择各自独立的 `3:4` 候选 WebP，原先 A05 浏览器测试仍按“四张方脸肖像、一张竖幅”检查，造成旧桌面验收红灯；现在将 `portrait/candidate/production` 三种状态显式区分，禁止通过“有竖幅候选”推断人工 CG 已获准晋级。
- 人物画作放大鉴赏使用 `object-fit:contain` 并按**实际加载成功的图片 naturalWidth、naturalHeight 与至少 DPR2**限制 CSS 画框宽高。即使请求失败回退到 512px 肖像也不会被全屏拉糊；窄卡片仅作图像封面裁切，正常鉴赏保留全幅武器、足部和发梢。
- [A05 Playwright](../../e2e/a05-character-gallery-layout.spec.ts) 按当前 manifest 证据检查五张候选的真实尺寸、distinct source、状态、画廊完整比例、桌面与 390px 手机横向溢出，并配合 [资源身份 Vitest](../../tests/heroine-portrait-identity.vitest.test.ts) 校验资源状态和像素上限。**0/5 production CG 的审核结果没有变化**。质量审核之外还需真实人审画面。

## 2026-11-22 三栏召唤布局与画作回归同步

- 全量浏览器回归曾发现召唤页主舞台的第四个独立 `SummonActionBar` flex 子节点压缩中央人物区，1648px 时中心占比实际约 0.103（原基线要求大于 0.39）。本轮将操作组和 `SummonHeroineSpotlight` 包装为**同一个中央 flex 栏**，仍复用原按钮和真实抽卡结算，不新增导航/卡片；`e2e/cinematic-summon.spec.ts` 继续验证左右栏与中央面积，并确认单抽/十连位于同一中央列。
- `e2e/character-collection.spec.ts` 与 `e2e/moonwork-routes.spec.ts` 原先错误地把三位已选用竖幅候选稿的角色认作 portrait layout，现按真实 `candidate`、`figure` 检查。
- 去除召唤页对已不存在的 `data-tier` 数字属性的脆弱断言。实际稀有度和概率仍由 `GACHA_CHARACTERS` 的真实卡牌显示与原有测试核对，不再添加只为通过测试的虚假标签。
- 全量回归先前还有 A05 旧断言；新一轮必须以**当前提交 SHA** 重跑验证。美术 CG 仍旧 0/5 正式签署，不能因为候选显示更清晰就改变正式入库结论。

## 2026-11-22 十连结果：缩略身份与大幅候选分级

- 桌面审核发现十连结果缩略卡仍加载真实方形身份肖像，但旧 `getCardPortraitKind` 按可选候选画稿把它错误分类成 `candidate-figure`，导致画作与验收语义混淆。
- 按 `feature/thumbnail` 视图判定**实际显示的图像**：缩略保留 512px 人物身份肖像，放大结果卡显示对应的 3:4 候选画稿。两者都复用同一人物基准，不把 candidate 当生产 CG。
- 为候选结果大卡补上克制的收藏画框，继续 `contain` 展示原画，保持四肢、武器完整可见。定向 Vitest 与桌面十连 Playwright 同时检查缩略身份、放大卡种类、真实图片、边框、既有结算和原奖品账本。
