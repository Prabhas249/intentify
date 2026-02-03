"use client";

import { siteConfig } from "@/lib/landing-config";
import { SectionHeader } from "@/components/landing/section-header";
import { HeaderBadge } from "@/components/landing/header-badge";
import { WorkflowStepsBlock } from "@/components/landing/animations/sections/workflow-steps-block";

const connectConfig = siteConfig.connectSection;

export function ConnectSection() {
    return (
        <section id="connect" className="w-full relative">
            <SectionHeader>
                <div className="flex flex-col items-center justify-center">
                    <HeaderBadge icon={connectConfig.badge.icon} text={connectConfig.badge.text} />
                    <div className="flex flex-col items-center justify-center gap-4 mt-4">
                        <h2 className="text-3xl md:text-4xl lg:text-6xl font-medium tracking-tighter text-center text-balance">
                            {connectConfig.title}
                        </h2>
                        <p className="text-muted-foreground md:text-lg text-center text-balance mx-auto">
                            {connectConfig.description}
                        </p>
                    </div>
                </div>
            </SectionHeader>
            <div className="mx-auto max-w-5xl px-4">
                <WorkflowStepsBlock />
            </div>
        </section>
    );
}
