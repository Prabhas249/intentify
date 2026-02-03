"use client";

import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { CornerPlus } from "@/components/landing/ui/corner-plus";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  gradient?: string;
  corners?: "top" | "all" | "none";
}

export function GlassCard({
  children,
  className,
  delay = 0,
  gradient = "from-sky-500/5 via-transparent to-transparent",
  corners = "top",
}: GlassCardProps) {
  return (
    <BlurFade delay={delay} direction="up">
      <div className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
        "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)]",
        className
      )}>
        {/* Gradient background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

        {/* Corner decorations */}
        {corners === "top" && (
          <>
            <CornerPlus position="top-left" className="text-border/50" />
            <CornerPlus position="top-right" className="text-border/50" />
          </>
        )}
        {corners === "all" && <CornerPlus position="all" className="text-border/50" />}

        <div className="relative">{children}</div>
      </div>
    </BlurFade>
  );
}

interface GlassCardHeaderProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode; // Optional icon to display before title
  children?: ReactNode; // For action buttons in header
}

export function GlassCardHeader({ title, description, icon, children }: GlassCardHeaderProps) {
  return (
    <div className="flex items-start justify-between p-6 pb-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/20">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-medium tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function GlassCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-6 pt-0", className)}>{children}</div>
  );
}
