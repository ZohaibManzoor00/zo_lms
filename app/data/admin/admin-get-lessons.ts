import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { notFound } from "next/navigation";

export const adminGetLessons = async () => {
  await requireAdmin();

  const lessons = await prisma.lesson.findMany({
    where: {
      chapter: {
        course: {
          status: "Published",
        },
      },
    },
    select: {
      id: true,
      title: true,
      videoKey: true,
      thumbnailKey: true,
      description: true,
      position: true,
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

  if (!lessons) return notFound();

  return lessons;
};

export type AdminLessonType = Awaited<ReturnType<typeof adminGetLessons>>;
