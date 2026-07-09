import { notFound } from "next/navigation";
import Link from "next/link";
import { getMarketplaceCoachBySlug } from "@/features/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  MapPin,
  BadgeCheck,
  Clock,
  Globe,
  Award,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type CoachProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CoachProfilePage({
  params,
}: CoachProfilePageProps) {
  const { slug } = await params;
  const coach = await getMarketplaceCoachBySlug(slug);

  if (!coach?.marketplaceProfile) {
    notFound();
  }

  const profile = coach.marketplaceProfile;
  const coachUser = coach.members[0]?.user;

  return (
    <div>
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/30 to-secondary/30">
        {profile.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.coverImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row gap-6 pb-8">
          {/* Avatar */}
          <div className="h-32 w-32 rounded-2xl border-4 border-background bg-muted overflow-hidden shrink-0 shadow-lg">
            {profile.profileImageUrl || coachUser?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profileImageUrl ?? coachUser?.image ?? ""}
                alt={coach.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-primary">
                {coach.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 pt-4 md:pt-16">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{coach.name}</h1>
              {profile.isVerified && (
                <Badge className="gap-1 bg-blue-500">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </Badge>
              )}
            </div>
            {profile.headline && (
              <p className="text-lg text-muted-foreground mt-1">
                {profile.headline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">
                  {profile.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({profile.reviewCount} reviews)
                </span>
              </span>
              {(profile.city || profile.country) && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </span>
              )}
              {profile.yearsExperience && (
                <span className="text-muted-foreground">
                  {profile.yearsExperience}+ years experience
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {profile.specialties.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button asChild>
                <Link href={`/${coach.slug}/recovery`}>Book Recovery</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/${coach.slug}`}>Visit Website</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-16">
          <div className="lg:col-span-2 space-y-8">
            {profile.bio && (
              <section>
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </section>
            )}

            {coach.certifications.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </h2>
                <div className="space-y-3">
                  {coach.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        {cert.issuer && (
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer}
                            {cert.year ? ` · ${cert.year}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {coach.recoveryServices.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Recovery Services</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {coach.recoveryServices.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration} min
                          </span>
                          <span className="font-semibold text-primary">
                            {formatCurrency(
                              Number(service.price),
                              service.currency
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {coach.galleryItems.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {coach.galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.caption ?? ""}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {coach.reviews.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Reviews</h2>
                <div className="space-y-4">
                  {coach.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {review.user.name}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            {profile.languages.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {profile.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {coach.programs.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Programs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coach.programs.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{program.name}</span>
                      <span className="font-medium text-primary">
                        {formatCurrency(Number(program.price), program.currency)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {coach.timeSlots.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Available Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {coach.timeSlots.slice(0, 5).map((slot) => (
                      <div
                        key={slot.id}
                        className="flex justify-between text-muted-foreground"
                      >
                        <span>{slot.dayOfWeek}</span>
                        <span>
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.startingPrice != null && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatCurrency(
                      Number(profile.startingPrice),
                      profile.currency
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
