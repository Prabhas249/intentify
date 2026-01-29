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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { WebsiteSelector } from "@/components/analytics/website-selector";
import { VisitorDetail } from "@/components/analytics/visitor-detail";

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
  }>;
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
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold tracking-tight mb-2">No websites yet</h2>
        <p className="text-muted-foreground mb-4">
          Add a website to start tracking visitors.
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
  const currentPage = parseInt(params.page || "1");
  const intentFilter = params.intent || "all";
  const sourceFilter = params.source || "all";
  const searchQuery = params.search || "";

  // Build where clause
  const where: Record<string, unknown> = {
    websiteId: selectedWebsiteId,
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
    // Get unique sources for filter
    db.visitor.groupBy({
      by: ["utmSource"],
      where: { websiteId: selectedWebsiteId },
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Stats
  const stats = await db.visitor.aggregate({
    where: { websiteId: selectedWebsiteId },
    _avg: { intentScore: true, visitCount: true, timeOnSiteSeconds: true },
    _count: true,
  });

  const highIntentCount = await db.visitor.count({
    where: { websiteId: selectedWebsiteId, intentLevel: "HIGH" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7" />
            Visitors
          </h1>
          <p className="text-xl text-muted-foreground">
            View and analyze your website visitors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WebsiteSelector
            websites={websites}
            selectedId={selectedWebsiteId}
            period="7d"
          />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Total Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats._count.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> High Intent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{highIntentCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats._count > 0 ? ((highIntentCount / stats._count) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Avg. Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats._avg.visitCount?.toFixed(1) || "0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Avg. Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {formatDuration(stats._avg.timeOnSiteSeconds || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by visitor ID, source..."
                defaultValue={searchQuery}
                className="pl-9"
              />
            </div>
            <Select defaultValue={intentFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intent</SelectItem>
                <SelectItem value="high">High Intent</SelectItem>
                <SelectItem value="medium">Medium Intent</SelectItem>
                <SelectItem value="low">Low Intent</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={sourceFilter}>
              <SelectTrigger className="w-[150px]">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                {sources
                  .filter((s) => s.utmSource)
                  .map((source) => (
                    <SelectItem key={source.utmSource} value={source.utmSource!}>
                      {source.utmSource} ({source._count})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Visitors</CardTitle>
          <CardDescription>
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount.toLocaleString()} visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor ID</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Device / OS</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead className="text-right">Scroll</TableHead>
                <TableHead className="text-right">Time</TableHead>
                <TableHead className="text-right">Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-12">
                    No visitors found. Install the tracking script to start collecting data.
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell>
                      <VisitorDetail visitor={visitor} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          visitor.intentLevel === "HIGH"
                            ? "border-green-500 text-green-700 bg-green-50"
                            : visitor.intentLevel === "MEDIUM"
                            ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                            : "border-gray-400 text-gray-600 bg-gray-50"
                        }
                      >
                        {visitor.intentLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full ${
                              visitor.intentScore >= 61
                                ? "bg-green-500"
                                : visitor.intentScore >= 31
                                ? "bg-yellow-500"
                                : "bg-gray-400"
                            }`}
                            style={{ width: `${visitor.intentScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          {visitor.intentScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {visitor.utmSource || "Direct"}
                      </span>
                      {visitor.utmMedium && (
                        <span className="text-xs text-muted-foreground ml-1">
                          / {visitor.utmMedium}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {visitor.device || "-"}
                      {visitor.os && (
                        <span className="text-muted-foreground"> / {visitor.os}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {visitor.country || "-"}
                      {visitor.city && (
                        <span className="text-muted-foreground">, {visitor.city}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {visitor.visitCount}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {visitor.scrollDepth}%
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDuration(visitor.timeOnSiteSeconds)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {formatTimeAgo(visitor.lastSeen)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  asChild
                >
                  <Link
                    href={`/visitors?website=${selectedWebsiteId}&page=${currentPage - 1}&intent=${intentFilter}&source=${sourceFilter}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  asChild
                >
                  <Link
                    href={`/visitors?website=${selectedWebsiteId}&page=${currentPage + 1}&intent=${intentFilter}&source=${sourceFilter}`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
