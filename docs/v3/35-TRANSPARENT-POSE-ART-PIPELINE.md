# V3.14 · 月纱等角色四姿态透明贴图验收

## 目标
角色图片不是房间 CG 的抠图，也不是将同一张脸用 Motion 平移四次。
每个人物有四张 **真实、可独立显示的 WebP 透明画布**：idle（待机）、attentive（倾听）、warm（亲近）、guarded（警觉）。
四张的人物身份、服饰主体、光照方向、脚点和整张画布的宽高必须一致；表情与身体动作需真正不同。

## 自动流程
把四张候选图片命名为 idle.webp / attentive.webp / warm.webp / guarded.webp，放在本地同一文件夹。
运行：

```bash
pnpm art:poses --room yuesha --source /path/to/poses --out /tmp/yuesha-poses-review
```

它检查尺寸至少 1000×1000、WebP Alpha 标记、四种姿态画布尺寸一致、四张哈希不可重复，
生成 `review.html`、附带房间和透明棋盘背景预览、四张原图的副本与 `review-status.DRAFT.json`。
预览页在浏览器中进一步检查透明像素和四角，但仍需人工核对脚点、白边、表情、双手、服饰一致性。

## 实际游戏验收
访问 `/apartment/?roomArtReview=1` → 月纱会客室。美术审核面板新增四种姿态的本地 WebP 载入；
上传后立即检查尺寸、64×64 采样透明度、四角清除情况、同尺寸画布，点击姿态即可切换叠在现有背景上的角色。
本地 Blob URL 在卸载时撤销，不写入 Dexie、Zustand、localStorage 和剧情存档；离开页面后失效。

## 已准入与未准入边界
**正式角色还未通过人工美术审核：`residentStatus` 一律保持 `concept`**。
生产素材的 CI 门禁已要求 `portrait-provenance.json` 独立于背景 `provenance.json`：
必须记录每帧 SHA-256、相同宽高、真实人工审核、脚点一致、清洁透明边缘、身份一致与授权来源。
禁止将环境+角色合成 CG 当成 WebP 透明立绘，禁止用扩大分辨率冒充原生绘画细节。

后续正式晋级需增设签署版姿态审批及安全拷贝工具；在真实透明四帧完成且审批前不能主动修改 manifest 为 production。
