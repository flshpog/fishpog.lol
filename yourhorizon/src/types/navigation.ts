export type NavGroup = "main" | "tools" | "system";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  group: NavGroup;
}

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  main: "Browse",
  tools: "Tools",
  system: "System",
};
