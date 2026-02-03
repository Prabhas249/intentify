import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, Megaphone, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { CampaignBuilder } from "@/components/campaign/campaign-builder";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { Button } from "@/components/ui/button";

export default async function NewCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const website = await db.website.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!website) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BlurFade delay={0} direction="up">
          <Button variant="ghost" size="icon" asChild className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-violet-500/30">
            <Link href={`/websites/${website.id}/campaigns`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </BlurFade>
        <BlurFade delay={0.05} direction="up">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-500/20">
              <Plus className="h-6 w-6 md:h-7 md:w-7 text-violet-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-600 border border-violet-500/20">
                  <Sparkles className="h-3 w-3" />
                  New
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-medium tracking-tight">Create Campaign</h1>
              <p className="text-muted-foreground text-sm md:text-base">{website.domain}</p>
            </div>
          </div>
        </BlurFade>
      </div>

      {/* Campaign Builder */}
      <BlurFade delay={0.1} direction="up">
        <CampaignBuilder websiteId={website.id} />
      </BlurFade>
    </div>
  );
}
