# R12.0.6 · 在真实游戏页面临时预览本地场景原画

> 目标：直接在已有的公寓、委托大厅和仓库 UI 中审核场景构图，避免“候选图放在审稿 ZIP 看着不错，实际被游戏面板挡住”的问题。关联 [#16](https://github.com/kunlong-luo/monster-apartment/issues/16)、[#24](https://github.com/kunlong-luo/monster-apartment/issues/24)。

## 如何在现有网页使用

打开任意一个场景，在 URL 后添加 `?r12-art-review=1`：

- `/monster-apartment/apartment/?r12-art-review=1`
- `/monster-apartment/orders/?r12-art-review=1`
- `/monster-apartment/warehouse/?r12-art-review=1`

页面右下角将出现 **R12 本地场景审稿** 小面板。选择你本地的 PNG、JPEG 或 WebP，浏览器会将它临时用作当前场景的背景，并显示原始像素及是否达到**该画幅的最低尺寸**。审稿人能够直接看出实际经营面板遮挡了哪个区域、焦点是否正确。按“恢复原场景”清除预览；刷新网页会自动清除文件和预览。未加审稿参数时任何用户都看不到该功能。

该机制只使用浏览器的 `URL.createObjectURL`，**不上传任何图片，不保存图片、修改存档或改变生产资源 manifest**；旧图和已审核的新图只有在选择本地文件时才被当前页面临时遮住。

### 使用六原图包

先从会话下载 `r12-six-original-scenes-review-2026-11-16.zip` 并解压，再选择 `assets/apartment-mobile.png` 等真实 PNG。也可使用本轮 `r12-s05-desktop-environment-revision-review.zip` 的备用桌面场景评估构图。可用 PC/手机浏览器分别检查是否遮挡主要控件；无需先把未批准的二进制资产塞进 Git 仓库，也无需绕过原生尺寸审核门禁。

### 边界与风险

- `review` 图片的显示是**临时人工评估模式**，不能算上线。正式资源必须继续走 SHA、原生高分辨率、授权及人工审稿门禁。
- 最低像素只是粗粒度信息。需用 [R12-03 原图 DPR 核查](R12-03-ORIGINAL-PIXEL-BUDGET.md) 计算 cover 采样与高密屏风险；不能把 1672×941 插值生成的 2560×1440 WebP 当成合格原画。
- 本地选择的文件只显示在当前路由、当前会话。其他用户不会看到，且不会改动订单、库存、自动工坊、存档或生产图。
- 临时预览会在 S05/S06 **同时替换全景背景和顶部横幅**，避免旧 360×228 工坊缩略图干扰场景构图审核。恢复后，两处均回到正式游戏所用资源。预览不等于最终全页美术上线：其他经营 UI 不被改动，仍需独立完成最终原画与移动端审稿。
- 没有经测试的正式原生 PC/手机高清新图，因此 #16/#24 依旧开放。

## 自动回归

`e2e/r12-local-scene-preview.spec.ts` 检查：
- 带审核参数时出现审稿器，未带参数时没有任何审稿 UI。
- 选一张本地 PNG 后，背景使用本地 blob URL，生产 manifest 仍未升级。
- 按恢复、刷新后图像不会残留。
- 公寓、委托、仓库三个正式路由均能以同样机制预览。

这项测试加入 Desktop Visual Review；独立高清场景生产与全面浏览器验收仍须在后续素材 PR 完成。
