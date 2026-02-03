"use client";

import { useRef, useState, useEffect, memo, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { Check, Sparkles, Eye, MousePointer, Copy, CheckCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/landing/ui/button";
import { useMobile } from "@/hooks/use-mobile";

type AnimationState = "idle" | "rule1" | "rule2" | "rule3" | "match" | "popup";

// Match terminal animation timing
const SEQUENCE: Array<{ state: AnimationState; delay: number }> = [
    { state: "rule1", delay: 400 },
    { state: "rule2", delay: 800 },
    { state: "rule3", delay: 800 },
    { state: "match", delay: 900 },
    { state: "popup", delay: 700 },
];

// Same spring as terminal animation
const springTransition = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
};

const rulesCardVariants = {
    idle: { x: "0%", y: "0%" },
    active: (isMobile: boolean) => ({
        x: isMobile ? "-5%" : "-15%",
        y: isMobile ? "-10%" : "-20%",
    }),
};

const popupVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1 },
};

export function RuleBuilderBlock() {
    const blockRef = useRef<HTMLDivElement>(null);
    const blockInView = useInView(blockRef, { amount: 0.6, margin: "40px 0px -40px 0px", once: true });
    const [animState, setAnimState] = useState<AnimationState>("idle");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const sequenceIndexRef = useRef(0);
    const hasPlayed = useRef(false);
    const isMobile = useMobile();

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (!blockInView || hasPlayed.current) {
            return;
        }

        hasPlayed.current = true;
        sequenceIndexRef.current = 0;

        const runSequence = () => {
            if (sequenceIndexRef.current >= SEQUENCE.length) {
                return;
            }

            const { state, delay } = SEQUENCE[sequenceIndexRef.current];
            sequenceIndexRef.current += 1;

            timerRef.current = setTimeout(() => {
                setAnimState(state);
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
    }, [blockInView]);

    const rulesVisible = animState !== "idle";
    const rule1Checked = ["rule1", "rule2", "rule3", "match", "popup"].includes(animState);
    const rule2Checked = ["rule2", "rule3", "match", "popup"].includes(animState);
    const rule3Checked = ["rule3", "match", "popup"].includes(animState);
    const showMatch = ["match", "popup"].includes(animState);
    const showPopup = animState === "popup";

    const rulesAnimation = useMemo(
        () => (showPopup ? rulesCardVariants.active(isMobile) : rulesCardVariants.idle),
        [showPopup, isMobile]
    );

    return (
        <div
            ref={blockRef}
            className="relative min-h-[480px] md:min-h-[550px] flex items-center justify-center p-4 md:p-8 overflow-visible"
        >
            {/* Rules Card - shifts left when popup appears */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={rulesVisible ? { opacity: 1, ...rulesAnimation } : { opacity: 0, y: 20 }}
                transition={springTransition}
                className="relative w-full max-w-sm"
            >
                <RulesCard
                    rule1Checked={rule1Checked}
                    rule2Checked={rule2Checked}
                    rule3Checked={rule3Checked}
                    showMatch={showMatch}
                />
            </motion.div>

            {/* Popup Card - appears on the right side */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        variants={popupVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ ...springTransition, delay: 0.15 }}
                        className="absolute right-4 md:right-8 lg:right-12 bottom-12 md:bottom-16 w-full max-w-[280px] md:max-w-xs z-20"
                    >
                        <PopupPreview />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const RulesCard = memo(function RulesCard({
    rule1Checked,
    rule2Checked,
    rule3Checked,
    showMatch,
}: {
    rule1Checked: boolean;
    rule2Checked: boolean;
    rule3Checked: boolean;
    showMatch: boolean;
}) {
    return (
        <div className="w-full bg-card rounded-xl border border-border overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-muted px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground ml-2">Targeting Rules</span>
                </div>
                <AnimatePresence>
                    {showMatch && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="flex items-center gap-1.5 bg-[#FE4A23] text-white px-2.5 py-1 rounded-full"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span className="text-xs font-semibold">Match!</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Rules List */}
            <div className="bg-background p-4 space-y-2">
                <RuleRow
                    icon={<XIcon />}
                    label="Source"
                    value="X (Twitter)"
                    checked={rule1Checked}
                />
                <AndConnector visible={rule1Checked} />
                <RuleRow
                    icon={<Eye className="w-4 h-4" />}
                    label="Visits"
                    value="2+"
                    checked={rule2Checked}
                />
                <AndConnector visible={rule2Checked} />
                <RuleRow
                    icon={<MousePointer className="w-4 h-4" />}
                    label="Scroll"
                    value="75%+"
                    checked={rule3Checked}
                />
            </div>
        </div>
    );
});

function XIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function AndConnector({ visible }: { visible: boolean }) {
    return (
        <div className="flex items-center justify-center py-0.5">
            <div className="flex items-center gap-2">
                <div className={cn(
                    "h-3 w-px transition-colors duration-300",
                    visible ? "bg-emerald-500" : "bg-border"
                )} />
                <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300",
                    visible ? "text-emerald-600" : "text-muted-foreground/40"
                )}>
                    and
                </span>
                <div className={cn(
                    "h-3 w-px transition-colors duration-300",
                    visible ? "bg-emerald-500" : "bg-border"
                )} />
            </div>
        </div>
    );
}

function RuleRow({
    icon,
    label,
    value,
    checked,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    checked: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
                checked
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-muted/30 border-border/50"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-300",
                    checked ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-muted-foreground"
                )}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                </div>
            </div>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: checked ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
            >
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </motion.div>
        </div>
    );
}

const PopupPreview = memo(function PopupPreview() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-card rounded-2xl border border-border overflow-hidden shadow-2xl relative">
            {/* Close button */}
            <button className="absolute top-3 right-3 w-6 h-6 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center z-10 transition-colors">
                <X className="w-3.5 h-3.5 text-foreground/60" />
            </button>

            {/* Popup Body */}
            <div className="p-5 space-y-4">
                {/* Header with X icon */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                        <svg className="w-4 h-4 text-background" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-foreground">X visitor exclusive</p>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <p className="text-[15px] text-foreground leading-relaxed">
                        You've visited a few times and scrolled through most of the page.
                    </p>
                    <p className="text-[15px] text-foreground leading-relaxed">
                        Looks like you're interested — here's <span className="font-bold text-[#FE4A23]">20% off</span> to help you decide.
                    </p>
                </div>

                {/* Coupon Code */}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border">
                    <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Your code</p>
                        <p className="text-lg font-mono font-bold tracking-widest text-foreground">XFAM20</p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-10 px-4 rounded-lg"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <CheckCheck className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                {/* CTA */}
                <Button className="w-full h-11 bg-[#FE4A23] hover:bg-[#E5421F] text-white font-semibold rounded-xl">
                    Get Access
                </Button>
            </div>
        </div>
    );
});
