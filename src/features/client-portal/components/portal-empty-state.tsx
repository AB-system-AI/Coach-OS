import { Card, CardContent } from "@/components/ui/card";

type PortalEmptyStateProps = {
  title: string;
  description: string;
};

export function PortalEmptyState({ title, description }: PortalEmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-2 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
