import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/v1/campaigns - Fetch campaigns for a website
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const scriptKey = searchParams.get("key");
    const page = searchParams.get("page") || "/";
    const intentScore = parseInt(searchParams.get("intentScore") || "0");
    const intentLevel = searchParams.get("intentLevel") || "low";
    const visitCount = parseInt(searchParams.get("visitCount") || "1");
    const utmSource = searchParams.get("utmSource") || "";
    const referrer = searchParams.get("referrer") || "";
    const device = searchParams.get("device") || "";

    if (!scriptKey) {
      return NextResponse.json(
        { error: "Missing script key", campaigns: [] },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find website
    const website = await db.website.findUnique({
      where: { scriptKey },
      include: {
        campaigns: {
          where: { status: "ACTIVE" },
          orderBy: { priority: "desc" },
        },
        user: {
          select: {
            plan: true,
            visitorsUsedThisMonth: true,
          },
        },
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Invalid script key", campaigns: [] },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check plan limits
    const planLimits = {
      FREE: { visitors: 1000, popups: 1 },
      STARTER: { visitors: 10000, popups: 3 },
      GROWTH: { visitors: 50000, popups: 10 },
      PRO: { visitors: 200000, popups: Infinity },
    };

    const limits = planLimits[website.user.plan];
    const usedVisitors = website.user.visitorsUsedThisMonth;

    // If over 120% of limit, don't show popups (hard stop)
    if (usedVisitors > limits.visitors * 1.2) {
      return NextResponse.json(
        { campaigns: [], limitExceeded: true },
        { headers: corsHeaders }
      );
    }

    // Limit number of active campaigns by plan
    const activeCampaigns = website.campaigns.slice(0, limits.popups);

    // Filter campaigns based on trigger rules
    const matchingCampaigns = activeCampaigns.filter((campaign) => {
      const rules = campaign.triggerRules as TriggerRules;
      return evaluateRules(rules, {
        page,
        intentScore,
        intentLevel,
        visitCount,
        utmSource,
        referrer,
        device,
      });
    });

    // Return matching campaigns with content
    const campaigns = matchingCampaigns.map((c) => ({
      id: c.id,
      name: c.name,
      popupType: c.popupType,
      content: c.content,
      priority: c.priority,
      frequency: c.frequency,
    }));

    return NextResponse.json({ campaigns }, { headers: corsHeaders });
  } catch (error) {
    console.error("Campaign fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error", campaigns: [] },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Types for trigger rules
interface TriggerRules {
  conditions?: TriggerCondition[];
  operator?: "AND" | "OR";
}

interface TriggerCondition {
  field: string;
  operator: string;
  value: string | number | string[];
}

interface VisitorContext {
  page: string;
  intentScore: number;
  intentLevel: string;
  visitCount: number;
  utmSource: string;
  referrer: string;
  device: string;
}

// Evaluate trigger rules against visitor context
function evaluateRules(rules: TriggerRules, context: VisitorContext): boolean {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    // No rules = show to everyone
    return true;
  }

  const operator = rules.operator || "AND";
  const results = rules.conditions.map((condition) =>
    evaluateCondition(condition, context)
  );

  if (operator === "AND") {
    return results.every((r) => r);
  } else {
    return results.some((r) => r);
  }
}

function evaluateCondition(
  condition: TriggerCondition,
  context: VisitorContext
): boolean {
  const { field, operator, value } = condition;
  const contextValue = context[field as keyof VisitorContext];

  switch (operator) {
    case "equals":
    case "eq":
      return String(contextValue).toLowerCase() === String(value).toLowerCase();

    case "not_equals":
    case "neq":
      return String(contextValue).toLowerCase() !== String(value).toLowerCase();

    case "contains":
      return String(contextValue)
        .toLowerCase()
        .includes(String(value).toLowerCase());

    case "not_contains":
      return !String(contextValue)
        .toLowerCase()
        .includes(String(value).toLowerCase());

    case "starts_with":
      return String(contextValue)
        .toLowerCase()
        .startsWith(String(value).toLowerCase());

    case "greater_than":
    case "gt":
      return Number(contextValue) > Number(value);

    case "less_than":
    case "lt":
      return Number(contextValue) < Number(value);

    case "greater_than_or_equal":
    case "gte":
      return Number(contextValue) >= Number(value);

    case "less_than_or_equal":
    case "lte":
      return Number(contextValue) <= Number(value);

    case "in":
      if (Array.isArray(value)) {
        return value
          .map((v) => String(v).toLowerCase())
          .includes(String(contextValue).toLowerCase());
      }
      return false;

    case "not_in":
      if (Array.isArray(value)) {
        return !value
          .map((v) => String(v).toLowerCase())
          .includes(String(contextValue).toLowerCase());
      }
      return true;

    case "is_empty":
      return !contextValue || contextValue === "";

    case "is_not_empty":
      return !!contextValue && contextValue !== "";

    default:
      return true;
  }
}
