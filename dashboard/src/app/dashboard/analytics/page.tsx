"use client";

import { PageTransition } from "@/components/dashboard/page-transition";
import {
  CallVolumeLineChart,
  RevenueBarChart,
  AICompletionDonut,
} from "@/components/dashboard/analytics-charts";
import { PeakHoursHeatmap } from "@/components/dashboard/peak-hours-heatmap";

export default function AnalyticsPage() {
  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Insights into call patterns, revenue, and AI performance.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <CallVolumeLineChart />
          <RevenueBarChart />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AICompletionDonut />
          <PeakHoursHeatmap />
        </div>
      </div>
    </PageTransition>
  );
}
