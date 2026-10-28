# V3.0 世界状态、事件、剧情与任务模型

> 状态：设计基线（未实现）。本模块从单日生产规则解耦，支持七个页面统一叙事，不合并当前公寓与工坊的金钱余额。参见 [自动生产 PRD](02-AUTO-PRODUCTION-PRD.md) 和 [剧本](05-MAIN-STORY-SCRIPT.md)。

## 1. 设计目标

- 只有**真实完成的经济行为/调查/人物决定**才能解锁剧情；不做「点击 10 次」的空任务。
- 在工坊以外页面继续生产，剧情弹窗暂停视觉演出而非意外暂停领域模拟（只有玩家显式暂停经营例外）。
- 剧情可记录已看、未看、已完成、已跳过；玩家同一事件不得重复领奖。
- 主线可追溯、不可软锁：订单失败、角色意见冲突、资源不足只能增加可恢复路径，不永久关掉第一章。
- 支持玩家在结局后自由经营。剧情、人物关系不会因为再次查看图鉴被重置。

## 2. 权威状态边界

| 领域 | 当前位置 | V3 方向 | 禁止做法 |
|---|---|---|---|
| 工坊设备与物料 | 旧 V2 存档与 Dexie 镜像 | 单一 V3 工坊模拟快照、原子结算 | 前端组件自己扣材料 |
| 公寓房间/灵核 | 旧 cozy v1 存档 | 先保持独立规则，逐步暴露只读事件 | 直接把公寓金币算入工坊币 |
| 世界章节/任务 | 尚无权威共享存档 | 新增 WorldProgress v1（独立键） | 分别在七页各存一份章节状态 |
| 角色关系 | 无稳定的主线成长系统 | 人物事件与少量可信关系状态 | 点爱心/送同一礼无限刷取 |
| Pixi/React 动画 | 目前有状态动效 | 根据领域事件播放，仅仅是投影 | 播放完成动画就发钱/推进章节 |

## 3. 建议的序列化模型（伪接口，不代表已提交的 TS 类型）

```ts
type Chapter = 'prologue' | 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5' | 'epilogue';
type Outcome = 'garden' | 'prosperity' | 'everlasting' | null;
type QuestStatus = 'locked' | 'available' | 'active' | 'complete' | 'claimed';

interface WorldProgressV1 {
  schemaVersion: 1;
  revision: number;
  chapter: Chapter;
  sceneId: string | null;
  chosenRoute: 'trade' | 'ecology' | 'balanced' | null;
  ending: Outcome;
  flags: Record<string, boolean>;
  questStates: Record<string, QuestStatus>;
  watchedSceneIds: string[];
  appliedEventIds: string[];    // 真实实现可压缩/分段保留
  relationships: Record<string, number>; // 范围建议 -3..+3
  publicLighting: number;       // 非经济资源，街区建设实际派生
  ecologyRestoration: number;   // 非货币进度，来自真实工程
  updatedAt: number;
}
```

V3 存档的结构设计必须把实体运行时数据与历史结果隔离；`appliedEventIds` 应允许按可安全重放的累计快照进行压缩，不能无限增长。所有字段须校验与边界裁剪，支持未来迁移。

## 4. 领域事件契约

**先产生产生因果的不可变事件，再更新状态与 UI。**

```ts
type DomainEvent =
  | {id:string;at:number;kind:'production-completed';machineId:string;
     recipeId:string;product:string;amount:number}
  | {id:string;at:number;kind:'order-delivered';orderId:string;
     coresUsed:number;reward:number}
  | {id:string;at:number;kind:'public-project-completed';projectId:string}
  | {id:string;at:number;kind:'worker-assigned';workerId:string;machineId:string}
  | {id:string;at:number;kind:'scene-choice';sceneId:string;choiceId:string}
  | {id:string;at:number;kind:'investigation-found';clueId:string};
```

- 每个 `id` 在同一个世界存档里唯一，重复提交是幂等 no-op。
- 不允许写「scene-watched」代替订单完成，完成条件从事件流和结算快照决定。
- 任务规则纯函数计算 `nextQuestState(world, event)`；显示的提示可以变，状态不会因为 UI 卸载而变。
- 世界进度与工坊产量如果涉及同一次资源交付，应在**同一可恢复事务协议**中完成：先提交经济事件，再可靠应用剧情事件；恢复时扫描未处理 eventId，不可出现奖励到账却剧情丢失的永久不一致。
- 需要日期/顺序的故事事件采用游戏章节的逻辑时间，不依赖浏览器真实日期造成错过主线。

## 5. 剧情任务规则

### 任务示例：ST-CH1-RELIGHT-EAST / 重燃东街

```yaml
id: ST-CH1-RELIGHT-EAST
scene: ch1-s02
prerequisites:
  all:
    - quest: ST-CH1-FIRST-CORE
      status: complete
objectives:
  - kind: dialogue-finished
    id: ch1-s02-iesu
  - kind: policy-set
    stock: core
    reserve: 6
  - kind: public-project-delivered
    id: east-street-lamps
    amount: 6
completion:
  effects:
    - world-flag: eastStreetLit
    - visual: east-street-lamps-lit
    - unlock-scene: ch1-s03
repeatable: false
```

注：上面是内容设计示例，不是当前客户端已识别的 YAML 格式。实际实现用 TypeScript 配置或受 schema 校验的 JSON 数据。

### 任务反模式

- 「每天点击 3 次生产」：禁止，生产必须自动。
- 「抽到指定 UR 才能修复钟楼」：禁止，剧情材料应由确定性生产可得。
- 「连续五天登录才能见月纱」：禁止，进度由首次交付触发。
- 「重新打开页面奖励又到账」：严重经济/存档 bug。
- 「每个 NPC 有 100 级爱心」：无经济/人格后果，不进入 P1。

## 6. 章节条件映射（全部可程序判定）

| 章节 | 解锁前提 | 主目标 | 关键事件 | 可解锁能力 |
|---|---|---|---|---|
| 序章 | 新档或老档首次进入剧情 | 接钥匙、唤醒工匠、首份水汽自动产出 | `first-water-produced` | 自主生产、任务追踪 |
| 第一章 | 序章结束 | 连接水汽/孢子/晶核、完成首单、援助东街 | `first-order-delivered` + `eastStreetLit` | 订单预留、月纱露面 |
| 第二章 | 首单完成 | 月纱报价、选择商业/生态/平衡供应优先级 | `first-policy-chosen` | 特别委托、公共库存保留 |
| 第三章 | 完成一次公共服务与一次角色对话 | 安置灵核、查阅钟楼、问出月纱过去 | `clocktower-record-found` | 钟楼调查、生态配方线索 |
| 第四章 | 三项线索收集齐全 | 黑雾袭来、自动改线、完成临时稳定器 | `temporary-stabilizer-delivered` | 故障调度、紧急公共项目 |
| 第五章 | 临时供能恢复 | 找到诺因、建造永续晶核并修复月心灯 | `moonheart-repaired` | 最终选项 |
| 终章 | 已修复月心灯 | 根据长期证据分支结局/后日谈 | `ending-selected` | 自由经营 |

正式角色关系以支线强化各角色观点，但**不得作为主线必需门槛**。遗失线索可在钟楼档案处重新取得。

## 7. 结局评分与公平性

建立三个可解释的指标，均由真实事件积累：
- `tradeScore`：按期履约、投资、可持续产能与成本效率；
- `ecologyScore`：水脉恢复、温室改造、污染缓解；
- `communityScore`：街灯、居民援助、公寓庇护、应急资源保留。

终章显示每条结局所需条件及缺口，不必隐藏数值但避免机械刷分。达标后玩家明确选择结局；理想结局需要三个指标均达到合理门槛且完成关键稳定器。结局不能通过无限重复交易刷出，计分按「首次完成唯一项目」或按有限的里程碑。

**未确定的具体阈值**应在纵切片平衡后冻结。默认结局不对独立角色好感做惩罚性限制。

## 8. 对话交互与镜头规则

- 对话文本由 sceneId 驱动，逐句 UI 可播放，支持逐字/整句、跳过、回看、旁白。
- 选项必须至少改变一个：角色反应/关系、库存策略、路线证据、未来剧情对白；纯同义「好的」不设多个按钮。
- 同一幕的镜头、音乐、粒子层与对白数据分离，能在减少动效模式安全退回静帧。
- 剧情不自动弹出遮挡工坊紧急操作，先出现小提示「有新事件」，由玩家选择进入；序章首次必需教学除外。
- 所有演出可重看，但重看不再解锁、出货或领取奖励。
- 同屏 320px 至桌面均可读，角色说话时不要让大立绘遮挡对话或功能按钮。

## 9. 旧档的故事进度初始化

老玩家不能因已经完成第一单而重新获得首单奖励。建议：
- 读取工坊 `completed`、`last` 等历史证据，确定最高可安全追认章节；
- 没有可信依据的线索/剧情选择标记为 `available`，让玩家补看并做新决定；
- 只有老档没有的街区/人物关系状态初始化为中性值；
- `worldProgress` 单独事务写入；旧公寓/工坊存档保留原样；
- 回看「序章」不执行真实资源发放；
- 使用 fixture 覆盖新档、首单完成老档、五单结束老档和异常坏档。

## 10. 跨页任务 UX

首页：仅显示当前剧情目标及下一步入口。  
工坊：只展示影响本条生产链的提示，例如「温室缺水」「公共项目还差 2 晶核」。  
仓库：显示已锁定储备，不能误当可出售余额。  
月光街：街灯与花园真实状态变化，居民用符合其性格的台词提醒。  
角色页：显示关系阶段、个人事件与技能，不能只有无业务作用的华丽卡牌。

**P1 交付检查：** 可从角色页面查看任务、跳工坊生产、切街道观察照明，在所有页面显示同一进度，并在刷页/切标签后保持一致。

## 11. V3.1 收藏、伏笔与彩蛋事件（新增）

世界进度新增独立但可关联的 **CollectionProgress**：`unlockedIds`、`seenIds`、`inspectedClueIds`；剧情标记可包括 `story:plant:clock13`（埋设不等于玩家发现）与 `secret-discovered:E-06`（玩家亲自发现）。这些字段属于建议模型，实际 schema 需迁移测试。

- 主线**必经伏笔**在第一次播放时仅记录 `foreshadowId:planted`，不得因为看见道具就提前解锁剧透性秘密 CG。
- 主动调查必须验证章节/已存在真实事件和调查地点，以唯一事件 ID 原子提交；由事件解锁 CG，不能由画面动画结束来生成经济或收藏奖。
- 一张隐藏 CG 有且仅有一个权威首次解锁事件；重复热点点击、关闭/重开、剧情回看、多标签页并发不能追加第二份。
- 解锁前不要加载秘密大图或展示其标题，解锁后通过角色图鉴画廊筛选。玩家已获得的线索可随时重访；没有「错过一次就永远不可得」。
- **示例**：`public-project-completed:east-street-lamps` → 公寓屋顶信使热点 `available` → 玩家检查明信片 → 事务事件 `secret-discovered:E-06` → `CG-S-006` 解锁 → 重看只读。
- 即使 CG 文件缺失或玩家关闭动画，对话/任务仍然可继续；隐藏 CG 不提供主线必需的稀有角色或生产装置。

详见 [08 对话 PRD](08-NARRATIVE-DIALOGUE-UX.md)、[09 CG 规范](09-CG-COLLECTION-AND-ART.md) 与 [10 伏笔事件表](10-FORESHADOWING-AND-EASTER-EGGS.md)。

## 12. V3.2 角色房间访问状态与剧情幂等

每个 `characterId` 派生最多一个 `CharacterSuite`；它是一个可访问的独立叙事/美术场景，**不是 `CozyState.rooms` 的新建经营房**。可招募住客由 `recruit-owned` 或旧 `known` 映射开放；固定剧情 NPC 由 `story-met`/拜访许可开放。

- 房间进度记录 `visited`、`inspectedHotspotIds`、`viewedSceneIds` 和可选装饰解锁；所有影响回忆/关系的首次事件仍使用世界事件 ID 幂等。
- 访问人物不需要额外召唤，重复卡不生成第二个房间；换工作岗位或经营房间不删除其个人空间。
- 可观察热点允许给出可回访线索，但剧情秘密按章节判断，不因进入人物私室提前泄漏第三至五章真相。
- 阅读房间对白时，经营模拟仍使用单一时间轴；动画切页与加载失败不改变收益和任务进度。

具体 UI、序列化建议和四间先行试验见 [14-CHARACTER-PRIVATE-ROOMS-PRD.md](14-CHARACTER-PRIVATE-ROOMS-PRD.md)，所有人物房间的职业和伏笔道具详见 [15-CHARACTER-ROOM-BIBLE.md](15-CHARACTER-ROOM-BIBLE.md)。

## 13. V3.3 装备/属性领域事件与故事状态

- `character-trained`：一次真实训练完成后追加有限六维成长，事件按训练工单 ID 去重。
- `forge-started / forge-completed`：锻造台记录已保留原料、唯一工单、制作物品实例和完成时间；收货属于经济数据，不由剧情或 CG 动画凭空发放。
- `equipment-equipped / equipment-unequipped`：道具只占一个部位和一个归属，同一 `itemId` 不能同时穿在两个人身上；更换时正确返回背包。
- `room-item-observed`：人物私人房间出现与已穿戴装备有关的可选对白/道具；**首次事件才允许解锁小回忆，重复看不涨无限关系**。
- 剧情必需线索、三结局以及 CG-M 主线收藏不依赖装备/角色达到 UR；角色潜力与故事推进的奖励归不同领域，不以装备分值代替角色性格或人物信任。

同一角色通过 `characterId` 在图鉴、人物私室、工坊岗位和成长档案中引用**一份权威六维与装备状态**。详情 [17 属性](17-CHARACTER-ATTRIBUTES-AND-POTENTIAL.md)、[18 装备](18-EQUIPMENT-FORGING-PRD.md)。
