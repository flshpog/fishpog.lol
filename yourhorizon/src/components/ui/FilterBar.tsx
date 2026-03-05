"use client";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function FilterBar({
  options,
  selected,
  onSelect,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium
            transition-colors
            ${
              selected === option.value
                ? "bg-primary-500 text-white"
                : "bg-bg-hover text-text-secondary hover:bg-border hover:text-text"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
