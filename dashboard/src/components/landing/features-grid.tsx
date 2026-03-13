"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Phone,
  Globe,
  ShoppingBag,
  BarChart3,
  Clock,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Phone,
    title: "AI Phone Agent",
    description: "Answers calls instantly with natural conversation. Handles orders, inquiries, and bookings like a trained receptionist.",
  },
  {
    icon: Globe,
    title: "Urdu & English",
    description: "Fluent in both languages. Automatically detects and switches to the customer's preferred language mid-call.",
  },
  {
    icon: ShoppingBag,
    title: "Smart Ordering",
    description: "Takes complete orders with modifications, upsells popular items, and confirms totals — all through voice.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track call volumes, order trends, revenue, and AI performance from a beautiful live dashboard.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Never miss a call again. Your AI assistant works around the clock, even during load-shedding hours.",
  },
  {
    icon: Shield,
    title: "Reliable & Secure",
    description: "Enterprise-grade infrastructure with 99.9% uptime. All calls are encrypted and data stays in Pakistan.",
  },
];

export function FeaturesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything Your Business Needs
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            A complete AI-powered phone system designed specifically for Pakistani restaurants, cafes, and clinics.
          </p>
        </div>

        <div ref={ref} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group relative rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
