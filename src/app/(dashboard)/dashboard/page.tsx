import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Users, Megaphone, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  // Get user stats
  const [websiteCount, campaignCount, visitorCount] = await Promise.all([
    db.website.count({ where: { userId: session?.user?.id } }),
    db.campaign.count({
      where: { website: { userId: session?.user?.id } },
    }),
    db.visitor.count({
      where: { website: { userId: session?.user?.id } },
    }),
  ]);

  const stats = [
    {
      title: "Websites",
      value: websiteCount,
      icon: Globe,
      href: "/websites",
      color: "text-blue-500",
    },
    {
      title: "Campaigns",
      value: campaignCount,
      icon: Megaphone,
      href: "/campaigns",
      color: "text-purple-500",
    },
    {
      title: "Visitors Tracked",
      value: visitorCount,
      icon: Users,
      href: "/visitors",
      color: "text-green-500",
    },
    {
      title: "Conversion Rate",
      value: "0%",
      icon: TrendingUp,
      href: "/analytics",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Here&apos;s what&apos;s happening with your popups today.
          </p>
        </div>
        <Button asChild>
          <Link href="/websites/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Website
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium leading-none text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <Link
                href={stat.href}
                className="text-xs text-muted-foreground hover:underline"
              >
                View all &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start */}
      {websiteCount === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Add your first website to start tracking visitors and showing smart
              popups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold tracking-tight">Add your website</h4>
                <p className="leading-7 text-muted-foreground">
                  Enter your domain to get a unique tracking script.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold tracking-tight">Install the script</h4>
                <p className="leading-7 text-muted-foreground">
                  Copy and paste one line of code into your website.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold tracking-tight">Create your first popup</h4>
                <p className="leading-7 text-muted-foreground">
                  Design a popup and set smart triggers based on visitor behavior.
                </p>
              </div>
            </div>
            <Button asChild className="mt-4">
              <Link href="/websites/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Website
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
