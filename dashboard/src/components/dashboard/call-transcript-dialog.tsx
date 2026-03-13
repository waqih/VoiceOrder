"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Call } from "@/data/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface CallTranscriptDialogProps {
  call: Call | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallTranscriptDialog({
  call,
  open,
  onOpenChange,
}: CallTranscriptDialogProps) {
  if (!call) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            Transcript — {call.customerName}
            <span className="text-xs font-normal text-muted-foreground">
              ({call.id})
            </span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-3">
          <div className="space-y-3">
            {call.transcript.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No transcript available for this call.
              </p>
            )}
            {call.transcript.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "customer" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    msg.role === "ai"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {msg.role === "ai" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "ai"
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <p>{msg.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      msg.role === "ai"
                        ? "text-muted-foreground"
                        : "text-primary-foreground/70"
                    )}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
