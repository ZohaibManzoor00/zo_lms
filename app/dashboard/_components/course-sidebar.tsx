"use client";

import { usePathname } from "next/navigation";
import { useCourseProgress } from "@/hooks/use-course-progress";

import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ChevronDown } from "lucide-react";
import { LessonItem } from "./lesson-item";
import { cn } from "@/lib/utils";
import { IconBook } from "@tabler/icons-react";

interface Props {
  course: CourseSidebarDataType["course"];
}

export function CourseSidebar({ course }: Props) {
  const currentLessonId = usePathname().split("/").pop();
  const { totalLessons, completedLessons, progressPercentage } =
    useCourseProgress({ courseData: course });
  const isCourseComplete = completedLessons === totalLessons;

  return (
    <div className="flex flex-col h-full">
      <div className="pb-4 pr-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <IconBook className="size-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base leading-tight truncate font-semibold">
              {course.title}
            </h1>
            <p className="text-xs mt-1 truncate text-muted-foreground">
              {course.category}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className={cn("flex justify-between text-xs", isCourseComplete && "text-primary")}>
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={cn("h-1.5", isCourseComplete && "bg-primary")}
            indicatorClassName={isCourseComplete ? "bg-primary" : ""}
          />
          <p
            className={cn(
              "text-xs text-muted-foreground",
              isCourseComplete && "text-primary"
            )}
          >
            {progressPercentage}% complete
          </p>
        </div>
      </div>

      <div className="py-4 pr-4 space-y-3 h-[70dvh] overflow-y-auto">
        {course.chapter.map((chapter) => (
          <Collapsible key={chapter.id} defaultOpen={chapter.position === 1}>
            <CollapsibleTrigger asChild>
              <Button
                className="w-full p-3 h-auto flex items-center gap-2"
                variant="outline"
              >
                <div className="shrink-0">
                  <ChevronDown className="size-4 text-primary" />
                </div>

                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold truncate text-sm text-foreground">
                    {chapter.position}: {chapter.title}
                  </p>

                  <p className="text-xs text-muted-foreground truncate font-medium">
                    {chapter.lesson.length} lessons
                  </p>
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3 pl-6 border-l-2 space-y-3">
              {chapter.lesson.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  slug={course.slug}
                  isActive={lesson.id === currentLessonId}
                  isCompleted={
                    lesson.lessonProgress.find(
                      (progress) => progress.lessonId === lesson.id
                    )?.completed ?? false
                  }
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
