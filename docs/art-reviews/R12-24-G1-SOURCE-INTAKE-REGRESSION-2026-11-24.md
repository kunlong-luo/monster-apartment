# R12.24 · G1 原画接收门禁加固与离线回归（2026-11-24）

> **实际结果：R12.22 四人研究包 10/10 图像字节、规格、哈希复核通过；新校验器 9/9 离线回归通过；新美术二进制文件仍未上传 GitHub。** 已提交的是**校验脚本、自动化测试、package 命令和文档**，没有替换游戏中的任何头像、封面或全身 CG，也没有取得人工批准或 Pages 发布证据。

## 一、真实输入与复核

原始输入：在会话交付的 `monster-apartment-r12-22-g1-four-faces.zip`，ZIP 大小为 **12,761,078 B**。已在隔离目录解包，实际读取 `art-sources/identity-r12-22/identity-candidate-manifest.json`；其中四个人各有独立生成的原始 PNG 和相同像素尺寸的 WebP（共 8 个文件），另有两幅有明确审核用途的 WebP 对照图。

本轮直接使用真实文件运行新 `verify-g1-face-sources.mjs --source-dir`，结果：

```text
G1 research integrity OK: 10/10 PNG/WebP files; 4 independent study portraits; 0 approved identities; NO promotion.
```

此项检查由隔离环境实际执行，并**没有**运行已经被修改的线上游戏或生产发布流程。原始文件各为 **1086×1448**；查验文件 bytes、SHA-256、PNG IHDR / WebP RIFF 与实际 WebP 帧尺寸。仅字节与头部合法并不足以证明图片视觉上完美、完全解码、拥有商用权或身份一致。

## 二、代码真实更新

| 文件 | 变更 | 不变的安全边界 |
| --- | --- | --- |
| [`scripts/verify-g1-face-sources.mjs`](../../scripts/verify-g1-face-sources.mjs) | 锁定四个 `characterId` 与研究目录，拒绝任意路径；检查文件是否为普通文件（拒绝符号链接）、字节数、SHA-256、原生尺寸、批准状态及两个明确列出的审核联系表 | 只读，不生成、不晋级、不写 `public/art` |
| [`scripts/tests/g1-face-source-intake.test.mjs`](../../scripts/tests/g1-face-source-intake.test.mjs) | 9 项无外部网络/无研究包依赖的 Node 回归，包括篡改、伪造 human-approved、越权路径、缩小图片而伪造元信息、身份名册缺漏、符号链接、联系表缺漏及 CG 伪批准 | 测试数据由合成图像头构造；不能代替实际美术人审 |
| [`package.json`](../../package.json) | 新增 `art:g1:verify` 和 `art:g1:test`；把 **离线回归测试**挂入现有 `check:design`，但不把未入仓的 12.8 MB 源图作为日常 CI 前置条件 | 不修改抽卡概率、存档、角色资源路由 |

本轮离线测试输出：**9 passed、0 failed**。GitHub 提交本身不等于远端 CI、构建或 Pages 成功，需以该 SHA 的 Actions 真实结果单独核对。

## 三、如何完成还缺失的二进制入库

目前的原始 PNG/WebP 仅在会话 ZIP 中。当前容器再次测试 `git ls-remote https://github.com/kunlong-luo/monster-apartment.git HEAD` 失败，报错 `Could not resolve host: github.com`；文本 Github 连接器可写 Markdown/JS，但无法直接读取隔离容器的原始二进制字节并传入 Git Blob API。因此不能声称已提交图片。

在具有真实 Git 文件权限和网络连接的工作环境中执行：

```bash
# 将该 ZIP 放到本机可访问的位置，并在仓库根目录执行：
unzip /path/to/monster-apartment-r12-22-g1-four-faces.zip 'art-sources/identity-r12-*/*' -d .
pnpm art:g1:verify
pnpm art:g1:test
git add art-sources/identity-r12-19 art-sources/identity-r12-20 art-sources/identity-r12-21 art-sources/identity-r12-22
git diff --cached --stat
# 人工检查 staged 不包含 public/art、存档或正式 manifest
git commit -m "art(research): add R12.22 four independent G1 identity studies"
git push
# 使用 GitHub 仓库文件/commit 回读每个图片并复核其 SHA-256，再设置 inRepository=true。
```

如先在隔离目录验证：`node scripts/verify-g1-face-sources.mjs --source-dir /path/to/unpacked-zip`。不要运行 `art:cg:promote`，不要将 G1 脸部研究稿写入正式 `face.webp`。

## 四、接下来真正影响玩家的关口

1. **研究资产入 GitHub**：必须可回读真实 PNG/WebP 哈希，才可说“原画已放进项目”；本文与下载包不是此证据。
2. **身份连续性 G1 人审**：四位人物新写实肖像 vs 旧动漫风的 canonical 基准，尤其月纱 V3、泉泡兽耳、青枝尖耳与颊痕、炽角金属铸角及脸型；补同人正面和 3/4 侧脸、同机位/三表情与遮配饰盲测、版权商用权/人工签署。
3. **封面与 CG**：先两幅无烘焙 UI 的 PC 16:9、手机 9:16 封面；再按冻结脸绘独立的五张原生至少 1086×1448、头脚与武器完整的角色 CG（两张月纱严格同脸）。最后分别走 1440×900、1648×928、390×844 真实浏览器和发布验收。

## 五、R12.24 真实状态

| 项目 | 状态 |
| --- | --- |
| 四位原生 1086×1448 **G1 研究**源图 | **4/4（会话 ZIP）** |
| 隔离环境全部十张研究图的文件完整性复核 | **10/10 通过** |
| G1 文件接收回归测试 | **9/9 本地通过** |
| 新原画 PNG/WebP 实际 GitHub 入库 | **0/10，本轮仍阻断** |
| 四人正式身份人工签署 | **0/4** |
| 双端正式新封面 | **0/2** |
| 五张正式全身 CG | **0/5**，生产 manifest 仍 `portrait` |
| 页面素材替换、CI / Pages 成功证明 | **未执行/未核实** |

**验收口径：技术校验只证明入库前的数据完整性，不证明画风、面部同人或游戏上线。**
