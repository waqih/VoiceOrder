"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AudioWaveform } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <AudioWaveform className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">VoiceOrder</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Testimonials
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
            Sign In
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
            Get Started
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
