"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { VoiceWaveform } from "@/components/landing/voice-waveform";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  AudioWaveform,
  UtensilsCrossed,
  Coffee,
  Stethoscope,
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  {
    value: "restaurant",
    label: "Restaurant",
    description: "Biryani house, BBQ, Desi food",
    icon: UtensilsCrossed,
  },
  {
    value: "cafe",
    label: "Cafe",
    description: "Chai, coffee, bakery items",
    icon: Coffee,
  },
  {
    value: "clinic",
    label: "Clinic / Hospital",
    description: "Appointments & patient calls",
    icon: Stethoscope,
  },
  {
    value: "other",
    label: "Other",
    description: "Salon, store, or any business",
    icon: Building2,
  },
] as const;

const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Peshawar",
  "Multan",
  "Quetta",
];

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2
  const [businessType, setBusinessType] = useState("");

  // Step 3
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Karachi");
  const [street, setStreet] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [languages, setLanguages] = useState<string[]>(["en", "ur"]);

  const handleStep1 = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api<{ access_token: string }>("/auth/register", {
        method: "POST",
        body: { full_name: fullName, email, password },
      });
      await login(data.access_token);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2 = (type: string) => {
    setBusinessType(type);
    setStep(3);
  };

  const handleStep3 = async () => {
    setError("");
    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }

    const fullPhone = `+92${phone.replace(/\D/g, "")}`;
    if (fullPhone.length !== 13) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await api("/businesses/", {
        method: "POST",
        token: token || undefined,
        body: {
          name: businessName,
          type: businessType,
          phone_number: fullPhone,
          address: {
            street,
            city,
            province: "",
            country: "Pakistan",
          },
          operating_hours: {
            open: openTime,
            close: closeTime,
            days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          },
          languages,
        },
      });
      // Refresh user data to get business_id
      if (token) await login(token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
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
          <h2 className="text-2xl font-bold">Join VoiceOrder AI</h2>
          <p className="max-w-sm text-muted-foreground">
            Set up your AI phone assistant in minutes. Your customers will love
            the instant, 24/7 service.
          </p>
          <VoiceWaveform bars={40} className="mt-4 opacity-50" />
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <AudioWaveform className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">VoiceOrder</span>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    s < step
                      ? "border-primary bg-primary text-primary-foreground"
                      : s === step
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "h-0.5 w-8",
                      s < step ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Account Info ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Create your account</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Start with your personal details
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleStep1();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          placeholder="Ahmed Raza"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
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
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Min. 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>

                      {error && (
                        <p className="text-xs text-destructive">{error}</p>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Step 2: Business Type ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      What type of business?
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Select your business category
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {BUSINESS_TYPES.map((bt) => (
                        <button
                          key={bt.value}
                          onClick={() => handleStep2(bt.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all hover:border-primary hover:bg-primary/5",
                            businessType === bt.value
                              ? "border-primary bg-primary/5"
                              : "border-muted"
                          )}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <bt.icon className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-semibold">
                            {bt.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {bt.description}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Step 3: Business Details ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Business details</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tell us about your{" "}
                      {BUSINESS_TYPES.find((b) => b.value === businessType)
                        ?.label.toLowerCase() || "business"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleStep3();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          placeholder="Karachi Biryani House"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex gap-2">
                          <div className="flex h-9 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                            +92
                          </div>
                          <Input
                            id="phone"
                            placeholder="3001234567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Select value={city} onValueChange={(v) => v && setCity(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CITIES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            placeholder="Block 7, Bahadurabad"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="openTime">Opening Time</Label>
                          <Input
                            id="openTime"
                            type="time"
                            value={openTime}
                            onChange={(e) => setOpenTime(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="closeTime">Closing Time</Label>
                          <Input
                            id="closeTime"
                            type="time"
                            value={closeTime}
                            onChange={(e) => setCloseTime(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Languages</Label>
                        <div className="flex gap-3">
                          {[
                            { value: "en", label: "English" },
                            { value: "ur", label: "Urdu" },
                            { value: "pa", label: "Punjabi" },
                          ].map((lang) => (
                            <button
                              key={lang.value}
                              type="button"
                              onClick={() => toggleLanguage(lang.value)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                                languages.includes(lang.value)
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-muted text-muted-foreground hover:border-primary/50"
                              )}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {error && (
                        <p className="text-xs text-destructive">{error}</p>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Create Business
                        <Check className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                    <button
                      onClick={() => setStep(2)}
                      className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
