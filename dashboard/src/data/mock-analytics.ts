import { DailyVolume, HourlyHeatmap, Testimonial } from "./types";

export const dailyVolume: DailyVolume[] = [
  { date: "2025-01-01", calls: 18, orders: 14, revenue: 12600 },
  { date: "2025-01-02", calls: 22, orders: 17, revenue: 15300 },
  { date: "2025-01-03", calls: 15, orders: 11, revenue: 9900 },
  { date: "2025-01-04", calls: 28, orders: 22, revenue: 19800 },
  { date: "2025-01-05", calls: 35, orders: 28, revenue: 25200 },
  { date: "2025-01-06", calls: 20, orders: 16, revenue: 14400 },
  { date: "2025-01-07", calls: 24, orders: 19, revenue: 17100 },
  { date: "2025-01-08", calls: 19, orders: 15, revenue: 13500 },
  { date: "2025-01-09", calls: 30, orders: 24, revenue: 21600 },
  { date: "2025-01-10", calls: 26, orders: 20, revenue: 18000 },
  { date: "2025-01-11", calls: 32, orders: 25, revenue: 22500 },
  { date: "2025-01-12", calls: 38, orders: 30, revenue: 27000 },
  { date: "2025-01-13", calls: 27, orders: 21, revenue: 18900 },
  { date: "2025-01-14", calls: 23, orders: 18, revenue: 16200 },
  { date: "2025-01-15", calls: 34, orders: 27, revenue: 24300 },
];

// 7 days × 24 hours heatmap (0=Mon, 6=Sun)
export const hourlyHeatmap: HourlyHeatmap[] = (() => {
  const data: HourlyHeatmap[] = [];
  const pattern = [
    // Mon-Thu: lunch+dinner peaks
    [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 8, 12, 10, 6, 4, 5, 7, 14, 18, 22, 16, 8, 2],
    [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 5, 9, 13, 11, 5, 4, 6, 8, 15, 19, 21, 15, 7, 2],
    [0, 0, 0, 0, 0, 0, 0, 1, 3, 4, 5, 10, 14, 10, 6, 5, 6, 9, 16, 20, 23, 17, 9, 3],
    [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 8, 11, 9, 5, 4, 5, 8, 13, 17, 20, 14, 7, 2],
    // Fri: big dinner peak
    [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 5, 9, 14, 12, 8, 6, 8, 12, 20, 28, 32, 24, 14, 5],
    // Sat: all-day busy
    [0, 0, 0, 0, 0, 0, 1, 2, 4, 6, 8, 14, 18, 16, 12, 10, 12, 16, 24, 30, 28, 20, 12, 4],
    // Sun: family lunch peak
    [0, 0, 0, 0, 0, 0, 1, 2, 3, 5, 8, 16, 22, 20, 14, 10, 8, 10, 18, 24, 22, 16, 8, 3],
  ];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      data.push({ day, hour, value: pattern[day][hour] });
    }
  }
  return data;
})();

export const testimonials: Testimonial[] = [
  {
    name: "Ahmed Raza",
    role: "Owner",
    business: "Karachi Biryani House",
    city: "Karachi",
    quote: "VoiceOrder AI handles 70% of our phone orders automatically. Our staff can focus on cooking instead of answering phones during rush hour.",
    avatar: "AR",
  },
  {
    name: "Dr. Sana Malik",
    role: "Clinic Manager",
    business: "City Care Clinic",
    city: "Lahore",
    quote: "Patients can book appointments 24/7 now. We've reduced missed calls by 90% and our reception staff is much less stressed.",
    avatar: "SM",
  },
  {
    name: "Hassan Mirza",
    role: "Franchise Owner",
    business: "Chai Shai Cafe",
    city: "Islamabad",
    quote: "We added VoiceOrder to all 5 branches. The consistency is incredible — every customer gets the same great experience, in Urdu or English.",
    avatar: "HM",
  },
  {
    name: "Ayesha Khan",
    role: "Operations Head",
    business: "Pizza Planet",
    city: "Lahore",
    quote: "Our order accuracy jumped from 82% to 98%. The AI never mishears an order and always confirms before processing. Game changer!",
    avatar: "AK",
  },
];
