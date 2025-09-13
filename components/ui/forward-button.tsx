import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon, LucideIcon } from "lucide-react";

type ForwardButtonProps = {
  href?: string;
  className?: string;
  label?: string;
  icon?: LucideIcon;
  variant?: ButtonProps["variant"];
  useLink?: boolean;
  onClick?: () => void;
};

export const ForwardButton = ({
  className,
  label = "Next",
  icon: Icon,
  href = "/",
  variant = "secondary",
  useLink = true,
  onClick,
}: ForwardButtonProps) => {
  return useLink ? (
    <Link
      className={cn(
        "group flex items-center gap-x-2",
        buttonVariants({ variant }),
        className
      )}
      href={href}
      onClick={onClick}
    >
      {Icon && <Icon className="-ms-1 opacity" size={16} aria-hidden="true" />}
      {label}
      <ArrowRightIcon
        className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
        size={16}
        aria-hidden="true"
      />
    </Link>
  ) : (
    <Button
      className={cn(
        "group flex items-center gap-x-2",
        buttonVariants({ variant }),
        className
      )}
    >
      {Icon && <Icon className="-ms-1 opacity" size={16} aria-hidden="true" />}
      {label}
      <ArrowRightIcon
        className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
        size={16}
        aria-hidden="true"
      />
    </Button>
  );
};
