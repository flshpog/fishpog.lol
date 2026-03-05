interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  label,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className="w-8 h-8 border-3 border-border border-t-primary-500 rounded-full animate-spin" />
      {label && (
        <p className="text-sm text-text-muted mt-3">{label}</p>
      )}
    </div>
  );
}
