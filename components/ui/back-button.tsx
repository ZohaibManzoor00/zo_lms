import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type BackButtonProps = {
  iconSize?: number;
  iconStrokeWidth?: number;
  href?: string;
  className?: string;
  children?: React.ReactNode;
};

const BackButton = ({
  className,
  children = "Back",
  iconSize = 16,
  iconStrokeWidth = 2,
  href = "/",
}: BackButtonProps) => {
  return (
    <Button
      asChild
      variant="outline"
      className={cn("group relative overflow-hidden", className)}
    >
      <Link href={href}>
        <span className="translate-x-2 transition-transform duration-300 group-hover:opacity-0">
          {children}
        </span>
        <span
          className="absolute inset-0 z-10 flex items-center justify-center bg-primary-foreground/15 w-2/5 transition-all duration-300 group-hover:w-full"
          aria-hidden="true"
        >
          <ArrowLeft
            className="opacity-60"
            size={iconSize}
            strokeWidth={iconStrokeWidth}
          />
        </span>
      </Link>
    </Button>
  );
};

export { BackButton };
