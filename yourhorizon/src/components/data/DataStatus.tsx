"use client";

interface DataStatusProps {
  progress: number;
  category: string | null;
}

export function DataStatus({ progress, category }: DataStatusProps) {
  const percent = Math.round(progress * 100);

  return (
    <div className="h-screen flex items-center justify-center bg-bg">
      <div className="text-center p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-primary-600 mb-1">
          Your Horizon
        </h1>
        <p className="text-sm text-text-muted mb-6">Loading your data...</p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-text-muted">
          <span>{category ? `Loading ${category}...` : "Preparing..."}</span>
          <span>{percent}%</span>
        </div>
      </div>
    </div>
  );
}
