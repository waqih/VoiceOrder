"use client";

import { Button } from "@/components/ui/button";
import { VoiceWaveform } from "./voice-waveform";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

const words = ["Your", "AI", "Phone", "Assistant", "for", "Pakistani", "Businesses"];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Gradient blobs */}
      <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Now serving 500+ businesses across Pakistan
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className={`inline-block mr-3 ${
                    word === "AI" ? "text-primary" : ""
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0"
            >
              An intelligent voice agent that answers calls, takes orders in Urdu & English,
              and manages bookings — so you never miss a customer again.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button size="lg" render={<Link href="/login" />}>
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Phone className="mr-2 h-4 w-4" /> Listen to Demo
              </Button>
            </motion.div>
          </div>

          {/* Right: Phone mockup with waveform */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Pulse rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-3xl border border-primary/20"
                  animate={{ scale: [1, 1.1 + ring * 0.05], opacity: [0.3, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: ring * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Phone frame */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[280px] rounded-3xl border-2 border-muted bg-card p-4 shadow-2xl"
              >
                {/* Status bar */}
                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-4 rounded bg-muted-foreground/40" />
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  </div>
                </div>

                {/* Call screen */}
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Karachi Biryani House</p>
                    <p className="text-xs text-muted-foreground">AI Assistant Active</p>
                  </div>

                  <VoiceWaveform bars={30} className="my-2" />

                  <div className="w-full space-y-2 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">AI is speaking:</p>
                    <p className="text-sm">
                      &ldquo;2x Chicken Biryani and 1 Raita. Total PKR 780. Confirming your order...&rdquo;
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
