import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';

type GameHeaderProps = {
  helpOpen: boolean;
  onToggleHelp: () => void;
  onReset: () => void;
};

export function GameHeader({ helpOpen, onToggleHelp, onReset }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'grid place-items-center rounded-xl',
            'w-11 h-11 bg-ink-700 text-mint-400 text-3xl',
          )}
          aria-hidden="true"
        >
          ✦
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide m-0">怪物租客公寓</h1>
          <small className="block mt-0.5 text-mist-500 text-[11px] tracking-widest uppercase">
            MONSTER APARTMENT / V0.2.1
          </small>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="quiet" onClick={onToggleHelp} aria-pressed={helpOpen}>
          {helpOpen ? '收起帮助' : '怎么玩？'}
        </Button>
        <Button variant="secondary" onClick={onReset}>
          重新开始
        </Button>
      </div>
    </div>
  );
}