# V3.12 高清房间资产候选自动审核

## 命令

在仓库根目录，准备已经导出的、无人像且无 UI 的 16:9 WebP：

```bash
pnpm art:review --room yuesha --source /path/to/yuesha-contract-room-hd-candidate.webp --out /tmp/yuesha-art-review
```

命令会检查 WebP 头、长宽和 16:9、`manifest` 三个物件锚点、390px 触控区域，自动创建：
- `background-candidate.webp`：仅候选，不会替换游戏中的背景
- `review.html`：桌面 1200×675、手机 390×315、窄屏 320×315 三个画面投影，真实锚点与被裁切区域
- `review-status.DRAFT.json`：空白的人审记录，不伪造审核者和版权/视觉检查结论

审核页从浏览器直接打开即可（相对路径，无服务端、无网络请求）；`pnpm test` 覆盖 WebP 识别与缩放投影逻辑。

## 艺术审查

1. 人工检查页面中每个热点是否落在真实桌面物件上，角色独立展示是否遮挡物件或窗景，环境是否有重复人物、烘焙 UI、文字或错误透视。
2. 仅审核通过后，将图复制到 `public/art/rooms/yuesha/background.webp`，填写正式 `provenance.json`（不可直接把 DRAFT 改名作为通过）；把 `backgroundStatus` 改为 `production`、`layout` 改为 `reviewed`，保留 `residentStatus=concept`。
3. 本机与 CI 都需检查 `pnpm audit:room-art`、`pnpm test`、`pnpm build`、Playwright 的四间房、存档与移动端流程；通过后才发布。
4. 没有透明真实四姿态帧前，不能声称“角色动画”已经生产完成。

**当前 GitHub 仍是概念房；此工具只自动化实际美术审查前的重复工作，并不提供假的批准。**
