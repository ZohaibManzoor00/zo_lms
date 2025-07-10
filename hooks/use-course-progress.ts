"use client";

import { useMemo } from "react";

export type CourseProgressData = {
  chapter: {
    lesson: {
      id: string;
      lessonProgress: {
        lessonId: string;
        completed: boolean;
      }[];
    }[];
  }[];
};

interface Props {
  courseData: CourseProgressData;
}

interface CourseProgressResult {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

export const useCourseProgress = ({
  courseData,
}: Props): CourseProgressResult => {
  return useMemo(() => {
    let totalLessons = 0;
    let completedLessons = 0;

    courseData.chapter.forEach((chapter) => {
      chapter.lesson.forEach((lesson) => {
        totalLessons += 1;
        const isCompleted = lesson.lessonProgress.some(
          (progress) => progress.lessonId === lesson.id && progress.completed
        );
        if (isCompleted) completedLessons += 1;
      });
    });

    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      totalLessons,
      completedLessons,
      progressPercentage,
    };
  }, [courseData]);
};
