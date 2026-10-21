import { Panel } from '@/components/ui/panel';
import { cn } from '@/components/ui/cn';

type StatusBarProps = {
  message: string;
};

export function StatusBar({ message }: StatusBarProps) {
  return (
    <Panel
      role="status"
      aria-live="polite"
      className={cn('p-3', 'bg-ink-700/50 border-line/50')}
    >
      <p className="text-sm text-mist-300 whitespace-pre-wrap">{message}</p>
    </Panel>
  );
}