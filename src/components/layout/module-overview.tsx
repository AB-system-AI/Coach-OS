import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ModuleOverviewProps = {
  title: string;
  description: string;
  stats?: { label: string; value: string | number }[];
  actions?: { label: string; href: string }[];
};

export function ModuleOverview({
  title,
  description,
  stats = [],
  actions = [],
}: ModuleOverviewProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      {stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Button key={action.href} asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
