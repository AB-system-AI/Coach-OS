import { getCurrentTenant } from "@/lib/auth/session";
import { getCommunityStats } from "@/features/community";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function CommunityPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const stats = await getCommunityStats(tenant.id);

  return (
    <ModuleOverview
      title="Community"
      description="Groups, posts, comments, likes, and coach announcements."
      stats={[
        { label: "Groups", value: stats.groups },
        { label: "Posts", value: stats.posts },
        { label: "Comments", value: stats.comments },
      ]}
      actions={[{ label: "Create Group", href: "/dashboard/community/groups/new" }]}
    />
  );
}
