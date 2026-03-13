"use client";

import { motion } from "framer-motion";

interface VoiceWaveformProps {
  bars?: number;
  className?: string;
}

export function VoiceWaveform({ bars = 50, className = "" }: VoiceWaveformProps) {
  return (
    <div className={`flex items-center justify-center gap-[2px] ${className}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const center = bars / 2;
        const dist = Math.abs(i - center) / center;
        const maxH = 1 - dist * 0.6;

        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-primary/60 to-primary"
            animate={{
              height: [
                `${maxH * 20}px`,
                `${maxH * 40}px`,
                `${maxH * 15}px`,
                `${maxH * 35}px`,
                `${maxH * 20}px`,
              ],
            }}
            transition={{
              duration: 2 + Math.random() * 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.03,
            }}
          />
        );
      })}
    </div>
  );
}
