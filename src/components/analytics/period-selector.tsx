"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodSelectorProps {
  value: string;
  websiteId: string;
}

export function PeriodSelector({ value, websiteId }: PeriodSelectorProps) {
  const router = useRouter();

  function handleChange(period: string) {
    router.push(`/analytics?website=${websiteId}&period=${period}`);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-[130px] rounded-xl border-border/50 bg-card/50 backdrop-blur-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="24h">24 hours</SelectItem>
        <SelectItem value="7d">7 days</SelectItem>
        <SelectItem value="30d">30 days</SelectItem>
        <SelectItem value="90d">90 days</SelectItem>
      </SelectContent>
    </Select>
  );
}
