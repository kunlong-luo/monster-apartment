# R12.41 · 独立场景视觉验收作业（2026-11-24）

基线 `eec361ac8453eca865ecc90857acea7e1cbe45a0` / V3.101.0。不是新美术或运行时修复。

## 实际阻塞

[R12.36 Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45322294938) 的 [job](https://github.com/kunlong-luo/monster-apartment/actions/runs/45322294938/job/138203460596) 已回读：字体安装、导航和欢迎页/地图检查完成，`Check opt-in local scene art review never publishes drafts` 被取消，其余后续用例未完成。不能仅根据取消状态断定是字体安装或某个特定用例超时。六门专项缺乏完整结果，不能签署。

[R12.40 Gameplay Browser Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323781827) 核查时已进入完整玩法回归；[Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323781876) 两个构建作业通过，checks 尚在运行。此次不修改会触发 Gameplay 的文件路径，避免为本轮开发重新启动该完整回归。

## 实施

- 原 Desktop Visual Review 保留 `desktop-review` 作业与原有其余测试。
- 将 `e2e/r12-local-scene-preview.spec.ts` 全部六个测试原样移到并行的 `scene-art-review` 作业，独立 runner / 12 分钟预算 / CJK 字体 / Chrome / 冻结依赖；不改测试断言，不强制点击，不扩大用例超时。独立截图及失败证据 artifact `r12-scene-art-review`（always 上传，14 天保留）。任何作业失败仍使整个工作流失败。
- 补充主分支触发路径：公寓门位组件、布局 CSS、房间几何、场景资源注册与 `public/art/world-scenes/**`。这样后续真正更换场景原画也触发视觉验收，而非仅改 UI 时触发。工作流级 cancel-in-progress 保持原状；相关新提交仍可取消旧运行，独立作业不是保证永不取消。
- 继续保留 Quality / Pages 发布独立性，不增加正式页面、不修改存档、不晋级资源。没有新增依赖。本轮工作流修改会触发一轮新的 Desktop Visual Review，结果及实际截图待 GitHub 运行。

## 快速验收路径

查看 Actions → Desktop Visual Review → scene-art-review，先读六项实际通过/失败情况，再检查四视口六门截图、普通玩家不加载研究图、直接 URL hydration、异步图片切换及恢复。失败按实际日志定位，不必等其它页面截图任务结束才能判断该切片。完整玩法与综合视觉仍独立记录，不以专项成功替代全量验收。

本轮未重绘或替换任何图片，生产 S02/S05/S06 0/3、G1 0/4、CG 0/5。下一轮取得该独立作业的结果后，处理实际门位/HUD 缺陷；正式高清美术仍需真实原图入库和人审。
