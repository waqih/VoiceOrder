import { formatDistanceToNow, format } from "date-fns";

export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatTime(date: string): string {
  return format(new Date(date), "h:mm a");
}

export function formatDateTime(date: string): string {
  return format(new Date(date), "MMM d, h:mm a");
}
