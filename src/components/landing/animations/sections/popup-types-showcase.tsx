"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import {
    Layers,
    PanelRight,
    Bell,
    MessageCircle,
    Smartphone,
    Expand,
    Globe,
    ArrowRight,
    Zap,
} from "lucide-react";

// 6 popup types with matching themes and full messages
const popupTypes = [
    {
        id: 1,
        type: "MODAL",
        label: "Modal",
        icon: Layers,
        theme: { bg: "#ffffff", text: "#0f172a", accent: "#6366f1", ring: "ring-slate-300" },
        headline: "Welcome back for your",
        dynamic: "3rd",
        suffix: "visit!",
        subtext: "Your saved progress is waiting.",
        cta: "Continue Setup",
    },
    {
        id: 2,
        type: "SLIDE_IN",
        label: "Slide-in",
        icon: PanelRight,
        theme: { bg: "#0f172a", text: "#f8fafc", accent: "#22c55e", ring: "ring-slate-600" },
        headline: "You've viewed pricing",
        dynamic: "3 times",
        suffix: "now",
        subtext: "Ready to start? Here's 20% off.",
        cta: "Claim Discount",
    },
    {
        id: 3,
        type: "BANNER",
        label: "Banner",
        icon: Bell,
        theme: { bg: "#ea580c", text: "#ffffff", accent: "#fefce8", ring: "ring-orange-500" },
        headline: "🎉 Launch Sale —",
        dynamic: "50% off",
        suffix: "all plans",
        subtext: "",
        cta: "Claim Now",
    },
    {
        id: 4,
        type: "FLOATING",
        label: "Floating",
        icon: MessageCircle,
        theme: { bg: "#0f172a", text: "#f8fafc", accent: "#8b5cf6", ring: "ring-violet-500" },
        badge: "X Visitor",
        headline: "You came from X",
        dynamic: "XFAM20",
        suffix: "",
        subtext: "Here's 20% off for the fam.",
        cta: "Claim Now",
    },
    {
        id: 5,
        type: "BOTTOM_SHEET",
        label: "Bottom Sheet",
        icon: Smartphone,
        theme: { bg: "#0369a1", text: "#ffffff", accent: "#fbbf24", ring: "ring-sky-500" },
        headline: "Your trial ends in",
        dynamic: "2 days",
        suffix: "",
        subtext: "Upgrade now to keep your data.",
        cta: "Upgrade Plan",
    },
    {
        id: 6,
        type: "FULL_SCREEN",
        label: "Full Screen",
        icon: Expand,
        theme: { bg: "#166534", text: "#ffffff", accent: "#fde047", ring: "ring-green-500" },
        headline: "Get",
        dynamic: "20% off",
        suffix: "your first month!",
        subtext: "Limited time offer. Don't miss out.",
        cta: "Claim Discount",
    },
];

// Popup preview components - matching ThemeSwitcherBlock style
function ModalPreview({ popup }: { popup: typeof popupTypes[0] }) {
    const { theme, headline, dynamic, suffix, subtext, cta } = popup;
    const isLightAccent = ["#fbbf24", "#fde047", "#fefce8"].includes(theme.accent);

    return (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-[260px] rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: theme.bg }}
            >
                {/* Gradient overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(145deg, ${theme.accent}15 0%, transparent 50%)` }}
                />
                <div className="relative p-5">
                    {/* Close button */}
                    <div className="flex justify-end mb-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${theme.text}08` }}
                        >
                            <span style={{ color: theme.text }} className="text-xs opacity-30">✕</span>
                        </div>
                    </div>
                    {/* Headline */}
                    <div className="mb-2 leading-tight">
                        <span className="text-base font-bold" style={{ color: theme.text }}>
                            {headline}{" "}
                        </span>
                        <span className="text-base font-bold" style={{ color: theme.accent }}>
                            {dynamic}
                        </span>
                        {suffix && (
                            <span className="text-base font-bold" style={{ color: theme.text }}>
                                {" "}{suffix}
                            </span>
                        )}
                    </div>
                    <p className="text-xs mb-4" style={{ color: theme.text, opacity: 0.6 }}>
                        {subtext}
                    </p>
                    {/* CTA */}
                    <div
                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: theme.accent, color: isLightAccent ? "#0f172a" : "#fff" }}
                    >
                        {cta}
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function SlideInPreview({ popup }: { popup: typeof popupTypes[0] }) {
    const { theme, headline, dynamic, subtext, cta } = popup;
    const isLightAccent = ["#fbbf24", "#fde047", "#fefce8"].includes(theme.accent);

    return (
        <motion.div
            initial={{ x: 200 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute right-0 top-0 bottom-0 w-[180px] shadow-2xl"
            style={{ backgroundColor: theme.bg }}
        >
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(180deg, ${theme.accent}10 0%, transparent 50%)` }}
            />
            <div className="relative p-4 h-full flex flex-col">
                <div className="flex justify-end mb-2">
                    <span style={{ color: theme.text }} className="text-xs opacity-30">✕</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs font-medium mb-1" style={{ color: theme.text, opacity: 0.6 }}>
                        {headline}
                    </p>
                    <p className="text-lg font-bold mb-1" style={{ color: theme.accent }}>
                        {dynamic}
                    </p>
                    <p className="text-[11px] mb-3" style={{ color: theme.text, opacity: 0.5 }}>
                        {subtext}
                    </p>
                    <div
                        className="w-full py-2 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1"
                        style={{ backgroundColor: theme.accent, color: isLightAccent ? "#0f172a" : "#fff" }}
                    >
                        {cta}
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function BannerPreview({ popup }: { popup: typeof popupTypes[0] }) {
    const { theme, headline, dynamic, suffix, cta } = popup;
    const isLightAccent = ["#fbbf24", "#fde047", "#fefce8"].includes(theme.accent);

    return (
        <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: theme.bg }}
        >
            <p className="text-sm font-medium" style={{ color: theme.text }}>
                {headline} <span style={{ color: theme.accent }}>{dynamic}</span> {suffix}
            </p>
            <div className="flex items-center gap-3">
                <div
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: theme.accent, color: isLightAccent ? "#0f172a" : "#fff" }}
                >
                    {cta}
                </div>
                <span style={{ color: theme.text }} className="text-sm opacity-30">✕</span>
            </div>
        </motion.div>
    );
}

function FloatingPreview({ popup }: { popup: typeof popupTypes[0] }) {
    const { theme, headline, dynamic, subtext, cta } = popup;
    const badge = (popup as typeof popupTypes[0] & { badge?: string }).badge;
    const isLightAccent = ["#fbbf24", "#fde047", "#fefce8"].includes(theme.accent);

    return (
        <>
            {/* Floating button */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute bottom-3 right-3 w-9 h-9 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: theme.accent }}
            >
                <MessageCircle className="w-4 h-4 text-white" />
            </motion.div>
            {/* Card popup */}
            <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="absolute bottom-14 right-3 w-[170px] rounded-xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: theme.bg }}
            >
                <div className="p-2.5">
                    {/* Badge */}
                    {badge && (
                        <div
                            className="inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold mb-1.5"
                            style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                        >
                            {badge}
                        </div>
                    )}
                    {/* Headline */}
                    <p className="text-[11px] font-medium mb-1" style={{ color: theme.text }}>
                        {headline}
                    </p>
                    {/* Subtext */}
                    <p className="text-[9px] mb-2" style={{ color: theme.text, opacity: 0.6 }}>
                        {subtext}
                    </p>
                    {/* Code */}
                    <div
                        className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider text-center mb-2"
                        style={{ backgroundColor: `${theme.text}10`, color: theme.accent }}
                    >
                        {dynamic}
                    </div>
                    {/* CTA */}
                    <div
                        className="w-full py-1.5 rounded-lg text-[10px] font-semibold text-center"
                        style={{ backgroundColor: theme.accent, color: isLightAccent ? "#0f172a" : "#fff" }}
                    >
                        {cta}
                    </div>
                </div>
            </motion.div>
        </>
    );
}

function BottomSheetPreview({ popup }: { popup: typeof popupTypes[0] }) {
    const { theme, headline, dynamic, subtext, cta } = popup;
    const isLightAccent = ["#fbbf24", "#fde047", "#fefce8"].includes(theme.accent);

    return (
        <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl shadow-2xl"
            style={{ backgroundColor: theme.bg }}
        >
            <div className="p-4">
                <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: `${theme.text}20` }} />
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium" style={{ color: theme.text, opacity: 0.6 }}>
                            {headline}
                        </p>
                        <p className="text-lg font-bold" style={{ color: theme.accent }}>
                            {dynamic}
                        </p>
                        <p className="text-[11px]" style={{ color: theme.text, opacity: 0.5 }}>
                            {subtext}
                        </p>
                    </div>
                    <div
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                        style={{ backgroundColor: theme.accent, color: isLightAccent ? "#0f172a" : "#fff" }}
                    >
                        {cta}
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function FullScreenPreview({ popup }: { popup: typeof popupTypes[0] }) {
    const { theme, headline, dynamic, suffix, subtext, cta } = popup;
    const isLightAccent = ["#fbbf24", "#fde047", "#fefce8"].includes(theme.accent);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: theme.bg }}
        >
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 30%, ${theme.accent}15 0%, transparent 60%)` }}
            />
            <div className="absolute top-3 right-3">
                <span style={{ color: theme.text }} className="text-sm opacity-30">✕</span>
            </div>
            <div className="text-center relative px-6">
                <div className="mb-2">
                    <span className="text-xl font-bold" style={{ color: theme.text }}>
                        {headline}{" "}
                    </span>
                    <span className="text-xl font-bold" style={{ color: theme.accent }}>
                        {dynamic}
                    </span>
                    {suffix && (
                        <span className="text-xl font-bold" style={{ color: theme.text }}>
                            {" "}{suffix}
                        </span>
                    )}
                </div>
                <p className="text-sm mb-4" style={{ color: theme.text, opacity: 0.6 }}>
                    {subtext}
                </p>
                <div
                    className="px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                    style={{ backgroundColor: theme.accent, color: isLightAccent ? "#0f172a" : "#fff" }}
                >
                    {cta}
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
}

const previewComponents: Record<string, React.ComponentType<{ popup: typeof popupTypes[0] }>> = {
    MODAL: ModalPreview,
    SLIDE_IN: SlideInPreview,
    BANNER: BannerPreview,
    FLOATING: FloatingPreview,
    BOTTOM_SHEET: BottomSheetPreview,
    FULL_SCREEN: FullScreenPreview,
};

export function PopupTypesShowcase() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { amount: 0.3, once: true });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [phase, setPhase] = useState<"waiting" | "animating" | "interactive">("waiting");
    const hasPlayed = useRef(false);

    useEffect(() => {
        if (!isInView || hasPlayed.current) return;
        hasPlayed.current = true;
        setPhase("animating");

        // Cycle through popup previews - matching ThemeSwitcher speed
        const sequence = [
            { delay: 1200, action: () => setSelectedId(1) },
            { delay: 1500, action: () => setSelectedId(2) },
            { delay: 1500, action: () => setSelectedId(3) },
            { delay: 1500, action: () => setSelectedId(4) },
            { delay: 1500, action: () => setSelectedId(5) },
            { delay: 1500, action: () => setSelectedId(6) },
            { delay: 1500, action: () => { setSelectedId(1); setPhase("interactive"); } },
        ];

        let timeout: NodeJS.Timeout;
        let step = 0;

        const runNext = () => {
            if (step >= sequence.length) return;
            const { delay, action } = sequence[step];
            step++;
            timeout = setTimeout(() => {
                action();
                runNext();
            }, delay);
        };

        runNext();
        return () => clearTimeout(timeout);
    }, [isInView]);

    const selectedPopup = popupTypes.find(p => p.id === selectedId);
    const PreviewComponent = selectedPopup ? previewComponents[selectedPopup.type] : null;

    return (
        <div
            ref={containerRef}
            className="relative min-h-[600px] flex items-center justify-center p-6 md:p-10"
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full max-w-2xl"
            >
                {/* Header Badge - matching site style */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center mb-5"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-badge bg-card">
                        <Layers className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">
                            6 Popup Styles
                        </span>
                    </div>
                </motion.div>

                {/* Type Selector - Color circles like ThemeSwitcher */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-center gap-2 mb-5"
                >
                    {popupTypes.map((popup) => {
                        const isSelected = selectedId === popup.id;

                        return (
                            <motion.button
                                key={popup.id}
                                onClick={() => phase === "interactive" && setSelectedId(popup.id)}
                                disabled={phase !== "interactive"}
                                className={cn(
                                    "w-10 h-10 rounded-full transition-all duration-300",
                                    "ring-2 ring-offset-2 ring-offset-background",
                                    "shadow-md hover:shadow-lg",
                                    isSelected
                                        ? `${popup.theme.ring} scale-110`
                                        : "ring-transparent opacity-50 hover:opacity-80",
                                    phase === "interactive" && "cursor-pointer"
                                )}
                                style={{ backgroundColor: popup.theme.bg }}
                                whileHover={phase === "interactive" ? { scale: 1.2, opacity: 1 } : {}}
                                whileTap={phase === "interactive" ? { scale: 0.95 } : {}}
                            />
                        );
                    })}
                </motion.div>

                {/* Type Label - matching ThemeSwitcher */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    className="text-center mb-4"
                >
                    <AnimatePresence mode="wait">
                        {selectedPopup && (
                            <motion.span
                                key={selectedId}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.3 }}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                            >
                                <Zap className="w-3 h-3 text-amber-500" />
                                {selectedPopup.label}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Browser Preview - Larger */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="rounded-2xl overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.4)] border border-white/10"
                >
                    {/* Browser Chrome */}
                    <div className="bg-[#1c1c1e] px-4 py-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#28ca41]" />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="bg-[#2c2c2e] rounded-lg px-4 py-1.5 flex items-center gap-2 w-64">
                                <Globe className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs text-gray-400 font-mono">yourstore.com</span>
                            </div>
                        </div>
                        <div className="w-[52px]" />
                    </div>

                    {/* Browser Content - Taller */}
                    <div className="relative bg-[#f5f5f7] dark:bg-[#1c1c1e] h-[260px] overflow-hidden">
                        {/* Website skeleton */}
                        <div className="absolute inset-0 p-5 space-y-3">
                            <div className="h-5 w-32 bg-gray-300/50 dark:bg-gray-700/50 rounded" />
                            <div className="h-3 w-full bg-gray-200/50 dark:bg-gray-800/50 rounded" />
                            <div className="h-3 w-4/5 bg-gray-200/50 dark:bg-gray-800/50 rounded" />
                            <div className="h-3 w-3/5 bg-gray-200/50 dark:bg-gray-800/50 rounded" />
                            <div className="mt-4 h-20 w-full bg-gray-200/50 dark:bg-gray-800/50 rounded" />
                            <div className="flex gap-3 mt-3">
                                <div className="h-10 w-24 bg-gray-200/50 dark:bg-gray-800/50 rounded" />
                                <div className="h-10 w-24 bg-gray-200/50 dark:bg-gray-800/50 rounded" />
                            </div>
                        </div>

                        {/* Popup Preview */}
                        <AnimatePresence mode="wait">
                            {PreviewComponent && selectedPopup && (
                                <motion.div
                                    key={selectedPopup.type}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute inset-0"
                                >
                                    <PreviewComponent popup={selectedPopup} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Interactive hint */}
                <AnimatePresence>
                    {phase === "interactive" && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center mt-4 text-xs text-muted-foreground"
                        >
                            Click any style to preview
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
