# R12.32 · PC Web / 手机六张独立场景研究图，一键进入游戏审核（2026-11-24）

> **这一轮确实调用 GitHub 仓库中已经存在的六张 WebP 图片进入游戏场景，以便进行 PC / 手机视觉审查。** 但只在用户**显式**开启的 `?r12-art-review=1` 中，点击“预览仓库已有 PC／手机独立场景研究图”后显示；普通玩家不会加载或看见这些图片。它们仍是**未获人工签署的研究画作**，尺寸不足且不是 production CG/场景。不能用这次接线取代真正 4K + 竖版原生重绘或将 #16/#24 提前关闭。

延续：[R12.31 响应式单图加载](R12-31-WEB-RESPONSIVE-SCENE-ASSET-LOADING-2026-11-24.md) · [R12.30 原生像素门槛](R12-30-WEB-ART-REVIEW-DPR2-AND-YUESHA-ROUTING-2026-11-24.md) · [#16 独立场景](https://github.com/kunlong-luo/monster-apartment/issues/16) · [#24 图片模糊](https://github.com/kunlong-luo/monster-apartment/issues/24)。

## 一、为何本轮从“反复写规格”转向真实图片预览

R12.31 已让生产画作在最终批准后使用 `<picture>`，但 S02/S05/S06 依然是 `review`，普通网页上仍是旧场景。仓库实际上有**三种建筑、六份独立横竖构图**的研究 WebP，若每次都靠用户手动从本地下载并重新上传到本地审核器，难以快速看到“六扇房门是否对应公寓操作”“委托/仓库是否明显不同”“PC 右侧/手机下方 HUD 是否遮挡原画”的真实问题。

本轮因此在原有 R12 本地审稿器内增加一个**一键用仓库中已有的研究图替换当前画面（仅本次预览）**的操作，不新增正式页面、不占据玩家首页、不写入游戏存档、不触碰生产资产 manifest。**Web 玩家看到的正式场景仍没有被替换。**

## 二、已核对仓库里的实际二进制图片

| 路由与标识 | PC 研究 WebP（实测像素） | 手机独立研究 WebP（实测像素） | 用途/晋级 |
| --- | --- | --- | --- |
| S02 `/apartment/` | `public/art/world-scenes/review/2026-11-23/apartment-six-door-desktop-v1.webp`，**1672×941** | `public/art/world-scenes/review/2026-11-23/apartment-six-door-mobile-v1.webp`，**941×1672** | 六扇不同主题的门；需要与游戏真实六个房间 hotspot 对位，尚无人工签署 |
| S05 `/orders/` | `public/art/world-scenes/review/2026-11-22/orders-desktop-v1.webp`，**1672×941** | `public/art/world-scenes/review/2026-11-22/orders-mobile-v1.webp`，**941×1672** | 独立委托大厅，有柜台、卷轴、晶球与任务氛围；尚不满足 native-PC 高清 |
| S06 `/warehouse/` | `public/art/world-scenes/review/2026-11-22/warehouse-desktop-v1.webp`，**1672×941** | `public/art/world-scenes/review/2026-11-23/warehouse-mobile-v1.webp`，**941×1672** | 独立蓝紫色仓库、储柜与晶矿运输；非 S05 或大厅的换色 |

尺寸通过对真实 **WebP 头部**核验；以上是 Web 展示文件，部分场景还存在同构图原始 PNG，但“图片存在”和“艺术来源、角色身份、尺寸、权利及审稿已批准”是两件事。PC 目标仍是**原生 3840×2160**、手机目标仍是**独立原生 1080×1920**，不能将上述 1672×941 / 941×1672 插值放大后改标 production。

## 三、实际提交文件

| 文件 | 修改 | 守住的边界 |
| --- | --- | --- |
| `src/lib/game/r12-scene-review-art.ts`（新增） | 静态白名单，将三类场景与六张已经存在的研究文件及实测尺寸绑定到**单独的 review catalog** | **完全不写** `public/art/world-scenes/r12-scene-manifest.json`，不能通过 `approvedR12Scene` 自动使用 |
| `src/components/game/r12-scene-painting.tsx` | 在已有 `r12-art-review=1` 浮层增加“预览仓库已有 PC／手机独立场景研究图”。点击后仅设置当前浏览器内的预览状态，PC/手机切换自动显示对应原图，原样更新 S05/S06 Hero；添加场景上方**“仓库研究图 · 未批准”**水印和 `data-r12-review-origin='repo'` | **不自动加载**：普通网址和仅加研究参数但尚未点击时，六张研究 WebP 请求数应为 0；刷新/返回清除预览；玩家存档与抽卡无更改 |
| `tests/r12-repository-review-art.vitest.test.ts`（新增） | 逐一读取六份真实 WebP 文件头部，验证尺寸与唯一路径，保证三份场景 manifest 均不是 production 且 review 为空 | 若有人误删研究图、用小图/错误画幅替换或改成 production，CI 失败 |
| `e2e/r12-local-scene-preview.spec.ts` | 新增 PC 1440×900 与手机 390×844 真实浏览器测试：不点击不请求、点击才渲染、校对当前加载图片原生宽度、PC/手机选图、审稿尺寸红灯、未批准水印和刷新后恢复旧场景；每个区域分别保留 PC/手机截图，共 **6 张** | 原有本地 PNG 上传、对象 URL 回收、失败重试与完全不持久化测试保留 |
| `src/core/game-release.ts`、`public/release.json` | 两处版本标识同步为 **V3.97.0** | 只是研发审稿工作流与代码版本提升，**不能**声明正常玩家视觉已变成高清 |

### 审核入口（PC 优先）

打开以下任一路由，加上 `?r12-art-review=1`，在右下角 R12 审核工具点击“预览仓库已有 PC／手机独立场景研究图”：

- `/apartment/?r12-art-review=1`
- `/orders/?r12-art-review=1`
- `/warehouse/?r12-art-review=1`

可以在 1440×900、1648×928 DPR2、390×844、390×550 各自检查绘景裁切与按钮热点；图片为低原生像素研究稿，**任何美感或构图结论都要注明该限制**。选择本地新原画可以临时覆盖对应画幅，但不会将其标为审核通过。关闭审核参数或刷新后自动回到正式场景。

## 四、验收状态与下一步

需要以**最终 main SHA** 的 Quality（真实图片文件的 Vitest 单测、ESLint/TS、静态导出）、Desktop Visual Review（研究图六张实景截图+原有 Web 审稿隔离）、Gameplay Browser Review 与 Pages 逐项核实；不要以单次测试成功替代整个工作流通过。此前 R12.31 发布 `bbd3bb0` 的 Quality 和 Pages 已通过，桌面视觉与玩法回归仍在推进；新版本的结果须重新核对。

**下一轮可直接开展的美术任务**：以这六张研究构图为**参考而非原生高清成品**，重新绘制独立原生 PC 3840×2160、手机 1080×1920（S02 真实六门、高度/位置安全区、S05 左侧委托柜台留出任务文案、S06 不同于工坊与委托的纵深仓库），保存原始 PNG、输出 WebP、完整来源授权和哈希；先在此审核工具试装、比较截图与视线焦点，再做人工签署与 `check:design` 晋级。S01 首页高密屏背景与 G1 人物/五张 CG 仍是独立未完成任务，不能被本轮研究预览覆盖。
