import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { MediaCategory, MediaType } from "@prisma/client";

function inferMediaType(mimeType: string | undefined | null, category: string): MediaType {
  if (!mimeType) {
    if (category === "IMAGE") return "IMAGE";
    if (category === "VIDEO") return "VIDEO";
    return "DOCUMENT";
  }
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  return "DOCUMENT";
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, url, mimeType, sizeBytes, category } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "name and url are required" }, { status: 400 });
    }

    const mediaType = inferMediaType(mimeType, category ?? "GENERAL");

    const media = await db.media.create({
      data: {
        tenantId: tenant.id,
        name,
        url,
        type: mediaType,
        mimeType: mimeType ?? null,
        sizeBytes: sizeBytes ? BigInt(sizeBytes) : null,
        category: (category ?? "GENERAL") as MediaCategory,
      },
    });

    if (sizeBytes && sizeBytes > 0) {
      await db.tenant.update({
        where: { id: tenant.id },
        data: { storageUsedBytes: { increment: BigInt(sizeBytes) } },
      });
    }

    return NextResponse.json({ id: media.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
