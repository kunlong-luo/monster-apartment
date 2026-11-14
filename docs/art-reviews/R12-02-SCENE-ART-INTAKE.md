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
| S02 公寓建筑公共空间 | review，已打包供审稿，未导入仓库 | 1672×941 PNG | `ce7c4f924ca18c0480bd2064e5507912021e417397706b2cb2c8e8af58af90cf` | 原生 PC 不足 2560×1440，缺原生手机 1080×1920，人工审稿、权限核验待完成 |
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

## 自动晋级门禁

`pnpm check:design` 新增 R12 审核与负向测试。若未来把状态改为 `production`，必须同时满足：

1. 同场景 **独立 PC/手机原生画稿**：`public/art/world-scenes/r12/{scene}-desktop.webp` 至少 2560×1440，`{scene}-mobile.webp` 至少 1080×1920；不得只是把 1672×941 插值扩宽或放大成 4K。
2. 图源/输出完整指纹：原始文件 SHA-256、引用来源、两份 WebP 文件 SHA-256、像素尺寸和文件字节数与仓库中实际二进制完全一致。任何替换都需要重新审核。
3. 明确人工审核：`rightsConfirmed`、`commercialUse`、`humanVisualReview`、`approved`、`notUpscaledFromSmallerImage`、`noBakedUI`、`noBakedText`；具名审核人、日期、审稿说明。真文件/人工审核不在 CI 中凭空生成。
4. 四视口裁切检查：1440×900、1648×928 高 DPR、390×844、390×550；不得遮挡人物脸、现有热点、生产按钮、订单交付、库存与返回大厅入口。
5. 三个地点各有独立输出 SHA，禁止通过复制同一张大厅/工坊图片晋级为三张“不同场景”。`review`/`pending` 资产放进保留的生产路径也会阻断 Quality，而非偷偷启用。
6. **代码接线与同 SHA 发布验证单独完成**：门禁只是准入层，不负责自动把未审资源挂在页面；正式 PR 需要修改 `gothic-apartment.tsx`、`world-ui.tsx`、`world-orders.tsx`、`world-warehouse.tsx`，保留旧图故障回退、深链、原有经营数值及存档，重跑 Quality / Desktop Visual / Gameplay Browser full / Pages。

### 审核不替代视觉判断

WebP 的 header 尺寸和 SHA 哈希可以客观确认，却无法判断 AI 原画是否真的具有高频细节、手机构图是否合理、透视是否独立、版权/商业使用是否有问题。人工不通过，`status` 必须保持 `review`，不能靠编造真值绕过门禁。

下一真正可见交付应为 **S06 独立仓库绘景和 S02/S05 原生高清及竖构图的完成与接入**，而不是继续写 CSS 或虚增图片尺寸。
