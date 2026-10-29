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
