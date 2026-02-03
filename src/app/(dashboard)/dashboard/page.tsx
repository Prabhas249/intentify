import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { formatTimeAgo } from "@/lib/utils";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Intentify",
  description: "View your popup performance, visitor stats, and conversion rates.",
};

// Demo user IDs for public dashboard (geo-based)
const DEMO_USER_INR = "cml66aybb0000yefsjavxkfb5"; // India users
const DEMO_USER_USD = "cml66hzz280fsyefsv71bm5ed"; // Global users

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ website?: string; period?: string }>;
}) {
  const session = await auth();
  const headersList = await headers();

  // Detect country from Vercel header (or default to USD for non-Vercel)
  const country = headersList.get("x-vercel-ip-country") || "US";
  const isIndia = country === "IN";

  // Use demo user if not logged in (geo-based)
  const demoUserId = isIndia ? DEMO_USER_INR : DEMO_USER_USD;
  const userId = session?.user?.id || demoUserId;

  const params = await searchParams;
  const period = params.period || "30d";

  // Get user's websites
  const websites = await db.website.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });

  // If no website param, show all websites (null means all)
  const selectedWebsiteId = params.website || null;

  // Calculate date range
  const now = new Date();
  const periodDays = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Build where clause for website filtering
  const websiteWhere = selectedWebsiteId
    ? { websiteId: selectedWebsiteId }
    : { website: { userId: userId } };

  const visitorWhere = selectedWebsiteId
    ? { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } }
    : { website: { userId: userId }, lastSeen: { gte: startDate } };

  // Get stats with period and website filtering
  const [websiteCount, campaignCount, visitorCount, totalImpressions, totalConversions, recentEvents, chartEvents] = await Promise.all([
    db.website.count({ where: { userId: userId } }),
    selectedWebsiteId
      ? db.campaign.count({ where: { websiteId: selectedWebsiteId } })
      : db.campaign.count({ where: { website: { userId: userId } } }),
    db.visitor.count({ where: visitorWhere }),
    // Get popup impressions for conversion rate
    db.event.count({
      where: {
        visitor: websiteWhere,
        eventType: "POPUP_IMPRESSION",
        createdAt: { gte: startDate },
      },
    }),
    // Get popup conversions for conversion rate
    db.event.count({
      where: {
        visitor: websiteWhere,
        eventType: "POPUP_CONVERSION",
        createdAt: { gte: startDate },
      },
    }),
    // Get recent real events
    db.event.findMany({
      where: {
        visitor: websiteWhere,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        visitor: {
          select: {
            utmSource: true,
            device: true,
          },
        },
        campaign: {
          select: {
            name: true,
          },
        },
      },
    }),
    // Get events for chart grouped by day
    db.event.findMany({
      where: {
        visitor: websiteWhere,
        createdAt: { gte: startDate },
        eventType: { in: ["POPUP_IMPRESSION", "POPUP_CONVERSION"] },
      },
      select: {
        eventType: true,
        createdAt: true,
      },
    }),
  ]);

  // Also get visitors for chart - use lastSeen to match stat card
  const chartVisitors = await db.visitor.findMany({
    where: visitorWhere,
    select: {
      lastSeen: true,
    },
  });

  // Build chart data - use hours for 24h, days otherwise
  // Use UTC consistently to avoid timezone mismatches
  const chartDataMap = new Map<string, { visitors: number; impressions: number; conversions: number }>();
  const is24h = period === "24h";

  // Helper to get UTC-based key
  const getTimeKey = (date: Date): string => {
    if (is24h) {
      return date.toISOString().slice(0, 13); // "2024-01-31T14" (UTC hour)
    }
    return date.toISOString().split("T")[0]; // "2024-01-31" (UTC date)
  };

  // Helper to get display label from key
  const getDisplayLabel = (key: string): string => {
    if (is24h) {
      const hour = parseInt(key.slice(11, 13));
      const ampm = hour >= 12 ? "pm" : "am";
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${hour12}${ampm}`;
    } else {
      const d = new Date(key + "T12:00:00Z");
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return periodDays <= 7
        ? dayNames[d.getUTCDay()]
        : `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
    }
  };

  if (is24h) {
    // For 24h, group by hour (show last 24 hours)
    for (let i = 24; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000);
      chartDataMap.set(getTimeKey(date), { visitors: 0, impressions: 0, conversions: 0 });
    }
  } else {
    // For other periods, group by day (include full range from startDate)
    for (let i = periodDays; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      chartDataMap.set(getTimeKey(date), { visitors: 0, impressions: 0, conversions: 0 });
    }
  }

  // Count visitors per time bucket (use lastSeen to match stat card)
  chartVisitors.forEach((v) => {
    const key = getTimeKey(new Date(v.lastSeen));
    const data = chartDataMap.get(key);
    if (data) {
      data.visitors++;
    }
  });

  // Count events per time bucket
  chartEvents.forEach((e) => {
    const key = getTimeKey(new Date(e.createdAt));
    const data = chartDataMap.get(key);
    if (data) {
      if (e.eventType === "POPUP_IMPRESSION") {
        data.impressions++;
      } else if (e.eventType === "POPUP_CONVERSION") {
        data.conversions++;
      }
    }
  });

  // Convert to array sorted by time
  const chartData = Array.from(chartDataMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => ({
      name: getDisplayLabel(key),
      ...data,
    }));

  // Calculate real conversion rate
  const conversionRate = totalImpressions > 0
    ? ((totalConversions / totalImpressions) * 100).toFixed(1)
    : "0";

  const stats = [
    {
      title: "Websites",
      value: websiteCount,
      icon: "Globe",
      href: "/websites",
      gradient: "from-sky-500/20 to-sky-600/5",
      iconColor: "text-sky-500",
      borderColor: "border-sky-500/20",
    },
    {
      title: "Campaigns",
      value: campaignCount,
      icon: "Megaphone",
      href: "/campaigns",
      gradient: "from-violet-500/20 to-violet-600/5",
      iconColor: "text-violet-500",
      borderColor: "border-violet-500/20",
    },
    {
      title: "Visitors Tracked",
      value: visitorCount,
      icon: "Users",
      href: "/visitors",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: "TrendingUp",
      href: "/analytics",
      gradient: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
    },
  ];

  // Format recent events for display
  const formattedEvents = recentEvents.map((event) => {
    const eventMessages: Record<string, string> = {
      PAGE_VIEW: `Page viewed${event.visitor.utmSource ? ` from ${event.visitor.utmSource}` : ""}`,
      POPUP_IMPRESSION: `${event.campaign?.name || "Popup"} shown`,
      POPUP_CLICK: `${event.campaign?.name || "Popup"} CTA clicked`,
      POPUP_CONVERSION: `Conversion on ${event.campaign?.name || "popup"}`,
      POPUP_DISMISS: `${event.campaign?.name || "Popup"} dismissed`,
      COUPON_COPY: "Coupon code copied",
      PURCHASE_CONVERSION: "Purchase completed",
    };

    const eventIcons: Record<string, string> = {
      PAGE_VIEW: "Users",
      POPUP_IMPRESSION: "Eye",
      POPUP_CLICK: "MousePointerClick",
      POPUP_CONVERSION: "Zap",
      POPUP_DISMISS: "X",
      COUPON_COPY: "Copy",
      PURCHASE_CONVERSION: "IndianRupee",
    };

    const eventTypes: Record<string, string> = {
      PAGE_VIEW: "visitor",
      POPUP_IMPRESSION: "impression",
      POPUP_CLICK: "click",
      POPUP_CONVERSION: "conversion",
      POPUP_DISMISS: "dismiss",
      COUPON_COPY: "click",
      PURCHASE_CONVERSION: "conversion",
    };

    return {
      id: event.id,
      type: eventTypes[event.eventType] || "visitor",
      message: eventMessages[event.eventType] || event.eventType,
      time: formatTimeAgo(event.createdAt),
      icon: eventIcons[event.eventType] || "Activity",
    };
  });

  return (
    <DashboardContent
      userName={session?.user?.name?.split(" ")[0] || "there"}
      stats={stats}
      websiteCount={websiteCount}
      websites={websites.map((w) => ({ id: w.id, domain: w.domain }))}
      selectedWebsiteId={selectedWebsiteId}
      period={period}
      recentEvents={formattedEvents}
      chartData={chartData}
      conversionRate={conversionRate}
    />
  );
}
