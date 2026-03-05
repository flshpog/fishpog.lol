"use client";

import { useState } from "react";

interface IconWrapperProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function IconWrapper({
  src,
  alt,
  size = 32,
  className = "",
}: IconWrapperProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`bg-bg-hover rounded flex items-center justify-center text-text-muted text-xs font-medium ${className}`}
        style={{ width: size, height: size }}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setError(true)}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
