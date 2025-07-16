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
          isCompleted &&
            "bg-green-200 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200",
          isActive &&
            !isCompleted &&
            "bg-primary/10 dark:bg-primary/20 border-primary/50 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary"
        ),
      })}
      href={`/dashboard/${slug}/${lesson.id}`}
    >
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <div className="shrink-0">
          {isCompleted ? (
            <div className="rounded-full bg-green-500/10 text-green-500 p-1">
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

        <div>
          <p
            className={cn(
              "text-xs font-medium truncate",
              isActive
                ? "text-primary font-semibold"
                : isCompleted 
                ? "text-green-800 dark:text-green-200"
                : "text-foreground"
            )}
          >
            {lesson.position}. {lesson.title}
          </p>
          {(isCompleted || isActive) && (
            <p
              className={cn(
                "text-xs font-medium",
                isActive ? "text-primary" : "text-green-500 dark:text-green-400"
              )}
            >
              {isCompleted ? "Completed" : "Viewing"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
