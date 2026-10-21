import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { TENANTS, TENANT_IDS } from '@/core/engine';

export function PlayHelp() {
  return (
    <Panel className="overflow-hidden">
      <SectionHeading title="怎么玩？" />
      <div className="space-y-4 text-sm text-mist-400 leading-relaxed">
        <div>
          <p className="font-medium text-mist-300 mb-2">核心循环</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>左侧点击选择一间空房（高亮显示）</li>
            <li>从可招募租客中挑选一位（需足够金币）</li>
            <li>点击「结束今天」结算租金、维护、组合加成与随机事件</li>
            <li>共 5 天，达成金币 ≥ 135 且满意度 ≥ 55 即胜利</li>
          </ol>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">租客图鉴</p>
          <div className="grid grid-cols-2 gap-2">
            {TENANT_IDS.map((id) => {
              const t = TENANTS[id];
              const colorHex = `#${t.color.toString(16).padStart(6, '0')}`;
              return (
                <div key={id} className="flex items-center gap-2 p-2 bg-ink-700 rounded-xl">
                  <span style={{ color: colorHex }} className="text-xl" aria-hidden="true">{t.icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-xs text-mist-500">-{t.price} 金币 · 租金 +{t.rent}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">相邻组合加成</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="mint">蒸汽供能：火精灵+史莱姆 +3 租金</Badge>
            <Badge tone="mint">夜间守护：幽灵+石像鬼 +4 租金</Badge>
            <Badge tone="mint">整洁石像：石像鬼+史莱姆 +2 租金</Badge>
            <Badge tone="danger">冷热争执：火精灵+幽灵 -3 租金 -4 满意度</Badge>
          </div>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">每日随机事件</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li>第 1 天：有石像鬼得 6 金币</li>
            <li>第 2 天：有史莱姆得 4 金币，否则 -8 金币 -8 满意度</li>
            <li>第 3 天：幽灵+石像鬼相邻得 12 金币，否则 -7 满意度</li>
            <li>第 4 天：有火精灵得 7 金币，否则 -8 金币</li>
            <li>第 5 天：满意度 ≥ 65 得 20 金币，否则 -10 金币</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">搬家与交换</p>
          <p className="text-xs">点击「搬家」按钮后，再点击另一间房即可交换两间房的租客（或搬入空房）。</p>
        </div>
      </div>
    </Panel>
  );
}