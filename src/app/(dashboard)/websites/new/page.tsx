"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe, Loader2, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export default function NewWebsitePage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean domain
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");

    if (!cleanDomain) {
      toast.error("Please enter a valid domain");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: cleanDomain }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add website");
      }

      toast.success("Website added successfully!");
      router.push(`/websites/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" asChild className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-sky-500/30">
          <Link href="/websites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-sky-600/10 border border-sky-500/20">
            <Plus className="h-6 w-6 md:h-7 md:w-7 text-sky-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-600 border border-sky-500/20">
                <Sparkles className="h-3 w-3" />
                Setup
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight">Add Website</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Add a new website to start tracking visitors.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={cn(
          "relative max-w-lg overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
          "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)]"
        )}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-violet-500/5 opacity-50" />

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-sky-500/30 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-sky-500/30 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-sky-500/30 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-sky-500/30 rounded-br-lg" />

        <div className="relative p-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
              <Globe className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <h2 className="text-lg font-medium tracking-tight">Website Domain</h2>
              <p className="text-sm text-muted-foreground">
                Enter your website domain to generate a tracking script.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-medium">Domain</Label>
              <div className="flex">
                <span className="flex items-center rounded-l-xl border border-r-0 border-border/50 bg-muted/50 px-3 text-sm text-muted-foreground">
                  https://
                </span>
                <Input
                  id="domain"
                  placeholder="mystore.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="rounded-l-none rounded-r-xl border-border/50 bg-background/50 focus:border-sky-500/50 focus:ring-sky-500/20"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter without http:// or www. prefix
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full rounded-xl h-11 font-medium",
                "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700",
                "shadow-[0_0_0_1px_rgba(14,165,233,0.2),0_2px_4px_rgba(14,165,233,0.1),0_4px_8px_rgba(14,165,233,0.1)]",
                "hover:shadow-[0_0_0_1px_rgba(14,165,233,0.3),0_4px_8px_rgba(14,165,233,0.2),0_8px_16px_rgba(14,165,233,0.2)]",
                "transition-all duration-300"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Website
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Help Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-lg rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4"
      >
        <h4 className="font-medium tracking-tight mb-2 text-sm">Supported Platforms</h4>
        <div className="flex flex-wrap gap-2">
          {["Shopify", "WordPress", "Webflow", "Wix", "Squarespace", "Custom HTML"].map((platform) => (
            <span
              key={platform}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50"
            >
              {platform}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Works with any website that allows custom scripts.
        </p>
      </motion.div>
    </div>
  );
}
