import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/utils";

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

    // Validate popupType
    const validPopupTypes = ["MODAL", "SLIDE_IN", "BANNER", "FLOATING", "FULL_SCREEN", "BOTTOM_SHEET"];
    if (popupType && !validPopupTypes.includes(popupType)) {
      return NextResponse.json(
        { error: `Invalid popup type. Must be one of: ${validPopupTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate frequency
    const validFrequencies = ["EVERY_TIME", "ONCE_PER_SESSION", "ONCE_PER_DAY", "ONCE_PER_WEEK", "ONCE_EVER"];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: `Invalid frequency. Must be one of: ${validFrequencies.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate priority (1-100)
    if (priority !== undefined) {
      const priorityNum = Number(priority);
      if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 100) {
        return NextResponse.json(
          { error: "Priority must be a number between 1 and 100" },
          { status: 400 }
        );
      }
    }

    // Validate name length
    if (name.length > 100) {
      return NextResponse.json(
        { error: "Campaign name must be less than 100 characters" },
        { status: 400 }
      );
    }

    // Validate CTA link to prevent XSS
    if (content?.ctaLink) {
      const ctaLink = String(content.ctaLink).toLowerCase();
      if (ctaLink.startsWith("javascript:") || ctaLink.startsWith("data:") || ctaLink.startsWith("vbscript:")) {
        return NextResponse.json(
          { error: "Invalid CTA link. JavaScript URLs are not allowed." },
          { status: 400 }
        );
      }
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
    const limits = getPlanLimits(website.user.plan);
    const currentCampaigns = website._count.campaigns;

    if (currentCampaigns >= limits.campaigns) {
      const limitDisplay = limits.campaigns === Infinity ? "unlimited" : limits.campaigns.toString();
      return NextResponse.json(
        {
          error: `Campaign limit reached. Your ${website.user.plan} plan allows ${limitDisplay} campaigns. Please upgrade to add more.`,
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
