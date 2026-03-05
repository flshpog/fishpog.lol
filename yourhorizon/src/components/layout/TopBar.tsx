"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import { useAppStore } from "@/store/appStore";

export function TopBar() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <header
      role="banner"
      className="
        h-14 flex items-center
        px-5 bg-bg-topbar border-b border-border
        flex-shrink-0
      "
    >
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-md hover:bg-bg-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          aria-label="Toggle sidebar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-text-secondary"
            aria-hidden="true"
          >
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <Breadcrumbs />
      </div>
    </header>
  );
}
