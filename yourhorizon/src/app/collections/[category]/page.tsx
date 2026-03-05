import { ROUTE_LABELS } from "@/lib/utils/constants";
import { CollectionCategoryClient } from "./CollectionCategoryClient";

interface CollectionCategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CollectionCategoryPage({ params }: CollectionCategoryPageProps) {
  const { category } = await params;
  const label = ROUTE_LABELS[category] ?? category;

  return <CollectionCategoryClient category={category} label={label} />;
}

export function generateStaticParams() {
  return [
    { category: "items" },
    { category: "diy" },
    { category: "songs" },
    { category: "reactions" },
  ];
}
