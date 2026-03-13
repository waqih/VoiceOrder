"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/data/types";
import { formatPKR } from "@/lib/format";
import { Flame } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

export function MenuItemCard({ item, index }: MenuItemCardProps) {
  const [available, setAvailable] = useState(item.available);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className={!available ? "opacity-60" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                {item.popular && (
                  <Badge variant="secondary" className="shrink-0 gap-1 text-[10px]">
                    <Flame className="h-3 w-3 text-orange-500" />
                    Popular
                  </Badge>
                )}
              </div>
              {item.nameUrdu && (
                <p className="text-xs text-muted-foreground" dir="rtl">
                  {item.nameUrdu}
                </p>
              )}
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
            <Switch checked={available} onCheckedChange={setAvailable} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-primary">
              {formatPKR(item.price)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {available ? "Available" : "Unavailable"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
