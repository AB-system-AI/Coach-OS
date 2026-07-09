import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getShopStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [products, orders, lowStock] = await Promise.all([
    db.shopProduct.count({ where: { tenantId, isActive: true } }),
    db.shopOrder.count({ where: { tenantId } }),
    db.shopProduct.count({ where: { tenantId, stockQuantity: { lte: 5 }, isActive: true } }),
  ]);
  return { products, orders, lowStock };
}

export async function getShopProducts(tenantId: string) {
  return db.shopProduct.findMany({
    where: { tenantId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getShopOrders(tenantId: string) {
  return db.shopOrder.findMany({
    where: { tenantId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
