import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { notFound } from "next/navigation";

export const adminGetLesson = async (lessonId: string) => {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      videoKey: true,
      thumbnailKey: true,
      description: true,
      position: true,
      categories: true,
      difficulty: true,
      leetCodeSlug: true,
      chapter: {
        select: {
          course: {
            select: {
              slug: true,
            },
          },
        },
      },
      walkthroughs: {
        select: {
          walkthroughId: true,
          position: true,
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!lesson) return notFound();

  return lesson;
};

export type AdminLessonType = Awaited<ReturnType<typeof adminGetLesson>>;
