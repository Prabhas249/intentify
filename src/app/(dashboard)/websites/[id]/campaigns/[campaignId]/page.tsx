import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

// Demo user IDs (geo-based)
const DEMO_USER_INR = "cml66aybb0000yefsjavxkfb5";
const DEMO_USER_USD = "cml66hzz280fsyefsv71bm5ed";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  Target,
  XCircle,
  Megaphone,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { CampaignEditor, type PopupContent, type CampaignData } from "@/components/campaign/campaign-editor";
import { CampaignStatusToggle } from "@/components/campaign/campaign-status-toggle";
import { DeleteCampaignButton } from "@/components/campaign/delete-campaign-button";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/dashboard/glass-card";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string; campaignId: string }>;
}) {
  const { id: websiteId, campaignId } = await params;
  const session = await auth();
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";
  const isIndia = country === "IN";
  const demoUserId = isIndia ? DEMO_USER_INR : DEMO_USER_USD;
  const userId = session?.user?.id || demoUserId;

  const campaign = await db.campaign.findFirst({
    where: {
      id: campaignId,
      websiteId,
      website: {
        userId,
      },
    },
    include: {
      website: {
        select: {
          id: true,
          domain: true,
        },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  // Get campaign stats
  const [impressions, clicks, conversions, dismissals] = await Promise.all([
    db.event.count({
      where: { campaignId, eventType: "POPUP_IMPRESSION" },
    }),
    db.event.count({
      where: { campaignId, eventType: "POPUP_CLICK" },
    }),
    db.event.count({
      where: { campaignId, eventType: "POPUP_CONVERSION" },
    }),
    db.event.count({
      where: { campaignId, eventType: "POPUP_DISMISS" },
    }),
  ]);

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0";
  const cvr = impressions > 0 ? ((conversions / impressions) * 100).toFixed(1) : "0";

  const popupTypeLabels: Record<string, string> = {
    MODAL: "Modal",
    SLIDE_IN: "Slide-in",
    BANNER: "Banner",
    FLOATING: "Floating",
    FULL_SCREEN: "Full Screen",
    BOTTOM_SHEET: "Bottom Sheet",
  };

  const frequencyLabels: Record<string, string> = {
    EVERY_TIME: "Every Time",
    ONCE_PER_SESSION: "Once per Session",
    ONCE_PER_DAY: "Once per Day",
    ONCE_PER_WEEK: "Once per Week",
    ONCE_EVER: "Once Ever",
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
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <BlurFade delay={0} direction="up">
            <Button variant="ghost" size="icon" asChild className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-violet-500/30">
              <Link href={`/websites/${websiteId}/campaigns`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </BlurFade>
          <BlurFade delay={0.05} direction="up">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/20">
                <Megaphone className="h-6 w-6 md:h-7 md:w-7 text-violet-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${popupTypeColors[campaign.popupType]} border`}>
                    {popupTypeLabels[campaign.popupType]}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-border/50">
                    {frequencyLabels[campaign.frequency]}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight">{campaign.name}</h1>
                <p className="text-muted-foreground text-sm md:text-base">{campaign.website.domain}</p>
              </div>
            </div>
          </BlurFade>
        </div>
        <BlurFade delay={0.1} direction="up">
          <div className="flex items-center gap-3 ml-16 md:ml-0">
            <CampaignStatusToggle
              campaignId={campaign.id}
              status={campaign.status}
            />
            <DeleteCampaignButton
              campaignId={campaign.id}
              websiteId={websiteId}
              campaignName={campaign.name}
            />
          </div>
        </BlurFade>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          title="Impressions"
          value={impressions.toLocaleString()}
          iconSlot={<Eye className="h-3.5 w-3.5 text-sky-500" />}
          gradient="from-sky-500/10 to-sky-600/5"
          delay={0.15}
        />
        <StatCard
          title="Clicks"
          value={clicks.toLocaleString()}
          subtitle={`${ctr}% CTR`}
          iconSlot={<MousePointerClick className="h-3.5 w-3.5 text-amber-500" />}
          gradient="from-amber-500/10 to-amber-600/5"
          delay={0.2}
        />
        <StatCard
          title="Conversions"
          value={conversions.toLocaleString()}
          subtitle={`${cvr}% CVR`}
          iconSlot={<Target className="h-3.5 w-3.5 text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
          delay={0.25}
        />
        <StatCard
          title="Dismissals"
          value={dismissals.toLocaleString()}
          iconSlot={<XCircle className="h-3.5 w-3.5 text-rose-500" />}
          gradient="from-rose-500/10 to-rose-600/5"
          delay={0.3}
        />
        <StatCard
          title="Priority"
          value={
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-500/10 text-violet-600 border border-violet-500/20 text-lg px-3 py-1">
                {campaign.priority}
              </Badge>
              <span className="text-sm text-muted-foreground font-normal">/ 100</span>
            </div>
          }
          iconSlot={<Zap className="h-3.5 w-3.5 text-violet-500" />}
          gradient="from-violet-500/10 to-violet-600/5"
          delay={0.35}
        />
      </div>

      {/* Campaign Editor */}
      <GlassCard delay={0.4} gradient="from-violet-500/5 via-transparent to-sky-500/5" corners="all">
        <GlassCardHeader
          title="Campaign Settings"
          description="Edit your popup design, content, and trigger rules."
          icon={<Settings className="h-5 w-5 text-violet-500" />}
        />
        <GlassCardContent>
          <CampaignEditor
            campaignId={campaign.id}
            websiteId={websiteId}
            initialData={{
              name: campaign.name,
              popupType: campaign.popupType,
              content: campaign.content as unknown as PopupContent,
              triggerRules: campaign.triggerRules as unknown as CampaignData["triggerRules"],
              frequency: campaign.frequency,
              priority: campaign.priority,
            }}
          />
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
