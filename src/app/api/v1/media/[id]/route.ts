import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/auth/session";
import { deleteMediaFile } from "@/features/storage";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await deleteMediaFile(tenant.id, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete" }, { status: 500 });
  }
}
