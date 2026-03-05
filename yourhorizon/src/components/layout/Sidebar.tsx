"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useCallback, useState } from "react";
import { NAV_ITEMS } from "@/lib/utils/constants";
import { useAppStore } from "@/store/appStore";
import type { NavGroup } from "@/types/navigation";
import { NAV_GROUP_LABELS } from "@/types/navigation";
import { SidebarItem } from "./SidebarItem";

const GROUP_ORDER: NavGroup[] = ["main", "tools", "system"];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const navRef = useRef<HTMLElement>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<NavGroup>>(
    new Set()
  );

  const groups = GROUP_ORDER.map((group) => ({
    group,
    label: NAV_GROUP_LABELS[group],
    items: NAV_ITEMS.filter((item) => item.group === group),
  }));

  const toggleGroup = useCallback((group: NavGroup) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  // Keyboard navigation within sidebar
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

      e.preventDefault();
      const nav = navRef.current;
      if (!nav) return;

      const focusableLinks = Array.from(
        nav.querySelectorAll<HTMLElement>('a[role="menuitem"]')
      );
      if (focusableLinks.length === 0) return;

      const currentIndex = focusableLinks.indexOf(
        document.activeElement as HTMLElement
      );

      let nextIndex: number;
      if (e.key === "ArrowDown") {
        nextIndex =
          currentIndex < focusableLinks.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : focusableLinks.length - 1;
      }

      focusableLinks[nextIndex]?.focus();
    },
    []
  );

  return (
    <aside
      className={`
        fixed top-0 left-0 z-30 h-screen w-60 flex-shrink-0
        bg-bg-sidebar border-r border-border
        flex flex-col overflow-y-auto
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{ boxShadow: "var(--shadow-sidebar)" }}
      aria-label="Main navigation"
    >
      {/* Logo / Title */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg">
          <h1 className="text-xl font-bold text-primary-600">Your Horizon</h1>
          <p className="text-xs text-text-muted mt-0.5">ACNH Companion</p>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav ref={navRef} className="flex-1 py-2" onKeyDown={handleKeyDown}>
        {groups.map(({ group, label, items }) => {
          const isCollapsed = collapsedGroups.has(group);

          return (
            <div key={group} className="mt-1">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-inset rounded"
                aria-expanded={!isCollapsed}
                aria-controls={`nav-group-${group}`}
              >
                <span>{label}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`text-text-muted transition-transform duration-150 ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Group items */}
              <ul
                id={`nav-group-${group}`}
                role="menu"
                className={`space-y-0.5 px-2 overflow-hidden transition-all duration-150 ${
                  isCollapsed
                    ? "max-h-0 opacity-0"
                    : "max-h-[500px] opacity-100"
                }`}
              >
                {items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/" || pathname === ""
                      : pathname.startsWith(item.href);

                  return (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      isActive={isActive}
                    />
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Version footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] text-text-muted">Your Horizon v1.0</p>
      </div>
    </aside>
  );
}
