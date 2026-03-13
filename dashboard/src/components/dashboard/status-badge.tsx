"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  color: string;
  bg: string;
  pulse?: boolean;
}

export function StatusBadge({ label, color, bg, pulse }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        color,
        bg
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", bg)} />
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", bg)} />
        </span>
      )}
      {label}
    </span>
  );
}
