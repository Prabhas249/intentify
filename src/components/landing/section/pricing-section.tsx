"use client";

import { useState } from "react";

import { siteConfig } from "@/lib/landing-config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/landing/ui/button";
import { SwitchContainer, SwitchItem } from "@/components/landing/animations/animated-switch";
import { LazyDither } from "@/components/landing/animations/lazy-dither";

type BillingPeriod = "monthly" | "annually";

export function PricingSection() {
    const { pricing } = siteConfig;
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
    const isYearly = billingPeriod === "annually";

    // Order: Free, Starter, Growth, Pro
    const orderedPlans = [...pricing.pricingItems].sort((a, b) => {
        const order = ["Free", "Starter", "Growth", "Pro"];
        return order.indexOf(a.name) - order.indexOf(b.name);
    });

    return (
        <section id="pricing" className="relative w-full border-b">
            <div className="mx-auto">
                <div className="grid divide-x divide-border md:grid-cols-6">
                    <div className="col-span-2 flex flex-col gap-4 p-8 md:p-14">
                        <div className="space-y-4">
                            <h3 className="text-3xl font-medium tracking-tighter md:text-4xl">
                                {pricing.title}
                            </h3>
                            <p className="text-balance text-muted-foreground">
                                {pricing.description}
                            </p>
                        </div>
                        <div className="pt-4">
                            <SwitchContainer
                                value={billingPeriod}
                                onValueChange={(value) =>
                                    setBillingPeriod(value as BillingPeriod)
                                }
                                className="rounded-xl"
                            >
                                <SwitchItem value="monthly" label="Monthly" />
                                <SwitchItem
                                    value="annually"
                                    label="Annually"
                                />
                            </SwitchContainer>
                        </div>
                    </div>

                    <div className="col-span-4 flex flex-col">
                        <div className="relative h-14 border-b overflow-hidden">
                            <div className="absolute inset-0">
                                <LazyDither enableMouseInteraction={false} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
                            {orderedPlans.map((plan) => {
                                const displayPrice = isYearly
                                    ? plan.yearlyPrice
                                    : plan.price;
                                const pricePeriod = isYearly
                                    ? "year"
                                    : plan.period;

                                return (
                                    <div
                                        key={plan.name}
                                        className={cn(
                                            "flex flex-col p-6",
                                            plan.isPopular && "bg-accent",
                                        )}
                                    >
                                        {/* Header - fixed */}
                                        <div className="flex flex-col gap-4 mb-6">
                                            <h4 className="flex items-center gap-2 text-lg font-medium">
                                                {plan.name}
                                                {plan.isPopular && (
                                                    <span className="rounded-md border border-[#FE4A23]/20 bg-[#FE4A23]/10 px-2 py-0.5 text-xs font-medium text-[#FE4A23]">
                                                        Popular
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-medium md:text-3xl">
                                                        {displayPrice}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        /{pricePeriod}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {plan.description}
                                                </p>
                                            </div>
                                        </div>

                                        <hr className="border-dashed border-border mb-6" />

                                        {/* Features - grows */}
                                        <ul className="flex-1 space-y-2 mb-6">
                                            {plan.features.map((feature, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2"
                                                >
                                                    <svg
                                                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    <span className="text-sm text-muted-foreground">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Button - at bottom, same line */}
                                        <Button
                                            size="default"
                                            asChild
                                            className={cn(
                                                "w-full cursor-pointer rounded-full transition-all duration-300 ease-in-out hover:scale-[1.02] mt-auto",
                                                plan.isPopular
                                                    ? "bg-[#FE4A23] text-white hover:bg-[#E5421F] border-[#FE4A23]"
                                                    : "bg-card text-foreground border border-border hover:bg-accent",
                                            )}
                                        >
                                            <a href={plan.href}>
                                                {plan.buttonText}
                                            </a>
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="relative h-14 border-t overflow-hidden">
                            <div className="absolute inset-0">
                                <LazyDither enableMouseInteraction={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
