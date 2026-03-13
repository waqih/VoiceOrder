"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { OrderStatusPipeline } from "./order-status-pipeline";
import { Order } from "@/data/types";
import { formatPKR, formatDateTime } from "@/lib/format";
import { MapPin, Phone, StickyNote } from "lucide-react";

interface OrderDetailSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Order {order.id}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Customer Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Customer</h4>
            <p className="text-sm">{order.customerName}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {order.customerPhone}
            </div>
            {order.address && (
              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {order.address}
              </div>
            )}
          </div>

          <Separator />

          {/* Status Pipeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Status</h4>
            <OrderStatusPipeline currentStatus={order.status} />
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Items</h4>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>{formatPKR(order.total)}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium">
                  <StickyNote className="h-3.5 w-3.5" /> Notes
                </h4>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </>
          )}

          {/* Meta */}
          <Separator />
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Created: {formatDateTime(order.createdAt)}</p>
            {order.estimatedDelivery && (
              <p>Est. Delivery: {formatDateTime(order.estimatedDelivery)}</p>
            )}
            <p>Call: {order.callId}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
