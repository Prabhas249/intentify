import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

// Demo user IDs (geo-based)
const DEMO_USER_INR = "cml66aybb0000yefsjavxkfb5";
const DEMO_USER_USD = "cml66hzz280fsyefsv71bm5ed";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ExternalLink,
  Megaphone,
  Users,
  Code,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Zap,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/dashboard/copy-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/dashboard/glass-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PrimaryButton } from "@/components/dashboard/primary-button";
import { BlurFade } from "@/components/landing/ui/blur-fade";
import { Button } from "@/components/ui/button";

export default async function WebsiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";
  const isIndia = country === "IN";
  const demoUserId = isIndia ? DEMO_USER_INR : DEMO_USER_USD;
  const userId = session?.user?.id || demoUserId;

  const website = await db.website.findFirst({
    where: {
      id,
      userId,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BlurFade delay={0} direction="up">
          <Button variant="ghost" size="icon" asChild className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-sky-500/30">
            <Link href="/websites">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </BlurFade>
        <PageHeader
          title={website.domain}
          description={`Added ${new Date(website.createdAt).toLocaleDateString()}`}
          iconSlot={<Globe className="h-8 w-8 md:h-9 md:w-9 text-sky-500" />}
          badge="Website"
          className="flex-1"
        >
          <Button variant="outline" asChild className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-sky-500/30">
            <a
              href={`https://${website.domain}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Site
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </PageHeader>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Campaigns"
          value={website._count.campaigns}
          subtitle={
            <Link
              href={`/websites/${website.id}/campaigns`}
              className="text-sky-500 hover:text-sky-600 transition-colors"
            >
              Manage campaigns &rarr;
            </Link>
          }
          iconSlot={<Megaphone className="h-3.5 w-3.5 text-violet-500" />}
          gradient="from-violet-500/10 to-violet-600/5"
          delay={0.1}
        />
        <StatCard
          title="Visitors"
          value={website._count.visitors}
          subtitle={
            <Link
              href={`/visitors?website=${website.id}`}
              className="text-sky-500 hover:text-sky-600 transition-colors"
            >
              View visitors &rarr;
            </Link>
          }
          iconSlot={<Users className="h-3.5 w-3.5 text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
          delay={0.15}
        />
        <StatCard
          title="Status"
          value={
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20">
              Active
            </Badge>
          }
          subtitle={`Script key: ${website.scriptKey.slice(0, 8)}...`}
          iconSlot={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
          delay={0.2}
        />
      </div>

      {/* Quick Actions */}
      <BlurFade delay={0.25} direction="up">
        <div className="flex gap-3">
          <PrimaryButton asChild>
            <Link href={`/websites/${website.id}/campaigns/new`}>
              <Megaphone className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </PrimaryButton>
          <Button variant="outline" asChild className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-violet-500/30">
            <Link href={`/websites/${website.id}/campaigns`}>
              <Zap className="mr-2 h-4 w-4" />
              View Campaigns
            </Link>
          </Button>
        </div>
      </BlurFade>

      {/* Installation Script */}
      <GlassCard delay={0.3} gradient="from-sky-500/5 via-transparent to-violet-500/5" corners="all">
        <GlassCardHeader
          title="Installation Script"
          description={
            <>
              Copy and paste this script into your website&apos;s{" "}
              <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
                &lt;head&gt;
              </code>{" "}
              tag.
            </>
          }
          icon={<Code className="h-5 w-5 text-sky-500" />}
        />
        <GlassCardContent className="space-y-6">
          <div className="relative">
            <pre className="bg-muted/30 backdrop-blur-sm p-4 rounded-xl overflow-x-auto text-sm border border-border/50">
              <code className="text-muted-foreground">{scriptCode}</code>
            </pre>
            <CopyButton text={scriptCode} className="absolute top-3 right-3" />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium tracking-tight">Installation Instructions</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              {[
                "Copy the script above by clicking the copy button.",
                <>Open your website&apos;s HTML and find the <code className="bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">&lt;head&gt;</code> section.</>,
                <>Paste the script just before the closing <code className="bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">&lt;/head&gt;</code> tag.</>,
                "Save and publish your website. Visitors will start being tracked immediately!",
              ].map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 text-xs text-white font-medium shadow-sm">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 p-4 bg-card/30 backdrop-blur-sm">
            <h4 className="font-medium tracking-tight mb-3">Platform-specific guides</h4>
            <div className="flex flex-wrap gap-2">
              {["Shopify", "WordPress", "Webflow", "Wix", "Custom HTML"].map((platform) => (
                <Badge
                  key={platform}
                  variant="outline"
                  className="rounded-lg border-border/50 bg-muted/30"
                >
                  {platform}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Works with any website platform that allows custom scripts.
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Conversion Tracking Setup */}
      <ConversionTrackingSetup />
    </div>
  );
}

// Conversion Tracking Setup Component
function ConversionTrackingSetup() {
  const shopifyCode = `{% if first_time_accessed %}
<script>
  window._pt && window._pt.convert({
    amount: {{ total_price | money_without_currency | remove: ',' }},
    orderId: "{{ order.name }}",
    coupon: "{{ discount_applications[0].title | default: '' }}"
  });
</script>
{% endif %}`;

  const woocommerceCode = `<?php
// Add to your theme's functions.php or a custom plugin
add_action('woocommerce_thankyou', 'popuptool_track_conversion');
function popuptool_track_conversion($order_id) {
  $order = wc_get_order($order_id);
  $coupon_codes = $order->get_coupon_codes();
  ?>
  <script>
    window._pt && window._pt.convert({
      amount: <?php echo $order->get_total() * 100; ?>,
      orderId: "<?php echo $order_id; ?>",
      coupon: "<?php echo !empty($coupon_codes) ? $coupon_codes[0] : ''; ?>"
    });
  </script>
  <?php
}`;

  const customCode = `<!-- Add this to your order confirmation/thank-you page -->
<script>
  window._pt && window._pt.convert({
    amount: ORDER_AMOUNT_IN_PAISE, // e.g., 149900 for ₹1,499
    orderId: "YOUR_ORDER_ID",
    coupon: "COUPON_CODE_IF_USED" // optional
  });
</script>`;

  return (
    <GlassCard delay={0.35} gradient="from-emerald-500/5 via-transparent to-amber-500/5" corners="all">
      <GlassCardHeader
        title="Conversion Tracking"
        description="Track actual purchases to measure popup ROI and revenue."
        icon={<IndianRupee className="h-5 w-5 text-emerald-500" />}
      />
      <GlassCardContent className="space-y-6">
        {/* Why track conversions */}
        <div className="rounded-xl border border-emerald-500/20 p-4 bg-emerald-500/5">
          <div className="flex gap-3">
            <ShoppingBag className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Why add conversion tracking?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                See which popups actually drive sales. Track revenue, coupon usage, and conversion rates.
                Without this, you only see clicks - not actual purchases.
              </p>
            </div>
          </div>
        </div>

        {/* Platform tabs */}
        <Tabs defaultValue="shopify" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-1">
            <TabsTrigger value="shopify" className="rounded-lg data-[state=active]:bg-card">Shopify</TabsTrigger>
            <TabsTrigger value="woocommerce" className="rounded-lg data-[state=active]:bg-card">WooCommerce</TabsTrigger>
            <TabsTrigger value="custom" className="rounded-lg data-[state=active]:bg-card">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="shopify" className="mt-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Shopify Installation</h4>
              <p className="text-xs text-muted-foreground">
                Add this code to your Shopify checkout settings → Additional scripts.
              </p>
            </div>
            <div className="relative">
              <pre className="bg-muted/30 backdrop-blur-sm p-4 rounded-xl overflow-x-auto text-xs border border-border/50">
                <code className="text-muted-foreground whitespace-pre">{shopifyCode}</code>
              </pre>
              <CopyButton text={shopifyCode} className="absolute top-3 right-3" />
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to Shopify Admin → Settings → Checkout</li>
                <li>Scroll to &quot;Order status page&quot; section</li>
                <li>Find &quot;Additional scripts&quot; text box</li>
                <li>Paste the code above and save</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="woocommerce" className="mt-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">WooCommerce Installation</h4>
              <p className="text-xs text-muted-foreground">
                Add this code to your theme&apos;s functions.php or a custom plugin.
              </p>
            </div>
            <div className="relative">
              <pre className="bg-muted/30 backdrop-blur-sm p-4 rounded-xl overflow-x-auto text-xs border border-border/50">
                <code className="text-muted-foreground whitespace-pre">{woocommerceCode}</code>
              </pre>
              <CopyButton text={woocommerceCode} className="absolute top-3 right-3" />
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to WordPress Admin → Appearance → Theme Editor</li>
                <li>Open functions.php from your child theme</li>
                <li>Paste the code at the end of the file</li>
                <li>Save the file</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Custom Installation</h4>
              <p className="text-xs text-muted-foreground">
                Add this code to your order confirmation / thank-you page.
              </p>
            </div>
            <div className="relative">
              <pre className="bg-muted/30 backdrop-blur-sm p-4 rounded-xl overflow-x-auto text-xs border border-border/50">
                <code className="text-muted-foreground whitespace-pre">{customCode}</code>
              </pre>
              <CopyButton text={customCode} className="absolute top-3 right-3" />
            </div>
            <div className="rounded-xl border border-amber-500/20 p-3 bg-amber-500/5 mt-4">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Note:</strong> Replace the placeholder values with your actual order data.
                Amount should be in paise (multiply rupees by 100).
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* API Reference */}
        <div className="rounded-xl border border-border/50 p-4 bg-card/30 backdrop-blur-sm">
          <h4 className="font-medium tracking-tight mb-3 text-sm">API Reference</h4>
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-3 gap-2 font-mono">
              <span className="text-muted-foreground">amount</span>
              <span className="col-span-2">Order total in paise (₹1,499 = 149900)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <span className="text-muted-foreground">orderId</span>
              <span className="col-span-2">Your store&apos;s order ID</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <span className="text-muted-foreground">coupon</span>
              <span className="col-span-2">Coupon code used (optional)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <span className="text-muted-foreground">currency</span>
              <span className="col-span-2">Currency code, defaults to INR (optional)</span>
            </div>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
