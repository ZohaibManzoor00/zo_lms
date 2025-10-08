import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export const adminGetLessons = async () => {
  await requireAdmin();

  const lessons = await prisma.lesson.findMany({
    where: {
      OR: [
        {
          chapterId: null, // Standalone lessons
        },
        {
          chapter: {
            course: {
              status: "Published",
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
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

  return lessons;
};

export type AdminLessonType = Awaited<
  ReturnType<typeof adminGetLessons>
>[number];
