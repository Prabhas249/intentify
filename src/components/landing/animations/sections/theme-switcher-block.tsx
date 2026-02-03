"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowRight, Zap } from "lucide-react";

// Each theme has its own message - SaaS/Indie focused
const variants = [
    {
        // Light - Return visitor
        theme: { name: "Light", bg: "#ffffff", text: "#0f172a", accent: "#6366f1", ring: "ring-slate-300" },
        headline: "Welcome back for your",
        dynamic: "3rd",
        suffix: "visit!",
        sub: "Your saved progress is waiting.",
        cta: "Continue Setup",
        useCase: "Return Visitors",
    },
    {
        // Dark - High intent / Pricing viewer
        theme: { name: "Dark", bg: "#0f172a", text: "#f8fafc", accent: "#22c55e", ring: "ring-slate-600" },
        headline: "You've viewed pricing",
        dynamic: "3 times",
        suffix: "now",
        sub: "Ready to start? Here's 20% off.",
        cta: "Claim Discount",
        useCase: "High Intent",
    },
    {
        // Ocean - Time on site
        theme: { name: "Ocean", bg: "#0369a1", text: "#ffffff", accent: "#fbbf24", ring: "ring-sky-500" },
        headline: "You've spent",
        dynamic: "5 min",
        suffix: "exploring",
        sub: "Let's get you started with a free trial.",
        cta: "Start Free Trial",
        useCase: "Engaged Visitors",
    },
    {
        // Sunset - Product Hunt traffic
        theme: { name: "Sunset", bg: "#ea580c", text: "#ffffff", accent: "#fefce8", ring: "ring-orange-500" },
        headline: "Hey",
        dynamic: "Product Hunt",
        suffix: "fam! 🚀",
        sub: "Exclusive launch deal for hunters.",
        cta: "Get 50% Off",
        useCase: "Traffic Source",
    },
    {
        // Forest - Trial ending
        theme: { name: "Forest", bg: "#166534", text: "#ffffff", accent: "#fde047", ring: "ring-green-500" },
        headline: "Your trial ends in",
        dynamic: "2 days",
        suffix: "",
        sub: "Upgrade now to keep your data.",
        cta: "Upgrade Plan",
        useCase: "Trial Users",
    },
];

export function ThemeSwitcherBlock() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { amount: 0.3, once: true });
    const [activeIndex, setActiveIndex] = useState(0);
    const [phase, setPhase] = useState<"waiting" | "animating" | "interactive">("waiting");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasPlayed = useRef(false);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!isInView || hasPlayed.current) return;

        hasPlayed.current = true;
        setPhase("animating");

        // Sequence through all variants
        const sequence = [
            { delay: 1500, action: () => setActiveIndex(1) },
            { delay: 1500, action: () => setActiveIndex(2) },
            { delay: 1500, action: () => setActiveIndex(3) },
            { delay: 1500, action: () => setActiveIndex(4) },
            { delay: 1500, action: () => { setActiveIndex(0); setPhase("interactive"); } },
        ];

        let step = 0;
        const runNext = () => {
            if (step >= sequence.length) return;
            const s = sequence[step];
            step++;
            timerRef.current = setTimeout(() => {
                s.action();
                runNext();
            }, s.delay);
        };

        timerRef.current = setTimeout(runNext, 1200);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [isInView]);

    const current = variants[activeIndex];
    const theme = current.theme;

    const handleClick = (index: number) => {
        if (phase === "interactive") {
            setActiveIndex(index);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-[520px] flex items-center justify-center p-6 md:p-10"
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full max-w-sm"
            >
                {/* Header Badge - matching site style */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={phase !== "waiting" ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center mb-5"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-badge bg-card">
                        <Zap className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">
                            Dynamic Personalization
                        </span>
                    </div>
                </motion.div>

                {/* Theme/Message Selector */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={phase !== "waiting" ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-center gap-2 mb-5"
                >
                    {variants.map((v, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleClick(index)}
                            className={cn(
                                "w-10 h-10 rounded-full transition-all duration-300",
                                "ring-2 ring-offset-2 ring-offset-background",
                                "shadow-md hover:shadow-lg",
                                activeIndex === index
                                    ? `${v.theme.ring} scale-110`
                                    : "ring-transparent opacity-50 hover:opacity-80",
                                phase === "interactive" && "cursor-pointer"
                            )}
                            style={{ backgroundColor: v.theme.bg }}
                            whileHover={phase === "interactive" ? { scale: 1.2, opacity: 1 } : {}}
                            whileTap={phase === "interactive" ? { scale: 0.95 } : {}}
                        />
                    ))}
                </motion.div>

                {/* Use Case Label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={phase !== "waiting" ? { opacity: 1 } : {}}
                    className="text-center mb-4"
                >
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={activeIndex}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                        >
                            <Zap className="w-3 h-3 text-amber-500" />
                            {current.useCase}
                        </motion.span>
                    </AnimatePresence>
                </motion.div>

                {/* Popup Card */}
                <motion.div
                    className={cn(
                        "relative rounded-3xl overflow-hidden",
                        "shadow-[0_30px_100px_-20px_rgba(0,0,0,0.4)]",
                        "border border-white/10"
                    )}
                    animate={{ backgroundColor: theme.bg }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {/* Gradient overlay */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            background: `linear-gradient(145deg, ${theme.accent}20 0%, transparent 40%)`
                        }}
                        transition={{ duration: 0.5 }}
                    />

                    <div className="relative p-8">
                        {/* Close button */}
                        <div className="flex justify-end mb-4">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
                                style={{ backgroundColor: `${theme.text}08` }}
                            >
                                <span style={{ color: theme.text }} className="text-sm opacity-30">✕</span>
                            </div>
                        </div>

                        {/* Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {/* Headline with dynamic highlight */}
                                <div className="mb-3 leading-tight">
                                    <span
                                        className="text-2xl font-bold tracking-tight"
                                        style={{ color: theme.text }}
                                    >
                                        {current.headline}{" "}
                                    </span>
                                    <span
                                        className="text-2xl font-bold tracking-tight"
                                        style={{ color: theme.accent }}
                                    >
                                        {current.dynamic}
                                    </span>
                                    {current.suffix && (
                                        <span
                                            className="text-2xl font-bold tracking-tight"
                                            style={{ color: theme.text }}
                                        >
                                            {" "}{current.suffix}
                                        </span>
                                    )}
                                </div>

                                <motion.p
                                    className="text-base mb-8"
                                    style={{ color: theme.text, opacity: 0.65 }}
                                >
                                    {current.sub}
                                </motion.p>

                                {/* CTA Button */}
                                <motion.button
                                    className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
                                    style={{
                                        backgroundColor: theme.accent,
                                        color: ["#fbbf24", "#fde047", "#fefce8"].includes(theme.accent)
                                            ? "#0f172a"
                                            : "#ffffff",
                                    }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {current.cta}
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Interactive hint */}
                <AnimatePresence>
                    {phase === "interactive" && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-center mt-4 text-xs text-muted-foreground"
                        >
                            ← Click any color to see different use cases →
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
