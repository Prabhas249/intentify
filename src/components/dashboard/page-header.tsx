"use client";

import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  iconSlot?: ReactNode;
  badge?: string;
  children?: ReactNode; // For action buttons
  className?: string;
}

export function PageHeader({
  title,
  description,
  iconSlot,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <BlurFade delay={0} direction="up">
      <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
        <div className="space-y-2">
          {badge && (
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {badge}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter flex items-center gap-3">
            {iconSlot}
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground md:text-lg text-balance leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 flex-wrap">
            {children}
          </div>
        )}
      </div>
    </BlurFade>
  );
}
