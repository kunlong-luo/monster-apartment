# V3.15：四姿态真正独立晋级

四张透明 WebP 必须来自同一角色制作，造型和脚点统一，实际表情、身体动作有所不同，不能只是场景 CG 的裁切，也不能以同一张原画平移替代四姿态。

在素材文件夹里放入 idle.webp、attentive.webp、warm.webp、guarded.webp。

第一步：运行 pnpm art:poses --room yuesha --source /path/to/poses --out /tmp/yuesha-review

第二步：逐张人工检查手机房间合成、真实透明像素、发丝白边、手部、光照、脚点、服饰与角色身份。填写经人工检查的审批记录，另存为 review-status.APPROVED.json，保持四帧 SHA-256 不变。

第三步：运行 pnpm art:promote-poses --room yuesha --source /path/to/poses --approval /tmp/yuesha-review/review-status.APPROVED.json

脚本核对四张源图字节、SHA-256、宽高、人工审核及授权记录，复制资源后调用 audit:room-art。如果审核失败，回滚本次写入的贴图、状态与记录；正常游戏的存档、对话与线索保持原样。

最后仍需 typecheck、lint、test、build、Playwright 和实际浏览器人工检查。

当前所有角色的正式透明四姿态仍是 0/4。生成的排版设定板不是独立透明贴图，没有被入库或标记为 production。
