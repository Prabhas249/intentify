import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | PopupTool",
  description: "Detailed analytics on visitors, conversions, traffic sources, and campaign performance.",
};
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Eye,
  Target,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Laptop,
  MousePointerClick,
  Plus,
  BarChart3,
  Zap,
  IndianRupee,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { WebsiteSelector } from "@/components/analytics/website-selector";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { NewVsReturningChart } from "@/components/analytics/new-vs-returning-chart";
import { ConversionPathView } from "@/components/analytics/conversion-path";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/dashboard/glass-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PrimaryButton } from "@/components/dashboard/primary-button";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { cn, formatTimeAgo } from "@/lib/utils";

// Demo user IDs (geo-based)
const DEMO_USER_INR = "cml66aybb0000yefsjavxkfb5";
const DEMO_USER_USD = "cml66hzz280fsyefsv71bm5ed";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ website?: string; period?: string }>;
}) {
  const session = await auth();
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";
  const isIndia = country === "IN";
  const demoUserId = isIndia ? DEMO_USER_INR : DEMO_USER_USD;

  // Use demo user if not logged in
  const userId = session?.user?.id || demoUserId;

  const params = await searchParams;
  const period = params.period || "30d";

  // Get user's websites
  const websites = await db.website.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });

  if (websites.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          description="Track visitor behavior and popup performance."
          iconSlot={<BarChart3 className="h-8 w-8 md:h-9 md:w-9 text-amber-500" />}
          badge="Insights"
        />
        <GlassCard delay={0.1} gradient="from-amber-500/5 via-transparent to-sky-500/5" corners="all">
          <GlassCardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 mb-6">
              <Globe className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight mb-2">No websites yet</h3>
            <p className="text-muted-foreground text-center leading-relaxed max-w-sm mb-6">
              Add a website to start tracking visitors and see analytics.
            </p>
            <PrimaryButton asChild size="lg">
              <Link href="/websites/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Website
              </Link>
            </PrimaryButton>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  const selectedWebsiteId = params.website || websites[0]?.id;
  const selectedWebsite = websites.find((w) => w.id === selectedWebsiteId);

  // Calculate date range
  const now = new Date();
  const periodDays = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Get analytics data
  const [
    totalVisitors,
    newVisitors,
    returningVisitors,
    totalImpressions,
    totalClicks,
    totalConversions,
    visitorsByIntent,
    visitorsByDevice,
    visitorsBySource,
    topPages,
    recentVisitors,
    campaignStats,
    avgScrollDepth,
    visitorsByOS,
    visitorsByCountry,
    visitorsByCity,
    convertedVisitors,
    purchaseConversions,
    couponCopies,
  ] = await Promise.all([
    db.visitor.count({
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } },
    }),
    db.visitor.count({
      where: { websiteId: selectedWebsiteId, firstSeen: { gte: startDate } },
    }),
    db.visitor.count({
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate }, visitCount: { gt: 1 } },
    }),
    db.event.count({
      where: { visitor: { websiteId: selectedWebsiteId }, eventType: "POPUP_IMPRESSION", createdAt: { gte: startDate } },
    }),
    db.event.count({
      where: { visitor: { websiteId: selectedWebsiteId }, eventType: "POPUP_CLICK", createdAt: { gte: startDate } },
    }),
    db.event.count({
      where: { visitor: { websiteId: selectedWebsiteId }, eventType: "POPUP_CONVERSION", createdAt: { gte: startDate } },
    }),
    db.visitor.groupBy({
      by: ["intentLevel"],
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } },
      _count: true,
    }),
    db.visitor.groupBy({
      by: ["device"],
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate }, device: { not: null } },
      _count: true,
    }),
    db.visitor.groupBy({
      by: ["utmSource"],
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } },
      _count: true,
      orderBy: { _count: { utmSource: "desc" } },
      take: 10,
    }),
    db.visitor.findMany({
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } },
      select: { pagesViewed: true },
    }),
    db.visitor.findMany({
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } },
      orderBy: { lastSeen: "desc" },
      take: 10,
    }),
    db.campaign.findMany({
      where: { websiteId: selectedWebsiteId },
    }),
    db.visitor.aggregate({
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } },
      _avg: { scrollDepth: true },
    }),
    db.visitor.groupBy({
      by: ["os"],
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate }, os: { not: null } },
      _count: true,
      orderBy: { _count: { os: "desc" } },
    }),
    db.visitor.groupBy({
      by: ["country"],
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate }, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: "desc" } },
      take: 10,
    }),
    db.visitor.groupBy({
      by: ["city"],
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate }, city: { not: null } },
      _count: true,
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
    db.visitor.findMany({
      where: {
        websiteId: selectedWebsiteId,
        events: { some: { eventType: "POPUP_CONVERSION", createdAt: { gte: startDate } } },
      },
      include: {
        events: { orderBy: { createdAt: "asc" }, take: 50, include: { campaign: { select: { name: true } } } },
      },
      take: 20,
    }),
    // Get purchase conversions for revenue calculation
    db.event.findMany({
      where: {
        visitor: { websiteId: selectedWebsiteId },
        eventType: "POPUP_CONVERSION",
        createdAt: { gte: startDate },
      },
      select: { metadata: true, campaignId: true },
    }),
    // Get coupon copies count
    db.event.count({
      where: {
        visitor: { websiteId: selectedWebsiteId },
        eventType: "COUPON_COPY",
        createdAt: { gte: startDate },
      },
    }),
  ]);

  // Calculate period-filtered event counts for campaigns
  const campaignStatsWithEvents = await Promise.all(
    campaignStats.map(async (campaign) => {
      const eventCount = await db.event.count({
        where: {
          campaignId: campaign.id,
          createdAt: { gte: startDate },
        },
      });
      return { ...campaign, eventCount };
    })
  );

  // Calculate top pages from visitor data
  const pageCountMap = new Map<string, number>();
  topPages.forEach((visitor) => {
    visitor.pagesViewed.forEach((page) => {
      pageCountMap.set(page, (pageCountMap.get(page) || 0) + 1);
    });
  });
  const sortedPages = Array.from(pageCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Calculate rates
  const conversionRate = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : "0";
  const clickRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0";
  const bouncedCount = topPages.filter((v) => v.pagesViewed.length <= 1).length;
  const bounceRate = totalVisitors > 0 ? ((bouncedCount / totalVisitors) * 100).toFixed(1) : "0";

  // Intent breakdown
  const intentData = {
    low: visitorsByIntent.find((v) => v.intentLevel === "LOW")?._count || 0,
    medium: visitorsByIntent.find((v) => v.intentLevel === "MEDIUM")?._count || 0,
    high: visitorsByIntent.find((v) => v.intentLevel === "HIGH")?._count || 0,
  };

  // Device breakdown
  const deviceData = {
    mobile: visitorsByDevice.find((v) => v.device === "mobile")?._count || 0,
    desktop: visitorsByDevice.find((v) => v.device === "desktop")?._count || 0,
  };

  // Process conversion paths
  const conversionPaths = convertedVisitors.map((visitor) => ({
    visitorHash: visitor.visitorHash,
    source: visitor.utmSource,
    steps: visitor.events.map((event) => ({
      type: event.eventType,
      page: (event.metadata as Record<string, unknown>)?.page as string | null,
      campaignName: event.campaign?.name || null,
      timestamp: event.createdAt.toISOString(),
    })),
  }));

  // Aggregate conversion path patterns
  const pathPatternMap = new Map<string, { count: number; steps: string[] }>();
  conversionPaths.forEach((path) => {
    const key = path.steps.map((s) => s.type).join(" → ");
    const existing = pathPatternMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      pathPatternMap.set(key, { count: 1, steps: path.steps.map((s) => s.type) });
    }
  });
  const sortedPatterns = Array.from(pathPatternMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((p) => ({ pattern: p.steps.join(" → "), count: p.count, steps: p.steps }));

  // Calculate revenue from purchase conversions
  let totalRevenue = 0;
  let purchaseCount = 0;
  const couponRevenue = new Map<string, number>();

  purchaseConversions.forEach((event) => {
    const metadata = event.metadata as Record<string, unknown> | null;
    if (metadata?.isPurchase) {
      // Safely parse amount - handle both number and string types
      const rawAmount = metadata.amount;
      const amount = typeof rawAmount === "number" ? rawAmount :
                     typeof rawAmount === "string" ? parseFloat(rawAmount) : NaN;

      // Only count if amount is a valid positive number
      if (!isNaN(amount) && amount > 0 && isFinite(amount)) {
        totalRevenue += amount;
        purchaseCount++;

        // Track revenue by coupon
        const coupon = metadata.coupon as string | undefined;
        if (coupon) {
          couponRevenue.set(coupon, (couponRevenue.get(coupon) || 0) + amount);
        }
      }
    }
  });

  // Convert from paise to rupees for display
  const totalRevenueRupees = totalRevenue / 100;
  const avgOrderValue = purchaseCount > 0 ? totalRevenueRupees / purchaseCount : 0;

  const intentColors: Record<string, { bg: string; bar: string }> = {
    high: { bg: "from-emerald-500/10 to-emerald-600/5", bar: "bg-emerald-500" },
    medium: { bg: "from-amber-500/10 to-amber-600/5", bar: "bg-amber-500" },
    low: { bg: "from-slate-500/10 to-slate-600/5", bar: "bg-slate-400" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Analytics"
        description="Track visitor behavior and popup performance."
        iconSlot={<BarChart3 className="h-8 w-8 md:h-9 md:w-9 text-amber-500" />}
        badge="Insights"
      >
        <div className="flex items-center gap-3">
          <BlurFade delay={0.1} direction="up">
            <WebsiteSelector
              websites={websites}
              selectedId={selectedWebsiteId}
              period={period}
            />
          </BlurFade>
          <BlurFade delay={0.15} direction="up">
            <PeriodSelector value={period} websiteId={selectedWebsiteId} />
          </BlurFade>
        </div>
      </PageHeader>

      {/* Overview Stats - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Visitors"
          value={totalVisitors.toLocaleString()}
          subtitle={`${newVisitors} new · ${returningVisitors} returning`}
          iconSlot={<Users className="h-3.5 w-3.5 text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
          delay={0.1}
        />
        <StatCard
          title="Popup Impressions"
          value={totalImpressions.toLocaleString()}
          subtitle={`${totalClicks.toLocaleString()} clicks`}
          iconSlot={<Eye className="h-3.5 w-3.5 text-sky-500" />}
          gradient="from-sky-500/10 to-sky-600/5"
          delay={0.15}
        />
        <StatCard
          title="Conversions"
          value={totalConversions.toLocaleString()}
          subtitle={`${conversionRate}% conversion rate`}
          iconSlot={<Target className="h-3.5 w-3.5 text-violet-500" />}
          gradient="from-violet-500/10 to-violet-600/5"
          delay={0.2}
        />
        <StatCard
          title="High Intent"
          value={intentData.high.toLocaleString()}
          subtitle={`${totalVisitors > 0 ? ((intentData.high / totalVisitors) * 100).toFixed(1) : 0}% of visitors`}
          iconSlot={<TrendingUp className="h-3.5 w-3.5 text-orange-500" />}
          gradient="from-orange-500/10 to-orange-600/5"
          delay={0.25}
        />
      </div>

      {/* Revenue Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue"
          value={`₹${totalRevenueRupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          subtitle={purchaseCount > 0 ? `${purchaseCount} orders` : "Add conversion tracking"}
          iconSlot={<IndianRupee className="h-3.5 w-3.5 text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
          delay={0.27}
        />
        <StatCard
          title="Purchases"
          value={purchaseCount.toLocaleString()}
          subtitle={purchaseCount > 0 ? `from popup conversions` : "No purchase data yet"}
          iconSlot={<Target className="h-3.5 w-3.5 text-violet-500" />}
          gradient="from-violet-500/10 to-violet-600/5"
          delay={0.28}
        />
        <StatCard
          title="Avg Order Value"
          value={avgOrderValue > 0 ? `₹${avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—"}
          subtitle={purchaseCount > 0 ? "per converted visitor" : "Track conversions to see"}
          iconSlot={<TrendingUp className="h-3.5 w-3.5 text-amber-500" />}
          gradient="from-amber-500/10 to-amber-600/5"
          delay={0.29}
        />
        <StatCard
          title="Coupon Copies"
          value={couponCopies.toLocaleString()}
          subtitle="codes copied from popups"
          iconSlot={<Copy className="h-3.5 w-3.5 text-sky-500" />}
          gradient="from-sky-500/10 to-sky-600/5"
          delay={0.295}
        />
      </div>

      {/* Overview Stats - Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg. Scroll Depth"
          value={`${(avgScrollDepth._avg.scrollDepth || 0).toFixed(0)}%`}
          iconSlot={<ArrowDownRight className="h-3.5 w-3.5 text-sky-500" />}
          gradient="from-sky-500/10 to-sky-600/5"
          delay={0.3}
        />
        <StatCard
          title="Bounce Rate"
          value={`${bounceRate}%`}
          subtitle={`${bouncedCount.toLocaleString()} single-page visits`}
          iconSlot={<ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />}
          gradient="from-rose-500/10 to-rose-600/5"
          delay={0.35}
        />
        <StatCard
          title="Click Rate"
          value={`${clickRate}%`}
          subtitle={`${totalClicks} of ${totalImpressions} impressions`}
          iconSlot={<MousePointerClick className="h-3.5 w-3.5 text-violet-500" />}
          gradient="from-violet-500/10 to-violet-600/5"
          delay={0.4}
        />
        <StatCard
          title="Conversion Paths"
          value={conversionPaths.length}
          subtitle="tracked journeys to conversion"
          iconSlot={<Zap className="h-3.5 w-3.5 text-amber-500" />}
          gradient="from-amber-500/10 to-amber-600/5"
          delay={0.45}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Intent Breakdown */}
        <GlassCard delay={0.5} gradient="from-emerald-500/5 via-transparent to-amber-500/5" corners="top">
          <GlassCardHeader title="Intent Breakdown" description="Visitor engagement levels" />
          <GlassCardContent>
            <div className="space-y-4">
              {[
                { label: "High Intent", value: intentData.high, key: "high" },
                { label: "Medium Intent", value: intentData.medium, key: "medium" },
                { label: "Low Intent", value: intentData.low, key: "low" },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full transition-all", intentColors[item.key].bar)}
                      style={{ width: `${totalVisitors > 0 ? (item.value / totalVisitors) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Device Breakdown */}
        <GlassCard delay={0.55} gradient="from-sky-500/5 via-transparent to-violet-500/5" corners="top">
          <GlassCardHeader title="Device Breakdown" description="Visitors by device type" />
          <GlassCardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-600/5 border border-sky-500/20">
                <Monitor className="h-8 w-8 mb-3 text-sky-500" />
                <div className="text-3xl font-medium tracking-tighter">{deviceData.desktop.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Desktop</p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
                <Smartphone className="h-8 w-8 mb-3 text-violet-500" />
                <div className="text-3xl font-medium tracking-tighter">{deviceData.mobile.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Mobile</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* New vs Returning */}
        <GlassCard delay={0.6} gradient="from-violet-500/5 via-transparent to-emerald-500/5" corners="top">
          <GlassCardHeader title="New vs Returning" description="Visitor type breakdown" />
          <GlassCardContent>
            <NewVsReturningChart newCount={newVisitors} returningCount={returningVisitors} />
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* OS Breakdown */}
      {visitorsByOS.length > 0 && (
        <GlassCard delay={0.65} gradient="from-sky-500/5 via-transparent to-amber-500/5" corners="top">
          <GlassCardHeader title="Operating Systems" description="Visitors by OS">
            <Laptop className="h-5 w-5 text-sky-500" />
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {visitorsByOS.map((item, index) => (
                <BlurFade key={item.os} delay={0.7 + index * 0.03} direction="up">
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-sky-500/5 to-sky-600/5 border border-border/50 hover:border-sky-500/30 transition-colors">
                    <div className="text-xl font-medium tracking-tighter">{item._count.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">{item.os}</p>
                  </div>
                </BlurFade>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      {/* Tabs Section */}
      <BlurFade delay={0.75} direction="up">
        <Tabs defaultValue="sources" className="space-y-4">
          <TabsList className="flex-wrap bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-1">
            <TabsTrigger value="sources" className="rounded-lg">Traffic Sources</TabsTrigger>
            <TabsTrigger value="pages" className="rounded-lg">Top Pages</TabsTrigger>
            <TabsTrigger value="geography" className="rounded-lg">Geography</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg">Campaigns</TabsTrigger>
            <TabsTrigger value="conversions" className="rounded-lg">Conversion Paths</TabsTrigger>
            <TabsTrigger value="visitors" className="rounded-lg">Recent Visitors</TabsTrigger>
          </TabsList>

          {/* Traffic Sources */}
          <TabsContent value="sources">
            <GlassCard delay={0} gradient="from-sky-500/5 via-transparent to-violet-500/5" corners="top">
              <GlassCardHeader title="Traffic Sources" description="Where your visitors are coming from" />
              <GlassCardContent>
                {visitorsBySource.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No traffic data yet</div>
                ) : (
                  <div className="space-y-2">
                    {visitorsBySource.map((source, index) => (
                      <div
                        key={`${source.utmSource || "direct"}-${index}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-card hover:border-sky-500/30 transition-all"
                      >
                        <span className="font-medium">{source.utmSource || "Direct / None"}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {totalVisitors > 0 ? ((source._count / totalVisitors) * 100).toFixed(1) : 0}%
                          </span>
                          <Badge variant="secondary" className="bg-sky-500/10 text-sky-600">
                            {source._count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* Top Pages */}
          <TabsContent value="pages">
            <GlassCard delay={0} gradient="from-violet-500/5 via-transparent to-emerald-500/5" corners="top">
              <GlassCardHeader title="Top Pages" description="Most visited pages on your site" />
              <GlassCardContent>
                {sortedPages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No page data yet</div>
                ) : (
                  <div className="space-y-2">
                    {sortedPages.map(([page, count]) => (
                      <div
                        key={page}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-card hover:border-violet-500/30 transition-all"
                      >
                        <span className="font-mono text-sm truncate max-w-md" title={page}>{page}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {totalVisitors > 0 ? ((count / totalVisitors) * 100).toFixed(1) : 0}%
                          </span>
                          <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
                            {count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* Geography */}
          <TabsContent value="geography">
            <div className="grid gap-6 lg:grid-cols-2">
              <GlassCard delay={0} gradient="from-emerald-500/5 via-transparent to-sky-500/5" corners="top">
                <GlassCardHeader title="Countries" description="Visitors by country">
                  <Globe className="h-5 w-5 text-emerald-500" />
                </GlassCardHeader>
                <GlassCardContent>
                  {visitorsByCountry.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No country data yet.</p>
                      <p className="text-sm mt-1">Deploy to Vercel for automatic geo detection.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                      {visitorsByCountry.map((item, index) => (
                        <div
                          key={item.country}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-card hover:border-emerald-500/30 transition-all"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-xs font-medium text-emerald-600">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium truncate" title={item.country || "Unknown"}>{item.country}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm text-muted-foreground">
                                  {totalVisitors > 0 ? ((item._count / totalVisitors) * 100).toFixed(1) : 0}%
                                </span>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                                  {item._count}
                                </Badge>
                              </div>
                            </div>
                            <div className="h-1.5 mt-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                style={{ width: `${totalVisitors > 0 ? (item._count / totalVisitors) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>

              <GlassCard delay={0} gradient="from-amber-500/5 via-transparent to-violet-500/5" corners="top">
                <GlassCardHeader title="Cities" description="Visitors by city">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </GlassCardHeader>
                <GlassCardContent>
                  {visitorsByCity.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No city data yet.</p>
                      <p className="text-sm mt-1">Deploy to Vercel for automatic geo detection.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                      {visitorsByCity.map((item, index) => (
                        <div
                          key={item.city}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-card hover:border-amber-500/30 transition-all"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-xs font-medium text-amber-600">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium truncate" title={item.city || "Unknown"}>{item.city}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm text-muted-foreground">
                                  {totalVisitors > 0 ? ((item._count / totalVisitors) * 100).toFixed(1) : 0}%
                                </span>
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                                  {item._count}
                                </Badge>
                              </div>
                            </div>
                            <div className="h-1.5 mt-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                                style={{ width: `${totalVisitors > 0 ? (item._count / totalVisitors) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Campaigns */}
          <TabsContent value="campaigns">
            <GlassCard delay={0} gradient="from-violet-500/5 via-transparent to-sky-500/5" corners="top">
              <GlassCardHeader title="Campaign Performance" description="How your popups are performing">
                {selectedWebsiteId && (
                  <PrimaryButton asChild size="sm">
                    <Link href={`/websites/${selectedWebsiteId}/campaigns/new`}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Campaign
                    </Link>
                  </PrimaryButton>
                )}
              </GlassCardHeader>
              <GlassCardContent>
                {campaignStatsWithEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">No campaigns yet.</p>
                    <PrimaryButton asChild>
                      <Link href={`/websites/${selectedWebsiteId}/campaigns/new`}>Create Campaign</Link>
                    </PrimaryButton>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {campaignStatsWithEvents.map((campaign) => (
                      <Link
                        key={campaign.id}
                        href={`/websites/${selectedWebsiteId}/campaigns/${campaign.id}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-card hover:border-violet-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium group-hover:text-violet-500 transition-colors">
                            {campaign.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              campaign.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-muted"
                            )}
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{campaign.popupType}</span>
                          <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
                            {campaign.eventCount} events
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* Conversion Paths */}
          <TabsContent value="conversions">
            <GlassCard delay={0} gradient="from-amber-500/5 via-transparent to-emerald-500/5" corners="top">
              <GlassCardHeader
                title="Conversion Paths"
                description="How visitors journey to conversion through your popups"
              />
              <GlassCardContent>
                <ConversionPathView paths={conversionPaths} patterns={sortedPatterns} />
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* Recent Visitors */}
          <TabsContent value="visitors">
            <GlassCard delay={0} gradient="from-emerald-500/5 via-transparent to-violet-500/5" corners="top">
              <GlassCardHeader title="Recent Visitors" description="Latest visitor activity">
                <Link
                  href={`/visitors?website=${selectedWebsiteId}`}
                  className="text-sm text-sky-500 hover:text-sky-600 transition-colors"
                >
                  View all →
                </Link>
              </GlassCardHeader>
              <GlassCardContent>
                {recentVisitors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No visitors yet. Install the tracking script to start collecting data.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentVisitors.map((visitor) => (
                      <div
                        key={visitor.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-card transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Users className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div>
                            <span className="font-mono text-sm">{visitor.visitorHash.slice(0, 12)}...</span>
                            <p className="text-xs text-muted-foreground">
                              {visitor.utmSource || "Direct"} · {visitor.device || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs border",
                              visitor.intentLevel === "HIGH"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : visitor.intentLevel === "MEDIUM"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                            )}
                          >
                            {visitor.intentLevel}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatTimeAgo(visitor.lastSeen)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </BlurFade>
    </div>
  );
}
