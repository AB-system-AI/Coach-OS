import { notFound } from "next/navigation";
import Image from "next/image";
import { resolveTenantFromSlug } from "@/features/tenancy";
import {
  getPublicGallery,
  getPublicMediaImages,
} from "@/features/website/services/public-site-service";
import { ImageIcon } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) return {};
  return {
    title: `Gallery | ${resolved.tenant.name}`,
    description: `Photos and gallery from ${resolved.tenant.name}.`,
  };
}

export default async function GalleryPage({ params }: Props) {
  const { tenant: slug } = await params;
  const resolved = await resolveTenantFromSlug(slug);
  if (!resolved) notFound();

  const { tenant } = resolved;

  const [galleryItems, mediaImages] = await Promise.all([
    getPublicGallery(tenant.id),
    getPublicMediaImages(tenant.id, 40),
  ]);

  // Merge gallery items and media images, prefer gallery items
  type GalleryEntry = { id: string; url: string; alt?: string | null; caption?: string | null };
  const entries: GalleryEntry[] = [
    ...galleryItems.map((g) => ({ id: g.id, url: g.imageUrl, alt: g.caption, caption: g.caption })),
    ...mediaImages
      .filter((m) => !galleryItems.some((g) => g.imageUrl === m.url))
      .map((m) => ({ id: m.url, url: m.url, alt: m.alt ?? m.name, caption: m.alt })),
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--tenant-heading-font)" }}
        >
          Gallery
        </h1>
        <p className="text-muted-foreground">
          A glimpse into our facility and community.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Gallery coming soon.</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {entries.map((item) => (
            <div
              key={item.id}
              className="relative break-inside-avoid rounded-lg overflow-hidden group"
            >
              <Image
                src={item.url}
                alt={item.alt ?? "Gallery image"}
                width={400}
                height={300}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ display: "block" }}
              />
              {item.caption && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-3">
                  <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
