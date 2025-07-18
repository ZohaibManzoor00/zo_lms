import Link from "next/link";
import { useSignOut } from "@/hooks/use-signout";

import {
  BookOpenIcon,
  ChevronDownIcon,
  Home,
  LayoutDashboardIcon,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropdownProps {
  name: string;
  email: string;
  image: string;
  isAdmin: boolean
}

const userRoutes = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
  { href: "/courses", icon: BookOpenIcon, label: "Courses" },
];

const adminRoutes = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/admin", icon: LayoutDashboardIcon, label: "Admin Dashboard" },
  { href: "/admin/courses", icon: BookOpenIcon, label: "Admin Courses" },
];

export function UserDropdown({ name, email, image, isAdmin }: UserDropdownProps) {
  const { handleSignOut } = useSignOut();
  const navRoutes = isAdmin ? adminRoutes : userRoutes;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-1 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={image} alt="Profile image" />
            <AvatarFallback>{name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <ChevronDownIcon
            size={16}
            className="opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {name}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {navRoutes.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem asChild key={href} className="cursor-pointer">
              <Link href={href}>
                <Icon size={16} className="opacity-60" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon size={16} className="opacity-60 cursor-pointer" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
