# R12.1 · 真实原生 4K 绘景在可玩页面中的浏览器审稿

> 对应 Issue #16 独立场景和 #24 图片模糊问题。
> 本文件说明审稿流程，不是正式美术审批。三场景 production 资源未发生变更。

## 目标

既有原生 4K WebP、缩略图 contact sheet 和理论 cover 几何只能证明源像素；不能证明图片放进真实游戏后的 HUD 遮挡、人物入口、玩法交互、风格一致性及手机裁切。此流程在原画仍保持 review 状态时生成真正可用的浏览器截图。

## 执行

1. 从作者 Ebbasuke 的原始 Gloomy Mansion Background Pack 下载原包，来源页面 https://ebbasuke.itch.io/gloomy-mansion-background-pack 声明 CC BY 4.0；署名要求见 https://creativecommons.org/licenses/by/4.0/。作者许可声明不等于本项目已完成最终的商业使用审批。
2. 用现有脚本核验实际 3840×2160 图片字节、SHA-256 和来源，选择两张独立的原图作临时审稿：S02 公寓入口 bbg_entrance、S05 委托档案室 bbg_library。
3. 通过 Playwright Chromium 启动真正的 Next.js 游戏，进入公寓、委托的可用页面，以 r12-art-review=1 本地上传原始 WebP，核验 img.naturalWidth、浏览器 blob URL 与实际成功解码。
4. 对每个场景截取三种真实浏览器尺寸：1440×900 DPR1；1648×928 DPR2；390×844 DPR2。每种使用独立 context 并核验 window.devicePixelRatio，不把 CSS 尺寸冒充真正 DPR2。
5. 审稿图隐藏只在开发审稿时出现的上传面板，但保留正式玩家可见的所有 HUD、人物入口及场景控件；额外保留手机缺少竖版原图的警告截图。
6. GitHub Actions 将真实 Chromium PNG 截图和 r12-live-review-evidence.json 以 14 天期限上传到独立审核 artifact。不将任何第三方原图复制至 Git 的 public/art，也不改变游戏存档、资源清单或路由。

## 人工验收重点

| 场景 | 实际应检查什么 | 当前尚未解决的事项 |
| --- | --- | --- |
| S02 公寓 | 人物站位、四间私室入口位置、PC 面板文本和背景对比 | 古典双向楼梯不是四门走廊的已批准专属绘景；照片处理画风可能不匹配 |
| S05 委托 | 委托标题、真实操作按钮、烛光和书柜的视觉干扰、地点识别 | 古典书房不等于有契约台、印章、公告栏的独立契约大厅 |
| 手机 | 真实点击位置与中央构图是否安全、哪些物件因 cover 被裁掉 | 当前样本全是 PC 横版，缺少独立 9:16 绘景 |
| PC DPR2 | 玩家人物、金线、纹样与背景清晰度和整体风格 | 源像素足够不代表人眼画质或授权审查通过 |

**完成标准不是脚本全绿。** 审稿人员还需对场景功能、人物与场景风格一致性、作品权益、无烘焙 UI 以及独立手机原画进行验收；合格后才能另开实际美术接入 PR。

## 安全与发布边界

新测试 e2e/r12-4k-live-source-review.spec.ts 只有在 R12_SOURCE_REVIEW_DIR 和 R12_LIVE_SCREENSHOT_DIR 两个审稿环境变量同时存在时才执行，普通日常 E2E 默认跳过。

下载、解码、游戏真实页面截图任一步失败，都保留 CI 失败结果，不能自动以 Photoshop/Pillow 裁剪图冒充实机截图。本流程不改变生产 manifest；S02、S05、S06 仍为 review，Issue #16/#24 继续开放。
