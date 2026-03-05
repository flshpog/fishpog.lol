"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-bg-card rounded-xl border border-border p-4 animate-card
        ${hoverable ? "cursor-pointer hover:border-primary-300 hover-lift" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}
