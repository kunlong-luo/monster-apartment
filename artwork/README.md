# 《怪物公寓》美术素材归档

本目录是 GitHub 项目中的 **素材索引**，不影响正式游戏构建。完整未压缩原始图、候选绘景、审核图和历史资源包已整理至 ChatGPT 个人文件库的：

`/游戏调研/怪物公寓/美术归档/`

- `monster-apartment-artwork-archive-2026-10-29.zip`：可直接解压成项目根目录 `artwork/` 的原画归档（约 97 MB）
- `素材/`：已逐张上传的 30 个可访问图片，按角色设定、环境、合成 CG、待审核与不合格素材分类
- `catalog.json`：原始文件名、分类、审查状态、分辨率及 SHA-256

`artwork/catalog.json` 是同一份索引在 GitHub 上的副本。

**注意：上述图片二进制文件尚未直接提交到 GitHub；仓库目前只包含目录说明和索引。** 当前 GitHub 连接不支持从本地容器直接上传原图字节，因此不能假称已将所有 PNG 都放进 GitHub。需要 Git LFS 或单独的二进制上传流程才能将原图进一步同步到仓库。

所有原图均归为概念、候选或 rejected；`public/art/rooms/*` 的现有正式素材准入保持不变，禁止在未经像素与人工美术审核前把这些图标记为 production。

请勿把四角色拼贴 PNG 直接裁成 4 个正式姿态；也不要将经放大的 2560×1440 图宣称为原生高清绘制。

## 2026-10-30 · 月纱会客室空景 A/B 候选

新增到个人文件库 `/游戏调研/怪物公寓/美术归档/2026-10-30/`：

- `yuesha-room-art-candidates-2026-10-30.zip`：两张独立无人物房间候选的 PNG 原稿、1920×1080 WebP **非原生分辨率**审核版、SHA-256、来源与状态记录。
- `yuesha-room-candidates-side-by-side.jpg`：画面对比。

完整审核流程见 [V3.49 月纱高清空景候选](../docs/v3/49-YUESHA-HD-BACKGROUND-CANDIDATES.md)。这些文件目前**已归档到资料库，但二进制尚未写入 GitHub 源码树**。两种背景均未完成原画人工审查；正式 `room-art` manifest、存档和四姿态人物资源保持不变。

## 2026-10-30 · 月纱人物参考板（未通过透明立绘审核）

个人文件库增加 `/游戏调研/怪物公寓/美术归档/2026-10-30/yuesha-pose-reference-boards-2026-10-30.zip`。两张“场景＋人物＋表情分镜”只用于整体美术方向，像素采样没有任何真正透明的背景区域，不能作为正式四姿态贴图。包内含 `alpha-preflight-REJECTED.json`，保证不会误标正式素材。详见 [V3.50 房间审核及角色参考](../docs/v3/50-FOUR-ROOM-ART-REVIEW-AND-YUESHA-REFERENCES.md)。

四间房的本地预览能力已接入代码；这一进展不改变 `manifest.json` 的 `concept` 状态。
