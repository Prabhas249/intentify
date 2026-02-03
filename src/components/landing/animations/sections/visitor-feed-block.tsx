"use client";

import { useRef, useState, useEffect, memo } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { Clock, MousePointer, Eye, MapPin } from "lucide-react";

type Visitor = {
    id: number;
    status: string;
    source: string;
    location: string;
    intent: number;
    intentLevel: string;
    visits: number;
    timeOnSite: string;
    scrollDepth: number;
    currentPage: string;
    lastVisit?: string;
};

const visitors: Visitor[] = [
    {
        id: 1,
        status: "new",
        source: "Instagram",
        location: "Mumbai",
        intent: 78,
        intentLevel: "High",
        visits: 1,
        timeOnSite: "2m 34s",
        scrollDepth: 68,
        currentPage: "/products",
    },
    {
        id: 2,
        status: "returning",
        source: "Direct",
        location: "Delhi",
        intent: 92,
        intentLevel: "High",
        visits: 5,
        timeOnSite: "8m 12s",
        scrollDepth: 95,
        currentPage: "/pricing",
        lastVisit: "3 days ago",
    },
    {
        id: 3,
        status: "returning",
        source: "Google",
        location: "Bangalore",
        intent: 45,
        intentLevel: "Medium",
        visits: 2,
        timeOnSite: "1m 45s",
        scrollDepth: 42,
        currentPage: "/about",
        lastVisit: "12 days ago",
    },
    {
        id: 4,
        status: "new",
        source: "Facebook",
        location: "Pune",
        intent: 34,
        intentLevel: "Medium",
        visits: 1,
        timeOnSite: "0m 52s",
        scrollDepth: 25,
        currentPage: "/home",
    },
];

const SEQUENCE = [
    { action: "show1", delay: 400 },
    { action: "show2", delay: 600 },
    { action: "show3", delay: 600 },
    { action: "show4", delay: 600 },
    { action: "highlight", delay: 800 },
] as const;

// Softer spring like terminal animation
const springTransition = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
};

export function VisitorFeedBlock() {
    const feedRef = useRef<HTMLDivElement>(null);
    const feedInView = useInView(feedRef, { amount: 0.5, margin: "40px 0px -40px 0px", once: true });
    const [visibleCount, setVisibleCount] = useState(0);
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const sequenceIndexRef = useRef(0);
    const hasPlayed = useRef(false);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (!feedInView || hasPlayed.current) {
            return;
        }

        hasPlayed.current = true;
        sequenceIndexRef.current = 0;

        const runSequence = () => {
            if (sequenceIndexRef.current >= SEQUENCE.length) {
                return;
            }

            const { action, delay } = SEQUENCE[sequenceIndexRef.current];
            sequenceIndexRef.current += 1;

            timerRef.current = setTimeout(() => {
                if (action === "show1") setVisibleCount(1);
                else if (action === "show2") setVisibleCount(2);
                else if (action === "show3") setVisibleCount(3);
                else if (action === "show4") setVisibleCount(4);
                else if (action === "highlight") setHighlightedId(2);

                if (sequenceIndexRef.current < SEQUENCE.length) {
                    runSequence();
                }
            }, delay);
        };

        runSequence();

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [feedInView]);

    return (
        <div
            ref={feedRef}
            className="relative min-h-[520px] flex items-center justify-center p-4 md:p-8 overflow-visible"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={feedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={springTransition}
                className="relative w-full max-w-xl"
            >
                <VisitorFeed
                    visitors={visitors}
                    visibleCount={visibleCount}
                    highlightedId={highlightedId}
                />
            </motion.div>
        </div>
    );
}

const VisitorFeed = memo(function VisitorFeed({
    visitors,
    visibleCount,
    highlightedId,
}: {
    visitors: Visitor[];
    visibleCount: number;
    highlightedId: number | null;
}) {
    return (
        <div className="w-full bg-card rounded-xl border border-border relative overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-muted px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground ml-2">Live Visitors</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-emerald-500 font-medium">Live</span>
                </div>
            </div>

            {/* Visitor List */}
            <div className="bg-background p-3 md:p-4 space-y-2.5 min-h-[400px]">
                <AnimatePresence initial={false}>
                    {visitors.slice(0, visibleCount).map((visitor) => (
                        <motion.div
                            key={visitor.id}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 24,
                            }}
                            className={cn(
                                "p-3.5 rounded-lg border",
                                "transition-all duration-300 ease-out",
                                highlightedId === visitor.id
                                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
                                    : "bg-muted/30 border-border/50"
                            )}
                        >
                            {/* Top Row: Status + Intent */}
                            <div className="flex items-center justify-between gap-3 mb-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div
                                        className={cn(
                                            "w-2 h-2 rounded-full shrink-0",
                                            visitor.intentLevel === "High" ? "bg-emerald-500" : "bg-amber-500"
                                        )}
                                    />
                                    <span className="text-sm font-semibold text-foreground tracking-tight">
                                        {visitor.status === "new" ? "New visitor" : `Returning · ${visitor.visits}${visitor.visits === 1 ? 'st' : visitor.visits === 2 ? 'nd' : visitor.visits === 3 ? 'rd' : 'th'} visit`}
                                    </span>
                                    {visitor.lastVisit && (
                                        <span className="text-xs text-muted-foreground hidden sm:inline">
                                            · {visitor.lastVisit}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        "text-xs font-bold px-2.5 py-1 rounded-full shrink-0 tabular-nums",
                                        visitor.intentLevel === "High"
                                            ? "bg-emerald-500/20 text-emerald-600"
                                            : "bg-amber-500/20 text-amber-600"
                                    )}
                                >
                                    {visitor.intent}
                                </div>
                            </div>

                            {/* Middle Row: Source + Location + Page */}
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2.5 text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">{visitor.source}</span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {visitor.location}
                                </span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    <span className="font-mono text-foreground/80">{visitor.currentPage}</span>
                                </span>
                            </div>

                            {/* Bottom Row: Stats */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    <span className="tabular-nums">{visitor.timeOnSite}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MousePointer className="w-3 h-3" />
                                    <span className="tabular-nums">{visitor.scrollDepth}%</span>
                                    <span className="hidden sm:inline">scrolled</span>
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {visibleCount === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-[360px] text-muted-foreground text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-muted-foreground/50 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/50"></span>
                            </span>
                            Waiting for visitors...
                        </span>
                    </motion.div>
                )}
            </div>
        </div>
    );
});
