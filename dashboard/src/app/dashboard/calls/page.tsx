"use client";

import { PageTransition } from "@/components/dashboard/page-transition";
import { CallsTable } from "@/components/dashboard/calls-table";

export default function CallsPage() {
  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Call Logs</h2>
          <p className="text-sm text-muted-foreground">
            View all incoming calls handled by your AI assistant.
          </p>
        </div>
        <CallsTable />
      </div>
    </PageTransition>
  );
}
