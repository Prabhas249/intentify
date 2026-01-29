import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Globe,
  Copy,
  ExternalLink,
  Megaphone,
  Users,
  Code,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/dashboard/copy-button";

export default async function WebsiteDetailPage({
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
    include: {
      _count: {
        select: {
          campaigns: true,
          visitors: true,
        },
      },
    },
  });

  if (!website) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const scriptCode = `<script src="${appUrl}/embed/tracker.js" data-key="${website.scriptKey}" async></script>`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/websites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            {website.domain}
          </h1>
          <p className="text-muted-foreground">
            Added {new Date(website.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" asChild>
          <a
            href={`https://${website.domain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Site
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{website._count.campaigns}</div>
            <Link
              href={`/websites/${website.id}/campaigns`}
              className="text-xs text-muted-foreground hover:underline"
            >
              Manage campaigns &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{website._count.visitors}</div>
            <Link
              href={`/visitors?website=${website.id}`}
              className="text-xs text-muted-foreground hover:underline"
            >
              View visitors &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Script key: {website.scriptKey.slice(0, 8)}...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Installation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Installation Script
          </CardTitle>
          <CardDescription>
            Copy and paste this script into your website&apos;s{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              &lt;head&gt;
            </code>{" "}
            tag.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{scriptCode}</code>
            </pre>
            <CopyButton text={scriptCode} className="absolute top-2 right-2" />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Installation Instructions</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                <span>
                  Copy the script above by clicking the copy button.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                <span>
                  Open your website&apos;s HTML and find the{" "}
                  <code className="bg-muted px-1 rounded">&lt;head&gt;</code>{" "}
                  section.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                <span>
                  Paste the script just before the closing{" "}
                  <code className="bg-muted px-1 rounded">&lt;/head&gt;</code>{" "}
                  tag.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  4
                </span>
                <span>
                  Save and publish your website. Visitors will start being
                  tracked immediately!
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Platform-specific guides</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Shopify</Badge>
              <Badge variant="outline">WordPress</Badge>
              <Badge variant="outline">Webflow</Badge>
              <Badge variant="outline">Wix</Badge>
              <Badge variant="outline">Custom HTML</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Works with any website platform that allows custom scripts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
