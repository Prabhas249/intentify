"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Loader2, Smartphone, Monitor } from "lucide-react";
import { PopupPreview } from "./popup-preview";
import { RulesBuilder, type TriggerRule } from "./rules-builder";

interface CampaignEditorProps {
  campaignId: string;
  websiteId: string;
  initialData: CampaignData;
}

export interface CampaignData {
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

export interface PopupContent {
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
  headline: "",
  subheadline: "",
  body: "",
  ctaText: "Submit",
  ctaLink: "",
  ctaType: "close",
  whatsappNumber: "",
  whatsappMessage: "",
  imageUrl: "",
  showEmailField: true,
  showPhoneField: false,
  emailPlaceholder: "Enter your email",
  phonePlaceholder: "Enter your WhatsApp number",
  successMessage: "Thanks for subscribing!",
  styles: {
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    accentColor: "#6366f1",
    borderRadius: "12",
  },
};

export function CampaignEditor({
  campaignId,
  websiteId: _websiteId,
  initialData,
}: CampaignEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop"
  );

  // Merge initial data with defaults for any missing fields
  const mergedContent = {
    ...defaultContent,
    ...(initialData.content || {}),
    styles: {
      ...defaultContent.styles,
      ...(initialData.content?.styles || {}),
    },
  };

  const [campaign, setCampaign] = useState<CampaignData>({
    ...initialData,
    content: mergedContent,
    triggerRules: initialData.triggerRules || { conditions: [], operator: "AND" },
  });

  const updateCampaign = (field: keyof CampaignData, value: unknown) => {
    setCampaign((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateContent = (field: keyof PopupContent, value: unknown) => {
    setCampaign((prev) => ({
      ...prev,
      content: { ...prev.content, [field]: value },
    }));
    setHasChanges(true);
  };

  const updateStyles = (field: keyof PopupContent["styles"], value: string) => {
    setCampaign((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        styles: { ...prev.content.styles, [field]: value },
      },
    }));
    setHasChanges(true);
  };

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        throw new Error(error.message || "Failed to update campaign");
      }

      setHasChanges(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update campaign:", error);
      alert(error instanceof Error ? error.message : "Failed to update campaign");
    } finally {
      setIsSubmitting(false);
    }
  }

  const popupTypes = [
    { value: "MODAL", label: "Modal" },
    { value: "SLIDE_IN", label: "Slide-in" },
    { value: "BANNER", label: "Banner" },
    { value: "FLOATING", label: "Floating" },
    { value: "BOTTOM_SHEET", label: "Bottom Sheet" },
    { value: "FULL_SCREEN", label: "Full Screen" },
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
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>

          {/* Basics Tab */}
          <TabsContent value="basics" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  value={campaign.name}
                  onChange={(e) => updateCampaign("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Popup Type</Label>
                <Select
                  value={campaign.popupType}
                  onValueChange={(v) => updateCampaign("popupType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {popupTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  value={campaign.content.headline}
                  onChange={(e) => updateContent("headline", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Subheadline</Label>
                <Input
                  value={campaign.content.subheadline}
                  onChange={(e) => updateContent("subheadline", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Body Text</Label>
                <Textarea
                  value={campaign.content.body}
                  onChange={(e) => updateContent("body", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={campaign.content.imageUrl}
                  onChange={(e) => updateContent("imageUrl", e.target.value)}
                />
              </div>

              <div className="pt-4 border-t space-y-4">
                <h4 className="font-medium">Lead Capture</h4>
                <div className="flex items-center justify-between">
                  <Label>Email Field</Label>
                  <Switch
                    checked={campaign.content.showEmailField}
                    onCheckedChange={(v) => updateContent("showEmailField", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Phone Field</Label>
                  <Switch
                    checked={campaign.content.showPhoneField}
                    onCheckedChange={(v) => updateContent("showPhoneField", v)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <h4 className="font-medium">Call to Action</h4>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
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
                        placeholder="919876543210"
                        value={campaign.content.whatsappNumber}
                        onChange={(e) =>
                          updateContent("whatsappNumber", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pre-filled Message</Label>
                      <Input
                        value={campaign.content.whatsappMessage}
                        onChange={(e) =>
                          updateContent("whatsappMessage", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Background</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={campaign.content.styles.backgroundColor}
                    onChange={(e) =>
                      updateStyles("backgroundColor", e.target.value)
                    }
                    className="w-12 h-10 p-1"
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
                    onChange={(e) => updateStyles("textColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={campaign.content.styles.textColor}
                    onChange={(e) => updateStyles("textColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accent (Button)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={campaign.content.styles.accentColor}
                    onChange={(e) => updateStyles("accentColor", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={campaign.content.styles.accentColor}
                    onChange={(e) => updateStyles("accentColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={campaign.content.styles.borderRadius}
                  onChange={(e) => updateStyles("borderRadius", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
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
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !hasChanges}
          className="w-full"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
        </Button>
      </div>

      {/* Right: Preview */}
      <div className="lg:sticky lg:top-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Live Preview</h3>
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
        <PopupPreview
          content={campaign.content}
          popupType={campaign.popupType}
          device={previewDevice}
        />
      </div>
    </div>
  );
}
