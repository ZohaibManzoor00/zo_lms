"use client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResourceItemType } from "./recent-resources-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ThemeElectricBorder from "@/components/ThemeElectricBorder";

export function ResourceItem({ item }: { item: ResourceItemType }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <ThemeElectricBorder
      colorTheme="primary"
      speed={1}
      chaos={0.3}
      thickness={3}
      style={{ borderRadius: 16 }}
    //   className="opacity-75"
    >
      <Link
        href={item.href}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "flex items-center justify-between w-full px-4 py-3 rounded-lg shadow-sm group transition-all duration-200 hover:bg-accent/60 hover:shadow-md hover:scale-[1.02] h-16 border-2 border-border dark:border-foreground/40 hover:border-primary/60 dark:hover:border-primary/70"
        )}
      >
        <div className="flex gap-x-2 items-center min-w-0 flex-1">
          <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
            {item.title}
          </p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(item.createdAt)}
          </p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <Badge
            variant="secondary"
            className="text-xs px-2 py-0.5 min-w-fit bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20 transition-colors"
          >
            {item.type}
          </Badge>
        </div>
      </Link>
    </ThemeElectricBorder>
  );
}
