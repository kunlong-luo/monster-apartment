# R12.38 · 六份场景研究图来源清单一致性（2026-11-24）

基线 `c0fb19e60d3261fbbe3064f23d99ed3258221f18` / V3.101.0。不是新图生成或生产晋级。

## 实际证据

[R12.37 Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45322837015) 已通过，其中 `checks` job 的 `pnpm audit:r12-review-art` 成功；该脚本实际读取 PNG/WebP 字节，核对 SHA-256、长度和像素。此次再次读取同 SHA 的 Git Tree，核对六组 12 个真实 blob 路径和字节长度与 R12-09 台账一致。以下 SHA-256 引自已通过的文件审计台账，而非本轮在本地重新计算。

| 任务 | PNG Git blob | WebP Git blob |
| --- | --- | --- |
| ART-S02-D | `6179f84f76082820298d3b454277c1d67404150d` | `122c8143fb2cee064971df841917e2ed88f0212e` |
| ART-S02-M | `9c4ce57a367c87bc31dab85c1e467771a2732c24` | `931970f6dfb9f9e511fc8933e12aa2365b379331` |
| ART-S05-D | `4f5968cc72af4465d610f3eff98fc4c324b8d127` | `61122e427bcd43eed9e7bce87e21df14f209b6b0` |
| ART-S05-M | `0c1bf9901e493c849acfe6cdb75329e00690a696` | `d21372731b9a6a20b881a9afa3e1f584cee194c5` |
| ART-S06-D | `fe8be9159795d02c6317cb34ad60017256058d7c` | `2c823339e8b32e0f3367386cca6c1066f6233e56` |
| ART-S06-M | `b6ccb601c29e6de49e2c5bb111c8d27a30fe41d4` | `3e5173ddb694da83274b71043b8be91a5c018449` |

## 修复

- 生产入口的 candidate 记录中，S05/S06 共四份仍指向早期 11-14/16 会话 ZIP；现在绑定已入 Git 的 11-22/23 研究稿路径与对应原生尺寸、SHA-256。S02 两份已有正确来源，同步添加结构化研究引用。旧来源保留在此前提交及本文下表，不假称旧图与新图相同。
- `researchAssetId / researchSourcePath / researchPreviewPath / researchPreviewSHA256` 与 R12-09 台账逐一对应。扩展 `scripts/verify-r12-review-assets.mjs` 现有校验：对于当前 review 场景，检查候选原图、WebP、SHA、像素及未批准状态是否与已验证二进制台账一致；差异使 Quality 的 art audit 失败。
- 六份候选全部仍是研究态，`humanVisualReview=false`、scene.status=review、scene.review=null。正式路径不变，`hasNativeMobileArt=false` 保留既有未达到原生生产标准语义，不否认独立手机研究图存在。普通玩家不自动加载研究图，显式研究模式不变。

### 历史来源与现行来源 SHA-256

| 任务 | 旧源 SHA-256 | 现行研究源 SHA-256 |
| --- | --- | --- |
| ART-S05-D | `ae97b5f40161a3b40bc6732a453c0b3af6bc379872a7ec13e0dac59557399530` | `e02d879247c8eb2de38ba2ae09fb8021454b9174891c74b48f7db1284fe152ac` |
| ART-S05-M | `96d5fffb7e571c0733a2a2de7702188b49290bc3c55d14360372530b580935f8` | `4cec5d4c78f7eabb0ecabf17932c8316f0c7a0e4b7f185d29043a9326c10c0b1` |
| ART-S06-D | `f84ac996a287cc35ecf4210210329fdc71c7ec6cb7c7247d42389aef3732b009` | `6a2f5a55beedd77549b3d81963c642c00450014ef965571163cabb71413375a1` |
| ART-S06-M | `882de33135914fdac8a5b9d1a280a7a603df472d698b00875393780e654a708b` | `2261ffccb6021b7065ddd95abb722ecd7fbd29b185ce3a3cda191f6aa39df6b9` |

## 阻塞与下一步

当前通过会话/Library 文件检索未找到 `monster-apartment-r12-22-g1-four-faces.zip`；不能导入未知字节，0/10 G1 图片入 Git 的历史状态仍未改变。需要实际原包后按 R12.24 校验。R12.36 桌面视觉回归仍在运行（核查时停在字体安装），本次不改 TS/React/E2E、版本号或触发该工作流的路径，不中断其检查。新增审计规则尚未本地执行，以新 SHA Quality 为准。

正式 S02/S05/S06 仍 0/3、正式 CG 0/5；未新绘、未人审、未晋级。下一轮先回读六门真实点击验收，再推进 HUD 共存及原生高清美术生产。
