import "server-only";

import { prisma } from "@/lib/db"

export const getAllLessons = async () => {
    const data = await prisma.lesson.findMany({
        where: {
            chapter: {
                course: {
                    status: "Published",
                },
            },
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
}

export type LessonType = Awaited<ReturnType<typeof getAllLessons>>[number];