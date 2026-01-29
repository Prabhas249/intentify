import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// CORS headers for cross-origin requests from embed script
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/v1/events - Track visitor events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scriptKey,
      eventType,
      visitorId,
      page,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      device,
      browser,
      os,
      intentScore,
      intentLevel,
      campaignId,
      timeOnPage,
      scrollDepth,
      email,
      phone,
    } = body;

    // Extract geolocation from Vercel headers (free, zero latency)
    const country = req.headers.get("x-vercel-ip-country") || null;
    const city = req.headers.get("x-vercel-ip-city") || null;

    // Validate script key
    if (!scriptKey) {
      return NextResponse.json(
        { error: "Missing script key" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find website by script key
    const website = await db.website.findUnique({
      where: { scriptKey },
      include: { user: true },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Invalid script key" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Validate origin (optional - can be strict in production)
    const origin = req.headers.get("origin") || "";
    const refererHeader = req.headers.get("referer") || "";

    // In production, validate that request comes from registered domain
    // For now, we'll be permissive during development

    // Get or create visitor
    let visitor = await db.visitor.findUnique({
      where: {
        websiteId_visitorHash: {
          websiteId: website.id,
          visitorHash: visitorId,
        },
      },
    });

    if (!visitor) {
      // Create new visitor
      visitor = await db.visitor.create({
        data: {
          websiteId: website.id,
          visitorHash: visitorId,
          visitCount: 1,
          pagesViewed: page ? [page] : [],
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          referrer: referrer || null,
          device: device || null,
          browser: browser || null,
          os: os || null,
          country: country || null,
          city: city || null,
          scrollDepth: scrollDepth || 0,
          intentScore: intentScore || 0,
          intentLevel: intentLevel?.toUpperCase() || "LOW",
        },
      });

      // Check if we should count this visitor for billing
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      if (!visitor.countedForMonth || visitor.countedForMonth < monthStart) {
        // Increment user's visitor count for the month
        await db.user.update({
          where: { id: website.userId },
          data: {
            visitorsUsedThisMonth: { increment: 1 },
          },
        });

        // Mark visitor as counted
        await db.visitor.update({
          where: { id: visitor.id },
          data: { countedForMonth: now },
        });
      }
    } else {
      // Update existing visitor
      const updateData: Record<string, unknown> = {
        lastSeen: new Date(),
      };

      // Add page to viewed pages if not already there
      if (page && !visitor.pagesViewed.includes(page)) {
        updateData.pagesViewed = [...visitor.pagesViewed, page].slice(-50);
      }

      // Update intent score if higher
      if (intentScore && intentScore > visitor.intentScore) {
        updateData.intentScore = intentScore;
        updateData.intentLevel = intentLevel?.toUpperCase() || visitor.intentLevel;
      }

      // Update time on site
      if (timeOnPage) {
        updateData.timeOnSiteSeconds = visitor.timeOnSiteSeconds + timeOnPage;
      }

      // Update UTM if not set
      if (utmSource && !visitor.utmSource) {
        updateData.utmSource = utmSource;
        updateData.utmMedium = utmMedium;
        updateData.utmCampaign = utmCampaign;
      }

      // Update scroll depth (keep max)
      if (scrollDepth && scrollDepth > (visitor.scrollDepth || 0)) {
        updateData.scrollDepth = scrollDepth;
      }

      // Update OS if not set
      if (os && !visitor.os) {
        updateData.os = os;
      }

      // Update country/city if not set (first-touch geo)
      if (country && !visitor.country) {
        updateData.country = country;
      }
      if (city && !visitor.city) {
        updateData.city = city;
      }

      visitor = await db.visitor.update({
        where: { id: visitor.id },
        data: updateData,
      });
    }

    // Create event record
    const eventTypeMap: Record<string, string> = {
      PAGE_VIEW: "PAGE_VIEW",
      PAGE_EXIT: "PAGE_VIEW",
      POPUP_IMPRESSION: "POPUP_IMPRESSION",
      POPUP_CLICK: "POPUP_CLICK",
      POPUP_CONVERSION: "POPUP_CONVERSION",
      POPUP_DISMISS: "POPUP_DISMISS",
    };

    const mappedEventType = eventTypeMap[eventType];
    if (mappedEventType) {
      await db.event.create({
        data: {
          visitorId: visitor.id,
          campaignId: campaignId || null,
          eventType: mappedEventType as any,
          metadata: {
            page,
            timeOnPage,
            scrollDepth,
            intentScore,
          },
        },
      });
    }

    // If conversion with lead data, create lead
    if (eventType === "POPUP_CONVERSION" && (email || phone)) {
      await db.lead.create({
        data: {
          websiteId: website.id,
          email: email || null,
          phone: phone || null,
          campaignId: campaignId || null,
          utmSource: visitor.utmSource,
          pageUrl: page,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        visitorId: visitor.visitorHash,
        intentScore: visitor.intentScore,
        intentLevel: visitor.intentLevel,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Event tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
