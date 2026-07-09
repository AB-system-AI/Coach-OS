import {
  searchMarketplaceCoaches,
  getMarketplaceFilterOptions,
} from "@/features/marketplace";
import { CoachCard } from "@/features/marketplace/components/coach-card";
import { MarketplaceFilters } from "@/features/marketplace/components/marketplace-filters";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type MarketplacePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const params = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );

  const [result, options] = await Promise.all([
    searchMarketplaceCoaches(filters),
    getMarketplaceFilterOptions(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Find Your Coach</h1>
        <p className="text-lg text-muted-foreground">
          Browse verified fitness coaches, compare specialties, and book recovery sessions.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Suspense fallback={<div className="h-96 rounded-xl border animate-pulse" />}>
            <MarketplaceFilters options={options} />
          </Suspense>
        </aside>

        <div className="lg:col-span-3">
          <p className="text-sm text-muted-foreground mb-4">
            {result.total} coach{result.total !== 1 ? "es" : ""} found
          </p>

          {result.coaches.length === 0 ? (
            <div className="text-center py-20 rounded-xl border bg-muted/30">
              <p className="text-lg font-medium">No coaches found</p>
              <p className="text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === result.page ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/marketplace?${new URLSearchParams({ ...filters, page: String(page) }).toString()}`}
                    >
                      {page}
                    </Link>
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
