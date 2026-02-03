"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Smartphone,
  Monitor,
  Sparkles,
  Zap,
  Copy,
  Check,
  Users,
  UserPlus,
  UserCheck,
  Flame,
  Instagram,
  Search,
  ChevronDown,
  ChevronUp,
  Settings2,
} from "lucide-react";
import { PopupPreview } from "./popup-preview";
import { RulesBuilder, type TriggerRule } from "./rules-builder";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/dashboard/glass-card";

interface CampaignBuilderProps {
  websiteId: string;
  initialData?: CampaignData;
}

interface CampaignData {
  name: string;
  popupType: string;
  content: PopupContent;
  triggerRules: {
    conditions: TriggerRule[];
    operator: "AND" | "OR";
  };
  frequency: string;
  priority: number;
}

interface PopupContent {
  headline: string;
  subheadline: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  ctaType: "link" | "whatsapp" | "email" | "close";
  whatsappNumber: string;
  whatsappMessage: string;
  imageUrl: string;
  showCoupon: boolean;
  couponCode: string;
  showEmailField: boolean;
  showPhoneField: boolean;
  emailPlaceholder: string;
  phonePlaceholder: string;
  successMessage: string;
  styles: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderRadius: string;
  };
}

const defaultContent: PopupContent = {
  headline: "Wait! Don't Leave Yet",
  subheadline: "Get 10% off your first order",
  body: "Subscribe to our newsletter and receive exclusive offers.",
  ctaText: "Claim My Discount",
  ctaLink: "",
  ctaType: "close",
  whatsappNumber: "",
  whatsappMessage: "Hi! I'm interested in your products.",
  imageUrl: "",
  showCoupon: false,
  couponCode: "",
  showEmailField: true,
  showPhoneField: false,
  emailPlaceholder: "Enter your email",
  phonePlaceholder: "Enter your WhatsApp number",
  successMessage: "Thanks! Check your email for the discount code.",
  styles: {
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    accentColor: "#6366f1",
    borderRadius: "12",
  },
};

const defaultCampaign: CampaignData = {
  name: "",
  popupType: "MODAL",
  content: defaultContent,
  triggerRules: {
    conditions: [],
    operator: "AND",
  },
  frequency: "ONCE_PER_SESSION",
  priority: 5,
};

export function CampaignBuilder({
  websiteId,
  initialData,
}: CampaignBuilderProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop"
  );

  const [campaign, setCampaign] = useState<CampaignData>(
    initialData || defaultCampaign
  );
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("everyone");

  // Simple presets that auto-generate rules
  const audiencePresets = [
    {
      id: "everyone",
      label: "Everyone",
      description: "Show to all visitors",
      icon: Users,
      rules: [],
    },
    {
      id: "new_visitors",
      label: "New Visitors",
      description: "First time on your site",
      icon: UserPlus,
      rules: [{ field: "visitCount", operator: "equals", value: "1" }],
    },
    {
      id: "return_visitors",
      label: "Return Visitors",
      description: "Came back 2+ times",
      icon: UserCheck,
      rules: [{ field: "visitCount", operator: "greater_than", value: "1" }],
    },
    {
      id: "high_intent",
      label: "High Intent",
      description: "Ready to buy (score 60+)",
      icon: Flame,
      rules: [{ field: "intentLevel", operator: "equals", value: "high" }],
    },
    {
      id: "from_instagram",
      label: "From Instagram",
      description: "Clicked your IG link",
      icon: Instagram,
      rules: [{ field: "utmSource", operator: "contains", value: "instagram" }],
    },
    {
      id: "from_google",
      label: "From Google",
      description: "Found you via search",
      icon: Search,
      rules: [{ field: "referrer", operator: "contains", value: "google" }],
    },
    {
      id: "mobile_users",
      label: "Mobile Users",
      description: "On phone or tablet",
      icon: Smartphone,
      rules: [{ field: "device", operator: "equals", value: "mobile" }],
    },
  ];

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = audiencePresets.find((p) => p.id === presetId);
    if (preset) {
      updateCampaign("triggerRules", {
        conditions: preset.rules as TriggerRule[],
        operator: "AND" as const,
      });
    }
  };

  const dynamicVariables = [
    { var: "{{visitCount}}", desc: "Total visits", example: "3", sampleUse: "You've visited us 3 times!" },
    { var: "{{visitOrdinal}}", desc: "Visit number", example: "3rd", sampleUse: "Welcome back for your 3rd visit!" },
    { var: "{{pagesViewed}}", desc: "Pages seen", example: "5", sampleUse: "You've explored 5 pages" },
    { var: "{{timeOnSite}}", desc: "Time spent", example: "2 min", sampleUse: "Thanks for spending 2 minutes!" },
    { var: "{{source}}", desc: "Traffic source", example: "instagram", sampleUse: "Special offer for instagram visitors!" },
    { var: "{{device}}", desc: "Device type", example: "mobile", sampleUse: "On mobile? Get our app!" },
    { var: "{{intentLevel}}", desc: "Buyer intent", example: "high", sampleUse: "Interest level: high" },
    { var: "{{returnVisitorMessage}}", desc: "Auto greeting", example: "Welcome back!", sampleUse: "Welcome back! This is visit #3" },
  ];

  const exampleTexts = [
    {
      label: "Return Visitor",
      headline: "Welcome back for your {{visitOrdinal}} visit!",
      subheadline: "We saved your cart. Here's 10% off to complete your order.",
    },
    {
      label: "Engaged Visitor",
      headline: "You've viewed {{pagesViewed}} pages!",
      subheadline: "Looks like you found something you love. Here's free shipping!",
    },
    {
      label: "Time Spender",
      headline: "Thanks for spending {{timeOnSite}} with us!",
      subheadline: "Here's a special reward for browsing - 15% off today only.",
    },
    {
      label: "New Visitor",
      headline: "Welcome! First time here?",
      subheadline: "Sign up now and get 10% off your first order.",
    },
  ];

  const copyVariable = (varName: string) => {
    navigator.clipboard.writeText(varName);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const updateCampaign = (field: keyof CampaignData, value: unknown) => {
    setCampaign((prev) => ({ ...prev, [field]: value }));
  };

  const updateContent = (field: keyof PopupContent, value: unknown) => {
    setCampaign((prev) => ({
      ...prev,
      content: { ...prev.content, [field]: value },
    }));
  };

  const updateStyles = (field: keyof PopupContent["styles"], value: string) => {
    setCampaign((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        styles: { ...prev.content.styles, [field]: value },
      },
    }));
  };

  async function handleSubmit() {
    if (!campaign.name.trim()) {
      alert("Please enter a campaign name");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteId,
          name: campaign.name,
          popupType: campaign.popupType,
          content: campaign.content,
          triggerRules: campaign.triggerRules,
          frequency: campaign.frequency,
          priority: campaign.priority,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create campaign");
      }

      await response.json();
      router.push(`/websites/${websiteId}/campaigns`);
      router.refresh();
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  }

  const popupTypes = [
    { value: "MODAL", label: "Modal", description: "Center popup with overlay" },
    { value: "SLIDE_IN", label: "Slide-in", description: "Slides from corner" },
    { value: "BANNER", label: "Banner", description: "Top or bottom bar" },
    { value: "FLOATING", label: "Floating", description: "Small floating button" },
    { value: "BOTTOM_SHEET", label: "Bottom Sheet", description: "Mobile-friendly bottom panel" },
    { value: "FULL_SCREEN", label: "Full Screen", description: "Takes entire screen" },
  ];

  const frequencyOptions = [
    { value: "EVERY_TIME", label: "Every page view" },
    { value: "ONCE_PER_SESSION", label: "Once per session" },
    { value: "ONCE_PER_DAY", label: "Once per day" },
    { value: "ONCE_PER_WEEK", label: "Once per week" },
    { value: "ONCE_EVER", label: "Once ever" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div className="space-y-6">
        <Tabs defaultValue="basics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>

          {/* Basics Tab */}
          <TabsContent value="basics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Set up the basic configuration for your campaign.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Exit Intent Discount"
                    value={campaign.name}
                    onChange={(e) => updateCampaign("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Popup Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {popupTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          campaign.popupType === type.value
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground/50"
                        }`}
                        onClick={() => updateCampaign("popupType", type.value)}
                      >
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Show Frequency</Label>
                  <Select
                    value={campaign.frequency}
                    onValueChange={(v) => updateCampaign("frequency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority (1-10)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={campaign.priority}
                      onChange={(e) =>
                        updateCampaign(
                          "priority",
                          Math.min(10, Math.max(1, parseInt(e.target.value) || 5))
                        )
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      Higher priority popups show first
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Popup Content</CardTitle>
                <CardDescription>
                  Design your popup message and call-to-action.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input
                    placeholder="Main headline"
                    value={campaign.content.headline}
                    onChange={(e) => updateContent("headline", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subheadline</Label>
                  <Input
                    placeholder="Supporting text"
                    value={campaign.content.subheadline}
                    onChange={(e) => updateContent("subheadline", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Body Text</Label>
                  <Textarea
                    placeholder="Additional description..."
                    value={campaign.content.body}
                    onChange={(e) => updateContent("body", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image URL (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={campaign.content.imageUrl}
                    onChange={(e) => updateContent("imageUrl", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Variables Card - Glassmorphism Style */}
            <GlassCard gradient="from-violet-500/5 via-transparent to-sky-500/5" corners="top">
              <GlassCardHeader
                title="Personalization Magic ✨"
                description="Make every popup feel personal. Click templates to use, or copy variables."
                icon={<Zap className="h-5 w-5 text-violet-500" />}
              />
              <GlassCardContent className="space-y-5">
                {/* Quick Templates */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Quick Templates</p>
                  <div className="grid gap-2">
                    {exampleTexts.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-violet-500/5 hover:border-violet-500/30 transition-all cursor-pointer group"
                        onClick={() => {
                          updateContent("headline", ex.headline);
                          updateContent("subheadline", ex.subheadline);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-violet-600">{ex.label}</span>
                          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Click to use →</span>
                        </div>
                        <p className="text-sm font-medium">{ex.headline}</p>
                        <p className="text-xs text-muted-foreground">{ex.subheadline}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variables Table */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Available Variables</p>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border/50">
                          <th className="text-left p-3 font-medium text-xs text-muted-foreground">Variable</th>
                          <th className="text-left p-3 font-medium text-xs text-muted-foreground">Output</th>
                          <th className="text-left p-3 font-medium text-xs text-muted-foreground hidden sm:table-cell">Example Usage</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {dynamicVariables.map((v, i) => (
                          <tr
                            key={v.var}
                            className={`border-b border-border/30 last:border-0 hover:bg-violet-500/5 transition-colors group ${i % 2 === 0 ? 'bg-background/30' : 'bg-background/50'}`}
                          >
                            <td className="p-3">
                              <code className="text-xs font-mono text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                {v.var}
                              </code>
                            </td>
                            <td className="p-3">
                              <span className="text-xs text-sky-600 font-medium">{v.example}</span>
                            </td>
                            <td className="p-3 hidden sm:table-cell">
                              <span className="text-xs text-muted-foreground italic">&ldquo;{v.sampleUse}&rdquo;</span>
                            </td>
                            <td className="p-3">
                              <button
                                className="p-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
                                onClick={() => copyVariable(v.var)}
                                title="Copy variable"
                              >
                                {copiedVar === v.var ? (
                                  <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Tip: Content vs Rules */}
            <div className="flex gap-3 p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20">
                <Sparkles className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Content vs Rules</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Content</strong> = What the popup says (personalizes text for everyone who sees it).
                  <br />
                  <strong>Rules</strong> = Who sees the popup (filters which visitors get it).
                  <br />
                  <span className="text-sky-600">Use both together for targeted + personalized popups!</span>
                </p>
              </div>
            </div>

            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle>Discount Coupon</CardTitle>
                <CardDescription>
                  Show a coupon code visitors can copy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Coupon Code</Label>
                    <p className="text-xs text-muted-foreground">
                      Display a copyable discount code
                    </p>
                  </div>
                  <Switch
                    checked={campaign.content.showCoupon}
                    onCheckedChange={(v) => updateContent("showCoupon", v)}
                  />
                </div>

                {campaign.content.showCoupon && (
                  <>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-700">
                        <strong>Note:</strong> Create this coupon in your store first (Shopify, WooCommerce, etc.).
                        We display the code - your store validates it at checkout.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Coupon Code</Label>
                      <Input
                        placeholder="e.g., SAVE10, WELCOME20"
                        value={campaign.content.couponCode || ""}
                        onChange={(e) =>
                          updateContent("couponCode", e.target.value.toUpperCase())
                        }
                        className="font-mono text-lg tracking-wider"
                      />
                      <p className="text-xs text-muted-foreground">
                        Visitors will see this code with a copy button
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Lead Capture */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Capture (Optional)</CardTitle>
                <CardDescription>
                  Collect visitor information before showing coupon.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Field</Label>
                    <p className="text-xs text-muted-foreground">
                      Collect email addresses
                    </p>
                  </div>
                  <Switch
                    checked={campaign.content.showEmailField}
                    onCheckedChange={(v) => updateContent("showEmailField", v)}
                  />
                </div>

                {campaign.content.showEmailField && (
                  <Input
                    placeholder="Email placeholder text"
                    value={campaign.content.emailPlaceholder}
                    onChange={(e) =>
                      updateContent("emailPlaceholder", e.target.value)
                    }
                  />
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>WhatsApp Number Field</Label>
                    <p className="text-xs text-muted-foreground">
                      Collect phone numbers
                    </p>
                  </div>
                  <Switch
                    checked={campaign.content.showPhoneField}
                    onCheckedChange={(v) => updateContent("showPhoneField", v)}
                  />
                </div>

                {campaign.content.showPhoneField && (
                  <Input
                    placeholder="Phone placeholder text"
                    value={campaign.content.phonePlaceholder}
                    onChange={(e) =>
                      updateContent("phonePlaceholder", e.target.value)
                    }
                  />
                )}

                <div className="space-y-2">
                  <Label>Success Message</Label>
                  <Input
                    placeholder="Thanks for subscribing!"
                    value={campaign.content.successMessage}
                    onChange={(e) =>
                      updateContent("successMessage", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Call to Action</CardTitle>
                <CardDescription>
                  Configure the main button action.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    placeholder="e.g., Get My Discount"
                    value={campaign.content.ctaText}
                    onChange={(e) => updateContent("ctaText", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Action</Label>
                  <Select
                    value={campaign.content.ctaType}
                    onValueChange={(v) => updateContent("ctaType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="close">Submit & Close</SelectItem>
                      <SelectItem value="link">Go to Link</SelectItem>
                      <SelectItem value="whatsapp">Open WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {campaign.content.ctaType === "link" && (
                  <div className="space-y-2">
                    <Label>Link URL</Label>
                    <Input
                      placeholder="https://..."
                      value={campaign.content.ctaLink}
                      onChange={(e) => updateContent("ctaLink", e.target.value)}
                    />
                  </div>
                )}

                {campaign.content.ctaType === "whatsapp" && (
                  <>
                    <div className="space-y-2">
                      <Label>WhatsApp Number</Label>
                      <Input
                        placeholder="919876543210 (with country code)"
                        value={campaign.content.whatsappNumber}
                        onChange={(e) =>
                          updateContent("whatsappNumber", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pre-filled Message</Label>
                      <Input
                        placeholder="Hi! I'm interested..."
                        value={campaign.content.whatsappMessage}
                        onChange={(e) =>
                          updateContent("whatsappMessage", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visual Style</CardTitle>
                <CardDescription>
                  Customize the look of your popup.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={campaign.content.styles.backgroundColor}
                        onChange={(e) =>
                          updateStyles("backgroundColor", e.target.value)
                        }
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={campaign.content.styles.backgroundColor}
                        onChange={(e) =>
                          updateStyles("backgroundColor", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={campaign.content.styles.textColor}
                        onChange={(e) =>
                          updateStyles("textColor", e.target.value)
                        }
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={campaign.content.styles.textColor}
                        onChange={(e) =>
                          updateStyles("textColor", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Accent Color (Button)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={campaign.content.styles.accentColor}
                        onChange={(e) =>
                          updateStyles("accentColor", e.target.value)
                        }
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={campaign.content.styles.accentColor}
                        onChange={(e) =>
                          updateStyles("accentColor", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Border Radius (px)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={campaign.content.styles.borderRadius}
                      onChange={(e) =>
                        updateStyles("borderRadius", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block">Quick Themes</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        name: "Clean White",
                        bg: "#ffffff",
                        text: "#1a1a1a",
                        accent: "#6366f1",
                      },
                      {
                        name: "Dark Mode",
                        bg: "#1a1a1a",
                        text: "#ffffff",
                        accent: "#22c55e",
                      },
                      {
                        name: "Ocean Blue",
                        bg: "#0ea5e9",
                        text: "#ffffff",
                        accent: "#fbbf24",
                      },
                      {
                        name: "Sunset",
                        bg: "#f97316",
                        text: "#ffffff",
                        accent: "#1a1a1a",
                      },
                      {
                        name: "Forest",
                        bg: "#166534",
                        text: "#ffffff",
                        accent: "#fde047",
                      },
                      {
                        name: "Purple",
                        bg: "#7c3aed",
                        text: "#ffffff",
                        accent: "#fbbf24",
                      },
                    ].map((theme) => (
                      <Badge
                        key={theme.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => {
                          updateStyles("backgroundColor", theme.bg);
                          updateStyles("textColor", theme.text);
                          updateStyles("accentColor", theme.accent);
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: theme.bg }}
                        />
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Who should see this popup?</CardTitle>
                <CardDescription>
                  Choose your target audience. We&apos;ll handle the technical stuff.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Simple Presets Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {audiencePresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPreset === preset.id
                          ? "border-violet-500 bg-violet-500/5"
                          : "border-border/50 hover:border-violet-500/50 hover:bg-muted/50"
                      }`}
                      onClick={() => handlePresetSelect(preset.id)}
                    >
                      {selectedPreset === preset.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-violet-500" />
                        </div>
                      )}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${
                        selectedPreset === preset.id
                          ? "bg-violet-500/20"
                          : "bg-muted"
                      }`}>
                        <preset.icon className={`h-5 w-5 ${
                          selectedPreset === preset.id
                            ? "text-violet-500"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <p className="font-medium text-sm">{preset.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Advanced Toggle */}
                <div className="pt-4 border-t">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowAdvancedRules(!showAdvancedRules)}
                  >
                    <Settings2 className="h-4 w-4" />
                    <span>Advanced Rules</span>
                    {showAdvancedRules ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {showAdvancedRules && (
                    <div className="mt-4 p-4 rounded-xl border border-border/50 bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-3">
                        Build custom rules for power users. This overrides the preset above.
                      </p>
                      <RulesBuilder
                        rules={campaign.triggerRules.conditions}
                        operator={campaign.triggerRules.operator}
                        onRulesChange={(rules) => {
                          setSelectedPreset(""); // Clear preset when manually editing
                          updateCampaign("triggerRules", {
                            ...campaign.triggerRules,
                            conditions: rules,
                          });
                        }}
                        onOperatorChange={(op) =>
                          updateCampaign("triggerRules", {
                            ...campaign.triggerRules,
                            operator: op,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Intent Score Explanation */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <Flame className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">How &ldquo;High Intent&rdquo; works</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We auto-calculate a 0-100 score based on: return visits, time spent,
                      pages viewed, scroll depth, and if they viewed pricing. Score 60+ = High Intent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/websites/${websiteId}/campaigns`}>Cancel</Link>
          </Button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="lg:sticky lg:top-6 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PopupPreview
              content={campaign.content}
              popupType={campaign.popupType}
              device={previewDevice}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
