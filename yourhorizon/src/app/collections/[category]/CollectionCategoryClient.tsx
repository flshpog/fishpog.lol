"use client";

import Link from "next/link";
import { CollectionGrid } from "@/modules/collections/components/CollectionGrid";

const CATEGORY_CONFIG: Record<string, { tableNames: string[]; showCategory: boolean }> = {
  items: { tableNames: ["items"], showCategory: true },
  diy: { tableNames: ["diyRecipes"], showCategory: true },
  songs: { tableNames: ["songs"], showCategory: false },
  reactions: { tableNames: ["reactions"], showCategory: false },
};

interface CollectionCategoryClientProps {
  category: string;
  label: string;
}

export function CollectionCategoryClient({ category, label }: CollectionCategoryClientProps) {
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return <p className="text-text-muted">Unknown category.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/collections" className="text-primary-500 hover:underline text-sm">&larr; Collections</Link>
        <span className="text-text-muted text-sm">/</span>
        <h1 className="text-2xl font-bold text-text">{label}</h1>
      </div>

      <CollectionGrid
        category={category}
        tableNames={config.tableNames}
        showCategory={config.showCategory}
      />
    </div>
  );
}
