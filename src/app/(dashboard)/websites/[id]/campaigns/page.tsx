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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Megaphone,
  MoreVertical,
  Eye,
  MousePointerClick,
  Target,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignStatusToggle } from "@/components/campaign/campaign-status-toggle";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const website = await db.website.findFirst({
    where: {
      id,
      userId: session?.user?.id,
    },
    include: {
      campaigns: {
        orderBy: { priority: "desc" },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      },
    },
  });

  if (!website) {
    notFound();
  }

  // Calculate stats per campaign
  const campaignsWithStats = await Promise.all(
    website.campaigns.map(async (campaign) => {
      const impressions = await db.event.count({
        where: {
          campaignId: campaign.id,
          eventType: "POPUP_IMPRESSION",
        },
      });
      const clicks = await db.event.count({
        where: {
          campaignId: campaign.id,
          eventType: "POPUP_CLICK",
        },
      });
      const conversions = await db.event.count({
        where: {
          campaignId: campaign.id,
          eventType: "POPUP_CONVERSION",
        },
      });

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
    ONCE_PER_SESSION: "Once/Session",
    ONCE_PER_DAY: "Once/Day",
    ONCE_PER_WEEK: "Once/Week",
    ONCE_EVER: "Once Ever",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/websites/${website.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Campaigns
          </h1>
          <p className="text-muted-foreground">{website.domain}</p>
        </div>
        <Button asChild>
          <Link href={`/websites/${website.id}/campaigns/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{website.campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" /> Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignsWithStats.reduce((sum, c) => sum + c.stats.impressions, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <MousePointerClick className="h-3 w-3" /> Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignsWithStats.reduce((sum, c) => sum + c.stats.clicks, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignsWithStats.reduce((sum, c) => sum + c.stats.conversions, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Manage your popup campaigns. Higher priority campaigns show first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaignsWithStats.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first popup campaign to start converting visitors.
              </p>
              <Button asChild>
                <Link href={`/websites/${website.id}/campaigns/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CVR</TableHead>
                  <TableHead className="text-right">Priority</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignsWithStats.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/websites/${website.id}/campaigns/${campaign.id}`}
                          className="font-medium hover:underline"
                        >
                          {campaign.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {frequencyLabels[campaign.frequency]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {popupTypeLabels[campaign.popupType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <CampaignStatusToggle
                        campaignId={campaign.id}
                        status={campaign.status}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.stats.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.stats.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.stats.cvr}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{campaign.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/websites/${website.id}/campaigns/${campaign.id}`}
                            >
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/websites/${website.id}/campaigns/${campaign.id}/analytics`}
                            >
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
