# V3.49 · 月纱会客室独立环境原画候选（2026-10-30）

**当前状态：两张原画候选已生成并保存到项目美术资料库；尚未以二进制形式提交 GitHub，尚未通过人工审核，尚未进入正式游戏资源。**

## 可复用的候选文件

个人文件库目录：`/游戏调研/怪物公寓/美术归档/2026-10-30/`

- `yuesha-room-art-candidates-2026-10-30.zip`：包含原始 PNG、两个 1920×1080 WebP 审核导出、两份素材元数据、对比图。
- `yuesha-room-candidates-side-by-side.jpg`：A/B 无人物场景对比。

| 版本 | 原始输出分辨率 | 审核导出尺寸 | WebP SHA-256 | 设计侧重 |
| --- | --- | --- | --- | --- |
| A | 1672×941 | 1920×1080（重采样） | `506d55e76e31dc18cf38c0a8cd19495771b9efddfbcfba2ab52eb688da83e263` | 书架纵深、中央契约桌、月光城堡、前景茶具 |
| B | 1536×1024 | 1920×1080（先裁成 16:9、再重采样） | `32b916438332af504ed8ca4371a30d40c1e82bdc3305a8b44eecac3339fb2504` | 明显的独立表演空间、花束与更开阔的月光窗 |

图片来自本轮画面生成；**原始生成尺寸不等于 1920×1080**。审核导出的尺寸仅用于既有背景预览管线，不能把像素插值误记为原生细节。两张原画都不能自动视为商业可用授权已审核。

## 四步接入路线

1. 从资料库取回上述 ZIP，解压在**仓库外**的审稿目录。选择 A 或 B；核对场景内实际有无月纹蜡封 `seal`、香料茶杯 `tea`、旧契约账簿 `ledger`。如其中任何一件不够可辨，必须返工原画，不可随意给空白位置设热点。
2. 将物件实际位置标注为 0~1 的归一化画面坐标，另存 `yuesha-anchors.json`，格式见下方。**不要直接沿用概念版旧锚点**，旧锚点在 44×44px 正方形点击区存在碰撞。
3. 对候选 A 或 B 运行：
   ```bash
   pnpm art:review --room yuesha --source /path/to/candidates/A/background-candidate.webp --anchors /path/to/yuesha-anchors.json --out /tmp/yuesha-hd-review-A
   ```
   查看本地 `review.html` 的桌面（1200×675）、390px、320px 画幅，检查光照、角色站位、三件物品与点击区。审批单先保持 DRAFT 状态。
4. 只有图像来源、视觉质量、真实物件坐标、三屏交互、授权信息均通过人工审核，方可调用 `pnpm art:promote --room yuesha --source ... --approval ... --anchors ...`。先晋级无人物背景，继续保留 `residentStatus=concept`；四姿态真实透明立绘分别审核，全部完成后才可能晋级 `composition=separated`。每次发布必须通过完整 CI 与 Pages。

锚点 JSON 示意（**占位值绝不能直接提交审核**）：

```json
{
  "seal": [0.0, 0.0],
  "tea": [0.0, 0.0],
  "ledger": [0.0, 0.0]
}
```

## 当前明确未完成

- 候选 A/B 都还没有经最终构图、原生细节、画中物件定位、三屏裁切与商用授权的人工审查。
- 两张高清二进制还未上传到 GitHub `public/art/rooms/yuesha`。通过 GitHub 已连接的**文本文件**接口不能把资料库 ZIP 自动等同于 Git 树中的 WebP 资产。
- 月纱的四张独立透明人物姿态 `idle/attentive/warm/guarded` 还未制作与验收；不要复用含背景的图片或同一立绘变形代替四帧。
- 保留七页面路由、人物剧情存档以及现有 `concept` 标记；不要将候选素材写进正式生产 manifest。

## 质量门禁

`pnpm audit:room-art && pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e`

2026-10-30 之前的 `Quality` 工作流曾因跨页面 E2E 的 URL 断言和首次导航等待失败；对应测试已在 2026-10-30 修复，**仍应以新一轮完整 Quality 的最终绿灯为准**，且只有 Pages 自身成功才能声明上线。
