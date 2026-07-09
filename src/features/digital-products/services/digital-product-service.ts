import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import type { DigitalProductType } from "@prisma/client";

export async function getDigitalProducts(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.digitalProduct.findMany({
    where: { tenantId },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDigitalProduct(
  tenantId: string,
  data: {
    name: string;
    type: DigitalProductType;
    price: number;
    fileUrl?: string;
    description?: string;
  }
) {
  await requireTenantAccess(tenantId);
  return db.digitalProduct.create({
    data: {
      tenantId,
      name: data.name,
      slug: slugify(data.name),
      type: data.type,
      price: data.price,
      fileUrl: data.fileUrl,
      description: data.description,
    },
  });
}

export async function getDigitalProductStats(tenantId: string) {
  const [total, orders, revenue] = await Promise.all([
    db.digitalProduct.count({ where: { tenantId, isActive: true } }),
    db.digitalProductOrder.count({
      where: { product: { tenantId } },
    }),
    db.digitalProduct.aggregate({
      where: { tenantId },
      _count: true,
    }),
  ]);
  return { total, orders, productCount: revenue._count };
}
