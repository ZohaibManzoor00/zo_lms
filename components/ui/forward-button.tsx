import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { ArrowRightIcon, LucideIcon } from "lucide-react";

type ForwardButtonProps = {
  href?: string;
  className?: string;
  label?: string;
  icon?: LucideIcon;
  variant?: ButtonProps['variant']
};

export const ForwardButton = ({
  className,
  label = "Next",
  icon: Icon,
  href = "/",
  variant = "secondary",
}: ForwardButtonProps) => {
  return (
    <Button className={cn("group", className)} variant={variant}>
      <Link className="flex items-center gap-x-2" href={href}>
        {Icon && <Icon className="-ms-1 opacity" size={16} aria-hidden="true" />}
        {label}
        <ArrowRightIcon
          className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
          size={16}
          aria-hidden="true"
        />
      </Link>
    </Button>
  );
};
