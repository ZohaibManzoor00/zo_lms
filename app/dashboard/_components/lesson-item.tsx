import Link from "next/link";
import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface Props {
  lesson: CourseSidebarDataType["course"]["chapter"][number]["lesson"][number];
  slug: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export function LessonItem({ lesson, slug, isActive, isCompleted }: Props) {
  return (
    <Link
      className={buttonVariants({
        variant: isCompleted ? "secondary" : "outline",
        className: cn(
          "w-full p-2.5 h-auto justify-start transition-all",
          isCompleted && "text-primary",
          isActive &&
            "bg-primary/10 dark:bg-primary/20 border-primary/50 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary"
        ),
      })}
      href={`/dashboard/${slug}/${lesson.id}`}
    >
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <div className="shrink-0">
          {isCompleted ? (
            <div
              className={cn(
                "rounded-full bg-primary/10 text-primary p-1",
                isActive && "bg-primary/20 text-primary"
              )}
            >
              <CheckIcon className="size-3" />
            </div>
          ) : (
            <div
              className={cn(
                "size-3.5 rounded-full border-2 bg-background flex justify-center items-center",
                isActive
                  ? "border-primary bg-primary/10 dark:bg-primary/10"
                  : "border-muted-foreground/60"
              )}
            >
              {/* <Circle
                className={cn(
                  "size-2.5 fill-current",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              /> */}
            </div>
          )}
        </div>

        <div className="max-w-11/12">
          <p
            className={cn(
              "text-xs font-medium truncate",
              isActive
                ? "text-primary font-semibold"
                : isCompleted
                ? "text-primary"
                : "text-foreground"
            )}
          >
            {lesson.position}. {lesson.title}
          </p>
          {(isCompleted || isActive) && (
            <p className={cn("text-xs font-medium text-primary")}>
              {isActive ? "Viewing" : "Completed"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
