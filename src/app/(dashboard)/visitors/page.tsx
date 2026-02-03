import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import type { Metadata } from "next";

// Demo user IDs (geo-based)
const DEMO_USER_INR = "cml66aybb0000yefsjavxkfb5";
const DEMO_USER_USD = "cml66hzz280fsyefsv71bm5ed";

export const metadata: Metadata = {
  title: "Visitors | PopupTool",
  description: "View and analyze your website visitors with intent scoring.",
};
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Flame,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { WebsiteSelector } from "@/components/analytics/website-selector";
import { VisitorDetail } from "@/components/analytics/visitor-detail";
import { VisitorsFilters } from "@/components/visitors/visitors-filters";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/dashboard/glass-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PrimaryButton } from "@/components/dashboard/primary-button";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { cn, formatTimeAgo, formatDuration } from "@/lib/utils";

const ITEMS_PER_PAGE = 20;

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    website?: string;
    page?: string;
    intent?: string;
    source?: string;
    search?: string;
    period?: string;
  }>;
}) {
  const session = await auth();
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";
  const isIndia = country === "IN";
  const demoUserId = isIndia ? DEMO_USER_INR : DEMO_USER_USD;
  const userId = session?.user?.id || demoUserId;

  const params = await searchParams;
  const period = params.period || "30d";

  // Calculate date range
  const now = new Date();
  const periodDays = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Get user's websites
  const websites = await db.website.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });

  if (websites.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Visitors"
          description="View and analyze your website visitors."
          iconSlot={<Users className="h-8 w-8 md:h-9 md:w-9 text-emerald-500" />}
          badge="Intelligence"
        />
        <GlassCard delay={0.1} gradient="from-emerald-500/5 via-transparent to-sky-500/5" corners="all">
          <GlassCardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 mb-6">
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight mb-2">No websites yet</h3>
            <p className="text-muted-foreground text-center leading-relaxed max-w-sm mb-6">
              Add a website to start tracking visitors.
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
  const currentPage = parseInt(params.page || "1");
  const intentFilter = params.intent || "all";
  const sourceFilter = params.source || "all";
  const searchQuery = params.search || "";

  // Build where clause with period filter
  const where: Record<string, unknown> = {
    websiteId: selectedWebsiteId,
    lastSeen: { gte: startDate },
  };

  if (intentFilter !== "all") {
    where.intentLevel = intentFilter.toUpperCase();
  }

  if (sourceFilter !== "all") {
    if (sourceFilter === "direct") {
      where.utmSource = null;
    } else {
      where.utmSource = sourceFilter;
    }
  }

  if (searchQuery) {
    where.OR = [
      { visitorHash: { contains: searchQuery } },
      { utmSource: { contains: searchQuery } },
      { referrer: { contains: searchQuery } },
    ];
  }

  // Get visitors count and data
  const [totalCount, visitors, sources] = await Promise.all([
    db.visitor.count({ where }),
    db.visitor.findMany({
      where,
      orderBy: { lastSeen: "desc" },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        _count: {
          select: { events: true },
        },
      },
    }),
    // Get unique sources for filter (within period)
    db.visitor.groupBy({
      by: ["utmSource"],
      where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } },
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Stats (within period)
  const stats = await db.visitor.aggregate({
    where: { websiteId: selectedWebsiteId, lastSeen: { gte: startDate } },
    _avg: { intentScore: true, visitCount: true, timeOnSiteSeconds: true },
    _count: true,
  });

  const highIntentCount = await db.visitor.count({
    where: { websiteId: selectedWebsiteId, intentLevel: "HIGH", lastSeen: { gte: startDate } },
  });

  const intentColors: Record<string, string> = {
    HIGH: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    LOW: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Visitors"
        description="View and analyze your website visitors."
        iconSlot={<Users className="h-8 w-8 md:h-9 md:w-9 text-emerald-500" />}
        badge="Intelligence"
      >
        <div className="flex items-center gap-3">
          <BlurFade delay={0.1} direction="up">
            <WebsiteSelector
              websites={websites}
              selectedId={selectedWebsiteId}
              period={period}
              basePath="/visitors"
            />
          </BlurFade>
          <BlurFade delay={0.15} direction="up">
            <PrimaryButton variant="outline" size="sm" disabled title="Coming soon">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </PrimaryButton>
          </BlurFade>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Visitors"
          value={stats._count.toLocaleString()}
          iconSlot={<Users className="h-3.5 w-3.5 text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
          delay={0.1}
        />
        <StatCard
          title="High Intent"
          value={highIntentCount.toLocaleString()}
          subtitle={`${stats._count > 0 ? ((highIntentCount / stats._count) * 100).toFixed(1) : 0}% of total`}
          iconSlot={<Flame className="h-3.5 w-3.5 text-orange-500" />}
          gradient="from-orange-500/10 to-orange-600/5"
          delay={0.15}
        />
        <StatCard
          title="Avg. Visits"
          value={stats._avg.visitCount?.toFixed(1) || "0"}
          iconSlot={<Activity className="h-3.5 w-3.5 text-sky-500" />}
          gradient="from-sky-500/10 to-sky-600/5"
          delay={0.2}
        />
        <StatCard
          title="Avg. Time"
          value={formatDuration(stats._avg.timeOnSiteSeconds || 0)}
          iconSlot={<Clock className="h-3.5 w-3.5 text-violet-500" />}
          gradient="from-violet-500/10 to-violet-600/5"
          delay={0.25}
        />
      </div>

      {/* Filters */}
      <BlurFade delay={0.3} direction="up">
        <VisitorsFilters
          websiteId={selectedWebsiteId}
          intentFilter={intentFilter}
          sourceFilter={sourceFilter}
          searchQuery={searchQuery}
          sources={sources}
          period={period}
        />
      </BlurFade>

      {/* Visitors Table */}
      <GlassCard delay={0.35} gradient="from-emerald-500/5 via-transparent to-violet-500/5" corners="top">
        <GlassCardHeader
          title="All Visitors"
          description={`Showing ${((currentPage - 1) * ITEMS_PER_PAGE) + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of ${totalCount.toLocaleString()} visitors`}
        />
        <GlassCardContent>
          {visitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 mb-6">
                <Users className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-medium tracking-tight mb-2">No visitors found</h3>
              <p className="text-muted-foreground text-center leading-relaxed max-w-sm">
                Install the tracking script to start collecting visitor data.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-2">Visitor</div>
                <div className="col-span-2">Intent</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-2">Device</div>
                <div className="col-span-1 text-right">Visits</div>
                <div className="col-span-1 text-right">Scroll</div>
                <div className="col-span-1 text-right">Time</div>
                <div className="col-span-1 text-right">Last Seen</div>
              </div>

              {/* Visitor Rows */}
              {visitors.map((visitor, index) => (
                <BlurFade key={visitor.id} delay={0.4 + index * 0.02} direction="up">
                  <div className={cn(
                    "group grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-xl border border-border/50 bg-background/50 transition-all duration-300",
                    "hover:bg-card hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
                  )}>
                    {/* Visitor ID */}
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20">
                        <Users className="h-4 w-4 text-emerald-500" />
                      </div>
                      <VisitorDetail visitor={visitor} />
                    </div>

                    {/* Mobile: Key stats row */}
                    <div className="lg:hidden flex flex-wrap items-center gap-2 text-sm">
                      <Badge
                        variant="outline"
                        className={cn("text-xs border", intentColors[visitor.intentLevel])}
                      >
                        {visitor.intentLevel} ({visitor.intentScore})
                      </Badge>
                      <span className="text-muted-foreground">•</span>
                      <span>{visitor.visitCount} visits</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{formatTimeAgo(visitor.lastSeen)}</span>
                    </div>

                    {/* Desktop: Intent */}
                    <div className="hidden lg:flex lg:col-span-2 items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs border", intentColors[visitor.intentLevel])}
                      >
                        {visitor.intentLevel}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              visitor.intentScore >= 61
                                ? "bg-emerald-500"
                                : visitor.intentScore >= 31
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            )}
                            style={{ width: `${visitor.intentScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{visitor.intentScore}</span>
                      </div>
                    </div>

                    {/* Desktop: Source */}
                    <div className="hidden lg:flex lg:col-span-2 items-center">
                      <div className="text-sm">
                        <span className="font-medium">{visitor.utmSource || "Direct"}</span>
                        {visitor.utmMedium && (
                          <span className="text-muted-foreground ml-1">/ {visitor.utmMedium}</span>
                        )}
                      </div>
                    </div>

                    {/* Desktop: Device */}
                    <div className="hidden lg:flex lg:col-span-2 items-center text-sm">
                      <span className="capitalize">{visitor.device || "-"}</span>
                      {visitor.os && (
                        <span className="text-muted-foreground ml-1">/ {visitor.os}</span>
                      )}
                    </div>

                    {/* Desktop: Visits */}
                    <div className="hidden lg:flex lg:col-span-1 items-center justify-end">
                      <span className="font-medium">{visitor.visitCount}</span>
                    </div>

                    {/* Desktop: Scroll */}
                    <div className="hidden lg:flex lg:col-span-1 items-center justify-end text-muted-foreground">
                      {visitor.scrollDepth}%
                    </div>

                    {/* Desktop: Time */}
                    <div className="hidden lg:flex lg:col-span-1 items-center justify-end text-muted-foreground">
                      {formatDuration(visitor.timeOnSiteSeconds)}
                    </div>

                    {/* Desktop: Last Seen */}
                    <div className="hidden lg:flex lg:col-span-1 items-center justify-end text-sm text-muted-foreground">
                      {formatTimeAgo(visitor.lastSeen)}
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  className="rounded-xl"
                  asChild
                >
                  <Link
                    href={`/visitors?website=${selectedWebsiteId}&page=${currentPage - 1}&intent=${intentFilter}&source=${sourceFilter}&period=${period}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  className="rounded-xl"
                  asChild
                >
                  <Link
                    href={`/visitors?website=${selectedWebsiteId}&page=${currentPage + 1}&intent=${intentFilter}&source=${sourceFilter}&period=${period}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
