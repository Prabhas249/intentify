import { siteConfig } from "@/lib/landing-config";
import { Button } from "@/components/landing/ui/button";
import { cn } from "@/lib/utils";

export function CTASection() {
    const { ctaSection } = siteConfig;

    return (
        <section
            id={ctaSection.id}
            className="relative flex flex-col items-center justify-center px-4 py-20 md:py-32 overflow-hidden"
        >
            <div className="absolute inset-0 -z-1 h-full w-full bg-radial-[at_45%_85%] from-[#FE4A23]/30 via-[#FF6B47]/3 mask-[linear-gradient(to_bottom,transparent,black_100%)]" />
            <div className="absolute inset-0 -z-1 h-full w-full bg-radial-[at_45%_68%] from-[#FE4A23]/50 via-[#FF6B47]/2 mask-[linear-gradient(to_bottom,transparent,black_100%)] blur-[50px]" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-4xl mx-auto">
                {/* Heading */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter    text-balance">
                    {ctaSection.title}
                </h2>
                <p className="text-muted-foreground text-center text-balance font-medium max-w-2xl mx-auto">
                    {ctaSection.subtext}
                </p>

                {/* CTA Button */}
                <div className="pt-2">
                    <Button
                        asChild
                        size="lg"
                        className={cn(
                            "rounded-full px-8 py-6 text-base font-medium text-white",
                            "bg-[#FE4A23] hover:bg-[#E5421F]",
                            "shadow-[0px_2px_4px_0px_rgba(254,74,35,0.3),0px_1px_2px_0px_#00000016] transition-colors duration-200",
                        )}
                    >
                        <a href={ctaSection.button.href}>
                            {ctaSection.button.text}
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
}