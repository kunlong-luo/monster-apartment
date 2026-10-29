# V3.11 · 月纱高清绘景投影和响应式交互

## 本轮代码

- 概念场景热点保持 V3.10 的原位置；生产画面依照源图归一化坐标和 CSS `object-fit: cover` 裁切投影。
- `RoomSceneHotspots` 与 `RoomSceneFocus` 通过 `useRoomStageSize` 共用实际容器尺寸，横竖屏和窗口缩放时同步更新。
- 生产背景采用 `object-position:center`；旧的四间概念绘景保持 `object-[18%_43%]`，避免无意改变基线。
- 资源审核新增物件位置、44px 移动端热点完整性、相邻热点不重叠等门禁。画面换成正式背景才启用新锚点。

## 月纱候选无人物高清原画的道具锚点

候选 2560×1440 WebP 已在本轮对话生成，但 **尚未导入 GitHub**，不能视为上线资产。三个原画锚点（x、y 归一化）写入 `public/art/rooms/manifest.json`：

| 调查物件 | x | y | 画面对象 |
| --- | ---: | ---: | --- |
| 月纹蜡封 | 0.600 | 0.815 | 桌面红色封蜡 |
| 香料茶杯 | 0.535 | 0.720 | 茶杯附近 |
| 旧账簿 | 0.770 | 0.815 | 桌子右侧的叠放书册 |

人工最终审核仍需查验旧人物不透明素材是否遮挡画面；上传新背景不代表完成四张透明姿态。

## 正式上线前的真实门禁

1. 将审核过的 WebP 放入 `public/art/rooms/yuesha/background.webp`，确认 2560×1440 是从较小生成图片放大导出，不能宣称新增原生细节。
2. 审核人逐项核对构图、授权来源、角色/按钮未烘焙、三件物品的真实可见位置，产出 `provenance.json`（`original`、`commercialUse`、`reviewer`、`reviewNotes`、`noBakedUI`、`noBakedCharacterInBackground`）。
3. 浏览器中检查桌面和 390px 触控位置、人物遮挡、镜头视野，必要时修改 `objectAnchors`。
4. 仅对月纱设置 `backgroundStatus=production`、`layout=reviewed`；仍保持 `residentStatus=concept`、`composition=layered-concept`。
5. 执行 `pnpm audit:room-art`、`pnpm typecheck`、`pnpm test`、`pnpm build`、Playwright；CI 成功后由 Pages 自动发布。

当前版本继续显示原概念场景，以免将尚未入库或审核的候选图误标为正式 CG。
