"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { cn } from "@/lib/utils";
import {
  Phone,
  ShoppingBag,
  TrendingUp,
  Bot,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  phone: Phone,
  orders: ShoppingBag,
  revenue: TrendingUp,
  ai: Bot,
};

interface KPICardProps {
  label: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
  icon: string;
}

export function KPICard({ label, value, change, prefix, suffix, icon }: KPICardProps) {
  const { ref, display } = useAnimatedCounter(value);
  const Icon = ICON_MAP[icon] ?? Phone;
  const isPositive = change >= 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 h-24 w-24 -translate-y-4 translate-x-4 rounded-full bg-gradient-to-br from-primary/10 to-transparent" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="mt-3">
          <span ref={ref} className="text-3xl font-bold tracking-tight">
            {prefix}
            {display.toLocaleString()}
            {suffix}
          </span>
        </div>
        <p className={cn("mt-1 text-xs font-medium", isPositive ? "text-green-600" : "text-red-600")}>
          {isPositive ? "+" : ""}
          {change}% from last week
        </p>
      </CardContent>
    </Card>
  );
}
