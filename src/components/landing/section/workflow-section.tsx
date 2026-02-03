"use client";

import { Button } from "@/components/landing/ui/button";
import { Icons } from "@/components/landing/icons";
import { siteConfig } from "@/lib/landing-config";
import { SectionHeader } from "@/components/landing/section-header";
import { HeaderBadge } from "@/components/landing/header-badge";
import { TerminalBrowserPreviewBlock } from "@/components/landing/animations/sections/terminal-browser-preview";
import { VisitorFeedBlock } from "@/components/landing/animations/sections/visitor-feed-block";
import { CornerPlus } from "@/components/landing/ui/corner-plus";

const workflowConfig = siteConfig.workflowSection;

export function WorkflowSection() {
    return (
        <section id="workflow" className="w-full relative">
            <SectionHeader>
                <div className="flex flex-col items-center justify-center">
                    <HeaderBadge icon={workflowConfig.badge.icon} text={workflowConfig.badge.text} />
                    <div className="flex flex-col items-center justify-center gap-4 mt-4">
                        <h2 className="text-3xl md:text-4xl lg:text-6xl font-medium tracking-tighter text-center text-balance">
                            {workflowConfig.title}
                        </h2>
                        <p className="text-muted-foreground md:text-lg text-center text-balance mx-auto">
                            {workflowConfig.description}
                        </p>
                    </div>
                </div>
            </SectionHeader>
            <div className="mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-6">
                    {/* Left Column - Sticky Description */}
                    <div className="col-span-1 md:col-span-2 p-8 md:p-10 lg:p-14 md:sticky md:top-20 md:self-start flex flex-col gap-7">
                        <h3 className="text-3xl lg:text-4xl font-medium tracking-tighter text-left text-balance">
                            {workflowConfig.sections.title}
                        </h3>
                        <p className="text-muted-foreground text-left text-balance">
                            {workflowConfig.sections.description}
                        </p>
                        <Button variant="secondary" className="w-fit border border-border">
                            {workflowConfig.sections.ctaButton.text}
                            <Icons.arrowRight className="size-4 text-foreground" />
                        </Button>
                    </div>

                    {/* Right Column - Animated Blocks */}
                    <div className="col-span-1 md:col-span-4 w-full border-t md:border-t-0 md:border-l border-border relative">
                        <CornerPlus position="all" className="text-muted-foreground/50" />
                        <div className="w-full divide-y divide-border">
                            <div className="relative">
                                <TerminalBrowserPreviewBlock />
                                <div className="max-w-xl text-left items-start p-6">
                                    <p className="text-sm text-muted-foreground flex items-center gap-3 justify-start">
                                        {workflowConfig.sections.blocks[0].icon}
                                        {workflowConfig.sections.blocks[0].title}
                                    </p>
                                    <p className="text-base text-foreground leading-relaxed mt-2">
                                        {workflowConfig.sections.blocks[0].description}
                                    </p>
                                    {workflowConfig.sections.blocks[0].footer && (
                                        <p className="text-xs text-muted-foreground/70 mt-3">
                                            {workflowConfig.sections.blocks[0].footer}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Code Review Block */}
                            <div className="relative">
                                <CornerPlus position="top-left" className="text-muted-foreground/50" />
                                <CornerPlus position="top-right" className="text-muted-foreground/50" />
                                <VisitorFeedBlock />
                                <div className="max-w-xl text-left items-start p-6">
                                    <p className="text-sm text-muted-foreground flex items-center gap-3 justify-start">
                                        {workflowConfig.sections.blocks[1].icon}
                                        {workflowConfig.sections.blocks[1].title}
                                    </p>
                                    <p className="text-base text-foreground leading-relaxed mt-2">
                                        {workflowConfig.sections.blocks[1].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}