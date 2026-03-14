"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export function CallVolumeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Call Volume & Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px] flex-col items-center justify-center text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">No call data yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Charts will appear once your AI assistant starts handling calls.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
