import { CallSentiment, CallStatus, OrderStatus } from "@/data/types";

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  [OrderStatus.Pending]:    { label: "Pending",    color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/40" },
  [OrderStatus.Confirmed]:  { label: "Confirmed",  color: "text-blue-700 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-900/40" },
  [OrderStatus.Preparing]:  { label: "Preparing",  color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/40" },
  [OrderStatus.Ready]:      { label: "Ready",      color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  [OrderStatus.Delivered]:  { label: "Delivered",  color: "text-green-700 dark:text-green-400",   bg: "bg-green-100 dark:bg-green-900/40" },
  [OrderStatus.Cancelled]:  { label: "Cancelled",  color: "text-red-700 dark:text-red-400",       bg: "bg-red-100 dark:bg-red-900/40" },
};

export const CALL_STATUS_CONFIG: Record<CallStatus, { label: string; color: string; bg: string }> = {
  [CallStatus.Completed]:   { label: "Completed",   color: "text-green-700 dark:text-green-400",  bg: "bg-green-100 dark:bg-green-900/40" },
  [CallStatus.Dropped]:     { label: "Dropped",     color: "text-red-700 dark:text-red-400",      bg: "bg-red-100 dark:bg-red-900/40" },
  [CallStatus.Transferred]: { label: "Transferred", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
  [CallStatus.InProgress]:  { label: "In Progress", color: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/40" },
};

export const SENTIMENT_CONFIG: Record<CallSentiment, { label: string; color: string; icon: string }> = {
  [CallSentiment.Positive]: { label: "Positive", color: "text-green-600", icon: "😊" },
  [CallSentiment.Neutral]:  { label: "Neutral",  color: "text-zinc-500",  icon: "😐" },
  [CallSentiment.Negative]: { label: "Negative", color: "text-red-600",   icon: "😟" },
};

export const ORDER_PIPELINE_STEPS: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Confirmed,
  OrderStatus.Preparing,
  OrderStatus.Ready,
  OrderStatus.Delivered,
];

export const CHART_COLORS = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
  quaternary: "hsl(var(--chart-4))",
  quinary: "hsl(var(--chart-5))",
};
