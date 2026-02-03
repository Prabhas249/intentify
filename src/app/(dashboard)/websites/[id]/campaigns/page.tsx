import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Megaphone,
  Eye,
  MousePointerClick,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/dashboard/glass-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PrimaryButton } from "@/components/dashboard/primary-button";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { CampaignRow } from "@/components/dashboard/campaign-row";
import { PeriodSelector } from "@/components/dashboard/period-selector";

export default async function CampaignsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { id } = await params;
  const queryParams = await searchParams;
  const period = queryParams.period || "30d";
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  // Calculate date range for stats
  const now = new Date();
  const periodDays = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  const website = await db.website.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      campaigns: {
        orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!website) {
    notFound();
  }

  // Calculate stats per campaign (filtered by period)
  const campaignsWithStats = await Promise.all(
    website.campaigns.map(async (campaign) => {
      const [impressions, clicks, conversions] = await Promise.all([
        db.event.count({
          where: { campaignId: campaign.id, eventType: "POPUP_IMPRESSION", createdAt: { gte: startDate } },
        }),
        db.event.count({
          where: { campaignId: campaign.id, eventType: "POPUP_CLICK", createdAt: { gte: startDate } },
        }),
        db.event.count({
          where: { campaignId: campaign.id, eventType: "POPUP_CONVERSION", createdAt: { gte: startDate } },
        }),
      ]);

      return {
        ...campaign,
        stats: {
          impressions,
          clicks,
          conversions,
          ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0",
          cvr: impressions > 0 ? ((conversions / impressions) * 100).toFixed(1) : "0",
        },
      };
    })
  );

  // Summary stats
  const totalImpressions = campaignsWithStats.reduce(
    (sum, c) => sum + c.stats.impressions,
    0
  );
  const totalClicks = campaignsWithStats.reduce(
    (sum, c) => sum + c.stats.clicks,
    0
  );
  const totalConversions = campaignsWithStats.reduce(
    (sum, c) => sum + c.stats.conversions,
    0
  );
  const activeCampaigns = website.campaigns.filter((c) => c.status === "ACTIVE").length;

  const popupTypeLabels: Record<string, string> = {
    MODAL: "Modal",
    SLIDE_IN: "Slide-in",
    BANNER: "Banner",
    FLOATING: "Floating",
    FULL_SCREEN: "Full Screen",
    BOTTOM_SHEET: "Bottom Sheet",
  };

  const popupTypeColors: Record<string, string> = {
    MODAL: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    SLIDE_IN: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    BANNER: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    FLOATING: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    FULL_SCREEN: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    BOTTOM_SHEET: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BlurFade delay={0} direction="up">
          <Button variant="ghost" size="icon" asChild className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-violet-500/30">
            <Link href={`/websites/${website.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </BlurFade>
        <PageHeader
          title="Campaigns"
          description={website.domain}
          iconSlot={<Megaphone className="h-8 w-8 md:h-9 md:w-9 text-violet-500" />}
          badge="Website"
          className="flex-1"
        >
          <div className="flex items-center gap-3">
            <PeriodSelector period={period} />
            <PrimaryButton asChild>
              <Link href={`/websites/${website.id}/campaigns/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Link>
            </PrimaryButton>
          </div>
        </PageHeader>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Campaigns"
          value={website.campaigns.length}
          subtitle={`${activeCampaigns} active`}
          iconSlot={<Megaphone className="h-3.5 w-3.5 text-violet-500" />}
          gradient="from-violet-500/10 to-violet-600/5"
          delay={0.1}
        />
        <StatCard
          title="Impressions"
          value={totalImpressions.toLocaleString()}
          iconSlot={<Eye className="h-3.5 w-3.5 text-sky-500" />}
          gradient="from-sky-500/10 to-sky-600/5"
          delay={0.15}
        />
        <StatCard
          title="Clicks"
          value={totalClicks.toLocaleString()}
          subtitle={`${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0"}% CTR`}
          iconSlot={<MousePointerClick className="h-3.5 w-3.5 text-amber-500" />}
          gradient="from-amber-500/10 to-amber-600/5"
          delay={0.2}
        />
        <StatCard
          title="Conversions"
          value={totalConversions.toLocaleString()}
          subtitle={`${totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : "0"}% CVR`}
          iconSlot={<Target className="h-3.5 w-3.5 text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
          delay={0.25}
        />
      </div>

      {/* Campaigns List */}
      <GlassCard delay={0.3} gradient="from-violet-500/5 via-transparent to-sky-500/5" corners="top">
        <GlassCardHeader
          title="All Campaigns"
          description={`Manage your popup campaigns. Higher priority campaigns show first.`}
        >
          <PrimaryButton asChild size="sm">
            <Link href={`/websites/${website.id}/campaigns/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </PrimaryButton>
        </GlassCardHeader>
        <GlassCardContent>
          {campaignsWithStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/20 mb-6">
                <Megaphone className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="text-2xl font-medium tracking-tight mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground text-center leading-relaxed max-w-sm mb-6">
                Create your first popup campaign to start converting visitors.
              </p>
              <PrimaryButton asChild size="lg">
                <Link href={`/websites/${website.id}/campaigns/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Link>
              </PrimaryButton>
            </div>
          ) : (
            <div className="space-y-3">
              {campaignsWithStats.map((campaign, index) => (
                <BlurFade key={campaign.id} delay={0.35 + index * 0.03} direction="up">
                  <CampaignRow
                    campaign={{
                      id: campaign.id,
                      name: campaign.name,
                      websiteId: campaign.websiteId,
                      popupType: campaign.popupType,
                      status: campaign.status,
                      priority: campaign.priority,
                      website: { domain: website.domain },
                      stats: campaign.stats,
                    }}
                    popupTypeLabels={popupTypeLabels}
                    popupTypeColors={popupTypeColors}
                  />
                </BlurFade>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
