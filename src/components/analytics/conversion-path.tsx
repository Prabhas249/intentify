"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Clock,
  FileText,
  Megaphone,
  MousePointerClick,
  Target,
  X,
  Eye,
} from "lucide-react";

interface ConversionStep {
  type: string;
  page: string | null;
  campaignName: string | null;
  timestamp: string;
}

interface ConversionPathData {
  visitorHash: string;
  source: string | null;
  steps: ConversionStep[];
}

interface PathPattern {
  pattern: string;
  count: number;
  steps: string[];
}

interface ConversionPathViewProps {
  paths: ConversionPathData[];
  patterns: PathPattern[];
}

const EVENT_LABELS: Record<string, string> = {
  PAGE_VIEW: "Page View",
  POPUP_IMPRESSION: "Popup Shown",
  POPUP_CLICK: "Popup Click",
  POPUP_CONVERSION: "Conversion",
  POPUP_DISMISS: "Dismissed",
  LEAD_CAPTURED: "Lead Captured",
};

const EVENT_COLORS: Record<string, string> = {
  PAGE_VIEW: "bg-blue-500",
  POPUP_IMPRESSION: "bg-amber-500",
  POPUP_CLICK: "bg-orange-500",
  POPUP_CONVERSION: "bg-green-500",
  POPUP_DISMISS: "bg-gray-400",
  LEAD_CAPTURED: "bg-purple-500",
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  PAGE_VIEW: <FileText className="h-3 w-3" />,
  POPUP_IMPRESSION: <Eye className="h-3 w-3" />,
  POPUP_CLICK: <MousePointerClick className="h-3 w-3" />,
  POPUP_CONVERSION: <Target className="h-3 w-3" />,
  POPUP_DISMISS: <X className="h-3 w-3" />,
  LEAD_CAPTURED: <Megaphone className="h-3 w-3" />,
};

function formatTimeDelta(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function ConversionPathView({
  paths,
  patterns,
}: ConversionPathViewProps) {
  if (paths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No conversions yet. Conversion paths will appear once visitors start
          converting through your popups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Most Common Patterns */}
      {patterns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Most Common Paths</h4>
          <div className="space-y-2">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-muted rounded-lg overflow-x-auto"
              >
                <Badge variant="secondary" className="shrink-0">
                  {pattern.count}x
                </Badge>
                <div className="flex items-center gap-1 flex-wrap">
                  {pattern.steps.map((step, stepIndex) => (
                    <span key={stepIndex} className="flex items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white ${
                          EVENT_COLORS[step] || "bg-gray-500"
                        }`}
                      >
                        {EVENT_ICONS[step]}
                        {EVENT_LABELS[step] || step}
                      </span>
                      {stepIndex < pattern.steps.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Journeys */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">
          Individual Journeys ({paths.length})
        </h4>
        <Accordion type="single" collapsible className="space-y-2">
          {paths.map((path, index) => (
            <AccordionItem
              key={index}
              value={`path-${index}`}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="text-sm hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {path.visitorHash.slice(0, 10)}...
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {path.source || "Direct"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {path.steps.length} steps
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="relative pl-6 py-2 space-y-0">
                  {/* Vertical line */}
                  <div className="absolute left-[9px] top-4 bottom-4 w-px bg-border" />

                  {path.steps.map((step, stepIndex) => {
                    const prevTime =
                      stepIndex > 0
                        ? new Date(path.steps[stepIndex - 1].timestamp).getTime()
                        : null;
                    const currTime = new Date(step.timestamp).getTime();
                    const delta = prevTime ? currTime - prevTime : null;

                    return (
                      <div key={stepIndex} className="relative flex gap-3 pb-4">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[15px] top-1 h-3 w-3 rounded-full border-2 border-background ${
                            EVENT_COLORS[step.type] || "bg-gray-500"
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">
                              {EVENT_LABELS[step.type] || step.type}
                            </span>
                            {delta !== null && delta > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                +{formatTimeDelta(delta)}
                              </span>
                            )}
                          </div>
                          {step.page && (
                            <p className="text-xs font-mono text-muted-foreground truncate">
                              {step.page}
                            </p>
                          )}
                          {step.campaignName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Megaphone className="h-3 w-3" />
                              {step.campaignName}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
