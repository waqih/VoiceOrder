"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { calls } from "@/data/mock-calls";
import { CALL_STATUS_CONFIG, SENTIMENT_CONFIG } from "@/lib/constants";
import { formatDuration, timeAgo } from "@/lib/format";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";

const recentCalls = calls.slice(0, 5);

export function RecentCallsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Calls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentCalls.map((call, i) => {
          const statusCfg = CALL_STATUS_CONFIG[call.status];
          const sentimentCfg = SENTIMENT_CONFIG[call.sentiment];
          return (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{call.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDuration(call.duration)} · {timeAgo(call.startedAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge {...statusCfg} />
                <span className="text-xs" title={sentimentCfg.label}>
                  {sentimentCfg.icon}
                </span>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
