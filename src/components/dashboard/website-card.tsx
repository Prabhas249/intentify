"use client";

import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, MoreHorizontal, Megaphone, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WebsiteCardProps {
  website: {
    id: string;
    domain: string;
    createdAt: Date;
    _count: {
      campaigns: number;
      visitors: number;
    };
  };
}

export function WebsiteCard({ website }: WebsiteCardProps) {
  return (
    <Link
      href={`/websites/${website.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300",
        "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)]",
        "hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 hover:border-sky-500/30"
      )}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 group-hover:scale-110 transition-transform">
            <Globe className="h-6 w-6 text-sky-500" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem asChild>
                <Link href={`/websites/${website.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/websites/${website.id}`}>Get Script</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://${website.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Site
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium tracking-tight group-hover:text-sky-500 transition-colors">
            {website.domain}
          </h3>
          <p className="text-sm text-muted-foreground">
            Added {new Date(website.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-medium">{website._count.campaigns}</span>
            <span className="text-xs text-muted-foreground">campaigns</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">{website._count.visitors}</span>
            <span className="text-xs text-muted-foreground">visitors</span>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
        </div>
      </div>
    </Link>
  );
}
