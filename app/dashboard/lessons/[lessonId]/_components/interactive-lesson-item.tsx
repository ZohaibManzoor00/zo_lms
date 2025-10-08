"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { BookIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { LessonType } from "@/app/data/lesson/get-all-lessons";
import { markStandaloneLessonComplete } from "../actions";
import {
  getDifficultyColor,
  getCategoryColor,
  formatDifficulty,
} from "@/lib/lesson-utils";

interface InteractiveLessonItemProps {
  lesson: LessonType;
  isActive: boolean;
  onCompletionChange?: (lessonId: string, completed: boolean) => void;
}

export function InteractiveLessonItem({
  lesson,
  isActive,
  onCompletionChange,
}: InteractiveLessonItemProps) {
  const [, startTransition] = useTransition();
  const initialIsCompleted =
    lesson.lessonProgress?.[0]?.completed || lesson.completed;
  const [optimisticIsCompleted, setOptimisticIsCompleted] =
    useOptimistic(initialIsCompleted);

  const thumbnailUrl = useConstructUrl(lesson.thumbnailKey || "");
  const searchParams = useSearchParams();

  const getLessonHref = () => {
    const params = searchParams.toString();
    return `/dashboard/lessons/${lesson.id}${params ? `?${params}` : ""}`;
  };

  const handleCompletionToggle = (checked: boolean) => {
    startTransition(async () => {
      setOptimisticIsCompleted(checked);

      onCompletionChange?.(lesson.id, checked);

      try {
        await markStandaloneLessonComplete(lesson.id);
      } catch (error) {
        console.error("Failed to update lesson completion:", error);
        setOptimisticIsCompleted(initialIsCompleted);
        onCompletionChange?.(lesson.id, initialIsCompleted);
      }
    });
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="relative group">
      <Link
        href={getLessonHref()}
        className={cn(
          "w-full p-2.5 h-auto justify-start transition-all duration-300 ease-in-out rounded-md border block transform hover:scale-[1.02] hover:shadow-sm relative hover:z-10",
          isActive
            ? "bg-primary/10 dark:bg-primary/20 border-primary/50 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary shadow-sm scale-[1.01] z-10"
            : "border-border hover:bg-muted/50 hover:border-primary/30 z-0"
        )}
      >
        <div className="flex items-center gap-2.5 w-full min-w-0 pr-8">
          <div className="shrink-0">
            <div className="relative w-8 h-6 rounded overflow-hidden bg-muted transition-all duration-200 hover:shadow-sm">
              {lesson.thumbnailKey ? (
                <Image
                  src={thumbnailUrl}
                  alt={lesson.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="32px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookIcon className="size-3 text-muted-foreground transition-all duration-200" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-xs font-medium truncate leading-tight transition-all duration-200",
                isActive ? "text-primary font-semibold" : "text-foreground",
                optimisticIsCompleted ? "line-through opacity-75" : ""
              )}
            >
              {lesson.title}
            </p>

            {/* Display categories and difficulty */}
            <div className="flex items-center gap-1 mt-1">
              {lesson.categories && lesson.categories.length > 0 && (
                <>
                  {lesson.categories.slice(0, 2).map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className={cn(
                        "text-xs px-1 py-0 h-auto font-medium text-[10px] leading-tight",
                        getCategoryColor(category)
                      )}
                    >
                      {category}
                    </Badge>
                  ))}
                  {lesson.categories.length > 2 && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1 py-0 h-auto font-medium text-[10px] leading-tight border-border text-muted-foreground"
                    >
                      +{lesson.categories.length - 2}
                    </Badge>
                  )}
                </>
              )}
              {lesson.difficulty && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-1 py-0 h-auto font-medium text-[10px] leading-tight",
                    getDifficultyColor(lesson.difficulty)
                  )}
                >
                  {formatDifficulty(lesson.difficulty)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Floating Checkbox */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={handleCheckboxClick}
      >
        <Checkbox
          checked={optimisticIsCompleted}
          onCheckedChange={handleCompletionToggle}
          className={cn(
            "h-5 w-5 border-2 shadow-sm transition-all duration-200",
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
            "data-[state=checked]:text-primary-foreground",
            "hover:border-primary/60 hover:shadow-md",
            "focus-visible:ring-2 focus-visible:ring-primary/20",
            optimisticIsCompleted &&
              "bg-primary border-primary text-primary-foreground"
          )}
        />
      </div>
    </div>
  );
}
