import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  Target,
  XCircle,
  Megaphone,
  Settings,
  BarChart2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { CampaignEditor } from "@/components/campaign/campaign-editor";
import { CampaignStatusToggle } from "@/components/campaign/campaign-status-toggle";
import { DeleteCampaignButton } from "@/components/campaign/delete-campaign-button";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string; campaignId: string }>;
}) {
  const { id: websiteId, campaignId } = await params;
  const session = await auth();

  const campaign = await db.campaign.findFirst({
    where: {
      id: campaignId,
      websiteId,
      website: {
        userId: session?.user?.id,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/websites/${websiteId}/campaigns`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            {campaign.name}
          </h1>
          <p className="text-muted-foreground">
            {campaign.website.domain} &middot;{" "}
            {popupTypeLabels[campaign.popupType]} &middot;{" "}
            {frequencyLabels[campaign.frequency]}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" /> Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{impressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <MousePointerClick className="h-3 w-3" /> Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">CTR: {ctr}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">CVR: {cvr}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Dismissals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dismissals.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {campaign.priority}
              </Badge>
              <span className="text-sm text-muted-foreground font-normal">
                / 10
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Campaign Settings
          </CardTitle>
          <CardDescription>
            Edit your popup design, content, and trigger rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignEditor
            campaignId={campaign.id}
            websiteId={websiteId}
            initialData={{
              name: campaign.name,
              popupType: campaign.popupType,
              content: campaign.content as any,
              triggerRules: campaign.triggerRules as any,
              frequency: campaign.frequency,
              priority: campaign.priority,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
