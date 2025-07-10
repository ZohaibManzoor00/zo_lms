import "server-only";

import { requireUser } from "../user/require-user";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const getLessonContent = async (lessonId: string) => {
  const user = await requireUser();

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailKey: true,
      videoKey: true,
      position: true,
      lessonProgress: {
        where: {
          userId: user.id,
        },
        select: {
          completed: true,
          lessonId: true,
        },
      },
      chapter: {
        select: {
          courseId: true,
          course: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) return notFound();

  const enrollmentStatus = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: lesson.chapter.courseId,
      },
    },
    select: {
      status: true,
    },
  });

  if (!enrollmentStatus || enrollmentStatus.status !== "Active")
    return notFound();

  return lesson;
};

export type LessonContentType = Awaited<ReturnType<typeof getLessonContent>>;
