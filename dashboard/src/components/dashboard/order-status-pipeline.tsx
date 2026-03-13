"use client";

import { OrderStatus } from "@/data/types";
import { ORDER_PIPELINE_STEPS, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OrderStatusPipelineProps {
  currentStatus: OrderStatus;
}

export function OrderStatusPipeline({ currentStatus }: OrderStatusPipelineProps) {
  if (currentStatus === OrderStatus.Cancelled) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Order Cancelled
      </div>
    );
  }

  const currentIndex = ORDER_PIPELINE_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1">
      {ORDER_PIPELINE_STEPS.map((step, i) => {
        const config = ORDER_STATUS_CONFIG[step];
        const isComplete = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                isComplete
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground/50"
              )}
            >
              {isComplete && !isCurrent ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
            </div>
            {i < ORDER_PIPELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-6",
                  i < currentIndex ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
      <span className="ml-2 text-xs font-medium text-muted-foreground">
        {ORDER_STATUS_CONFIG[currentStatus].label}
      </span>
    </div>
  );
}
