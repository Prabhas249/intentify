import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRGBA(color: string): { r: number; g: number; b: number; a: number } | null {
  if (!color) return null;

  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    };
  }

  return null;
}

export function colorWithOpacity(color: string, opacity: number): string {
  const rgba = getRGBA(color);
  if (!rgba) return color;
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${opacity})`;
}

/**
 * Normalize a domain by removing protocol, www, and trailing slashes
 */
export function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .split("/")[0]; // Only keep the hostname
}

/**
 * Format a date as a relative time string (e.g., "2m ago", "3h ago")
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/**
 * Format a duration in seconds as a human-readable string (e.g., "2m", "1h 30m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Centralized plan limits configuration
 * Used across all API endpoints to ensure consistency
 */
export type PlanType = "FREE" | "STARTER" | "GROWTH" | "PRO";

export const PLAN_LIMITS = {
  FREE: {
    visitors: 1000,
    campaigns: 1,
    websites: 1,
  },
  STARTER: {
    visitors: 10000,
    campaigns: 3,
    websites: 1,
  },
  GROWTH: {
    visitors: 50000,
    campaigns: 10,
    websites: 3,
  },
  PRO: {
    visitors: 200000,
    campaigns: Infinity,
    websites: 10,
  },
} as const;

/**
 * Get plan limits with fallback to FREE plan for unknown plans
 */
export function getPlanLimits(plan: string | undefined | null) {
  const validPlan = plan && plan in PLAN_LIMITS ? (plan as PlanType) : "FREE";
  return PLAN_LIMITS[validPlan];
}
