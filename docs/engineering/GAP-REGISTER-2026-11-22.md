# 2026-11-22 缺口与风险台账（R12 / 迭代治理）

> 取证时点：`main` = [`770ed3c25cb3`](https://github.com/kunlong-luo/monster-apartment/commit/770ed3c25cb3a32f60273f458aa3a0ee27418f9f)。本表根据仓库文件、`branches/main` 和所列 Issue 的当时状态整理；**不把历史报告或自动测试写成今天已完成的人工验收**。每轮修复后应重核并更新，不要仅因完成文档治理就勾选产品任务。

## R14 · 原子任务执行队列（现行唯一优先级）

状态：待办 / 候选（已提交但未验）/ 通过（有同 SHA 证据）/ 阻塞。一个任务或一个不可分割的缺陷簇完成后更新此表；先验收前置再继续，未通过不扩展。无需另建任务文档；涉及后续产品设计的具体数值在实施前验证，不提前伪造。

### U · 单一经营架构（P0，当前）

| ID | 最小任务 | 前置 | 可检查的完成条件 | 状态 |
| --- | --- | --- | --- | --- |
| U01 | 欢迎页旧存档引用 | — | 删除已退役导入，只有旧住房记录不算现行进度，字节不变；现行收藏/剧情/抽卡继续可识别 | 通过（dbf7d52 前序回归；c318085 Quality） |
| U02 | 公寓未用导入 | — | TypeScript 不再报 TS6133 | 通过（c318085 Quality） |
| U03 | 公寓用途文案 | U01 | 导航不再提示安排住房经营 | 通过（c318085 源码/Quality） |
| U04 | 残留引用 | U01–03 | TS/静态导出、组件和字面路径审计通过；历史文档/只读原始键允许 | 通过（bf806e0 同 SHA 四项 CI、577 文本专项） |
| U05 | 旧住房样式 | U04 | 核查 ga-room-drawer、ga-warning 等实际引用后删死规则；保留活跃绘景/研究样式 | 候选（新 SHA 验收待核） |
| U06 | 共享星币 | U04 | 大厅/公寓/工坊/街区/仓库真实交易前后一致 | 候选 |
| U07 | 共享日期 | U04 | 无 V1 独立时钟；手动和自动履约真实推进 | 候选 |
| U08 | 共享库存 | U04 | 晶核生产、采购、消耗跨页一致 | 候选 |
| U09 | 共享委托 | U06–08 | 实际交付后各页进度一致 | 候选 |
| U10 | 多标签事务 | U06–09 | 并发不丢更新、不重复结算 | 待办 |
| U11 | 旧记录保护 | U04 | 正常/损坏原始字节不改、可下载、新玩家不创建旧键 | 候选 |
| U12 | 现行恢复 | U04 | 损坏工坊不自动覆盖、备份恢复与锁仍有效 | 待办 |
| U13 | 四间人物房间 | U04 | 四人真实入口、剧情、历史返回及直链有效 | 通过（dbf7d52 专项复验、bf806e0 回归及 U04 前置） |
| U14 | 桌面与手机 | U05–13 | 1440×900、390×844 实际截图、无溢出/遮挡、研究工具隔离 | 待办 |
| U15 | 完整回归 | U14 | 同 SHA Quality、Desktop、Pixel、Gameplay full 全通过，0 flaky | 待办（U14 前置待验） |
| U16 | 合并发布 | U15 | PR 合并，main 同 SHA Quality/Pages 与线上核验 | 待办 |

### I · 人物与成长统一（U16 后）

| ID | 任务 | 前置 | 验收 |
| --- | --- | --- | --- |
| I01 | 清点人物身份和角色卡、工匠、私室映射 | U16 | 四人唯一 ID、卡牌变体与人物身份分离 |
| I02 | 收敛重复角色定义 | I01 | 公寓/大厅/图鉴/派工同源名称、身份与肖像 |
| I03 | 明确剧情访问与契约拥有规则 | I02 | 不混淆故事人物与随机获得的卡片 |
| I04 | 明确星币、晶核、召唤券、碎片来源及用途 | I03 | 每种资源唯一权威账本、无无主币 |
| I05 | 设计共同事务与旧专项存档迁移 | I04 | 并发、失败回滚、重试、幂等、原档保留方案 |
| I06 | 实现迁移验证与事务边界 | I05 | 旧档、损坏、重复执行、跨标签测试通过 |
| I07 | 连接真实经营奖励与人物成长 | I06 | 一次合法交付触发一次真实奖励 |
| I08 | 连接召唤结算与收藏 | I06 | 保留概率、保底、十连、扣费和重复卡奖励 |
| I09 | 连接装备打造与人物属性 | I07–08 | 真实材料扣除、装备归属和属性计算 |
| I10 | 验证属性与生产或剧情的明确收益 | I09 | 显示值与实际效果一致、没有虚假属性 |
| I11 | 合并人物/经济切片回归 | I10 | 同 SHA 回归、旧档及发布通过 |

### C · 首局完整体验（I11 后）

| ID | 任务 | 前置 | 验收 |
| --- | --- | --- | --- |
| C01 | 定义首局唯一目标 | I11 | 大厅清晰引导且不堆重复按钮 |
| C02 | 新手自动产线 | C01 | 新玩家能安全开启生产 |
| C03 | 自动履约引导 | C02 | 独立选择、不悄悄扣费 |
| C04 | 第一单真实交付与反馈 | C03 | 收益真实且刷新不重复 |
| C05 | 月纱特别委托 | C04 | 按真实期限、库存和结算反馈 |
| C06 | 返回人物房间互动 | C04 | 奖励和人物反应有关联 |
| C07 | 第一次收藏或装备成长 | C06 | 存档持久、下一目标明确 |
| C08 | 首局从空档及旧档完整验证 | C01–07 | 路径可达、能继续玩、无软锁 |

### A · 精品美术与 UI（C08 后）

| ID | 任务 | 前置 | 验收 |
| --- | --- | --- | --- |
| A01 | 月纱身份基准 | C08 | 人工确认脸型、发型与角色设定 |
| A02 | 月纱全身 CG | A01 | 原生尺寸、身份与比例人工签审 |
| A03 | 月纱表情与站姿 | A01 | 独立动作、身份连续 |
| A04 | 月纱房间独立绘景 | A01 | 独立 PC/移动原画和合法热点 |
| A05 | 资源接入与像素验证 | A02–04 | 源图、授权、哈希、实际解码与截图 |
| A06 | 大厅布局复原 | A05 | 对照认可设计，PC 画面、留白和点击 |
| A07 | 私人房间交互与动画 | A05 | 剧情与观景不互相破坏 |
| A08 | 召唤仪式与结果卡 | A05 | 单/十连完整展示、回看与减少动效 |
| A09 | 其余人物逐位身份/CG/动作/房间 | A01–08 | 一人验收后再扩展 |
| A10 | 其他场景逐页原画与 UI 验收 | A06–09 | 每页独立截图、交互真实可达 |

### V · 玩家与发行（A10 后）

| ID | 任务 | 前置 | 验收 |
| --- | --- | --- | --- |
| V01 | 首局观察协议执行 | A10 | 十名独立玩家实际观察 |
| V02 | 按反馈优先修复阻塞 | V01 | 复测证据与未解决项 |
| V03 | 产品六维评分 | V02 | 有实际证据的维度评分；未评不计总分 |
| V04 | 发布门槛与回退核验 | V03 | CI、存档、分支保护、原画审批 |
| V05 | 正式发行决策 | V04 | 85/100 只是拟议内部目标，不替代真实验收 |

### 本轮 U01–03 取证

候选 `826dd0f` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931032664) 失败；[checks 日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931032664/job/140283445970) 明确 TS6133（公寓未用 Link）及 TS2305（欢迎页仍导入已删除 cozyStorage）。Pixi 作业成功，静态导出因同一缺失导出失败；[Desktop](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931032781)、[Pixel](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931032667)、[Gameplay](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931032641) 因 WebServer 无法编译而超时，未真正验收玩法/视觉。修复旧导入、未用导入及导航文案，不恢复旧引擎。新增欢迎页旧档保护及剧情继续的 E2E。新提交待 CI，暂不判通过；下一唯一项 U04：核对新 SHA 的 Quality 和残余引用，不绕过测试。历史73分不变，新产品未评，正式发行暂缓。

## R14.1-U · 单一经营体系切换（候选，最高优先）

2026-11-27 · U05 代码候选：基于 `c25d9f1`（U04 原代码 SHA `bf806e0` 已验收）；逐一核对 19 份 CSS、现行公寓/房门/研究组件、main 已退役抽屉与旧房门实现及相关 E2E，删除四份目标 CSS 中旧抽屉、旧告警/救援、旧反馈、旧装载、旧居民/按压状态和其专属动画，收窄共享选择器及修正过时注释。保留当前四人房门、共享故事、绘景、研究模式、有效焦点和减弱动效；未改运行 TS/TSX、资源、存档、路由、数值或测试。现有 `audit:engine-paths` 从 U05 延后报告改为退役表现标识门禁（历史文档可引用），候选 CI 将执行全仓跟踪文本检查；无法在本地 clone/安装/运行浏览器，不能宣称本轮全仓动态覆盖或视觉已验收。保留有效的真实行为测试，不为通过而删测试。仅候选，待同 SHA Quality、Desktop、Pixel、Gameplay full 及双端证据；U05 未通过前不进入 U06。PR #65 保持 Draft，不合并、不发布、不重评。

2026-11-27 · U04 验收收口：候选 [bf806e0](https://github.com/kunlong-luo/monster-apartment/commit/bf806e0770777ed5b28b37170e9e67864c2cef8f) 四项同 SHA workflow 均成功。[Quality checks 原始日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45953564313/job/140354748866) 确认 TypeScript、Lint、63 文件/301 Vitest、组件审计 329 文件/91 组件及样式全部可达、0 未解析本地引用和未知动态导入、0 旧引擎路径及住房专项违规；静态导出和 Pixi job 成功。住房专项实际扫描 577 个跟踪文本，报告 runtime 1（公寓只读原始键声明）、tests 3（保护/回归）、docs 19、tooling/internal 0，另有四份 U05 CSS：gothic-apartment.css 21/33/34/46；gothic-desktop-ui.css 204/209/210/215/218；gothic-polish.css 112/113/116/118/119/158；gothic-red-gold.css 80/89/93/99（均为 bf806e0 行号，U05 重新核对）。[完整玩法原始日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45953564371/job/140354851637) 198 passed、3 skipped、0 flaky、0 failed；[桌面原始日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45953564302/job/140354887612) 月纱直链 --retries=0 通过、图鉴/房间四项定向回归通过，手机/研究场景相关步骤成功；[像素](https://github.com/kunlong-luo/monster-apartment/actions/runs/45953564292) 成功。U04 通过；U13 前置现已满足，按既有专项与本轮回归同步为通过，不重复实施。3 跳过项未逐项归因，未人工阅图，已知名称文本门禁不证明任意字符串拼接或所有 CSS 覆盖，相关视觉及发布门禁仍独立。仅提交验收文档，不改生产代码；文档新 SHA 的 CI 另查，不以 bf806e0 结果冒充新 SHA。下一唯一任务 U05：在新会话核验最新候选和前置后，逐选择器清理四份 CSS 的死规则，保留活跃场景与研究样式。每个原子任务验收、更新台账及 PR 后生成下一会话完整研发命令；当前任务未验收不得切换。由用户开启新会话，不宣称后台跨会话执行。PR #65 保持 Draft，不合并、不发布；历史综合评分不变，R14 产品未评。

2026-11-27 · U04 残留引用清理候选：基线 [c318085](https://github.com/kunlong-luo/monster-apartment/commit/c3180858370857f62463268780a25a10d62c8da0) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45953008719) 三个 job 成功，63 文件、301 Vitest、329 审计文件、91/91 组件样式可达、0 不可达/未解析/未知动态导入、0 旧引擎路径违规；[像素](https://github.com/kunlong-luo/monster-apartment/actions/runs/45953008690) 成功，核查时桌面与完整玩法仍运行。前序 dbf7d52 的 U13 专项复验为 198 passed、3 skipped、0 flaky；U01–03 回读欢迎页、存档保护测试、导航及最新类型检查。完整 Git 树 841 条（未截断），PR 已删除 cozy-engine、cozy-save-transaction、gothic-room-drawer 及两份旧单测；不重复删除。此次删除共享 GothicResourcePill 中已退出玩家路径的幸福度/入住图标分支，不动有效资源、经营规则或存档。现有 audit:engine-paths 增加 Git 跟踪文本的旧住房文件/符号/旧键检查及历史/测试/U05 CSS 分类报告，允许公寓现有只读原始键声明，不扩大兼容层。已确认 gothic-apartment.css、gothic-red-gold.css 存在 ga-room-drawer/ga-warning 定义，U05 再逐条核查，保留场景/研究 CSS 和原画。修正现行架构旧技术债。未能在本地检出仓库运行依赖工具，使用新候选 CI 完成实际全仓检查；新 SHA 尚未验证，不将旧 CI 冒充本轮验收。审计为已知路径/符号的文本门禁，不能证明任意动态拼接或 CSS 覆盖；新 CI 报告与必要浏览器回归待核。U04 保持候选，U05 不开始；PR #65 保持 Draft，不合并、不发布、不重评产品。

2026-11-27 · U13 失败复验结论：候选 [dbf7d52](https://github.com/kunlong-luo/monster-apartment/commit/dbf7d521f61748d1826449da9bfa2c2805985963) 的四项 PR workflow 均核对 head_sha 一致、attempt 1、success。[完整玩法原始日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45935518799/job/140297714131) 为 198 passed、3 skipped、0 flaky、0 failed；[桌面专项日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45935518839/job/140297714596) 中月纱深链接以 --retries=0 首次通过（1 passed），人物图鉴的房间入口/历史回退等四项定向测试通过，桌面与手机相关步骤通过。[Quality 原始日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45935518778/job/140297714323) 为 63 文件、301 Vitest 通过、0 不可达模块、0 未解析本地引用；静态导出及 Pixi 作业成功。[像素工作流](https://github.com/kunlong-luo/monster-apartment/actions/runs/45935518770) 成功。回读 playwright.config.ts、e2e/gothic-apartment.spec.ts 和 e2e/character-collection.spec.ts：CI failOnFlakyTests 生效，月纱仍保留真实焦点、共享余额、外部 History、Back、关闭及审稿参数断言；公寓四门链接和人物图鉴泉泡/青枝/炽角实际打开覆盖保留。本次消除 U13 已观察到的 flaky 验收阻塞，不声称已经独立复现生产根因或证明永不 flaky；3 项跳过未逐项归因，截图未人工审阅。U13 专项证据通过，但 U04 前置尚未穷尽残留引用，队列暂记候选；U15 回到待办，U14 前置尚未完成。完整 Git 树未截断且已退役住房文件名未见匹配，但未逐文件扫描动态引用，不代替 U04。仅提交本台账的验收记录，不为重复实现修改生产代码或测试，不恢复旧住房、不新增目录/依赖。该证据绑定 dbf7d52，文档新 SHA 的 CI 另核。PR #65 继续 Draft，不合并不发布；下一唯一任务 U04（先确认 U01–03 证据，再完成残余引用审计和必要清理），不提前进入 U05 或新功能。历史73/100不变，新产品未评分。

2026-11-27 · U13 验收阻塞修复候选：PR [#65](https://github.com/kunlong-luo/monster-apartment/pull/65) 在 [00a08d0](https://github.com/kunlong-luo/monster-apartment/commit/00a08d032848fc99f558bcc7b335469ed7affd20) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931982731)、[桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931982729)、[像素](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931982726) 均成功，63 个 Vitest 文件、301 项通过，组件审计 0 不可达、0 未解析。[完整玩法原始日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45931982721/job/140286457501) 实为 197 passed、1 flaky、3 skipped；月纱直链测试第 93 行首次执行在外部 pushState 后仍存在私人房间，重试通过，不视为 U13/U15 验收。怀疑 SSR 可见早于客户端 History API 桥接就绪，尚未独立复现根因。本轮在现有 E2E 中等待弹窗真实焦点和共享经营余额加载后才调用 History API，增加 URL 断言，保留原有关闭、后退、查询参数及其他测试断言；Playwright CI 启用 failOnFlakyTests，保留重试诊断但不允许绿色掩盖 flaky。未修改生产路由、存档、经济、资源或依赖。本修复 SHA 尚无新浏览器验证；下一唯一项：核对同 SHA CI 与原始日志，确认 U13 无 flaky 后返回 U04 残留引用，U05–U16 按前置顺序推进。PR 保持 Draft，不合并，不发布。全仓引用仍未穷尽。main [9e683cf](https://github.com/kunlong-luo/monster-apartment/commit/9e683cfc56e62c05a96a37574df4311b1b53b580) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45809152014) 和 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45809315642) 已成功；未重新评分。


用户明确要求不再保留两套游戏。公寓候选不再启动 Cozy V1 两秒时钟、租金、房屋建造/装饰/搬迁/救援经济，直接订阅现行工坊 Zustand/同一持久化快照的天数、星币、晶核和已交付单数；四个正式人物房间真实入口与月纱剧情保留。六门研究原图仅作独立几何命中检查，不再调用旧住房游戏。旧原始 localStorage 记录不写、不删、不兑换，提供只读导出；当前未设兑换比例，旧住房资产不再可玩，不能称旧资产已迁移。角色剧情/收藏专项存档不是另一套经营余额，仍保留，后续合并需完整事务与迁移设计。

本候选未运行浏览器或 CI；不能合并/发行，需核对全部引用、同步旧功能测试到统一产品合同、验证跨页及跨标签页同一经济、旧原始字节保持、四房实际入口、研究工具隔离及原有存档恢复。只在这些验收通过后称经营统一上线。不新增依赖或路由，不另建文档。候选删除旧住房引擎、事务写入器、房屋操作抽屉及仅验证已退役规则的两份单测；替换旧住房 E2E 为共享经济、跨标签页、存档保护、四房可达及研究隔离，保留其他经营与剧情回归。全仓引用枚举因接口批量限制未完成，不能声称零残留。下一项：核验完整 Quality、桌面/手机与完整玩法，修复任何残留引用、文档链接及测试问题，再合并。

## R14.0 / R14.1-A · 产品重制与月纱首局衔接（同一候选）

用户确认重新设计产品，现行路线和评分见 [PRODUCT](../../PRODUCT.md#r14-产品重制路线现行方向)。以 [9e683cf](https://github.com/kunlong-luo/monster-apartment/commit/9e683cfc56e62c05a96a37574df4311b1b53b580) 为本轮候选基线；当前提交状态接口未返回检查项，不能确认本基线最新 Pages/完整浏览器结果。暂停没有真实缺陷的目录/文档治理与批量内容扩张；R13 未解决的发布阻塞、美术人审、分支保护、布局问题仍保留，不直接关闭。

复现（源码）：大厅 GothicLobby 的月纱交谈只区分特别委托 offered 和其他，普通首单完成、特别委托完成后仍可能要求先交付第一批。候选修复：复用 workshop-guidance 的真实存档状态，在原有对话和唯一下一步链接中区别缺晶核、备齐、已交首单、特别委托待接受/进行中/已完成/失败；将玩家导向既有工坊、委托或月纱房间。没有新奖励、解锁、存档字段、资产、路由、依赖或概率变动。新增三个定向 Vitest 用例；本轮尚未运行，待候选 SHA Quality、桌面/手机普通点击与完整玩法验证，不宣称上线。验收需真实首单结算前后再次交谈、核对奖励、特别委托接受及结束、房间实际可达、刷新状态一致；月纱向导不是保证召唤获得人物。真实试玩与正式美术仍未完成。

旧综合73/100仅历史基线，新产品评分待独立人工证据，不给分；正式商业发行仍暂缓。下一唯一项：核对候选 CI、发布基线与真实首局全链（包括旧档和自动履约），按复现修正阻塞，之后完成奖励→人物互动的真实因果切片，再推进原画。不凭文案修复宣称整个 R14.1 完成。

## R13.1-J · 新美术收件与发布收口（历史记录）

上一轮 9c5aea9 同 SHA [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45746624328)、[桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45746624262)、[玩法](https://github.com/kunlong-luo/monster-apartment/actions/runs/45746624275)、[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45746721073) 全部成功。随后 3174568 新增五项媒体及召唤组件；[Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45750825010) 在媒体目录审计失败，仅缺 S02 desktop-candidate-v2.png 行，实际146项/165666116 B、0意外重复；静态导出/Pixi通过，[玩法](https://github.com/kunlong-luo/monster-apartment/actions/runs/45750825015) 成功，桌面取消，Pages跳过。本轮不覆盖新增资源；核对完整 Git tree 与库存146行，补全源图清单/资源目录与汇总，S02同历史 blob 的1672×941原图为rework，新增字节/尺寸/哈希测试；两张清洁CG候选实际登记，但未经人审，五卡均portrait生产状态，四人G1 0/4。更新PRODUCT/SOP/场景准入与索引。此轮不改运行样式、经济、存档、原画；先恢复发布门禁，公寓布局与全站Tooltip验收顺延，不能称7/7布局完成。已上线基线73/100，免费Alpha可继续；最新提交需同SHA Quality/Pages，正式商业发行仍缺人审、独立场景、真人样本、主线保护。下一步核对新SHA发布与桌面再完成公寓及提示治理。

## R13.1-I · 图鉴空间减负与首页回归校准（历史记录）

上一 SHA 80a035c [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45746246261)、[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45746348755) 成功；[桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45746245979) 失败在 r12-lobby-mobile-art-clearance:52，旧PC召唤卡≥200px与R13.1-H主动缩短为176px冲突；手机路径已运行至PC断言，不能宣称整项通过。玩法45746245983核查时运行中。保留160–180px双边界并验证内容不溢出、真实链接命中，保留其余手机与导航检查；尚需实际重跑。图鉴维持 A05 五卡骨架，常规PC边距24、列距16、卡距14、右栏27%，属性14px/专长12px、核心动作44px，装备槽迁至养成、介绍保留详情，图鉴资源提示向下向内。真实经济、存档、卡面源图不变。修改现有 A05 真实交互测试以覆盖新标签位置与几何；新 SHA 待 Quality/Pages/桌面及实机验证。评分73/100为已部署基线，免费公开Alpha可用，正式商业发行未达标，主线未保护、0/5生产CG、独立场景及十名真人试玩仍未完成。下一轮优先核对首页/图鉴与此前工坊、委托仓库、月光街回归，再公寓及全站提示治理。

## R13.1-H · 首页侧栏与提示可读性（历史记录）

用户反馈首页左右侧栏太高、拥挤，Tooltip 不可见。上一 SHA 45f3745 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45745869142) 成功，Pages 45745970280、桌面 45745868918、玩法 45745868922 核查时运行中。本轮优先首页：保留既定四人纵列、中央绘景、右召唤/两海报/剧情与角落导航；压缩桌面活动高度224→176px（短屏154px），去重复人物条和装饰诗句，左右留白/卡距调整，辅助文字12px；顶部 Tooltip 明确向下、右侧向内对齐、13px可换行、提高顶栏层级但低于弹窗。仅改变首页样式与文案，不改玩法、存档、路由、原画。追加四视口真实浏览器边界/hover/focus/截图检查；本 SHA 未验证。评分维持73/100；当前已部署免费试玩可继续，正式商业发行暂缓。下一轮先收口新旧 CI 与实机，再推进人物图鉴，不把新代码当作已上线。

## R13.1-G · 修复 Quality 与月光街空间减负（历史记录）

上一 SHA e71b02b 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45745672800) 失败：63/64 测试文件、331/332 测试通过；唯一失败为 typescript-tailwind-migration 的库存与世界操作布局边界（job 139660993943）。TypeScript、Lint、设计、静态导出及 Pixi 均通过；未发布。前一轮工坊桌面/玩法被后续推送取消，不能视为通过。本轮将仓库网格和库存行恢复 Tailwind 组件所有权，保留原测试、删除新增 mw-stock CSS，委托操作链接恢复原 Tailwind 结构；未修改测试门槛。月光街桌面宽440–600px、24px 内边距、16px 内容间距、260–300px 街景、132×192px 最小向导、18px 居民面板、44px 交易按钮；去重复英文眉题，真实交易与引擎不变。既有桌面测试追加月光街几何、原图解码、交易可达性和PC/手机截图；新 SHA 未验证，先恢复 Quality/Pages，再查桌面结果，避免持续取消。73/100 是上次验证基线；最新主线暂不具备发布条件，线上旧 Alpha 可试玩，正式商业发行暂缓。下一阶段先收口视觉检查，再图鉴；原画、真人验证、分支保护仍缺失。

## R13.1-F · 委托所/仓库空间减负（历史记录）

上一 SHA 5d39355 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45745307306) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45745393784) 已成功；桌面 45745307194、玩法 45745307322 核查时运行中。本轮在委托所/仓库保留场景与单一右侧操作区，PC 宽度 440–600px、面板间距 16px/内边距 20px、正文 14px、核心操作 44px；委托两列交期/奖励与前置工坊/仓库入口，仓库共享晶核突出、水汽孢子并列、缺口优先；移除重复眉题并压缩未获原画的中性横幅。所有价格、手动风险、采购资格、原画审稿与原存档不变。现有桌面场景 E2E 增加 1440×900 和 390×844 几何、可达动作与截图验收；尚无本 SHA 实机证据，仍为 73/100、可免费 Alpha、正式商业发行暂缓。下一轮优先核验桌面结果，再推进月光街；独立高清原画、真人试玩及分支保护仍未完成。

## R13.1-E · 桌面空间减负与发行资格（历史记录）

PR #63 已合并为 [8e5041f](https://github.com/kunlong-luo/monster-apartment/commit/8e5041f2437a734a3d71e149ee897e45b5c174ae)，该 SHA [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45744157784)、[桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45744157821)、[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45744277695) 成功，完整玩法 45744157688 核查仍运行中；主线未保护。旧验证分支尚未删除。用户指出布局紧凑，源码确认工坊旧全局 desktop CSS 重复硬编码控制台高度与旧 90px dock 预留；本轮删除这两组旧几何，保留工坊唯一几何变量，PC 展开面板间距/内边距 16px、外边距 24–32px、核心按钮最小 44px、工匠头像 52px、姓名 13px、卡片最小高度 144px 并移除旧绝对定位状态覆盖；默认 64px 场景优先栏、移动布局、真实引擎、存档与原画不变。现行 DESIGN 新增全站设计目标，非全站已完成。扩展既有 Playwright 真实几何断言与截图路径，尚未取得新 SHA 实机证据。评分维持 73/100（17/20 架构、19/20 文档资源、15/20 功能、10/20 视觉、12/15 验证、0/5 真人），公开免费 Alpha 可运行；正式商业发行需美术、玩法、真人和发布治理，85 分为内部目标非充分条件。下一切片先核验本轮布局，随后委托所/仓库密度，再月光街、图鉴及其他场景。

## R13.1-D · 跨场景履约口径与发布验收（历史记录）

上一提交 74781eb 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45743630726) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45743740622) 同 SHA 成功；玩法 45743630713 运行中，前一轮玩法 45743359766 已取消，不能视为成功。PR #63 Quality/桌面成功，完整玩法 45742258647 核查时仍运行中，未合并。本轮将 workshopCalendarStatus 用于工坊目标、委托所、仓库：明确手动轮班、仅自动生产、自动履约及到期共享库存缺口；原手动预测显式标注手动结算，不再暗示自动缺货扣罚。委托所展示真实累计交付，工坊月纱奖励读实际订单、采购禁用复用引擎、库存进度 ARIA 不越界。新增两项定向测试；未改经济、存档键、概率、原画或布局系统。新 SHA CI 与真实视口验证待完成。综合维持 73/100，免费 Alpha 可继续，正式商业发行暂缓；须完成独立高清美术、完整玩法、真实玩家及分支治理。下一轮优先收口 PR #63，不在完整回归未完成时宣称合并；经营与人物收藏仍使用各自账本，跨场景状态展示不等于账本统一。

## R13.1-C · 经营成长目标与共享库存反馈（历史记录）

上一提交 8a337f0 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45743360015) 已通过；核查时 Pages 45743474739 与玩法 45743359766 尚未完成。PR #63 的 Quality/桌面成功，完整玩法仍运行中，未合并。本轮复用真实 machineUpgradeQuote / workshopRank，在月纱既有对话中反馈首单后可购买的升级、费用/资金不足和下一等级目标；优先有工匠且可负担的熔炉，不承诺收益、不自动购买、不变更经济规则。自动履约与提示共用 autoContractShortage，修复普通订单库存足够而同时到期月纱特单缺货时仍显示可推进的问题；同时修正自动生产已开启但未开履约的选择说明。三项定向测试覆盖首单升级解锁/费用、共享库存缺货与未来特单不阻塞。新 SHA 待 CI、发布及实机；无新美术与真人样本，评分 73/100，免费 Alpha 可继续，正式发行暂缓。下一阶段优先完成 PR #63 回归及发布，核对真实工坊/委托反馈与跨场景经营目标；不新增存档字段。

## R13.1-B · 首单结算反馈（历史记录）

上一主线 e3ece48 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742748433) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742856178) 已成功。PR #63 候选 7eb469c 的 Quality 45742258649、Desktop 45742258663 已成功；完整玩法 45742258647 核查时运行中，未合并。本轮发现真实展示缺口：自动履约结算增加 completed 与 coins，但保留 last 手动报告，因此首单自动交付后可能仍显示欢迎语、日志缺少已交付结果。本轮在现有只读对话及日志中使用真实 completed、当前订单与 patron 数据，显示累计成果、下一单需求/日期和月纱私人委托入口提示；不虚构自动结算金额、时间或手动轮班，不更改规则、概率、保存键或资源。新增三项真实引擎路径测试（自动首单、缺货未交付、旧手动失败与后来自动成功），待本提交 Quality。无新画面截图及真实玩家数据，综合 73/100，仍仅建议免费 Alpha，暂缓正式商业发行。下一轮核验新 SHA、PR #63 全量回归及安全合并，再继续真实首单体验和独立原画。

## R13.1-A · 上线资格评估与首轮公开试玩（历史基线）

2026-11-26 实际核验：主线 [e1aa356](https://github.com/kunlong-luo/monster-apartment/commit/e1aa356cf5940ed32e3ea80e18325adffc9d795a) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742227852) 三作业与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742328737) 成功；release.json 仍 V3.109.0。PR #63 已同步主线，候选 7eb469c 仅 CSS 与架构记录差异，核查时 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742258649) 成功，[桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742258663) 与 [完整玩法](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742258647) 运行中；未合并，不影响此前已发布基线。GitHub API 确认 main protected=false，#9/#10/#16/#24/#25 均 open。

**发布定位建议：可公开免费 Alpha/试玩，暂不作为正式商业发行，不大规模推广或开启付费抽卡。** 这是产品风险判断，不是外部认证或已更改游戏版本/商业策略。综合 **73/100** 不变（17/20 架构，19/20 文档资源，15/20 功能存档，10/20 UI视觉，12/15 验证发布，0/5 真人反馈）；85/100 是内部正式发行目标而非充分条件。

| 门槛 | 当前证据 | 正式发行前建议验收 |
| --- | --- | --- |
| 基础部署与稳定 | Quality/Pages 同 SHA 成功；PR 新视觉/玩法待验 | 冻结功能 SHA 的 Quality、桌面、完整玩法及 Pages 成功；无阻断性崩溃、丢档、结算错误 |
| 真实美术 | G1 0/4，正式 CG 0/5，独立 S02/S05/S06 正式 0/3，私室正式背景及角色层 0/4，欢迎正式 0/2 | 优先四人身份、五卡、关键 PC/手机独立场景及角色层具名签审；实际视口像素与交互验收，不用候选代替正式 |
| 核心循环 | 有首条产线、自动生产/独立自动履约；长循环与下一目标未获玩家验证 | 首单→真实奖励→人物契约/剧情→下一目标，保存、刷新、回到场景与继续经营全链路可验证 |
| 玩家验证 | #10 open，无独立样本 | 复用十人协议，PC/手机覆盖、匿名真实记录、三大卡点修复复测；不以重玩意愿当留存 |
| 发布治理与商业化 | #9 open，main 未保护；未验证收费、服务条款及发行合规 | 管理员真实 required checks/PR 规则，发布与回退方案；如计划商业化，另行评估数据隐私、消费与平台合规及支付安全 |

建议下一轮并行：邀请 10 名首次接触玩家（PC 5/手机 5），现有 [匿名记录页](https://kunlong-luo.github.io/monster-apartment/research/first-session/) 与 [观察协议](../research/2026-11-13-r113-first-session-protocol.md) 已可用；首单操作路径先以观察为依据，不增虚假任务或奖励。内部初轮目标建议 8/10 自主找到工坊、在具备观察机会者中 ≥80% 自主开启两项独立自动操作；首单完成率按足够等待时间分母报告，不编造成功率；这些是建议目标，不是已经实现或统计显著结论。艺术生产继续依赖真实正面参照、S02 独立原画与签审；本轮无新画面/真人结果，不加分。历史 R13.0-G 记录保留，现行发布判断以本节为准。

## R13.0-G · 历史发布基线、评分与执行优先级

2026-11-26 核验 [90b4959](https://github.com/kunlong-luo/monster-apartment/commit/90b495912bd103831af9facfa36662bb1ca68716) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45619281666) 三作业与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45619429730) 成功，25 项 G1/CG 专项测试已纳入并通过该 Quality。已完成审核草稿、身份绑定和 CG 晋级/失败回滚技术闭环，但没有真实原画签审。PR #63 的原 CSS 候选三项 CI 成功；共同祖先与当前主线 CSS 原 blob 相同，准备复用现有验证分支同步主线，不再因旧文档冲突推迟；同步后的新 SHA 需独立验收，不能沿用旧 CI 宣称合并。当前树 141 媒体，四张新版侧脸与四份 G1 approval.json 均不存在。

综合评分仍 **73/100**（架构 17/20、文档资源 19/20、功能存档 15/20、UI 视觉 10/20、验证发布 12/15、真人反馈 0/5）；85 是目标，不为新增审核工具单独加分。现行优先级：

| 优先 | 交付与判定 |
| --- | --- |
| P0 ART-01 | 四人真实正面参照、四张独立原生侧脸、四份具名 G1 证据；泉泡/炽角 CG 返工，月纱两卡/青枝 CG 先审。见 [角色 SOP](../CHARACTER-CREATION-SOP.md)，不无参照生成新脸。 |
| P0 VIS-01/VIS-02 | PC 优先 S02 独立高分辨率原画与独立手机构图，再 S05/S06；真实热点、HUD、人审。 |
| P0 UX-01 | 并行执行真实独立玩家首单观察；无样本不得宣称留存改善。 |
| P1 产品经营闭环 | 首单→自动履约→奖励→契约/剧情→下一目标，逐段核对真实玩家路径；保存键、抽卡概率不变。 |
| P0 GOV-01 / QA-01 | PR #63 新 SHA 验收/合并、同 SHA Pages；分支保护配置须管理员实际设置并读回。 |

停止无真实问题的工具扩张及重复目录清理；下一轮优先实际原画交付或玩家可见经营切片，不再把技术准备标成视觉完成。

## R12.108 · 历史评分与执行优先级

8ac89d7 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45611878515)、[桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45611878567)、[完整玩法](https://github.com/kunlong-luo/monster-apartment/actions/runs/45611878531)、[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45612035406) 全部成功。PR #62 候选 3529ac9 的 Quality 45612055891、像素 45612055884、桌面 45612056041、玩法 45612055914 均成功，已合并 main 083699c；同 SHA Pages 尚未确认。

正式基线 73/100（架构 17/20、文档与资源 19/20、功能与存档 15/20、UI 与视觉 10/20、验证发布 12/15、真人反馈 0/5）。资源维 +1：公开历史三 PNG 隔离、稳定人物/场景路径、141 项库存及唯一重复例外、Quality 和 Pages 同 SHA 成功；其他维不变，未取得新原画人审/真人试玩、长循环证据或保护配置。85/100 仍是目标。优先完成 PR #62 发布与最后一批 CSS 候选验收，之后转入 R13.0 身份基准、独立绘景、经营首单到下一目标闭环及真人反馈，不继续以目录整理代替玩家价值。本段为历史评分；当前任务以 R13.0-G 为准。

## R12.91 · 2026-11-25 综合复审（历史优先级）

审查基线 [ef5aa5b](https://github.com/kunlong-luo/monster-apartment/commit/ef5aa5bc01c2d54d52ab7a666ebe3dcafaff7132)： [Quality checks](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556789291/job/139010655591) 和 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556888621) 成功，Quality 三作业成功。实际日志 64 个 Vitest 文件/321 测试全通过，333 文件/11 app 根/92 组件及样式模块全部可达，未解析及不可达均为 0；185 Markdown、16 必需入口、580 条匹配相对链接、0 违规；144 媒体、156696945 B、0 库存偏差、0 未登记重复；[静态导出](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556789291/job/139010655224) 七路由 23 个 SSR 图片 URL 可解析。V3.109.0 功能基线 80eb69a 四项工作流成功；后续 CSS 修改 be66775 的 Quality/Pages 成功， [桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556397863) 和 [玩法](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556397722) 核查时仍运行，不视为新视觉验收。本轮不重新截屏、不进行真人试玩、不改变版本。

评分是本轮证据约束的工程/产品判断，非客观质量仪器，也不是玩家评分。缺证据不给满分；85 是目标而非当前结论。

| 维度 | 分数 | 扣分与依据 |
| --- | ---: | --- |
| 工程架构 | 17/20 | 规则分层、七路由、组件可达与静态构建通过；-3：工坊舞台/公寓规则与大型 CSS 仍有拆分和覆盖审查风险，未全量证明导出/动态类使用 |
| 文档与资源 | 18/20 | 185 份文档、144 资源库存对账、10 工作流；-2：历史内容时效、三份公开设计 PNG、动态资源引用和来源工作流库存联动仍待治理 |
| 功能与存档 | 15/20 | 已发布自动生产、招募、私室与需求反馈，321 测试及旧功能 SHA 完整工作流；-5：双独立账本、经营长循环与跨场景闭环尚未全部验证 |
| UI 与视觉 | 10/20 | 已有角落地图、四房观景、PC 过渡绘景；-10：五卡 portrait（0/5 production），三独立场景 review（0/3 production），四房正式背景和人物层均 concept，#16/#24/#25 开放且本轮没有新截图人审 |
| 验证与发布 | 12/15 | 最新 Quality/Pages 成功，前功能基线四项通过；-3：main protected:false、后续 CSS 视觉/玩法未完成回读，不将旧 SHA 等同当前 |
| 真实玩家反馈 | 0/5 | #10 仍 open；docs/research 仅协议和空白 CSV 模板，未取得独立玩家有效记录 |
| **合计** | **72/100** | 证据约束暂定评分；距 85 尚差 13 分 |

工程与文档合计 35/40；其余 37/60。继续减少历史文件不应代替真实玩家价值。现行任务只在本台账与 Issues 管理；以下优先级覆盖旧历史轮次顺序。

| 优先级 / 下一切片 | 交付及验收 |
| --- | --- |
| P0 R12.92（QA-01/UI-01） | 回读 be66775 两条浏览器结果、失败日志与截图；如失败先修最小根因并重验；核对实际顶角地图/焦点/PC 与手机画面；本轮没有实际截图复审，不提前关 #25 |
| P0 GOV-01 | 管理员配置真实 main required checks、PR 规则及高风险验收，读回验证；#9 保持 open，不能用文档或 CI 替代 |
| P0 UX-01（与视觉准备并行） | 按十人协议招募独立玩家；真实首单/求助/重玩记录和三大卡点，#10 保持 open；无样本不得宣布留存改善 |
| P0 VIS-01/VIS-02/ART-01 | PC 优先独立 S02/S05/S06 绘景与人审，S01/欢迎和 G1 身份按现行视觉合同依赖顺序推进；PC 3840×2160、手机独立 1080×1920 为目标生产门槛，按现行准入；CG 原生 ≥1086×1448 加身份/武器/具名人审；保留 review/portrait 状态直到实物合格 |
| P1 功能闭环 | 先验证首单→自动履约→契约/角色故事→下一目标，优先改善真实阻塞原因与奖励反馈；账本统一单独设计、迁移与回滚验证，禁止擅自清除存档 |
| P1 ENG-02/DOC-01 | 按证据处理工坊约 49.8 KB CSS、40.7 KB 舞台、34.0 KB 公寓引擎的职责；三张 public 参考 PNG（9.16 MB）隔离前检查引用；旧来源工作流同步库存门禁，保留原图与历史证据 |

达到 85 需要真实补齐视觉、玩法及验证/玩家证据，再用同口径重新评分；不承诺固定分数增长。历史台账以下内容保留当时事实。

## P0：历史初始缺口（现行以 R12.91 为准）

| ID | 缺口 / 事实依据 | 建议最小行动与关闭条件 | 状态 |
| --- | --- | --- | --- |
| GOV-01 | [Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9)：`branches/main` 于本轮查询仍为 `protected:false`；仓库 CI 文件不能替代保护规则 | 管理员配置实际 PR/required checks，并读回验证 `protected:true` 与具体 job；在此之前禁止宣称主分支治理完成 | **未完成，需管理员** |
| VIS-01 | [Issue #24](https://github.com/kunlong-luo/monster-apartment/issues/24)：全屏图仍有模糊反馈；仅凭 WebP 扩展名/分辨率不能判定清晰度 | 四种视口记录图片真实解码、DPR、裁切、回退和前后截图；修掉可复现的 P0 模糊 | **R12.72 首批修正图鉴 DPR 变化；其他全屏图仍待实机复核** |
| VIS-02 | [Issue #16](https://github.com/kunlong-luo/monster-apartment/issues/16)：独立场景与人物分层交付尚未有全量正式美术验收证据 | 优先补有独立设计的首页/公寓/委托/仓库场景；按 R12 审稿清单真实晋级而非复用背景换色 | **待美术交付/人审** |
| ART-01 | `public/art/characters/cg-manifest.json` 五张卡截至本轮读取**均为 `portrait`**（月纱两卡、泉泡/青枝/炽角各一） | 每卡核对独立原生图、身份和武器人体、许可、三视口；有真实签署再晋级，不能更改卡池概率或玩家存档 | **0/5 正式 CG（按清单）** |
| DOC-01 | V0.x 旧规划与技术记录、ADR 混有 Vite/Phaser/V0.1 记录（见[固定快照](https://github.com/kunlong-luo/monster-apartment/tree/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs)） | 本轮标记历史版本，建立 [文档入口](../README.md)、现行 [工作手册](ITERATION-PLAYBOOK.md) 和 ADR 被替代关系；后续文档审核继续更新 | **R12.74 已退役 management；R12.81 退役六份早期 Markdown，仍需整理剩余设计/资源文档** |

## P1：紧随其后

| ID | 缺口 / 风险 | 下一行动 / 验收条件 | 状态 |
| --- | --- | --- | --- |
| UX-01 | [Issue #10](https://github.com/kunlong-luo/monster-apartment/issues/10)：尚无经验证的 10 名独立首次玩家记录 | 按 [首次玩家协议](../research/2026-11-13-r113-first-session-protocol.md) 观察真实 15–20 分钟流程，定量记录 3 个主要卡点；不可用 E2E 替代 | 待真实玩家 |
| UI-01 | [R12 导航](../design/R12-01-LOBBY-NAVIGATION-REDESIGN.md) 中一些“待实施”措辞与 [R12 总计划](../design/R12-00-VISUAL-REBUILD-PLAN.md) 的“已合并部分代码”可能不同步 | 以现行路由与截图复核：七路由两步可达、PC 中央人物不被遮挡、手机不重复导航；只更新已证实的状态 | 待复核 |
| ENG-01 | `bun.lock` 和 `pnpm-lock.yaml` 均在 Git Tree；CI 文案声称未跟踪 pnpm lock，可能已有时效差异 | 核对哪些文件被实际安装器读取、是否误导；不经复现不要删除 lockfile 或更换构建工具 | R12.71 已核对三份锁的独立职责，保留 |
| ENG-02 | `docs/CURRENT_ARCHITECTURE.md` 仍有按轮次叠加的长期说明，难以一眼判断“当前/曾经” | 后续把运行时架构简图与历史升级日志分开；不得因为拆文档误删 `engine` Pixi sidecar | 待整理 |
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

## 2026-11-22 美术资产全量重制审计（R12.7）

- 基线 `551008d` 的 Git Tree 共 **86 个 png/webp/avif/jpg/svg 文件**（包含文档与设计参考，不是 86 张正式图）；重新检查了实际 WebP/AVIF/SVG 像素、角色候选与动作研究稿的可见画面、各场景/私室/工坊资产清单及运行时回退。
- 关键待办：**5/5 角色卡候选动作与已定武器/站姿冲突、0/5 CG production**；S02/S05/S06 **0/3 双端场景晋级**；4 间私室 **0/4 正式背景、0/4 正式人物层（缺 16 姿态）**；工坊 9 张设备 512px 候选 status=review、3 套动态帧和 3 个透明工人仍缺。另发现 `.aistudio` 与 `public/assets/aistudio` 的 3 对 SHA 完全重复的参考 PNG。均**未**在本轮改成 ready / production。
- 完整事实、当前路径、逐张重做方向、验收门槛与 A0–C 执行次序见 [R12.7 审计](../art-reviews/R12-07-ASSET-REBUILD-AUDIT-2026-11-22.md) 和 [CSV 台账](../art-reviews/R12-07-ASSET-REBUILD-BACKLOG.csv)。新增的是**文档和排期**，不是原画生产、真实浏览器截图、人审签署或者功能变化；#16/#24/#52 保持待办。

## 2026-11-22 S05 新绘景首张样板（仅候选）

- A1 批次新绘一幅与旧大厅不同的**契约大厅横版场景**，包含契约台、红月玫瑰窗和 HUD 安全区；真实源图原生 **1672×941**，WebP 同尺寸，源图与 WebP SHA 已登记，另有 4 张仅用于构图的裁切预览。
- **未完成、未上线**：低于 R12 正式 PC 源尺寸，独立竖版手机原画不存在，没有人工视觉/来源签署、浏览器截图或 Git 资产入库。不要因为有一张图片就关闭 #16/#24。对话 ZIP 可作为制作参考，不应误认为已经进入 `public/art`。
- 详细结果与下一轮真实尺寸/审核要求：[R12.8 S05 审稿](../art-reviews/R12-08-S05-CONTRACT-HALL-REVIEW-2026-11-22.md)；可执行 CSV 的 `ART-S05-D` 保留补画/审批状态。

## 2026-11-22 R12.9 图像来源与入库边界

- 已新生成 **S05 独立手机场景 941×1672** 和 **青枝藤弓拉弓 1086×1448**，并复用 S05 独立桌面 1672×941；每张提供原生 PNG 和未经插值的 WebP，总计 6 个实物文件，SHA 在 [R12.9](../art-reviews/R12-09-ART-PACK-2026-11-22.md) 以及 [资源签名 JSON](../art-reviews/R12-09-REVIEW-ASSETS-2026-11-22.json)。
- 文件已置于对话 ZIP 的**项目相对路径**中，可在仓库根目录解压；当前 GitHub 连接不支持读取并上传本地二进制，**原画尚未进入远端 Git commit，亦未改变线上画面**。本轮提交的只是项目内校验代码、manifest 文档和进度台账。绝不将其标成「CG 正式晋级」「4K 图片已上线」。
- S05 PC 和手机原生像素门槛均未达；青枝通过 1086×1448 像素门槛，但身份/弓弦/权利/浏览器人审仍待办。三个生产状态维持 review / portrait。下一轮优先完成真实素材远端入库及审核，再修正 PC/手机原生尺寸不足。

## 2026-11-22 R12.10 图片真实入库（后续更正）

- 已将 R12.9 的 **三张原生 PNG、三张 WebP 及 JPG 联系表**实际创建为 Git 二进制 blob，并合并到 `main` 的 `art-sources/review/...`、`public/art/world-scenes/review/...`、`public/art/beauty-beasts/characters/fern/review/...` 和 `docs/art-reviews/...`。每个 Git blob SHA 与本地原始字节 SHA 核对相符；不再要求用户手动解压、复制、上传。
- 已将 `availableInGit` 设为 **true**、`productionApproved` 仍为 **false**，并新增 Quality 门禁 `pnpm audit:r12-review-art`，检查真文件长度、SHA-256、像素及资源状态。R12.9 之前“只有聊天附件”陈述属于历史时点，已被本轮更正。
- **不代表正式可用**：S05 PC 1672×941 与手机 941×1672 的原生尺寸不达标；青枝 1086×1448 尺寸通过但身份、武器受力、人审未完成。CG 正式晋级仍 0/5，S05 生产清单仍为 review，线上委托所场景并未替换。

## 2026-11-22 R12.11 S06 晶核仓库独立候选入库

- **ART-S06-D**：真正新绘的晶核仓库横版环境 PNG 1672×941、同尺寸 WebP 387164 bytes，已作为真实 Git 二进制分别写入 `art-sources/review/2026-11-22/warehouse-desktop-v1.png` 与 `public/art/world-scenes/review/2026-11-22/warehouse-desktop-v1.webp`；SHA-256、Git SHA 和准入状态详见 [R12.11](../art-reviews/R12-11-WAREHOUSE-DESKTOP-REVIEW-2026-11-22.md)。
- 不同于 S05 契约大厅，此图具备大量晶核货架、起重轨道、装运台和蓝紫月光，供独立地点美术审稿；**不代表正式 2560×1440 场景已完成**。实际只生成合格的桌面方向图，S06 独立手机版仍为 TODO，不能把误生成的 UI/海报当场景。
- 共享 `R12-09-REVIEW-ASSETS-2026-11-22.json` 新增 ART-S06-D 校验条目，`pnpm audit:r12-review-art` 将强制验证新的 PNG 和 WebP；所有 `productionApproved` 继续 false，正式运行时场景 manifest 无修改。

## 2026-11-23 S02 六门中庭桌面候选（review 入库）

- `ART-S02-D` 本轮新绘一幅左右各 3 扇实体门的 S02 场景，原生 PNG **1672×941** 与同像素 WebP 已真实提交 `art-sources/review/2026-11-23/`、`public/art/world-scenes/review/2026-11-23/`；源图 SHA-256 `5dd2fa1a943064fc9b7996f3329068ba174582f12c746a878defa2b96f7acad5`，WebP `61aa2ad62dac99a8a2d976cb77361bcc1a41dc5e2dd855444f7fe84a46599f31`。纳入 `pnpm audit:r12-review-art` 实物门禁。详情：[R12.13](../art-reviews/R12-13-S02-SIX-DOOR-DESKTOP-REVIEW-2026-11-23.md)。
- **未完成 / 严格禁止误报**：S02 PC 正式源像素至少 **3296×1856**，手机必须独立 1080×1920；这张仅 1672×941。原生手机仍待绘制；无具名人审、无 6 点 `roomHotspots`、无四视口/逐门点击证明，因此没有更新 `r12-scene-manifest.json` production、没有将旧大厅背景替换、没有更改六间房存档。

## 2026-11-23 R12.14 S02 独立手机六门画稿

- `ART-S02-M` 真实原生 PNG **941×1672** 与同尺寸 WebP 已在 Git review 入库，原始 SHA-256 为 `cffd902c4a4c60cabab52d593516459a5f7e54bb46b7657e84c5b8e1cea99a58`；与此前 S02 桌面 1672×941 独立，六门实体从左蔷薇／潮汐／青叶至右火焰／银月／紫晶。
- 提交了**非生产门心坐标草案、390×844 和 390×550 的静态 cover 裁切预览、几何 CI 检查**：理论门心距边 ≥22px 且中心间隔 ≥44px。该证明不是游戏真实浏览器截图、未安装点击热点，不改变 `CozyState` 的房间归属或点击逻辑。
- **仍未完成**：S02 桌面原生 3296×1856 与手机 1080×1920 质量门槛、具名美术/权利审核、PC/手机四视口交互回归和 production 晋级。完整文件哈希与待办在 [R12.14](../art-reviews/R12-14-S02-SIX-DOOR-MOBILE-REVIEW-2026-11-23.md)。

## 2026-11-23 R12.15 首页底部菜单移除

- 用户再次反馈底部菜单抢人物画面、缺游戏质感。代码确认它与左侧角色列表、右侧工坊/月光街海报重复；参考《潮汐守望者》主城“画面主导、系统入口靠角落”的信息层级，不机械复制其底栏。
- 新实现：PC 右上角仅“公寓 + 世界地图”小入口，手机右上角仅 44×44 世界地图，七个真实场景仍两步可达；原全宽底栏删除。单独的 [R12.15 设计决策和验收](../design/R12-15-LOBBY-CORNER-WORLD-ATLAS-2026-11-23.md) 取代 R12.1 旧 Dock 方案。
- 不涉及新 PNG/CG 生产晋级，不涉及 S02 六门运行时映射和存档；Quality / 视觉 / 浏览器 / Pages 应分别核对**此 SHA** 后更新结论。

## 2026-11-23 · R12.16 视觉密度与真实候选画模糊回归

- 基线 `bf750bea` 的 **Desktop Visual Review 失败**，失败在 `e2e/a05-character-gallery-layout.spec.ts` 的真实像素防放大检查：候选图宽度约 552.11px，高于 DPR2 许可 546px（高约 6.11px）。问题来源是进入阶段 `scale:1.025`，不是原始 WebP 额外变小；本轮取消候选画进入动画的 transform scale，只保留 opacity。
- 首页右侧重复展示第三张月纱肖像大牌：本轮保留工坊/街区独立风景海报、将剧情回顾改为紧凑文字按钮，**不修改**角色列表、剧情弹窗或现有路由。完整设计、源文件和验收门槛见 [R12.16](../design/R12-16-LOBBY-RAIL-DENSITY-AND-CG-DPR-2026-11-23.md)。
- S02/S05/S06 的高清源图仍为 review，5 张角色正式 CG 的人工晋级仍未完成；**此轮没有新增生产原画**。Quality、Visual、Browser、Pages 的本轮最新结果需要按 SHA 实查，不把此前 Pages 成功等同于新改动验收通过。

## 2026-11-23 · R12.17 全站视觉与「同脸」资产溯源

- 直接检查了 `world-cover.webp` 三位群像、`lobby-hero-v3.webp` 月纱单人和四张实际居民身份头像。判断：「文件不同」不等于「脸骨不同」，现有头像在眼线、颌线、表情上过于统一；现有五张 CG 也不能因此认证 G1/G4 已过。跨人物身份规范和七页面重制顺序已写入 [R12.17](../design/R12-17-FULL-SITE-VISUAL-IDENTITY-AUDIT-2026-11-23.md)。
- 两处真正的代码误用已修：① 首页玩家资料「夜色蔷薇」不再使用月纱脸，而用独立家纹，不改变按钮行为；② `/town/` 不再把三位同模版女性的 `world-cover.webp` 当成市集街景，切回现成 `town-moonlit-gate.webp` **过渡**建筑图。相应 Playwright 检查已同步。**没有创造已签审的真月光街，也没有新角色 CG 晋级**。
- 品牌封面 PC/手机需要重新设计：四位可玩女主真正不同骨相、独立动作和服装，月纱两卡仍同人同脸；先 G1 人工面部板对照再各卡制作。S02/S05/S06 等 review 图正式状态不变，仍需原生尺寸与人审；本轮 Quality / Visual / Browser / Pages 应按最新 SHA 验收。

- 回查旧主分支 `3891ab8` Gameplay Browser Review 共 178 通过、3 跳过、1 失败；失败用例从旧首页底栏寻找已取消的「工坊」快捷链接。新提交更新为**顶角世界地图→工坊**真实用户路径，而不是删除工坊存档/经济测试。需要新 SHA 的浏览器运行结果确认。

## 2026-11-24 · S02 六门研究交互（R12.35）

VIS-02 / VIS-01 仍开放：已实现独立双端研究图的显式门位检查，真实房间索引不变，新增四视口浏览器回归与截图路径，见 [R12.35](../design/R12-35-S02-RESEARCH-DOOR-INTERACTION-2026-11-24.md)。这是研究交互而非玩家生产画面；正式原生高清、正常 HUD 避让和具名人审未完成，CI 以新提交实际结果核验。

## 2026-11-24 · S02 实机点击与 hydration 回归（R12.36）

R12.35 已部署，但 Desktop Visual Review 失败（场景审稿 5 通过/1 失败）。明确记录真实命中层阻挡与 SSR 错误，按 [R12.36 修复](../design/R12-36-S02-POINTER-AND-REVIEW-HYDRATION-2026-11-24.md) 复验；VIS-01/VIS-02 未关闭。

## 2026-11-24 · 当前视觉合同纠偏（R12.37）

UI-01 规范差异已修正：DESIGN / PRODUCT / 历史参考说明不得再要求恢复底栏、第三大肖像海报。实际截图与玩法验收仍以 R12.36 对应 SHA 为准。VIS-01/VIS-02/ART-01 不关闭：见 [现行视觉合同](../design/R12-37-CURRENT-VISUAL-CONTRACT-2026-11-24.md) 的独立欢迎封面、S01、S02、G1、五卡交付顺序及原包入库阻塞。

## 2026-11-24 · 研究绘景来源同步（R12.38）

已纠正 S05/S06 四份旧 ZIP 候选来源，并将 S02/S05/S06 六份候选与现有已通过哈希审计的 R12-09 台账绑定；新增一致性校验见 [R12.38](../art-reviews/R12-38-SCENE-RESEARCH-PROVENANCE-SYNC-2026-11-24.md)。不改变生产状态或版本，VIS-01/VIS-02/ART-01 不关闭，G1 原包仍未取得。

## 2026-11-24 · 场景输出几何门禁（R12.39）

生产审计与真实 44×44 命中盒统一，正式 WebP 必须保持原图比例且不得放大；补三个定向反例，见 [R12.39](../art-reviews/R12-39-SCENE-OUTPUT-AND-HOTSPOT-GEOMETRY-2026-11-24.md)。VIS-01/VIS-02 保持开放；真实原画和 HUD 仍需交付，新增检查以新 SHA 验证。

## 2026-11-24 · 私室刷新回归（R12.40）

R12.36 全量浏览器 186/1/3，唯一失败为旧月纱剧情测试在深链刷新恢复私室后点击背景。按现行 URL 合同调整真实操作顺序及持久化断言，见 [R12.40](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-40-YUESHA-RELOAD-LORE-REGRESSION-2026-11-24.md)。新回归待确认；R12.36 独立 Desktop Visual 最终 cancelled，VIS-01/VIS-02 不关闭。

## 2026-11-24 · 场景视觉验收独立（R12.41）

R12.36 场景专项执行时取消，R12.40 全量回归仍运行。将六项场景原画/真实六门测试移至并行独立 job，单独保存截图与失败证据，补齐资源变更触发路径。见 [R12.41](R12-41-INDEPENDENT-SCENE-VISUAL-REVIEW-2026-11-24.md)；新 job 结果待核实，VIS-01/VIS-02 未关闭。

## R12.72 首批 PC 体验

R12.71 Quality 三作业通过，321/321 Vitest，144 个媒体路径、0 未登记重复。V3.106.0 更新鉴赏画框实时 DPR、欢迎页实际召唤引导，删除已证实无引用装饰组件。新增 Chromium 真实分辨率切换回归，待同 SHA 检查；VIS-01、VIS-02、ART-01、UX-01 不因此关闭。

## R12.72-B PC 大厅布局与回退

V3.106.0 Quality/Pages 成功；独立场景视觉作业成功，综合视觉和全量玩法尚未取得结果。V3.107.0 源码核查发现右栏两组绝对定位独立，且地点海报错误时回退旧大厅人像。已改为共享活动高度/间距、紧凑矮屏、统一普通 HUD 材质、同地点绘景回退。新增 Chromium 三视口及网络失败测试；新 SHA 待验收，VIS-01/UI-01 不提前关闭。

## R12.72-C

V3.107.0 Quality/Pages 成功，综合桌面 27 项相关测试通过、A05 动态 DPR 一项失败（实际 543×724 未按 DPR3 更新）；新候选保留原断言并补充可见期间采样。S05/S06 现有独立图仅显式预览，普通业务横幅精简，研究面板不挡 PC 业务栏。正式独立原画和完整人工视觉验收仍未完成，VIS-01/VIS-02 不关闭。

## R12.74 · 统一任务入口（替代旧 CSV）

旧 [TASKS.csv](https://github.com/kunlong-luo/monster-apartment/tree/782fc74fd6e597048a293cbf9777593447c76bb3/management/TASKS.csv) 保留在 Git 历史，不再作为当前状态。其未完成事项迁移原则：P016/P017/P021/R113-05 → UX-01 真人首次体验；P020/V040-06/R113-06/R120-03/04/05 → VIS-01/VIS-02/ART-01；R113-04 → GOV-01；R120-01/02/06、P035/P040/P041 与旧 V040/UI-08 验收 → QA-01/UI-01，按现行七路由重新核验，旧底栏和 Vite/Phaser 验收标准退役。仍未启动的商业/发行事项不冒充完成：P022 真实玩法短视频、P023 网页游戏平台发行规则、P024 产品继续/调整/停止复盘、P025 Electron 调研（待真人验证后考虑）均作为后置候选；核心体验优先。当前任务只维护本台账与 GitHub Issues。

## R12.75 · 工坊目录收敛

R12.74 Quality 已通过（45378259228）。`v2/docs/` 四份收为一份 [设备规格](../design/WORKSHOP-ASSET-SPEC.md)，旧资料使用固定 SHA。旧工坊 M3/M4/M5 尚有多路线/新配方、设备与仓储容量、剧情协作、音效及经济长期平衡等长期候选，未实施不得标 DONE；优先真实玩家验证、独立原画及现行经营循环。引擎更名独立进行，先读 `audit:engine-paths` 实际报告，再迁移所有引用并验证 Quality、构建与浏览器。DOC-01/ENG-02 仍有历史文档及资源命名待清理。

R12.76：R12.75 Quality 与 Pages 成功；路径报告 19 runtime、26 tests、12 tooling、38 docs、1 internal。候选完成引擎根路径替换与原字节迁移；待 PR Quality 和相关浏览器验证，不关闭存档或视觉风险。

R12.81：#60 已合并、Quality/Pages/性能/WebGL 生命周期通过；#53/#54/#58 的新候选 Quality 均通过，浏览器仍待结果，不标记合并。原 V0.x 六份 Markdown 退役，商业验证原则保留：先免费真人试玩，按理解/核心乐趣/重玩反馈决定调整或停止，真实录屏后再评估发行，收入不作保证；旧守卫战保留为历史实验，重新立项需明确产品价值及存档兼容，不自动恢复旧代码。DOC-01 仍未整体关闭。

R12.82：三功能独立 Quality、Desktop、Gameplay 全部成功，组合候选保留原运行/测试 blob 并合并最新文档；待组合 SHA 质量与浏览器验收，不关闭真人、正式 CG 或原画风险。#54/#58 外部 4K 原包获取失败另行追踪。

R12.83–84：V3.109.0 主线 80eb69a 的 Quality、Desktop、Gameplay 与 Pages 全部成功；#54/#58 有效运行/测试 blob 已逐一核对一致并关闭重复 PR。原包下载失败与 VIS-01/VIS-02/ART-01/UX-01 不关闭；DOC-01 继续收敛，四份旧设计报告退役，保留独立原画/审批和回归历史。实际分支 refs 尚未删除。

## R12.92 · 真实浏览器视觉回归与像素诊断

R12.91 主线 `81bf2d9` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45557278055) 成功；R12.89 `be66775` 的 [Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556397863) 两 job 成功，导航测试覆盖 PC 地图七路由、键盘焦点返回、手机 44px 入口与矮屏；独立场景 8 项通过。完整 [玩法](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556397722) 核查时仍运行。大厅 DPR2 1648×928 实测 1.972、390×844 实测 1.010，均 filter/transform none，源图像素而非 CSS 是当前已测的清晰度瓶颈。新增四视口真实 JSON/PNG 留存及 CI 产物检查，详见[像素证据](../art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)；新结果独立核对。本轮未亲自打开截图、未取得新原画/签审、不变更运行代码和版本；#24/#16/#25 仍 open，综合 72 暂不提高。R12.93 优先按现行视觉合同准备 S02/S05/S06 原生独立场景及四人身份基准；不凭历史截图宣称画质已修复。

## R12.93 · 独立美术重制第一批

基线 `7056767` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45557615576) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45557718604) 已成功；[桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45557615689) 和 [玩法](https://github.com/kunlong-luo/monster-apartment/actions/runs/45557615628) 核查时仍运行。R12.93 第一批（2026-11-25）实际生成 S02 六门中庭 PC 独立候选 v2，聊天原始 PNG 实测 1672×941 RGB、2528106 B、SHA-256 `c59fcb3fcf96faa0eb23a3051015090592c104412b8a049cfd0303287c0d384e`、本地计算 Git blob `bcb3d211792cce3613aa16e5d0475f0134b69639`（非已写入远端证明）。拟入库稳定路径 `art-sources/scenes/apartment/desktop-candidate-v2.png`，暂未传入 GitHub；本会话生成 PNG 可读，但当前连接的 Git blob 写入只接受 base64 文本，没有可用的大文件二进制直传桥接。禁止将拟定路径写成实际可用资源，禁止把未入库文件加入第 5 节库存或 manifest。原生尺寸低于 S02 ≥3296×1856 和目标 3840×2160，不执行插值超分晋级；手机独立原画尚未生成。现有两份已入仓六门研究图、六房索引、生产 review 状态、存档和 V3.109.0 均不变。

具体交付条件见[现行视觉合同](../design/R12-37-CURRENT-VISUAL-CONTRACT-2026-11-24.md)和[场景准入](../art-reviews/R12-02-SCENE-ART-INTAKE.md)。VIS-01/VIS-02/ART-01 不关闭，评分仍 72；下一批优先原图入库、独立竖版及其他地点，不假设新图已可上线。

R12.94 资源清退专项：用户要求先整理 public/art。实际 67 文件、56 媒体；已按 35 正常/回退 + 1 Pixi 回退 + 7 交互研究 + 10 离线研究候选 + 3 优先退役候选分类，最多拟减少公开目录 5756254 B。清单与执行条件见[资源总目录](../ART-RESOURCE-CATALOG.md) 第 4.1 节；未穷尽全部引用，不实际删除、移动图片或修改运行逻辑，S02 新 v2 PNG 仍未入库。先完成 3 张退役候选引用闭环，再处理离线研究与运行 review 路径，不因文件名误删有效素材。

R12.95：对 R12.94 资源分类实施第一批实际迁退：10 个离线研究 WebP 原 blob 移出 public，3 个旧肖像删除；public/art 56 → 43 媒体，减少 5756254 B；全仓媒体 144 → 141。核查 351 源/测试/工具、19 JSON/CSV 和 185 Markdown 的相关名称，保留生产和正常/审稿回退。源图、审批、存档不变，新增 CI 待确认。余下正常 review 路径、必要回退和历史设计参考继续按用途逐步迁名，S02 v2 新图仍未上传。详见[资源目录](../ART-RESOURCE-CATALOG.md)。

R12.96：将 public/art/a05 与 public/art/feature-postcards 两组历史命名迁为 decorations 与 postcards；5 个媒体、2 个来源清单原 Git blob 不变。同步 3 个 React 消费者、海报回退 E2E、转换脚本和来源工作流，保留 A05 验收 ID、截图目录、旧历史 SHA、来源与审批。351 个代码/工具/测试文件、185 个 Markdown、19 个资源 JSON/CSV 已做相关路径与文件名专项扫描。未改变玩法、布局、图片字节及存档；43 公开媒体、141 全仓媒体不变。新提交 CI/Pages/视觉结果独立验证。 剩余角色、封面、场景、房间及历史设计参考路径仍待独立核查。

R12.103 评分复核：正式已发布基线暂保持 72/100（17 架构 +18 文档资源 +15 功能存档 +10 视觉 +12 验证发布 +0 真人反馈）。候选已解决公开设计 PNG 与根目录散落图片，但未完成 CI/合并/Pages，不提前加分。待合并且同 SHA 通过 Quality 与 Pages，资源维可考虑 19/20（候选参考 73/100），仍需独立原画生产、人审、长循环、真人试玩、分支保护及动态引用/CSS 验证，85 分未达成。

## R12.104 · 现行职责与验收

现行评分仍为 72/100；候选具备提高资源维度至 19/20 的证据，但先完成浏览器验收、合并与同 SHA Pages，再更新正式评分。未登记重复媒体为零，已登记的月纱审稿重复组及人工原画批准仍有独立职责。

[美术资源总目录](../ART-RESOURCE-CATALOG.md)：完整迁移经过、失败修复和审计证据统一保存在资源总目录；清理前各文档的完整版本见 [372f26f 固定快照](https://github.com/kunlong-luo/monster-apartment/tree/372f26f28933050840b6c6f8ff5f18ed99075e44)。不再逐轮复制报告。

R12.105：CSS 级联风险与动态资源测试见 [架构审计](../CURRENT_ARCHITECTURE.md#r12105--css-与动态资源专项核查)；优先收口 PR #61，后续只处理有实际浏览器证据的样式覆盖，不把 !important 数量直接计为缺陷。不调整正式 72/100 评分，不删除有职责的 CSS 或媒体。

R12.106：召唤移动端同断点覆盖第一批收敛，详见 [架构](../CURRENT_ARCHITECTURE.md#r12106--召唤移动断点覆盖收敛候选)。PR #61 的 Quality、像素、独立场景通过，桌面/玩法尚未结束；PR #62 原 2e598b3 Quality 与像素通过，新增 CSS 候选须独立验收。正式评分保持 72/100；不再创建第三条验证分支。

R12.107：PR #61 四项候选验收均通过并已合并，完整玩法 199 通过、3 跳过、0 失败；同 SHA Pages 未确认前正式 72/100 不提高。PR #62 同步主线后待新 CI，详见[资源总目录](../ART-RESOURCE-CATALOG.md)。
