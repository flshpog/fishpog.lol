"use client";

import Link from "next/link";
import type { NavItem } from "@/types/navigation";
import { useAppStore } from "@/store/appStore";

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
}

export function SidebarItem({ item, isActive }: SidebarItemProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/yourhorizon";
  const iconUrl = `${basePath}${item.icon}`;

  return (
    <li role="none">
      <Link
        href={item.href}
        role="menuitem"
        onClick={() => {
          if (window.innerWidth < 1024) {
            useAppStore.getState().setSidebarOpen(false);
          }
        }}
        aria-current={isActive ? "page" : undefined}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg
          text-sm font-medium transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
          ${
            isActive
              ? "bg-primary-100 text-primary-700 translate-x-0.5"
              : "text-text-secondary hover:bg-bg-hover hover:text-text hover:translate-x-0.5"
          }
        `}
      >
        <span
          className="w-5 h-5 flex-shrink-0"
          style={{
            backgroundColor: "currentColor",
            maskImage: `url(${iconUrl})`,
            WebkitMaskImage: `url(${iconUrl})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
          aria-hidden="true"
        />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}
