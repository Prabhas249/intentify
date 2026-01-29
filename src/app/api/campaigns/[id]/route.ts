import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/campaigns/[id] - Get campaign details
export async function GET(
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

    const campaign = await db.campaign.findFirst({
      where: {
        id,
        website: {
          userId: session.user.id,
        },
      },
      include: {
        website: {
          select: {
            id: true,
            domain: true,
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Get event stats
    const [impressions, clicks, conversions, dismissals] = await Promise.all([
      db.event.count({
        where: { campaignId: id, eventType: "POPUP_IMPRESSION" },
      }),
      db.event.count({
        where: { campaignId: id, eventType: "POPUP_CLICK" },
      }),
      db.event.count({
        where: { campaignId: id, eventType: "POPUP_CONVERSION" },
      }),
      db.event.count({
        where: { campaignId: id, eventType: "POPUP_DISMISS" },
      }),
    ]);

    return NextResponse.json({
      campaign,
      stats: {
        impressions,
        clicks,
        conversions,
        dismissals,
        ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0",
        cvr: impressions > 0 ? ((conversions / impressions) * 100).toFixed(2) : "0",
      },
    });
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(
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
    const {
      name,
      popupType,
      content,
      triggerRules,
      frequency,
      priority,
      status,
    } = body;

    // Verify campaign ownership
    const existing = await db.campaign.findFirst({
      where: {
        id,
        website: {
          userId: session.user.id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Update campaign
    const campaign = await db.campaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(popupType && { popupType }),
        ...(content && { content }),
        ...(triggerRules && { triggerRules }),
        ...(frequency && { frequency }),
        ...(priority !== undefined && { priority }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
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

    // Delete campaign (events will be set to null due to onDelete: SetNull)
    await db.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
