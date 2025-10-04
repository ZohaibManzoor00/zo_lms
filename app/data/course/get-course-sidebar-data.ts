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
      // NEW: Try junction tables first
      courseChapters: {
        orderBy: { position: "asc" },
        select: {
          position: true,
          chapter: {
            select: {
              id: true,
              title: true,
              position: true,
              chapterLessons: {
                orderBy: { position: "asc" },
                select: {
                  position: true,
                  lesson: {
                    select: {
                      id: true,
                      title: true,
                      position: true,
                      description: true,
                      lessonProgress: {
                        where: { userId: user.id },
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
          },
        },
      },
      // FALLBACK: Keep old relationships for backward compatibility
      chapter: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          lesson: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              position: true,
              description: true,
              lessonProgress: {
                where: { userId: user.id },
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

  // Smart hybrid approach: use junction tables if they have data, otherwise use old relationships
  const hasJunctionData =
    course.courseChapters && course.courseChapters.length > 0;

  if (hasJunctionData) {
    // Use new junction table data
    const transformedCourse = {
      ...course,
      chapter: course.courseChapters.map((cc) => ({
        id: cc.chapter.id,
        title: cc.chapter.title,
        position: cc.position, // Use junction table position
        lesson: cc.chapter.chapterLessons.map((cl) => ({
          id: cl.lesson.id,
          title: cl.lesson.title,
          position: cl.position, // Use junction table position
          description: cl.lesson.description,
          lessonProgress: cl.lesson.lessonProgress,
        })),
      })),
    };

    // Clean up junction table data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (transformedCourse as any).courseChapters;
    return { course: transformedCourse };
  } else {
    // Use old direct relationships as fallback
    return { course };
  }
};

export type CourseSidebarDataType = Awaited<
  ReturnType<typeof getCourseSidebarData>
>;
