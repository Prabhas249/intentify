"use client";

import { useRouter, usePathname } from "next/navigation";
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

interface WebsiteSelectorProps {
  websites: Website[];
  selectedId: string;
  period?: string;
  basePath?: string;
  showPeriod?: boolean;
}

export function WebsiteSelector({
  websites,
  selectedId,
  period = "7d",
  basePath,
  showPeriod = true,
}: WebsiteSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const targetPath = basePath || pathname;

  function handleWebsiteChange(websiteId: string) {
    const params = new URLSearchParams();
    params.set("website", websiteId);
    params.set("period", period);
    router.push(`${targetPath}?${params.toString()}`);
  }

  function handlePeriodChange(newPeriod: string) {
    const params = new URLSearchParams();
    params.set("website", selectedId);
    params.set("period", newPeriod);
    router.push(`${targetPath}?${params.toString()}`);
  }

  return (
    <>
      <Select value={selectedId} onValueChange={handleWebsiteChange}>
        <SelectTrigger className="min-w-[180px] max-w-[240px] rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
          <Globe className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Select website" className="truncate" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {websites.map((website) => (
            <SelectItem key={website.id} value={website.id} className="max-w-[280px]">
              <span className="truncate">{website.domain}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showPeriod && (
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[150px] rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
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
      )}
    </>
  );
}
