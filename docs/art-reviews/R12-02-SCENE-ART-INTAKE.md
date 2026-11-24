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
| S02 公寓建筑公共空间 | review，已有两张独立构图，均未导入仓库 | PC 1672×941 / 手机 941×1672 PNG | PC `ce7c4f92…` / 手机 `ebba8a12…` | PC 和手机原生尺寸均未达标，缺人工审稿、权益核验和真实页面验收 |
| S05 契约委托大厅 | review，独立横版/竖版均有候选，均未入仓 | PC 1672×941 / 手机 941×1672 PNG | PC `ae97b5f4…` / 手机 `96d5fffb…` | 两端原生尺寸仍不足、公告纸张伪文字待重绘、人工审核未完成 |
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

## 2026-11-16 · S02 公寓中庭独立手机原画候选

本次另生成公寓中庭**真实独立的竖屏场景构图**，以多层回廊、四个差异化房门入口（红色会客室、蓝色机房、绿色温室、金色炉火间）、中央楼梯和月色彩窗作为视觉骨架。它不是把旧大厅月纱沙龙图换色，也不是把 S02 16:9 图裁成竖版。

| 候选 | 原生尺寸 | 原始 PNG SHA-256 | 资源状态 |
| --- | ---: | --- | --- |
| S02 desktop source | 1672×941 | `ce7c4f924ca18c0480bd2064e5507912021e417397706b2cb2c8e8af58af90cf` | review，来源于前一轮审稿包 |
| S02 independent mobile source | 941×1672 | `ebba8a12cead870457a64ae211d1f5ebd529ee56e291f494ffdce369588f4dd0` | review，独立竖版，不是 desktop 裁切 |
| S02 mobile WebP preview | 941×1672 | `06b4a5d491f1e27247aa284694955eb35f85b5cf55637790f0417bcce7c0874f` | 仅审稿，非 production |

本轮聊天提供 `r12-s02-apartment-dual-composition-review.zip`，包含 PC/手机原始 PNG、手机候选 WebP、390×844 / 390×550 手机预览、横竖对照和审稿 JSON。**这份 ZIP 不在 GitHub 仓库中，不等于素材已接入游戏。**

安全审核待办：对照现有公寓六房门面板和页面热点逐一检查门位映射、遮挡与手机端布局；核验无烘焙按钮/动态数字；检查细节，做商业用途与人工签署。当前两张原画都低于生产原生像素门槛，不能通过 AI/插值超分当作 2560×1440 或 1080×1920 原画，更不能改 `status` 为 `production`。

另外，S05 委托大厅的本轮手机试画混入了人物、中文按钮和游戏 HUD，**已判退、未登记、未入库**；S05 仍需纯背景独立竖版绘景，不能把整张交互样机烘进环境图。


## 2026-11-16 · S05 契约委托大厅独立手机场景候选

已补齐 S05 `/orders/` 的**独立 9:16 竖版环境绘景**，建筑空间不同于 S02 公寓门廊及 S06 晶核仓库。画面以巨大猩红月蚀玫瑰窗、契约公告栏、中央委托台、封蜡、羽毛笔、秤、烛台和两侧紫金哥特式长廊为核心，无烘焙游戏按钮或人物；有意给下方触控界面保留低对比度地面区域。生成结果中公告纸页存在不可读的伪文字，因此还需人工重绘，不得以此宣布无烘焙文字通过。

| 资产 | 原生像素 | SHA-256 | 当前状态 |
| --- | ---: | --- | --- |
| S05 PC 原图（原审稿包） | 1672×941 | `ae97b5f40161a3b40bc6732a453c0b3af6bc379872a7ec13e0dac59557399530` | review |
| S05 新独立手机 PNG | 941×1672 | `96d5fffb7e571c0733a2a2de7702188b49290bc3c55d14360372530b580935f8` | review |
| S05 手机预览 WebP | 941×1672 | `198cdd1ecdb21e0eff3f3166ffc500944091eda25c8e46b02f075e6af387e412` | 仅审稿 |

源文件及 `390×844`、`390×550` 裁切预览和 `review-manifest.json` 在本次聊天附件 `r12-s05-contract-hall-independent-portrait-review.zip` 中；**原始 PNG 没有入 GitHub，仍未取得人工署名审核**。网页仍在运行时回退到旧大厅背景。PC、手机两份原图分别低于原生 2560×1440 和 1080×1920，禁止通过普通插值扩大图像宣称已经满足生产质量。三大场景 S02 / S05 / S06 至此都有各自独立的横、竖版**审稿草图**，但 `production=0/3` 不变。

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

## R12.39 · 输出几何与热点（现行补充）

正式输出 WebP 必须保持原始 PNG 的全幅比例（容许整数取整误差），宽高不超过原图，且仍满足既有 DPR 与原生尺寸门禁。六门 44×44 点击盒按横/纵矩形相交判断，不用圆形中心距离替代。详见 [R12.39](R12-39-SCENE-OUTPUT-AND-HOTSPOT-GEOMETRY-2026-11-24.md)。原图来源记录以 [R12.38](R12-38-SCENE-RESEARCH-PROVENANCE-SYNC-2026-11-24.md) 为准；早期 ZIP/尺寸记录保留作历史，不代表现行候选或批准。
