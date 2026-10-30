# V3.13 人工审核通过后的正式美术发布流程

## 要点

房间环境图（无人像）、透明人物四姿态（带 Alpha）、收藏用的**人物与环境合成 CG**是三类不同资源。
本轮生成的月纱坐姿合成图只能作为 CG 候选，不能放到 `public/art/rooms/yuesha/background.webp`，也不能充当独立透明人物。

## 正式背景晋级

1. 准备原画 `candidate.webp`（至少 1920×1080，真正 16:9；扩大原图片尺寸不能冒充原生绘制细节）。
2. **四间房都应使用从新原画测量的独立坐标文件**，不能把概念图位置当成正式原画位置。月纱现有未审核的概念坐标还存在 44px 方形热点碰撞，所以原样直接审核会被拒绝。先对原画实物制作独立 `anchors.json`，例如泉泡写入 `toolbox`、`gauge`、`nightbell` 三个物件的真实原画归一化位置（0–1 的 x/y）。运行 `pnpm art:review --room brook --source ./candidate.webp --anchors ./anchors.json --out ./art-review-brook`，打开 `review.html` 核对桌面、390px、320px 预览。坐标名称、范围、390px 的 44px 方形点击区域是否完整可见及不相互覆盖均在准入前自动检查；320px 裁切有真实的画面外物件入口。
3. 仔细阅读 `review-status.DRAFT.json`，在人工检查完成后建立独立 `review-status.APPROVED.json`，逐一填写所有审查字段并填写真实审核人，不得由脚本自动填充合格结论。将 `approved`、`humanVisualReview`、`rightsConfirmed`、`noBakedUI`、`noBakedCharacterInBackground`、`original`、`commercialUse` 设为经确认的 true，填 `reviewer`、`reviewNotes`、`reviewedAt`、`sourceType`、`sourceReference`，验证 `assetSha256` 与源图一致。
4. `pnpm art:promote --room yuesha --source ./candidate.webp --approval ./art-review-yuesha/review-status.APPROVED.json`。如果审核时用了独立坐标文件，晋级时必须提供**同一份** `--anchors ./anchors.json`（例如 `--room brook`）。签署后的审批 JSON 必须记录与此文件完全相同的 `objectAnchors`；不一致一律拒绝，不会自行猜测坐标。
5. 工具将拒绝已有生产素材、错位锚点、图像与人工审核 SHA-256 不匹配、无效尺寸或跳过人工审核。成功时才写入 `background.webp`、`provenance.json` 并提升该房间 `backgroundStatus=production`、`layout=reviewed`；人物继续 `residentStatus=concept`。
6. 检查 `pnpm audit:room-art && pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e`，并人工查看真实页面叠层；完成后提交 GitHub，由 CI 发布。

失败时晋级脚本回滚临时添加的资源和 manifest，保留旧概念房可以继续游玩。审核脚本能证实格式、Hash、人工签署事实，但无法证明插画本身真正无白边或构图完美。

**当前状态：本轮只打通安全晋级工具，尚未上传或批准高清背景、透明动作立绘与合成收藏 CG。**

## P0 坐标文件示意（仅数据格式，不是已审核原画坐标）

```json
{
  "toolbox": [0.56, 0.35],
  "gauge": [0.65, 0.50],
  "nightbell": [0.78, 0.70]
}
```

以上数值**只是说明格式的示例**；必须在实际新原画里人工测得并按审阅画幅修正，不得直接用示例作正式上线坐标。四间房的脚本都支持 `--anchors`。需要修改热点时重新生成未审核的 DRAFT 并重新审阅，不能在签名后偷偷改动坐标。
