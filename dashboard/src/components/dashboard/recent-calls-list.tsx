"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";

export function RecentCallsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Calls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Phone className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">No calls yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Recent calls will show up here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
