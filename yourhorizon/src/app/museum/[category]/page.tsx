import { ROUTE_LABELS } from "@/lib/utils/constants";
import { MuseumCategoryClient } from "./MuseumCategoryClient";

interface MuseumCategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function MuseumCategoryPage({ params }: MuseumCategoryPageProps) {
  const { category } = await params;
  const label = ROUTE_LABELS[category] ?? category;

  return <MuseumCategoryClient category={category} label={label} />;
}

export function generateStaticParams() {
  return [
    { category: "fish" },
    { category: "bugs" },
    { category: "sea" },
    { category: "fossils" },
    { category: "art" },
  ];
}
