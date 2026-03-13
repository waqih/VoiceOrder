// ── Enums ──────────────────────────────────────────────

export enum CallStatus {
  Completed = "completed",
  Dropped = "dropped",
  Transferred = "transferred",
  InProgress = "in-progress",
}

export enum CallSentiment {
  Positive = "positive",
  Neutral = "neutral",
  Negative = "negative",
}

export enum OrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Preparing = "preparing",
  Ready = "ready",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export enum MenuCategory {
  Biryani = "Biryani",
  BBQKarahi = "BBQ & Karahi",
  NaanRoti = "Naan & Roti",
  Drinks = "Drinks",
  Desserts = "Desserts",
}

// ── Interfaces ─────────────────────────────────────────

export interface TranscriptMessage {
  role: "ai" | "customer";
  text: string;
  timestamp: string;
}

export interface Call {
  id: string;
  customerName: string;
  customerPhone: string;
  status: CallStatus;
  sentiment: CallSentiment;
  duration: number; // seconds
  startedAt: string; // ISO date
  summary: string;
  transcript: TranscriptMessage[];
  aiConfidence: number; // 0-100
  orderId?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number; // PKR
}

export interface Order {
  id: string;
  callId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number; // PKR
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery?: string;
  address?: string;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  nameUrdu?: string;
  category: MenuCategory;
  price: number; // PKR
  description: string;
  available: boolean;
  popular?: boolean;
}

export interface KPI {
  label: string;
  value: number;
  change: number; // percentage
  prefix?: string;
  suffix?: string;
  icon: string;
}

export interface BusinessProfile {
  name: string;
  tagline: string;
  phone: string;
  address: string;
  city: string;
  ownerName: string;
  plan: string;
}

export interface DailyVolume {
  date: string;
  calls: number;
  orders: number;
  revenue: number;
}

export interface HourlyHeatmap {
  day: number; // 0=Mon
  hour: number; // 0-23
  value: number;
}

export interface Testimonial {
  name: string;
  role: string;
  business: string;
  city: string;
  quote: string;
  avatar: string;
}
