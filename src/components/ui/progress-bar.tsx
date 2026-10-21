type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
};

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div className="w-full" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="flex justify-between text-xs text-mist-500 mb-1">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-mint-400 to-mint-500 transition-all duration-200"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}