# R12.23 · 四人 G1 研究原画入库准备与阻断记录（2026-11-24）

> **状态：10/10 个研究包文件已在隔离目录完成本地哈希与结构校验；新的二进制原画仍未提交到 GitHub；正式身份批准仍为 0/4。** 不能将这项准备工作称为玩家可见的图片更新。接续 [R12.22 研究成果](R12-22-FOUR-INDEPENDENT-G1-FACES-2026-11-23.md)。

## 本轮做了什么

1. 在工作环境确认 `monster-apartment-r12-22-g1-four-faces.zip` 可读取，内含四位人物各一份**独立原生 1086×1448 PNG**、一份对应 WebP（合计 8 个）和 2 个审核对照 WebP，以及来源、审核草稿。
2. 解压至**仓库外隔离目录**进行核验：已有包内 `verify-g1-art.py` 的原始尺寸/哈希清单与文件一致；新增轻量 Node 读取检查（本地实测）确认 10 个图像文件的 SHA-256、字节数和头像规格无损。**此项仅证明文件完整，不证明新脸同人、画风、商业权或人审。**
3. 仓库新增 `scripts/verify-g1-face-sources.mjs`，通过项目已有 `webpDimensions` 解码 WebP 头，验证 PNG/WebP 原始尺寸、SHA-256、四人物名册及 `canonicalIdentityApproved:false`。该脚本不生成素材、不自动批准、不修改正式头像与 CG 清单。
4. 当前执行环境尝试直接连 GitHub 的 `git ls-remote`，因 **`Could not resolve host: github.com`** 无法通过 Git 网络上传 PNG/WebP。GitHub 文本连接器可提交脚本和文档，但无法把当前容器本地的约 12.8 MB 二进制 ZIP 直接读入其 Git Blob 请求，因此**本轮未实际上传图片**。

## 精确的素材路径与安全入库操作

从上一轮已交付的 `monster-apartment-r12-22-g1-four-faces.zip` 在本地 repo 根目录解压，**只解压 `art-sources/identity-r12-*/*` 素材；不要覆盖 `public/art/**`、`face.webp` 或 CG manifest**。原图和导出图片一共 8 份；对照资料另有 2 份。

```bash
# 在仓库根目录；研究包必须先由操作者下载到本机
unzip -l /path/to/monster-apartment-r12-22-g1-four-faces.zip
unzip /path/to/monster-apartment-r12-22-g1-four-faces.zip 'art-sources/identity-r12-*/*' -d .
node scripts/verify-g1-face-sources.mjs
git add art-sources/identity-r12-19 art-sources/identity-r12-20 art-sources/identity-r12-21 art-sources/identity-r12-22
git diff --cached --stat
# 确认没有污染生产资源后再 commit/push
```

若需先在隔离目录验证，可直接 `node scripts/verify-g1-face-sources.mjs --source-dir /path/to/unpacked-bundle`。**新增脚本虽已写入 GitHub，尚未在用户真实 GitHub runner 或实际上传后的仓库执行验证；CI 和 Pages 均不得宣称通过。**

## 四人身份与画风问题尚未解决

| 角色 | 新原生研究稿 | 需要重点比较的 canon |
| --- | --- | --- |
| 月纱 | R12.19 1086×1448 | 新版写实脸 vs 已锁定银白发赤瞳 V3；两卡必须同一张脸 |
| 泉泡 | R12.20 1086×1448 | 蓝毛绒耳与银蓝发，面颊/眼距不得模板化或漂移 |
| 青枝 | R12.21 1086×1448 | 浅金绿眼、颧骨、尖耳与新增颊部浅痕是否符合旧身份 |
| 炽角 | R12.22 1086×1448 | 粉红旧头像 vs 更成熟的新脸，双角为金属**头饰**而非生物角 |

跨角色共同风险：新研究稿为写实 CGI，旧生产素材偏二次元。**没有统一画风／旧脸连续性的人工签署，不能直接更换首页、抽卡、图鉴和私人房间的角色头像。** 新四人各缺可审核的同身份正面＋3/4 侧脸、表情组及同光源灰阶盲测。

## 入库与生产门禁

- **准备完成**：ZIP 实际存在、10/10 图像在本地隔离环境校验通过、校验脚本提交 GitHub、文档和 Issue 真实更新。
- **尚未完成**：二进制资源上传 GitHub 和回读验证，角色人工签署 0/4，原画兼容旧身份，标准正侧/表情，PC/手机双封面 0/2，五张完整动作/武器 CG 0/5，游戏页面使用，浏览器和 Pages 验收。
- **严格禁止**：为了显示进度改 `cg-manifest.json` 为 `production`，覆盖现行 `face.webp`，把研究肖像称为全身 CG，用插值冒充原生像素，将文档提交说成图片已经上线。

### 结论

**R12.23 的实质进展是将研究素材的入库操作标准化并加上可重复哈希/尺寸门禁，尚未突破二进制资源同步阻碍。** 下一次应优先在有 Git 仓库写入与网络访问的执行环境中解包、校验并实际提交资源，随后开展四人身份冻结审查。
