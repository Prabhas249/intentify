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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Plus,
  Eye,
  MousePointerClick,
  Target,
  Globe,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignStatusToggle } from "@/components/campaign/campaign-status-toggle";

export default async function AllCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ website?: string; status?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;

  // Get user's websites
  const websites = await db.website.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (websites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No websites yet</h2>
        <p className="text-muted-foreground mb-4">
          Add a website first to create campaigns.
        </p>
        <Button asChild>
          <Link href="/websites/new">Add Website</Link>
        </Button>
      </div>
    );
  }

  // Build where clause
  const where: Record<string, unknown> = {
    website: {
      userId: session.user.id,
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

  // Get stats for each campaign
  const campaignsWithStats = await Promise.all(
    campaigns.map(async (campaign) => {
      const [impressions, clicks, conversions] = await Promise.all([
        db.event.count({
          where: { campaignId: campaign.id, eventType: "POPUP_IMPRESSION" },
        }),
        db.event.count({
          where: { campaignId: campaign.id, eventType: "POPUP_CLICK" },
        }),
        db.event.count({
          where: { campaignId: campaign.id, eventType: "POPUP_CONVERSION" },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-2">
            <Megaphone className="h-7 w-7" />
            All Campaigns
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage popup campaigns across all your websites
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue={params.website || "all"}>
            <SelectTrigger className="w-[180px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All websites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Websites</SelectItem>
              {websites.map((website) => (
                <SelectItem key={website.id} value={website.id}>
                  {website.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue={params.status || "all"}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium leading-none text-muted-foreground">
              Total Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCampaigns} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" /> Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalConversions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium leading-none text-muted-foreground">
              Avg. CVR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {totalImpressions > 0
                ? ((totalConversions / totalImpressions) * 100).toFixed(1)
                : "0"}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaignsWithStats.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold tracking-tight mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first popup campaign to start converting visitors.
              </p>
              <Button asChild>
                <Link href={`/websites/${websites[0].id}/campaigns/new`}>
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
                  <TableHead>Website</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">CVR</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignsWithStats.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Link
                        href={`/websites/${campaign.websiteId}/campaigns/${campaign.id}`}
                        className="font-medium hover:underline"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Priority: {campaign.priority}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/websites/${campaign.websiteId}`}
                        className="text-sm hover:underline"
                      >
                        {campaign.website.domain}
                      </Link>
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
                      {campaign.stats.conversions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className={
                          parseFloat(campaign.stats.cvr) >= 5
                            ? "bg-green-100 text-green-700"
                            : parseFloat(campaign.stats.cvr) >= 2
                            ? "bg-yellow-100 text-yellow-700"
                            : ""
                        }
                      >
                        {campaign.stats.cvr}%
                      </Badge>
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
                              href={`/websites/${campaign.websiteId}/campaigns/${campaign.id}`}
                            >
                              Edit Campaign
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/websites/${campaign.websiteId}/campaigns`}>
                              View Website Campaigns
                            </Link>
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
