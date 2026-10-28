# 私人房间三层式演出与调查（2026-10-28）

本轮范围：七个已发布页面中的人物私室视图，不新增路由，不重做已有生产/公寓存档。

## 职责与视觉图层

1. **环境背景** — `src/components/game/room-scene-backdrop.tsx`。原画静止、高清展示；月纱为香槟金×紫月，泉泡冷蓝，青枝绿银，炽角赤铜。月光、烛光与暗角通过单独的非交互层呈现。不得对背景绘景做持续 scale/translate/blur，避免切页重采样失真。
2. **人物精灵** — `src/components/game/room-resident-sprite.tsx`。各角色绘景有轻微呼吸感，玩家调查物件时呈现独立的表演短句。值守工匠不同时出现在工坊和私人房间；使用便条代替人物。遵守 reduced-motion。
3. **物件交互** — `src/components/game/room-scene-hotspots.tsx` 与 `src/core/room-stage-layout.ts`。保持 44px 可点击区域、键盘操作、已发现标记、场景内的说明及持久化调查记录。调查进度存在 `monster-apartment:character-life:v1`；不写经济存档。

## 剧情状态与隐藏对白

- 调查某件物品时，`src/core/room-scene-reactions.ts` 为人物层提供短句，核心线索仍由现有场景说明与调查手册负责。
- 月纱的三件物品（蜡封、茶杯、旧账簿）全部调查后出现“杯垫背面的密语”。文本根据先前 `transparent/careful` 选择变化；未选择则只给伏笔。
- 隐藏对白从 V1 已有 observations 和 decisions 即时推导，不增加新存档字段，不提早揭秘第三章真相。
- 四室共鸣由原有 `roomInvestigationConclusion` 负责，不重复发放物品、收益或稀有度奖励。

## 美术素材边界

当前背景仍使用现有 `lobby-hero-v3.webp`，这轮是**真正的结构分层与独立演出**，不是已经制作了正式四房独立 CG。设计示意图（含 UI 的整图）不能作为可以点击的室内背景直接嵌入。正式替换时为每个角色提供不包含菜单、按钮、标签的纯背景；透明人物资产与场景坐标独立交付，保持美术尺寸与点击热点一致。

## 验收

- `room-scene-backdrop`、`room-resident-present-*`、`room-resident-reaction` 和 `yuesha-room-easter-egg` 可由 E2E 验证。
- 四名角色的热点调查、剧情分支、跨房线索与重载存档继续成立。
- 390px 移动端热点必须落在场景范围内；Esc/返回可关闭房间。
- 完整执行 typecheck、lint、unit、build、七页 route-health 与 E2E；只有 GitHub Actions 确认后才能宣称本轮通过。

## V3.5 可回听话题与收藏记忆

- `src/core/room-conversations.ts` 定义每位角色三组可回听话题：一组初始可见、其余由已有物件观察解锁。封锁话题在界面中仅展示必要的调查提示，避免提前剧透。
- `src/components/game/room-conversation-topics.tsx` 为月纱和三位工匠提供实际可操作的交谈选项；工匠值守时禁用现场聊天，不会出现“分身”。第一次交谈的重要立场选择仍保持不可重复。
- `src/components/game/room-memory-gallery.tsx` 在角色页生成四张可收藏的回忆卡。收藏自动由旧存档 observations 推导，无第二套库存、无抽卡概率、无虚构收益。卡牌使用当前角色绘景作为临时封面，正式 CG 素材留待替换。
- 新增单元测试和浏览器检查，覆盖“未调查不能提问”、“调查完解锁”、“四室全完成自动出现收藏卡”、“重载存档可继续回看”。
