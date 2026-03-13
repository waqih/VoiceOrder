"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { OrderDetailSheet } from "./order-detail-sheet";
import { orders } from "@/data/mock-orders";
import { Order, OrderStatus } from "@/data/types";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";
import { formatPKR, formatDateTime } from "@/lib/format";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";

export function OrdersTable() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, i) => {
              const statusCfg = ORDER_STATUS_CONFIG[order.status];
              return (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => openDetail(order)}
                >
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {order.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPKR(order.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      {...statusCfg}
                      pulse={
                        order.status === OrderStatus.Pending ||
                        order.status === OrderStatus.Preparing
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(order);
                      }}
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OrderDetailSheet
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
