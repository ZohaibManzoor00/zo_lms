import "server-only";

import { requireUser } from "../user/require-user";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const getStandaloneLessonContent = async (lessonId: string) => {
  const user = await requireUser();

  const lesson = await prisma.lesson.findUnique({
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
      walkthroughs: {
        select: {
          id: true,
          position: true,
          walkthrough: {
            select: {
              id: true,
              name: true,
              description: true,
              audioKey: true,
              // language: true,
              createdAt: true,
              updatedAt: true,
              steps: {
                select: {
                  code: true,
                  timestamp: true,
                  stepIndex: true,
                },
                orderBy: { stepIndex: "asc" },
              },
            },
          },
        },
        orderBy: { position: "asc" },
      },
      chapter: {
        select: {
          courseId: true,
          course: {
            select: {
              slug: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) return notFound();

  // For standalone lessons, we don't require enrollment
  // This allows users to view individual lessons without enrolling in the full course
  return lesson;
};

export type StandaloneLessonContentType = Awaited<
  ReturnType<typeof getStandaloneLessonContent>
>;
