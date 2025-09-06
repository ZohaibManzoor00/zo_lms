"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

import { buttonVariants } from "@/components/ui/button";
import { UserDropdown } from "./user-dropdown";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { AppLogoFull } from "@/components/ui/app-logo";

const navItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Courses",
    href: "/courses",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
];

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <AppLogoFull />
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between pl-6">
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={buttonVariants({
                  className:
                    "text-sm font-medium transition-colors hover:text-primary",
                  variant: "outline",
                  size: "sm",
                })}
              >
                Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-x-2">
            <ThemeSelector />
            <ThemeToggle />

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
        </nav>
      </div>
    </header>
  );
}
