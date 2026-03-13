"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceWaveform } from "@/components/landing/voice-waveform";
import { api } from "@/lib/api";
import { AudioWaveform, ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Decorative panel */}
      <div className="relative hidden flex-1 items-center justify-center bg-primary/5 lg:flex">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
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
            Your AI-powered phone assistant for taking orders, managing
            bookings, and growing your business.
          </p>
          <VoiceWaveform bars={40} className="mt-4 opacity-50" />
        </motion.div>
      </div>

      {/* Right: Form */}
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
              <CardTitle className="text-xl">
                {isSent ? "Check your email" : "Forgot password?"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isSent
                  ? "We've sent a password reset link to your email"
                  : "Enter your email and we'll send you a reset link"}
              </p>
            </CardHeader>
            <CardContent>
              {isSent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4 py-4"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    We sent a reset link to <strong>{email}</strong>. Check your
                    inbox and spam folder.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    nativeButton={false}
                    render={<Link href="/login" />}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ahmed@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-xs text-destructive">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Send Reset Link
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    nativeButton={false}
                    render={<Link href="/login" />}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
