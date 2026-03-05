"use client";

type BadgeVariant = "collected" | "donated" | "favorite" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  collected: "bg-caught/20 text-caught border-caught/30",
  donated: "bg-donated/20 text-donated border-donated/30",
  favorite: "bg-favorite/20 text-favorite border-favorite/30",
  default: "bg-bg-hover text-text-secondary border-border",
};

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        text-xs font-medium rounded-full border
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
