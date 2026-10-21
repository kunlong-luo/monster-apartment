import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';

type BonusListProps = {
  messages: string[];
};

export function BonusList({ messages }: BonusListProps) {
  if (messages.length === 0) return null;

  return (
    <Panel>
      <SectionHeading title="本轮加成" />
      <div className="flex flex-wrap gap-1.5">
        {messages.map((msg, i) => (
          <Badge key={i} tone={msg.includes('-') ? 'danger' : 'mint'}>
            {msg}
          </Badge>
        ))}
      </div>
    </Panel>
  );
}