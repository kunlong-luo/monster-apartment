# 怪物公寓 · 美术资源统一目录

> 唯一资源导航。旧 R12.52 文件级统计及历史记录见 [固定历史快照](https://github.com/kunlong-luo/monster-apartment/blob/0f9188a282dfa8a831b9d4d8d389a43e4ed1e2d0/docs/ART-RESOURCE-CATALOG.md)，不再把旧大小当现行文件信息。实际 Git 文件清单由治理脚本生成于 `docs/resource-inventory.json`；资源状态以各领域 manifest 为准。

| 目录 | 内容 / 用途 | 事实来源 |
| --- | --- | --- |
| [art-sources/characters/](../art-sources/characters/) | 角色 identity、cg、sprites 原始 PNG | [源图清单](../art-sources/source-catalog.json) |
| [art-sources/covers/](../art-sources/covers/) | 横竖欢迎群像 | 同上 |
| [art-sources/rooms/](../art-sources/rooms/) | 独立空景及卧室候选 | 同上 |
| [art-sources/scenes/](../art-sources/scenes/) | 各地点原生横竖图 | 同上 |
| [art-sources/review/](../art-sources/review/) | 早期具有哈希绑定的真实原画 | [审核台账](art-reviews/R12-09-REVIEW-ASSETS-2026-11-22.json) |
| [public/art/](../public/art/) | 游戏运行图、审稿图、保留回退 | [运行资源说明](../public/art/README.md) |
| [public/art/beauty-beasts/](../public/art/beauty-beasts/) | 欢迎封面、角色头像、五卡 | [CG manifest](../public/art/beauty-beasts/characters/cg-manifest.json)、[过渡转换](../public/art/r12-53-transition-manifest.json) |
| [public/art/rooms/](../public/art/rooms/) | 真实故事概念图、正式槽、八个观景层 | [房间 manifest](../public/art/rooms/manifest.json)、[观景转换](../public/art/rooms/r12-57-review-manifest.json) |
| [public/art/world-scenes/](../public/art/world-scenes/) | 工坊、街区、独立场景审稿 | [场景 manifest](../public/art/world-scenes/r12-scene-manifest.json)、[世界转换](../public/art/world-scenes/r12-61-workshop-town-review.json) |
| [public/art/feature-postcards/](../public/art/feature-postcards/) | 大厅小入口图 | [来源](../public/art/feature-postcards/source-manifest.json) |
| [v2/art/](../v2/art/) | 运行中的 Pixi 设备、角色及回退 | [资产包](../v2/art/asset-pack.v1.json) |
| [docs/art-reviews/](art-reviews/) | 审稿证据、许可、源图对比 | 具体领域台账 |
| [public/assets/aistudio/](../public/assets/aistudio/) | 历史设计参考图，非运行时原画 | 设计参考证据 |

## 统一命名与引用

新路径使用英文小写 kebab-case、稳定角色 ID（yuesha/brook/fern/cinder）、地点 ID、用途及设备类型；版本仅在同用途确有多个候选时加 v1/v2。原图 PNG 不进 public，派生 WebP 保持原生像素或有记录的下采样，禁止插值冒充原生。固定现有运行时槽名及 manifest 引用，不因治理机械改名。新的工坊独立设备原图放 `art-sources/machines/<craft>/lv2.png`（well/garden/kiln），人物工作原图放 `art-sources/characters/<id>/sprites/work.png`；实际入库后再更新源图清单，不虚构文件。派生需复用 v2 的正式尺寸/脚点和导入门禁。

## 当前可见边界

V3.103.0 人物与双端欢迎/大厅、V3.104.0 四房间观景已上线。V3.105.0 PC 工坊 V1 与街区 V2 已合并，Pages 待核验。共 27 个实际 WebP 转换输出（15+8+4）；原始 33 张 PNG 不改。两个透明站姿与两张临时收藏卡共享相同内容，但拥有既定不同槽路径与各自机器证据，不能仅因 SHA 一样直接删除；第三组为授权审稿证据及实际审稿图，同样保留，后续引用统一需专项验证。正式 CG 0/5、机器 0/9、工作人物 0/3、真实机械图集 0/3，原画人工签审不变。

## 清理

删除无用旧方案与临时文件，不删除独立原画/权利证据。先扫描静态 import、CSS、动态 URL、manifest、测试、CI、文档和外部引用，再做迁移。每批实际清理保留可追溯的旧 Git SHA、原因与机器报告。见 [R12.66](engineering/R12-66-REPOSITORY-GOVERNANCE-2026-11-24.md)。
