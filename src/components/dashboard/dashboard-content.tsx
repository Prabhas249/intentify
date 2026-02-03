"use client";

import { Button } from "@/components/ui/button";
import {
  Globe, Users, Megaphone, TrendingUp, Plus, ArrowRight, Sparkles,
  LucideIcon, Activity, MousePointerClick, Eye, Clock, Zap,
  ChevronRight, BarChart3, X, Copy, IndianRupee
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { motion } from "motion/react";
import { PerformanceChart } from "./performance-chart";
import { CornerPlus } from "@/components/landing/ui/corner-plus";
import { DashboardFilters } from "./dashboard-filters";

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Users,
  Megaphone,
  TrendingUp,
};

const eventIconMap: Record<string, LucideIcon> = {
  Users,
  Eye,
  MousePointerClick,
  Zap,
  X,
  Copy,
  IndianRupee,
  Activity,
};

interface Stat {
  title: string;
  value: number | string;
  icon: string;
  href: string;
  gradient: string;
  iconColor: string;
  borderColor: string;
}

interface Website {
  id: string;
  domain: string;
}

interface RecentEvent {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
}

interface ChartDataPoint {
  name: string;
  visitors: number;
  impressions: number;
  conversions: number;
}

interface DashboardContentProps {
  userName: string;
  stats: Stat[];
  websiteCount: number;
  websites: Website[];
  selectedWebsiteId: string | null;
  period: string;
  recentEvents: RecentEvent[];
  chartData: ChartDataPoint[];
  conversionRate: string;
  isDemo?: boolean;
}

// Quick actions for dashboard
const quickActions = [
  { title: "Create Popup", description: "Design a new popup campaign", href: "/campaigns", icon: Megaphone },
  { title: "View Analytics", description: "See your performance data", href: "/analytics", icon: BarChart3 },
  { title: "Add Website", description: "Connect a new domain", href: "/websites/new", icon: Globe },
];

export function DashboardContent({ userName, stats, websiteCount, websites, selectedWebsiteId, period, recentEvents, chartData, conversionRate, isDemo = false }: DashboardContentProps) {
  return (
    <div className="space-y-10">
      {/* Header - matching landing page typography */}
      <BlurFade delay={0} direction="up">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter">
              Welcome back, {userName}!
            </h1>
            <p className="text-muted-foreground md:text-lg text-balance leading-relaxed max-w-xl">
              Here&apos;s what&apos;s happening with your popups today.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {websites.length > 0 && (
              <DashboardFilters
                websites={websites}
                selectedWebsiteId={selectedWebsiteId}
                period={period}
              />
            )}
            <Button asChild size="lg" className={cn(
              "rounded-full px-8 py-6 text-base font-medium",
              "bg-linear-to-b from-sky-500 to-sky-600",
              "shadow-[0px_1px_2px_0px_#00000016,0px_2px_4px_0px_#00000006,inset_0px_0px_1.5px_#0084D1,inset_0px_2.5px_0px_#ffffff16,inset_0px_0px_2.5px_#ffffff08]",
              "ring-2 ring-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
            )}>
              <Link href="/websites/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Website
              </Link>
            </Button>
          </div>
        </div>
      </BlurFade>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon];
          return (
            <BlurFade key={stat.title} delay={0.1 + index * 0.08} direction="up">
              <Link
                href={stat.href}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 block",
                  "hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
                  "hover:border-primary/30",
                  stat.borderColor
                )}
              >
                {/* Gradient background */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity duration-300 group-hover:opacity-70",
                  stat.gradient
                )} />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </span>
                    <motion.div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        "bg-background/80 backdrop-blur-sm border border-border/50",
                      )}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {Icon && <Icon className={cn("h-5 w-5", stat.iconColor)} />}
                    </motion.div>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-medium tracking-tighter">
                      {stat.value}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
                  </div>
                </div>
              </Link>
            </BlurFade>
          );
        })}
      </div>

      {/* Performance Chart */}
      <PerformanceChart hasData={websiteCount > 0} chartData={chartData} conversionRate={conversionRate} />

      {/* Two Column Layout: Recent Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2 columns */}
        <BlurFade delay={0.4} direction="up" className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm h-full shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)]">
            <CornerPlus position="top-left" className="text-border/50" />
            <CornerPlus position="top-right" className="text-border/50" />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent" />

            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
                    <Activity className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium tracking-tight">Recent Activity</h2>
                    <p className="text-sm text-muted-foreground">Latest events from your popups</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/analytics">
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {websiteCount === 0 || recentEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div
                      className="relative mb-6"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      {/* Animated rings */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-sky-500/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ width: 80, height: 80, margin: "auto" }}
                      />
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-violet-500/10 border border-sky-500/20">
                        <Activity className="h-7 w-7 text-sky-500" />
                      </div>
                    </motion.div>
                    <h3 className="text-lg font-medium tracking-tight mb-2">No activity yet</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
                      {websiteCount === 0
                        ? "Add a website and create your first popup to see real-time activity here."
                        : "No events recorded in this period. Create a popup campaign to start tracking."}
                    </p>
                  </div>
                ) : (
                  recentEvents.map((event, index) => {
                    const IconComponent = eventIconMap[event.icon] || Activity;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors group"
                      >
                        <div className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          event.type === "visitor" && "bg-emerald-500/10 text-emerald-500",
                          event.type === "impression" && "bg-sky-500/10 text-sky-500",
                          event.type === "click" && "bg-violet-500/10 text-violet-500",
                          event.type === "conversion" && "bg-amber-500/10 text-amber-500",
                          event.type === "dismiss" && "bg-slate-500/10 text-slate-500",
                        )}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.message}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Quick Actions - Takes 1 column */}
        <BlurFade delay={0.5} direction="up">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm h-full shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)]">
            <CornerPlus position="top-left" className="text-border/50" />
            <CornerPlus position="top-right" className="text-border/50" />
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent" />

            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <Zap className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-xl font-medium tracking-tight">Quick Actions</h2>
                  <p className="text-sm text-muted-foreground">Common tasks</p>
                </div>
              </div>

              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link
                      href={action.href}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50 group-hover:border-primary/30 transition-colors">
                        <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </BlurFade>
      </div>

      {/* Quick Start - Only show if no websites */}
      {websiteCount === 0 && (
        <BlurFade delay={0.6} direction="up">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)]">
            <CornerPlus position="all" className="text-border/50" />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-violet-500/5" />

            {/* Animated gradient orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: "1s" }} />

            <div className="relative p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(14, 165, 233, 0)",
                      "0 0 0 8px rgba(14, 165, 233, 0.1)",
                      "0 0 0 0 rgba(14, 165, 233, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-6 w-6 text-sky-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-medium tracking-tight">Get Started</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Add your first website to start tracking visitors
                  </p>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    step: 1,
                    title: "Add your website",
                    description: "Enter your domain to get a unique tracking script.",
                  },
                  {
                    step: 2,
                    title: "Install the script",
                    description: "Copy and paste one line of code into your website.",
                  },
                  {
                    step: 3,
                    title: "Create your first popup",
                    description: "Design a popup and set smart triggers based on visitor behavior.",
                  },
                ].map((item, index) => (
                  <BlurFade key={item.step} delay={0.7 + index * 0.1} direction="up">
                    <div className="flex gap-4 group">
                      <motion.div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-sky-600 text-white text-sm font-medium shadow-lg shadow-sky-500/25"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        {item.step}
                      </motion.div>
                      <div>
                        <h4 className="text-base font-medium tracking-tight group-hover:text-sky-500 transition-colors">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </BlurFade>
                ))}
              </div>

              <BlurFade delay={1} direction="up">
                <Button asChild size="lg" className={cn(
                  "mt-10 rounded-full px-8 py-6 text-base font-medium",
                  "bg-linear-to-b from-sky-500 to-sky-600",
                  "shadow-[0px_1px_2px_0px_#00000016,0px_2px_4px_0px_#00000006,inset_0px_0px_1.5px_#0084D1,inset_0px_2.5px_0px_#ffffff16,inset_0px_0px_2.5px_#ffffff08]",
                  "ring-2 ring-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
                )}>
                  <Link href="/websites/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Website
                  </Link>
                </Button>
              </BlurFade>
            </div>
          </div>
        </BlurFade>
      )}
    </div>
  );
}
