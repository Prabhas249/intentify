import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import Link from "next/link";
import { WebsiteSelector } from "@/components/analytics/website-selector";
import { NewVsReturningChart } from "@/components/analytics/new-vs-returning-chart";
import { ConversionPathView } from "@/components/analytics/conversion-path";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ website?: string; period?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const period = params.period || "7d";

  // Get user's websites
  const websites = await db.website.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (websites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Globe className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold tracking-tight mb-2">No websites yet</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add a website to start tracking visitors and see analytics.
        </p>
        <Link
          href="/websites/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Website
        </Link>
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
  ] = await Promise.all([
    // Total visitors
    db.visitor.count({
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
      },
    }),
    // New visitors (first seen in period)
    db.visitor.count({
      where: {
        websiteId: selectedWebsiteId,
        firstSeen: { gte: startDate },
      },
    }),
    // Returning visitors
    db.visitor.count({
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
        visitCount: { gt: 1 },
      },
    }),
    // Total impressions
    db.event.count({
      where: {
        visitor: { websiteId: selectedWebsiteId },
        eventType: "POPUP_IMPRESSION",
        createdAt: { gte: startDate },
      },
    }),
    // Total clicks
    db.event.count({
      where: {
        visitor: { websiteId: selectedWebsiteId },
        eventType: "POPUP_CLICK",
        createdAt: { gte: startDate },
      },
    }),
    // Total conversions
    db.event.count({
      where: {
        visitor: { websiteId: selectedWebsiteId },
        eventType: "POPUP_CONVERSION",
        createdAt: { gte: startDate },
      },
    }),
    // Visitors by intent
    db.visitor.groupBy({
      by: ["intentLevel"],
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
      },
      _count: true,
    }),
    // Visitors by device
    db.visitor.groupBy({
      by: ["device"],
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
        device: { not: null },
      },
      _count: true,
    }),
    // Visitors by source
    db.visitor.groupBy({
      by: ["utmSource"],
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
      },
      _count: true,
      orderBy: { _count: { utmSource: "desc" } },
      take: 10,
    }),
    // Top pages (also used for bounce rate calculation)
    db.visitor.findMany({
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
      },
      select: { pagesViewed: true },
    }),
    // Recent visitors
    db.visitor.findMany({
      where: {
        websiteId: selectedWebsiteId,
      },
      orderBy: { lastSeen: "desc" },
      take: 10,
    }),
    // Campaign stats
    db.campaign.findMany({
      where: {
        websiteId: selectedWebsiteId,
      },
      include: {
        _count: {
          select: { events: true },
        },
      },
    }),
    // Avg scroll depth
    db.visitor.aggregate({
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
      },
      _avg: { scrollDepth: true },
    }),
    // Visitors by OS
    db.visitor.groupBy({
      by: ["os"],
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
        os: { not: null },
      },
      _count: true,
      orderBy: { _count: { os: "desc" } },
    }),
    // Top countries
    db.visitor.groupBy({
      by: ["country"],
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
        country: { not: null },
      },
      _count: true,
      orderBy: { _count: { country: "desc" } },
      take: 10,
    }),
    // Top cities
    db.visitor.groupBy({
      by: ["city"],
      where: {
        websiteId: selectedWebsiteId,
        lastSeen: { gte: startDate },
        city: { not: null },
      },
      _count: true,
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
    // Conversion paths - visitors who converted
    db.visitor.findMany({
      where: {
        websiteId: selectedWebsiteId,
        events: {
          some: {
            eventType: "POPUP_CONVERSION",
            createdAt: { gte: startDate },
          },
        },
      },
      include: {
        events: {
          orderBy: { createdAt: "asc" },
          take: 50,
          include: { campaign: { select: { name: true } } },
        },
      },
      take: 20,
    }),
  ]);

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

  // Calculate conversion rate
  const conversionRate = totalImpressions > 0
    ? ((totalConversions / totalImpressions) * 100).toFixed(1)
    : "0";

  // Bounce rate (visitors with only 1 page viewed)
  const bouncedCount = topPages.filter((v) => v.pagesViewed.length <= 1).length;
  const bounceRate = totalVisitors > 0
    ? ((bouncedCount / totalVisitors) * 100).toFixed(1)
    : "0";

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
      pathPatternMap.set(key, {
        count: 1,
        steps: path.steps.map((s) => s.type),
      });
    }
  });
  const sortedPatterns = Array.from(pathPatternMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((p) => ({ pattern: p.steps.join(" → "), count: p.count, steps: p.steps }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Analytics</h1>
          <p className="text-xl text-muted-foreground">
            Track visitor behavior and popup performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WebsiteSelector
            websites={websites}
            selectedId={selectedWebsiteId}
            period={period}
          />
          <Select defaultValue={period}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium leading-none">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalVisitors.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                {newVisitors} new
              </span>
              <span>•</span>
              <span>{returningVisitors} returning</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium leading-none">Popup Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalClicks.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium leading-none">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium leading-none">High Intent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{intentData.high.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalVisitors > 0
                ? ((intentData.high / totalVisitors) * 100).toFixed(1)
                : 0}% of visitors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Stats - Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium leading-none">Avg. Scroll Depth</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {(avgScrollDepth._avg.scrollDepth || 0).toFixed(0)}%
            </div>
            <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${avgScrollDepth._avg.scrollDepth || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium leading-none">Bounce Rate</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{bounceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {bouncedCount.toLocaleString()} single-page visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium leading-none">Click Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {totalImpressions > 0
                ? ((totalClicks / totalImpressions) * 100).toFixed(1)
                : "0"}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalClicks} of {totalImpressions} impressions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium leading-none">Conversion Paths</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{conversionPaths.length}</div>
            <p className="text-xs text-muted-foreground">
              tracked journeys to conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Intent Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Intent Breakdown</CardTitle>
            <CardDescription>Visitor engagement levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "High Intent", value: intentData.high, color: "bg-green-500" },
                { label: "Medium Intent", value: intentData.medium, color: "bg-yellow-500" },
                { label: "Low Intent", value: intentData.low, color: "bg-gray-400" },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all`}
                      style={{
                        width: `${totalVisitors > 0 ? (item.value / totalVisitors) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Visitors by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <Monitor className="h-8 w-8 mb-2 text-muted-foreground" />
                <div className="text-3xl font-bold tracking-tight">{deviceData.desktop.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Desktop</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                <Smartphone className="h-8 w-8 mb-2 text-muted-foreground" />
                <div className="text-3xl font-bold tracking-tight">{deviceData.mobile.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Mobile</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New vs Returning */}
        <Card>
          <CardHeader>
            <CardTitle>New vs Returning</CardTitle>
            <CardDescription>Visitor type breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <NewVsReturningChart
              newCount={newVisitors}
              returningCount={returningVisitors}
            />
          </CardContent>
        </Card>
      </div>

      {/* OS Breakdown */}
      {visitorsByOS.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5" />
              Operating Systems
            </CardTitle>
            <CardDescription>Visitors by OS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {visitorsByOS.map((item) => (
                <div
                  key={item.os}
                  className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg"
                >
                  <div className="text-lg font-bold tracking-tight">{item._count.toLocaleString()}</div>
                  <p className="text-sm font-medium leading-none text-muted-foreground">{item.os}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables Section */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="conversions">Conversion Paths</TabsTrigger>
          <TabsTrigger value="visitors">Recent Visitors</TabsTrigger>
        </TabsList>

        {/* Traffic Sources */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Visitors</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitorsBySource.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No traffic data yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    visitorsBySource.map((source) => (
                      <TableRow key={source.utmSource || "direct"}>
                        <TableCell className="font-medium">
                          {source.utmSource || "Direct / None"}
                        </TableCell>
                        <TableCell className="text-right">{source._count}</TableCell>
                        <TableCell className="text-right">
                          {totalVisitors > 0
                            ? ((source._count / totalVisitors) * 100).toFixed(1)
                            : 0}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Pages */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages on your site</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No page data yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedPages.map(([page, count]) => (
                      <TableRow key={page}>
                        <TableCell className="font-medium font-mono text-sm">
                          {page}
                        </TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                        <TableCell className="text-right">
                          {totalVisitors > 0
                            ? ((count / totalVisitors) * 100).toFixed(1)
                            : 0}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography */}
        <TabsContent value="geography">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Countries
                </CardTitle>
                <CardDescription>Where your visitors are located</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Visitors</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitorsByCountry.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No geo data yet. Deploy to Vercel for automatic country detection.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visitorsByCountry.map((item) => (
                        <TableRow key={item.country}>
                          <TableCell className="font-medium">{item.country}</TableCell>
                          <TableCell className="text-right">{item._count}</TableCell>
                          <TableCell className="text-right">
                            {totalVisitors > 0
                              ? ((item._count / totalVisitors) * 100).toFixed(1)
                              : 0}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Cities
                </CardTitle>
                <CardDescription>City-level breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Visitors</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitorsByCity.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No city data yet. Deploy to Vercel for automatic city detection.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visitorsByCity.map((item) => (
                        <TableRow key={item.city}>
                          <TableCell className="font-medium">{item.city}</TableCell>
                          <TableCell className="text-right">{item._count}</TableCell>
                          <TableCell className="text-right">
                            {totalVisitors > 0
                              ? ((item._count / totalVisitors) * 100).toFixed(1)
                              : 0}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>How your popups are performing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No campaigns yet.{" "}
                        <Link
                          href={`/websites/${selectedWebsiteId}/campaigns/new`}
                          className="text-primary hover:underline"
                        >
                          Create one
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaignStats.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <Link
                            href={`/websites/${selectedWebsiteId}/campaigns/${campaign.id}`}
                            className="font-medium hover:underline"
                          >
                            {campaign.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={campaign.status === "ACTIVE" ? "default" : "secondary"}
                            className={
                              campaign.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : ""
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.popupType}</TableCell>
                        <TableCell className="text-right">
                          {campaign._count.events}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Paths */}
        <TabsContent value="conversions">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Paths</CardTitle>
              <CardDescription>
                How visitors journey to conversion through your popups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionPathView
                paths={conversionPaths}
                patterns={sortedPatterns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Visitors */}
        <TabsContent value="visitors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Visitors</CardTitle>
                <CardDescription>Latest visitor activity</CardDescription>
              </div>
              <Link
                href={`/visitors?website=${selectedWebsiteId}`}
                className="text-sm text-primary hover:underline"
              >
                View all →
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVisitors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No visitors yet. Install the tracking script to start collecting data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentVisitors.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell className="font-mono text-xs">
                          {visitor.visitorHash.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              visitor.intentLevel === "HIGH"
                                ? "border-green-500 text-green-700"
                                : visitor.intentLevel === "MEDIUM"
                                ? "border-yellow-500 text-yellow-700"
                                : "border-gray-400 text-gray-600"
                            }
                          >
                            {visitor.intentLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>{visitor.utmSource || "Direct"}</TableCell>
                        <TableCell className="capitalize">{visitor.device || "-"}</TableCell>
                        <TableCell className="text-right">{visitor.visitCount}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatTimeAgo(visitor.lastSeen)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}
