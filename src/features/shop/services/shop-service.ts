import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

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

export async function createShopProduct(
  tenantId: string,
  data: {
    name: string;
    description?: string;
    price: number;
    stockQuantity?: number;
    sku?: string;
    categoryId?: string;
    imageUrl?: string;
  }
) {
  await requireTenantAccess(tenantId);
  return db.shopProduct.create({
    data: {
      tenantId,
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity ?? 0,
      sku: data.sku,
      categoryId: data.categoryId || undefined,
      imageUrl: data.imageUrl,
      isActive: true,
    },
  });
}

export async function updateShopProduct(
  tenantId: string,
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    isActive?: boolean;
  }
) {
  await requireTenantAccess(tenantId);
  return db.shopProduct.update({
    where: { id: productId, tenantId },
    data,
  });
}

export async function adjustInventory(tenantId: string, productId: string, delta: number) {
  await requireTenantAccess(tenantId);
  return db.shopProduct.update({
    where: { id: productId, tenantId },
    data: { stockQuantity: { increment: delta } },
  });
}

export async function updateOrderStatus(
  tenantId: string,
  orderId: string,
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED"
) {
  await requireTenantAccess(tenantId);
  return db.shopOrder.update({
    where: { id: orderId, tenantId },
    data: { status },
  });
}

export async function getShopCategories(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.shopCategory.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}
