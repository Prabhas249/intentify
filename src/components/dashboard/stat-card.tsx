"use client";

import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { CornerPlus } from "@/components/landing/ui/corner-plus";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  iconSlot?: ReactNode;
  gradient?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  iconSlot,
  gradient = "from-sky-500/10 to-sky-600/5",
  delay = 0,
}: StatCardProps) {
  return (
    <BlurFade delay={delay} direction="up" className="h-full">
      <div className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 h-full min-h-[120px]",
        "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)]"
      )}>
        {/* Gradient background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />
        <CornerPlus position="top-right" className="text-border/30" />

        <div className="relative flex flex-col h-full">
          <div className="flex items-center gap-1.5 mb-2">
            {iconSlot}
            <span className="text-xs font-medium text-muted-foreground truncate">
              {title}
            </span>
          </div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="text-xs text-muted-foreground mt-auto pt-1 truncate min-h-[18px]">
            {subtitle || "\u00A0"}
          </div>
        </div>
      </div>
    </BlurFade>
  );
}
