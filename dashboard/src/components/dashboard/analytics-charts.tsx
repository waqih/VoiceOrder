"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

export function CallVolumeLineChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Call Volume Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[280px] flex-col items-center justify-center text-center">
          <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No data yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Call volume trends will appear here over time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Revenue (PKR)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[280px] flex-col items-center justify-center text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No revenue data yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Revenue charts will populate as orders come in.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AICompletionDonut() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI Call Resolution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[280px] flex-col items-center justify-center text-center">
          <PieChartIcon className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No resolution data yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            AI call completion stats will show here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
