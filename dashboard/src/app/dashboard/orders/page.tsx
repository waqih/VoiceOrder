"use client";

import { PageTransition } from "@/components/dashboard/page-transition";
import { OrdersTable } from "@/components/dashboard/orders-table";

export default function OrdersPage() {
  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Orders</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage all orders placed through voice calls.
          </p>
        </div>
        <OrdersTable />
      </div>
    </PageTransition>
  );
}
