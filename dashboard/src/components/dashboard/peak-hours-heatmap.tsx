"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { hourlyHeatmap } from "@/data/mock-analytics";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12a" : i < 12 ? `${i}a` : i === 12 ? "12p" : `${i - 12}p`
);

function getHeatColor(value: number, max: number): string {
  if (value === 0) return "bg-muted";
  const intensity = value / max;
  if (intensity < 0.25) return "bg-emerald-200 dark:bg-emerald-900";
  if (intensity < 0.5) return "bg-emerald-400 dark:bg-emerald-700";
  if (intensity < 0.75) return "bg-emerald-600 dark:bg-emerald-500";
  return "bg-emerald-800 dark:bg-emerald-400";
}

export function PeakHoursHeatmap() {
  const maxValue = Math.max(...hourlyHeatmap.map((d) => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peak Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="mb-1 flex gap-[2px] pl-10">
              {HOURS.map((h, i) =>
                i % 3 === 0 ? (
                  <span
                    key={h}
                    className="text-[10px] text-muted-foreground"
                    style={{ width: 20, textAlign: "center" }}
                  >
                    {h}
                  </span>
                ) : (
                  <span key={h} style={{ width: 20 }} />
                )
              )}
            </div>
            {/* Grid */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-[2px]">
                <span className="w-10 text-right text-[11px] text-muted-foreground pr-2">
                  {day}
                </span>
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = hourlyHeatmap.find(
                    (h) => h.day === dayIdx && h.hour === hour
                  );
                  const value = cell?.value ?? 0;
                  return (
                    <Tooltip key={hour}>
                      <TooltipTrigger
                        render={
                          <div
                            className={cn(
                              "h-[18px] w-[20px] rounded-[3px] transition-colors",
                              getHeatColor(value, maxValue)
                            )}
                          />
                        }
                      />
                      <TooltipContent side="top" className="text-xs">
                        {day} {HOURS[hour]}: {value} calls
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
          <div className="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <div className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          <div className="h-3 w-3 rounded-sm bg-emerald-800 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
