import "server-only";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireUser } from "../user/require-user";

export const getCourseSidebarData = async (slug: string) => {
  const user = await requireUser();

  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      fileKey: true,
      duration: true,
      level: true,
      category: true,
      slug: true,
      chapter: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          position: true,
          lesson: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              position: true,
              description: true,
              lessonProgress: {
                where: {
                  userId: user.id,
                },
                select: {
                  completed: true,
                  lessonId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) return notFound();

  const enrollmentStatus = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollmentStatus || enrollmentStatus.status !== "Active")
    return notFound();

  return { course };
};

export type CourseSidebarDataType = Awaited<
  ReturnType<typeof getCourseSidebarData>
>;
