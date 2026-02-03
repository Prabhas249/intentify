"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import {
    Code2,
    Link,
    Paintbrush,
    TrendingUp,
    Check,
    Copy,
    Globe,
    Zap,
} from "lucide-react";

const steps = [
    {
        id: 1,
        label: "Setup",
        icon: Code2,
        title: "Add 1 line of code",
        description: "Copy-paste into your site's <head>",
    },
    {
        id: 2,
        label: "Connect",
        icon: Link,
        title: "Verify your domain",
        description: "We detect it automatically",
    },
    {
        id: 3,
        label: "Build",
        icon: Paintbrush,
        title: "Create your popup",
        description: "Choose style, message & triggers",
    },
    {
        id: 4,
        label: "Convert",
        icon: TrendingUp,
        title: "Turn visitors into customers",
        description: "Watch your conversions grow",
    },
];

// Step 1: Code snippet animation
function SetupAnimation() {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setCopied(true), 1000);
        const resetTimer = setTimeout(() => setCopied(false), 2500);
        return () => {
            clearTimeout(timer);
            clearTimeout(resetTimer);
        };
    }, []);

    return (
        <div className="bg-[#0f172a] rounded-xl p-4 font-mono text-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28ca41]" />
                </div>
                <motion.button
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    whileTap={{ scale: 0.95 }}
                >
                    {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                </motion.button>
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-gray-300"
            >
                <span className="text-gray-500">&lt;</span>
                <span className="text-pink-400">script</span>
                <span className="text-gray-500">&gt;</span>
                <span className="text-amber-300">src</span>
                <span className="text-gray-500">=</span>
                <span className="text-green-400">"popupkit.js"</span>
                <span className="text-gray-500">&lt;/</span>
                <span className="text-pink-400">script</span>
                <span className="text-gray-500">&gt;</span>
            </motion.div>
        </div>
    );
}

// Step 2: Domain verification animation
function ConnectAnimation() {
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVerified(true), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">yourstore.com</p>
                    <p className="text-xs text-muted-foreground">Checking connection...</p>
                </div>
                <AnimatePresence mode="wait">
                    {verified ? (
                        <motion.div
                            key="verified"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"
                        >
                            <Check className="w-4 h-4 text-green-500" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="loading"
                            className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin"
                        />
                    )}
                </AnimatePresence>
            </div>
            {verified && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium"
                >
                    Domain verified successfully
                </motion.div>
            )}
        </div>
    );
}

// Step 3: Builder preview animation - Real banner popup
function BuildAnimation() {
    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Mini browser chrome */}
            <div className="bg-muted/50 px-3 py-2 flex items-center gap-2 border-b border-border">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="bg-background rounded px-3 py-0.5 text-[10px] text-muted-foreground">
                        yourstore.com
                    </div>
                </div>
            </div>

            {/* Browser content with banner popup */}
            <div className="relative bg-background h-[120px]">
                {/* Website skeleton */}
                <div className="p-3 space-y-2">
                    <div className="h-3 w-20 bg-muted rounded" />
                    <div className="h-2 w-full bg-muted/50 rounded" />
                    <div className="h-2 w-4/5 bg-muted/50 rounded" />
                </div>

                {/* Banner popup - animates in */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2"
                    style={{ backgroundColor: "#ea580c" }}
                >
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                        className="text-[11px] font-medium text-white"
                    >
                        🎉 Launch Sale — <span className="text-yellow-200">50% off</span> all plans
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.3 }}
                        className="flex items-center gap-2"
                    >
                        <div className="px-2 py-1 rounded text-[10px] font-semibold bg-yellow-100 text-orange-900">
                            Claim Now
                        </div>
                        <span className="text-white/50 text-xs">✕</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

// Step 4: Conversion animation
function ConvertAnimation() {
    const [count, setCount] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const targetCount = 127;
    const targetPercentage = 23;

    useEffect(() => {
        // Smooth count up animation
        const duration = 1500;
        const steps = 30;
        const stepTime = duration / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            // Ease out cubic for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCount(Math.round(easeOut * targetCount));
            setPercentage(Math.round(easeOut * targetPercentage));

            if (currentStep >= steps) {
                clearInterval(interval);
            }
        }, stepTime);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Conversions Today</span>
                <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-foreground tabular-nums">
                    {count}
                </span>
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="text-sm text-green-500 font-medium mb-1"
                >
                    +{percentage}%
                </motion.span>
            </div>
            <div className="mt-3 flex gap-1">
                {[40, 55, 45, 70, 60, 85, 75, 90].map((height, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                        className="flex-1 bg-green-500/30 rounded-sm"
                        style={{ maxHeight: 40 }}
                    />
                ))}
            </div>
        </div>
    );
}

const animations = [SetupAnimation, ConnectAnimation, BuildAnimation, ConvertAnimation];

export function WorkflowStepsBlock() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { amount: 0.3, once: true });
    const [activeStep, setActiveStep] = useState(0);
    const [phase, setPhase] = useState<"waiting" | "animating" | "interactive">("waiting");
    const hasPlayed = useRef(false);

    useEffect(() => {
        if (!isInView || hasPlayed.current) return;
        hasPlayed.current = true;
        setPhase("animating");

        // Cycle through steps - stop at Convert
        const sequence = [
            { delay: 1200, action: () => setActiveStep(0) },
            { delay: 2000, action: () => setActiveStep(1) },
            { delay: 2000, action: () => setActiveStep(2) },
            { delay: 2000, action: () => setActiveStep(3) },
            { delay: 2000, action: () => setPhase("interactive") },
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

    const ActiveAnimation = animations[activeStep];

    return (
        <div
            ref={containerRef}
            className="relative min-h-[480px] flex items-center justify-center p-6 md:p-10"
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full max-w-lg"
            >
                {/* Header Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center mb-5"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-badge bg-card">
                        <Zap className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">
                            4 Simple Steps
                        </span>
                    </div>
                </motion.div>

                {/* Step Indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-center gap-1 mb-5"
                >
                    {steps.map((step, index) => {
                        const isActive = activeStep === index;
                        const isPast = activeStep > index;

                        return (
                            <div key={step.id} className="flex items-center">
                                <motion.button
                                    onClick={() => phase === "interactive" && setActiveStep(index)}
                                    disabled={phase !== "interactive"}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300",
                                        isActive
                                            ? "bg-foreground text-background"
                                            : isPast
                                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                            : "bg-muted text-muted-foreground",
                                        phase === "interactive" && "cursor-pointer hover:opacity-80"
                                    )}
                                    whileHover={phase === "interactive" ? { scale: 1.05 } : {}}
                                    whileTap={phase === "interactive" ? { scale: 0.95 } : {}}
                                >
                                    {isPast && !isActive ? (
                                        <Check className="w-3.5 h-3.5" />
                                    ) : (
                                        <step.icon className="w-3.5 h-3.5" />
                                    )}
                                    <span className="text-xs font-medium">{step.label}</span>
                                </motion.button>
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        "w-4 h-0.5 mx-1",
                                        isPast ? "bg-green-500/30" : "bg-border"
                                    )} />
                                )}
                            </div>
                        );
                    })}
                </motion.div>

                {/* Step Title */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    className="text-center mb-4"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-lg font-semibold text-foreground">
                                {steps[activeStep].title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {steps[activeStep].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Animation Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="min-h-[160px]"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ActiveAnimation />
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* CTA Button */}
                <AnimatePresence>
                    {phase === "interactive" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center mt-6"
                        >
                            <a
                                href="#pricing"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                Start converting
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
