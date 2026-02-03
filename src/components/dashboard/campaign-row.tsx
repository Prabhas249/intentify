"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignStatusToggle } from "@/components/campaign/campaign-status-toggle";
import { Megaphone, Globe, Zap, MoreVertical, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CampaignRowProps {
  campaign: {
    id: string;
    name: string;
    websiteId: string;
    popupType: string;
    status: string;
    priority: number;
    website: {
      domain: string;
    };
    stats: {
      impressions: number;
      conversions: number;
      cvr: string;
    };
  };
  popupTypeLabels: Record<string, string>;
  popupTypeColors: Record<string, string>;
}

export function CampaignRow({ campaign, popupTypeLabels, popupTypeColors }: CampaignRowProps) {
  return (
    <Link
      href={`/websites/${campaign.websiteId}/campaigns/${campaign.id}`}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background/50 transition-all duration-300",
        "hover:bg-card hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5"
      )}
    >
      {/* Campaign Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/20 group-hover:scale-105 transition-transform">
        <Megaphone className="h-5 w-5 text-violet-500" />
      </div>

      {/* Campaign Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium tracking-tight truncate group-hover:text-violet-500 transition-colors">
            {campaign.name}
          </h4>
          <Badge
            variant="outline"
            className={cn("text-xs px-2 py-0 border", popupTypeColors[campaign.popupType])}
          >
            {popupTypeLabels[campaign.popupType]}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {campaign.website.domain}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Priority {campaign.priority}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="font-medium">{campaign.stats.impressions.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Impressions</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{campaign.stats.conversions.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Conversions</div>
        </div>
        <div className="text-center">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              parseFloat(campaign.stats.cvr) >= 5
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : parseFloat(campaign.stats.cvr) >= 2
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                : "bg-muted"
            )}
          >
            {campaign.stats.cvr}% CVR
          </Badge>
        </div>
      </div>

      {/* Status Toggle */}
      <div onClick={(e) => e.preventDefault()}>
        <CampaignStatusToggle campaignId={campaign.id} status={campaign.status} />
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem asChild>
            <Link href={`/websites/${campaign.websiteId}/campaigns/${campaign.id}`}>
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

      {/* Arrow */}
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </Link>
  );
}
