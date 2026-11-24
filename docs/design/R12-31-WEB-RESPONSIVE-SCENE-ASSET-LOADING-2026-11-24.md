# R12.31 · PC Web 原生高清场景按设备单图加载（2026-11-24）

> **本轮修改真实 Web 图像加载代码、配套浏览器契约、SSR 回归测试及发布标识。** 解决的是「高清原画进入项目后，每页可能同时请求 PC 大图与手机竖图」的加载架构问题；**没有生成、上传、批准或接入新的场景二进制原画**。当前 `S02/S05/S06` 场景仍处于 `review`，因此这次优化的 production 分支尚不代表玩家目前已看到新画作。任何发布、测试、图片清晰度声明必须区分各自证据。

前序：[R12.29 真实 DPR2 采样](R12-29-WEB-DPR2-IMAGE-REGRESSION-AND-HERO-REBUILD-2026-11-24.md) · [R12.30 场景审稿与月纱房间深链](R12-30-WEB-ART-REVIEW-DPR2-AND-YUESHA-ROUTING-2026-11-24.md) · [#24 模糊图片](https://github.com/kunlong-luo/monster-apartment/issues/24) · [#16 独立场景](https://github.com/kunlong-luo/monster-apartment/issues/16)。

## 1. 已核对的上一轮基线

`main` 的 R12.30 最终提交 `3b8b7f8494dcb6a4ba2d2a3276789ee4110ec19e`：
- [Quality #45315661674](https://github.com/kunlong-luo/monster-apartment/actions/runs/45315661674) **通过**；
- [Pages #45315785609](https://github.com/kunlong-luo/monster-apartment/actions/runs/45315785609) **部署成功**，当时界面版本为 `V3.95.0`；
- [Desktop Visual Review #45315554432](https://github.com/kunlong-luo/monster-apartment/actions/runs/45315554432) **通过**，对应当轮功能提交 `db97419`，其中 PC 月纱深链/Back 和本地艺术审稿隔离测试确认通过；
- [Gameplay Browser Review #45315554527](https://github.com/kunlong-luo/monster-apartment/actions/runs/45315554527) 最终 **cancelled**，而非通过或失败；该运行不构成全量回归通过证据。

发布基线与其他工作流**不一定属于完全相同 SHA**：不合并口径，也不以低成本类型检查冒充真实浏览器审查。

## 2. 问题根因与玩家影响

原有 `R12SceneBackdrop` 以及 `R12SceneHeroPainting` 在 manifest 宣告 `production` 后，会同时渲染桌面 `<img>` 和手机 `<img>`，然后通过 `max-[700px]:hidden` 和 `hidden max-[700px]:block` 让其中一个不可见。CSS `display:none` **并不能可靠阻止另一个图片的获取或解码**。

将来 S02 公寓、S05 委托、S06 仓库接入原生 PC 3840×2160 和手机 1080×1920 双构图后，如果照旧同时渲染，对移动端冷启动的数据、缓存、解码和内存开销都很不利；且会影响玩家首次进入 Web 页面时对场景画面的评价。

**画质责任边界：** 这里解决的是**按设备选择资源**，不是让旧低清素材变高清。浏览器选择了正确图片也不意味着作品色调、人物脸型或版权已经通过审核。

## 3. 已完成的代码与测试

| 文件 | 修改 | 验收合同 |
| --- | --- | --- |
| `src/components/game/r12-approved-scene-picture.tsx`（新增） | 为已批准场景封装原生 `<picture>`：手机在 700px 以下使用 `<source media="(max-width:700px)">` 选择独立竖画，桌面使用单一 `<img>`；在首轮 HTML 就让浏览器选择资源，不依赖客户端挂载后先下载桌面图再切换 | **每一块 production 场景只有一个 `<img>` + 一条手机 `<source>`**，同时保留加载失败的重试和中性背景/hero 占位，不退回旧大厅小图 |
| `src/components/game/r12-scene-painting.tsx` | `R12SceneBackdrop`、`R12SceneHeroPainting` 在**仅当** `approvedR12Scene(area)` 返回正式双源时使用该共享组件；本地预览对象 URL、编辑器浮层、生产准入边界保持不变 | 不改变 `r12-scene-manifest.json` 的 `review` 状态，不自动晋级二进制研究稿或改变真实玩家存档 |
| `tests/r12-responsive-scene-picture.vitest.test.ts` | 新增 Node 服务端 HTML 标记回归，分别检查背景与 Hero 对每组 PC/手机画作只输出单一 `<img>`、对应正确 `<source>` 和域名子路径 | 检查首屏 HTML 合同；不声称已在真 4K 图片上测得网络传输节省量 |
| `e2e/r12-scene-production-wiring.spec.ts` | 更新未来完成正式审核后的 Web 测试：从旧的“2 张隐藏/显示图片”改为“1 张图片 + 1 条 mobile source”，并通过 `HTMLImageElement.currentSrc` 检查在 PC/手机实际选中正确的 WebP 源 | 当前三场景仍处于 `review`，浏览器只会实测它们没有意外泄露到生产；将来晋级时才会走 production 分支的真实请求断言 |
| `src/core/game-release.ts`、`public/release.json` | 发布标识同步为 `V3.96.0` | 仅标记 Web 代码版本；不标记场景美术完成 |

### 失败回退的明确规则

一张批准原画加载失败 → `ReliableImage` 发起该场景图片的第一次重试（手机 `<source>` 与其同步更新），再次失败 → 中性纯色渐变/无原画 Hero 占位。不能自动改为 1587×991 的大厅图或过期 360×228 的工坊小图，也不能意外向浏览器写入研究稿对象 URL。

## 4. 仍需处理的真实高清美术生产

| 内容 | 当前真实状态 | 下一步可交付的原生文件 |
| --- | --- | --- |
| 首页大厅 | `public/art/lobby-hero-v3.webp` **1587×991**，此前 PC 1648×928/DPR2 测得约 2.08× 上采样 | 有身份连续性的 PC **3840×2160** 原创画稿，另有独立手机 **1080×1920** 原画；禁止仅用插值放大 |
| 公寓独立走廊 S02 | 桌面 1672×941 / 手机 941×1672 的**研究源图在仓库中，但没有人工签署、未晋级** | 与大厅明显不同的多层廊道、六扇真实房门及两端可点热点安全区；双原图、WebP、SHA 与签署 |
| 委托 S05 / 仓库 S06 | 研究候选及正式资源未全部同步到生产且都未签署 | 各自独立的 PC/手机无文字建筑场景；尊重既定 [R12 静态准入脚本](https://github.com/kunlong-luo/monster-apartment/blob/main/scripts/audit-r12-scene-art.mjs) |
| 人物身份/CG | 新 G1 四人研究稿未真正进 GitHub，也未进行四人正式身份冻结；五张角色 CG 状态全是 `portrait` | G1 身份 4/4 人审、独立服装武器姿势与画风校准；正式每张 CG 后续单独晋级 |

**不得因为加载组件改造完成，就在 Issue #16/#24 标记场景高清已解决。** 同样，不可以把 production 代码测试和 human visual review 混为一谈。

## 5. 验收与下一阶段顺序

本轮需要核验与最终 `main` 对应的：① Quality（TypeScript、Lint、SSR 单测、设计审核与 Next 静态导出），② Desktop Visual Review（已存在的大厅/导航/人物房间回归），③ Gameplay Browser Review（完整游戏行为与公寓跨标签页一致性），④ Pages 发布成功。凡仍运行或取消的步骤按实时状态标记。

下一轮重点转向：**真正生成并提交 S01 PC/手机两张独立原画**；之后优先产出可批准的 S02 多层走廊，最后 S05/S06，逐个将原始 PNG 与正式 WebP 放进仓库并按像素、哈希、商用来源、人工审稿和 PC/手机裁切证据签署，再让本轮新的 `<picture>` 分支接受真实浏览器冷加载验收。若二进制无法经当前 GitHub 连接上传，须诚实披露阻碍，不能只更新 manifest 冒充已经入库。

**本轮交付：** 响应式高清场景加载架构、SSR 与浏览器约束、可追踪的代码版本；**未交付：** 新高清图片和五张正式 CG。
