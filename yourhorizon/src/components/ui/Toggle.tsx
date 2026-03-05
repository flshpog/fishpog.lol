"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative w-10 h-5.5 rounded-full transition-colors duration-200
          ${checked ? "bg-primary-500" : "bg-border-strong"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4.5 h-4.5
            bg-white rounded-full shadow-sm
            transition-transform duration-200
            ${checked ? "translate-x-[18px]" : "translate-x-0"}
          `}
        />
      </button>
      {label && (
        <span className="text-sm text-text">{label}</span>
      )}
    </label>
  );
}
