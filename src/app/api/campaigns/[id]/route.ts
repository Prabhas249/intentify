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
        ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0",
        cvr: impressions > 0 ? ((conversions / impressions) * 100).toFixed(1) : "0",
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

    // Validate popupType if provided
    const validPopupTypes = ["MODAL", "SLIDE_IN", "BANNER", "FLOATING", "FULL_SCREEN", "BOTTOM_SHEET"];
    if (popupType && !validPopupTypes.includes(popupType)) {
      return NextResponse.json(
        { error: `Invalid popup type. Must be one of: ${validPopupTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate frequency if provided
    const validFrequencies = ["EVERY_TIME", "ONCE_PER_SESSION", "ONCE_PER_DAY", "ONCE_PER_WEEK", "ONCE_EVER"];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: `Invalid frequency. Must be one of: ${validFrequencies.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate priority if provided (1-100)
    if (priority !== undefined) {
      const priorityNum = Number(priority);
      if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 100) {
        return NextResponse.json(
          { error: "Priority must be a number between 1 and 100" },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    const validStatuses = ["ACTIVE", "PAUSED", "ARCHIVED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate name length if provided
    if (name && name.length > 100) {
      return NextResponse.json(
        { error: "Campaign name must be less than 100 characters" },
        { status: 400 }
      );
    }

    // Validate CTA link to prevent XSS if provided
    if (content?.ctaLink) {
      const ctaLink = String(content.ctaLink).toLowerCase();
      if (ctaLink.startsWith("javascript:") || ctaLink.startsWith("data:") || ctaLink.startsWith("vbscript:")) {
        return NextResponse.json(
          { error: "Invalid CTA link. JavaScript URLs are not allowed." },
          { status: 400 }
        );
      }
    }

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
