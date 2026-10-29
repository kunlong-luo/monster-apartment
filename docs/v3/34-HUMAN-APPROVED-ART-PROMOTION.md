# V3.13 人工审核通过后的正式美术发布流程

## 要点

房间环境图（无人像）、透明人物四姿态（带 Alpha）、收藏用的**人物与环境合成 CG**是三类不同资源。
本轮生成的月纱坐姿合成图只能作为 CG 候选，不能放到 `public/art/rooms/yuesha/background.webp`，也不能充当独立透明人物。

## 正式背景晋级

1. 准备原画 `candidate.webp`（至少 1920×1080，真正 16:9；扩大原图片尺寸不能冒充原生绘制细节）。
2. `pnpm art:review --room yuesha --source ./candidate.webp --out ./art-review-yuesha`，打开 `review.html` 校准三处真实物件，检查桌面、390px、320px 预览。
3. 仔细阅读 `review-status.DRAFT.json`，在人工检查完成后建立独立 `review-status.APPROVED.json`，逐一填写所有审查字段并填写真实审核人，不得由脚本自动填充合格结论。将 `approved`、`humanVisualReview`、`rightsConfirmed`、`noBakedUI`、`noBakedCharacterInBackground`、`original`、`commercialUse` 设为经确认的 true，填 `reviewer`、`reviewNotes`、`reviewedAt`、`sourceType`、`sourceReference`，验证 `assetSha256` 与源图一致。
4. `pnpm art:promote --room yuesha --source ./candidate.webp --approval ./art-review-yuesha/review-status.APPROVED.json`
5. 工具将拒绝已有生产素材、错位锚点、图像与人工审核 SHA-256 不匹配、无效尺寸或跳过人工审核。成功时才写入 `background.webp`、`provenance.json` 并提升该房间 `backgroundStatus=production`、`layout=reviewed`；人物继续 `residentStatus=concept`。
6. 检查 `pnpm audit:room-art && pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e`，并人工查看真实页面叠层；完成后提交 GitHub，由 CI 发布。

失败时晋级脚本回滚临时添加的资源和 manifest，保留旧概念房可以继续游玩。审核脚本能证实格式、Hash、人工签署事实，但无法证明插画本身真正无白边或构图完美。

**当前状态：本轮只打通安全晋级工具，尚未上传或批准高清背景、透明动作立绘与合成收藏 CG。**
