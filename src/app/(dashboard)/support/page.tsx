import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  HelpCircle,
  MessageCircle,
  Book,
  Mail,
  ExternalLink,
  FileText,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/dashboard/glass-card";
import { BlurFade } from "@/components/landing/ui/blur-fade";

export default async function SupportPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resources = [
    {
      title: "Documentation",
      description: "Learn how to use all features",
      icon: Book,
      color: "sky",
      href: "#",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: Video,
      color: "violet",
      href: "#",
    },
    {
      title: "API Reference",
      description: "Technical documentation for developers",
      icon: FileText,
      color: "emerald",
      href: "#",
    },
    {
      title: "Quick Start Guide",
      description: "Get started in 5 minutes",
      icon: Zap,
      color: "amber",
      href: "#",
    },
  ];

  const faqs = [
    {
      question: "How do I install the tracking script?",
      answer: "Go to your website settings, copy the script code, and paste it in your website's <head> tag before the closing </head>.",
    },
    {
      question: "How are visitors counted?",
      answer: "Unique visitors are tracked using cookies. Each unique browser session counts as one visitor per month.",
    },
    {
      question: "Can I use this on multiple websites?",
      answer: "Yes! You can add multiple websites depending on your plan. Free plan allows 1 website, paid plans allow more.",
    },
    {
      question: "How does intent scoring work?",
      answer: "Intent score is calculated based on visitor behavior: pages viewed, time on site, scroll depth, return visits, and pricing page visits.",
    },
    {
      question: "What happens if I exceed my visitor limit?",
      answer: "You'll receive a warning at 80% usage. At 100%, new visitors won't be tracked until you upgrade or the next billing cycle.",
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    sky: { bg: "from-sky-500/10 to-sky-600/10 border-sky-500/20", icon: "text-sky-500" },
    violet: { bg: "from-violet-500/10 to-violet-600/10 border-violet-500/20", icon: "text-violet-500" },
    emerald: { bg: "from-emerald-500/10 to-emerald-600/10 border-emerald-500/20", icon: "text-emerald-500" },
    amber: { bg: "from-amber-500/10 to-amber-600/10 border-amber-500/20", icon: "text-amber-500" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Help & Support"
        description="Get help and learn how to use the platform."
        iconSlot={<HelpCircle className="h-8 w-8 md:h-9 md:w-9 text-violet-500" />}
        badge="Support"
      />

      {/* Contact Options */}
      <div className="grid gap-4 md:grid-cols-2">
        <BlurFade delay={0.1} direction="up">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-sky-500/5 to-sky-600/5 backdrop-blur-sm p-6 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium tracking-tight mb-1">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our support team. Average response time: 5 minutes.
                </p>
                <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                  Start Chat
                </Button>
              </div>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.15} direction="up">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-violet-500/5 to-violet-600/5 backdrop-blur-sm p-6 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                <Mail className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium tracking-tight mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send us an email. We typically respond within 24 hours.
                </p>
                <Button variant="outline" className="rounded-xl border-border/50">
                  support@popupflow.in
                </Button>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>

      {/* Resources */}
      <GlassCard delay={0.2} gradient="from-sky-500/5 via-transparent to-violet-500/5" corners="top">
        <GlassCardHeader title="Resources" description="Helpful guides and documentation" />
        <GlassCardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource) => (
              <a
                key={resource.title}
                href={resource.href}
                className="group flex flex-col items-center p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-card hover:border-sky-500/30 transition-all text-center"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[resource.color].bg} border mb-3 group-hover:scale-110 transition-transform`}>
                  <resource.icon className={`h-6 w-6 ${colorClasses[resource.color].icon}`} />
                </div>
                <h4 className="font-medium mb-1">{resource.title}</h4>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
              </a>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* FAQs */}
      <GlassCard delay={0.25} gradient="from-violet-500/5 via-transparent to-emerald-500/5" corners="top">
        <GlassCardHeader title="Frequently Asked Questions" description="Quick answers to common questions" />
        <GlassCardContent>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <BlurFade key={index} delay={0.3 + index * 0.03} direction="up">
                <div className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-card transition-all">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
