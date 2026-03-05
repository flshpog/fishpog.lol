interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <p className="text-lg font-medium text-text-secondary">{title}</p>
      {description && (
        <p className="text-sm text-text-muted mt-1">{description}</p>
      )}
    </div>
  );
}
