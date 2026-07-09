"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

type FilterOptions = {
  countries: string[];
  cities: string[];
  specialties: string[];
  languages: string[];
};

type MarketplaceFiltersProps = {
  options: FilterOptions;
};

export function MarketplaceFilters({ options }: MarketplaceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/marketplace?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/marketplace");
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 me-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Coach name..."
            className="ps-9"
            defaultValue={searchParams.get("search") ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("search", (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      </div>

      <FilterSelect
        label="Country"
        value={searchParams.get("country") ?? ""}
        options={options.countries}
        onChange={(v) => updateParam("country", v)}
      />

      <FilterSelect
        label="City"
        value={searchParams.get("city") ?? ""}
        options={options.cities}
        onChange={(v) => updateParam("city", v)}
      />

      <FilterSelect
        label="Specialty"
        value={searchParams.get("specialty") ?? ""}
        options={options.specialties}
        onChange={(v) => updateParam("specialty", v)}
      />

      <FilterSelect
        label="Language"
        value={searchParams.get("language") ?? ""}
        options={options.languages}
        onChange={(v) => updateParam("language", v)}
      />

      <div className="space-y-2">
        <Label>Gender</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={searchParams.get("gender") ?? ""}
          onChange={(e) => updateParam("gender", e.target.value)}
        >
          <option value="">Any</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Min Rating</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={searchParams.get("minRating") ?? ""}
          onChange={(e) => updateParam("minRating", e.target.value)}
        >
          <option value="">Any</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Max Price</Label>
        <Input
          type="number"
          placeholder="e.g. 100"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParam("maxPrice", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={searchParams.get("sortBy") ?? "rating"}
          onChange={(e) => updateParam("sortBy", e.target.value)}
        >
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="experience">Most Experience</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Any</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
