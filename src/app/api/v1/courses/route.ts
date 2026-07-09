import { NextRequest } from "next/server";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  if (!checkRateLimit(`api:courses:${ip}`).allowed) {
    return apiError("Rate limit exceeded", 429);
  }

  const ctx = await authenticateApiRequest(request);
  if (!ctx) return apiError("Unauthorized", 401);

  const courses = await db.course.findMany({
    where: { tenantId: ctx.tenantId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      currency: true,
      coverImageUrl: true,
      sections: {
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            select: { id: true, title: true, type: true, duration: true, order: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return apiResponse(courses);
}
