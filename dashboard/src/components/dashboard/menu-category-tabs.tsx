"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";

export function MenuCategoryTabs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Menu Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <UtensilsCrossed className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">No menu items added</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Add your menu items so the AI assistant can take orders accurately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
