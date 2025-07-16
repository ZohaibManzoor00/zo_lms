import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

type BackButtonProps = {
  href?: string;
  className?: string;
  label?: string;
  icon?: boolean;
};

const BackButton = ({
  className,
  label = "Back",
  icon = true,
  href = "/",
}: BackButtonProps) => {
  return (
    <Button className={cn("group", className)} variant="outline">
      <Link href={href} className="flex items-center gap-x-2">
        {icon && (
          <ArrowLeftIcon
            className="-ms-1 opacity-60 transition-transform group-hover:-translate-x-0.5"
            size={16}
            aria-hidden="true"
          />
        )}
        {label}
      </Link>
    </Button>
  );
};

export { BackButton };
