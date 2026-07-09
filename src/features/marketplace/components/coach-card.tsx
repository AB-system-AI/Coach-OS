"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, BadgeCheck, Heart, Dumbbell } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceCoachCard } from "@/features/marketplace/services/marketplace-search";

type CoachCardProps = {
  coach: MarketplaceCoachCard;
};

export function CoachCard({ coach }: CoachCardProps) {
  return (
    <Link href={`/marketplace/${coach.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-secondary/20">
          {coach.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coach.coverImageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute -bottom-8 start-4">
            <div className="h-16 w-16 rounded-full border-4 border-background bg-muted overflow-hidden">
              {coach.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coach.profileImageUrl}
                  alt={coach.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-primary">
                  {coach.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          {coach.isVerified && (
            <Badge className="absolute top-3 end-3 gap-1 bg-blue-500">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>

        <CardContent className="pt-10 pb-4">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {coach.name}
          </h3>
          {coach.headline && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
              {coach.headline}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{coach.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({coach.reviewCount})</span>
            </span>
            {(coach.city || coach.country) && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {[coach.city, coach.country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>

          {coach.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {coach.specialties.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              {coach.recoveryServiceCount > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {coach.recoveryServiceCount}
                </span>
              )}
              {coach.programCount > 0 && (
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5" />
                  {coach.programCount}
                </span>
              )}
            </div>
            {coach.startingPrice != null && (
              <span className="font-semibold text-primary">
                From {formatCurrency(coach.startingPrice, coach.currency)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
