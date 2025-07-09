import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export const adminGetRecentCourses = async () => {
  await requireAdmin();

  const allCourses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
    },
    take: 2,
  });

  return allCourses;
};
