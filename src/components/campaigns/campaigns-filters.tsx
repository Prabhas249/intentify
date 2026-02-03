"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Calendar } from "lucide-react";

interface Website {
  id: string;
  domain: string;
}

interface CampaignsFiltersProps {
  websites: Website[];
  selectedWebsite: string;
  selectedStatus: string;
  selectedPeriod: string;
}

export function CampaignsFilters({
  websites,
  selectedWebsite,
  selectedStatus,
  selectedPeriod,
}: CampaignsFiltersProps) {
  const router = useRouter();

  function navigate(params: { website?: string; status?: string; period?: string }) {
    const searchParams = new URLSearchParams();
    const website = params.website ?? selectedWebsite;
    const status = params.status ?? selectedStatus;
    const period = params.period ?? selectedPeriod;

    if (website !== "all") {
      searchParams.set("website", website);
    }
    if (status !== "all") {
      searchParams.set("status", status);
    }
    searchParams.set("period", period);

    const queryString = searchParams.toString();
    router.push(`/campaigns${queryString ? `?${queryString}` : ""}`);
  }

  return (
    <>
      <Select
        value={selectedWebsite}
        onValueChange={(value) => navigate({ website: value })}
      >
        <SelectTrigger className="w-[180px] rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="All websites" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">All Websites</SelectItem>
          {websites.map((website) => (
            <SelectItem key={website.id} value={website.id}>
              {website.domain}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedStatus}
        onValueChange={(value) => navigate({ status: value })}
      >
        <SelectTrigger className="w-[140px] rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={selectedPeriod}
        onValueChange={(value) => navigate({ period: value })}
      >
        <SelectTrigger className="w-[140px] rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="24h">Last 24 hours</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
