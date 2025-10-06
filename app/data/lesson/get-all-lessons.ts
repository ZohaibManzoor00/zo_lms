import "server-only";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getAllLessons = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

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
      completed: true,
      category: true,
      difficulty: true,
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
      lessonProgress: session?.user?.id
        ? {
            where: {
              userId: session.user.id,
            },
            select: {
              completed: true,
            },
            take: 1,
          }
        : false,
    },
  });

  return data;
};

export type LessonType = Awaited<ReturnType<typeof getAllLessons>>[number];
