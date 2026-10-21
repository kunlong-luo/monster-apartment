import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/components/ui/cn';

type ResultCardProps = {
  outcome: 'win' | 'lose';
  notice: string;
  onReset: () => void;
};

export function ResultCard({ outcome, notice, onReset }: ResultCardProps) {
  const isWin = outcome === 'win';

  return (
    <Panel
      className={cn(
        'text-center',
        isWin && 'border-gold-300/50 bg-gold-200/5',
        !isWin && 'border-danger-300/50 bg-danger-300/5',
      )}
    >
      <div className="text-2xl font-bold mb-2" style={{ color: isWin ? '#f0c98f' : '#ffa8a8' }}>
        {isWin ? '🎉 经营成功' : '本局未达标'}
      </div>
      <p className="text-mist-400 text-sm mb-4">{notice}</p>
      <Button variant="primary" size="lg" onClick={onReset}>
        再玩一局
      </Button>
    </Panel>
  );
}