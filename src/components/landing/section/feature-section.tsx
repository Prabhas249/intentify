"use client";

import { Button } from "@/components/landing/ui/button";
import { siteConfig } from "@/lib/landing-config";
import { SectionHeader } from "../section-header";
import { Icons } from "../icons";
import { HeaderBadge } from "../header-badge";
import { PopupTypesShowcase } from "@/components/landing/animations/sections/popup-types-showcase";
import { ThemeSwitcherBlock } from "@/components/landing/animations/sections/theme-switcher-block";
import { LazyDither } from "@/components/landing/animations/lazy-dither";

const featureConfig = siteConfig.featureSection;

export function FeatureSection() {

    return (
        <section id="features" className="w-full relative">
            <SectionHeader>
                <div className="flex flex-col items-center justify-center">
                    <HeaderBadge icon={featureConfig.badge.icon} text={featureConfig.badge.text} />
                    <div className="flex flex-col items-center justify-center gap-4 mt-4">
                        <h2 className="text-3xl md:text-4xl lg:text-6xl font-medium tracking-tighter text-center text-balance">
                            {featureConfig.title}
                        </h2>
                        <p className="text-muted-foreground md:text-lg text-center text-balance mx-auto">
                            {featureConfig.description}
                        </p>
                    </div>
                </div>
            </SectionHeader>
            <div className="relative h-14 overflow-hidden">
                <div className="absolute inset-0">
                    <LazyDither enableMouseInteraction={true} />
                </div>
            </div>
            <div className="mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-6">
                    {/* Left Column - Sticky Description */}
                    <div className="col-span-1 md:col-span-2 p-8 md:p-10 lg:p-14 md:sticky md:top-20 md:self-start flex flex-col gap-7">
                        <h3 className="text-3xl lg:text-4xl font-medium tracking-tighter text-left text-balance">
                            {featureConfig.sections.title}
                        </h3>
                        <p className="text-muted-foreground text-left text-balance">
                            {featureConfig.sections.description}
                        </p>
                        <Button variant="secondary" className="w-fit border border-border">
                            {featureConfig.sections.ctaButton.text}
                            <Icons.arrowRight className="size-4 text-foreground" />
                        </Button>
                    </div>

                    {/* Right Column - Animated Blocks */}
                    <div className="col-span-1 md:col-span-4 w-full border-t md:border-t-0 md:border-l border-border relative">
                        <div className="w-full divide-y divide-border">
                            <div className="relative">
                                <PopupTypesShowcase />
                                <div className="max-w-xl text-left items-start p-6">
                                    <p className="text-sm text-muted-foreground flex items-center gap-3 justify-start">
                                        {featureConfig.sections.blocks[0].icon}
                                        {featureConfig.sections.blocks[0].title}
                                    </p>
                                    <p className="text-base text-foreground leading-relaxed mt-2">
                                        {featureConfig.sections.blocks[0].description}
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <ThemeSwitcherBlock />
                                <div className="max-w-xl text-left items-start p-6">
                                    <p className="text-sm text-muted-foreground flex items-center gap-3 justify-start">
                                        {featureConfig.sections.blocks[1].icon}
                                        {featureConfig.sections.blocks[1].title}
                                    </p>
                                    <p className="text-base text-foreground leading-relaxed mt-2">
                                        {featureConfig.sections.blocks[1].description}
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
