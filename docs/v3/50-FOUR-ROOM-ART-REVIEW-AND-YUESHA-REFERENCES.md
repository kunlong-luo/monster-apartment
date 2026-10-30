# V3.50 · 四间人物私室美术候选预览与月纱角色参考图（2026-10-30）

> **工程已提交，正式立绘仍未通过准入。** 这一阶段扩展房间审核工具，不将尚未具备真实透明 Alpha 的参考板伪装成角色动作资源。

## 可用的开发功能

- 四间房：月纱 `/apartment/?roomArtReview=1`；泉泡、青枝、炽角 `/characters/?roomArtReview=1` → 点击人物“拜访私人房间”。
- 普通玩家视图不会显示任何新审核控制。带 `roomArtReview=1` 才显示**位于场景下方**的可折叠审核区。
- 每间房独立上传本地 WebP 背景，实时叠加当前人物层、氛围光与现有剧情场景；提供一键恢复当前正式场景。
- 载入同尺寸 WebP 四姿态 `idle/attentive/warm/guarded`，已有 Alpha 像素预检查继续拒绝全背景画面、非法尺寸和不同尺寸画布。仅成功的单帧才进入可选姿态列表。
- 本地 Blob URL 在换图/退出后释放；候选图片**不写入浏览器保存、角色档案、游戏经济、Zustand、Dexie 或 GitHub**。
- 工匠在工坊值守时不在自己房间重复显示演员，仍可以临时查看**空景候选**。
- 泉泡、青枝、炽角 manifest 暂时**没有审核完毕的背景物件坐标**；候选背景叠加时保留概念版热点定位，并明显提示“仅检查构图，正式热点须独立标定”。不得据此宣称候选背景已完成物件对齐。

## 本阶段新生成的月纱人物参考

本轮两张结果是**场景＋人物＋表情嵌图的综合参考板**，不是独立角色贴图；已在图像像素审查中拒绝用作 `public/art/rooms/yuesha/poses/*.webp`。

归档位置：`/游戏调研/怪物公寓/美术归档/2026-10-30/yuesha-pose-reference-boards-2026-10-30.zip`

内含两张参考原图、`alpha-preflight-REJECTED.json` 和说明。审查事实：

| 文件 | 图片尺寸 | 透明像素（α ≤ 16，128×128 采样） | 准入 |
| --- | --- | ---: | --- |
| concept-board-01.png | 1672×941 | 0% | 拒绝：文字、背景、人物同画布 |
| concept-board-02.png | 1673×940 | 0% | 拒绝：文字、背景、人物同画布 |

**PNG 带 RGBA 通道不等于人物被正确抠出。** 两张画面均不是四个独立动作文件；不能硬剪人物、透明涂抹背景或放大到 1000px 冒充真实精细透明立绘。当前四间背景与演员资源均保留 `concept` 状态。

## 下一步真实素材准入

1. 由独立人物画师/模型输出四张**相同画布、同脸同脚点**的纯角色 WebP，真实透明，无遮挡、无烘焙场景。
2. `pnpm art:poses --room yuesha --source /path/to/four-webp --out /tmp/yuesha-pose-review`；在 `review.html` 核对透明边缘与差异动作，在游戏本地预览中测试构图。
3. 月纱空景 A/B 参考 [V3.49](49-YUESHA-HD-BACKGROUND-CANDIDATES.md)，仍须核对真实道具位置，不能沿用旧候选的蜡封/茶杯坐标直接晋级。
4. 分层通过审查/版权/同脚点后才能设置 `residentStatus=production`；背景独立晋级，**两层都审核后**才允许 `composition=separated`。
5. 通过 `pnpm audit:room-art`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build`、`pnpm e2e` 与 GitHub Pages 部署后再宣布上线。

## 对应工程与回归

- 新组件：`src/components/game/room-art-local-preview.tsx`（共享开关、状态、暂存 URL、四姿态面板）。
- 调用者：`yuesha-private-room.tsx` 和 `worker-private-room.tsx`。
- E2E：`e2e/character-room-mobile.spec.ts` 中新增三工匠的本地预览与 Alpha 拒绝，以及普通玩家无审核面板的验证。
- 七条正式导航路由和既有剧情存档键保持不变。

**尚未交付**：四帧真实独立透明原画、商用授权确认、四间正式背景与角色资产的人工验收、未完成 CI 的发布声明。
