type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function buildLocalBusinessJsonLd({
  name,
  description,
  url,
  logoUrl,
  phone,
  address,
  city,
  country,
  latitude,
  longitude,
  avgRating,
  reviewCount,
}: {
  name: string;
  description?: string;
  url: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  avgRating?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url,
    ...(logoUrl && { logo: logoUrl }),
    ...(phone && { telephone: phone }),
    ...(address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: address,
        addressLocality: city,
        addressCountry: country,
      },
    }),
    ...(latitude &&
      longitude && {
        geo: { "@type": "GeoCoordinates", latitude, longitude },
      }),
    ...(avgRating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          reviewCount,
        },
      }),
  };
}

export function buildProgramJsonLd({
  name,
  description,
  url,
  price,
  currency,
  imageUrl,
}: {
  name: string;
  description?: string;
  url: string;
  price: number;
  currency: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url,
    ...(imageUrl && { image: imageUrl }),
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    },
  };
}

export function buildBlogPostJsonLd({
  title,
  description,
  url,
  imageUrl,
  authorName,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  authorName?: string;
  publishedAt?: Date | null;
  updatedAt?: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    ...(imageUrl && { image: imageUrl }),
    ...(authorName && {
      author: { "@type": "Person", name: authorName },
    }),
    ...(publishedAt && { datePublished: publishedAt.toISOString() }),
    ...(updatedAt && { dateModified: updatedAt.toISOString() }),
  };
}
