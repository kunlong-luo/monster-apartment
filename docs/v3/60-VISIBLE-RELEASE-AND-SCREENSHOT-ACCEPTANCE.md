# V3.60 · 玩家可见更新、版本识别与浏览器截图验收

## 原因
前几轮主要修改 `/characters/#summon-screen`，玩家常看根路径 `/`；欢迎、大厅、召唤页缺少一致的可见发布标记和逐轮截图对照，即使提交、CI、Pages 成功也难以确认画面区别。

## 已实现
1. 同一静态 UI 版本 `V3.60` 显示在欢迎页顶部、大厅品牌及左侧契约卡、召唤页品牌中。版本标签不等于部署 SHA。
2. 欢迎页在既有标题区放入月纱、泉泡、青枝、炽角四张实际可用的独立脸部缩略图；不新增第二个开始按钮，不替代精美封面原画，不冒充完整透明 CG。
3. 大厅左侧既有契约卡改为更清楚的深酒红视觉、统一人物缩略图脚本和版本角标，引导玩家直接进入 `/characters/#summon-screen`；保持中央人物、右侧互动与唯一底部七项导航。
4. Playwright 必须分别确认欢迎、大厅、召唤页 V3.60 标识、真实角色头像、有效召唤入口；并保存桌面/手机欢迎图和召唤图到 Quality workflow art review artifact（保留 14 天）。
5. 官方入口：`https://kunlong-luo.github.io/monster-apartment/`；召唤直达入口：`https://kunlong-luo.github.io/monster-apartment/characters/#summon-screen`。
6. **完成标准**：对应 SHA 的 Quality 所有 jobs success + Pages 部署 success + 截图产物确实可下载，才能向用户称本轮上线。

## 未完成
参考 PNG 逐像素人工审图与高质量、四姿态、人物脸部一致性的正式 CG 原画仍待独立验收；不能因为新增版本标签与高清脸部缩略图而称已经完成收藏级角色素材。
