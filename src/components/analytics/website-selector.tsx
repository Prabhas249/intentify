"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

interface Website {
  id: string;
  domain: string;
}

interface WebsiteSelectorProps {
  websites: Website[];
  selectedId: string;
  period: string;
}

export function WebsiteSelector({
  websites,
  selectedId,
  period,
}: WebsiteSelectorProps) {
  const router = useRouter();

  function handleChange(websiteId: string) {
    router.push(`/analytics?website=${websiteId}&period=${period}`);
  }

  return (
    <Select value={selectedId} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Select website" />
      </SelectTrigger>
      <SelectContent>
        {websites.map((website) => (
          <SelectItem key={website.id} value={website.id}>
            {website.domain}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
