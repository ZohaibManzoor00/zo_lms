import "server-only";

import { requireAdmin } from "./require-admin";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const adminGetCourse = async (id: string) => {
  await requireAdmin();

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileKey: true,
      smallDescription: true,
      slug: true,
      price: true,
      duration: true,
      level: true,
      status: true,
      category: true,
      chapter: {
        select: {
          id: true,
          title: true,
          position: true,
          lesson: { 
            select: {
                id: true,
                title: true,
                description: true,
                thumbnailKey: true,
                position: true,
                videoKey: true,
            }
          }
        },
      },
    },
  });

  if (!course) return notFound()

  return course;
};

export type AdminCourseSingularType = Awaited<ReturnType<typeof adminGetCourse>>
