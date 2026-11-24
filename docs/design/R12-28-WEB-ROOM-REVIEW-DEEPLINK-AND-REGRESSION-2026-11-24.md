# R12.28 · Web 私人房间深链与本地美术审核模式修复（2026-11-24）

> **已提交实际 Web 运行时与浏览器测试变更，UI 版本标识更新为 V3.94.0。** 根因来自上一轮 R12.26 私人房间的 Next.js 客户端路由改造，而非角色图片源素材。本轮修复不会把本地预览变成正式美术资产，也不会修改经营存档、卡池掉率或七条正式路由；必须按最终 `main` SHA 检查 Quality、Desktop Visual Review、Gameplay Browser Review 与 Pages，**不能在尚无 CI 证据时宣称完整通过**。

参考：[R12.26 图鉴深链](R12-26-WEB-CHARACTER-ROOM-DEEPLINKS-2026-11-24.md) · [R12.27 图鉴高清像素预算](R12-27-PC-WEB-ART-PIXEL-BUDGET-2026-11-24.md) · [#25 导航](https://github.com/kunlong-luo/monster-apartment/issues/25) · [#24 图片模糊](https://github.com/kunlong-luo/monster-apartment/issues/24)。

## 1. 从完整浏览器实测发现的新问题

[Gameplay Browser Review #45308880786](https://github.com/kunlong-luo/monster-apartment/actions/runs/45308880786) 在 `7444601` 等相关 R12.27 版本上结束为 **176 passed、4 failed、3 skipped**。失败**必须逐项追根**，不能因为 Quality 通过或 Pages 发布成功就把浏览器检查写成通过：

| 失败用例 | 实际行为与根因 | 本轮处置 |
| --- | --- | --- |
| `e2e/a05-character-gallery-layout.spec.ts` 首项 | 旧版 A05 测试要求神话月纱 `scale>1.9`，与 R12.27 正确取消 2.05× 像素放大直接矛盾 | **前一轮 R12.27 已修旧断言为 `transform:none`**，保留 DPR2 采样门槛；这不是本轮重复修改 |
| `e2e/character-life.spec.ts` 故事保存刷新 | 图鉴内点击泉泡已由旧的局部弹窗改为正式 `/characters/?visit=brook` 网址；浏览器刷新会**直接重新打开房间**。旧测试却刷新后再次点击画面背后已被模态遮挡的入口，超时 | 改为断言 URL 保持 `?visit=brook`、私室自动显示，随后验证故事进度 **1/2**、收录记录仍在、未重复产生收录按钮 |
| `e2e/character-room-mobile.spec.ts` 三人私室本地美术预览 | 初始 `/characters/?roomArtReview=1` 明确开启研究审核；但从角色列表进入私室时，`router.push('/characters/?visit=id')` **丢掉审核查询参数**，导致控制面板故意隐藏，测试找不到。**普通玩家隐藏审核工具本来是正确的** | 仅在原 URL **显式** `roomArtReview=1` 时，随 `visit` 保留此参数；退出房间保留审核模式，不把研究控件默认开放 |
| `e2e/character-room-mobile.spec.ts` 在岗人物临时预览 | 同上丢失 `roomArtReview=1`，所以无法加载开发预览控件；不能把在岗人物永远显示出来作为“修复” | 同一运行时修复即可恢复本地预览，真实在岗人物在游戏正常模式仍不出现在私室 |

**优先级判断：** 这是 Web 导航的状态一致性和测试契约问题；并未发现需要更换正式人物头像或修改工坊、故事存档结构的证据。

## 2. 本轮已提交的代码

| 文件 | 修改 | 安全/数据边界 |
| --- | --- | --- |
| `src/components/moonwork/character-gallery-scene.tsx` | 使用 Next `useSearchParams` 读取当前 `roomArtReview=1`，仅在显式启用时生成 `&roomArtReview=1`；人物快速拜访 `router.push`、详情入室链接及离开 `router.replace` 均保留这一选项 | 普通 `/characters/` → `?visit=brook/fern/cinder` 仍**不**显示本地审核；新预览未入存档/后端/生产图 |
| `e2e/character-life.spec.ts` | 改成在 URL 深链中刷新并自动看到原私室，检查已收录的工坊故事仍可见 | 仍检验工坊资源不变、真实存档持续保存 |
| `e2e/character-room-mobile.spec.ts` | 三人物研究预览测试新增 URL 断言，入室必须是 `?visit=id&roomArtReview=1`，离开后返回 `?roomArtReview=1`；原来上传透明 PNG/WebP、拒绝带背景角色图、reset 与当班角色隔离测试全部保留 | 只在显式研究模式下显示本地审核，不会审核晋级或保存来源 |
| `src/core/game-release.ts`、`public/release.json` | 将 V3.93.0 统一更新为 **V3.94.0** | 使用现有版本提示机制，无新依赖 |

所涉及的本地美术功能设计为**在浏览器内临时解析图片、创建对象 URL**，从未直接写进 `cg-manifest.json` 或房间正式 manifest。公开站点的 `roomArtReview=1` 是已有显式开发预览开关，功能仍限定于该明确的 opt-in；**不能将其审核预览看作玩家已获得高清场景**。

## 3. Web/PC 与移动验收矩阵

1. **PC 1440×900 正常玩家**：`/characters/` 进入泉泡/青枝/炽角，网址随角色变化；房间内**无** `room-art-local-review`，工坊在岗人物继续缺席；关闭返回正常图鉴，无底栏重现。
2. **PC 1440×900 研究模式**：`/characters/?roomArtReview=1` → 单人房间 → `?visit=id&roomArtReview=1`；真实本地图片可以进入临时背景预览，不能改变工坊/角色数据库；退出回到带审核参数的图鉴。
3. **移动 390×844 三人轮询**：泉泡、青枝、炽角各自本地预览控件显示/上传/清空，禁止套用另一个人物的文件或身份。
4. **角色故事连续性**：真实订单后人物故事完成第一幕，`/characters/?visit=brook` 刷新应自动恢复房间且维持 `1 / 2` 收录，不额外点击遮罩下的按钮。
5. **页面及画质不变项**：原 7 路由、A05 五张候选、PC 地图顶角、独立房间、所有角色正版肖像不变。新 G1 研究图仍未真实进入仓库，正式身份签署 0/4；正式封面 0/2、全身 CG 0/5；R12.27 首页高密屏 2.08× 源图问题仍待正式原画重制。

## 4. 验证与版本报告口径

- **已验证（修复前）**：R12.27 最终 `20c0ef4` 的 Quality [#45308911327](https://github.com/kunlong-luo/monster-apartment/actions/runs/45308911327) 与 Pages [#45309031990](https://github.com/kunlong-luo/monster-apartment/actions/runs/45309031990) 均通过；旧完整 Gameplay 回归失败 **176/4/3**，这是诊断依据。
- **本轮提交之后**：新 V3.94.0 的 Quality、Desktop Visual Review、Gameplay Browser Review、Pages 必须跟随本轮最新 `main`，分别回读 GitHub Actions 的 SHA 和结果。仅**提交成功**不能声称已完成同 SHA 的浏览器人工验收。
- 若全量浏览器仍失败，优先看 `e2e/character-life.spec.ts`、`e2e/character-room-mobile.spec.ts` 的真实日志和新代码，而不是放宽测试超时或删除它们。

## 5. 下一阶段 Web 优先级

**P0：** 收口这三项真实回归，核对所有流水线并保存失败证据。**P0 美术：** 首页 `lobby-hero-v3.webp` 历史自然尺寸仅 1587×991，在 1648×928 DPR2 需约 2.08× 像素采样；委托/仓库仍缺真正独立绘景，不能通过滤镜修饰替换源图。**P1：** 审核四个人物新旧身份与商用来源，完成与现有 Web 画风一致的高清人物原画，再让有效素材真正进入 GitHub，最终才允许正式 CG 审核与资源替换。

**验收原则：** 角色可访问、故事持久化、研究审核隔离、真正高清原画生产是四个独立门禁；不能拿其中一个门禁通过来代替其他三个。
