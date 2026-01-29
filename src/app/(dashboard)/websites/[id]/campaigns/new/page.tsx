import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Megaphone } from "lucide-react";
import Link from "next/link";
import { CampaignBuilder } from "@/components/campaign/campaign-builder";

export default async function NewCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const website = await db.website.findFirst({
    where: {
      id,
      userId: session?.user?.id,
    },
  });

  if (!website) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/websites/${website.id}/campaigns`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Create Campaign
          </h1>
          <p className="text-muted-foreground">{website.domain}</p>
        </div>
      </div>

      {/* Campaign Builder */}
      <CampaignBuilder websiteId={website.id} />
    </div>
  );
}
