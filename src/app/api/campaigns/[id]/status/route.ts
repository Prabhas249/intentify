import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/campaigns/[id]/status - Update campaign status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { status } = body;

    // Validate status
    if (!["ACTIVE", "PAUSED", "ARCHIVED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Verify campaign ownership
    const campaign = await db.campaign.findFirst({
      where: {
        id,
        website: {
          userId: session.user.id,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Update status
    const updated = await db.campaign.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error("Failed to update campaign status:", error);
    return NextResponse.json(
      { error: "Failed to update campaign status" },
      { status: 500 }
    );
  }
}
