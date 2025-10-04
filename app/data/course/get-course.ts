import "server-only";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const getCourse = async (slug: string) => {
  const course = await prisma.course.findUnique({
    where: {
      slug,
      status: "Published",
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      smallDescription: true,
      category: true,
      // NEW: Try junction tables first
      courseChapters: {
        select: {
          position: true,
          chapter: {
            select: {
              id: true,
              title: true,
              chapterLessons: {
                select: {
                  position: true,
                  lesson: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
                orderBy: { position: "asc" },
              },
            },
          },
        },
        orderBy: { position: "asc" },
      },
      // FALLBACK: Keep old relationships for backward compatibility
      chapter: {
        select: {
          id: true,
          title: true,
          lesson: {
            select: {
              id: true,
              title: true,
            },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) return notFound();

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
        lesson: cc.chapter.chapterLessons.map((cl) => ({
          id: cl.lesson.id,
          title: cl.lesson.title,
        })),
      })),
    };

    // Clean up junction table data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (transformedCourse as any).courseChapters;
    return transformedCourse;
  } else {
    // Use old direct relationships as fallback
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      fileKey: course.fileKey,
      price: course.price,
      duration: course.duration,
      level: course.level,
      smallDescription: course.smallDescription,
      category: course.category,
      chapter: course.chapter,
    };
  }
};

export type CourseType = Awaited<ReturnType<typeof getCourse>>;
