import { Construction } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ComingSoonPanelProps = {
  title: string;
  description?: string;
};

export function ComingSoonPanel({ title, description }: ComingSoonPanelProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Construction className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground pb-8">
        <p className="font-medium text-foreground mb-1">Coming Soon</p>
        <p>
          {description ??
            "This enterprise module is on our roadmap. Core coaching tools remain fully available in your dashboard."}
        </p>
      </CardContent>
    </Card>
  );
}
