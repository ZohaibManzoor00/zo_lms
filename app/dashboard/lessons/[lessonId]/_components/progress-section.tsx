"use client";

import { Progress } from "@/components/ui/progress";
import { LessonType } from "@/app/data/lesson/get-all-lessons";

interface ProgressSectionProps {
  lessons: LessonType[];
  filteredLessonsCount: number;
}

export function ProgressSection({
  lessons,
  filteredLessonsCount,
}: ProgressSectionProps) {
  // Calculate progress stats from lessons data
  const completed = lessons.filter(
    (lesson) => lesson.completed || lesson.lessonProgress?.[0]?.completed
  ).length;
  const total = lessons.length;
//   const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-3 opacity-100 transition-opacity duration-300 delay-150">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Your Progress
          </h2>
          <span className="text-sm font-medium text-foreground">
            {completed}/{total}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />

        <p className="text-xs text-muted-foreground transition-all duration-200">
          {filteredLessonsCount} lesson
          {filteredLessonsCount !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>
  );
}
