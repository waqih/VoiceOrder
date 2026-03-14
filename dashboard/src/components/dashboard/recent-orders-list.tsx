"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export function RecentOrdersList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">No orders yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Orders placed through voice calls will appear here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
