import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import type { Metadata } from "next";

// Demo user IDs (geo-based)
const DEMO_USER_INR = "cml66aybb0000yefsjavxkfb5";
const DEMO_USER_USD = "cml66hzz280fsyefsv71bm5ed";

export const metadata: Metadata = {
  title: "Websites | PopupTool",
  description: "Manage your websites and tracking scripts.",
};
import { Globe, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard, GlassCardContent } from "@/components/dashboard/glass-card";
import { PrimaryButton } from "@/components/dashboard/primary-button";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { WebsiteCard } from "@/components/dashboard/website-card";

export default async function WebsitesPage() {
  const session = await auth();
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";
  const isIndia = country === "IN";
  const demoUserId = isIndia ? DEMO_USER_INR : DEMO_USER_USD;
  const userId = session?.user?.id || demoUserId;

  const websites = await db.website.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          campaigns: true,
          visitors: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Websites"
        description="Manage your websites and tracking scripts."
        iconSlot={<Globe className="h-8 w-8 md:h-9 md:w-9 text-sky-500" />}
        badge="Overview"
      >
        <PrimaryButton asChild>
          <Link href="/websites/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Website
          </Link>
        </PrimaryButton>
      </PageHeader>

      {websites.length === 0 ? (
        <GlassCard delay={0.1} gradient="from-sky-500/5 via-transparent to-violet-500/5" corners="all">
          <GlassCardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-sky-600/10 border border-sky-500/20 mb-6">
              <Globe className="h-8 w-8 text-sky-500" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight mb-2">No websites yet</h3>
            <p className="text-muted-foreground text-center leading-relaxed max-w-sm mb-6">
              Add your first website to start tracking visitors and creating popup campaigns.
            </p>
            <PrimaryButton asChild size="lg">
              <Link href="/websites/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Website
              </Link>
            </PrimaryButton>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {websites.map((website, index) => (
            <BlurFade key={website.id} delay={0.1 + index * 0.05} direction="up">
              <WebsiteCard website={website} />
            </BlurFade>
          ))}
        </div>
      )}
    </div>
  );
}
