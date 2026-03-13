"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { orders } from "@/data/mock-orders";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";
import { formatPKR, timeAgo } from "@/lib/format";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const recentOrders = orders.slice(0, 5);

export function RecentOrdersList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentOrders.map((order, i) => {
          const statusCfg = ORDER_STATUS_CONFIG[order.status];
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""} · {timeAgo(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge {...statusCfg} />
                <span className="text-xs font-medium text-muted-foreground">
                  {formatPKR(order.total)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
