import Link from "next/link";
import { AudioWaveform } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <AudioWaveform className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">VoiceOrder AI</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">
              Testimonials
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2025 VoiceOrder AI. Made in Pakistan.
          </p>
        </div>
      </div>
    </footer>
  );
}
