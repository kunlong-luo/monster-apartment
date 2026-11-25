# R12.60 · 普通玩家私人房间观景模式

基线：V3.103.0 main `39138900aa5fce15cb252e76c421e0cdb962b50b` 的 Quality [45367162750](https://github.com/kunlong-luo/monster-apartment/actions/runs/45367162750) 与 Pages [45367299176](https://github.com/kunlong-luo/monster-apartment/actions/runs/45367299176) 已成功。PR #55 已上线。R12.57/58 八个实际独立层的 [浏览器验收](https://github.com/kunlong-luo/monster-apartment/actions/runs/45366813681) 已全部成功；本轮从 `a44c6c7f727afd19c95cc92c6fabbac740de932c` 按 Git blob 迁入八个 WebP、审稿代码、校验、历史证据与既有测试，不重新编码。新版本 V3.104.0 候选未合并。

## 玩家可见变化

复用既有观赏场景按钮（PC 原位置，手机右下角 44px 高）；默认故事视图与原三个剧情物件、对话及记忆完全保留。普通玩家进入观景时按同一角色 ID 加载 1672×941 独立背景与 1086×1448 全身透明人物。PC 扩展 16:9 场景；手机为现有横图 cover 裁切，非独立手机绘景；角色在画面居中。值守工匠仍仅显示离开状态。关闭观景恢复旧可交互背景、原调查按钮、剧情栏和档案；没有调用新的存档或经济操作。观景静态站姿不是独立骨骼动作。保留环境光效及减少动效处理。新场景未画全剧情实物，故观景不暴露错误热点，参见 [R12.59](../art-reviews/R12-59-ROOM-PROP-AND-COMPOSITION-AUDIT-2026-11-24.md)。

## 边界及验收

`roomScenicArt` 为展示用途，非 production；原 `rooms/manifest.json` 背景与姿态均保留 concept，R12.57 审稿 manifest 仍描述当时转换性质，八张相同 WebP 可共享展示与审稿用途。审稿 query 仍独立，正常玩家无审核面板。保留旧原画及旧剧情物件位置；不作人工签署、不声称原生4K，正式 CG 0/5。

Quality 新增八层实际来源/哈希/尺寸/透明校验。定向测试 1440×900/390×844、四房间加载尺寸和URL、退出恢复、lore 字符串不变；原值守用例增加观景不复制工匠，原审稿回归保留。Desktop Visual Review 新增独立房间用例。以实际 CI、PR 及 Pages 最终 SHA 为准。

R12.100 第二批路径说明：八张运行与显式审稿共用图迁至 `public/art/rooms/<id>/scenic/{background,standing}.webp`，原始转换状态、像素及哈希不变。历史审稿记录保留当时路径，现行路径以资源总目录与机器清单为准。
