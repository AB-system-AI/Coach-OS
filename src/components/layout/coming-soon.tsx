export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">
        This module is on the roadmap. Check docs/ROADMAP.md for timeline.
      </p>
    </div>
  );
}
