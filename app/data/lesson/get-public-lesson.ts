import "server-only";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const getPublicLesson = async (lessonId: string) => {
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
      createdAt: true,
      updatedAt: true,
      categories: true,
      difficulty: true,
      leetCodeSlug: true,
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
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { position: "asc" },
        where: {
          walkthrough: {
            audioKey: {
              not: "",
            },
          },
        },
      },
      // NEW: Use junction tables to find related chapters and courses
      chapterLessons: {
        select: {
          chapter: {
            select: {
              id: true,
              title: true,
              courseChapters: {
                select: {
                  course: {
                    select: {
                      id: true,
                      slug: true,
                      title: true,
                      category: true,
                      level: true,
                    },
                  },
                },
                // Get the first course this chapter belongs to
                take: 1,
              },
            },
          },
        },
        // Get the first chapter this lesson belongs to
        take: 1,
      },
      // FALLBACK: Keep old relationships for backward compatibility
      chapter: {
        select: {
          id: true,
          title: true,
          course: {
            select: {
              id: true,
              slug: true,
              title: true,
              category: true,
              level: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) return notFound();

  // Smart hybrid approach: use junction tables if they have data, otherwise use old relationships
  const hasJunctionData =
    lesson.chapterLessons && lesson.chapterLessons.length > 0;

  if (hasJunctionData) {
    // Use new junction table data
    const chapterLesson = lesson.chapterLessons[0];
    const courseChapter = chapterLesson?.chapter.courseChapters[0];

    const transformedLesson = {
      ...lesson,
      chapter: chapterLesson
        ? {
            id: chapterLesson.chapter.id,
            title: chapterLesson.chapter.title,
            course: courseChapter ? courseChapter.course : null,
          }
        : null,
    };

    // Remove junction table data since we've transformed it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (transformedLesson as any).chapterLessons;
    return transformedLesson;
  } else {
    // Use old direct relationships as fallback
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      thumbnailKey: lesson.thumbnailKey,
      videoKey: lesson.videoKey,
      position: lesson.position,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      categories: lesson.categories,
      difficulty: lesson.difficulty,
      leetCodeSlug: lesson.leetCodeSlug,
      walkthroughs: lesson.walkthroughs,
      chapter: lesson.chapter,
    };
  }
};

export type PublicLessonType = Awaited<ReturnType<typeof getPublicLesson>>;
