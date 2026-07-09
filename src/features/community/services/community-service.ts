import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getCommunityGroups(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.communityGroup.findMany({
    where: { tenantId },
    include: { _count: { select: { posts: true } } },
  });
}

export async function getCommunityStats(tenantId: string) {
  const [groups, posts, comments] = await Promise.all([
    db.communityGroup.count({ where: { tenantId } }),
    db.communityPost.count({ where: { group: { tenantId } } }),
    db.communityComment.count({ where: { post: { group: { tenantId } } } }),
  ]);
  return { groups, posts, comments };
}
