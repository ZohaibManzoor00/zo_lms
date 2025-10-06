"use client";

import { BookIcon } from "lucide-react";
import { InteractiveLessonItem } from "./interactive-lesson-item";
import { LessonType } from "@/app/data/lesson/get-all-lessons";

interface LessonsListProps {
  lessons: LessonType[];
  currentLessonId?: string;
  onCompletionChange?: (lessonId: string, completed: boolean) => void;
}

export function LessonsList({
  lessons,
  currentLessonId,
  onCompletionChange,
}: LessonsListProps) {
  if (lessons.length === 0) {
    return (
      <div className="text-center py-8 transition-all duration-200">
        <BookIcon className="size-12 text-muted-foreground mx-auto mb-3 transition-all duration-200" />
        <p className="text-muted-foreground transition-all duration-200">
          No lessons found
        </p>
      </div>
    );
  }

  return (
    <>
      {lessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="opacity-100 transition-all duration-200 relative px-1"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <InteractiveLessonItem
            lesson={lesson}
            isActive={lesson.id === currentLessonId}
            onCompletionChange={onCompletionChange}
          />
        </div>
      ))}
    </>
  );
}
