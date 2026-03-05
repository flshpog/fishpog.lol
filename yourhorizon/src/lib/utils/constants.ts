import type { NavItem } from "@/types/navigation";

/** Bumped when static data files change to trigger re-fetch */
export const DATA_VERSION = "1.0.0";

/** Default timezone if auto-detection fails */
export const DEFAULT_TIMEZONE = "America/New_York";

/** Search debounce in milliseconds */
export const SEARCH_DEBOUNCE_MS = 200;

/** Chunk size for bulk IndexedDB operations */
export const BULK_CHUNK_SIZE = 500;

/** Sidebar navigation items */
export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: "/icons/modules/home.svg", group: "main" },
  { id: "profile", label: "Profile", href: "/profile", icon: "/icons/modules/profile.svg", group: "main" },
  { id: "villagers", label: "Villagers", href: "/villagers", icon: "/icons/modules/villagers.svg", group: "main" },
  { id: "museum", label: "Museum", href: "/museum", icon: "/icons/modules/museum.svg", group: "main" },
  { id: "collections", label: "Collections", href: "/collections", icon: "/icons/modules/collections.svg", group: "main" },
  { id: "events", label: "Events", href: "/events", icon: "/icons/modules/events.svg", group: "tools" },
  { id: "visitors", label: "NPC Visitors", href: "/visitors", icon: "/icons/modules/visitors.svg", group: "tools" },
  { id: "flowers", label: "Flower Breeding", href: "/flowers", icon: "/icons/modules/flowers.svg", group: "tools" },
  { id: "mystery-islands", label: "Mystery Islands", href: "/mystery-islands", icon: "/icons/modules/mystery-islands.svg", group: "tools" },
  { id: "weather", label: "Weather Seed", href: "/weather", icon: "/icons/modules/weather.svg", group: "tools" },
  { id: "island-designer", label: "Island Designer", href: "/island-designer", icon: "/icons/modules/island-designer.svg", group: "tools", comingSoon: true },
  { id: "turnips", label: "Turnip Calculator", href: "/turnips", icon: "/icons/modules/turnips.svg", group: "tools", comingSoon: true },
  { id: "settings", label: "Settings", href: "/settings", icon: "/icons/modules/settings.svg", group: "system" },
  { id: "credits", label: "Credits", href: "/credits", icon: "/icons/modules/credits.svg", group: "system" },
];

/** Human-readable labels for route segments */
export const ROUTE_LABELS: Record<string, string> = {
  "": "Home",
  profile: "Profile",
  villagers: "Villagers",
  museum: "Museum",
  collections: "Collections",
  turnips: "Turnip Calculator",
  events: "Events",
  visitors: "NPC Visitors",
  flowers: "Flower Breeding",
  "mystery-islands": "Mystery Islands",
  weather: "Weather Seed",
  "island-designer": "Island Designer",
  settings: "Settings",
  credits: "Credits",
  fish: "Fish",
  bugs: "Bugs",
  sea: "Sea Creatures",
  fossils: "Fossils",
  art: "Art",
  items: "Items",
  diy: "DIY Recipes",
  songs: "Songs",
  reactions: "Reactions",
};
