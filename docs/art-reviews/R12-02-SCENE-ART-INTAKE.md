# R12.0.4 · 独立场景美术接入与晋级门禁

> 日期：2026-11-14 · [#16 独立场景绘景](https://github.com/kunlong-luo/monster-apartment/issues/16) / [#24 高清模糊](https://github.com/kunlong-luo/monster-apartment/issues/24)
>
> 这是**审核与自动校验的工程交付**，不是正式高清场景三张已上线。正式包尚未替换任何 `public/art/lobby-hero-v3.webp` 或 `v2/art/moon-workshop.avif`。

## 当前主线基线

- [PR #27](https://github.com/kunlong-luo/monster-apartment/pull/27) 已合并：大厅压缩导航 + 世界地图。
- [PR #28](https://github.com/kunlong-luo/monster-apartment/pull/28) 已合并：七场景、四设备档位实际图片像素证据，独立 R12 取证工作流通过。
- [PR #29](https://github.com/kunlong-luo/monster-apartment/pull/29) 已合并：像素差异与重复场景证据；具体数据见 [R12-01](R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)。
- 本次新增 `public/art/world-scenes/r12-scene-manifest.json` 和 `scripts/audit-r12-scene-art.mjs`，且 `check:design` 跑入库审核及负向测试。审核员签字并存入真正的高分辨率文件前，所有真实路由继续用已存在的旧美术回退。

## 候选资产的现状（禁止误标为生产）

| 场景 ID | 独立原画状态 | 当前原图（未经超分） | 来源指纹 SHA-256 | 阻塞 |
| --- | --- | --- | --- | --- |
| S02 公寓建筑公共空间 | review，已具独立横/竖候选但未入库 | 桌面 1672×941、独立手机 941×1672 PNG | `ce7c4f924ca18c0480bd2064e5507912021e417397706b2cb2c8e8af58af90cf` | 原生 PC 不足 2560×1440，缺原生手机 1080×1920，人工审稿、权限核验待完成 |
| S05 契约委托大厅 | review，已打包供审稿，未导入仓库 | 1672×941 PNG | `ae97b5f40161a3b40bc6732a453c0b3af6bc379872a7ec13e0dac59557399530` | 同上；不能只使用 390×844 裁切图作为原生手机 CG |
| S06 魔法仓库 | review，候选原图未导入仓库 | 1672×941 PNG | `f84ac996a287cc35ecf4210210329fdc71c7ec6cb7c7247d42389aef3732b009` | 缺原生 2560×1440 与 1080×1920 双构图、人工画质/来源审核及游戏截图 |

上述 S02/S05 原画与裁切预览打包在本次聊天导出的 `r12-s02-s05-review-only.zip`。**档案没有写入 GitHub，因此此文档不提供虚构的仓库路径或公开下载 URL。** 审稿包包含 `review-manifest.json`，记录原图/候选 WebP 哈希，来源类型、原始尺寸及权限与人工检查状态。

## 2026-11-14 · S06 审稿候选与正式页面接线

**最新状态：三处皆是 review，不是 production。** S06 魔法仓库的独立环境候选已生成，以晶核货架、封印储箱、仓储吊装架、盘点台构成与 S05 契约大厅不同的场景身份。原始图为 1672×941，SHA-256 `f84ac996a287cc35ecf4210210329fdc71c7ec6cb7c7247d42389aef3732b009`，候选 WebP SHA-256 `84c8bfad00980bdcfe227a8fa488a6e4b0f8fa9f0a7da01294600cfb66f57579`。原图/候选 WebP/1440×900 PC 与 390×844、390×550 手机裁切预览保存在本轮对话的 `r12-s06-warehouse-review-only.zip`，**未传入 GitHub 仓库**。手机图片为裁切检查，不是独立竖版原画；无权限核验和人工签字，不能晋级。

本轮另外把 **已审核场景的真实调用路径**接入代码：
- `src/lib/game/r12-scene-assets.ts` 唯独对 `manifest.status=production` 返回按 GitHub Pages `basePath` 解析的桌面与手机文件 URL。
- `src/components/game/r12-scene-painting.tsx` 用独立 PC/手机画幅加载背景与地点横幅，沿用既有 `ReliableImage` 的失败重试及旧图回退。
- 公寓 `gothic-apartment.tsx`、委托/仓库 `world-ui.tsx`、`world-orders.tsx`、`world-warehouse.tsx` 已接线；其他地点、库存、委托、导航、存档不变。
- 新 `e2e/r12-scene-production-wiring.spec.ts` 逐一核验未晋级图不得进入浏览器；晋级后两端真正加载、解码并展示对应独立画稿。`e2e/route-health.spec.ts` 也会在未来真正晋级时验证新图，而非继续只寻找旧大厅的背景字符串。
- 当前所有 `status` 仍是 `review`，**合并上述代码不会让旧图在主站视觉上突然替换成未批准图**。需要独立原生画稿和签署才能进行最终可见切换。

## 2026-11-16 · S06 独立手机构图候选 + 原图防超分门禁

S06 新增**独立绘制的竖屏仓库**，不是将原横版图片裁切或插值拉长。审稿包 `r12-s06-warehouse-dual-composition-review.zip` 在本次对话提供（不在仓库中）；包含 2 张完整原始图、竖版 WebP、桌面/手机多视口预览和 `review-manifest.json`。静态资源仅供人工审稿；游戏正式页面仍显示旧背景。

| 构图 | 原生尺寸 | 原始 PNG SHA-256 | 当前结论 |
| --- | ---: | --- | --- |
| S06 PC 独立仓库场景 | 1672×941 | `f84ac996a287cc35ecf4210210329fdc71c7ec6cb7c7247d42389aef3732b009` | 未达到 2560×1440 |
| S06 手机独立仓库场景 | 941×1672 | `882de33135914fdac8a5b9d1a280a7a603df472d698b00875393780e654a708b` | 未达到 1080×1920 |
| 手机候选 WebP | 941×1672 | `306c1666c85919dfd16bc60b7491e957bdd7fd9de36582e15ac1334f17c97bfe` | 供审稿；不是 production |

`public/art/world-scenes/r12-scene-manifest.json` 的 `warehouse.mobileCandidate` 已登记竖版原始尺寸、来源、哈希和非裁切状态。原图与 WebP 均未上传到仓库，也没有修改生产图的 URL、审核标记或存档。

**质量门禁增强**：此前只检查 `production` WebP 输出文件尺寸与人工签署；现在同时要求候选来源**本身**满足原生 2560×1440 PC / 1080×1920 手机，并且审核记录的桌面和手机原始 SHA 分别匹配两张独立原图。此外正式晋级必须将两张原始 PNG 存放在仓库中（非 `public` 静态目录）：
`art-sources/r12/{scene}-desktop.png` 和 `art-sources/r12/{scene}-mobile.png`。
CI 会对真实字节计算 SHA-256、读取 PNG `IHDR` 尺寸、核对清单及人工审核记录，证明是实际存在的原画，而不只是相信手动填写的 nativeWidth/nativeHeight。
**只凭将低像素 PNG 超分成较大 WebP，或只改清单数字都不能过审。** 原图应具备独立构图和可用细节，这一点仍需人工审稿；校验尺寸不能代替人眼判断。负向单测固定这些拒绝逻辑。

仍未满足：真实原生高清源绘制、商业使用与审美审查、两个 2× DPR 截图对比，以及独立正式美术资源在游戏里的生产展示。S02 / S05 还需要各自独立手机构图。

## 2026-11-16 · S02 公寓新增独立手机构图

已绘制真正独立的 S02 公寓中庭竖版环境画（楼梯、走廊、独立红木私室门、红月玫瑰窗与地面留白），不是把横版 `apartment-atrium-source.png` 裁切成手机图。完整 PNG 原图为 **941×1672**，SHA-256 为 `dc05ae069898db55f374ce36ac68c98708dd63475693ba353590a483c1f4f0a7`。审稿 WebP 仍为 941×1672，SHA-256 `d8015351d9c3e9423b02580560adf20f815c64dc4ace732ee480087581eba5d4`。

本次聊天提供的 `r12-s02-apartment-mobile-independent-review.zip` 包含原始 PNG、候选 WebP、390×844 与 390×550 安全裁切样片、审稿元数据。**没有上传到 GitHub**，没有通过人工画质、授权和像素级审核。新竖版比从旧大厅横版硬裁切更符合空间身份需求，但原生 941×1672 **低于 1080×1920 最低规格**，必须保持 `review`，不能使用插值超分蒙混入库。S02 旧的横版 1672×941 也未达到桌面原生最低标准。

`manifest.scenes.apartment.mobileCandidate` 登记新原图指纹与状态，自动化增加它的独立来源校验和候选不进入生产的回归测试。当前 S02、S05、S06 仍全部为 `review`；S05 尚缺独立手机竖版。

## 自动晋级门禁

`pnpm check:design` 新增 R12 审核与负向测试。若未来把状态改为 `production`，必须同时满足：

1. 同场景 **独立 PC/手机原生画稿**：`public/art/world-scenes/r12/{scene}-desktop.webp` 至少 2560×1440，`{scene}-mobile.webp` 至少 1080×1920；不得只是把 1672×941 插值扩宽或放大成 4K。
2. 图源/输出完整指纹：必须随晋级 PR 将两张独立原始 PNG 放到 `art-sources/r12/`；CI 从原图真实 bytes 读取 SHA-256 与 IHDR 源尺寸，和 manifest/人工审核记录逐项一致；两份生产 WebP 文件尺寸/哈希也必须与真实输出匹配。任何替换都需要重新审核。
3. 明确人工审核：`rightsConfirmed`、`commercialUse`、`humanVisualReview`、`approved`、`notUpscaledFromSmallerImage`、`noBakedUI`、`noBakedText`；具名审核人、日期、审稿说明。真文件/人工审核不在 CI 中凭空生成。
4. 四视口裁切检查：1440×900、1648×928 高 DPR、390×844、390×550；不得遮挡人物脸、现有热点、生产按钮、订单交付、库存与返回大厅入口。
5. 三个地点各有独立输出 SHA，禁止通过复制同一张大厅/工坊图片晋级为三张“不同场景”。`review`/`pending` 资产放进保留的生产路径也会阻断 Quality，而非偷偷启用。
6. **代码接线与同 SHA 发布验证单独完成**：门禁只是准入层，不负责自动把未审资源挂在页面；正式 PR 需要修改 `gothic-apartment.tsx`、`world-ui.tsx`、`world-orders.tsx`、`world-warehouse.tsx`，保留旧图故障回退、深链、原有经营数值及存档，重跑 Quality / Desktop Visual / Gameplay Browser full / Pages。

### 审核不替代视觉判断

WebP 的 header 尺寸和 SHA 哈希可以客观确认，却无法判断 AI 原画是否真的具有高频细节、手机构图是否合理、透视是否独立、版权/商业使用是否有问题。人工不通过，`status` 必须保持 `review`，不能靠编造真值绕过门禁。

下一真正可见交付仍是 **S02、S05、S06 原生高清 PC 和独立竖版源图通过人工审核后进入生产页面**。S06 目前已有独立竖屏候选，但其原生尺寸仍然不达标；不是靠写更多 CSS 或虚增输出像素解决。
