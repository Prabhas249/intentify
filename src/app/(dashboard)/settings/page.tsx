import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  Code,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/dashboard/glass-card";
import { BlurFade } from "@/components/landing/ui/blur-fade";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          websites: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const planLabels: Record<string, string> = {
    FREE: "Free",
    STARTER: "Starter",
    GROWTH: "Growth",
    PRO: "Pro",
  };

  const planColors: Record<string, string> = {
    FREE: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    STARTER: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    GROWTH: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    PRO: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
        iconSlot={<Settings className="h-8 w-8 md:h-9 md:w-9 text-slate-500" />}
        badge="Account"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <GlassCard delay={0.1} gradient="from-sky-500/5 via-transparent to-violet-500/5" corners="top">
            <GlassCardHeader
              title="Profile"
              description="Your personal information."
              icon={<User className="h-5 w-5 text-sky-500" />}
            />
            <GlassCardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <div className="p-3 rounded-xl border border-border/50 bg-background/50">
                    {user.name || "Not set"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="p-3 rounded-xl border border-border/50 bg-background/50">
                    {user.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <div className="p-3 rounded-xl border border-border/50 bg-background/50">
                    {user.company || "Not set"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <div className="p-3 rounded-xl border border-border/50 bg-background/50">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="rounded-xl border-border/50">
                  Edit Profile
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Notifications */}
          <GlassCard delay={0.15} gradient="from-violet-500/5 via-transparent to-emerald-500/5" corners="top">
            <GlassCardHeader
              title="Notifications"
              description="Configure how you receive updates."
              icon={<Bell className="h-5 w-5 text-violet-500" />}
            />
            <GlassCardContent className="space-y-4">
              {[
                { label: "Weekly analytics report", description: "Receive a summary of your popup performance", enabled: true },
                { label: "Visitor milestones", description: "Get notified when you reach visitor goals", enabled: true },
                { label: "Campaign performance alerts", description: "Alerts for significant conversion changes", enabled: false },
                { label: "Product updates", description: "New features and improvements", enabled: true },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className={`h-6 w-11 rounded-full transition-colors ${item.enabled ? "bg-sky-500" : "bg-muted"} relative cursor-pointer`}>
                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? "translate-x-6" : "translate-x-1"}`} />
                  </div>
                </div>
              ))}
            </GlassCardContent>
          </GlassCard>

          {/* API & Integrations */}
          <GlassCard delay={0.2} gradient="from-emerald-500/5 via-transparent to-sky-500/5" corners="top">
            <GlassCardHeader
              title="API & Integrations"
              description="Connect with other services."
              icon={<Code className="h-5 w-5 text-emerald-500" />}
            />
            <GlassCardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">API Access</p>
                  <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Pro Plan
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  API access is available on Pro plan. Upgrade to get programmatic access to your data.
                </p>
                <Button variant="outline" className="rounded-xl border-border/50" disabled>
                  Generate API Key
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Zapier", "Slack", "Webhook"].map((integration) => (
                  <div key={integration} className="p-3 rounded-xl border border-border/50 bg-background/50 flex items-center justify-between">
                    <span className="font-medium">{integration}</span>
                    <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard delay={0.25} gradient="from-rose-500/5 via-transparent to-rose-500/5" corners="top">
            <GlassCardHeader
              title="Danger Zone"
              description="Irreversible actions."
              icon={<Trash2 className="h-5 w-5 text-rose-500" />}
            />
            <GlassCardContent>
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <p className="font-medium text-rose-600 mb-2">Delete Account</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="rounded-xl">
                  Delete Account
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan Info */}
          <BlurFade delay={0.1} direction="up">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-600/10 border border-sky-500/20">
                  <CreditCard className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <p className="font-medium">Current Plan</p>
                  <Badge className={`${planColors[user.plan]} border mt-1`}>
                    {planLabels[user.plan]}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Websites</span>
                  <span className="font-medium">{user._count.websites}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visitors Used</span>
                  <span className="font-medium">{user.visitorsUsedThisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Cycle</span>
                  <span className="font-medium">
                    {user.billingCycleStart
                      ? new Date(user.billingCycleStart).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                      : "N/A"}
                  </span>
                </div>
              </div>
              <Button className="w-full mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                Upgrade Plan
              </Button>
            </div>
          </BlurFade>

          {/* Security */}
          <BlurFade delay={0.15} direction="up">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium">Security</p>
                  <p className="text-sm text-muted-foreground">Account protection</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full rounded-xl border-border/50 justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full rounded-xl border-border/50 justify-start">
                  Two-Factor Auth
                </Button>
                <Button variant="outline" className="w-full rounded-xl border-border/50 justify-start">
                  Active Sessions
                </Button>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
