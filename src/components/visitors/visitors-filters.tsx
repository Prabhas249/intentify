"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Globe } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface Source {
  utmSource: string | null;
  _count: number;
}

interface VisitorsFiltersProps {
  websiteId: string;
  intentFilter: string;
  sourceFilter: string;
  searchQuery: string;
  sources: Source[];
  period: string;
}

export function VisitorsFilters({
  websiteId,
  intentFilter,
  sourceFilter,
  searchQuery,
  sources,
  period,
}: VisitorsFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchQuery);

  const navigate = useCallback(
    (params: { intent?: string; source?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      searchParams.set("website", websiteId);
      searchParams.set("page", "1"); // Reset to first page on filter change
      searchParams.set("intent", params.intent ?? intentFilter);
      searchParams.set("source", params.source ?? sourceFilter);
      searchParams.set("period", period);
      if (params.search !== undefined ? params.search : search) {
        searchParams.set("search", params.search !== undefined ? params.search : search);
      }
      router.push(`/visitors?${searchParams.toString()}`);
    },
    [router, websiteId, intentFilter, sourceFilter, search, period]
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    navigate({ search: value });
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by visitor ID, source..."
          value={search}
          onChange={handleSearchChange}
          className="pl-9 rounded-xl border-border/50 bg-background/50"
        />
      </div>
      <Select value={intentFilter} onValueChange={(value) => navigate({ intent: value })}>
        <SelectTrigger className="w-[150px] rounded-xl border-border/50 bg-background/50">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Intent" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">All Intent</SelectItem>
          <SelectItem value="high">High Intent</SelectItem>
          <SelectItem value="medium">Medium Intent</SelectItem>
          <SelectItem value="low">Low Intent</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sourceFilter} onValueChange={(value) => navigate({ source: value })}>
        <SelectTrigger className="w-[150px] rounded-xl border-border/50 bg-background/50">
          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
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
  );
}
