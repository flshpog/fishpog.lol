"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showCount?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showCount = true,
  className = "",
}: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      {(label || showCount) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-text">{label}</span>
          )}
          {showCount && (
            <span className="text-xs text-text-muted">
              {value} / {max} ({percent}%)
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
