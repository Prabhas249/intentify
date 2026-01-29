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
  Plus,
  Trash2,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { PopupPreview } from "./popup-preview";
import { RulesBuilder, type TriggerRule } from "./rules-builder";

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

      const data = await response.json();
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

            <Card>
              <CardHeader>
                <CardTitle>Lead Capture</CardTitle>
                <CardDescription>
                  Collect visitor information.
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
                <CardTitle>Trigger Rules</CardTitle>
                <CardDescription>
                  Define when this popup should appear. Leave empty to show to
                  everyone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RulesBuilder
                  rules={campaign.triggerRules.conditions}
                  operator={campaign.triggerRules.operator}
                  onRulesChange={(rules) =>
                    updateCampaign("triggerRules", {
                      ...campaign.triggerRules,
                      conditions: rules,
                    })
                  }
                  onOperatorChange={(op) =>
                    updateCampaign("triggerRules", {
                      ...campaign.triggerRules,
                      operator: op,
                    })
                  }
                />
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
