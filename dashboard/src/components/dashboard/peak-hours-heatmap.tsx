"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function PeakHoursHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peak Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[280px] flex-col items-center justify-center text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No peak hours data yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            The heatmap will show your busiest hours once calls start coming in.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
