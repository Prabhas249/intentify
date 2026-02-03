"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Maximize2, ExternalLink } from "lucide-react";

export function DemoSection() {
    return (
        <section id="demo" className="w-full relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
                <div className="flex flex-col items-center text-center mb-10">
                    {/* Heading */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-balance max-w-3xl"
                    >
                        See Intentify in action
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-4 text-muted-foreground text-lg max-w-2xl text-balance"
                    >
                        Explore the full dashboard with real data. No signup needed.
                    </motion.p>
                </div>

                {/* Embedded Dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="relative -mx-4"
                >
                    <div className="relative">
                        {/* Browser chrome */}
                        <div className="border-y border-border bg-muted/50 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-red-400" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-400" />
                                        <div className="h-3 w-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="hidden sm:block rounded-md bg-background px-4 py-1.5 text-xs text-muted-foreground">
                                        Intentify.in/dashboard
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard"
                                    target="_blank"
                                    className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-all hover:opacity-90"
                                >
                                    <Maximize2 className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Open Fullscreen</span>
                                    <ExternalLink className="h-3 w-3 sm:hidden" />
                                </Link>
                            </div>
                        </div>

                        {/* Live Dashboard iframe */}
                        <div className="border-b border-border bg-card overflow-hidden">
                            <iframe
                                src="/dashboard"
                                className="w-full h-[500px] md:h-[600px] lg:h-[700px]"
                                title="Intentify Dashboard Demo"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
