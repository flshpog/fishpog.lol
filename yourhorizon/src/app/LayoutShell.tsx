"use client";

import { DataBootstrap } from "@/components/data/DataBootstrap";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MainContent } from "@/components/layout/MainContent";
import { useAppStore } from "@/store/appStore";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <DataBootstrap>
      {/* Skip-to-content link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:outline-none"
      >
        Skip to content
      </a>

      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        {/* Mobile backdrop — closes sidebar on tap */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={() => useAppStore.getState().setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={`
            flex flex-col flex-1 overflow-hidden
            transition-all duration-200
            ${sidebarOpen ? "lg:ml-60 ml-0" : "ml-0"}
          `}
        >
          <TopBar />
          <MainContent>{children}</MainContent>
        </div>
      </div>
    </DataBootstrap>
  );
}
