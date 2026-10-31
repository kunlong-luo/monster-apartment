# 房间高清背景候选清单 · V3.83

本轮只验证了公开资源的描述和许可声明，**没有把外部图片写进游戏**。实际替换前必须检查单幅图像和物件对应关系。

1. [WineChan · Background - Gothic Manor](https://winechan.itch.io/gothic-manor)：页面声明 73 张哥特庄园内外景，public domain，122 MB，AI-assisted；候选。正式审核前不能假设每张都有 1920×1080，不能假设物件有「月纹蜡封、香料茶杯、旧账簿」。
2. [Ebbasuke · Gloomy Mansion Background Pack (4K)](https://ebbasuke.itch.io/gloomy-mansion-background-pack)：页面声明 19 张 4K .jpg/.webp，CC BY 4.0，非 AI，照片编辑风格。使用需署名并核验风格和作者给出的许可限制。

### 选择门槛

- 仅接受独立的 16:9、原生至少 1920×1080 的环境原画，没有游戏 UI、文字、人物或水印。
- 月纱会客室需要能准确定位 seal / tea / ledger；不可把卧室床边热点认成契约蜡封。
- 图片实际检查 SHA256、尺寸、商业许可、署名要求、画面风格，审阅 PC 1440×900 和手机 390×844 的热点位置。
- 逐张导入审核目录，执行现有 `pnpm art:review` / `pnpm art:promote`，只在严格签署后修改 `public/art/rooms/manifest.json`。
- 不裁切多格概念板、不把低清图用插值放大冒充高清，不将未审核第三方图直接置为生产背景。

**当前状态：** V3.83 实际完成的是房间观赏画幅/遮挡修复，背景仍然是概念资产。
