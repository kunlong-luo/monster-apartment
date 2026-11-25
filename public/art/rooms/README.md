# V3.9 四间独立私室与逐层美术准入

`{id}/concept-scene.svg` 是四间不同的 1920×1080 无人物室内概念背景；当前可玩，并非最终 CG：
- `yuesha`：紫金契约会客室；`brook`：蓝色铜管休息间
- `fern`：叶影温室；`cinder`：炉火修补间

`manifest.json` 使用 **version 2**，不再让一项合并状态同时决定背景和角色：
- `backgroundStatus=concept|production`：背景独立准入；生产背景必须为至少 1920×1080 的无人物 WebP，且 `layout=reviewed`
- `residentStatus=concept|production`：角色独立准入；正式四姿态 WebP 至少 1000×1000、有 Alpha、同画布与脚点
- **只有两层都已准入才使用 `composition=separated`**；其他组合使用 `layered-concept`，准确呈现未完成的层
- `provenance.json` 需由人确认原创性与商业授权，并分别记录背景或人物的视觉检查

目前四间仍是 **0/4 正式背景、0/4 正式角色**；`background.webp` 和 `poses/*.webp` 仍是未来资源路径，未生成、未审核之前绝对不能把任一状态改为 `production`。

`pnpm audit:room-art` 在 CI 中执行文件头、尺寸、Alpha 标志、路径与分阶段审核检查；Alpha 标志只能证明文件声称有透明通道，无法证明边缘真的干净，须人工查看。热点仍由 `src/core/room-stage-layout.ts` 控制，换背景后需逐个核对桌面与 390px 移动端。详见 `docs/v3/30-ROOM-ART-STAGED-ADMISSION.md`。

V3.11 正式绘景需要在 manifest 中配置 `objectAnchors`（归一化 x/y），再由 `projectCoverAnchor` 计算响应式热点位置，详见 `docs/v3/31-ROOM-HD-RESPONSIVE-PROJECTION.md`。

V3.13：经人工审核的背景可通过 `pnpm art:promote` 原子式晋级，审查 SHA-256、真实来源、三个画幅签署和画作 16:9；失败回滚。详见 `docs/v3/34-HUMAN-APPROVED-ART-PROMOTION.md`。

V3.14：人物四姿态可用 `pnpm art:poses --room yuesha --source DIR --out REVIEW` 打包检查，正式角色单独要求 `portrait-provenance.json`，不再复用背景审核结论。详见 `docs/v3/35-TRANSPARENT-POSE-ART-PIPELINE.md`。

## R12.100 · 运行与审稿用途分类（迁移后）

| 实际路径（相对于 public/art/rooms/） | 媒体数 | 用途与处置 |
| --- | ---: | --- |
| `{id}/concept-scene.svg` | 4 | 正常故事视图、观景失败回退，保留 |
| `{id}/scenic/background.webp` | 4 | 1672×941 正常观景背景，亦可用于显式审稿 |
| `{id}/scenic/standing.webp` | 4 | 1086×1448 透明站姿，正常观景与显式审稿共用；brook/cinder 同时供收藏卡使用 |
| `../room-review/yuesha-salon-candidate.webp` | 1 | 月纱显式研究预览，保留；存在已登记文档重复证据 |

房间 ID 为 yuesha、brook、fern、cinder。已将八个常规观景层移至各角色稳定路径 `{id}/scenic/background.webp`、`{id}/scenic/standing.webp`，与预留正式背景 `{id}/background.webp` 及正式四姿态 `{id}/poses/` 区分；不能以重命名替代人工审核。迁移须同步 roomScenicArt、显式本地审稿入口、R12.57 转换器/审核器及输出 manifest、两张共享卡的注册/CG 审核及 R12.53 manifest、去重与浏览器断言、资源总目录。保留原 Git blob、SHA-256、Alpha、尺寸、概念状态与现有热点坐标；前置修复 Quality/Pages 已通过；本轮路径迁移已实施，原字节保持不变，新提交待 CI 验收。

R12.100 第二批：四个房间的 8 张常规观景/显式审稿共用 WebP 原 Git blob 迁至 rooms/<id>/scenic/{background,standing}.webp；roomScenicArt 统一普通观景与显式审稿的路径解析；R12.57 转换、审核与输出清单、R12.53 转换清单、CG 预览注册及审核、单元与真实浏览器断言同步。泉泡、炽角仍共享站姿，四张 concept-scene.svg 与独立月纱 room-review 保留，正式 room manifest、剧情热点、原画、Alpha、SHA-256、审批、存档不变；旧四个 review 目录防回流。公开媒体 43、全仓 141，未新增美术。前置修复 029f019 已通过 Quality/Pages；本次提交仍须独立验收。下一批 R12.101 整理根目录散落肖像与大厅图。
