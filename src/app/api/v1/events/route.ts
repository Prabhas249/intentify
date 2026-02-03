import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeDomain } from "@/lib/utils";

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
      metadata, // For conversion tracking: { amount, orderId, coupon, currency }
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

    // Validate origin - check if request comes from registered domain
    const origin = req.headers.get("origin") || "";
    const refererHeader = req.headers.get("referer") || "";

    // Extract hostname from origin or referer
    let requestDomain = "";
    try {
      if (origin) {
        requestDomain = new URL(origin).hostname;
      } else if (refererHeader) {
        requestDomain = new URL(refererHeader).hostname;
      }
    } catch {
      // Invalid URL, continue without domain check
    }

    // Check if request domain matches registered website domain
    const websiteDomain = normalizeDomain(website.domain);
    const normalizedRequestDomain = normalizeDomain(requestDomain);

    // Validate domain matches (allow localhost for development)
    const isValidOrigin =
      !requestDomain || // No origin header (e.g., direct API call)
      normalizedRequestDomain === websiteDomain ||
      normalizedRequestDomain === "localhost" ||
      normalizedRequestDomain.endsWith(".localhost") ||
      normalizedRequestDomain === "127.0.0.1";

    if (!isValidOrigin) {
      console.warn(`Origin mismatch: ${requestDomain} vs registered ${websiteDomain}`);
      // In strict mode, you could reject the request:
      // return NextResponse.json(
      //   { error: "Origin not allowed" },
      //   { status: 403, headers: corsHeaders }
      // );
    }

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
      // Use atomic updateMany with condition to prevent race conditions
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Atomically mark visitor as counted only if not already counted this month
      const updateResult = await db.visitor.updateMany({
        where: {
          id: visitor.id,
          OR: [
            { countedForMonth: null },
            { countedForMonth: { lt: monthStart } },
          ],
        },
        data: { countedForMonth: now },
      });

      // Only increment user count if we successfully marked the visitor
      if (updateResult.count > 0) {
        await db.user.update({
          where: { id: website.userId },
          data: {
            visitorsUsedThisMonth: { increment: 1 },
          },
        });
      }
    } else {
      // Update existing visitor
      const updateData: Record<string, unknown> = {
        lastSeen: new Date(),
      };

      // Check if this is a new session (last seen > 30 minutes ago)
      // Use atomic increment to prevent race conditions
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const isNewSession = visitor.lastSeen < thirtyMinutesAgo;

      // Add page to viewed pages if not already there
      if (page && !visitor.pagesViewed.includes(page)) {
        updateData.pagesViewed = [...visitor.pagesViewed, page].slice(-50);
      }

      // Update intent score if higher
      if (intentScore && intentScore > visitor.intentScore) {
        updateData.intentScore = intentScore;
        updateData.intentLevel = intentLevel?.toUpperCase() || visitor.intentLevel;
      }

      // Update time on site (use increment for atomicity)
      if (timeOnPage) {
        updateData.timeOnSiteSeconds = { increment: timeOnPage };
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

      // Use separate update for visit count increment to ensure atomicity
      if (isNewSession) {
        visitor = await db.visitor.update({
          where: { id: visitor.id },
          data: {
            ...updateData,
            visitCount: { increment: 1 },
          },
        });
      } else {
        visitor = await db.visitor.update({
          where: { id: visitor.id },
          data: updateData,
        });
      }
    }

    // Create event record
    const eventTypeMap: Record<string, string> = {
      PAGE_VIEW: "PAGE_VIEW",
      PAGE_EXIT: "PAGE_VIEW",
      POPUP_IMPRESSION: "POPUP_IMPRESSION",
      POPUP_CLICK: "POPUP_CLICK",
      POPUP_CONVERSION: "POPUP_CONVERSION",
      POPUP_DISMISS: "POPUP_DISMISS",
      PURCHASE_CONVERSION: "POPUP_CONVERSION", // Maps to same type for analytics
      COUPON_COPY: "COUPON_COPY",
    };

    const mappedEventType = eventTypeMap[eventType];
    if (mappedEventType) {
      // Build metadata object (using Prisma.JsonObject type)
      const eventMetadata: { [key: string]: string | number | boolean | null } = {
        page: metadata?.page || page,
        timeOnPage,
        scrollDepth,
        intentScore,
      };

      // Add conversion-specific metadata
      if (eventType === "PURCHASE_CONVERSION" && metadata) {
        eventMetadata.amount = metadata.amount;
        eventMetadata.orderId = metadata.orderId;
        eventMetadata.coupon = metadata.coupon;
        eventMetadata.currency = metadata.currency || "INR";
        eventMetadata.isPurchase = true; // Flag to distinguish from lead conversions
      }

      // Add coupon copy metadata
      if (eventType === "COUPON_COPY" && metadata) {
        eventMetadata.couponCode = metadata.couponCode;
      }

      await db.event.create({
        data: {
          visitorId: visitor.id,
          campaignId: campaignId || null,
          eventType: mappedEventType as "PAGE_VIEW" | "POPUP_IMPRESSION" | "POPUP_CLICK" | "POPUP_CONVERSION" | "POPUP_DISMISS" | "COUPON_COPY",
          metadata: eventMetadata,
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
