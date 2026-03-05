"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTE_LABELS } from "@/lib/utils/constants";

export function Breadcrumbs() {
  const pathname = usePathname();

  // Remove basePath prefix if present, then split
  const cleanPath = pathname.replace(/^\/yourhorizon/, "");
  const segments = cleanPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
        <span className="text-text font-medium">Home</span>
      </nav>
    );
  }

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = ROUTE_LABELS[segment] ?? segment;
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm flex items-center gap-1.5">
      <Link href="/" className="text-text-muted hover:text-text transition-colors">
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <span className="text-text-muted">/</span>
          {crumb.isLast ? (
            <span className="text-text font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-text-muted hover:text-text transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
