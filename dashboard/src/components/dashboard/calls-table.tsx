"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone } from "lucide-react";

export function CallsTable() {
  return (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={7}>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Phone className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">No calls recorded yet</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Call logs will appear here once your AI assistant handles incoming calls.
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
