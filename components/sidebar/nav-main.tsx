"use client";

import Link from "next/link";
import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("admin");

  // Find the most specific matching route (longest URL that matches)
  const getActiveItem = () => {
    const matchingItems = items.filter(
      (item) => pathname === item.url || pathname.startsWith(item.url + "/")
    );

    if (matchingItems.length === 0) return null;

    // Return the item with the longest URL (most specific)
    return matchingItems.reduce((prev, current) =>
      current.url.length > prev.url.length ? current : prev
    );
  };

  const activeItem = getActiveItem();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {isAdminRoute && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                asChild
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <Link href="/admin/courses/create">
                  <IconCirclePlusFilled />
                  <span>Quick Create</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link
                  href={item.url}
                  className={cn(
                    activeItem?.url === item.url &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(
                        activeItem?.url === item.url && "text-primary"
                      )}
                    />
                  )}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
