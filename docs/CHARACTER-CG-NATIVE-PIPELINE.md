# 《怪物公寓》正式 CG 原生高清生产入口 · 2026-11-22

> **执行状态**：生产入口代码已准备；本次**没有**调用外部付费 API、没有实际生成新的 1536×2048 原画、没有批准任何角色 CG。运行时 `cg-manifest.json` 的五张卡仍为 `portrait`。

## 为什么新增独立入口

截至 2026-11-22，五张独立动作研究稿的源图均为 1086×1448。仅把这些图片通过插值放大到 1536×2048，无法证明原生细节。反复生成的多角色拼版也不能当作独立 CG。

Black Forest Labs 官方 FLUX.2 [pro] 接口支持直接设置宽高，最高 4MP，宽高为 16 的倍数。**1536×2048 = 3,145,728 像素**，在其宣称的尺寸范围内。选择稳定的 `/v1/flux-2-pro` 接口，而非预览版。是否满足艺术表现、真实身份、版权和武器完整性，仍必须逐图人工检查。

官方来源：
- https://help.bfl.ai/articles/8916739058-what-aspect-ratios-and-output-dimensions-are-supported
- https://help.bfl.ai/articles/8446125349-quickstart-guide
- https://api.bfl.ai/docs

## 生成流程（在已连接网络的开发环境中运行）

1. 开发者在自己的环境变量或安全密钥管理系统配置 `BFL_API_KEY`，**不要写入仓库、Issue、前端环境变量或截图**。该 API 为计费服务，需要账户余额。没有密钥时工具不会发送付费请求。
2. 先运行**免费、无网络的镜头确认**：

   ```bash
   pnpm art:cg:native --card yuesha-eclipse --dry-run
   ```

   此步骤读取 `docs/art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json` 和锁定角色头像，打印实际将使用的主角、完整姿态、武器、服装、单人禁则及参考图 SHA-256，不发送 API 请求。
3. 确认经费、参考图使用范围与提示词后，人工启动一张：

   ```bash
   pnpm art:cg:native --card yuesha-eclipse
   ```

   支持 `--seed 42` 固定种子，五个 `card` 均可使用。一次运行只生成一张，不在 CI 或网页玩家端自动运行。
4. 工具通过 `input_image` 传入锁定身份头像、通过 `input_image_2` 传入该角色目前选定的独立动作研究稿。关闭自动提示词扩写（`disable_pup: true`），明确限制一人、一画、一场景，**不出现五人拼版、卡片 UI 或标题**，并请求 WebP 原生 1536×2048。
5. 只在返回图片真正通过当前 `inspectCharacterCg` 和**精确 1536×2048** 校验后，写入被 Git 忽略的 `.art-staging/native-cg/<card>-<timestamp>/`。其中 `native-source.webp` 是外部服务交付的原始 WebP 字节，`generation.json` 记录模型、原始尺寸、SHA-256、身份参考哈希、种子及审核要求。生成器**不会**自动发布图片到 `public/art/`。
6. 为当前源图准备人工审核页面和审查初稿：

   ```bash
   pnpm art:cg:review --card yuesha-eclipse \
     --source .art-staging/native-cg/<card-timestamp>/native-source.webp \
     --out .art-staging/reviews/<card-timestamp>
   ```

   该审核页必须覆盖完整 3:4 和 A05 窄卡 `cover` 的 **1440×900、1648×928、390×844** 三种实际视口。评审人对照项目的 V3 身份参考，逐项核对脸型、动作、武器边界、手指、足部、袖口、材质、无烘焙文本及使用许可。
7. 人工签署 `review-status.DRAFT.json` 后才允许进入既有的 `art:cg:promote` 审核；`sourceType`、`sourceReference`、`nativeResolution` 和著作权确认必须真实填写，绝不因为图片尺寸过关就自动批准。

## 防止退化的门禁

- **不接受低分辨率放大冒充原生高清**。保存 API 原始字节及服务输出记录；尺寸自动检查只是必要条件，不是原生细节的充分证明。
- **不接受五人拼版裁切**。不管图片像素有多大，画面必须是单人独立绘制，不得包含多个卡位、姓名或边框。
- **不接受串脸换装**。两版月纱保持同一身份，泉泡保留银白浅蓝发与蓝色毛绒兽耳，青枝和炽角使用各自冻结的头像骨相。
- **不接受伪造人工审核**。自动测试只能检查参考图、清单、尺寸和哈希，无法替代人眼对脸部、手脚、武器受力和商业授权的判断。
- **不写入生产文件**。`cg-manifest.json` 在完整审查签字前不发生变化，不改正式 CG 路由、抽卡概率或存档。

## 本轮已完成与未完成

**已完成：** 原生 1536×2048 的可选生成脚本、可复用的五卡动态提示词、参考图输入、禁止拼版设置、离线 dry-run、输出尺寸校验、单图暂存和基础代码测试。**尚未完成：** 付费外部 API 的实际连通验收、五张真正原生 1536×2048 的美术创作、人脸同人审核、完整武器安全边距、版权审核与正式晋级。
