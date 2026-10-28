# V3.7 美术准入与无重复人物

## 现状
lobby-hero-v3.webp 已有月纱，yuesha-bust-v3.webp 同样带环境背景而非透明精灵。直接叠加会出现双人像。
概念期月纱只显示背景中的人物，不重复叠加不透明立绘；剧情表演仍提供文字和状态反馈。
工匠房间临时裁切为右侧建筑区域，降低其他人物画进房间的影响。

## 正式素材规范
- public/art/rooms/{id}/background.webp：1920×1080 起，不包含人物、UI、文字或热点。
- public/art/rooms/{id}/poses/{idle,attentive,warm,guarded}.webp：每张至少 1000×1000，必须带透明 alpha。
- public/art/rooms/{id}/provenance.json：原创和商业使用权、人工检查确认。
- public/art/rooms/manifest.json：统一状态、构图、文件路径和热点复核标记。

## 可执行门禁
pnpm audit:room-art 检查路径、WebP 格式、尺寸、Alpha、四帧齐全、原创声明与人工复核记录。
只有 status=production、composition=separated、layout=reviewed 才启用正式资源，否则 CI 拒绝发布。
当前四间均为 concept，不会请求不存在的生产素材，也不会假装拥有真实逐帧动画。
机器无法单靠格式检测图中的人物或 UI，必须有人工审阅其视觉内容。

## 交互回归
热点改用物件 ID 而非数组顺序做定位，换原画后应重新标定物体坐标。
人物故事、可回听话题、保存机制和经济规则均不变。
Playwright 检查月纱概念阶段无重复立绘、工匠房间、手机热点、剧情互动与页面路由。

本轮是资源集成管线和现实问题修复，不声称完成独立高清 CG、嘴形或真实眨眼序列。