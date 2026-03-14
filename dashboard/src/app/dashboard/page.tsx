"use client";

import { PageTransition } from "@/components/dashboard/page-transition";
import { KPICard } from "@/components/dashboard/kpi-card";
import { CallVolumeChart } from "@/components/dashboard/call-volume-chart";
import { RecentCallsList } from "@/components/dashboard/recent-calls-list";
import { RecentOrdersList } from "@/components/dashboard/recent-orders-list";
import { KPI } from "@/data/types";

const kpis: KPI[] = [
  { label: "Total Calls", value: 0, change: 0, icon: "phone" },
  { label: "Orders Placed", value: 0, change: 0, icon: "orders" },
  { label: "Revenue", value: 0, change: 0, prefix: "PKR ", icon: "revenue" },
  { label: "AI Completion", value: 0, change: 0, suffix: "%", icon: "ai" },
];

export default function DashboardHome() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Charts + Lists */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CallVolumeChart />
          </div>
          <RecentCallsList />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <RecentOrdersList />
        </div>
      </div>
    </PageTransition>
  );
}
