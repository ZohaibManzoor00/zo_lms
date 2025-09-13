import "server-only";

import { prisma } from "@/lib/db";

export const getHomepageStats = async () => {
  const [totalCourses, totalLessons] = await Promise.all([
    prisma.course.count({
      where: {
        status: "Published",
      },
    }),
    prisma.lesson.count({
      where: {
        chapter: {
          course: {
            status: "Published",
          },
        },
      },
    }),
  ]);

  return {
    totalCourses,
    totalLessons,
  };
};

export type HomepageStatsType = Awaited<ReturnType<typeof getHomepageStats>>;
