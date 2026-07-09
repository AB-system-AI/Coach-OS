"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ANY_VALUE = "__any__";

export function MarketplaceFilters({ options }: MarketplaceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ANY_VALUE) {
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
        value={searchParams.get("country") ?? ANY_VALUE}
        options={options.countries}
        onChange={(v) => updateParam("country", v)}
      />

      <FilterSelect
        label="City"
        value={searchParams.get("city") ?? ANY_VALUE}
        options={options.cities}
        onChange={(v) => updateParam("city", v)}
      />

      <FilterSelect
        label="Specialty"
        value={searchParams.get("specialty") ?? ANY_VALUE}
        options={options.specialties}
        onChange={(v) => updateParam("specialty", v)}
      />

      <FilterSelect
        label="Language"
        value={searchParams.get("language") ?? ANY_VALUE}
        options={options.languages}
        onChange={(v) => updateParam("language", v)}
      />

      <div className="space-y-2">
        <Label>Gender</Label>
        <Select
          value={searchParams.get("gender") ?? ANY_VALUE}
          onValueChange={(v) => updateParam("gender", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Any</SelectItem>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Min Rating</Label>
        <Select
          value={searchParams.get("minRating") ?? ANY_VALUE}
          onValueChange={(v) => updateParam("minRating", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Any</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
          </SelectContent>
        </Select>
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
        <Select
          value={searchParams.get("sortBy") ?? "rating"}
          onValueChange={(v) => updateParam("sortBy", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Highest Rated" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="experience">Most Experience</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
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
      <Select value={value || ANY_VALUE} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY_VALUE}>Any</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
