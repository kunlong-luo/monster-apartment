# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
- 模拟经营、人物收集与哥特幻想题材的玩家；主要按 PC 大屏游玩，也需要可用的手机 Web 体验。
- 玩家希望自动发展工坊、通过召唤获得风格不同的成年角色，欣赏人物和场景，并逐步解锁专属房间、对话和隐藏剧情。

## Product Purpose
《怪物公寓》（Monster Apartment）是带自动生产的 2D 哥特幻想人物收集游戏。玩家从召唤获得人物，探索七个相互连通的游戏页面，经营工坊、制作装备和推进故事；人物和世界画面必须值得玩家停留观赏。

## Operating Context
- 正式路由仅 `/`、`/apartment/`、`/workshop/`、`/town/`、`/orders/`、`/characters/`、`/warehouse/`。
- 常见桌面验收尺寸 1440×900、1648×928；手机约 390×844。
- 通过 GitHub Pages 静态发布，可从游戏首页进入七个目的地。
- 抽卡动画完成后要能无障碍、不中断地查看完整人物契约卡；十连支持自动揭晓和手动回看。

## Capabilities and Constraints
- Next.js 16 / React 19 / TypeScript strict / Tailwind v4；Motion 管 UI 动效、PixiJS 8 管 2D 场景与粒子。
- 单抽、十连、收藏、房间、派工生产、委托、锻造、装备以及保存机制都必须保留。
- 抽卡的概率、90 抽保底、十连 SR+、重复人物奖励和持久化已具有正式逻辑，设计改动不得触碰结算。
- 不新增独立 V2/旧路由，不恢复冗长滚动后台 UI、无意义按钮或重复入口。
- 优先使用成熟且维护活跃的依赖；普通 CI 轻量，重要视觉改动另做真实浏览器截图检查。

## Brand Commitments
- 用户已确认黑紫、酒红、暗金、哥特月蚀风格与此前认可的截图布局是不可随意替换的视觉基线。
- 人物以具有彼此不同的脸型、服饰和性格的成年美女为主体，野兽为有独立身份的契约伙伴；不得换回宠物式丑怪物。
- 大厅以全屏绘景与中央人物为主，七项导航与资源信息紧凑安置在边缘。
- **不使用 Lucide Sparkles（闪光星）图标**；使用 Diamond、Crown、MoonStar、Gem 等有明确含义的图标。

## Evidence on Hand
- `public/art/beauty-beasts/characters/*/face.webp`、`public/art/yuesha-portrait-v3.webp`：已存在的独立人物肖像。
- `public/art/rooms/*/concept-scene.svg` 为概念背景，四套正式高清无人物房间 CG 尚未全部入库。
- `src/components/summon/`：V3.72 的电影式抽卡、十连与收藏卡组件；现有图像仍是肖像而非正式透明全身 CG。
- 真正的视觉质量要通过 `Desktop Visual Review` 的 Playwright 截图判断，编译成功不足以代表美术验收。

## Product Principles
1. 玩家首先看到的是**真实人物与世界**，然后才是 UI。
2. 每个操作都必须改变真实游戏状态，纯装饰不得冒充按钮。
3. 场景美术、人物立绘、热区交互与 HUD 清楚分层。
4. 设计精简、动画有节奏、导航一致；不为了华丽增加屏幕噪音。
5. 资源缺失或概念图未通过验收时，明确区分“肖像过渡版”和“正式高清原画”。
