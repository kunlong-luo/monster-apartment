# R12.57 · 四私人房间真实分层审稿

基于 PR #55 候选 `0c851a65424d531cf70a3cf2195c85bcc802e792` 独立后续分支 `r12-57-room-art-review`；不推送 PR #55，也不取消其全量验收。R12.56 同一 SHA Quality 64 文件 / 320 测试、Desktop Visual Review、R12 Art Pixel Evidence 通过；完整 Gameplay 尚未返回。未合并或上线，版本不变。

## 资源

四间背景来源 `art-sources/rooms/<id>/background.png`（1672×941），四人物站姿 `art-sources/characters/<id>/sprites/standing.png`（1086×1448 RGBA）。转换脚本校验真实 PNG Git blob、尺寸、SHA-256、解码、透明像素及 WebP alpha 无损保留；报告 >=230 alpha 比例、四角、边界，并标识需要透明度返工的素材。现有 inventory 中完全不透明像素数量很少，不能只凭 alpha 最大值 255 就宣称人物透明边缘合格。目标 8 个 WebP 放在 `public/art/rooms/<id>/review/`，机器证据由实际转换生成。未核验作业前不声称文件已入库。

## 实景分层

复用已有 RoomSceneBackdrop、RoomResidentSprite 和审稿面板；`roomArtReview=1` 下显式选择新房间与独立人物。普通玩家继续 concept / 原物件交互；审核时隐藏旧物件热点，避免点击错误物件。新素材低于正式背景 1920×1080 门槛，禁止通过旧物件合成编辑器放大后冒充原生高清。单张站姿不写入四个正式动作槽；保持排班、剧情、存档和正式 manifest 不变。切换真实 URL 审稿标识重新建立临时房间视图，释放旧审稿状态。保留旧月纱 1920×1080 研究图及本地上传工具。

定向 Playwright 检查四房间、PC1440及手机390真实加载尺寸，原有概念场景复位，热点隔离及保存截图。独立分支尚待转换输出、实际浏览器与用户验收。正式晋级前要定位每一真实物件，确保 44px 点击区域、手机遮挡、脚点和身份、权利签署；补足四种独立动作和原生高清背景。不能把审稿分层当作四间正式私人房间重制完成。

R12.58：转换已成功，8/8 实际输出及来源匹配，详见 [真实输出与透明度检查](R12-58-ROOM-OUTPUT-EVIDENCE-2026-11-24.md)。
