import { db } from "@/lib/db";
import type { BusinessType } from "@prisma/client";
import { BUSINESS_TYPES } from "@/features/modules/types/registry";

function deriveSecondaryColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lighten = (c: number) => Math.min(255, Math.round(c + (255 - c) * 0.35));
  return `#${lighten(r).toString(16).padStart(2, "0")}${lighten(g).toString(16).padStart(2, "0")}${lighten(b).toString(16).padStart(2, "0")}`;
}

function businessTypeLabel(type: BusinessType): string {
  return BUSINESS_TYPES.find((b) => b.type === type)?.label ?? "Coach";
}

export async function seedCoachWebsite(input: {
  tenantId: string;
  businessName: string;
  businessType: BusinessType;
  coachingSpecialty: string;
  brandColor: string;
  country: string;
  language: string;
}) {
  const { tenantId, businessName, businessType, coachingSpecialty, brandColor, country, language } =
    input;
  const secondaryColor = deriveSecondaryColor(brandColor);
  const typeLabel = businessTypeLabel(businessType);

  await db.tenantTheme.update({
    where: { tenantId },
    data: {
      primaryColor: brandColor,
      secondaryColor,
      accentColor: brandColor,
      heroTitle: `Transform Your Fitness with ${businessName}`,
      heroSubtitle: `Expert ${coachingSpecialty} coaching tailored to your goals. Join ${businessName} today.`,
      heroCtaText: "Book a Session",
      heroCtaLink: "/booking",
      footerText: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
    },
  });

  await db.tenantSettings.update({
    where: { tenantId },
    data: {
      businessName,
      country,
      locale: language === "Arabic" ? "ar" : "en",
      seoTitle: `${businessName} | ${coachingSpecialty} ${typeLabel}`,
      seoDescription: `Professional ${coachingSpecialty.toLowerCase()} coaching at ${businessName}. Programs, bookings, and personalized training in ${country}.`,
      seoKeywords: `${coachingSpecialty}, ${typeLabel}, fitness, coaching, ${country}`,
    },
  });

  const pageSlugs = [
    "home",
    "about",
    "programs",
    "services",
    "pricing",
    "gallery",
    "reviews",
    "faq",
    "contact",
    "booking",
  ];

  for (const slug of pageSlugs) {
    await db.cmsPage.upsert({
      where: { tenantId_slug: { tenantId, slug } },
      update: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      create: {
        tenantId,
        slug,
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  const faqs = [
    {
      question: `What services does ${businessName} offer?`,
      answer: `We specialize in ${coachingSpecialty} with personalized programs, expert coaching, and flexible booking options.`,
      order: 0,
    },
    {
      question: "How do I get started?",
      answer:
        "Book a free consultation through our website or contact us directly. We'll create a personalized plan for your goals.",
      order: 1,
    },
    {
      question: "What are your pricing options?",
      answer:
        "We offer flexible packages including single sessions, monthly memberships, and custom program bundles. Visit our pricing page for details.",
      order: 2,
    },
    {
      question: "Can I train online?",
      answer:
        "Yes! We offer both in-person and virtual coaching sessions to fit your schedule and location.",
      order: 3,
    },
  ];

  const existingFaqs = await db.faq.count({ where: { tenantId } });
  if (existingFaqs === 0) {
    await db.faq.createMany({
      data: faqs.map((f) => ({ tenantId, ...f, isActive: true })),
    });
  }
}

export async function seedCoachMarketplaceProfile(input: {
  tenantId: string;
  businessName: string;
  businessType: BusinessType;
  coachingSpecialty: string;
  country: string;
  language: string;
}) {
  const { tenantId, businessName, businessType, coachingSpecialty, country, language } = input;
  const typeLabel = businessTypeLabel(businessType);

  await db.coachMarketplaceProfile.upsert({
    where: { tenantId },
    update: {
      headline: `${coachingSpecialty} | ${typeLabel}`,
      bio: `${businessName} offers professional ${coachingSpecialty.toLowerCase()} coaching. Book sessions, explore programs, and start your transformation today.`,
      country,
      specialties: [coachingSpecialty, typeLabel],
      languages: [language],
      startingPrice: 50,
      isVisible: true,
      instantBooking: true,
    },
    create: {
      tenantId,
      headline: `${coachingSpecialty} | ${typeLabel}`,
      bio: `${businessName} offers professional ${coachingSpecialty.toLowerCase()} coaching. Book sessions, explore programs, and start your transformation today.`,
      country,
      specialties: [coachingSpecialty, typeLabel],
      languages: [language],
      startingPrice: 50,
      isVisible: true,
      instantBooking: true,
    },
  });

  await db.tenantSettings.update({
    where: { tenantId },
    data: { marketplaceEnabled: true },
  });
}
