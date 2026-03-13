"use client";

import { PageTransition } from "@/components/dashboard/page-transition";
import { MenuCategoryTabs } from "@/components/dashboard/menu-category-tabs";

export default function MenuPage() {
  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Menu Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage menu items, prices, and availability for your AI assistant.
          </p>
        </div>
        <MenuCategoryTabs />
      </div>
    </PageTransition>
  );
}
