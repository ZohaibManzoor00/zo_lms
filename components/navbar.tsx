"use client";

import { BookOpenIcon, InfoIcon, LifeBuoyIcon } from "lucide-react";
import Link from "next/link";

import { AppLogoFull } from "@/components/ui/app-logo";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "./ui/theme-toggle";
import { ThemeSelector } from "./ui/theme-selector";
import { UserDropdown } from "@/app/(public)/_components/user-dropdown";

interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  icon?: string;
}

interface NavigationLink {
  href?: string;
  label: string;
  submenu?: boolean;
  type?: string;
  icon?: string;
  items?: NavigationItem[];
}

const navigationLinks: NavigationLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  {
    label: "Courses",
    submenu: true,
    type: "description",
    icon: "BookOpenIcon",
    items: [
      {
        href: "/courses",
        label: "Courses",
        description: "Browse all courses",
      },
      {
        href: "/lessons",
        label: "Lessons",
        description: "Browse all lessons",
      },
    ],
  },
  {
    label: "Projects",
    submenu: true,
    type: "simple",
    items: [
      {
        href: "/projects/custom-lms",
        label: "Custom LMS",
        description: "Custom LMS made for Marcy",
      },
      {
        href: "/projects/streamr",
        label: "Streamr",
        description: "Large scale video transcoding/streaming platform",
      },
    ],
  },
  {
    label: "About",
    submenu: true,
    type: "icon",
    items: [{ href: "/about", label: "About Us", description: "About Us" }],
  },
];

const adminLinks: NavigationLink[] = [{ href: "/admin", label: "Admin" }];

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";

  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between gap-4 container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      {link.submenu ? (
                        <>
                          <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                            {link.label}
                          </div>
                          <ul>
                            {link.items?.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <NavigationMenuLink
                                  href={item.href}
                                  className="py-1.5"
                                >
                                  {item.label}
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <NavigationMenuLink href={link.href} className="py-1.5">
                          {link.label}
                        </NavigationMenuLink>
                      )}
                      {/* Add separator between different types of items */}
                      {index < navigationLinks.length - 1 &&
                        // Show separator if:
                        // 1. One is submenu and one is simple link OR
                        // 2. Both are submenus but with different types
                        ((!link.submenu &&
                          navigationLinks[index + 1].submenu) ||
                          (link.submenu &&
                            !navigationLinks[index + 1].submenu) ||
                          (link.submenu &&
                            navigationLinks[index + 1].submenu &&
                            link.type !== navigationLinks[index + 1].type)) && (
                          <div
                            role="separator"
                            aria-orientation="horizontal"
                            className="bg-border -mx-1 my-1 h-px w-full"
                          />
                        )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <AppLogoFull />
            <NavigationMenu viewport={false} className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {(
                  [
                    ...navigationLinks,
                    ...(isAdmin ? adminLinks : []),
                  ] as NavigationLink[]
                ).map((link, index) => {
                  // Check if this is an admin link
                  const isAdminLink = adminLinks.some(
                    (adminLink) => adminLink.href === link.href
                  );

                  return (
                    <NavigationMenuItem key={index}>
                      {link.submenu ? (
                        <>
                          <NavigationMenuTrigger
                            className={cn(
                              "bg-transparent px-2 py-1.5 font-medium *:[svg]:-me-0.5 *:[svg]:size-3.5",
                              isAdminLink
                                ? "text-primary hover:text-primary/80" // Admin links: primary by default
                                : "text-muted-foreground hover:text-primary" // Regular links: normal behavior
                            )}
                          >
                            {link.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1">
                            <ul
                              className={cn(
                                link.type === "description"
                                  ? "min-w-64"
                                  : "min-w-48"
                              )}
                            >
                              {link.items?.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <NavigationMenuLink
                                    href={item.href}
                                    className="py-1.5"
                                  >
                                    {/* Display icon if present */}
                                    {link.type === "icon" && "icon" in item && (
                                      <div className="flex items-center gap-2">
                                        {item.icon === "BookOpenIcon" && (
                                          <BookOpenIcon
                                            size={16}
                                            className="text-foreground opacity-60"
                                            aria-hidden="true"
                                          />
                                        )}
                                        {item.icon === "LifeBuoyIcon" && (
                                          <LifeBuoyIcon
                                            size={16}
                                            className="text-foreground opacity-60"
                                            aria-hidden="true"
                                          />
                                        )}
                                        {item.icon === "InfoIcon" && (
                                          <InfoIcon
                                            size={16}
                                            className="text-foreground opacity-60"
                                            aria-hidden="true"
                                          />
                                        )}
                                        <span>{item.label}</span>
                                      </div>
                                    )}

                                    {/* Display label with description if present */}
                                    {link.type === "description" &&
                                    "description" in item ? (
                                      <div className="space-y-1">
                                        <div className="font-medium">
                                          {item.label}
                                        </div>
                                        <p className="text-muted-foreground line-clamp-2 text-xs">
                                          {item.description}
                                        </p>
                                      </div>
                                    ) : (
                                      // Display simple label if not icon or description type
                                      !link.type ||
                                      (link.type !== "icon" &&
                                        link.type !== "description" && (
                                          <span>{item.label}</span>
                                        ))
                                    )}
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink
                          href={link.href}
                          className={cn(
                            "py-1.5 font-medium",
                            isAdminLink
                              ? "text-primary hover:text-primary/80 bg-accent" // Admin links: primary by default
                              : "text-muted-foreground hover:text-primary" // Regular links: normal behavior
                          )}
                        >
                          {link.label}
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ThemeSelector />
          {isPending ? (
            <div className="w-20 h-10" />
          ) : session ? (
            <UserDropdown
              name={
                session?.user.name && session.user.name.length > 0
                  ? session.user.name
                  : session?.user.email.split("@")[0]
              }
              email={session.user.email}
              image={
                session.user.image ??
                `https://avatar.vercel.sh/${session?.user.email}`
              }
              isAdmin={session?.user.role === "admin"}
            />
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "secondary" })}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
