import "server-only";

import { prisma } from "@/lib/db";

export const getAllLessons = async () => {
  const data = await prisma.lesson.findMany({
    where: {
      OR: [
        {
          chapterId: null,
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
      description: true,
      thumbnailKey: true,
      videoKey: true,
      position: true,
      walkthroughs: {
        select: {
          id: true,
        },
        orderBy: {
          position: "asc",
        },
        where: {
          walkthrough: {
            audioKey: {
              not: "",
            },
          },
        },
        take: 1,
      },
      chapter: {
        select: {
          course: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  return data;
};

export type LessonType = Awaited<ReturnType<typeof getAllLessons>>[number];
