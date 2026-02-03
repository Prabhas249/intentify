"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "@/lib/utils";
import {
  User,
  Globe,
  Clock,
  FileText,
  TrendingUp,
  Monitor,
  Smartphone,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Hash,
} from "lucide-react";

interface Visitor {
  id: string;
  visitorHash: string;
  visitCount: number;
  pagesViewed: string[];
  timeOnSiteSeconds: number;
  scrollDepth: number;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  intentScore: number;
  intentLevel: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  firstSeen: Date;
  lastSeen: Date;
  _count: {
    events: number;
  };
}

interface VisitorDetailProps {
  visitor: Visitor;
}

export function VisitorDetail({ visitor }: VisitorDetailProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="font-mono text-xs h-auto p-1 hover:bg-muted"
        >
          {visitor.visitorHash.slice(0, 12)}...
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Visitor Details
          </SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {visitor.visitorHash}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Intent Score */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Intent Score
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      visitor.intentScore >= 61
                        ? "bg-green-500"
                        : visitor.intentScore >= 31
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                    style={{ width: `${visitor.intentScore}%` }}
                  />
                </div>
              </div>
              <span className="text-lg font-bold">{visitor.intentScore}</span>
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
            </div>
          </div>

          <Separator />

          {/* Engagement Stats */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Engagement</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{visitor.visitCount}</div>
                <div className="text-xs text-muted-foreground">Visits</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{visitor.pagesViewed.length}</div>
                <div className="text-xs text-muted-foreground">Pages</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {formatDuration(visitor.timeOnSiteSeconds)}
                </div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{visitor.scrollDepth}%</div>
                <div className="text-xs text-muted-foreground">Scroll</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Attribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Attribution
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{visitor.utmSource || "Direct"}</span>
              </div>
              {visitor.utmMedium && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medium</span>
                  <span className="font-medium">{visitor.utmMedium}</span>
                </div>
              )}
              {visitor.utmCampaign && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign</span>
                  <span className="font-medium">{visitor.utmCampaign}</span>
                </div>
              )}
              {visitor.referrer && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referrer</span>
                  <span className="font-medium truncate max-w-[200px]">
                    {visitor.referrer}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Device Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              {visitor.device === "mobile" ? (
                <Smartphone className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
              Device
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{visitor.device || "Unknown"}</span>
              </div>
              {visitor.browser && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Browser</span>
                  <span className="font-medium capitalize">{visitor.browser}</span>
                </div>
              )}
              {visitor.os && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OS</span>
                  <span className="font-medium">{visitor.os}</span>
                </div>
              )}
              {visitor.country && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium">{visitor.country}</span>
                </div>
              )}
              {visitor.city && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City</span>
                  <span className="font-medium">{visitor.city}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Seen</span>
                <span className="font-medium">
                  {new Date(visitor.firstSeen).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Seen</span>
                <span className="font-medium">
                  {new Date(visitor.lastSeen).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Events</span>
                <span className="font-medium">{visitor._count.events}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pages Viewed */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pages Viewed ({visitor.pagesViewed.length})
            </h4>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {visitor.pagesViewed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pages recorded</p>
              ) : (
                visitor.pagesViewed.map((page, index) => (
                  <div
                    key={index}
                    className="text-xs font-mono p-2 bg-muted rounded flex items-center gap-2"
                  >
                    <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{page}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
