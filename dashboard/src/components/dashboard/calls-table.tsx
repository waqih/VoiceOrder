"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { CallTranscriptDialog } from "./call-transcript-dialog";
import { calls } from "@/data/mock-calls";
import { Call } from "@/data/types";
import { CALL_STATUS_CONFIG, SENTIMENT_CONFIG } from "@/lib/constants";
import { formatDuration, formatDateTime } from "@/lib/format";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export function CallsTable() {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openTranscript = (call: Call) => {
    setSelectedCall(call);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>AI Confidence</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call, i) => {
              const statusCfg = CALL_STATUS_CONFIG[call.status];
              const sentimentCfg = SENTIMENT_CONFIG[call.sentiment];
              return (
                <motion.tr
                  key={call.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {call.customerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {call.customerPhone}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      {...statusCfg}
                      pulse={call.status === "in-progress"}
                    />
                  </TableCell>
                  <TableCell>
                    <span className={sentimentCfg.color} title={sentimentCfg.label}>
                      {sentimentCfg.icon} {sentimentCfg.label}
                    </span>
                  </TableCell>
                  <TableCell>{formatDuration(call.duration)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${call.aiConfidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {call.aiConfidence}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(call.startedAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openTranscript(call)}
                      title="View Transcript"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CallTranscriptDialog
        call={selectedCall}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
