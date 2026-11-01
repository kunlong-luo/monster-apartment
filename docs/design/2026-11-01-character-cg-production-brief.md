# A05 · 五张角色 CG 生产设定与入库清单（2026-11-01）

## 目标与交付状态
本阶段生产 **5 幅独立原生 3:4 全身人物 CG（至少 1536×2048 WebP，单张 100KB–12MB）**，对应四位成年女性角色及月纱的两个不同契约版本。必须完整露出头发、手指、脚尖，禁止直接放大 512px 头像、拼接不存在的身体、把含按钮/卡池概率的游戏截图当 CG。严禁使用 Lucide Sparkles/WandSparkles。所有候选在人工签署前只能存在临时审核目录；`cg-manifest.json` 继续为 `portrait`。

> 当前实际状态：五个 production CG 均**未入库**。本轮两次生成得到的是整张游戏 UI 设计画面，带有人物身份、概率或文字错误，不适合作为独立角色 CG，因此全部拒绝，不上传正式资源目录，也不标记审核通过。

## 五张独立艺术方向

| 卡片与文件 | 成年人物身份与面貌锁定 | 全身构图 / 服饰 | 场景与光影 |
|---|---|---|---|
| `yuesha-eclipse` → `yuesha/cg-eclipse.webp` | **月纱**，28 岁，银白长发、红眸，必须沿用 `yuesha/face.webp` 的脸型和眼神 | 神话月蚀版：黑红哥特绸缎、细金古纹、暗红宝石、长裙和高跟长靴；偏正面站姿，一手提旧银月权杖，一手自然垂落，脚尖完整 | 红月照进哥特宫殿，血色与旧金边缘光，月蚀位于人物后方，不能遮脸 |
| `yuesha-vow` → `yuesha/cg-vow.webp` | **同一月纱**，不得换另一张脸、瞳色或发型 | 契约会客室版：月白与深紫长袍、蕾丝手套、银月胸针，优雅侧转站姿；双手五指独立 | 月纱会客室、冷色月光与暖烛光，和神话红月有明确区别 |
| `brook-tide` → `brook/cg-tide.webp` | **泉泡**，成年水系术师，柔和宽杏眼、灵动圆润面部，与 `brook/face.webp` 一致 | 轻盈海蓝与银灰服饰、水滴饰品和长靴，手持潮汐卷轴；身姿柔和，**不复用月纱脸型** | 夜间潮汐回廊，蓝绿水纹映光；霜狼仅可在远景作契约异兽轮廓，不遮住人物双脚 |
| `fern-spring` → `fern/cg-spring.webp` | **青枝**，成年植物学家，独立菱形面部与猫眼、雀斑细节，与 `fern/face.webp` 一致 | 墨绿叶脉纹外套、植物标本与藤蔓腰饰、实用靴；一只手拿植物书，一只手自然伸展 | 深夜月光温室、苔绿和月白冷光，环境优先表现植物而非宠物 |
| `cinder-ember` → `cinder/cg-ember.webp` | **炽角**，成年锻造师，方形英气眉骨、独立疤痕辨识，与 `cinder/face.webp` 一致 | 铁锈红锻造制服、皮革腰带和金属护臂，结实站姿持锻锤；五指、护手和靴尖必须真实 | 炉火锻造室、铜红与炭黑火光，专属异兽可作为远景剪影，不遮盖装备 |

## 单图严格验收顺序

1. 与现有 `public/art/beauty-beasts/characters/<角色>/face.webp` 并排确认**同一人**；单凭画风相似不够。
2. 核对人物占画面约 70–80%，顶部有头发余量、底部有鞋尖与铭牌缓冲；不要把正式卡底字幕直接画在素材中。
3. 确认四位主角脸型与服装明显不同；两张月纱只是服装/场景不同，身份一致。
4. 确认插图原生尺寸、3:4 构图、无水印/文字/游戏 UI、手脚无畸变，源文件和授权记录完整。
5. 使用下面的离线审核包检查 **1440×900、1648×928、390×844** 三档预览；人工签署完整 `review-status.DRAFT.json` 后才能正式入库。

```bash
pnpm art:cg:review -- --card yuesha-eclipse --source /path/to/original-1536x2048.webp --out /tmp/yuesha-eclipse-review
# 打开 /tmp/yuesha-eclipse-review/review.html，核对 reference-face.webp 与 cg-candidate.webp
# 审核通过后将 DRAFT JSON 完整签署并生成 review.json：
pnpm art:cg:promote -- --card yuesha-eclipse --source /tmp/yuesha-eclipse-review/cg-candidate.webp --approval /tmp/yuesha-eclipse-review/review.json
pnpm check:design
```

`review.html` 中的「未批准」说明始终保留，预览通过不等于本人或团队的商用版权许可确认。只有 `scripts/audit-character-cg.mjs` 严格核验真实文件、已签署审查文件与字节哈希后，`heroine-portrait-assets.ts` 才选择正式 CG。没有通过的素材不会改变现有抽卡人物画面、存档或游戏逻辑。
