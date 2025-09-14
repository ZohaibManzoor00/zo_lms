import "server-only";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getRecentCourses = unstable_cache(
  async (limit: number = 3) => {
    const data = await prisma.course.findMany({
      where: {
        status: "Published",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        title: true,
        price: true,
        smallDescription: true,
        slug: true,
        fileKey: true,
        id: true,
        level: true,
        duration: true,
        category: true,
        createdAt: true,
      },
      take: limit,
    });

    return data;
  },
  ["recent-courses"],
  {
    revalidate: 3600,
    tags: ["courses", "homepage"],
  }
);

export const getRecentLessons = unstable_cache(
  async (limit: number = 3) => {
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
        createdAt: true,
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
      take: limit,
    });

    return data;
  },
  ["recent-lessons"],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ["lessons", "homepage"],
  }
);

export const getRecentCodeSnippets = unstable_cache(
  async (limit: number = 3) => {
    const data = await prisma.codeSnippet.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        language: true,
        tags: true,
        clickCount: true,
        isFeatured: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
    });

    return data;
  },
  ["recent-code-snippets"],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ["code-snippets", "homepage"],
  }
);

// Combined data fetcher for better performance
export const getHomepageData = unstable_cache(
  async () => {
    const [courses, lessons, codeSnippets] = await Promise.all([
      getRecentCourses(3),
      getRecentLessons(3),
      getRecentCodeSnippets(3),
    ]);

    return {
      courses,
      lessons,
      codeSnippets,
    };
  },
  ["homepage-data"],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ["homepage", "courses", "lessons", "code-snippets"],
  }
);

export type RecentCourseType = Awaited<
  ReturnType<typeof getRecentCourses>
>[number];
export type RecentLessonType = Awaited<
  ReturnType<typeof getRecentLessons>
>[number];
export type RecentCodeSnippetType = Awaited<
  ReturnType<typeof getRecentCodeSnippets>
>[number];
export type HomepageDataType = Awaited<ReturnType<typeof getHomepageData>>;
