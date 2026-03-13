"use client";

import { useState } from "react";
import { MenuCategory } from "@/data/types";
import { menuItems } from "@/data/mock-menu";
import { MenuItemCard } from "./menu-item-card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const categories = Object.values(MenuCategory);

export function MenuCategoryTabs() {
  const [active, setActive] = useState<MenuCategory>(MenuCategory.Biryani);
  const filtered = menuItems.filter((item) => item.category === active);

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="relative flex gap-1 rounded-lg bg-muted p-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "relative z-10 flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active === cat
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active === cat && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-md bg-background shadow-sm"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item, i) => (
          <MenuItemCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
