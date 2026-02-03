import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import type { Metadata } from "next";

// Demo user IDs (geo-based)
const DEMO_USER_INR = "cml66aybb0000yefsjavxkfb5";
const DEMO_USER_USD = "cml66hzz280fsyefsv71bm5ed";

export const metadata: Metadata = {
  title: "Campaigns | PopupTool",
  description: "Manage your popup campaigns across all websites.",
};
import {
  Megaphone,
  Plus,
  Eye,
  Target,
  Globe,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/dashboard/glass-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PrimaryButton } from "@/components/dashboard/primary-button";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { CampaignRow } from "@/components/dashboard/campaign-row";
import { CampaignsFilters } from "@/components/campaigns/campaigns-filters";

export default async function AllCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ website?: string; status?: string; period?: string }>;
}) {
  const session = await auth();
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";
  const isIndia = country === "IN";
  const demoUserId = isIndia ? DEMO_USER_INR : DEMO_USER_USD;
  const userId = session?.user?.id || demoUserId;

  const params = await searchParams;
  const period = params.period || "30d";

  // Calculate date range for stats
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
          title="Campaigns"
          description="Manage popup campaigns across all your websites."
          iconSlot={<Megaphone className="h-8 w-8 md:h-9 md:w-9 text-violet-500" />}
          badge="Overview"
        />
        <GlassCard delay={0.1} gradient="from-violet-500/5 via-transparent to-sky-500/5" corners="all">
          <GlassCardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/20 mb-6">
              <Globe className="h-8 w-8 text-violet-500" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight mb-2">No websites yet</h3>
            <p className="text-muted-foreground text-center leading-relaxed max-w-sm mb-6">
              Add a website first to start creating popup campaigns.
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

  // Build where clause
  const where: Record<string, unknown> = {
    website: {
      userId: userId,
    },
  };

  if (params.website && params.website !== "all") {
    where.websiteId = params.website;
  }

  if (params.status && params.status !== "all") {
    where.status = params.status.toUpperCase();
  }

  // Get campaigns with stats
  const campaigns = await db.campaign.findMany({
    where,
    include: {
      website: {
        select: {
          id: true,
          domain: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  // Get stats for each campaign (filtered by period)
  const campaignsWithStats = await Promise.all(
    campaigns.map(async (campaign) => {
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
  const totalConversions = campaignsWithStats.reduce(
    (sum, c) => sum + c.stats.conversions,
    0
  );
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;

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
      <PageHeader
        title="Campaigns"
        description="Manage popup campaigns across all your websites."
        iconSlot={<Megaphone className="h-8 w-8 md:h-9 md:w-9 text-violet-500" />}
        badge="Overview"
      >
        <div className="flex items-center gap-3">
          <BlurFade delay={0.1} direction="up">
            <CampaignsFilters
              websites={websites.map((w) => ({ id: w.id, domain: w.domain }))}
              selectedWebsite={params.website || "all"}
              selectedStatus={params.status || "all"}
              selectedPeriod={period}
            />
          </BlurFade>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Campaigns"
          value={campaigns.length}
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
          title="Conversions"
          value={totalConversions.toLocaleString()}
          iconSlot={<Target className="h-3.5 w-3.5 text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
          delay={0.2}
        />
        <StatCard
          title="Avg. CVR"
          value={`${totalImpressions > 0
            ? ((totalConversions / totalImpressions) * 100).toFixed(1)
            : "0"}%`}
          iconSlot={<TrendingUp className="h-3.5 w-3.5 text-amber-500" />}
          gradient="from-amber-500/10 to-amber-600/5"
          delay={0.25}
        />
      </div>

      {/* Campaigns List */}
      <GlassCard delay={0.3} gradient="from-violet-500/5 via-transparent to-sky-500/5" corners="top">
        <GlassCardHeader
          title="All Campaigns"
          description={`${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""} found`}
        >
          {websites.length > 0 && (
            <PrimaryButton asChild size="sm">
              <Link href={`/websites/${websites[0].id}/campaigns/new`}>
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Link>
            </PrimaryButton>
          )}
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
                <Link href={`/websites/${websites[0].id}/campaigns/new`}>
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
                      website: campaign.website,
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
