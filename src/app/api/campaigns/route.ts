import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/campaigns - List campaigns (optionally filter by website)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get("websiteId");

    // Build where clause
    const where: Record<string, unknown> = {
      website: {
        userId: session.user.id,
      },
    };

    if (websiteId) {
      where.websiteId = websiteId;
    }

    const campaigns = await db.campaign.findMany({
      where,
      include: {
        website: {
          select: {
            domain: true,
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      websiteId,
      name,
      popupType,
      content,
      triggerRules,
      frequency,
      priority,
    } = body;

    // Validate required fields
    if (!websiteId || !name) {
      return NextResponse.json(
        { error: "Website ID and name are required" },
        { status: 400 }
      );
    }

    // Verify website ownership
    const website = await db.website.findFirst({
      where: {
        id: websiteId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            plan: true,
          },
        },
        _count: {
          select: {
            campaigns: {
              where: {
                status: { not: "ARCHIVED" },
              },
            },
          },
        },
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404 }
      );
    }

    // Check plan limits for campaigns
    const planLimits = {
      FREE: 1,
      STARTER: 3,
      GROWTH: 10,
      PRO: Infinity,
    };

    const campaignLimit = planLimits[website.user.plan];
    const currentCampaigns = website._count.campaigns;

    if (currentCampaigns >= campaignLimit) {
      return NextResponse.json(
        {
          error: `Campaign limit reached. Your ${website.user.plan} plan allows ${campaignLimit} campaigns. Please upgrade to add more.`,
        },
        { status: 403 }
      );
    }

    // Create campaign
    const campaign = await db.campaign.create({
      data: {
        websiteId,
        name,
        popupType: popupType || "MODAL",
        content: content || {},
        triggerRules: triggerRules || { conditions: [], operator: "AND" },
        frequency: frequency || "ONCE_PER_SESSION",
        priority: priority || 5,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
