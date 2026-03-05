"use client";

import { Card } from "@/components/ui/Card";

interface CreditEntry {
  name: string;
  url?: string;
  license?: string;
  description: string;
}

const DATA_SOURCES: CreditEntry[] = [
  {
    name: "ACNHAPI",
    url: "https://github.com/alexislours/ACNHAPI",
    license: "CC BY 4.0",
    description: "Fish, bugs, sea creatures, fossils, art, houseware, wall-mounted items, miscellaneous items",
  },
  {
    name: "Norviah/animal-crossing",
    url: "https://github.com/Norviah/animal-crossing",
    license: "MIT",
    description: "Villagers (413), K.K. Slider songs (110), reactions (88), events (108), NPC visitors (26), DIY recipes",
  },
  {
    name: "Nookipedia",
    url: "https://nookipedia.com",
    license: "CC BY-SA 3.0",
    description: "Supplementary data for 3.0 update villagers (Cece, Viche, Tulin, Mineru)",
  },
];

const ALGORITHMS: CreditEntry[] = [
  {
    name: "Turnip Prophet",
    url: "https://github.com/mikebryant/ac-nh-turnip-prices",
    license: "MIT",
    description: "Turnip price prediction patterns and Bayesian probability model with transition matrices",
  },
  {
    name: "MeteoNook",
    url: "https://github.com/Treeki/MeteoNook",
    license: "AGPL-3.0",
    description: "Weather seed prediction logic, hash-based pseudo-random weather generation",
  },
];

const LIBRARIES: CreditEntry[] = [
  { name: "Next.js", url: "https://nextjs.org", license: "MIT", description: "React framework with static export" },
  { name: "React", url: "https://react.dev", license: "MIT", description: "UI component library" },
  { name: "TypeScript", url: "https://typescriptlang.org", license: "Apache 2.0", description: "Type-safe JavaScript" },
  { name: "TailwindCSS", url: "https://tailwindcss.com", license: "MIT", description: "Utility-first CSS framework" },
  { name: "Zustand", url: "https://github.com/pmndrs/zustand", license: "MIT", description: "State management" },
  { name: "Dexie.js", url: "https://dexie.org", license: "Apache 2.0", description: "IndexedDB wrapper for local persistence" },
  { name: "MiniSearch", url: "https://github.com/lucaong/minisearch", license: "MIT", description: "Full-text search engine for 25k+ entries" },
  { name: "TanStack Virtual", url: "https://tanstack.com/virtual", license: "MIT", description: "Virtualized list/grid rendering" },
  { name: "Three.js", url: "https://threejs.org", license: "MIT", description: "3D rendering for Island Designer" },
];

function CreditList({ entries }: { entries: CreditEntry[] }) {
  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.name} className="text-sm">
          <div className="flex items-baseline gap-2 flex-wrap">
            {entry.url ? (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-600 hover:text-primary-500 underline underline-offset-2 transition-colors"
              >
                {entry.name}
              </a>
            ) : (
              <span className="font-semibold text-text">{entry.name}</span>
            )}
            {entry.license && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-bg-hover text-text-muted border border-border">
                {entry.license}
              </span>
            )}
          </div>
          <p className="text-text-secondary text-xs mt-0.5">{entry.description}</p>
        </li>
      ))}
    </ul>
  );
}

export default function CreditsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text">Credits</h1>
        <p className="text-text-secondary mt-1">
          Data sources, algorithms, and open-source projects that power Your Horizon.
        </p>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Data Sources</h2>
        <CreditList entries={DATA_SOURCES} />
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Algorithms</h2>
        <CreditList entries={ALGORITHMS} />
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Open-Source Libraries</h2>
        <CreditList entries={LIBRARIES} />
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Icons</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="font-semibold text-text">Module icons</span>
            <p className="text-text-secondary text-xs mt-0.5">Custom SVG icons inspired by ACNH in-game UI elements</p>
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Disclaimer</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Animal Crossing: New Horizons is a registered trademark of Nintendo Co., Ltd.
          All game data, character names, images, and assets are the property of Nintendo.
          This is a fan-made companion tool created for informational and personal tracking purposes.
          It is not affiliated with, endorsed by, or sponsored by Nintendo.
        </p>
      </Card>
    </div>
  );
}
