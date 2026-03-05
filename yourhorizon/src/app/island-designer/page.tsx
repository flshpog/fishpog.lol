import { Card } from "@/components/ui/Card";

export default function IslandDesignerPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Island Designer</h1>
        <p className="text-text-secondary mt-1">
          Plan your island layout with a visual editor.
        </p>
      </div>

      <Card className="text-center py-12">
        <p className="text-lg font-semibold text-text">Coming Soon</p>
        <p className="text-sm text-text-muted mt-2">
          A full island designer tool is in the works. Stay tuned!
        </p>
      </Card>
    </div>
  );
}
