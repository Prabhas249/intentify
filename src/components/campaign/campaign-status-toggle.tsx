"use client";

import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface CampaignStatusToggleProps {
  campaignId: string;
  status: string;
}

export function CampaignStatusToggle({
  campaignId,
  status,
}: CampaignStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(status);
  const router = useRouter();

  const isActive = currentStatus === "ACTIVE";

  async function toggleStatus() {
    const newStatus = isActive ? "PAUSED" : "ACTIVE";
    setCurrentStatus(newStatus);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Revert on error
        setCurrentStatus(currentStatus);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setCurrentStatus(currentStatus);
    }
  }

  if (currentStatus === "ARCHIVED") {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Archived
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={toggleStatus}
        disabled={isPending}
      />
      <Badge
        variant={isActive ? "default" : "secondary"}
        className={
          isActive
            ? "bg-green-100 text-green-700 hover:bg-green-100"
            : "bg-gray-100 text-gray-600"
        }
      >
        {isActive ? "Active" : "Paused"}
      </Badge>
    </div>
  );
}
