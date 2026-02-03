"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface PeriodSelectorProps {
  period: string;
}

export function PeriodSelector({ period }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(newPeriod: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", newPeriod);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={period} onValueChange={handleChange}>
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
  );
}
