import Link from "next/link";
import { Ban } from "lucide-react";
import { buttonVariants } from "../ui/button";

interface Props {
    title: string;
    description: string;
    buttonText: string;
    href: string;
}

export function EmptyCourseState({ title, description, buttonText, href }: Props) {
  return (
    <div className="flex flex-col flex-1 h-full items-center justify-center rounded-md border-dashed border p-8 animate-in fade-in-50">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <Ban className="size-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Link href={href} className={buttonVariants()}>
        {buttonText}
      </Link>
    </div>
  );
}
