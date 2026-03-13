"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceWaveform } from "@/components/landing/voice-waveform";
import { AudioWaveform } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Decorative panel */}
      <div className="relative hidden flex-1 items-center justify-center bg-primary/5 lg:flex">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center gap-6 px-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <AudioWaveform className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold">VoiceOrder AI</h2>
          <p className="max-w-sm text-muted-foreground">
            Your AI-powered phone assistant for taking orders, managing bookings,
            and growing your business.
          </p>
          <VoiceWaveform bars={40} className="mt-4 opacity-50" />
        </motion.div>
      </div>

      {/* Right: Login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <AudioWaveform className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">VoiceOrder</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sign in to your dashboard
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ahmed@example.com"
                    defaultValue="ahmed@karachibiryani.pk"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    defaultValue="password123"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/" className="text-primary hover:underline">
                  Get started
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
