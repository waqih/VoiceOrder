"use client";

import { Button } from "@/components/ui/button";
import { VoiceWaveform } from "./voice-waveform";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-muted/30">
      <div ref={ref} className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Automate Your Phone Orders?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join 500+ Pakistani businesses already using VoiceOrder AI. Set up takes
            less than 10 minutes — no technical skills required.
          </p>
          <VoiceWaveform bars={40} className="mx-auto opacity-40" />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
              Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            No credit card required. 14-day free trial on all plans.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
