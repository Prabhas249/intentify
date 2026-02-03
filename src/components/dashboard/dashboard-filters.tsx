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

interface DashboardFiltersProps {
  websites: Website[];
  selectedWebsiteId: string | null;
  period: string;
}

export function DashboardFilters({
  websites,
  selectedWebsiteId,
  period,
}: DashboardFiltersProps) {
  const router = useRouter();

  function handleWebsiteChange(websiteId: string) {
    const params = new URLSearchParams();
    if (websiteId !== "all") {
      params.set("website", websiteId);
    }
    params.set("period", period);
    router.push(`/dashboard?${params.toString()}`);
  }

  function handlePeriodChange(newPeriod: string) {
    const params = new URLSearchParams();
    if (selectedWebsiteId) {
      params.set("website", selectedWebsiteId);
    }
    params.set("period", newPeriod);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        value={selectedWebsiteId || "all"}
        onValueChange={handleWebsiteChange}
      >
        <SelectTrigger className="min-w-[160px] max-w-[220px] rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
          <Globe className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="All websites" className="truncate" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">All Websites</SelectItem>
          {websites.map((website) => (
            <SelectItem key={website.id} value={website.id} className="max-w-[260px]">
              <span className="truncate">{website.domain}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[130px] rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
          <Calendar className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="24h">24 hours</SelectItem>
          <SelectItem value="7d">7 days</SelectItem>
          <SelectItem value="30d">30 days</SelectItem>
          <SelectItem value="90d">90 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
