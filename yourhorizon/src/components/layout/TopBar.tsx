"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import { useAppStore } from "@/store/appStore";

export function TopBar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
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
          className="p-1.5 rounded-md hover:bg-bg-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className={`text-text-secondary transition-transform duration-200 ${sidebarOpen ? "" : "rotate-180"}`}
            aria-hidden="true"
          >
            <path
              d="M12.5 4L6.5 10L12.5 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <Breadcrumbs />
      </div>
    </header>
  );
}
